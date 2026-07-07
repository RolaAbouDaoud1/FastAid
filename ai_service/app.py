"""
FastAid AI Microservice
=======================
A lightweight Flask server that:
  1. Loads the trained LightGBM disease_model.joblib
  2. Accepts symptoms (free text or array) and returns predicted disease + confidence
  3. Maps the disease → medical speciality (pure Python dict, no external API)
  4. Calls the FastAid Node backend to query the best matching hospital
     (nearest + available beds + best rating for the needed speciality)

Endpoints
---------
POST /predict          – disease prediction only
POST /recommend        – disease + speciality + best hospital routing

Run
---
  pip install flask flask-cors joblib lightgbm scikit-learn requests
  python app.py
"""

from __future__ import annotations
import os, re, math, logging
import numpy as np
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("fastaid-ai")

app = Flask(__name__)
CORS(app)

# ── Config ────────────────────────────────────────────────────────────────────
MODEL_PATH      = os.getenv("MODEL_PATH", "model.joblib")
# ── Config ────────────────────────────────────────────────────────────────────
MODEL_PATH   = os.getenv("MODEL_PATH", "model.joblib")

NODE_BACKEND = os.getenv(
    "NODE_BACKEND",
    "http://192.168.10.179:5000"
)

PORT = int(os.getenv("AI_PORT", 5001))

# ── Load model once at startup ────────────────────────────────────────────────
log.info("Loading model from %s …", MODEL_PATH)
_bundle       = joblib.load(MODEL_PATH)
BOOSTER       = _bundle["booster"]
LABEL_ENCODER = _bundle["label_encoder"]
SYMPTOM_COLS  = _bundle["symptom_cols"]
log.info("Model loaded – %d diseases, %d symptom features", len(LABEL_ENCODER.classes_), len(SYMPTOM_COLS))


