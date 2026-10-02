import { useEffect, useState } from "react";
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
  FaArrowLeft,
  FaSyringe,
} from "react-icons/fa";

function Pets() {
  const location = useLocation();
  const navigate = useNavigate();

  // =====================================================
  // DATA
  // =====================================================

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
      breed: "Love Birds",
      age: "2 years",

      sex: "Female",
      dateOfBirth: "2024-03-18",
      color: "Green",
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

  // =====================================================
  // SEARCH / FILTER / SORT
  // =====================================================

  const [search, setSearch] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  // =====================================================
  // PAGINATION
  // =====================================================

  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // =====================================================
  // MODALS
  // =====================================================

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedPet, setSelectedPet] = useState(null);

  // =====================================================
  // PET PROFILE PAGE
  // =====================================================

  const [profilePet, setProfilePet] = useState(null);

  // =====================================================
  // DELETE MODAL
  // =====================================================

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);

  // =====================================================
  // EMPTY PET
  // =====================================================

  const getEmptyPet = () => ({
    name: "",
    owner: "",
    species: "Dog",
    breed: "",
    age: "",

    sex: "",
    dateOfBirth: "",
    color: "",
    weight: "",
    microchipNumber: "",
    bloodType: "",
    allergies: "",
    chronicConditions: "",
    notes: "",
    profilePhoto: "",

    timeline: [],
  });

  // =====================================================
  // ADD PET FORM
  // =====================================================

  const [newPet, setNewPet] = useState(getEmptyPet());

  // =====================================================
  // OWNER -> PET WORKFLOW
  // =====================================================

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

    setShowAddModal(true);

    navigate(location.pathname, {
      replace: true,
      state: null,
    });
  }, [location.state, location.pathname, navigate]);

  // =====================================================
  // FILTER
  // =====================================================

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

  // =====================================================
  // SORT
  // =====================================================

  const sortedPets = [...filteredPets].sort((a, b) => {
    if (sortBy === "name-asc") {
      return a.name.localeCompare(b.name);
    }

    if (sortBy === "name-desc") {
      return b.name.localeCompare(a.name);
    }

    if (sortBy === "owner-asc") {
      return a.owner.localeCompare(b.owner);
    }

    if (sortBy === "owner-desc") {
      return b.owner.localeCompare(a.owner);
    }

    if (sortBy === "species-asc") {
      return a.species.localeCompare(b.species);
    }

    if (sortBy === "species-desc") {
      return b.species.localeCompare(a.species);
    }

    if (sortBy === "age-low") {
      return parseFloat(a.age) - parseFloat(b.age);
    }

    if (sortBy === "age-high") {
      return parseFloat(b.age) - parseFloat(a.age);
    }

    return a.id - b.id;
  });

  // =====================================================
  // PAGINATION
  // =====================================================

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

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const handleClearFilters = () => {
    setSearch("");
    setSpeciesFilter("all");
    setSortBy("default");
    setCurrentPage(1);
  };

  // =====================================================
  // EXPORT
  // =====================================================

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

  // =====================================================
  // ADD PET INPUT
  // =====================================================

  const handleNewPetChange = (e) => {
    const { name, value } = e.target;

    setNewPet((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // PROFILE PHOTO
  // =====================================================

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

  // =====================================================
  // ADD PET
  // =====================================================

  const handleAddPet = (e) => {
    e.preventDefault();

    const action = e.nativeEvent.submitter?.value;

    const pet = {
      id: Date.now(),
      ...newPet,
      timeline: newPet.timeline || [],
    };

    setPets((previousPets) => [...previousPets, pet]);

    setNewPet(getEmptyPet());
    setShowAddModal(false);

    // SAVE & BOOK APPOINTMENT

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

  // =====================================================
  // VIEW PET PROFILE PAGE
  // =====================================================

  const handleViewPet = (pet) => {
    setProfilePet(pet);
  };

  const handleBackToPets = () => {
    setProfilePet(null);
  };

  // =====================================================
  // NEW: RECORD VACCINATION FROM PET PROFILE
  // =====================================================

  const handleRecordVaccination = (pet) => {
    if (!pet) return;

    navigate("/vaccinations", {
      state: {
        openAddVaccination: true,
        fromPetProfile: true,

        petId: pet.id,
        pet: pet.name,
        petName: pet.name,

        owner: pet.owner,
        ownerName: pet.owner,

        petData: pet,
      },
    });
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleOpenEdit = (pet) => {
    setSelectedPet({ ...pet });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setSelectedPet((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleUpdatePet = (e) => {
    e.preventDefault();

    setPets((previousPets) =>
      previousPets.map((pet) =>
        pet.id === selectedPet.id ? selectedPet : pet
      )
    );

    if (profilePet?.id === selectedPet.id) {
      setProfilePet(selectedPet);
    }

    setShowEditModal(false);
    setSelectedPet(null);
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDeletePet = (pet) => {
    setPetToDelete(pet);
    setShowDeleteModal(true);
  };

  const confirmDeletePet = () => {
    if (!petToDelete) return;

    setPets((previousPets) =>
      previousPets.filter((pet) => pet.id !== petToDelete.id)
    );

    if (profilePet?.id === petToDelete.id) {
      setProfilePet(null);
    }

    if (currentPets.length === 1 && safeCurrentPage > 1) {
      setCurrentPage(safeCurrentPage - 1);
    }

    setShowDeleteModal(false);
    setPetToDelete(null);
  };

  const cancelDeletePet = () => {
    setShowDeleteModal(false);
    setPetToDelete(null);
  };

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "—";

    const [year, month, day] = date.split("-");

    if (!year || !month || !day) return date;

    return `${day}/${month}/${year}`;
  };

  // =====================================================
  // PET PROFILE PAGE
  // =====================================================

  if (profilePet) {
    return (
      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-main pets-page">
          <style>{`
            .pet-profile-top {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 15px;
              flex-wrap: wrap;
              margin-bottom: 20px;
            }

            .pet-profile-back {
              width: auto !important;
              min-width: 0 !important;
              height: 34px !important;
              padding: 0 12px !important;
              display: inline-flex !important;
              align-items: center !important;
              justify-content: center !important;
              gap: 6px !important;
              border: 1px solid #d4e4e3 !important;
              border-radius: 7px !important;
              background: #ffffff !important;
              color: #536564 !important;
              font-size: 12px !important;
              font-weight: 600 !important;
              cursor: pointer !important;
            }

            .pet-profile-actions {
              display: flex;
              align-items: center;
              justify-content: flex-end;
              gap: 8px;
              flex-wrap: wrap;
            }

            .pet-profile-small-button {
              width: auto !important;
              min-width: 0 !important;
              max-width: none !important;
              height: 34px !important;
              min-height: 34px !important;
              max-height: 34px !important;
              padding: 0 12px !important;
              display: inline-flex !important;
              align-items: center !important;
              justify-content: center !important;
              gap: 6px !important;
              border-radius: 7px !important;
              font-family: inherit !important;
              font-size: 12px !important;
              font-weight: 600 !important;
              line-height: 1 !important;
              white-space: nowrap !important;
              cursor: pointer !important;
              box-sizing: border-box !important;
            }

            .pet-profile-edit-button {
              background: #ffffff !important;
              color: #536564 !important;
              border: 1px solid #d4e4e3 !important;
            }

            .pet-profile-vaccine-button {
              background: #55b7b3 !important;
              color: #ffffff !important;
              border: 1px solid #55b7b3 !important;
            }

            .pet-profile-vaccine-button:hover {
              background: #319c97 !important;
              border-color: #319c97 !important;
            }

            .pet-profile-card {
              background: #ffffff;
              border: 1px solid #e3eceb;
              border-radius: 12px;
              padding: 20px;
              margin-bottom: 18px;
            }

            .pet-profile-main {
              display: flex;
              align-items: center;
              gap: 20px;
              margin-bottom: 22px;
            }

            .pet-profile-photo {
              width: 95px;
              height: 95px;
              border-radius: 50%;
              object-fit: cover;
              border: 3px solid #e0f1ef;
              background: #edf6f5;
            }

            .pet-profile-photo-placeholder {
              width: 95px;
              height: 95px;
              min-width: 95px;
              border-radius: 50%;
              background: #e1f2f0;
              color: #3da6a1;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 34px;
              font-weight: 700;
            }

            .pet-profile-name h1 {
              margin: 0 0 5px;
            }

            .pet-profile-name p {
              margin: 0;
              color: #718181;
            }

            .pet-profile-grid {
              display: grid;
              grid-template-columns: repeat(3, minmax(0, 1fr));
              gap: 14px;
            }

            .pet-profile-field {
              border: 1px solid #e5eeee;
              border-radius: 9px;
              padding: 12px;
              background: #fbfdfd;
            }

            .pet-profile-field span {
              display: block;
              color: #81908f;
              font-size: 11px;
              margin-bottom: 5px;
              text-transform: uppercase;
              font-weight: 600;
            }

            .pet-profile-field strong {
              color: #344746;
              font-size: 14px;
              word-break: break-word;
            }

            .pet-profile-section-title {
              margin: 0 0 15px;
              font-size: 18px;
              color: #344746;
            }

            .pet-timeline {
              position: relative;
            }

            .pet-timeline-item {
              display: flex;
              gap: 13px;
              padding: 12px 0;
              border-bottom: 1px solid #edf2f2;
            }

            .pet-timeline-item:last-child {
              border-bottom: none;
            }

            .pet-timeline-dot {
              width: 10px;
              height: 10px;
              min-width: 10px;
              margin-top: 6px;
              border-radius: 50%;
              background: #55b7b3;
            }

            .pet-timeline-content {
              flex: 1;
            }

            .pet-timeline-heading {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 10px;
              margin-bottom: 4px;
            }

            .pet-timeline-heading strong {
              color: #344746;
            }

            .pet-timeline-heading span {
              color: #829190;
              font-size: 12px;
            }

            .pet-timeline-type {
              display: inline-block;
              margin-bottom: 5px;
              font-size: 11px;
              font-weight: 700;
              color: #329c97;
            }

            .pet-timeline-content p {
              margin: 0;
              color: #667776;
              font-size: 13px;
            }

            @media (max-width: 900px) {
              .pet-profile-grid {
                grid-template-columns: repeat(2, minmax(0, 1fr));
              }
            }

            @media (max-width: 600px) {
              .pet-profile-grid {
                grid-template-columns: 1fr;
              }

              .pet-profile-main {
                align-items: flex-start;
              }
            }
          `}</style>

          <div className="pet-profile-top">
            <button
              type="button"
              className="pet-profile-back"
              onClick={handleBackToPets}
            >
              <FaArrowLeft />
              Back to Pets
            </button>

            <div className="pet-profile-actions">
              <button
                type="button"
                className="pet-profile-small-button pet-profile-edit-button"
                onClick={() => handleOpenEdit(profilePet)}
              >
                <FaPen />
                Edit Pet
              </button>

              <button
                type="button"
                className="pet-profile-small-button pet-profile-vaccine-button"
                onClick={() => handleRecordVaccination(profilePet)}
              >
                <FaSyringe />
                Record Vaccination
              </button>
            </div>
          </div>

          <div className="pet-profile-card">
            <div className="pet-profile-main">
              {profilePet.profilePhoto ? (
                <img
                  src={profilePet.profilePhoto}
                  alt={profilePet.name}
                  className="pet-profile-photo"
                />
              ) : (
                <div className="pet-profile-photo-placeholder">
                  {profilePet.name?.charAt(0)?.toUpperCase() || "P"}
                </div>
              )}

              <div className="pet-profile-name">
                <h1>{profilePet.name}</h1>

                <p>
                  {profilePet.species} • {profilePet.breed}
                </p>
              </div>
            </div>

            <div className="pet-profile-grid">
              <div className="pet-profile-field">
                <span>Owner</span>
                <strong>{profilePet.owner || "—"}</strong>
              </div>

              <div className="pet-profile-field">
                <span>Sex</span>
                <strong>{profilePet.sex || "—"}</strong>
              </div>

              <div className="pet-profile-field">
                <span>Date of Birth</span>
                <strong>
                  {profilePet.dateOfBirth
                    ? formatDate(profilePet.dateOfBirth)
                    : "—"}
                </strong>
              </div>

              <div className="pet-profile-field">
                <span>Age</span>
                <strong>{profilePet.age || "—"}</strong>
              </div>

              <div className="pet-profile-field">
                <span>Color</span>
                <strong>{profilePet.color || "—"}</strong>
              </div>

              <div className="pet-profile-field">
                <span>Weight</span>
                <strong>
                  {profilePet.weight
                    ? `${profilePet.weight} kg`
                    : "—"}
                </strong>
              </div>

              <div className="pet-profile-field">
                <span>Microchip Number</span>
                <strong>
                  {profilePet.microchipNumber || "—"}
                </strong>
              </div>

              <div className="pet-profile-field">
                <span>Blood Type</span>
                <strong>{profilePet.bloodType || "—"}</strong>
              </div>

              <div className="pet-profile-field">
                <span>Allergies</span>
                <strong>{profilePet.allergies || "—"}</strong>
              </div>

              <div className="pet-profile-field">
                <span>Chronic Conditions</span>
                <strong>
                  {profilePet.chronicConditions || "—"}
                </strong>
              </div>

              <div
                className="pet-profile-field"
                style={{
                  gridColumn: "1 / -1",
                }}
              >
                <span>Notes</span>
                <strong>{profilePet.notes || "—"}</strong>
              </div>
            </div>
          </div>

          <div className="pet-profile-card">
            <h2 className="pet-profile-section-title">
              Pet Timeline
            </h2>

            <div className="pet-timeline">
              {profilePet.timeline?.length > 0 ? (
                [...profilePet.timeline]
                  .sort(
                    (a, b) =>
                      new Date(b.date) - new Date(a.date)
                  )
                  .map((item) => (
                    <div
                      className="pet-timeline-item"
                      key={item.id}
                    >
                      <div className="pet-timeline-dot" />

                      <div className="pet-timeline-content">
                        <span className="pet-timeline-type">
                          {item.type}
                        </span>

                        <div className="pet-timeline-heading">
                          <strong>{item.title}</strong>

                          <span>{formatDate(item.date)}</span>
                        </div>

                        <p>{item.description}</p>
                      </div>
                    </div>
                  ))
              ) : (
                <p
                  style={{
                    color: "#718181",
                    margin: 0,
                  }}
                >
                  No visits, vaccinations, medications,
                  prescriptions, or reminders recorded yet.
                </p>
              )}
            </div>
          </div>

          {/* EDIT PET MODAL FROM PROFILE */}

          {showEditModal && selectedPet && (
            <div className="modal-overlay">
              <div className="modal-container">
                <div className="modal-header">
                  <div>
                    <h2>Edit Pet</h2>
                    <p>Update pet information</p>
                  </div>

                  <button
                    type="button"
                    className="modal-close"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedPet(null);
                    }}
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleUpdatePet}>
                  <div className="form-row">
                    <div className="form-field">
                      <label>Pet Name</label>

                      <input
                        type="text"
                        name="name"
                        value={selectedPet.name || ""}
                        onChange={handleEditChange}
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label>Owner Name</label>

                      <input
                        type="text"
                        name="owner"
                        value={selectedPet.owner || ""}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label>Species</label>

                      <select
                        name="species"
                        value={selectedPet.species || "Dog"}
                        onChange={handleEditChange}
                        required
                      >
                        <option value="Dog">Dog</option>
                        <option value="Cat">Cat</option>
                        <option value="Bird">Bird</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Breed</label>

                      <input
                        type="text"
                        name="breed"
                        value={selectedPet.breed || ""}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label>Age</label>

                      <input
                        type="text"
                        name="age"
                        value={selectedPet.age || ""}
                        onChange={handleEditChange}
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label>Sex</label>

                      <select
                        name="sex"
                        value={selectedPet.sex || ""}
                        onChange={handleEditChange}
                      >
                        <option value="">Select sex</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label>Date of Birth</label>

                      <input
                        type="date"
                        name="dateOfBirth"
                        value={selectedPet.dateOfBirth || ""}
                        onChange={handleEditChange}
                      />
                    </div>

                    <div className="form-field">
                      <label>Color</label>

                      <input
                        type="text"
                        name="color"
                        value={selectedPet.color || ""}
                        onChange={handleEditChange}
                      />
                    </div>
                  </div>

                  <div className="form-row">
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
                      <label>Microchip Number</label>

                      <input
                        type="text"
                        name="microchipNumber"
                        value={selectedPet.microchipNumber || ""}
                        onChange={handleEditChange}
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Blood Type</label>

                    <input
                      type="text"
                      name="bloodType"
                      value={selectedPet.bloodType || ""}
                      onChange={handleEditChange}
                    />
                  </div>

                  <div className="form-field">
                    <label>Allergies</label>

                    <textarea
                      name="allergies"
                      value={selectedPet.allergies || ""}
                      onChange={handleEditChange}
                      rows="2"
                    />
                  </div>

                  <div className="form-field">
                    <label>Chronic Conditions</label>

                    <textarea
                      name="chronicConditions"
                      value={selectedPet.chronicConditions || ""}
                      onChange={handleEditChange}
                      rows="2"
                    />
                  </div>

                  <div className="form-field">
                    <label>Notes</label>

                    <textarea
                      name="notes"
                      value={selectedPet.notes || ""}
                      onChange={handleEditChange}
                      rows="2"
                    />
                  </div>

                  <div className="form-field">
                    <label>Profile Photo</label>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditPetPhoto}
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="modal-cancel-button"
                      onClick={() => {
                        setShowEditModal(false);
                        setSelectedPet(null);
                      }}
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
        </main>
      </div>
    );
  }

  // =====================================================
  // MAIN PETS LIST PAGE
  // =====================================================

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main pets-page">
        {/* HEADER */}

        <div className="page-header pets-page-header">
          <div className="pets-title-area">
            <h1>Pets</h1>
            <p>Manage registered pets</p>
          </div>

          <div className="pets-header-actions">
            <button
              type="button"
              onClick={handleExport}
              className="pets-export-button"
            >
              <FaFileExport />
              <span>Export</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setNewPet(getEmptyPet());
                setShowAddModal(true);
              }}
              className="pets-add-button"
            >
              + Add Pet
            </button>
          </div>
        </div>

        {/* SEARCH + FILTERS */}

        <div className="pets-toolbar">
          <div className="pets-search-box">
            <FaSearch className="pets-search-icon" />

            <input
              type="text"
              placeholder="Search pets..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />

            {(search ||
              speciesFilter !== "all" ||
              sortBy !== "default") && (
              <button
                type="button"
                onClick={handleClearFilters}
                title="Clear filters"
                aria-label="Clear filters"
                className="pets-clear-button"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <select
            className="pets-filter-select"
            value={speciesFilter}
            onChange={(e) => {
              setSpeciesFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Species</option>
            <option value="Dog">Dog</option>
            <option value="Cat">Cat</option>
            <option value="Bird">Bird</option>
            <option value="Other">Other</option>
          </select>

          <div className="pets-sort-box">
            <FaSortAmountDown />

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="default">Sort By</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="owner-asc">Owner A-Z</option>
              <option value="owner-desc">Owner Z-A</option>
              <option value="species-asc">Species A-Z</option>
              <option value="species-desc">Species Z-A</option>
              <option value="age-low">Age: Low to High</option>
              <option value="age-high">Age: High to Low</option>
            </select>
          </div>
        </div>

        {/* TABLE */}

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
                          title="View Pet Profile"
                        >
                          <FaEye />
                        </button>

                        <button
                          type="button"
                          className="edit-button icon-button"
                          onClick={() => handleOpenEdit(pet)}
                          title="Edit"
                        >
                          <FaPen />
                        </button>

                        <button
                          type="button"
                          className="delete-button icon-button"
                          onClick={() => handleDeletePet(pet)}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-results">
                    No pets found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}

        <div className="pets-pagination">
          <div className="pets-rows-per-page">
            <span>Rows per page:</span>

            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="pets-page-controls">
            <button
              type="button"
              disabled={safeCurrentPage === 1}
              onClick={() =>
                setCurrentPage((page) =>
                  Math.max(page - 1, 1)
                )
              }
              className="pets-pagination-button"
              aria-label="Previous page"
            >
              &lt;
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`pets-page-number ${
                  page === safeCurrentPage ? "active" : ""
                }`}
                style={
                  page === safeCurrentPage
                    ? {
                        backgroundColor: "#159f9f",
                        borderColor: "#159f9f",
                        color: "#ffffff",
                      }
                    : undefined
                }
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              disabled={safeCurrentPage === totalPages}
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(page + 1, totalPages)
                )
              }
              className="pets-pagination-button"
              aria-label="Next page"
            >
              &gt;
            </button>
          </div>
        </div>
      </main>

      {/* =====================================================
          ADD PET MODAL
      ===================================================== */}

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div>
                <h2>Add Pet</h2>
                <p>Enter pet information</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddPet}>
              <div className="form-row">
                <div className="form-field">
                  <label>Pet Name</label>

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
                  <label>Owner Name</label>

                  <input
                    type="text"
                    name="owner"
                    value={newPet.owner}
                    onChange={handleNewPetChange}
                    placeholder="Enter owner name"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Species</label>

                  <select
                    name="species"
                    value={newPet.species}
                    onChange={handleNewPetChange}
                    required
                  >
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Breed</label>

                  <input
                    type="text"
                    name="breed"
                    value={newPet.breed}
                    onChange={handleNewPetChange}
                    placeholder="Enter breed"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Age</label>

                  <input
                    type="text"
                    name="age"
                    value={newPet.age}
                    onChange={handleNewPetChange}
                    placeholder="Example: 4 years"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Sex</label>

                  <select
                    name="sex"
                    value={newPet.sex}
                    onChange={handleNewPetChange}
                  >
                    <option value="">Select sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Date of Birth</label>

                  <input
                    type="date"
                    name="dateOfBirth"
                    value={newPet.dateOfBirth}
                    onChange={handleNewPetChange}
                  />
                </div>

                <div className="form-field">
                  <label>Color</label>

                  <input
                    type="text"
                    name="color"
                    value={newPet.color}
                    onChange={handleNewPetChange}
                    placeholder="Enter color"
                  />
                </div>
              </div>

              <div className="form-row">
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
                  <label>Microchip Number</label>

                  <input
                    type="text"
                    name="microchipNumber"
                    value={newPet.microchipNumber}
                    onChange={handleNewPetChange}
                    placeholder="Enter microchip number"
                  />
                </div>
              </div>

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
                  rows="2"
                />
              </div>

              <div className="form-field">
                <label>Chronic Conditions</label>

                <textarea
                  name="chronicConditions"
                  value={newPet.chronicConditions}
                  onChange={handleNewPetChange}
                  placeholder="Enter chronic conditions"
                  rows="2"
                />
              </div>

              <div className="form-field">
                <label>Notes</label>

                <textarea
                  name="notes"
                  value={newPet.notes}
                  onChange={handleNewPetChange}
                  placeholder="Enter notes"
                  rows="2"
                />
              </div>

              <div className="form-field">
                <label>Profile Photo</label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleNewPetPhoto}
                />
              </div>

              {/* WORKFLOW BUTTONS */}

              <div
                className="form-actions"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                  value="save-pet"
                >
                  Add Pet
                </button>

                <button
                  type="submit"
                  className="save-button"
                  value="save-and-book-appointment"
                  style={{
                    width: "auto",
                    padding: "10px 18px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Save & Book Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          EDIT PET MODAL
      ===================================================== */}

      {showEditModal && selectedPet && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div>
                <h2>Edit Pet</h2>
                <p>Update pet information</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedPet(null);
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdatePet}>
              <div className="form-row">
                <div className="form-field">
                  <label>Pet Name</label>

                  <input
                    type="text"
                    name="name"
                    value={selectedPet.name || ""}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Owner Name</label>

                  <input
                    type="text"
                    name="owner"
                    value={selectedPet.owner || ""}
                    onChange={handleEditChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Species</label>

                  <select
                    name="species"
                    value={selectedPet.species || "Dog"}
                    onChange={handleEditChange}
                    required
                  >
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Breed</label>

                  <input
                    type="text"
                    name="breed"
                    value={selectedPet.breed || ""}
                    onChange={handleEditChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Age</label>

                  <input
                    type="text"
                    name="age"
                    value={selectedPet.age || ""}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Sex</label>

                  <select
                    name="sex"
                    value={selectedPet.sex || ""}
                    onChange={handleEditChange}
                  >
                    <option value="">Select sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Date of Birth</label>

                  <input
                    type="date"
                    name="dateOfBirth"
                    value={selectedPet.dateOfBirth || ""}
                    onChange={handleEditChange}
                  />
                </div>

                <div className="form-field">
                  <label>Color</label>

                  <input
                    type="text"
                    name="color"
                    value={selectedPet.color || ""}
                    onChange={handleEditChange}
                  />
                </div>
              </div>

              <div className="form-row">
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
                  <label>Microchip Number</label>

                  <input
                    type="text"
                    name="microchipNumber"
                    value={selectedPet.microchipNumber || ""}
                    onChange={handleEditChange}
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Blood Type</label>

                <input
                  type="text"
                  name="bloodType"
                  value={selectedPet.bloodType || ""}
                  onChange={handleEditChange}
                />
              </div>

              <div className="form-field">
                <label>Allergies</label>

                <textarea
                  name="allergies"
                  value={selectedPet.allergies || ""}
                  onChange={handleEditChange}
                  rows="2"
                />
              </div>

              <div className="form-field">
                <label>Chronic Conditions</label>

                <textarea
                  name="chronicConditions"
                  value={selectedPet.chronicConditions || ""}
                  onChange={handleEditChange}
                  rows="2"
                />
              </div>

              <div className="form-field">
                <label>Notes</label>

                <textarea
                  name="notes"
                  value={selectedPet.notes || ""}
                  onChange={handleEditChange}
                  rows="2"
                />
              </div>

              <div className="form-field">
                <label>Profile Photo</label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditPetPhoto}
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedPet(null);
                  }}
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

      {/* =====================================================
          DELETE POPUP
      ===================================================== */}

      {showDeleteModal && petToDelete && (
        <div className="modal-overlay">
          <div
            className="modal-container"
            style={{
              maxWidth: "420px",
            }}
          >
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

            <div
              style={{
                padding: "10px 0 5px",
              }}
            >
              <p
                style={{
                  fontSize: "16px",
                  color: "#333333",
                  marginBottom: "8px",
                }}
              >
                Are you sure you want to delete this?
              </p>

              <p
                style={{
                  fontSize: "14px",
                  color: "#718181",
                }}
              >
                {petToDelete.name} will be permanently deleted.
              </p>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="modal-cancel-button"
                onClick={cancelDeletePet}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeletePet}
                className="pets-delete-confirm"
              >
                <FaTrash />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pets;