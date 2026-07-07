import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

import Hospital from "./models/Hospital.js";
import Doctor from "./models/Doctor.js";
import User from "./models/User.js";


await mongoose.connect(process.env.MONGO_URI);
console.log("✅ Connected to MongoDB");

// ─── Clear previous seed data ─────────────────────────────────────────────────
// await Hospital.deleteMany({ seeded: true });
// await Doctor.deleteMany({ seeded: true });
// console.log("🗑  Cleared old seed data");
await Hospital.deleteMany({ seeded: true });
await Doctor.deleteMany({ seeded: true });

await User.deleteMany({
  role: "hospital",
});

console.log("🗑 Cleared old seed data");

// ─── Lebanon Hospital Data ─────────────────────────────────────────────────────
// image_url: real Wikimedia Commons / official photos of each hospital
const hospitalsData = [
  // ── BEIRUT ────────────────────────────────────────────────
  {
    name: "American University of Beirut Medical Center (AUBMC)",
    location_name: "Beirut",
    address: "Bliss Street, Hamra, Beirut",
    lat: 33.8991,
    lng: 35.4780,
    phone: "+961-1-350000",
    email: "info@aubmc.org.lb",
    total_beds: 350,
    available_beds: 80,
    departments: ["Emergency", "Cardiology", "Neurology", "Orthopedics", "Oncology", "Pediatrics", "ICU", "Trauma"],
    average_rating: 4.8,
    total_reviews: 312,
    is_emergency_available: true,
    image_url: "https://hcpmedical.com/wp-content/uploads/2024/07/Lebanese-American-University-Medical-Center-LAUMC-%E2%80%93-Rizk-Hospital.webp",
  },
  {
    name: "Hotel-Dieu de France Hospital",
    location_name: "Beirut",
    address: "Alfred Naccache Avenue, Ashrafieh, Beirut",
    lat: 33.8887,
    lng: 35.5122,
    phone: "+961-1-615300",
    email: "contact@hdf.usj.edu.lb",
    total_beds: 420,
    available_beds: 95,
    departments: ["Emergency", "Cardiology", "Neurosurgery", "Orthopedics", "Oncology", "Maternity", "ICU", "Burns"],
    average_rating: 4.7,
    total_reviews: 289,
    is_emergency_available: true,
    image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Hotel_Dieu_de_France_Hospital_Beirut.jpg/800px-Hotel_Dieu_de_France_Hospital_Beirut.jpg",
  },
  {
    name: "Saint George Hospital University Medical Center",
    location_name: "Beirut",
    address: "Youssef Sursock Street, Achrafieh, Beirut",
    lat: 33.8917,
    lng: 35.5208,
    phone: "+961-1-585700",
    email: "info@stgeorgehospital.org",
    total_beds: 280,
    available_beds: 60,
    departments: ["Emergency", "Cardiology", "Neurology", "Orthopedics", "Pediatrics", "ICU", "General Surgery"],
    average_rating: 4.6,
    total_reviews: 198,
    is_emergency_available: true,
    image_url: "https://rst-services.com/wp-content/uploads/2019/08/St-george-hosp.jpg",
  },
  {
    name: "Clemenceau Medical Center (CMC)",
    location_name: "Beirut",
    address: "Clemenceau Street, Beirut",
    lat: 33.8930,
    lng: 35.4870,
    phone: "+961-1-372888",
    email: "info@cmc.com.lb",
    total_beds: 200,
    available_beds: 45,
    departments: ["Emergency", "Cardiology", "Orthopedics", "Neurology", "Oncology", "ICU"],
    average_rating: 4.5,
    total_reviews: 175,
    is_emergency_available: true,
    image_url: "https://www.nbbj.com/_next/image?url=https%3A%2F%2Fdata.openasset.com%2F32707b49%2Fe29823353618e56ccef974f1e75990b1%2F100891_00_AUBMC_N12_jpg%2F100891_00_AUBMC_N12_screenview.jpg&w=1920&q=75",
  },
  {
    name: "Makassed General Hospital",
    location_name: "Beirut",
    address: "Tallet Al-Khayat, Beirut",
    lat: 33.8820,
    lng: 35.4942,
    phone: "+961-1-636000",
    email: "info@makassed.org.lb",
    total_beds: 310,
    available_beds: 70,
    departments: ["Emergency", "General Surgery", "Orthopedics", "Cardiology", "Maternity", "Pediatrics", "ICU"],
    average_rating: 4.3,
    total_reviews: 210,
    is_emergency_available: true,
    image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1WdNuiLRpFE4wq6rqR60RFDeXYEoBS9niDw&s",
  },
  {
    name: "Rizk Hospital",
    location_name: "Beirut",
    address: "Damascus Road, Ashrafieh, Beirut",
    lat: 33.8834,
    lng: 35.5135,
    phone: "+961-1-200800",
    email: "info@rizkhospital.com",
    total_beds: 180,
    available_beds: 40,
    departments: ["Emergency", "Cardiology", "Orthopedics", "General Surgery", "ICU"],
    average_rating: 4.4,
    total_reviews: 142,
    is_emergency_available: true,
    image_url: "https://hcpmedical.com/wp-content/uploads/2024/07/Lebanese-American-University-Medical-Center-LAUMC-%E2%80%93-Rizk-Hospital.webp",
  },

  // ── MOUNT LEBANON ──────────────────────────────────────────
  {
    name: "Bellevue Medical Center",
    location_name: "Mansourieh",
    address: "Mansourieh El-Metn, Mount Lebanon",
    lat: 33.9003,
    lng: 35.5781,
    phone: "+961-4-533000",
    email: "info@bellevuemc.com",
    total_beds: 220,
    available_beds: 55,
    departments: ["Emergency", "Cardiology", "Neurology", "Orthopedics", "Oncology", "ICU"],
    average_rating: 4.5,
    total_reviews: 163,
    is_emergency_available: true,
    image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR39fHnYNFs0rqRn1V9lYC_3GgF7rKRRhR9Bg&s",
  },
  {
    name: "Hôpital Notre-Dame du Liban",
    location_name: "Jounieh",
    address: "Jounieh Highway, Jounieh",
    lat: 33.9813,
    lng: 35.6178,
    phone: "+961-9-910900",
    email: "info@hndl.org",
    total_beds: 190,
    available_beds: 42,
    departments: ["Emergency", "General Surgery", "Orthopedics", "Maternity", "Pediatrics", "ICU"],
    average_rating: 4.2,
    total_reviews: 130,
    is_emergency_available: true,
    image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR83lJvPymH4R_82zxnwTPwvO8iPoThGKtlDw&s",
  },
  {
    name: "Balamand University Hospital (Saint John of God)",
    location_name: "Deir el Balamand",
    address: "Koura District, North Lebanon",
    lat: 34.2297,
    lng: 35.6731,
    phone: "+961-6-930250",
    email: "info@balamand-hospital.com",
    total_beds: 160,
    available_beds: 35,
    departments: ["Emergency", "General Surgery", "Cardiology", "Orthopedics", "ICU"],
    average_rating: 4.1,
    total_reviews: 98,
    is_emergency_available: true,
    image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLt3cCCGX1e47UKKdrITX9P_OtK7Kzq6sfwQ&s",
  },

  // ── NORTH LEBANON ──────────────────────────────────────────
  {
    name: "Islamic Hospital of Tripoli",
    location_name: "Tripoli",
    address: "Al-Mina Road, Tripoli",
    lat: 34.4368,
    lng: 35.8317,
    phone: "+961-6-629000",
    email: "info@islamichospital-tripoli.com",
    total_beds: 250,
    available_beds: 58,
    departments: ["Emergency", "Cardiology", "Neurology", "Orthopedics", "General Surgery", "ICU"],
    average_rating: 4.2,
    total_reviews: 154,
    is_emergency_available: true,
    image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9CV2Cu68gXNd9SaKYbLusaqUMNrEJvQaBPA&s",
  },
  {
    name: "Al-Razi Hospital Tripoli",
    location_name: "Tripoli",
    address: "Abi Samra, Tripoli",
    lat: 34.4295,
    lng: 35.8490,
    phone: "+961-6-388001",
    email: "info@alrazitripoli.com",
    total_beds: 130,
    available_beds: 28,
    departments: ["Emergency", "General Surgery", "Orthopedics", "Maternity", "Pediatrics"],
    average_rating: 3.9,
    total_reviews: 89,
    is_emergency_available: true,
    image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFIKhJnYgFfjVOJlaZZ5tYFMSxDv_Al9ukEw&s",
  },

  // ── SOUTH LEBANON ─────────────────────────────────────────
  {
    name: "Jabal Amel Hospital",
    location_name: "Tyre",
    address: "Tyre (Sour), South Lebanon",
    lat: 33.2704,
    lng: 35.2038,
    phone: "+961-7-740777",
    email: "info@jabalamel.com",
    total_beds: 140,
    available_beds: 32,
    departments: ["Emergency", "General Surgery", "Orthopedics", "Maternity", "ICU"],
    average_rating: 4.0,
    total_reviews: 112,
    is_emergency_available: true,
    image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcttVwfXoi1byyOTgYa8nk0xHEYgHNlXHV_g&s",
  },
  {
    name: "Hiram Hospital",
    location_name: "Tyre",
    address: "Abbasiyeh, Tyre, South Lebanon",
    lat: 33.2648,
    lng: 35.2112,
    phone: "+961-7-344545",
    email: "info@hiramhospital.com",
    total_beds: 100,
    available_beds: 22,
    departments: ["Emergency", "General Surgery", "Orthopedics", "Pediatrics"],
    average_rating: 3.8,
    total_reviews: 67,
    is_emergency_available: true,
    image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhrcoEjmlpdFtEJqdPL-54lQjEmLjJ30IeYQ&s",
  },
  {
    name: "Hammoud Hospital University Medical Center",
    location_name: "Sidon",
    address: "Saida (Sidon), South Lebanon",
    lat: 33.5571,
    lng: 35.3729,
    phone: "+961-7-723111",
    email: "info@hammoudhospital.com",
    total_beds: 200,
    available_beds: 50,
    departments: ["Emergency", "Cardiology", "Neurology", "Orthopedics", "Oncology", "ICU", "Maternity"],
    average_rating: 4.4,
    total_reviews: 178,
    is_emergency_available: true,
    image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQS0BDjn1gX87n6ZAPBbYJxxIAzbt_6o39DiQ&s",
  },
  {
    name: "Labib Medical Center",
    location_name: "Sidon",
    address: "Sidon, South Lebanon",
    lat: 33.5600,
    lng: 35.3685,
    phone: "+961-7-720000",
    email: "info@labibmedical.com",
    total_beds: 90,
    available_beds: 20,
    departments: ["Emergency", "General Surgery", "Orthopedics", "Maternity"],
    average_rating: 3.9,
    total_reviews: 54,
    is_emergency_available: true,
    image_url: "https://images.squarespace-cdn.com/content/v1/5f6294d29e342939f68018a5/1620687087387-QRAN2L4U4KXMQVCSGC23/LMC.jpg",
  },

  // ── BEKAA ──────────────────────────────────────────────────
  {
    name: "Zahle Governmental Hospital",
    location_name: "Zahle",
    address: "Zahle, Bekaa",
    lat: 33.8500,
    lng: 35.9022,
    phone: "+961-8-812100",
    email: "info@zahlegov.gov.lb",
    total_beds: 180,
    available_beds: 40,
    departments: ["Emergency", "General Surgery", "Orthopedics", "Maternity", "ICU"],
    average_rating: 3.7,
    total_reviews: 88,
    is_emergency_available: true,
    image_url: "https://media.licdn.com/dms/image/v2/C4E22AQFd_GojN31sSw/feedshare-shrink_800/feedshare-shrink_800/0/1648731151220?e=2147483647&v=beta&t=FejJcpD_vUR_udrtn7YQVkJ3uN3t4TU-q3qxnywZeMk",
  },
  {
    name: "Middle East Hospital Bekaa",
    location_name: "Zahle",
    address: "Zahle, Bekaa Valley",
    lat: 33.8458,
    lng: 35.9050,
    phone: "+961-8-800800",
    email: "info@mehospital.com",
    total_beds: 120,
    available_beds: 27,
    departments: ["Emergency", "Cardiology", "Orthopedics", "General Surgery", "ICU"],
    average_rating: 4.0,
    total_reviews: 76,
    is_emergency_available: true,
    image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJ3ySHW_tLuVR0aI-VQwrB9rvfbCTKqWe1Lw&s",
  },
];