# ═════════════════════════════════════════════════════════════════════════════
# DISEASE → SPECIALITY MAPPING
# Built from the 677 diseases in the model. Pure Python – no external service.
# Each entry: "Disease Name (Title Case)": "Speciality"
# The speciality strings must match what you store in Hospital.departments[]
# ═════════════════════════════════════════════════════════════════════════════
DISEASE_SPECIALITY: dict[str, str] = {
    # ── Cardiology ────────────────────────────────────────────────────────────
    "Abdominal Aortic Aneurysm": "Cardiology",
    "Angina": "Cardiology",
    "Aortic Valve Disease": "Cardiology",
    "Arrhythmia": "Cardiology",
    "Atrial Fibrillation": "Cardiology",
    "Atrial Flutter": "Cardiology",
    "Cardiac Arrest": "Emergency",
    "Cardiomyopathy": "Cardiology",
    "Congestive Heart Failure": "Cardiology",
    "Coronary Artery Disease": "Cardiology",
    "Deep Vein Thrombosis": "Cardiology",
    "Heart Attack": "Emergency",
    "Heart Block": "Cardiology",
    "Heart Failure": "Cardiology",
    "Heart Valve Disease": "Cardiology",
    "Hypertension": "Cardiology",
    "Hypertensive Heart Disease": "Cardiology",
    "Hypertensive Urgency": "Emergency",
    "Mitral Valve Disease": "Cardiology",
    "Myocarditis": "Cardiology",
    "Pericarditis": "Cardiology",
    "Peripheral Arterial Disease": "Cardiology",
    "Pulmonary Embolism": "Emergency",
    "Raynaud Phenomenon": "Cardiology",
    "Rheumatic Heart Disease": "Cardiology",
    "Stroke": "Neurology",
    "Transient Ischemic Attack": "Neurology",
    "Venous Insufficiency": "Cardiology",
    "Ventricular Fibrillation": "Emergency",
    "Ventricular Tachycardia": "Cardiology",

    # ── Pulmonology ───────────────────────────────────────────────────────────
    "Abscess Of The Lung": "Pulmonology",
    "Acute Bronchiolitis": "Pulmonology",
    "Acute Bronchitis": "Pulmonology",
    "Acute Bronchospasm": "Pulmonology",
    "Acute Respiratory Distress Syndrome (Ards)": "ICU",
    "Aspergillosis": "Pulmonology",
    "Asthma": "Pulmonology",
    "Atelectasis": "Pulmonology",
    "Bronchiectasis": "Pulmonology",
    "Chronic Obstructive Pulmonary Disease": "Pulmonology",
    "Cough Variant Asthma": "Pulmonology",
    "Cystic Fibrosis": "Pulmonology",
    "Empyema": "Pulmonology",
    "Idiopathic Pulmonary Fibrosis": "Pulmonology",
    "Lung Cancer": "Oncology",
    "Mesothelioma": "Oncology",
    "Obstructive Sleep Apnea": "Pulmonology",
    "Pleural Effusion": "Pulmonology",
    "Pneumonia": "Pulmonology",
    "Pneumothorax": "Emergency",
    "Pulmonary Edema": "Cardiology",
    "Pulmonary Hypertension": "Pulmonology",
    "Respiratory Failure": "ICU",
    "Sarcoidosis": "Pulmonology",
    "Tuberculosis": "Pulmonology",

    # ── Gastroenterology ──────────────────────────────────────────────────────
    "Abdominal Hernia": "General Surgery",
    "Achalasia": "Gastroenterology",
    "Alcoholic Liver Disease": "Gastroenterology",
    "Anal Fissure": "General Surgery",
    "Anal Fistula": "General Surgery",
    "Appendicitis": "General Surgery",
    "Ascending Cholangitis": "Gastroenterology",
    "Celiac Disease": "Gastroenterology",
    "Cholecystitis": "General Surgery",
    "Cholelithiasis": "General Surgery",
    "Cirrhosis Of Liver": "Gastroenterology",
    "Colon Cancer": "Oncology",
    "Colonic Polyp": "Gastroenterology",
    "Constipation": "Gastroenterology",
    "Crohn Disease": "Gastroenterology",
    "Diverticulitis": "Gastroenterology",
    "Esophageal Cancer": "Oncology",
    "Fatty Liver Disease": "Gastroenterology",
    "Fecal Incontinence": "Gastroenterology",
    "Gastritis": "Gastroenterology",
    "Gastroenteritis": "General",
    "Gastroesophageal Reflux Disease (Gerd)": "Gastroenterology",
    "Gastrointestinal Bleeding": "Emergency",
    "Hemorrhoid": "General Surgery",
    "Hepatitis": "Gastroenterology",
    "Hepatitis A": "Gastroenterology",
    "Hepatitis B": "Gastroenterology",
    "Hepatitis C": "Gastroenterology",
    "Hepatocellular Carcinoma": "Oncology",
    "Hirschsprung Disease": "Pediatrics",
    "Ileus": "General Surgery",
    "Inflammatory Bowel Disease": "Gastroenterology",
    "Intestinal Obstruction": "General Surgery",
    "Irritable Bowel Syndrome": "Gastroenterology",
    "Liver Abscess": "Gastroenterology",
    "Liver Cancer": "Oncology",
    "Pancreatitis": "Gastroenterology",
    "Acute Pancreatitis": "Gastroenterology",
    "Peptic Ulcer": "Gastroenterology",
    "Peritonitis": "General Surgery",
    "Primary Biliary Cirrhosis": "Gastroenterology",
    "Rectal Cancer": "Oncology",
    "Ulcerative Colitis": "Gastroenterology",

    # ── Neurology ─────────────────────────────────────────────────────────────
    "Alzheimer Disease": "Neurology",
    "Amyotrophic Lateral Sclerosis (Als)": "Neurology",
    "Autism": "Psychiatry",
    "Autonomic Nervous System Disorder": "Neurology",
    "Bell Palsy": "Neurology",
    "Benign Paroxysmal Positional Vertical (Bppv)": "Neurology",
    "Brain Tumor": "Neurosurgery",
    "Carpal Tunnel Syndrome": "Neurology",
    "Cerebral Palsy": "Neurology",
    "Chronic Daily Headache": "Neurology",
    "Cluster Headache": "Neurology",
    "Dementia": "Neurology",
    "Epilepsy": "Neurology",
    "Essential Tremor": "Neurology",
    "Febrile Seizure": "Pediatrics",
    "Guillain-Barre Syndrome": "Neurology",
    "Headache": "Neurology",
    "Hydrocephalus": "Neurosurgery",
    "Meningitis": "Emergency",
    "Migraine": "Neurology",
    "Multiple Sclerosis": "Neurology",
    "Myasthenia Gravis": "Neurology",
    "Narcolepsy": "Neurology",
    "Neuropathy": "Neurology",
    "Parkinson Disease": "Neurology",
    "Peripheral Neuropathy": "Neurology",
    "Restless Leg Syndrome": "Neurology",
    "Sciatica": "Neurology",
    "Seizure Disorder": "Neurology",
    "Spinal Stenosis": "Orthopedics",
    "Subarachnoid Hemorrhage": "Neurosurgery",
    "Subdural Hematoma": "Neurosurgery",

    # ── Psychiatry ────────────────────────────────────────────────────────────
    "Acute Stress Reaction": "Psychiatry",
    "Adjustment Reaction": "Psychiatry",
    "Alcohol Abuse": "Psychiatry",
    "Alcohol Intoxication": "Emergency",
    "Alcohol Withdrawal": "Psychiatry",
    "Anxiety": "Psychiatry",
    "Asperger Syndrome": "Psychiatry",
    "Attention Deficit Hyperactivity Disorder (Adhd)": "Psychiatry",
    "Bipolar Disorder": "Psychiatry",
    "Borderline Personality Disorder": "Psychiatry",
    "Depression": "Psychiatry",
    "Generalized Anxiety Disorder": "Psychiatry",
    "Insomnia": "Psychiatry",
    "Major Depressive Disorder": "Psychiatry",
    "Obsessive Compulsive Disorder (Ocd)": "Psychiatry",
    "Panic Disorder": "Psychiatry",
    "Post Traumatic Stress Disorder (Ptsd)": "Psychiatry",
    "Schizophrenia": "Psychiatry",
    "Social Anxiety Disorder": "Psychiatry",
    "Substance Abuse": "Psychiatry",

    # ── Orthopedics ───────────────────────────────────────────────────────────
    "Adhesive Capsulitis Of The Shoulder": "Orthopedics",
    "Ankylosing Spondylitis": "Orthopedics",
    "Arthritis Of The Hip": "Orthopedics",
    "Avascular Necrosis": "Orthopedics",
    "Bone Cancer": "Oncology",
    "Bone Disorder": "Orthopedics",
    "Bursitis": "Orthopedics",
    "Carpal Tunnel Syndrome": "Orthopedics",
    "Disc Herniation": "Orthopedics",
    "Fracture": "Orthopedics",
    "Gout": "Rheumatology",
    "Low Back Pain": "Orthopedics",
    "Lumbar Disc Disease": "Orthopedics",
    "Neck Injury": "Orthopedics",
    "Osteoarthritis": "Orthopedics",
    "Osteoporosis": "Orthopedics",
    "Plantar Fasciitis": "Orthopedics",
    "Rheumatoid Arthritis": "Rheumatology",
    "Rotator Cuff Tear": "Orthopedics",
    "Scoliosis": "Orthopedics",
    "Septic Arthritis": "Orthopedics",
    "Sprain": "Orthopedics",
    "Tendinopathy": "Orthopedics",

    # ── Nephrology / Urology ──────────────────────────────────────────────────
    "Acute Kidney Injury": "Nephrology",
    "Anemia Due To Chronic Kidney Disease": "Nephrology",
    "Atonic Bladder": "Urology",
    "Benign Prostatic Hyperplasia (Bph)": "Urology",
    "Benign Kidney Cyst": "Nephrology",
    "Bladder Cancer": "Urology",
    "Bladder Disorder": "Urology",
    "Bladder Obstruction": "Urology",
    "Chronic Kidney Disease": "Nephrology",
    "Cystitis": "Urology",
    "End Stage Renal Disease": "Nephrology",
    "Glomerulonephritis": "Nephrology",
    "Hydronephrosis": "Urology",
    "Kidney Stone": "Urology",
    "Nephrolithiasis": "Urology",
    "Nephrotic Syndrome": "Nephrology",
    "Overactive Bladder": "Urology",
    "Polycystic Kidney Disease": "Nephrology",
    "Prostate Cancer": "Urology",
    "Prostatitis": "Urology",
    "Renal Failure": "Nephrology",
    "Testicular Torsion": "Emergency",
    "Urinary Incontinence": "Urology",
    "Urinary Tract Infection": "Urology",
    "Urolithiasis": "Urology",

    # ── Endocrinology ─────────────────────────────────────────────────────────
    "Acanthosis Nigricans": "Endocrinology",
    "Adrenal Adenoma": "Endocrinology",
    "Cushing Syndrome": "Endocrinology",
    "Diabetes Insipidus": "Endocrinology",
    "Diabetes Mellitus": "Endocrinology",
    "Diabetic Ketoacidosis": "Emergency",
    "Diabetic Nephropathy": "Nephrology",
    "Diabetic Neuropathy": "Neurology",
    "Diabetic Retinopathy": "Ophthalmology",
    "Goiter": "Endocrinology",
    "Graves Disease": "Endocrinology",
    "Hashimoto Thyroiditis": "Endocrinology",
    "Hyperthyroidism": "Endocrinology",
    "Hypoglycemia": "Emergency",
    "Hypothyroidism": "Endocrinology",
    "Obesity": "Endocrinology",
    "Pituitary Tumor": "Neurosurgery",
    "Polycystic Ovary Syndrome": "Gynecology",
    "Primary Hyperaldosteronism": "Endocrinology",
    "Thyroid Cancer": "Oncology",
    "Thyroid Nodule": "Endocrinology",

    # ── Dermatology ───────────────────────────────────────────────────────────
    "Acne": "Dermatology",
    "Actinic Keratosis": "Dermatology",
    "Alopecia": "Dermatology",
    "Athlete'S Foot": "Dermatology",
    "Atrophic Skin Condition": "Dermatology",
    "Balanitis": "Urology",
    "Cellulitis": "Dermatology",
    "Contact Dermatitis": "Dermatology",
    "Dandruff": "Dermatology",
    "Dermatitis": "Dermatology",
    "Eczema": "Dermatology",
    "Erythema Multiforme": "Dermatology",
    "Folliculitis": "Dermatology",
    "Herpes Simplex": "Dermatology",
    "Herpes Zoster": "Dermatology",
    "Hives": "Dermatology",
    "Impetigo": "Dermatology",
    "Keloid": "Dermatology",
    "Melanoma": "Oncology",
    "Molluscum Contagiosum": "Dermatology",
    "Onychomycosis": "Dermatology",
    "Pemphigus": "Dermatology",
    "Psoriasis": "Dermatology",
    "Rosacea": "Dermatology",
    "Seborrheic Dermatitis": "Dermatology",
    "Shingles": "Dermatology",
    "Skin Cancer": "Oncology",
    "Tinea": "Dermatology",
    "Urticaria": "Dermatology",
    "Vitiligo": "Dermatology",
    "Warts": "Dermatology",

    # ── Ophthalmology ─────────────────────────────────────────────────────────
    "Acute Glaucoma": "Ophthalmology",
    "Amblyopia": "Ophthalmology",
    "Astigmatism": "Ophthalmology",
    "Blepharitis": "Ophthalmology",
    "Cataract": "Ophthalmology",
    "Conjunctivitis": "Ophthalmology",
    "Corneal Ulcer": "Ophthalmology",
    "Dry Eye Syndrome": "Ophthalmology",
    "Glaucoma": "Ophthalmology",
    "Macular Degeneration": "Ophthalmology",
    "Optic Neuritis": "Ophthalmology",
    "Orbital Cellulitis": "Ophthalmology",
    "Retinal Detachment": "Ophthalmology",
    "Stye": "Ophthalmology",

    # ── ENT ───────────────────────────────────────────────────────────────────
    "Abscess Of Nose": "ENT",
    "Abscess Of The Pharynx": "ENT",
    "Acute Otitis Media": "ENT",
    "Acute Sinusitis": "ENT",
    "Allergic Rhinitis": "ENT",
    "Chronic Sinusitis": "ENT",
    "Ear Wax Blockage": "ENT",
    "Epistaxis": "ENT",
    "Hearing Loss": "ENT",
    "Laryngitis": "ENT",
    "Meniere Disease": "ENT",
    "Nasal Polyp": "ENT",
    "Otitis Externa": "ENT",
    "Pharyngitis": "ENT",
    "Rhinitis": "ENT",
    "Sinusitis": "ENT",
    "Tinnitus": "ENT",
    "Tonsillitis": "ENT",
    "Vertigo": "ENT",
    "Vocal Cord Disorders": "ENT",

    # ── Gynecology / Obstetrics ───────────────────────────────────────────────
    "Atrophic Vaginitis": "Gynecology",
    "Benign Vaginal Discharge (Leukorrhea)": "Gynecology",
    "Cervical Cancer": "Oncology",
    "Endometriosis": "Gynecology",
    "Fibrocystic Breast Disease": "Gynecology",
    "Fibroids": "Gynecology",
    "Menopausal Syndrome": "Gynecology",
    "Ovarian Cancer": "Oncology",
    "Ovarian Cyst": "Gynecology",
    "Pelvic Inflammatory Disease": "Gynecology",
    "Polycystic Ovary Syndrome": "Gynecology",
    "Premature Menopause": "Gynecology",
    "Uterine Cancer": "Oncology",
    "Vaginitis": "Gynecology",
    "Vulvovaginitis": "Gynecology",

    # ── Pediatrics ────────────────────────────────────────────────────────────
    "Birth Trauma": "Pediatrics",
    "Hirschsprung Disease": "Pediatrics",
    "Febrile Seizure": "Pediatrics",
    "Kawasaki Disease": "Pediatrics",
    "Neonatal Jaundice": "Pediatrics",
    "Pediatric Asthma": "Pediatrics",
    "Pyloric Stenosis": "Pediatrics",
    "Rickets": "Pediatrics",
    "Roseola": "Pediatrics",
    "Scarlet Fever": "Pediatrics",

    # ── Hematology / Oncology ─────────────────────────────────────────────────
    "Anemia": "Hematology",
    "Anemia Due To Malignancy": "Oncology",
    "Anemia Of Chronic Disease": "Hematology",
    "Aplastic Anemia": "Hematology",
    "Iron Deficiency Anemia": "Hematology",
    "Leukemia": "Oncology",
    "Lymphoma": "Oncology",
    "Multiple Myeloma": "Oncology",
    "Myelodysplastic Syndrome": "Hematology",
    "Polycythemia Vera": "Hematology",
    "Sickle Cell Anemia": "Hematology",
    "Thalassemia": "Hematology",
    "Thrombocytopenia": "Hematology",
    "Von Willebrand Disease": "Hematology",

    # ── Rheumatology / Immunology ─────────────────────────────────────────────
    "Allergy": "Immunology",
    "Allergy To Animals": "Immunology",
    "Fibromyalgia": "Rheumatology",
    "Lupus": "Rheumatology",
    "Polymyalgia Rheumatica": "Rheumatology",
    "Sjogren Syndrome": "Rheumatology",
    "Systemic Lupus Erythematosus": "Rheumatology",
    "Vasculitis": "Rheumatology",

    # ── Infectious Disease ────────────────────────────────────────────────────
    "Acariasis": "General",
    "Cellulitis": "General",
    "Chickenpox": "General",
    "Covid-19": "Pulmonology",
    "Dengue Fever": "Infectious Disease",
    "Food Poisoning": "Emergency",
    "Influenza": "General",
    "Lyme Disease": "Infectious Disease",
    "Malaria": "Infectious Disease",
    "Measles": "General",
    "Meningitis": "Emergency",
    "Mumps": "General",
    "Rocky Mountain Spotted Fever": "Infectious Disease",
    "Rubella": "General",
    "Sepsis": "ICU",
    "Sexually Transmitted Disease": "General",
    "Typhoid Fever": "Infectious Disease",
    "West Nile Fever": "Infectious Disease",

    # ── Emergency / General ───────────────────────────────────────────────────
    "Anaphylaxis": "Emergency",
    "Burns": "Emergency",
    "Dehydration": "Emergency",
    "Drug Overdose": "Emergency",
    "Drowning": "Emergency",
    "Electrolyte Imbalance": "Emergency",
    "Heat Stroke": "Emergency",
    "Hemorrhagic Shock": "Emergency",
    "Hypotension": "Emergency",
    "Shock": "Emergency",
    "Trauma": "Emergency",
}


