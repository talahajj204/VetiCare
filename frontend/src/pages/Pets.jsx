import { useState } from "react";
import Sidebar from "../components/Sidebar";

import {
  FaEye,
  FaPen,
  FaTrash,
  FaSortAmountDown,
} from "react-icons/fa";

function Pets() {
  // =========================
  // PETS DATA
  // =========================

  const [pets, setPets] = useState([
    {
      id: 1,
      name: "Bella",
      owner: "Tala El Hajj",
      species: "Dog",
      breed: "Golden Retriever",
      age: "4 years",
    },
    {
      id: 2,
      name: "Luna",
      owner: "Fatima Abbas",
      species: "Bird",
      breed: "Love Birds",
      age: "2 years",
    },
  ]);

  // =========================
  // SEARCH + SORT
  // =========================

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");

  // =========================
  // MODALS
  // =========================

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedPet, setSelectedPet] = useState(null);

  // =========================
  // ADD PET FORM
  // =========================

  const [newPet, setNewPet] = useState({
    name: "",
    owner: "",
    species: "",
    breed: "",
    age: "",
  });

  // =========================
  // SEARCH FILTER
  // =========================

  const filteredPets = pets.filter((pet) => {
    const searchText = search.trim().toLowerCase();

    return (
      pet.name.toLowerCase().includes(searchText) ||
      pet.owner.toLowerCase().includes(searchText) ||
      pet.species.toLowerCase().includes(searchText) ||
      pet.breed.toLowerCase().includes(searchText) ||
      pet.age.toLowerCase().includes(searchText)
    );
  });

  // =========================
  // SORT
  // =========================

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

  // =========================
  // ADD INPUT CHANGE
  // =========================

  const handleNewPetChange = (e) => {
    const { name, value } = e.target;

    setNewPet({
      ...newPet,
      [name]: value,
    });
  };

  // =========================
  // ADD PET
  // =========================

  const handleAddPet = (e) => {
    e.preventDefault();

    const pet = {
      id: Date.now(),
      ...newPet,
    };

    setPets([...pets, pet]);

    setNewPet({
      name: "",
      owner: "",
      species: "",
      breed: "",
      age: "",
    });

    setShowAddModal(false);
  };

  // =========================
  // VIEW PET
  // =========================

  const handleViewPet = (pet) => {
    setSelectedPet(pet);
    setShowViewModal(true);
  };

  // =========================
  // OPEN EDIT
  // =========================

  const handleOpenEdit = (pet) => {
    setSelectedPet({ ...pet });
    setShowEditModal(true);
  };

  // =========================
  // EDIT INPUT CHANGE
  // =========================

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setSelectedPet({
      ...selectedPet,
      [name]: value,
    });
  };

  // =========================
  // UPDATE PET
  // =========================

  const handleUpdatePet = (e) => {
    e.preventDefault();

    setPets(
      pets.map((pet) =>
        pet.id === selectedPet.id
          ? selectedPet
          : pet
      )
    );

    setShowEditModal(false);
    setSelectedPet(null);
  };

  // =========================
  // DELETE PET
  // =========================

  const handleDeletePet = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this pet?"
    );

    if (confirmDelete) {
      setPets(
        pets.filter((pet) => pet.id !== id)
      );
    }
  };

  return (
    <div className="dashboard-layout">

      <Sidebar />

      <main className="dashboard-main">

        {/* =========================
            HEADER
        ========================= */}

        <div className="page-header">

          <div>
            <h1>Pets</h1>
            <p>Manage registered pets</p>
          </div>

        </div>

        {/* =========================
            SEARCH + SORT + ADD
        ========================= */}

        <div className="inventory-toolbar">

          {/* SEARCH */}

          <div className="search-container inventory-search">

            <input
              type="text"
              placeholder="Search pets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

          </div>

          {/* RIGHT ACTIONS */}

          <div className="inventory-toolbar-actions">

            {/* SORT */}

            <div className="sort-container">

              <FaSortAmountDown className="sort-icon" />

              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >

                <option value="default">
                  Sort By
                </option>

                <option value="name-asc">
                  Name A-Z
                </option>

                <option value="name-desc">
                  Name Z-A
                </option>

                <option value="owner-asc">
                  Owner A-Z
                </option>

                <option value="owner-desc">
                  Owner Z-A
                </option>

                <option value="species-asc">
                  Species A-Z
                </option>

                <option value="species-desc">
                  Species Z-A
                </option>

                <option value="age-low">
                  Age: Low to High
                </option>

                <option value="age-high">
                  Age: High to Low
                </option>

              </select>

            </div>

            {/* ADD PET */}

            <button
              type="button"
              className="add-button"
              onClick={() => setShowAddModal(true)}
            >
              + Add Pet
            </button>

          </div>

        </div>

        {/* =========================
            TABLE
        ========================= */}

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

              {sortedPets.length > 0 ? (

                sortedPets.map((pet) => (

                  <tr key={pet.id}>

                    <td>{pet.name}</td>

                    <td>{pet.owner}</td>

                    <td>{pet.species}</td>

                    <td>{pet.breed}</td>

                    <td>{pet.age}</td>

                    <td>

                      <div className="table-actions">

                        {/* VIEW */}

                        <button
                          type="button"
                          className="view-button icon-button"
                          onClick={() => handleViewPet(pet)}
                          title="View"
                          aria-label="View pet"
                        >
                          <FaEye />
                        </button>

                        {/* EDIT */}

                        <button
                          type="button"
                          className="edit-button icon-button"
                          onClick={() => handleOpenEdit(pet)}
                          title="Edit"
                          aria-label="Edit pet"
                        >
                          <FaPen />
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          className="delete-button icon-button"
                          onClick={() => handleDeletePet(pet.id)}
                          title="Delete"
                          aria-label="Delete pet"
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
                  >
                    No pets found
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </main>

      {/* ==========================================
          ADD PET MODAL
      ========================================== */}

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

              {/* NAME + OWNER */}

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

              {/* SPECIES + BREED */}

              <div className="form-row">

                <div className="form-field">

                  <label>Species</label>

                  <input
                    type="text"
                    name="species"
                    value={newPet.species}
                    onChange={handleNewPetChange}
                    placeholder="Dog, Cat, Bird..."
                    required
                  />

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

              {/* AGE */}

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

              {/* ACTIONS */}

              <div className="form-actions">

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
                >
                  Add Pet
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* ==========================================
          VIEW PET MODAL
      ========================================== */}

      {showViewModal && selectedPet && (

        <div className="modal-overlay">

          <div className="modal-container">

            <div className="modal-header">

              <div>
                <h2>Pet Details</h2>
                <p>View pet information</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedPet(null);
                }}
              >
                ×
              </button>

            </div>

            <div className="detail-row">

              <span>Pet Name</span>
              <strong>{selectedPet.name}</strong>

            </div>

            <div className="detail-row">

              <span>Owner</span>
              <strong>{selectedPet.owner}</strong>

            </div>

            <div className="detail-row">

              <span>Species</span>
              <strong>{selectedPet.species}</strong>

            </div>

            <div className="detail-row">

              <span>Breed</span>
              <strong>{selectedPet.breed}</strong>

            </div>

            <div className="detail-row">

              <span>Age</span>
              <strong>{selectedPet.age}</strong>

            </div>

            <div className="form-actions">

              <button
                type="button"
                className="modal-cancel-button"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedPet(null);
                }}
              >
                Close
              </button>

              <button
                type="button"
                className="edit-button"
                onClick={() => {
                  setShowViewModal(false);
                  setShowEditModal(true);
                }}
              >

                <FaPen />

                <span style={{ marginLeft: "7px" }}>
                  Edit Pet
                </span>

              </button>

            </div>

          </div>

        </div>

      )}

      {/* ==========================================
          EDIT PET MODAL
      ========================================== */}

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

              {/* NAME + OWNER */}

              <div className="form-row">

                <div className="form-field">

                  <label>Pet Name</label>

                  <input
                    type="text"
                    name="name"
                    value={selectedPet.name}
                    onChange={handleEditChange}
                    required
                  />

                </div>

                <div className="form-field">

                  <label>Owner Name</label>

                  <input
                    type="text"
                    name="owner"
                    value={selectedPet.owner}
                    onChange={handleEditChange}
                    required
                  />

                </div>

              </div>

              {/* SPECIES + BREED */}

              <div className="form-row">

                <div className="form-field">

                  <label>Species</label>

                  <input
                    type="text"
                    name="species"
                    value={selectedPet.species}
                    onChange={handleEditChange}
                    required
                  />

                </div>

                <div className="form-field">

                  <label>Breed</label>

                  <input
                    type="text"
                    name="breed"
                    value={selectedPet.breed}
                    onChange={handleEditChange}
                    required
                  />

                </div>

              </div>

              {/* AGE */}

              <div className="form-field">

                <label>Age</label>

                <input
                  type="text"
                  name="age"
                  value={selectedPet.age}
                  onChange={handleEditChange}
                  required
                />

              </div>

              {/* ACTIONS */}

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

    </div>
  );
}

export default Pets;