// ─── Doctors per hospital (specialty-rich) ────────────────────────────────────
// image_url: seeded Pravatar URLs — each doctor always gets the same unique face
const doctorTemplates = [
  // Cardiology
  { name: "Dr. Fadi Estephan",     specialization: "Cardiology",               experience_years: 18, rating: 4.9, image_url: "https://i.pravatar.cc/150?u=fadi.estephan" },
  { name: "Dr. Rania Khoury",      specialization: "Cardiology",               experience_years: 14, rating: 4.7, image_url: "https://i.pravatar.cc/150?u=rania.khoury" },
  // Trauma & Emergency
  { name: "Dr. Marwan Nassar",     specialization: "Trauma Surgery",           experience_years: 20, rating: 4.8, image_url: "https://i.pravatar.cc/150?u=marwan.nassar" },
  { name: "Dr. Lara Saade",        specialization: "Emergency Medicine",        experience_years: 10, rating: 4.6, image_url: "https://i.pravatar.cc/150?u=lara.saade" },
  // Neurology / Neurosurgery
  { name: "Dr. Karim Haddad",      specialization: "Neurosurgery",             experience_years: 22, rating: 4.9, image_url: "https://i.pravatar.cc/150?u=karim.haddad" },
  { name: "Dr. Nadia Frem",        specialization: "Neurology",                experience_years: 16, rating: 4.7, image_url: "https://i.pravatar.cc/150?u=nadia.frem" },
  // Orthopedics
  { name: "Dr. Elie Gemayel",      specialization: "Orthopedics",              experience_years: 15, rating: 4.8, image_url: "https://i.pravatar.cc/150?u=elie.gemayel" },
  { name: "Dr. Carla Abi Nader",   specialization: "Orthopedics",              experience_years: 12, rating: 4.6, image_url: "https://i.pravatar.cc/150?u=carla.abinader" },
  // Pediatrics
  { name: "Dr. Maya Zakhour",      specialization: "Pediatrics",               experience_years: 13, rating: 4.7, image_url: "https://i.pravatar.cc/150?u=maya.zakhour" },
  { name: "Dr. Hassan Tabbara",    specialization: "Pediatrics",               experience_years: 9,  rating: 4.5, image_url: "https://i.pravatar.cc/150?u=hassan.tabbara" },
  // Oncology
  { name: "Dr. Joelle Hanna",      specialization: "Oncology",                 experience_years: 19, rating: 4.8, image_url: "https://i.pravatar.cc/150?u=joelle.hanna" },
  // General Surgery
  { name: "Dr. Pierre Azar",       specialization: "General Surgery",          experience_years: 17, rating: 4.6, image_url: "https://i.pravatar.cc/150?u=pierre.azar" },
  { name: "Dr. Sana Khalil",       specialization: "General Surgery",          experience_years: 11, rating: 4.4, image_url: "https://i.pravatar.cc/150?u=sana.khalil" },
  // Burns & Plastic Surgery
  { name: "Dr. Georges Feghali",   specialization: "Burns & Plastic Surgery",  experience_years: 14, rating: 4.7, image_url: "https://i.pravatar.cc/150?u=georges.feghali" },
  // Maternity / OB-GYN
  { name: "Dr. Rita Yammine",      specialization: "Obstetrics & Gynecology",  experience_years: 16, rating: 4.8, image_url: "https://i.pravatar.cc/150?u=rita.yammine" },
  // ICU / Internal Medicine
  { name: "Dr. Ziad Hamdan",       specialization: "Internal Medicine",        experience_years: 20, rating: 4.7, image_url: "https://i.pravatar.cc/150?u=ziad.hamdan" },
  { name: "Dr. Aline Bou Sleiman", specialization: "Critical Care",            experience_years: 12, rating: 4.6, image_url: "https://i.pravatar.cc/150?u=aline.bousleiman" },
];