def disease_to_speciality(disease: str) -> str:
    """
    Maps a disease name to a medical speciality.
    Falls back to keyword-based heuristics if not in the explicit map.
    """
    # 1. Exact match
    sp = DISEASE_SPECIALITY.get(disease)
    if sp:
        return sp

    d = disease.lower()

    # 2. Keyword heuristics (order matters – more specific first)
    rules = [
        ("cancer",          "Oncology"),
        ("tumor",           "Oncology"),
        ("carcinoma",       "Oncology"),
        ("lymphoma",        "Oncology"),
        ("leukemia",        "Oncology"),
        ("melanoma",        "Oncology"),
        ("heart",           "Cardiology"),
        ("cardiac",         "Cardiology"),
        ("coronary",        "Cardiology"),
        ("arrhythmia",      "Cardiology"),
        ("lung",            "Pulmonology"),
        ("bronch",          "Pulmonology"),
        ("respiratory",     "Pulmonology"),
        ("pneumo",          "Pulmonology"),
        ("asthma",          "Pulmonology"),
        ("liver",           "Gastroenterology"),
        ("hepat",           "Gastroenterology"),
        ("colon",           "Gastroenterology"),
        ("gastro",          "Gastroenterology"),
        ("bowel",           "Gastroenterology"),
        ("pancr",           "Gastroenterology"),
        ("kidney",          "Nephrology"),
        ("renal",           "Nephrology"),
        ("bladder",         "Urology"),
        ("prostate",        "Urology"),
        ("urin",            "Urology"),
        ("brain",           "Neurosurgery"),
        ("cerebr",          "Neurology"),
        ("neuro",           "Neurology"),
        ("seizure",         "Neurology"),
        ("migraine",        "Neurology"),
        ("headache",        "Neurology"),
        ("depress",         "Psychiatry"),
        ("anxiety",         "Psychiatry"),
        ("bipolar",         "Psychiatry"),
        ("schizo",          "Psychiatry"),
        ("disorder",        "Psychiatry"),
        ("skin",            "Dermatology"),
        ("dermat",          "Dermatology"),
        ("eczema",          "Dermatology"),
        ("eye",             "Ophthalmology"),
        ("ocular",          "Ophthalmology"),
        ("retinal",         "Ophthalmology"),
        ("glaucoma",        "Ophthalmology"),
        ("ear",             "ENT"),
        ("otitis",          "ENT"),
        ("sinus",           "ENT"),
        ("nasal",           "ENT"),
        ("throat",          "ENT"),
        ("thyroid",         "Endocrinology"),
        ("diabet",          "Endocrinology"),
        ("hormone",         "Endocrinology"),
        ("uterine",         "Gynecology"),
        ("ovarian",         "Gynecology"),
        ("vaginal",         "Gynecology"),
        ("menopaus",        "Gynecology"),
        ("joint",           "Orthopedics"),
        ("bone",            "Orthopedics"),
        ("arthritis",       "Orthopedics"),
        ("fracture",        "Orthopedics"),
        ("spine",           "Orthopedics"),
        ("anemia",          "Hematology"),
        ("blood",           "Hematology"),
        ("lupus",           "Rheumatology"),
        ("rheumat",         "Rheumatology"),
        ("allerg",          "Immunology"),
        ("infect",          "Infectious Disease"),
        ("fever",           "General"),
        ("sepsis",          "ICU"),
        ("shock",           "Emergency"),
        ("emergency",       "Emergency"),
    ]

    for keyword, speciality in rules:
        if keyword in d:
            return speciality

    return "General"


