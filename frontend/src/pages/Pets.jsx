import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

import {
  FaEye,
  FaPen,
  FaTrash,
  FaSortAmountDown,
  FaSearch,
  FaTimes,
  FaFileExport,
  FaPaw,
  FaHeart,
  FaIdCard,
  FaCamera,
} from "react-icons/fa";

/* =========================================================
   PET SPECIES + BREEDS
========================================================= */

const PET_BREEDS = {
  Bird: [
    "African Grey Parrot",
    "Budgerigar",
    "Canary",
    "Cockatiel",
    "Cockatoo",
    "Conure",
    "Finch",
    "Lovebird",
    "Macaw",
    "Parrot",
    "Other",
  ],

  Cat: [
    "Abyssinian",
    "American Shorthair",
    "Bengal",
    "Birman",
    "British Shorthair",
    "Burmese",
    "Domestic Longhair",
    "Domestic Shorthair",
    "Maine Coon",
    "Norwegian Forest Cat",
    "Persian",
    "Ragdoll",
    "Russian Blue",
    "Scottish Fold",
    "Siamese",
    "Sphynx",
    "Turkish Angora",
    "Other",
  ],

  Dog: [
    "Akita",
    "Alaskan Malamute",
    "Australian Shepherd",
    "Beagle",
    "Belgian Malinois",
    "Bernese Mountain Dog",
    "Bichon Frise",
    "Border Collie",
    "Boston Terrier",
    "Boxer",
    "Bulldog",
    "Cane Corso",
    "Cavalier King Charles Spaniel",
    "Chihuahua",
    "Chow Chow",
    "Cocker Spaniel",
    "Dachshund",
    "Dalmatian",
    "Doberman Pinscher",
    "French Bulldog",
    "German Shepherd",
    "Golden Retriever",
    "Great Dane",
    "Havanese",
    "Husky",
    "Jack Russell Terrier",
    "Labrador Retriever",
    "Maltese",
    "Miniature Schnauzer",
    "Mixed Breed",
    "Pekingese",
    "Pomeranian",
    "Poodle",
    "Pug",
    "Rottweiler",
    "Samoyed",
    "Shih Tzu",
    "Yorkshire Terrier",
    "Other",
  ],

  Ferret: [
    "Albino",
    "Black Sable",
    "Champagne",
    "Chocolate",
    "Cinnamon",
    "Sable",
    "Other",
  ],

  Fish: [
    "Angelfish",
    "Betta",
    "Cichlid",
    "Goldfish",
    "Guppy",
    "Koi",
    "Molly",
    "Tetra",
    "Other",
  ],

  "Guinea Pig": [
    "Abyssinian",
    "American",
    "Peruvian",
    "Silkie",
    "Skinny Pig",
    "Teddy",
    "Other",
  ],

  Hamster: [
    "Campbell's Dwarf",
    "Chinese",
    "Roborovski",
    "Syrian",
    "Winter White",
    "Other",
  ],

  Horse: [
    "Andalusian",
    "Appaloosa",
    "Arabian",
    "Friesian",
    "Quarter Horse",
    "Thoroughbred",
    "Warmblood",
    "Other",
  ],

  Rabbit: [
    "Angora",
    "Dutch",
    "Flemish Giant",
    "Holland Lop",
    "Lionhead",
    "Mini Lop",
    "Mini Rex",
    "Netherland Dwarf",
    "Rex",
    "Other",
  ],

  Reptile: [
    "Bearded Dragon",
    "Boa Constrictor",
    "Chameleon",
    "Corn Snake",
    "Gecko",
    "Iguana",
    "Python",
    "Tortoise",
    "Turtle",
    "Other",
  ],

  Other: ["Other"],
};

const PET_SPECIES = Object.keys(PET_BREEDS).sort((a, b) =>
  a.localeCompare(b)
);

/* =========================================================
   HELPERS
========================================================= */

const calculateAgeFromDOB = (dateOfBirth) => {
  if (!dateOfBirth) return "";

  const birthDate = new Date(`${dateOfBirth}T00:00:00`);

  if (Number.isNaN(birthDate.getTime())) {
    return "";
  }

  const today = new Date();

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();

  if (today.getDate() < birthDate.getDate()) {
    months -= 1;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years < 0) return "";

  if (years === 0) {
    if (months <= 0) {
      return "Less than 1 month";
    }

    return `${months} ${months === 1 ? "month" : "months"}`;
  }

  return `${years} ${years === 1 ? "year" : "years"}`;
};

const extractAgeYears = (value) => {
  if (value === null || value === undefined) return null;

  const match = String(value).match(/\d+/);

  if (!match) return null;

  const years = Number(match[0]);

  if (Number.isNaN(years) || years < 0) return null;

  return years;
};

const estimatedDOBFromAge = (age) => {
  const years = extractAgeYears(age);

  if (years === null) return "";

  const currentYear = new Date().getFullYear();

  return `${currentYear - years}-01-01`;
};

const COLOR_PRESETS = [
  { name: "Black", value: "#1f1f1f" },
  { name: "White", value: "#ffffff" },
  { name: "Brown", value: "#8b5a2b" },
  { name: "Golden", value: "#d4a017" },
  { name: "Cream", value: "#f2dfbd" },
  { name: "Gray", value: "#8a8a8a" },
  { name: "Orange", value: "#d97721" },
  { name: "Tan", value: "#c79a63" },
];

const getColorHex = (color) => {
  const preset = COLOR_PRESETS.find(
    (item) =>
      item.name.toLowerCase() ===
      String(color || "").toLowerCase()
  );

  return preset?.value || "#55b7b2";
};

/* =========================================================
   PETS
========================================================= */