// ─── Insert hospitals and link doctors ───────────────────────────────────────
let totalDoctors = 0;

for (const h of hospitalsData) {
//   const hospital = await Hospital.create({
//     name: h.name,
//     email: `seed-${h.name.toLowerCase().replace(/\s+/g, "").slice(0, 12)}@fastaid.lb`,
//     phone: h.phone,
//     address: h.address,
//     location: { lat: h.lat, lng: h.lng },
//     location_name: h.location_name,
//     coordinates: { type: "Point", coordinates: [h.lng, h.lat] },
//     image_url: h.image_url,           // ← real image stored in DB
//     departments: h.departments,
//     total_beds: h.total_beds,
//     available_beds: h.available_beds,
//     average_rating: h.average_rating,
//     total_reviews: h.total_reviews,
//     is_emergency_available: h.is_emergency_available,
//     is_active: true,
//     seeded: true,
//   });
const hospital = await Hospital.create({
  name: h.name,
  email: h.email.toLowerCase(),
  phone: h.phone,
  address: h.address,
  location: {
    lat: h.lat,
    lng: h.lng,
  },
  location_name: h.location_name,
  coordinates: {
    type: "Point",
    coordinates: [h.lng, h.lat],
  },
  image_url: h.image_url,
  departments: h.departments,
  total_beds: h.total_beds,
  available_beds: h.available_beds,
  average_rating: h.average_rating,
  total_reviews: h.total_reviews,
  is_emergency_available: h.is_emergency_available,
  is_active: true,
  seeded: true,
});

// Create hospital login account
const hashedPassword = await bcrypt.hash(
  "hospital123",
  10
);

const account = await User.create({
  full_name: h.name,
  email: h.email.toLowerCase(),
  password: hashedPassword,
  role: "hospital",
  hospital: hospital._id,
});

// Link hospital ↔ account
hospital.account = account._id;
await hospital.save();

  // Assign doctors relevant to this hospital's departments
  const relevantDoctors = doctorTemplates.filter((d) => {
    const specMap = {
      Cardiology:        ["Cardiology"],
      Neurology:         ["Neurology", "Neurosurgery"],
      Orthopedics:       ["Orthopedics"],
      Pediatrics:        ["Pediatrics"],
      Oncology:          ["Oncology"],
      "General Surgery": ["General Surgery"],
      Burns:             ["Burns & Plastic Surgery"],
      Maternity:         ["Obstetrics & Gynecology"],
      Emergency:         ["Emergency Medicine", "Trauma Surgery"],
      ICU:               ["Critical Care", "Internal Medicine"],
      Trauma:            ["Trauma Surgery"],
    };
    return h.departments.some((dept) =>
      (specMap[dept] || []).includes(d.specialization)
    );
  });

  const assigned = relevantDoctors.slice(0, 5);
  for (const d of assigned) {
    await Doctor.create({
      name: d.name,
      specialization: d.specialization,
      experience_years: d.experience_years,
      rating: d.rating,
      image_url: d.image_url,         // ← real image stored in DB
      hospital: hospital._id,
      is_available: true,
      seeded: true,
    });
    totalDoctors++;
  }

  console.log(`  ✅ ${hospital.name} (${h.location_name}) — ${assigned.length} doctors`);
}