# ═════════════════════════════════════════════════════════════════════════════
# HAVERSINE DISTANCE  (no external library needed)
# ═════════════════════════════════════════════════════════════════════════════
def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# ═════════════════════════════════════════════════════════════════════════════
# SYMPTOM VECTORISER
# ═════════════════════════════════════════════════════════════════════════════
def vectorise(text: str) -> tuple[np.ndarray, list[str]]:
    """Convert free-text symptoms → feature vector + matched symptom list."""
    # Accept comma / semicolon / newline separated symptoms
    terms = [t.strip().lower() for t in re.split(r"[,;\n]+", text) if t.strip()]
    vec = np.zeros((1, len(SYMPTOM_COLS)), dtype=np.float32)
    matched: list[str] = []

    for term in terms:
        for i, col in enumerate(SYMPTOM_COLS):
            col_clean = col.lower().replace("_", " ")
            if term == col_clean or term in col_clean or col_clean in term:
                if vec[0, i] == 0:          # avoid counting twice
                    vec[0, i] = 1
                    matched.append(col.replace("_", " "))

    return vec, list(set(matched))


# ═════════════════════════════════════════════════════════════════════════════
# HOSPITAL SCORER
# Returns a score 0-100. Higher = better match.
# Weights: 45% availability, 30% distance, 25% rating
# ═════════════════════════════════════════════════════════════════════════════
def score_hospital(hospital: dict, speciality: str,
                   user_lat: float | None, user_lng: float | None) -> float:
    # --- Availability sub-score (0-100) --------------------------------------
    total = hospital.get("total_beds", 0) or 1
    avail = hospital.get("available_beds", 0)
    avail_pct = min(avail / total, 1.0)     # 0-1

    # Check ward-level availability for the needed speciality
    ward_bonus = 0.0
    for ward in hospital.get("wards", []):
        ward_name = ward.get("name", "").lower()
        if speciality.lower() in ward_name or ward_name in speciality.lower():
            ward_avail = ward.get("available_beds", 0)
            ward_total = ward.get("total_beds", 1) or 1
            ward_bonus = (ward_avail / ward_total) * 20   # up to +20 pts

    # Check if hospital has the needed department
    depts = [d.lower() for d in hospital.get("departments", [])]
    dept_match = any(speciality.lower() in d or d in speciality.lower() for d in depts)
    dept_bonus = 15.0 if dept_match else 0.0

    avail_score = (avail_pct * 65) + ward_bonus + dept_bonus   # 0-100

    # --- Distance sub-score (0-100, 100 = closest) ---------------------------
    if user_lat is not None and user_lng is not None:
        h_lat = hospital.get("location", {}).get("lat") or 0
        h_lng = hospital.get("location", {}).get("lng") or 0
        if h_lat and h_lng:
            dist_km = haversine_km(user_lat, user_lng, h_lat, h_lng)
            # Score: 100 at 0km, 0 at 100km, linear
            dist_score = max(0.0, 100 - dist_km)
        else:
            dist_score = 50.0   # unknown location → neutral
    else:
        dist_score = 50.0

    # --- Rating sub-score (0-100) --------------------------------------------
    rating = hospital.get("average_rating", 0) or 0
    rating_score = (rating / 5.0) * 100

    # --- Emergency availability -----------------------------------------------
    emergency_bonus = 5.0 if hospital.get("is_emergency_available", False) else 0.0

    # --- Weighted total -------------------------------------------------------
    total_score = (avail_score * 0.45) + (dist_score * 0.30) + (rating_score * 0.25) + emergency_bonus

    return round(total_score, 2)


