import React, { createContext, useState } from "react";

export const DoctorsContext = createContext();

export const DoctorsProvider = ({ children }) => {
  const [doctors, setDoctors] = useState([
    { id: "1", name: "Dr. Ahmad", spec: "Cardiology", rating: 4.5, image: null },
    { id: "2", name: "Dr. Sara", spec: "Neurology", rating: 4.7, image: null },
  ]);

  const addDoctor = (doctor) => {
    setDoctors((prev) => [...prev, doctor]);
  };

  return (
    <DoctorsContext.Provider value={{ doctors, addDoctor }}>
      {children}
    </DoctorsContext.Provider>
  );
};