console.log(`\n🏥 Seeded ${hospitalsData.length} hospitals`);
console.log(`👨‍⚕️ Seeded ${totalDoctors} doctors`);
console.log("\n✅ Done! Run your FastAid backend to use the data.");
await mongoose.disconnect();



// /**
//  * FastAid — Lebanon Hospital & Doctor Seed
//  * Run: node seed.js
//  *
//  * Seeds real Lebanese hospitals with doctors and specialties.
//  * Safe to re-run — clears existing seed data first.
//  */

// import mongoose from "mongoose";
// import dotenv from "dotenv";
// dotenv.config();

// import Hospital from "./models/Hospital.js";
// import Doctor from "./models/Doctor.js";

// await mongoose.connect(process.env.MONGO_URI);
// console.log("✅ Connected to MongoDB");

// // ─── Clear previous seed data ─────────────────────────────────────────────────
// await Hospital.deleteMany({ seeded: true });
// await Doctor.deleteMany({ seeded: true });
// console.log("🗑  Cleared old seed data");

// // ─── Lebanon Hospital Data ─────────────────────────────────────────────────────
// const hospitalsData = [
//   // ── BEIRUT ────────────────────────────────────────────────
//   {
//     name: "American University of Beirut Medical Center (AUBMC)",
//     location_name: "Beirut",
//     address: "Bliss Street, Hamra, Beirut",
//     lat: 33.8991,
//     lng: 35.4780,
//     phone: "+961-1-350000",
//     email: "info@aubmc.org.lb",
//     total_beds: 350,
//     available_beds: 80,
//     departments: ["Emergency", "Cardiology", "Neurology", "Orthopedics", "Oncology", "Pediatrics", "ICU", "Trauma"],
//     average_rating: 4.8,
//     total_reviews: 312,
//     is_emergency_available: true,
//   },
//   {
//     name: "Hotel-Dieu de France Hospital",
//     location_name: "Beirut",
//     address: "Alfred Naccache Avenue, Ashrafieh, Beirut",
//     lat: 33.8887,
//     lng: 35.5122,
//     phone: "+961-1-615300",
//     email: "contact@hdf.usj.edu.lb",
//     total_beds: 420,
//     available_beds: 95,
//     departments: ["Emergency", "Cardiology", "Neurosurgery", "Orthopedics", "Oncology", "Maternity", "ICU", "Burns"],
//     average_rating: 4.7,
//     total_reviews: 289,
//     is_emergency_available: true,
//   },
//   {
//     name: "Saint George Hospital University Medical Center",
//     location_name: "Beirut",
//     address: "Youssef Sursock Street, Achrafieh, Beirut",
//     lat: 33.8917,
//     lng: 35.5208,
//     phone: "+961-1-585700",
//     email: "info@stgeorgehospital.org",
//     total_beds: 280,
//     available_beds: 60,
//     departments: ["Emergency", "Cardiology", "Neurology", "Orthopedics", "Pediatrics", "ICU", "General Surgery"],
//     average_rating: 4.6,
//     total_reviews: 198,
//     is_emergency_available: true,
//   },
//   {
//     name: "Clemenceau Medical Center (CMC)",
//     location_name: "Beirut",
//     address: "Clemenceau Street, Beirut",
//     lat: 33.8930,
//     lng: 35.4870,
//     phone: "+961-1-372888",
//     email: "info@cmc.com.lb",
//     total_beds: 200,
//     available_beds: 45,
//     departments: ["Emergency", "Cardiology", "Orthopedics", "Neurology", "Oncology", "ICU"],
//     average_rating: 4.5,
//     total_reviews: 175,
//     is_emergency_available: true,
//   },
//   {
//     name: "Makassed General Hospital",
//     location_name: "Beirut",
//     address: "Tallet Al-Khayat, Beirut",
//     lat: 33.8820,
//     lng: 35.4942,
//     phone: "+961-1-636000",
//     email: "info@makassed.org.lb",
//     total_beds: 310,
//     available_beds: 70,
//     departments: ["Emergency", "General Surgery", "Orthopedics", "Cardiology", "Maternity", "Pediatrics", "ICU"],
//     average_rating: 4.3,
//     total_reviews: 210,
//     is_emergency_available: true,
//   },
//   {
//     name: "Rizk Hospital",
//     location_name: "Beirut",
//     address: "Damascus Road, Ashrafieh, Beirut",
//     lat: 33.8834,
//     lng: 35.5135,
//     phone: "+961-1-200800",
//     email: "info@rizkhospital.com",
//     total_beds: 180,
//     available_beds: 40,
//     departments: ["Emergency", "Cardiology", "Orthopedics", "General Surgery", "ICU"],
//     average_rating: 4.4,
//     total_reviews: 142,
//     is_emergency_available: true,
//   },