# ═════════════════════════════════════════════════════════════════════════════
# HOSPITAL QUERY  (calls the FastAid Node backend)
# ═════════════════════════════════════════════════════════════════════════════
def fetch_and_rank_hospitals(speciality: str, user_lat: float | None, user_lng: float | None,
                              top_n: int = 5) -> list[dict]:
    import requests

    params: dict = {"limit": 50}
    if user_lat is not None and user_lng is not None:
        url = f"{NODE_BACKEND}/api/hospitals/nearby"
        params["lat"] = user_lat
        params["lng"] = user_lng
        params["radius"] = 100_000      # 100 km radius
    else:
        url = f"{NODE_BACKEND}/api/hospitals"

    try:
        resp = requests.get(url, params=params, timeout=5)
        resp.raise_for_status()
        data = resp.json()
        hospitals = data.get("hospitals", [])
    except Exception as exc:
        log.warning("Could not reach Node backend: %s", exc)
        return []

    if not hospitals:
        return []

    # Filter: only hospitals with available beds
    candidates = [h for h in hospitals if h.get("available_beds", 0) > 0]
    if not candidates:
        candidates = hospitals       # relax filter if none have beds

    # Score each hospital
    scored = []
    for h in candidates:
        s = score_hospital(h, speciality, user_lat, user_lng)
        lat = (h.get("location") or {}).get("lat")
        lng = (h.get("location") or {}).get("lng")
        dist_km = None
        if user_lat and user_lng and lat and lng:
            dist_km = round(haversine_km(user_lat, user_lng, lat, lng), 2)

        scored.append({
            "id":                    str(h.get("_id", "")),
            "name":                  h.get("name", ""),
            "address":               h.get("address", ""),
            "location_name":         h.get("location_name", ""),
            "lat":                   lat,
            "lng":                   lng,
            "distance_km":           dist_km,
            "available_beds":        h.get("available_beds", 0),
            "total_beds":            h.get("total_beds", 0),
            "is_emergency_available":h.get("is_emergency_available", False),
            "average_rating":        h.get("average_rating", 0),
            "departments":           h.get("departments", []),
            "score":                 s,
        })

    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:top_n]


