export let doctorsGlobal = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: "2",
    name: "Dr. Michael Smith",
    specialty: "Neurologist",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: "3",
    name: "Dr. Emily Davis",
    specialty: "Pediatrician",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  {
    id: "4",
    name: "Dr. John Brown",
    specialty: "General Doctor",
    image: "https://randomuser.me/api/portraits/men/41.jpg",
  },
  {
    id: "5",
    name: "Dr. Maya Haddad",
    specialty: "Dermatologist",
    image: "https://randomuser.me/api/portraits/women/30.jpg",
  },
];

export const addDoctorGlobal = (doc) => {
  doctorsGlobal = [doc, ...doctorsGlobal];
};