//   // ── MOUNT LEBANON ──────────────────────────────────────────
//   {
//     name: "Bellevue Medical Center",
//     location_name: "Mansourieh",
//     address: "Mansourieh El-Metn, Mount Lebanon",
//     lat: 33.9003,
//     lng: 35.5781,
//     phone: "+961-4-533000",
//     email: "info@bellevuemc.com",
//     total_beds: 220,
//     available_beds: 55,
//     departments: ["Emergency", "Cardiology", "Neurology", "Orthopedics", "Oncology", "ICU"],
//     average_rating: 4.5,
//     total_reviews: 163,
//     is_emergency_available: true,
//   },
//   {
//     name: "Hôpital Notre-Dame du Liban",
//     location_name: "Jounieh",
//     address: "Jounieh Highway, Jounieh",
//     lat: 33.9813,
//     lng: 35.6178,
//     phone: "+961-9-910900",
//     email: "info@hndl.org",
//     total_beds: 190,
//     available_beds: 42,
//     departments: ["Emergency", "General Surgery", "Orthopedics", "Maternity", "Pediatrics", "ICU"],
//     average_rating: 4.2,
//     total_reviews: 130,
//     is_emergency_available: true,
//   },
//   {
//     name: "Balamand University Hospital (Saint John of God)",
//     location_name: "Deir el Balamand",
//     address: "Koura District, North Lebanon",
//     lat: 34.2297,
//     lng: 35.6731,
//     phone: "+961-6-930250",
//     email: "info@balamand-hospital.com",
//     total_beds: 160,
//     available_beds: 35,
//     departments: ["Emergency", "General Surgery", "Cardiology", "Orthopedics", "ICU"],
//     average_rating: 4.1,
//     total_reviews: 98,
//     is_emergency_available: true,
//   },

