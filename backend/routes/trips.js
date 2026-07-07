import express from "express";

const router = express.Router();

// Stores active emergency trips in memory
const activeTrips = new Map();

// Auto-delete trips after 6 hours
const TRIP_TTL_MS = 6 * 60 * 60 * 1000;

function scheduleExpiry(hospitalId) {
  setTimeout(() => {
    const trip = activeTrips.get(hospitalId);

    if (
      trip &&
      Date.now() - new Date(trip.updatedAt).getTime() >= TRIP_TTL_MS
    ) {
      activeTrips.delete(hospitalId);
    }
  }, TRIP_TTL_MS + 1000);
}

// Ambulance sends patient information to the selected hospital
router.post("/:hospitalId", (req, res) => {
  const { hospitalId } = req.params;

  const {
    emergencyId,
    nationalIdImage,
    vitals,
    predictedDisease,
    symptoms,
    ambulanceLocation,
  } = req.body;

  const trip = {
    emergencyId: emergencyId || null,
    nationalIdImage: nationalIdImage || null,
    vitals: vitals || {},
    predictedDisease: predictedDisease || null,
    symptoms: symptoms || "",
    ambulanceLocation: ambulanceLocation || null,
    updatedAt: new Date(),
  };

  activeTrips.set(hospitalId, trip);

  scheduleExpiry(hospitalId);

  res.json({
    success: true,
    trip,
  });
});

// Hospital dashboard requests current incoming emergency
router.get("/:hospitalId", (req, res) => {
  const trip = activeTrips.get(req.params.hospitalId) || null;

  res.json({
    trip,
  });
});

// Ambulance finishes emergency
router.delete("/:hospitalId", (req, res) => {
  activeTrips.delete(req.params.hospitalId);

  res.json({
    success: true,
  });
});

export default router;



// // routes/trips.js
// //
// // Purpose: carry the "live" patient hand-off data (national ID photo,
// // vitals, AI-predicted disease, symptoms, ambulance location) from an
// // ambulance to a specific hospital's dashboard, for the duration of a
// // single emergency run only.
// //
// // IMPORTANT: this deliberately does NOT touch the database. It's an
// // in-memory session store, keyed by hospitalId. When the ambulance marks
// // the emergency complete, the entry is deleted. If your server restarts,
// // active trips are lost (expected/fine for this use case).
// //
// // Mount this in your main server file, e.g.:
// //   app.use("/trips", require("./routes/trips"));

// import express from "express";
// const router = express.Router();

// // Map<hospitalId (string), tripData (object)>
// const activeTrips = new Map();

// // Optional safety net: auto-expire a trip if nobody clears it
// // (e.g. app crashed mid-emergency) after 6 hours.
// const TRIP_TTL_MS = 6 * 60 * 60 * 1000;

// // function scheduleExpiry(hospitalId) {
// //   setTimeout(() => {
// //     const trip = activeTrips.get(hospitalId);
// //     if (trip && Date.now() - trip.updatedAt.getTime() >= TRIP_TTL_MS) {
// //       activeTrips.delete(hospitalId);
// //     }
// //   }, TRIP_TTL_MS + 1000);
// // }

// // ── Ambulance staff sends / updates the trip data for a chosen hospital ──
// router.post("/:hospitalId", (req, res) => {
//   const { hospitalId } = req.params;

// //   const {
// //     emergencyId,
// //     nationalIdImage,
// //     vitals,
// //     predictedDisease,
// //     symptoms,
// //     ambulanceLocation,
// //   } = req.body;

// //   const trip = {
// //     emergencyId: emergencyId || null,
// //     nationalIdImage: nationalIdImage || null,
// //     vitals: vitals || {},
// //     predictedDisease: predictedDisease || null,
// //     symptoms: symptoms || "",
// //     ambulanceLocation: ambulanceLocation || null,
// //     updatedAt: new Date(),
// //   };
//  activeTrips.set(hospitalId, {
//     ...req.body,
//     updatedAt: new Date(),
//   });

// //   activeTrips.set(hospitalId, trip);
// //   scheduleExpiry(hospitalId);

//   res.json({ success: true, trip });
// });

// // ── Hospital dashboard polls this to see the current incoming trip ──
// router.get("/:hospitalId", (req, res) => {
//   const { hospitalId } = req.params;
//   const trip = activeTrips.get(hospitalId) || null;
//   res.json({ trip });
// });

// // ── Called when the emergency is completed/cancelled ──
// router.delete("/:hospitalId", (req, res) => {
//   const { hospitalId } = req.params;
//   activeTrips.delete(hospitalId);
//   res.json({ success: true });
// });

// module.exports = router;