function Pets() {
  const location = useLocation();
  const navigate = useNavigate();

  const [pets, setPets] = useState([
    {
      id: 1,
      name: "Bella",
      owner: "Tala El Hajj",
      species: "Dog",
      breed: "Golden Retriever",
      age: "4 years",
      sex: "Female",
      dateOfBirth: "2022-05-12",
      color: "Golden",
      colorHex: "#d4a017",
      weight: "28",
      microchipNumber: "MC-10001",
      bloodType: "DEA 1.1+",
      allergies: "None",
      chronicConditions: "None",
      notes: "Friendly and active.",
      profilePhoto: "",
      timeline: [
        {
          id: 1,
          type: "Visit",
          date: "2026-09-25",
          title: "Routine checkup",
          description: "General examination completed.",
        },
        {
          id: 2,
          type: "Vaccination",
          date: "2026-08-10",
          title: "Rabies vaccination",
          description: "Rabies vaccine administered.",
        },
      ],
    },

    {
      id: 2,
      name: "Luna",
      owner: "Fatima Abbas",
      species: "Bird",
      breed: "Lovebird",
      age: "2 years",
      sex: "Female",
      dateOfBirth: "2024-03-18",
      color: "Green",
      colorHex: "#4f8a4f",
      weight: "0.06",
      microchipNumber: "",
      bloodType: "",
      allergies: "None",
      chronicConditions: "None",
      notes: "",
      profilePhoto: "",
      timeline: [
        {
          id: 1,
          type: "Visit",
          date: "2026-09-20",
          title: "Routine checkup",
          description: "Pet is healthy.",
        },
      ],
    },
  ]);

  const [search, setSearch] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);

  const [addTab, setAddTab] = useState("basic");
  const [editTab, setEditTab] = useState("basic");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);

  const getEmptyPet = () => ({
    name: "",
    owner: "",
    species: "",
    breed: "",
    age: "",
    dateOfBirth: "",
    estimatedDOB: false,
    sex: "",
    color: "",
    colorHex: "#55b7b2",
    weight: "",
    microchipNumber: "",
    bloodType: "",
    allergies: "",
    chronicConditions: "",
    notes: "",
    profilePhoto: "",
    timeline: [],
  });

  const [newPet, setNewPet] = useState(getEmptyPet());

  const newPetBreeds = useMemo(() => {
    if (!newPet.species) return [];

    return [...(PET_BREEDS[newPet.species] || [])].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [newPet.species]);

  const editPetBreeds = useMemo(() => {
    if (!selectedPet?.species) return [];

    return [...(PET_BREEDS[selectedPet.species] || [])].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [selectedPet?.species]);

  useEffect(() => {
    if (!location.state?.openAddPet) return;

    const ownerFromPreviousStep = location.state?.owner;

    let ownerName = "";

    if (ownerFromPreviousStep) {
      if (typeof ownerFromPreviousStep === "string") {
        ownerName = ownerFromPreviousStep;
      } else {
        ownerName = `${ownerFromPreviousStep.firstName || ""} ${
          ownerFromPreviousStep.lastName || ""
        }`.trim();
      }
    }

    setNewPet((previous) => ({
      ...previous,
      owner: ownerName,
    }));

    setAddTab("basic");
    setShowAddModal(true);

    navigate(location.pathname, {
      replace: true,
      state: null,
    });
  }, [location.state, location.pathname, navigate]);

  const filteredPets = pets.filter((pet) => {
    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      (pet.name || "").toLowerCase().includes(searchText) ||
      (pet.owner || "").toLowerCase().includes(searchText) ||
      (pet.species || "").toLowerCase().includes(searchText) ||
      (pet.breed || "").toLowerCase().includes(searchText) ||
      (pet.age || "").toLowerCase().includes(searchText);

    const matchesSpecies =
      speciesFilter === "all" || pet.species === speciesFilter;

    return matchesSearch && matchesSpecies;
  });

  const sortedPets = [...filteredPets].sort((a, b) => {
    if (sortBy === "name-asc") {
      return (a.name || "").localeCompare(b.name || "");
    }

    if (sortBy === "name-desc") {
      return (b.name || "").localeCompare(a.name || "");
    }

    if (sortBy === "owner-asc") {
      return (a.owner || "").localeCompare(b.owner || "");
    }

    if (sortBy === "owner-desc") {
      return (b.owner || "").localeCompare(a.owner || "");
    }

    if (sortBy === "species-asc") {
      return (a.species || "").localeCompare(b.species || "");
    }

    if (sortBy === "species-desc") {
      return (b.species || "").localeCompare(a.species || "");
    }

    if (sortBy === "age-low") {
      return (
        (extractAgeYears(a.age) ?? 999) -
        (extractAgeYears(b.age) ?? 999)
      );
    }

    if (sortBy === "age-high") {
      return (
        (extractAgeYears(b.age) ?? -1) -
        (extractAgeYears(a.age) ?? -1)
      );
    }

    return Number(a.id) - Number(b.id);
  });

  const totalPages = Math.max(
    1,
    Math.ceil(sortedPets.length / itemsPerPage)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const indexOfLastPet = safeCurrentPage * itemsPerPage;
  const indexOfFirstPet = indexOfLastPet - itemsPerPage;

  const currentPets = sortedPets.slice(
    indexOfFirstPet,
    indexOfLastPet
  );

  const handleExport = () => {
    const headers = [
      "Pet Name",
      "Owner",
      "Species",
      "Breed",
      "Age",
      "Sex",
      "Date of Birth",
      "Color",
      "Weight",
      "Microchip Number",
      "Blood Type",
      "Allergies",
      "Chronic Conditions",
      "Notes",
    ];

    const rows = sortedPets.map((pet) => [
      pet.name,
      pet.owner,
      pet.species,
      pet.breed,
      pet.age,
      pet.sex || "",
      pet.dateOfBirth || "",
      pet.color || "",
      pet.weight || "",
      pet.microchipNumber || "",
      pet.bloodType || "",
      pet.allergies || "",
      pet.chronicConditions || "",
      pet.notes || "",
    ]);

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "pets-data.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const handleOpenAdd = () => {
    setNewPet(getEmptyPet());
    setAddTab("basic");
    setShowAddModal(true);
  };

  const handleCloseAdd = () => {
    setShowAddModal(false);
    setAddTab("basic");
    setNewPet(getEmptyPet());
  };

  const handleNewPetChange = (e) => {
    const { name, value } = e.target;

    if (name === "species") {
      setNewPet((previous) => ({
        ...previous,
        species: value,
        breed: "",
      }));
      return;
    }

    if (name === "dateOfBirth") {
      setNewPet((previous) => ({
        ...previous,
        dateOfBirth: value,
        age: calculateAgeFromDOB(value),
        estimatedDOB: false,
      }));
      return;
    }

    if (name === "age") {
      const estimatedDOB = estimatedDOBFromAge(value);

      setNewPet((previous) => ({
        ...previous,
        age: value,
        dateOfBirth: estimatedDOB,
        estimatedDOB: Boolean(estimatedDOB),
      }));
      return;
    }

    setNewPet((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleNewPetColorChange = (e) => {
    const colorHex = e.target.value;

    setNewPet((previous) => ({
      ...previous,
      colorHex,
      color: colorHex,
    }));
  };

  const handleNewPetColorNameChange = (e) => {
    const color = e.target.value;

    setNewPet((previous) => ({
      ...previous,
      color,
    }));
  };

  const handleNewPetPhoto = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setNewPet((previous) => ({
        ...previous,
        profilePhoto: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleEditPetPhoto = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setSelectedPet((previous) => ({
        ...previous,
        profilePhoto: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleAddPet = (e) => {
    e.preventDefault();

    const action = e.nativeEvent.submitter?.value;

    if (!newPet.name.trim()) {
      setAddTab("basic");
      return;
    }

    if (!newPet.owner.trim()) {
      setAddTab("basic");
      return;
    }

    if (!newPet.species || !newPet.breed) {
      setAddTab("basic");
      return;
    }

    const pet = {
      id: Date.now(),
      ...newPet,
      colorHex: newPet.colorHex || getColorHex(newPet.color),
      timeline: newPet.timeline || [],
    };

    setPets((previousPets) => [...previousPets, pet]);

    setNewPet(getEmptyPet());
    setAddTab("basic");
    setShowAddModal(false);

    if (action === "save-and-book-appointment") {
      navigate("/appointments", {
        state: {
          openAddAppointment: true,
          petId: pet.id,
          pet,
          ownerName: pet.owner,
          owner: pet.owner,
        },
      });
    }
  };

  /* View continues to the new PetProfile */
  const handleViewPet = (pet) => {
    navigate(`/pets/${pet.id}`, {
      state: { pet },
    });
  };

  const handleOpenEdit = (pet) => {
    setSelectedPet({
      ...pet,
      colorHex: pet.colorHex || getColorHex(pet.color),
      estimatedDOB: pet.estimatedDOB || false,
    });

    setEditTab("basic");
    setShowEditModal(true);
  };

  const handleCloseEdit = () => {
    setShowEditModal(false);
    setSelectedPet(null);
    setEditTab("basic");
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    if (name === "species") {
      setSelectedPet((previous) => ({
        ...previous,
        species: value,
        breed: "",
      }));
      return;
    }

    if (name === "dateOfBirth") {
      setSelectedPet((previous) => ({
        ...previous,
        dateOfBirth: value,
        age: calculateAgeFromDOB(value),
        estimatedDOB: false,
      }));
      return;
    }

    if (name === "age") {
      const estimatedDOB = estimatedDOBFromAge(value);

      setSelectedPet((previous) => ({
        ...previous,
        age: value,
        dateOfBirth: estimatedDOB,
        estimatedDOB: Boolean(estimatedDOB),
      }));
      return;
    }

    setSelectedPet((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleEditColorChange = (e) => {
    const colorHex = e.target.value;

    setSelectedPet((previous) => ({
      ...previous,
      colorHex,
      color: colorHex,
    }));
  };

  const handleEditColorNameChange = (e) => {
    const color = e.target.value;

    setSelectedPet((previous) => ({
      ...previous,
      color,
    }));
  };

  const handleUpdatePet = (e) => {
    e.preventDefault();

    if (!selectedPet) return;

    setPets((previousPets) =>
      previousPets.map((pet) =>
        pet.id === selectedPet.id ? selectedPet : pet
      )
    );

    handleCloseEdit();
  };

  const handleDeletePet = (pet) => {
    setPetToDelete(pet);
    setShowDeleteModal(true);
  };

  const cancelDeletePet = () => {
    setShowDeleteModal(false);
    setPetToDelete(null);
  };

  const confirmDeletePet = () => {
    if (!petToDelete) return;

    setPets((previousPets) =>
      previousPets.filter((pet) => pet.id !== petToDelete.id)
    );

    setShowDeleteModal(false);
    setPetToDelete(null);
  };

  const ModalTabs = ({ activeTab, onChange }) => (
    <div className="pet-modal-tabs">
      <button
        type="button"
        className={`pet-modal-tab ${
          activeTab === "basic" ? "active" : ""
        }`}
        onClick={() => onChange("basic")}
      >
        <FaPaw />
        Basic Info
      </button>

      <button
        type="button"
        className={`pet-modal-tab ${
          activeTab === "health" ? "active" : ""
        }`}
        onClick={() => onChange("health")}
      >
        <FaHeart />
        Health
      </button>

      <button
        type="button"
        className={`pet-modal-tab ${
          activeTab === "identification" ? "active" : ""
        }`}
        onClick={() => onChange("identification")}
      >
        <FaIdCard />
        Identification
      </button>

      <button
        type="button"
        className={`pet-modal-tab ${
          activeTab === "photo" ? "active" : ""
        }`}
        onClick={() => onChange("photo")}
      >
        <FaCamera />
        Photo & Notes
      </button>
    </div>
  );
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        {/* =================================================
            HEADER — SAME LAYOUT AS MEDICAL RECORDS
        ================================================= */}

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "20px",
            marginBottom: "28px",
          }}
        >
          <div>
            <h1 style={{ margin: "0 0 5px" }}>Pets</h1>

            <p
              style={{
                margin: 0,
                color: "#718181",
              }}
            >
              Manage registered pets
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={handleExport}
              style={{
                height: "42px",
                padding: "0 18px",
                border: "1px solid #55b7b2",
                borderRadius: "8px",
                background: "#ffffff",
                color: "#159f9f",
                fontWeight: "700",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                cursor: "pointer",
              }}
            >
              <FaFileExport />
              Export
            </button>

            <button
              type="button"
              onClick={handleOpenAdd}
              style={{
                height: "42px",
                padding: "0 18px",
                border: "1px solid #159f9f",
                borderRadius: "8px",
                background: "#159f9f",
                color: "#ffffff",
                fontWeight: "700",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              + Add Pet
            </button>
          </div>
        </div>

        {/* =================================================
            SEARCH + FILTERS
            SAME STRUCTURE / SPACING AS MEDICAL RECORDS
        ================================================= */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            width: "100%",
            marginBottom: "24px",
          }}
        >
          {/* SEARCH */}

          <div
            style={{
              position: "relative",
              flex: "1 1 auto",
              minWidth: 0,
            }}
          >
            <FaSearch
              style={{
                position: "absolute",
                left: "15px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#829391",
                fontSize: "14px",
                pointerEvents: "none",
              }}
            />

            <input
              type="text"
              value={search}
              placeholder="Search pets..."
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: "100%",
                height: "46px",
                boxSizing: "border-box",
                padding: search
                  ? "0 43px 0 42px"
                  : "0 14px 0 42px",
                border: "1px solid #c9dddd",
                borderRadius: "8px",
                background: "#ffffff",
                color: "#405252",
                fontSize: "14px",
                outline: "none",
              }}
            />

            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "30px",
                  height: "30px",
                  padding: 0,
                  border: "none",
                  background: "transparent",
                  color: "#829391",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title="Clear search"
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* SPECIES */}

          <select
            value={speciesFilter}
            onChange={(e) => {
              setSpeciesFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: "190px",
              height: "46px",
              padding: "0 34px 0 13px",
              border: "1px solid #c9dddd",
              borderRadius: "8px",
              background: "#ffffff",
              color: "#455757",
              fontSize: "14px",
              outline: "none",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <option value="all">All Species</option>

            {PET_SPECIES.map((species) => (
              <option key={species} value={species}>
                {species}
              </option>
            ))}
          </select>

          {/* SORT */}

          <div
            style={{
              position: "relative",
              width: "180px",
              flexShrink: 0,
            }}
          >
            <FaSortAmountDown
              style={{
                position: "absolute",
                left: "13px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#829391",
                fontSize: "14px",
                pointerEvents: "none",
                zIndex: 1,
              }}
            />

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: "100%",
                height: "46px",
                padding: "0 32px 0 38px",
                border: "1px solid #c9dddd",
                borderRadius: "8px",
                background: "#ffffff",
                color: "#455757",
                fontSize: "14px",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="default">Sort By</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="owner-asc">Owner A-Z</option>
              <option value="owner-desc">Owner Z-A</option>
              <option value="species-asc">Species A-Z</option>
              <option value="species-desc">Species Z-A</option>
              <option value="age-low">Age Low-High</option>
              <option value="age-high">Age High-Low</option>
            </select>
          </div>
        </div>

        {/* =================================================
            TABLE — SAME CARD STYLE AS MEDICAL RECORDS
        ================================================= */}

        <div className="owners-table-container">
          <table className="owners-table">
            <thead>
              <tr>
                <th>Pet Name</th>
                <th>Owner</th>
                <th>Species</th>
                <th>Breed</th>
                <th>Age</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {currentPets.length > 0 ? (
                currentPets.map((pet) => (
                  <tr key={pet.id}>
                    <td>{pet.name}</td>

                    <td>{pet.owner}</td>

                    <td>{pet.species}</td>

                    <td>{pet.breed}</td>

                    <td>{pet.age}</td>

                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="view-button icon-button"
                          onClick={() => handleViewPet(pet)}
                          title="View Pet"
                        >
                          <FaEye />
                        </button>

                        <button
                          type="button"
                          className="edit-button icon-button"
                          onClick={() => handleOpenEdit(pet)}
                          title="Edit Pet"
                        >
                          <FaPen />
                        </button>

                        <button
                          type="button"
                          className="delete-button icon-button"
                          onClick={() => handleDeletePet(pet)}
                          title="Delete Pet"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="no-results"
                    style={{
                      textAlign: "center",
                      padding: "35px",
                      color: "#718181",
                    }}
                  >
                    No pets found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* =================================================
            PAGINATION — OUTSIDE CARD LIKE MEDICAL RECORDS
        ================================================= */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "15px",
            marginTop: "18px",
            flexWrap: "wrap",
          }}
        >
          {/* ROWS PER PAGE — LEFT */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              color: "#617472",
            }}
          >
            <span>Rows per page:</span>

            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                height: "34px",
                padding: "0 28px 0 10px",
                border: "1px solid #c9dddd",
                borderRadius: "7px",
                background: "#ffffff",
                color: "#455757",
                fontSize: "13px",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* PAGINATION — RIGHT */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "6px",
            }}
          >
            {/* PREVIOUS */}

            <button
              type="button"
              onClick={() =>
                setCurrentPage((previous) =>
                  Math.max(1, previous - 1)
                )
              }
              disabled={safeCurrentPage === 1}
              style={{
                width: "34px",
                height: "34px",
                padding: 0,
                border: "1px solid #c9dddd",
                borderRadius: "7px",
                background:
                  safeCurrentPage === 1
                    ? "#f4f7f7"
                    : "#ffffff",
                color:
                  safeCurrentPage === 1
                    ? "#b6c0c0"
                    : "#526666",
                fontSize: "18px",
                lineHeight: 1,
                cursor:
                  safeCurrentPage === 1
                    ? "not-allowed"
                    : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              &lt;
            </button>

            {/* CURRENT PAGE */}

            <button
              type="button"
              style={{
                width: "34px",
                height: "34px",
                padding: 0,
                border: "1px solid #159f9f",
                borderRadius: "7px",
                background: "#159f9f",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "default",
              }}
            >
              {safeCurrentPage}
            </button>

            {/* NEXT */}

            <button
              type="button"
              onClick={() =>
                setCurrentPage((previous) =>
                  Math.min(totalPages, previous + 1)
                )
              }
              disabled={safeCurrentPage === totalPages}
              style={{
                width: "34px",
                height: "34px",
                padding: 0,
                border: "1px solid #c9dddd",
                borderRadius: "7px",
                background:
                  safeCurrentPage === totalPages
                    ? "#f4f7f7"
                    : "#ffffff",
                color:
                  safeCurrentPage === totalPages
                    ? "#b6c0c0"
                    : "#526666",
                fontSize: "18px",
                lineHeight: 1,
                cursor:
                  safeCurrentPage === totalPages
                    ? "not-allowed"
                    : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              &gt;
            </button>
          </div>
        </div>

        {/* =================================================
            ADD PET MODAL
        ================================================= */}

        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal-container pet-form-modal">
              <div className="modal-header">
                <div>
                  <h2>Add Pet</h2>
                  <p>Register a new pet profile</p>
                </div>

                <button
                  type="button"
                  className="modal-close"
                  onClick={handleCloseAdd}
                >
                  ×
                </button>
              </div>

              <ModalTabs
                activeTab={addTab}
                onChange={setAddTab}
              />

              <form
                className="pet-tab-form"
                onSubmit={handleAddPet}
              >
                <div className="pet-tab-content">
                  {addTab === "basic" && (
                    <div className="pet-tab-panel">
                      <div className="pet-form-grid">
                        <div className="form-field">
                          <label>Pet Name *</label>

                          <input
                            type="text"
                            name="name"
                            value={newPet.name}
                            onChange={handleNewPetChange}
                            placeholder="Enter pet name"
                            required
                          />
                        </div>

                        <div className="form-field">
                          <label>Owner Name *</label>

                          <input
                            type="text"
                            name="owner"
                            value={newPet.owner}
                            onChange={handleNewPetChange}
                            placeholder="Enter owner name"
                            required
                          />
                        </div>

                        <div className="form-field">
                          <label>Species *</label>

                          <select
                            name="species"
                            value={newPet.species}
                            onChange={handleNewPetChange}
                            required
                          >
                            <option value="">
                              Select species
                            </option>

                            {PET_SPECIES.map((species) => (
                              <option
                                key={species}
                                value={species}
                              >
                                {species}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-field">
                          <label>Breed *</label>

                          <select
                            name="breed"
                            value={newPet.breed}
                            onChange={handleNewPetChange}
                            disabled={!newPet.species}
                            required
                          >
                            <option value="">
                              {newPet.species
                                ? "Select breed"
                                : "Select species first"}
                            </option>

                            {newPetBreeds.map((breed) => (
                              <option
                                key={breed}
                                value={breed}
                              >
                                {breed}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-field">
                          <label>Sex</label>

                          <select
                            name="sex"
                            value={newPet.sex}
                            onChange={handleNewPetChange}
                          >
                            <option value="">
                              Select sex
                            </option>
                            <option value="Female">
                              Female
                            </option>
                            <option value="Male">
                              Male
                            </option>
                          </select>
                        </div>

                        <div className="form-field">
                          <label>Weight (kg)</label>

                          <input
                            type="number"
                            name="weight"
                            value={newPet.weight}
                            onChange={handleNewPetChange}
                            min="0"
                            step="0.01"
                            placeholder="Enter weight"
                          />
                        </div>

                        <div className="form-field">
                          <label>Date of Birth</label>

                          <input
                            type="date"
                            name="dateOfBirth"
                            value={newPet.dateOfBirth}
                            onChange={handleNewPetChange}
                          />

                          {newPet.estimatedDOB && (
                            <span className="pet-field-hint">
                              Estimated from age. You can
                              replace it with the exact date.
                            </span>
                          )}
                        </div>

                        <div className="form-field">
                          <label>Age</label>

                          <input
                            type="text"
                            name="age"
                            value={newPet.age}
                            onChange={handleNewPetChange}
                            placeholder="Example: 4 years"
                          />

                          <span className="pet-field-hint">
                            Entering age automatically sets an
                            estimated 01/01/YYYY birth date.
                          </span>
                        </div>

                        <div className="form-field pet-full-field">
                          <label>Color</label>

                          <div className="pet-color-picker-row">
                            <input
                              className="pet-color-picker"
                              type="color"
                              value={newPet.colorHex}
                              onChange={
                                handleNewPetColorChange
                              }
                            />

                            <input
                              type="text"
                              name="color"
                              value={newPet.color}
                              onChange={
                                handleNewPetColorNameChange
                              }
                              placeholder="Example: Golden, Black & White, Cream"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {addTab === "health" && (
                    <div className="pet-tab-panel">
                      <div className="pet-form-grid">
                        <div className="form-field">
                          <label>Blood Type</label>

                          <input
                            type="text"
                            name="bloodType"
                            value={newPet.bloodType}
                            onChange={handleNewPetChange}
                            placeholder="Enter blood type"
                          />
                        </div>

                        <div className="form-field">
                          <label>Allergies</label>

                          <textarea
                            name="allergies"
                            value={newPet.allergies}
                            onChange={handleNewPetChange}
                            placeholder="Enter allergies"
                            rows="5"
                          />
                        </div>

                        <div className="form-field pet-full-field">
                          <label>
                            Chronic Conditions
                          </label>

                          <textarea
                            name="chronicConditions"
                            value={newPet.chronicConditions}
                            onChange={handleNewPetChange}
                            placeholder="Enter chronic conditions"
                            rows="5"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {addTab === "identification" && (
                    <div className="pet-tab-panel">
                      <div className="pet-form-grid">
                        <div className="form-field pet-full-field">
                          <label>
                            Microchip Number
                          </label>

                          <input
                            type="text"
                            name="microchipNumber"
                            value={newPet.microchipNumber}
                            onChange={handleNewPetChange}
                            placeholder="Enter microchip number"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {addTab === "photo" && (
                    <div className="pet-tab-panel">
                      <div className="pet-form-grid">
                        <div className="form-field">
                          <label>Profile Photo</label>

                          <label className="pet-photo-upload">
                            {newPet.profilePhoto ? (
                              <img
                                src={newPet.profilePhoto}
                                alt="Pet preview"
                              />
                            ) : (
                              <>
                                <FaCamera />

                                <strong>
                                  Choose Pet Photo
                                </strong>

                                <span>
                                  Click to upload an image
                                </span>
                              </>
                            )}

                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleNewPetPhoto}
                            />
                          </label>
                        </div>

                        <div className="form-field">
                          <label>Notes</label>

                          <textarea
                            name="notes"
                            value={newPet.notes}
                            onChange={handleNewPetChange}
                            placeholder="Enter notes"
                            rows="8"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pet-modal-footer">
                  <button
                    type="button"
                    className="modal-cancel-button"
                    onClick={handleCloseAdd}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="save-button"
                    value="save"
                  >
                    Save Pet
                  </button>

                  <button
                    type="submit"
                    className="save-button"
                    value="save-and-book-appointment"
                  >
                    Save & Book Appointment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PART 3 CONTINUES HERE */}
                {/* =================================================
            EDIT PET MODAL
        ================================================= */}

{showEditModal && selectedPet && (
          <div className="modal-overlay">
            <div className="modal-container pet-form-modal">
              <div className="modal-header">
                <div>
                  <h2>Edit Pet</h2>
                  <p>
                    Update {selectedPet.name}'s information
                  </p>
                </div>

                <button
                  type="button"
                  className="modal-close"
                  onClick={handleCloseEdit}
                >
                  ×
                </button>
              </div>

              <ModalTabs
                activeTab={editTab}
                onChange={setEditTab}
              />

              <form
                className="pet-tab-form"
                onSubmit={handleUpdatePet}
              >
                <div className="pet-tab-content">
                  {/* =======================================
                      BASIC INFO
                  ======================================= */}

                  {editTab === "basic" && (
                    <div className="pet-tab-panel">
                      <div className="pet-form-grid">
                        <div className="form-field">
                          <label>Pet Name *</label>

                          <input
                            type="text"
                            name="name"
                            value={selectedPet.name || ""}
                            onChange={handleEditChange}
                            required
                          />
                        </div>

                        <div className="form-field">
                          <label>Owner Name *</label>

                          <input
                            type="text"
                            name="owner"
                            value={selectedPet.owner || ""}
                            onChange={handleEditChange}
                            required
                          />
                        </div>

                        <div className="form-field">
                          <label>Species *</label>

                          <select
                            name="species"
                            value={selectedPet.species || ""}
                            onChange={handleEditChange}
                            required
                          >
                            <option value="">
                              Select species
                            </option>

                            {PET_SPECIES.map((species) => (
                              <option
                                key={species}
                                value={species}
                              >
                                {species}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-field">
                          <label>Breed *</label>

                          <select
                            name="breed"
                            value={selectedPet.breed || ""}
                            onChange={handleEditChange}
                            disabled={!selectedPet.species}
                            required
                          >
                            <option value="">
                              {selectedPet.species
                                ? "Select breed"
                                : "Select species first"}
                            </option>

                            {editPetBreeds.map((breed) => (
                              <option
                                key={breed}
                                value={breed}
                              >
                                {breed}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-field">
                          <label>Sex</label>

                          <select
                            name="sex"
                            value={selectedPet.sex || ""}
                            onChange={handleEditChange}
                          >
                            <option value="">
                              Select sex
                            </option>

                            <option value="Female">
                              Female
                            </option>

                            <option value="Male">
                              Male
                            </option>
                          </select>
                        </div>

                        <div className="form-field">
                          <label>Weight (kg)</label>

                          <input
                            type="number"
                            name="weight"
                            value={selectedPet.weight || ""}
                            onChange={handleEditChange}
                            min="0"
                            step="0.01"
                          />
                        </div>

                        <div className="form-field">
                          <label>Date of Birth</label>

                          <input
                            type="date"
                            name="dateOfBirth"
                            value={
                              selectedPet.dateOfBirth || ""
                            }
                            onChange={handleEditChange}
                          />

                          {selectedPet.estimatedDOB && (
                            <span className="pet-field-hint">
                              Estimated from age. Change it
                              if the exact birthday is known.
                            </span>
                          )}
                        </div>

                        <div className="form-field">
                          <label>Age</label>

                          <input
                            type="text"
                            name="age"
                            value={selectedPet.age || ""}
                            onChange={handleEditChange}
                            placeholder="Example: 4 years"
                          />

                          <span className="pet-field-hint">
                            Changing age automatically sets an
                            estimated 01/01/YYYY birth date.
                          </span>
                        </div>

                        <div className="form-field pet-full-field">
                          <label>Color</label>

                          <div className="pet-color-picker-row">
                            <input
                              className="pet-color-picker"
                              type="color"
                              value={
                                selectedPet.colorHex ||
                                "#55b7b2"
                              }
                              onChange={handleEditColorChange}
                            />

                            <input
                              type="text"
                              value={selectedPet.color || ""}
                              onChange={
                                handleEditColorNameChange
                              }
                              placeholder="Example: Golden, Black & White, Cream"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* =======================================
                      HEALTH
                  ======================================= */}

                  {editTab === "health" && (
                    <div className="pet-tab-panel">
                      <div className="pet-form-grid">
                        <div className="form-field">
                          <label>Blood Type</label>

                          <input
                            type="text"
                            name="bloodType"
                            value={
                              selectedPet.bloodType || ""
                            }
                            onChange={handleEditChange}
                            placeholder="Enter blood type"
                          />
                        </div>

                        <div className="form-field">
                          <label>Allergies</label>

                          <textarea
                            name="allergies"
                            value={
                              selectedPet.allergies || ""
                            }
                            onChange={handleEditChange}
                            placeholder="Enter allergies"
                            rows="5"
                          />
                        </div>

                        <div className="form-field pet-full-field">
                          <label>
                            Chronic Conditions
                          </label>

                          <textarea
                            name="chronicConditions"
                            value={
                              selectedPet.chronicConditions ||
                              ""
                            }
                            onChange={handleEditChange}
                            placeholder="Enter chronic conditions"
                            rows="5"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* =======================================
                      IDENTIFICATION
                  ======================================= */}

                  {editTab === "identification" && (
                    <div className="pet-tab-panel">
                      <div className="pet-form-grid">
                        <div className="form-field pet-full-field">
                          <label>
                            Microchip Number
                          </label>

                          <input
                            type="text"
                            name="microchipNumber"
                            value={
                              selectedPet.microchipNumber ||
                              ""
                            }
                            onChange={handleEditChange}
                            placeholder="Enter microchip number"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* =======================================
                      PHOTO & NOTES
                  ======================================= */}

                  {editTab === "photo" && (
                    <div className="pet-tab-panel">
                      <div className="pet-form-grid">
                        <div className="form-field">
                          <label>Profile Photo</label>

                          <label className="pet-photo-upload">
                            {selectedPet.profilePhoto ? (
                              <img
                                src={
                                  selectedPet.profilePhoto
                                }
                                alt="Pet preview"
                              />
                            ) : (
                              <>
                                <FaCamera />

                                <strong>
                                  Choose Pet Photo
                                </strong>

                                <span>
                                  Click to upload an image
                                </span>
                              </>
                            )}

                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleEditPetPhoto}
                            />
                          </label>
                        </div>

                        <div className="form-field">
                          <label>Notes</label>

                          <textarea
                            name="notes"
                            value={selectedPet.notes || ""}
                            onChange={handleEditChange}
                            placeholder="Enter notes"
                            rows="8"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* =========================================
                    EDIT FOOTER
                ========================================= */}

                <div className="pet-modal-footer">
                  <button
                    type="button"
                    className="modal-cancel-button"
                    onClick={handleCloseEdit}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="save-button"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =================================================
            DELETE PET MODAL
        ================================================= */}

        {showDeleteModal && petToDelete && (
          <div className="modal-overlay">
            <div className="modal-container pet-delete-modal">
              <div className="modal-header">
                <div>
                  <h2>Delete Pet</h2>
                  <p>This action cannot be undone</p>
                </div>

                <button
                  type="button"
                  className="modal-close"
                  onClick={cancelDeletePet}
                >
                  ×
                </button>
              </div>

              <div className="pet-delete-body">
                <p>
                  Are you sure you want to delete{" "}
                  <strong>{petToDelete.name}</strong>?
                </p>

                <span>
                  The pet profile will be permanently
                  deleted.
                </span>
              </div>

              <div className="pet-modal-footer">
                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={cancelDeletePet}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="pets-delete-confirm"
                  onClick={confirmDeletePet}
                >
                  <FaTrash />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            PET MODAL CSS
            PAGE LAYOUT USES MEDICAL RECORDS CLASSES
        ================================================= */}

        <style>{`
          .pet-delete-modal {
            max-width: 450px !important;
            padding: 0 !important;
            overflow: hidden !important;
          }

          .pet-delete-body {
            padding: 28px 32px;
          }

          .pet-delete-body p {
            margin: 0 0 8px;
            color: #2e3c3c;
            font-size: 15px;
          }

          .pet-delete-body span {
            color: #788888;
            font-size: 13px;
          }

          /* Keep the Pets table exactly inside the same
             container used by Medical Records */

          .owners-table-container {
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            overflow: hidden;
          }

          .owners-table {
            width: 100%;
            max-width: 100%;
            table-layout: fixed;
          }

          .owners-table th,
          .owners-table td {
            box-sizing: border-box;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .owners-table th:nth-child(1),
          .owners-table td:nth-child(1) {
            width: 15%;
          }

          .owners-table th:nth-child(2),
          .owners-table td:nth-child(2) {
            width: 19%;
          }

          .owners-table th:nth-child(3),
          .owners-table td:nth-child(3) {
            width: 13%;
          }

          .owners-table th:nth-child(4),
          .owners-table td:nth-child(4) {
            width: 22%;
          }

          .owners-table th:nth-child(5),
          .owners-table td:nth-child(5) {
            width: 12%;
          }

          .owners-table th:nth-child(6),
          .owners-table td:nth-child(6) {
            width: 19%;
          }

          .owners-table .table-actions {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            gap: 8px;
            overflow: visible;
          }

          .owners-table .table-actions .icon-button {
            flex: 0 0 auto;
          }

          ${getPetModalCSS()}
        `}</style>
      </main>
    </div>
  );
}

/* =========================================================
   PET MODAL CSS
========================================================= */

function getPetModalCSS() {
  return `
    .pet-form-modal {
      width: min(820px, calc(100vw - 32px)) !important;
      max-width: 820px !important;
      max-height: 90vh !important;
      padding: 0 !important;
      overflow: hidden !important;
      background: #ffffff !important;
      border-radius: 16px !important;

      display: flex !important;
      flex-direction: column !important;

      box-shadow:
        0 24px 65px rgba(24, 56, 56, 0.22) !important;
    }

    .pet-form-modal > .modal-header,
    .pet-delete-modal > .modal-header {
      flex: 0 0 auto !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 22px 30px !important;
      box-sizing: border-box !important;

      background: #55b7b2 !important;
      color: #ffffff !important;

      border: none !important;
      border-radius: 16px 16px 0 0 !important;

      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 20px !important;
    }

    .pet-form-modal > .modal-header h2,
    .pet-delete-modal > .modal-header h2 {
      margin: 0 !important;
      color: #ffffff !important;

      font-size: 25px !important;
      line-height: 1.2 !important;
      font-weight: 800 !important;
    }

    .pet-form-modal > .modal-header p,
    .pet-delete-modal > .modal-header p {
      margin: 5px 0 0 !important;

      color: rgba(255, 255, 255, 0.9) !important;

      font-size: 13px !important;
    }

    .pet-form-modal .modal-close,
    .pet-delete-modal .modal-close {
      width: 42px !important;
      min-width: 42px !important;
      height: 42px !important;

      padding: 0 !important;
      margin: 0 !important;

      border: 0 !important;
      border-radius: 50% !important;

      background: #ffffff !important;
      color: #4f6b6b !important;

      font-size: 24px !important;
      line-height: 1 !important;

      display: flex !important;
      align-items: center !important;
      justify-content: center !important;

      cursor: pointer !important;
    }

    .pet-modal-tabs {
      flex: 0 0 auto;

      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;

      padding: 16px 24px;

      background: #f7fbfb;
      border-bottom: 1px solid #e1ebeb;
    }

    .pet-modal-tab {
      min-height: 44px;

      border: 1px solid #dce7e7;
      border-radius: 9px;

      background: #ffffff;
      color: #617575;

      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;

      padding: 8px 10px;

      font-family: inherit;
      font-size: 13px;
      font-weight: 700;

      cursor: pointer;
      transition: 0.18s ease;
    }

    .pet-modal-tab:hover {
      border-color: #55b7b2;
      color: #159f9f;
    }

    .pet-modal-tab.active {
      background: #159f9f;
      border-color: #159f9f;
      color: #ffffff;

      box-shadow:
        0 4px 12px rgba(21, 159, 159, 0.18);
    }

    .pet-tab-form {
      min-height: 0 !important;
      flex: 1 1 auto !important;

      padding: 0 !important;
      margin: 0 !important;

      overflow: hidden !important;

      display: flex !important;
      flex-direction: column !important;
    }

    .pet-tab-content {
      flex: 1 1 auto;
      min-height: 0;

      overflow-y: auto;
      overflow-x: hidden;

      padding: 24px 30px;

      background: #ffffff;
      box-sizing: border-box;
    }

    .pet-tab-content::-webkit-scrollbar {
      width: 7px;
    }

    .pet-tab-content::-webkit-scrollbar-track {
      background: #eef6f5;
    }

    .pet-tab-content::-webkit-scrollbar-thumb {
      background: #55b7b2;
      border-radius: 10px;
    }

    .pet-tab-panel {
      width: 100%;
    }

    .pet-form-grid {
      display: grid;
      grid-template-columns:
        repeat(2, minmax(0, 1fr));

      gap: 20px 24px;

      width: 100%;
    }

    .pet-form-grid .form-field {
      min-width: 0;

      margin: 0 !important;

      display: flex;
      flex-direction: column;
      gap: 7px;
    }

    .pet-form-grid .form-field label {
      margin: 0 !important;
      padding: 0 !important;

      color: #3b4d4d;

      font-size: 13px;
      font-weight: 700;
      line-height: 1.35;
    }

    .pet-form-grid
      input:not([type="color"]):not([type="file"]),
    .pet-form-grid select,
    .pet-form-grid textarea {
      width: 100% !important;

      box-sizing: border-box !important;

      border: 1px solid #d8e2e2 !important;
      border-radius: 8px !important;

      background: #ffffff !important;
      color: #2d3d3d !important;

      font-family: inherit !important;
      font-size: 14px !important;

      outline: none !important;

      transition: 0.15s ease !important;
    }

    .pet-form-grid
      input:not([type="color"]):not([type="file"]),
    .pet-form-grid select {
      min-height: 44px !important;
      height: 44px !important;

      padding: 0 12px !important;
    }

    .pet-form-grid textarea {
      min-height: 110px !important;

      padding: 11px 12px !important;

      resize: vertical !important;
    }

    .pet-form-grid input:focus,
    .pet-form-grid select:focus,
    .pet-form-grid textarea:focus {
      border-color: #55b7b2 !important;

      box-shadow:
        0 0 0 3px rgba(85, 183, 178, 0.12) !important;
    }

    .pet-form-grid select:disabled {
      background: #f4f7f7 !important;
      color: #9ba8a8 !important;

      cursor: not-allowed;
    }

    .pet-full-field {
      grid-column: 1 / -1;
    }

    .pet-field-hint {
      display: block;

      color: #849393;

      font-size: 11px;
      line-height: 1.45;

      margin-top: 1px;
    }

    .pet-color-picker-row {
      display: grid;
      grid-template-columns: 58px 1fr;
      gap: 10px;

      align-items: center;
    }

    .pet-color-picker {
      width: 58px !important;
      height: 44px !important;
      min-height: 44px !important;

      padding: 4px !important;

      border: 1px solid #d8e2e2 !important;
      border-radius: 8px !important;

      background: #ffffff !important;

      cursor: pointer;

      box-sizing: border-box;
    }
    .pet-photo-upload {
      min-height: 190px;

      border: 2px dashed #cfe0df !important;
      border-radius: 12px;

      background: #f9fcfc;
      color: #6f8181 !important;

      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;

      gap: 8px !important;

      cursor: pointer;

      overflow: hidden;

      padding: 15px !important;

      box-sizing: border-box;

      text-align: center;
    }

    .pet-photo-upload svg {
      color: #55b7b2;
      font-size: 29px;
    }

    .pet-photo-upload strong {
      color: #405656;
      font-size: 14px;
    }

    .pet-photo-upload span {
      color: #899898;
      font-size: 11px;
    }

    .pet-photo-upload img {
      width: 100%;
      height: 190px;

      border-radius: 9px;

      object-fit: cover;
    }

    .pet-photo-upload input {
      display: none !important;
    }

    .pet-modal-footer {
      flex: 0 0 auto;

      padding: 16px 30px;

      border-top: 1px solid #e4ecec;

      background: #ffffff;

      display: flex;
      justify-content: flex-end;
      align-items: center;

      gap: 10px;

      flex-wrap: wrap;

      box-sizing: border-box;
    }

    .pet-modal-footer .modal-cancel-button,
    .pet-modal-footer .save-button,
    .pet-modal-footer .pets-delete-confirm {
      width: auto !important;
      min-width: 105px;

      min-height: 42px;
      height: 42px;

      padding: 0 17px !important;

      border-radius: 8px !important;

      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;

      gap: 7px !important;

      font-family: inherit !important;
      font-size: 13px !important;
      font-weight: 700 !important;

      cursor: pointer !important;
    }

    .pet-modal-footer .modal-cancel-button {
      border: 1px solid #d6e0e0 !important;

      background: #ffffff !important;
      color: #607272 !important;
    }

    .pet-modal-footer .modal-cancel-button:hover {
      background: #f5f9f9 !important;
    }

    .pet-modal-footer .save-button {
      border: 1px solid #159f9f !important;

      background: #159f9f !important;
      color: #ffffff !important;
    }

    .pet-modal-footer .save-button:hover {
      background: #128e8e !important;
      border-color: #128e8e !important;
    }

    .pet-modal-footer .pets-delete-confirm {
      border: 1px solid #d94b4b !important;

      background: #d94b4b !important;
      color: #ffffff !important;
    }

    .pet-modal-footer .pets-delete-confirm:hover {
      background: #c53f3f !important;
      border-color: #c53f3f !important;
    }

    /* =====================================================
       DELETE MODAL
    ===================================================== */

    .pet-delete-modal {
      width: min(450px, calc(100vw - 32px)) !important;
      max-width: 450px !important;

      padding: 0 !important;

      overflow: hidden !important;

      background: #ffffff !important;

      border-radius: 16px !important;

      box-shadow:
        0 24px 65px rgba(24, 56, 56, 0.22) !important;
    }

    /* =====================================================
       RESPONSIVE MODAL
    ===================================================== */

    @media (max-width: 720px) {
      .pet-modal-tabs {
        grid-template-columns: repeat(2, 1fr);

        padding: 12px 15px;
      }

      .pet-form-grid {
        grid-template-columns: 1fr;
      }

      .pet-full-field {
        grid-column: auto;
      }

      .pet-tab-content {
        padding: 20px 18px;
      }

      .pet-modal-footer {
        padding: 14px 18px;
      }

      .pet-form-modal > .modal-header,
      .pet-delete-modal > .modal-header {
        padding: 19px 20px !important;
      }
    }
  `;
}

export default Pets;