# ═════════════════════════════════════════════════════════════════════════════
# ROUTES
# ═════════════════════════════════════════════════════════════════════════════

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "diseases": len(LABEL_ENCODER.classes_)})


@app.route("/predict", methods=["POST"])
def predict():
    """
    Body (JSON):
      { "symptoms": "fever, headache, nausea" }
    Response:
      {
        "predictions": [{"disease":"...", "confidence":82.3}, ...],
        "matched_symptoms": ["fever", "headache"],
        "top_disease": "Malaria",
        "speciality": "Infectious Disease"
      }
    """
    body = request.get_json(force=True, silent=True) or {}
    symptoms = body.get("symptoms", "").strip()

    if not symptoms:
        return jsonify({"error": "symptoms field is required"}), 400

    vec, matched = vectorise(symptoms)

    if not matched:
        return jsonify({
            "error": "No recognisable symptoms found. Please describe symptoms more specifically.",
            "hint": "Examples: fever, headache, nausea, shortness of breath, chest pain"
        }), 422

    proba  = BOOSTER.predict(vec)[0]
    top_i  = np.argsort(proba)[::-1][:5]
    preds  = [{"disease": LABEL_ENCODER.classes_[i],
               "confidence": round(float(proba[i]) * 100, 2)} for i in top_i]

    top_disease  = preds[0]["disease"]
    speciality   = disease_to_speciality(top_disease)

    return jsonify({
        "predictions":      preds,
        "matched_symptoms": matched,
        "top_disease":      top_disease,
        "speciality":       speciality,
    })