//   // ── NORTH LEBANON ──────────────────────────────────────────
//   {
//     name: "Islamic Hospital of Tripoli",
//     location_name: "Tripoli",
//     address: "Al-Mina Road, Tripoli",
//     lat: 34.4368,
//     lng: 35.8317,
//     phone: "+961-6-629000",
//     email: "info@islamichospital-tripoli.com",
//     total_beds: 250,
//     available_beds: 58,
//     departments: ["Emergency", "Cardiology", "Neurology", "Orthopedics", "General Surgery", "ICU"],
//     average_rating: 4.2,
//     total_reviews: 154,
//     is_emergency_available: true,
//   },
//   {
//     name: "Al-Razi Hospital Tripoli",
//     location_name: "Tripoli",
//     address: "Abi Samra, Tripoli",
//     lat: 34.4295,
//     lng: 35.8490,
//     phone: "+961-6-388001",
//     email: "info@alrazitripoli.com",
//     total_beds: 130,
//     available_beds: 28,
//     departments: ["Emergency", "General Surgery", "Orthopedics", "Maternity", "Pediatrics"],
//     average_rating: 3.9,
//     total_reviews: 89,
//     is_emergency_available: true,
//   },

//   // ── SOUTH LEBANON ─────────────────────────────────────────
//   {
//     name: "Jabal Amel Hospital",
//     location_name: "Tyre",
//     address: "Tyre (Sour), South Lebanon",
//     lat: 33.2704,
//     lng: 35.2038,
//     phone: "+961-7-740777",
//     email: "info@jabalamel.com",
//     total_beds: 140,
//     available_beds: 32,
//     departments: ["Emergency", "General Surgery", "Orthopedics", "Maternity", "ICU"],
//     average_rating: 4.0,
//     total_reviews: 112,
//     is_emergency_available: true,
//   },
//   {
//     name: "Hiram Hospital",
//     location_name: "Tyre",
//     address: "Abbasiyeh, Tyre, South Lebanon",
//     lat: 33.2648,
//     lng: 35.2112,
//     phone: "+961-7-344545",
//     email: "info@hiramhospital.com",
//     total_beds: 100,
//     available_beds: 22,
//     departments: ["Emergency", "General Surgery", "Orthopedics", "Pediatrics"],
//     average_rating: 3.8,
//     total_reviews: 67,
//     is_emergency_available: true,
//   },
//   {
//     name: "Hammoud Hospital University Medical Center",
//     location_name: "Sidon",
//     address: "Saida (Sidon), South Lebanon",
//     lat: 33.5571,
//     lng: 35.3729,
//     phone: "+961-7-723111",
//     email: "info@hammoudhospital.com",
//     total_beds: 200,
//     available_beds: 50,
//     departments: ["Emergency", "Cardiology", "Neurology", "Orthopedics", "Oncology", "ICU", "Maternity"],
//     average_rating: 4.4,
//     total_reviews: 178,
//     is_emergency_available: true,
//   },
//   {
//     name: "Labib Medical Center",
//     location_name: "Sidon",
//     address: "Sidon, South Lebanon",
//     lat: 33.5600,
//     lng: 35.3685,
//     phone: "+961-7-720000",
//     email: "info@labibmedical.com",
//     total_beds: 90,
//     available_beds: 20,
//     departments: ["Emergency", "General Surgery", "Orthopedics", "Maternity"],
//     average_rating: 3.9,
//     total_reviews: 54,
//     is_emergency_available: true,
//   },

