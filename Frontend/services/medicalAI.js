// services/medicalAI.js
//
// Shared logic for turning patient symptoms into an AI recommendation
// (specialty + likely condition) and finding matching hospitals.
// Used by both AIHelpScreen (patient/visitor chat) and
// AmbulanceStaffScreen (emergency dispatch flow) so the two stay in sync.

import API from './api';

const SPECIALTY_KEYWORDS = {
  Cardiology: ['chest pain', 'heart', 'palpitation', 'shortness of breath', 'cardiac'],
  Neurology: ['headache', 'migraine', 'stroke', 'seizure', 'dizzy'],
  Orthopedics: ['bone', 'fracture', 'joint', 'back pain'],
  Pulmonology: ['cough', 'breathing', 'asthma', 'lung'],
  Gastroenterology: ['stomach', 'nausea', 'vomiting'],
  Dermatology: ['rash', 'skin', 'itch', 'burn'],
  Ophthalmology: ['eye', 'vision', 'blur'],
  ENT: ['ear', 'nose', 'throat'],
  Psychiatry: ['anxiety', 'depression', 'panic'],
  Emergency: ['unconscious', 'bleeding', 'accident', 'not breathing'],
};

export const detectSpecialtyLocally = (text) => {
  const lower = text.toLowerCase();
  for (const [spec, keywords] of Object.entries(SPECIALTY_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) return spec;
  }
  return 'Emergency';
};

export const detectUrgencyLocally = (text) => {
  const lower = text.toLowerCase();
  const critical = ['not breathing', 'unconscious', 'stroke', 'heart attack', 'bleeding'];
  const urgent = ['chest pain', 'fracture', 'severe', 'high fever'];

  if (critical.some((w) => lower.includes(w))) return 'CRITICAL';
  if (urgent.some((w) => lower.includes(w))) return 'URGENT';
  return 'MODERATE';
};

// Calls the existing AI model (internals already implemented server-side)
// and falls back to local keyword matching if the request fails.
export const analyzeCase = async (userMessage, userLocation) => {
  try {
    const body = { symptoms: userMessage };
    if (userLocation) {
      body.lat = userLocation.latitude;
      body.lng = userLocation.longitude;
    }

    const res = await API.post('/ai/recommend', body);
    const data = res.data;

    return {
      specialty: data.speciality || detectSpecialtyLocally(userMessage),
      urgency: detectUrgencyLocally(userMessage),
      symptom: userMessage,
      disease: data.top_disease || null,
      assessment: `Based on your symptoms, the most likely condition is ${data.top_disease}.`,
      advice: 'Please seek medical attention promptly.',
      hospitals: data.recommended_hospitals || [],
      usedAI: true,
    };
  } catch (err) {
    return {
      specialty: detectSpecialtyLocally(userMessage),
      urgency: detectUrgencyLocally(userMessage),
      symptom: userMessage,
      disease: null,
      assessment: 'Based on your description, we identified the needed specialty.',
      advice: 'Please seek medical attention promptly.',
      hospitals: [],
      usedAI: false,
    };
  }
};

// Plain nearby-hospitals lookup (existing backend endpoint), used as a
// fallback when the AI call doesn't return hospitals directly, or when
// staff want to search without entering symptoms first.
export const fetchHospitals = async (specialty, userLocation, limit = 5) => {
  const params = { limit };
  if (specialty) params.specialty = specialty;
  if (userLocation) {
    params.lat = userLocation.latitude;
    params.lng = userLocation.longitude;
  }

  const queryString = new URLSearchParams(params).toString();
  const res = await API.get(`/hospitals/nearby?${queryString}`);
  return res.data.hospitals || [];
};