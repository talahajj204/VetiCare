import { useState } from "react";
import Sidebar from "../components/Sidebar";

import {
  FaEye,
  FaPen,
  FaTrash,
  FaSortAmountDown,
  FaSearch,
  FaTimes,
  FaFileExport,
} from "react-icons/fa";

function Pets() {
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

  // SEARCH / FILTER / SORT
  const [search, setSearch] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  // PAGINATION
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // MODALS
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);

  // DELETE MODAL
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);

  // ADD PET FORM
  const [newPet, setNewPet] = useState({
    name: "",
    owner: "",
    species: "Dog",
    breed: "",
    age: "",
  });

  // FILTER
  const filteredPets = pets.filter((pet) => {
    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      pet.name.toLowerCase().includes(searchText) ||
      pet.owner.toLowerCase().includes(searchText) ||
      pet.species.toLowerCase().includes(searchText) ||
      pet.breed.toLowerCase().includes(searchText) ||
      pet.age.toLowerCase().includes(searchText);

    const matchesSpecies =
      speciesFilter === "all" || pet.species === speciesFilter;

    return matchesSearch && matchesSpecies;
  });

  // SORT
  const sortedPets = [...filteredPets].sort((a, b) => {
    if (sortBy === "name-asc") return a.name.localeCompare(b.name);
    if (sortBy === "name-desc") return b.name.localeCompare(a.name);
    if (sortBy === "owner-asc") return a.owner.localeCompare(b.owner);
    if (sortBy === "owner-desc") return b.owner.localeCompare(a.owner);

    if (sortBy === "species-asc")
      return a.species.localeCompare(b.species);

    if (sortBy === "species-desc")
      return b.species.localeCompare(a.species);

    if (sortBy === "age-low")
      return parseFloat(a.age) - parseFloat(b.age);

    if (sortBy === "age-high")
      return parseFloat(b.age) - parseFloat(a.age);

    return a.id - b.id;
  });

  // PAGINATION
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

  // CLEAR FILTERS
  const handleClearFilters = () => {
    setSearch("");
    setSpeciesFilter("all");
    setSortBy("default");
    setCurrentPage(1);
  };

  // EXPORT
  const handleExport = () => {
    const headers = [
      "Pet Name",
      "Owner",
      "Species",
      "Breed",
      "Age",
    ];

    const rows = sortedPets.map((pet) => [
      pet.name,
      pet.owner,
      pet.species,
      pet.breed,
      pet.age,
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

  // ADD PET INPUT
  const handleNewPetChange = (e) => {
    const { name, value } = e.target;

    setNewPet({
      ...newPet,
      [name]: value,
    });
  };

  // ADD PET
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
      species: "Dog",
      breed: "",
      age: "",
    });

    setShowAddModal(false);
  };

  // VIEW
  const handleViewPet = (pet) => {
    setSelectedPet(pet);
    setShowViewModal(true);
  };

  // EDIT
  const handleOpenEdit = (pet) => {
    setSelectedPet({ ...pet });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setSelectedPet({
      ...selectedPet,
      [name]: value,
    });
  };

  const handleUpdatePet = (e) => {
    e.preventDefault();

    setPets(
      pets.map((pet) =>
        pet.id === selectedPet.id ? selectedPet : pet
      )
    );

    setShowEditModal(false);
    setSelectedPet(null);
  };

  // DELETE
  const handleDeletePet = (pet) => {
    setPetToDelete(pet);
    setShowDeleteModal(true);
  };

  const confirmDeletePet = () => {
    if (!petToDelete) return;

    setPets(
      pets.filter((pet) => pet.id !== petToDelete.id)
    );

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
              onClick={() => setShowAddModal(true)}
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
                          title="View"
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

      {/* ADD PET MODAL */}
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

      {/* VIEW PET MODAL */}
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

      {/* EDIT PET MODAL */}
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

              <div className="form-row">
                <div className="form-field">
                  <label>Species</label>

                  <select
                    name="species"
                    value={selectedPet.species}
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
                    value={selectedPet.breed}
                    onChange={handleEditChange}
                    required
                  />
                </div>
              </div>

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

      {/* DELETE POPUP */}
      {showDeleteModal && petToDelete && (
        <div className="modal-overlay">
          <div
            className="modal-container"
            style={{ maxWidth: "420px" }}
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

            <div style={{ padding: "10px 0 5px" }}>
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