//   // ── BEKAA ──────────────────────────────────────────────────
//   {
//     name: "Zahle Governmental Hospital",
//     location_name: "Zahle",
//     address: "Zahle, Bekaa",
//     lat: 33.8500,
//     lng: 35.9022,
//     phone: "+961-8-812100",
//     email: "info@zahlegov.gov.lb",
//     total_beds: 180,
//     available_beds: 40,
//     departments: ["Emergency", "General Surgery", "Orthopedics", "Maternity", "ICU"],
//     average_rating: 3.7,
//     total_reviews: 88,
//     is_emergency_available: true,
//   },
//   {
//     name: "Middle East Hospital Bekaa",
//     location_name: "Zahle",
//     address: "Zahle, Bekaa Valley",
//     lat: 33.8458,
//     lng: 35.9050,
//     phone: "+961-8-800800",
//     email: "info@mehospital.com",
//     total_beds: 120,
//     available_beds: 27,
//     departments: ["Emergency", "Cardiology", "Orthopedics", "General Surgery", "ICU"],
//     average_rating: 4.0,
//     total_reviews: 76,
//     is_emergency_available: true,
//   },
// ];

// // ─── Doctors per hospital (specialty-rich) ──────────────────────────────────
// const doctorTemplates = [
//   // Cardiology
//   { name: "Dr. Fadi Estephan",    specialization: "Cardiology",          experience_years: 18, rating: 4.9 },
//   { name: "Dr. Rania Khoury",     specialization: "Cardiology",          experience_years: 14, rating: 4.7 },
//   // Trauma & Emergency Surgery
//   { name: "Dr. Marwan Nassar",    specialization: "Trauma Surgery",      experience_years: 20, rating: 4.8 },
//   { name: "Dr. Lara Saade",       specialization: "Emergency Medicine",  experience_years: 10, rating: 4.6 },
//   // Neurology / Neurosurgery
//   { name: "Dr. Karim Haddad",     specialization: "Neurosurgery",        experience_years: 22, rating: 4.9 },
//   { name: "Dr. Nadia Frem",       specialization: "Neurology",           experience_years: 16, rating: 4.7 },
//   // Orthopedics
//   { name: "Dr. Elie Gemayel",     specialization: "Orthopedics",         experience_years: 15, rating: 4.8 },
//   { name: "Dr. Carla Abi Nader",  specialization: "Orthopedics",         experience_years: 12, rating: 4.6 },
//   // Pediatrics
//   { name: "Dr. Maya Zakhour",     specialization: "Pediatrics",          experience_years: 13, rating: 4.7 },
//   { name: "Dr. Hassan Tabbara",   specialization: "Pediatrics",          experience_years: 9,  rating: 4.5 },
//   // Oncology
//   { name: "Dr. Joelle Hanna",     specialization: "Oncology",            experience_years: 19, rating: 4.8 },
//   // General Surgery
//   { name: "Dr. Pierre Azar",      specialization: "General Surgery",     experience_years: 17, rating: 4.6 },
//   { name: "Dr. Sana Khalil",      specialization: "General Surgery",     experience_years: 11, rating: 4.4 },
//   // Burns & Plastic Surgery
//   { name: "Dr. Georges Feghali",  specialization: "Burns & Plastic Surgery", experience_years: 14, rating: 4.7 },
//   // Maternity / OB-GYN
//   { name: "Dr. Rita Yammine",     specialization: "Obstetrics & Gynecology", experience_years: 16, rating: 4.8 },
//   // ICU / Internal Medicine
//   { name: "Dr. Ziad Hamdan",      specialization: "Internal Medicine",   experience_years: 20, rating: 4.7 },
//   { name: "Dr. Aline Bou Sleiman",specialization: "Critical Care",       experience_years: 12, rating: 4.6 },
// ];

