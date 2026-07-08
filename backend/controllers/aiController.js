/**
 * FastAid — AI Controller
 * File: backend/controllers/aiController.js
 *
 * Thin proxy between the Express backend and the Python AI microservice.
 * All heavy lifting (model inference, hospital scoring) happens in ai_service.py.
 */

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://192.168.2.114:5001";

// ── Helper: call AI microservice ──────────────────────────────────────────────
async function callAI(path, method = "GET", body = null) {
  const opts = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${AI_SERVICE_URL}${path}`, opts);
  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data.error || "AI service error");
    err.status = res.status;
    throw err;
  }
  return data;
}

// ── POST /api/ai/predict ──────────────────────────────────────────────────────
/**
 * Body:  { "symptoms": "fever, headache, nausea" }
 * Returns: top-5 predicted diseases + matched symptoms + inferred speciality
 */
export const predictDisease = async (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms || !symptoms.trim()) {
      return res.status(400).json({ message: "symptoms field is required" });
    }

    const result = await callAI("/predict", "POST", { symptoms });
    return res.json(result);
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ message: err.message });
  }
};

// ── POST /api/ai/recommend ────────────────────────────────────────────────────
/**
 * Body:  { "symptoms": "...", "lat": 33.89, "lng": 35.50 }
 * Returns: disease prediction + speciality + ranked hospital list
 */
export const recommendHospital = async (req, res) => {
  try {
    const { symptoms, lat, lng } = req.body;
    if (!symptoms || !symptoms.trim()) {
      return res.status(400).json({ message: "symptoms field is required" });
    }

    const payload = { symptoms };
    if (lat !== undefined && lng !== undefined) {
      payload.lat = parseFloat(lat);
      payload.lng = parseFloat(lng);
    }

    const result = await callAI("/recommend", "POST", payload);
    return res.json(result);
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ message: err.message });
  }
};

// ── GET /api/ai/symptoms ──────────────────────────────────────────────────────
/**
 * Returns the full list of symptom names the model understands.
 * Useful for the frontend autocomplete / symptom picker UI.
 */
export const listSymptoms = async (req, res) => {
  try {
    // Call the Python service health endpoint which includes symptom count;
    // The symptom list is served by a dedicated endpoint we add here.
    const result = await callAI("/symptoms", "GET");
    return res.json(result);
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ message: err.message });
  }
};