@app.route("/recommend", methods=["POST"])
def recommend():
    """
    Body (JSON):
      {
        "symptoms": "fever, headache, nausea",
        "lat": 33.8938,       // optional – user GPS
        "lng": 35.5018
      }
    Response:
      {
        "predictions":       [...],
        "matched_symptoms":  [...],
        "top_disease":       "Malaria",
        "speciality":        "Infectious Disease",
        "recommended_hospitals": [ { ...hospital + score + distance } ]
      }
    """
    body = request.get_json(force=True, silent=True) or {}
    symptoms = body.get("symptoms", "").strip()

    if not symptoms:
        return jsonify({"error": "symptoms field is required"}), 400

    vec, matched = vectorise(symptoms)

    if not matched:
        return jsonify({
            "error": "No recognisable symptoms found.",
            "hint": "Examples: fever, headache, nausea, shortness of breath, chest pain"
        }), 422

    proba  = BOOSTER.predict(vec)[0]
    top_i  = np.argsort(proba)[::-1][:5]
    preds  = [{"disease": LABEL_ENCODER.classes_[i],
               "confidence": round(float(proba[i]) * 100, 2)} for i in top_i]

    top_disease = preds[0]["disease"]
    speciality  = disease_to_speciality(top_disease)

    # GPS coords (optional)
    try:
        user_lat = float(body["lat"])
        user_lng = float(body["lng"])
    except (KeyError, TypeError, ValueError):
        user_lat = user_lng = None

    hospitals = fetch_and_rank_hospitals(speciality, user_lat, user_lng)

    return jsonify({
        "predictions":            preds,
        "matched_symptoms":       matched,
        "top_disease":            top_disease,
        "speciality":             speciality,
        "recommended_hospitals":  hospitals,
    })


@app.route("/symptoms", methods=["GET"])
def list_symptoms():
    """Returns all symptom column names — useful for frontend autocomplete."""
    clean = [s.replace("_", " ") for s in SYMPTOM_COLS]
    return jsonify({"symptoms": clean, "count": len(clean)})


@app.route("/speciality/<disease>", methods=["GET"])
def get_speciality(disease: str):
    """Quick lookup: GET /speciality/Malaria"""
    sp = disease_to_speciality(disease.title())
    return jsonify({"disease": disease, "speciality": sp})


# ═════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    log.info("FastAid AI service starting on port %d …", PORT)
    app.run(host="0.0.0.0", port=PORT, debug=False)