// // ─── Insert hospitals and link doctors ───────────────────────────────────────
// let totalDoctors = 0;

// for (const h of hospitalsData) {
//   const hospital = await Hospital.create({
//     name: h.name,
//     email: `seed-${h.name.toLowerCase().replace(/\s+/g, "").slice(0, 12)}@fastaid.lb`,
//     phone: h.phone,
//     address: h.address,
//     location: { lat: h.lat, lng: h.lng },
//     location_name: h.location_name,
//     coordinates: { type: "Point", coordinates: [h.lng, h.lat] },
//     departments: h.departments,
//     total_beds: h.total_beds,
//     available_beds: h.available_beds,
//     average_rating: h.average_rating,
//     total_reviews: h.total_reviews,
//     is_emergency_available: h.is_emergency_available,
//     is_active: true,
//     seeded: true,
//   });

//   // Assign 3–6 doctors relevant to this hospital's departments
//   const relevantDoctors = doctorTemplates.filter((d) => {
//     const specMap = {
//       Cardiology:      ["Cardiology"],
//       Neurology:       ["Neurology", "Neurosurgery"],
//       Orthopedics:     ["Orthopedics"],
//       Pediatrics:      ["Pediatrics"],
//       Oncology:        ["Oncology"],
//       "General Surgery": ["General Surgery"],
//       Burns:           ["Burns & Plastic Surgery"],
//       Maternity:       ["Obstetrics & Gynecology"],
//       Emergency:       ["Emergency Medicine", "Trauma Surgery"],
//       ICU:             ["Critical Care", "Internal Medicine"],
//       Trauma:          ["Trauma Surgery"],
//     };
//     return h.departments.some((dept) =>
//       (specMap[dept] || []).includes(d.specialization)
//     );
//   });

//   // Pick up to 5 doctors per hospital
//   const assigned = relevantDoctors.slice(0, 5);
//   for (const d of assigned) {
//     await Doctor.create({
//       name: d.name,
//       specialization: d.specialization,
//       experience_years: d.experience_years,
//       rating: d.rating,
//       hospital: hospital._id,
//       is_available: true,
//       seeded: true,
//     });
//     totalDoctors++;
//   }

//   console.log(`  ✅ ${hospital.name} (${h.location_name}) — ${assigned.length} doctors`);
// }

// console.log(`\n🏥 Seeded ${hospitalsData.length} hospitals`);
// console.log(`👨‍⚕️ Seeded ${totalDoctors} doctors`);
// console.log("\n✅ Done! Run your FastAid backend to use the data.");
// await mongoose.disconnect();

/**
 * FastAid — Lebanon Hospital & Doctor Seed
 * Run: node seed.js
 *
 * Seeds real Lebanese hospitals with doctors and specialties.
 * Safe to re-run — clears existing seed data first.
 */
