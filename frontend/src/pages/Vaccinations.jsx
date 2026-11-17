import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getClinicOptions } from "../data/clinicOptionsApi";

import {
  FaEye,
  FaPen,
  FaTrash,
  FaSortAmountDown,
  FaSearch,
  FaTimes,
  FaFileExport,
} from "react-icons/fa";

const VACCINATIONS_API = "/api/vaccinations";

function cleanOptionValues(values) {
  if (!Array.isArray(values)) return [];

  const seen = new Set();

  return values
    .filter((value) => typeof value === "string")
    .map((value) => value.trim())
    .filter((value) => {
      if (!value) return false;

      const key = value.toLowerCase();

      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    });
}

async function readVaccinationOptions(signal) {
  const records = await getClinicOptions({ signal });

  if (
    !Array.isArray(records) ||
    records.some(
      (record) =>
        typeof record.listKey !== "string" ||
        typeof record.value !== "string" ||
        typeof record.isActive !== "boolean" ||
        !Number.isInteger(record.sortOrder)
    )
  ) {
    throw new Error(
      "The server returned invalid vaccination options."
    );
  }

  const valuesFor = (listKey) =>
    cleanOptionValues(
      records
        .filter(
          (record) =>
            record.listKey === listKey &&
            record.isActive
        )
        .sort(
          (a, b) =>
            a.sortOrder - b.sortOrder ||
            a.value.localeCompare(b.value)
        )
        .map((record) => record.value)
    );

  return {
    vaccineNames: valuesFor("vaccination.vaccineNames"),
    statuses: valuesFor("vaccination.statuses"),
  };
}

const getEmptyVaccination = (status = "") => ({
  petId: "",
  pet: "",
  ownerId: "",
  owner: "",
  vaccine: "",
  dateGiven: "",
  nextDueDate: "",
  status,
  notes: "",
});

async function requestVaccinationData(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    cache: "no-store",
    headers: {
      ...(options.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = "Unable to complete the request.";

    if (response.status === 401) {
      message =
        "Your session has expired. Please sign in again.";
    } else if (response.status === 403) {
      message = "You do not have access to these records.";
    } else if (response.status === 404) {
      message = "The requested record was not found.";
    }

    try {
      const problem = await response.json();

      if (
        response.status !== 401 &&
        response.status !== 403
      ) {
        const errors = Object.values(problem.errors || {})
          .flat()
          .filter((value) => typeof value === "string");

        if (errors.length) {
          message = errors.join("\n");
        } else if (typeof problem.detail === "string") {
          message = problem.detail;
        }
      }
    } catch {
      // Keep the default message.
    }

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;

  return response.json();
}

function normalizeVaccination(vaccination) {
  return {
    ...vaccination,
    petId: String(vaccination.petId ?? ""),
    ownerId: String(vaccination.ownerId ?? ""),
    pet: vaccination.pet || "",
    owner: vaccination.owner || "",
    vaccine: vaccination.vaccine || "",
    dateGiven: vaccination.dateGiven || "",
    nextDueDate: vaccination.nextDueDate || "",
    status: vaccination.status || "",
    notes: vaccination.notes || "",
  };
}

function vaccinationPayload(vaccination) {
  return {
    petId: Number(vaccination.petId),
    vaccine: vaccination.vaccine.trim(),
    dateGiven: vaccination.dateGiven || null,
    nextDueDate: vaccination.nextDueDate || null,
    status: vaccination.status.trim(),
    notes: vaccination.notes.trim(),
  };
}

function Vaccinations() {
  const navigate = useNavigate();
  const location = useLocation();

  const [settingsOptions, setSettingsOptions] = useState({
    vaccineNames: [],
    statuses: [],
  });

  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState("");

  const vaccineNames = settingsOptions.vaccineNames;
  const vaccinationStatuses = settingsOptions.statuses;

  const [vaccinations, setVaccinations] = useState([]);
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);
  const visitFlowRef = useRef(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [selectedVaccination, setSelectedVaccination] =
    useState(null);

  const [vaccinationToDelete, setVaccinationToDelete] =
    useState(null);

  const [newVaccination, setNewVaccination] = useState(
    () => getEmptyVaccination()
  );

  useEffect(() => {
    let active = true;
    let controller = null;
    let requestNumber = 0;

    const refreshOptions = async () => {
      const currentRequest = ++requestNumber;

      controller?.abort();
      controller = new AbortController();

      setOptionsLoading(true);

      try {
        const options = await readVaccinationOptions(
          controller.signal
        );

        if (
          !active ||
          currentRequest !== requestNumber
        ) {
          return;
        }

        setSettingsOptions(options);
        setOptionsError("");
      } catch (error) {
        if (
          !active ||
          currentRequest !== requestNumber ||
          error.name === "AbortError"
        ) {
          return;
        }

        setSettingsOptions({
          vaccineNames: [],
          statuses: [],
        });

        setOptionsError(
          error.message ||
            "Unable to load vaccination options."
        );
      } finally {
        if (
          active &&
          currentRequest === requestNumber
        ) {
          setOptionsLoading(false);
        }
      }
    };

    refreshOptions();

    window.addEventListener(
      "clinicOptionsUpdated",
      refreshOptions
    );
    window.addEventListener("focus", refreshOptions);

    return () => {
      active = false;
      controller?.abort();

      window.removeEventListener(
        "clinicOptionsUpdated",
        refreshOptions
      );
      window.removeEventListener("focus", refreshOptions);
    };
  }, [reloadKey]);

  const filterStatuses = useMemo(
    () =>
      cleanOptionValues([
        ...vaccinationStatuses,
        ...vaccinations.map((item) => item.status),
      ]),
    [vaccinationStatuses, vaccinations]
  );

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function load() {
      setIsLoading(true);
      setLoadError("");

      try {
        const [savedVaccinations, savedPets] =
          await Promise.all([
            requestVaccinationData(VACCINATIONS_API, {
              signal: controller.signal,
            }),
            requestVaccinationData("/api/pets", {
              signal: controller.signal,
            }),
          ]);

        if (
          !Array.isArray(savedVaccinations) ||
          !Array.isArray(savedPets)
        ) {
          throw new Error(
            "The server returned invalid records."
          );
        }

        if (!active) return;

        setVaccinations(
          savedVaccinations.map(normalizeVaccination)
        );

        setPets(
          [...savedPets].sort((a, b) =>
            (a.name || "").localeCompare(b.name || "")
          )
        );
      } catch (error) {
        if (!active || error.name === "AbortError") return;

        setLoadError(
          error.message || "Unable to load vaccinations."
        );
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();

    return () => {
      active = false;
      controller.abort();
    };
  }, [reloadKey]);

  useEffect(() => {
    if (
      isLoading ||
      loadError ||
      optionsLoading ||
      !location.state?.openAddVaccination
    ) {
      return;
    }

    const state = location.state;
    const medicalRecord = state.medicalRecord;

    const requestedPetId =
      state.petId ||
      medicalRecord?.petId ||
      (
        typeof state.pet === "object"
          ? state.pet?.id
          : null
      );

    let selectedPet = pets.find(
      (pet) => String(pet.id) === String(requestedPetId)
    );

    if (!selectedPet && !requestedPetId) {
      const petName =
        typeof state.pet === "string"
          ? state.pet
          : medicalRecord?.pet || "";

      const ownerName =
        state.owner || medicalRecord?.owner || "";

      const matches = pets.filter(
        (pet) =>
          pet.name === petName &&
          (!ownerName || pet.owner === ownerName)
      );

      if (matches.length === 1) {
        selectedPet = matches[0];
      }
    }

    visitFlowRef.current = state;

    setNewVaccination({
      ...getEmptyVaccination(
        settingsOptions.statuses[0] || ""
      ),
      petId: selectedPet ? String(selectedPet.id) : "",
      pet: selectedPet?.name || "",
      ownerId: selectedPet
        ? String(selectedPet.ownerId || "")
        : "",
      owner: selectedPet?.owner || "",
      dateGiven: state.date || medicalRecord?.date || "",
    });

    setShowAddModal(true);

    if (optionsError) {
      window.alert(optionsError);
    }

    navigate(location.pathname, {
      replace: true,
      state: null,
    });
  }, [
    isLoading,
    loadError,
    optionsLoading,
    optionsError,
    settingsOptions,
    pets,
    location.state,
    location.pathname,
    navigate,
  ]);

  const filteredVaccinations = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return vaccinations.filter((vaccination) => {
      const matchesSearch = [
        vaccination.pet,
        vaccination.vaccine,
        vaccination.dateGiven,
        vaccination.nextDueDate,
        vaccination.status,
        vaccination.notes,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(searchText)
      );

      const matchesStatus =
        statusFilter === "all" ||
        vaccination.status.toLowerCase() ===
          statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [vaccinations, search, statusFilter]);

  const sortedVaccinations = useMemo(() => {
    return [...filteredVaccinations].sort((a, b) => {
      if (sortBy === "pet-asc") {
        return a.pet.localeCompare(b.pet);
      }

      if (sortBy === "pet-desc") {
        return b.pet.localeCompare(a.pet);
      }

      if (sortBy === "vaccine-asc") {
        return a.vaccine.localeCompare(b.vaccine);
      }

      if (sortBy === "vaccine-desc") {
        return b.vaccine.localeCompare(a.vaccine);
      }

      if (sortBy === "date-newest") {
        return new Date(b.dateGiven) - new Date(a.dateGiven);
      }

      if (sortBy === "date-oldest") {
        return new Date(a.dateGiven) - new Date(b.dateGiven);
      }

      if (sortBy === "due-soonest") {
        return (
          new Date(a.nextDueDate) - new Date(b.nextDueDate)
        );
      }

      if (sortBy === "due-latest") {
        return (
          new Date(b.nextDueDate) - new Date(a.nextDueDate)
        );
      }

      if (sortBy === "status") {
        return a.status.localeCompare(b.status);
      }

      return a.id - b.id;
    });
  }, [filteredVaccinations, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedVaccinations.length / rowsPerPage)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const currentVaccinations = sortedVaccinations.slice(
    startIndex,
    endIndex
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, sortBy, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setSortBy("default");
    setCurrentPage(1);
  };

  const beginSave = () => {
    if (savingRef.current) return false;

    savingRef.current = true;
    setIsSaving(true);
    return true;
  };

  const endSave = () => {
    savingRef.current = false;
    setIsSaving(false);
  };

  const notifyVaccinationsChanged = () => {
    window.dispatchEvent(
      new Event("vetClinicVaccinationsUpdated")
    );
  };

  const handleOpenAdd = () => {
    if (isLoading || loadError || savingRef.current) return;

    if (optionsLoading) {
      window.alert(
        "Vaccination options are loading. Please try again."
      );
      return;
    }

    if (optionsError) {
      window.alert(optionsError);
      return;
    }

    visitFlowRef.current = null;

    setNewVaccination(
      getEmptyVaccination(vaccinationStatuses[0] || "")
    );

    setShowAddModal(true);
  };

  const handleCloseAdd = () => {
    if (savingRef.current) return;

    setShowAddModal(false);
    setNewVaccination(getEmptyVaccination());
    visitFlowRef.current = null;
  };

  const changeVaccinationField = (previous, name, value) => {
    if (!previous) return previous;

    if (name === "petId") {
      const pet = pets.find(
        (item) => String(item.id) === String(value)
      );

      return {
        ...previous,
        petId: pet ? String(pet.id) : "",
        pet: pet?.name || "",
        ownerId: pet ? String(pet.ownerId || "") : "",
        owner: pet?.owner || "",
      };
    }

    return { ...previous, [name]: value };
  };

  const handleNewVaccinationChange = (event) => {
    const { name, value } = event.target;

    setNewVaccination((previous) =>
      changeVaccinationField(previous, name, value)
    );
  };

  const validateVaccination = async (vaccination) => {
    const petId = Number(vaccination.petId);

    if (
      !Number.isInteger(petId) ||
      petId <= 0 ||
      !pets.some((pet) => Number(pet.id) === petId)
    ) {
      throw new Error("Please select a pet.");
    }

    const vaccine = vaccination.vaccine.trim();
    const status = vaccination.status.trim();

    if (!vaccine || vaccine.length > 200) {
      throw new Error(
        "Please select a valid vaccine name."
      );
    }

    if (!status || status.length > 100) {
      throw new Error("Please select a valid status.");
    }

    const latestOptions = await readVaccinationOptions();

    setSettingsOptions(latestOptions);
    setOptionsError("");

    const original = vaccination.id == null
      ? null
      : vaccinations.find(
          (item) =>
            String(item.id) === String(vaccination.id)
        );

    const vaccineAllowed =
      latestOptions.vaccineNames.includes(vaccine) ||
      (
        original &&
        original.vaccine.trim() === vaccine
      );

    const statusAllowed =
      latestOptions.statuses.includes(status) ||
      (
        original &&
        original.status.trim() === status
      );

    if (!vaccineAllowed) {
      throw new Error(
        "Choose a vaccine name saved in Settings."
      );
    }

    if (!statusAllowed) {
      throw new Error(
        "Choose a vaccination status saved in Settings."
      );
    }

    if (!vaccination.dateGiven || !vaccination.nextDueDate) {
      throw new Error(
        "Please complete Date Given and Next Due Date."
      );
    }

    if (vaccination.nextDueDate < vaccination.dateGiven) {
      throw new Error(
        "Next due date cannot be before the date given."
      );
    }

    if (vaccination.notes.trim().length > 4000) {
      throw new Error(
        "Notes must be 4000 characters or fewer."
      );
    }
  };

  const createVaccination = async () => {
    if (!beginSave()) return null;

    try {
      await validateVaccination(newVaccination);

      const response = await requestVaccinationData(
        VACCINATIONS_API,
        {
          method: "POST",
          body: JSON.stringify(
            vaccinationPayload(newVaccination)
          ),
        }
      );

      const savedVaccination =
        normalizeVaccination(response);

      setVaccinations((previous) => [
        ...previous,
        savedVaccination,
      ]);

      setNewVaccination(getEmptyVaccination());
      setShowAddModal(false);
      setCurrentPage(1);
      notifyVaccinationsChanged();

      return savedVaccination;
    } catch (error) {
      window.alert(
        error.message || "Unable to save the vaccination."
      );

      return null;
    } finally {
      endSave();
    }
  };

  const handleAddVaccination = async (event) => {
    event.preventDefault();

    const saved = await createVaccination();

    if (saved) {
      visitFlowRef.current = null;
    }
  };

  const handleSaveAndCreateInvoice = async (event) => {
    const form = event.currentTarget.form;

    if (form && !form.reportValidity()) return;

    const flow = visitFlowRef.current;
    const savedVaccination = await createVaccination();

    if (!savedVaccination) return;

    visitFlowRef.current = null;

    navigate("/billing", {
      state: {
        openAddInvoice: true,
        fromVisitFlow: true,
        petId: Number(savedVaccination.petId),
        ownerId: Number(savedVaccination.ownerId),
        pet: savedVaccination.pet,
        owner: savedVaccination.owner,
        vaccination: savedVaccination,
        medicalRecord: flow?.medicalRecord || null,
        appointment: flow?.appointment || null,
      },
    });
  };

  const handleViewVaccination = (vaccination) => {
    if (savingRef.current) return;

    setSelectedVaccination(vaccination);
    setShowViewModal(true);
  };

  const handleCloseView = () => {
    if (savingRef.current) return;

    setShowViewModal(false);
    setSelectedVaccination(null);
  };

  const handleOpenEdit = (vaccination) => {
    if (savingRef.current) return;

    setSelectedVaccination({ ...vaccination });
    setShowViewModal(false);
    setShowEditModal(true);

    if (optionsError) {
      window.alert(optionsError);
    }
  };

  const handleCloseEdit = () => {
    if (savingRef.current) return;

    setShowEditModal(false);
    setSelectedVaccination(null);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setSelectedVaccination((previous) =>
      changeVaccinationField(previous, name, value)
    );
  };

  const handleUpdateVaccination = async (event) => {
    event.preventDefault();

    if (!selectedVaccination || !beginSave()) return;

    try {
      await validateVaccination(selectedVaccination);

      const response = await requestVaccinationData(
        `${VACCINATIONS_API}/${encodeURIComponent(
          selectedVaccination.id
        )}`,
        {
          method: "PUT",
          body: JSON.stringify(
            vaccinationPayload(selectedVaccination)
          ),
        }
      );

      const saved = normalizeVaccination(response);

      setVaccinations((previous) =>
        previous.map((vaccination) =>
          vaccination.id === saved.id
            ? saved
            : vaccination
        )
      );

      setShowEditModal(false);
      setSelectedVaccination(null);
      notifyVaccinationsChanged();
    } catch (error) {
      window.alert(
        error.message ||
          "Unable to update the vaccination."
      );
    } finally {
      endSave();
    }
  };

  const handleDeleteVaccination = (vaccination) => {
    if (savingRef.current) return;

    setVaccinationToDelete(vaccination);
    setShowDeleteModal(true);
  };

  const confirmDeleteVaccination = async () => {
    if (!vaccinationToDelete || !beginSave()) return;

    try {
      const id = vaccinationToDelete.id;

      await requestVaccinationData(
        `${VACCINATIONS_API}/${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );

      setVaccinations((previous) =>
        previous.filter(
          (vaccination) => vaccination.id !== id
        )
      );

      setVaccinationToDelete(null);
      setShowDeleteModal(false);

      if (selectedVaccination?.id === id) {
        setShowViewModal(false);
        setShowEditModal(false);
        setSelectedVaccination(null);
      }

      notifyVaccinationsChanged();
    } catch (error) {
      window.alert(
        error.message ||
          "Unable to delete the vaccination."
      );
    } finally {
      endSave();
    }
  };

  const cancelDeleteVaccination = () => {
    if (savingRef.current) return;

    setVaccinationToDelete(null);
    setShowDeleteModal(false);
  };

  const handleExport = () => {
    const headers = [
      "Pet",
      "Vaccine",
      "Date Given",
      "Next Due Date",
      "Status",
      "Notes",
    ];

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = sortedVaccinations.map((vaccination) => [
      vaccination.pet,
      vaccination.vaccine,
      vaccination.dateGiven,
      vaccination.nextDueDate,
      vaccination.status,
      vaccination.notes,
    ]);

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map(
        (row) => row.map(escapeCSV).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "vaccinations.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  const formatDate = (date) => {
    if (!date) return "";

    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };

  const getStatusClass = (status) => {
    if (status === "Completed") return "status confirmed";
    if (status === "Due") return "status pending";
    if (status === "Overdue") return "status cancelled";

    return "status";
  };

  const paginationButtonStyle = {
    width: "34px",
    minWidth: "34px",
    maxWidth: "34px",
    height: "34px",
    minHeight: "34px",
    maxHeight: "34px",
    padding: "0",
    margin: "0",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flex: "0 0 34px",
    boxSizing: "border-box",
    border: "1px solid #c9dddd",
    borderRadius: "7px",
    backgroundColor: "#ffffff",
    color: "#455757",
    fontSize: "14px",
    fontWeight: "700",
    lineHeight: "1",
    boxShadow: "none",
    cursor: "pointer",
  };

  const paginationActiveStyle = {
    ...paginationButtonStyle,
    backgroundColor: "#54b7b5",
    borderColor: "#54b7b5",
    color: "#ffffff",
  };

  const paginationDisabledStyle = {
    ...paginationButtonStyle,
    backgroundColor: "#edf3f2",
    borderColor: "#d7e5e3",
    color: "#9aadaa",
    cursor: "not-allowed",
    opacity: 1,
  };  return (
    <div className="dashboard-layout">
      <style>{`
        .vaccination-workflow-actions {
          display: flex !important;
          align-items: center !important;
          justify-content: flex-end !important;
          gap: 8px !important;
          flex-wrap: wrap !important;
          margin-top: 18px !important;
        }

        .modal-container
        .vaccination-workflow-actions
        .vaccination-workflow-button {
          width: auto !important;
          min-width: 0 !important;
          max-width: none !important;
          height: 34px !important;
          min-height: 34px !important;
          max-height: 34px !important;
          padding: 0 12px !important;
          margin: 0 !important;
          flex: 0 0 auto !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          border-radius: 7px !important;
          font-family: inherit !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          line-height: 1 !important;
          white-space: nowrap !important;
          box-sizing: border-box !important;
          cursor: pointer !important;
          box-shadow: none !important;
        }

        .modal-container
        .vaccination-workflow-actions
        .vaccination-workflow-secondary {
          background: #ffffff !important;
          color: #52605f !important;
          border: 1px solid #d5e5e3 !important;
        }

        .modal-container
        .vaccination-workflow-actions
        .vaccination-workflow-secondary:hover {
          background: #f7fbfa !important;
          border-color: #bdd8d5 !important;
        }

        .modal-container
        .vaccination-workflow-actions
        .vaccination-workflow-primary {
          background: #55b7b3 !important;
          color: #ffffff !important;
          border: 1px solid #55b7b3 !important;
        }

        .modal-container
        .vaccination-workflow-actions
        .vaccination-workflow-primary:hover {
          background: #319c97 !important;
          border-color: #319c97 !important;
        }

        .modal-container form
        .vaccination-workflow-actions button {
          width: auto !important;
          min-width: 0 !important;
          height: 34px !important;
          padding-left: 12px !important;
          padding-right: 12px !important;
          flex: 0 0 auto !important;
        }

        .vaccination-options-note {
          margin: 6px 0 0;
          color: #7c8f94;
          font-size: 12px;
          line-height: 1.5;
        }
      `}</style>

      <Sidebar />

      <main className="dashboard-main vaccinations-page">
        <div className="page-header">
          <div>
            <h1>Vaccinations</h1>
            <p>Manage pet vaccination records</p>
          </div>
        </div>

        {isLoading && (
          <p role="status">Loading vaccinations...</p>
        )}

        {loadError && (
          <div role="alert">
            <p style={{ color: "#c0392b" }}>
              {loadError}
            </p>

            <button
              type="button"
              onClick={() =>
                setReloadKey((previous) => previous + 1)
              }
            >
              Try Again
            </button>
          </div>
        )}

        <div className="vaccinations-toolbar">
          <div className="vaccinations-filter-row">
            <div className="vaccinations-search">
              <FaSearch className="vaccinations-search-icon" />

              <input
                type="text"
                placeholder="Search vaccinations..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

              {(search ||
                statusFilter !== "all" ||
                sortBy !== "default") && (
                <button
                  type="button"
                  className="vaccinations-clear-button"
                  onClick={handleClearFilters}
                  title="Clear filters"
                  aria-label="Clear filters"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            <select
              className="vaccinations-filter-select"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="all">All Status</option>

              {filterStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <div className="vaccinations-sort">
              <FaSortAmountDown className="vaccinations-sort-icon" />

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value)
                }
              >
                <option value="default">Sort By</option>
                <option value="pet-asc">Pet A-Z</option>
                <option value="pet-desc">Pet Z-A</option>
                <option value="vaccine-asc">Vaccine A-Z</option>
                <option value="vaccine-desc">Vaccine Z-A</option>

                <option value="date-newest">
                  Date Given: Newest
                </option>

                <option value="date-oldest">
                  Date Given: Oldest
                </option>

                <option value="due-soonest">
                  Next Due: Soonest
                </option>

                <option value="due-latest">
                  Next Due: Latest
                </option>

                <option value="status">Status</option>
              </select>
            </div>
          </div>

          <div className="vaccinations-toolbar-buttons">
            <button
              type="button"
              className="vaccinations-export-button"
              onClick={handleExport}
              disabled={isLoading || Boolean(loadError)}
            >
              <FaFileExport />
              <span>Export</span>
            </button>

            <button
              type="button"
              className="add-button"
              onClick={handleOpenAdd}
              disabled={
                isLoading || Boolean(loadError) || isSaving
              }
            >
              + Add Vaccination
            </button>
          </div>
        </div>

        <div className="owners-table-container">
          <table className="owners-table">
            <thead>
              <tr>
                <th>Pet</th>
                <th>Vaccine</th>
                <th>Date Given</th>
                <th>Next Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading || loadError ? (
                <tr>
                  <td colSpan="6" className="no-results">
                    {isLoading
                      ? "Loading vaccinations..."
                      : "Unable to load vaccinations."}
                  </td>
                </tr>
              ) : currentVaccinations.length > 0 ? (
                currentVaccinations.map((vaccination) => (
                  <tr key={vaccination.id}>
                    <td>{vaccination.pet}</td>
                    <td>{vaccination.vaccine}</td>

                    <td>
                      {formatDate(vaccination.dateGiven)}
                    </td>

                    <td>
                      {formatDate(vaccination.nextDueDate)}
                    </td>

                    <td>
                      <span
                        className={getStatusClass(
                          vaccination.status
                        )}
                      >
                        {vaccination.status}
                      </span>
                    </td>

                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="view-button icon-button"
                          onClick={() =>
                            handleViewVaccination(vaccination)
                          }
                          title="View"
                          disabled={isSaving}
                        >
                          <FaEye />
                        </button>

                        <button
                          type="button"
                          className="edit-button icon-button"
                          onClick={() =>
                            handleOpenEdit(vaccination)
                          }
                          title="Edit"
                          disabled={isSaving}
                        >
                          <FaPen />
                        </button>

                        <button
                          type="button"
                          className="delete-button icon-button"
                          onClick={() =>
                            handleDeleteVaccination(vaccination)
                          }
                          title="Delete"
                          disabled={isSaving}
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
                    No vaccinations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="vaccinations-pagination">
          <div className="vaccinations-page-size">
            <span>Rows per page:</span>

            <select
              value={rowsPerPage}
              onChange={(event) =>
                setRowsPerPage(Number(event.target.value))
              }
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div
            className="vaccinations-page-controls"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "6px",
            }}
          >
            <button
              type="button"
              disabled={safeCurrentPage === 1}
              onClick={() =>
                setCurrentPage((page) =>
                  Math.max(page - 1, 1)
                )
              }
              style={
                safeCurrentPage === 1
                  ? paginationDisabledStyle
                  : paginationButtonStyle
              }
              aria-label="Previous page"
            >
              &lt;
            </button>

            <button
              type="button"
              style={paginationActiveStyle}
              aria-current="page"
            >
              {safeCurrentPage}
            </button>

            <button
              type="button"
              disabled={safeCurrentPage === totalPages}
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(page + 1, totalPages)
                )
              }
              style={
                safeCurrentPage === totalPages
                  ? paginationDisabledStyle
                  : paginationButtonStyle
              }
              aria-label="Next page"
            >
              &gt;
            </button>
          </div>
        </div>
      </main>

      {/* ADD VACCINATION */}

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div>
                <h2>Add Vaccination</h2>
                <p>Enter vaccination information</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={handleCloseAdd}
                disabled={isSaving}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleAddVaccination}
              aria-busy={isSaving}
            >
              <div className="form-row">
                <div className="form-field">
                  <label>Pet Name</label>

                  <select
                    name="petId"
                    value={newVaccination.petId}
                    onChange={handleNewVaccinationChange}
                    disabled={isSaving}
                    required
                  >
                    <option value="">
                      {pets.length
                        ? "Select pet"
                        : "Add a pet first"}
                    </option>

                    {pets.map((pet) => (
                      <option key={pet.id} value={pet.id}>
                        {pet.name}
                        {pet.owner ? ` — ${pet.owner}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="add-vaccination-vaccine">
                    Vaccine Name
                  </label>

                  <input
                    id="add-vaccination-vaccine"
                    type="text"
                    name="vaccine"
                    list="add-vaccination-vaccine-options"
                    placeholder="Search vaccine names..."
                    value={newVaccination.vaccine}
                    onChange={handleNewVaccinationChange}
                    maxLength={200}
                    autoComplete="off"
                    disabled={isSaving || optionsLoading}
                    required
                  />

                  <datalist id="add-vaccination-vaccine-options">
                    {vaccineNames.map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>

                  {(optionsLoading ||
                    optionsError ||
                    vaccineNames.length === 0) && (
                    <p className="vaccination-options-note">
                      {optionsLoading
                        ? "Loading vaccine names..."
                        : optionsError ||
                          "No vaccine names saved. Add them in Settings → Option List → Vaccinations → Vaccine Name, then save settings."}
                    </p>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Date Given</label>

                  <input
                    type="date"
                    name="dateGiven"
                    value={newVaccination.dateGiven}
                    onChange={handleNewVaccinationChange}
                    disabled={isSaving}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Next Due Date</label>

                  <input
                    type="date"
                    name="nextDueDate"
                    value={newVaccination.nextDueDate}
                    min={
                      newVaccination.dateGiven || undefined
                    }
                    onChange={handleNewVaccinationChange}
                    disabled={isSaving}
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Status</label>

                <select
                  name="status"
                  value={newVaccination.status}
                  onChange={handleNewVaccinationChange}
                  disabled={isSaving || optionsLoading}
                  required
                >
                  <option value="">Select status</option>

                  {vaccinationStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                {(optionsLoading ||
                  optionsError ||
                  vaccinationStatuses.length === 0) && (
                  <p className="vaccination-options-note">
                    {optionsLoading
                      ? "Loading vaccination statuses..."
                      : optionsError ||
                        "No statuses saved. Add them in Settings → Option List → Vaccinations → Status, then save settings."}
                  </p>
                )}
              </div>

              <div className="form-field">
                <label>Notes</label>

                <textarea
                  name="notes"
                  rows="3"
                  placeholder="Additional notes..."
                  value={newVaccination.notes}
                  onChange={handleNewVaccinationChange}
                  maxLength={4000}
                  disabled={isSaving}
                />
              </div>

              <div className="vaccination-workflow-actions">
                <button
                  type="button"
                  className="vaccination-workflow-button vaccination-workflow-secondary"
                  onClick={handleCloseAdd}
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="vaccination-workflow-button vaccination-workflow-primary"
                  disabled={
                    isSaving ||
                    optionsLoading ||
                    Boolean(optionsError) ||
                    pets.length === 0 ||
                    vaccineNames.length === 0 ||
                    vaccinationStatuses.length === 0
                  }
                >
                  {isSaving ? "Saving..." : "Add Vaccination"}
                </button>

                <button
                  type="button"
                  className="vaccination-workflow-button vaccination-workflow-primary"
                  onClick={handleSaveAndCreateInvoice}
                  disabled={
                    isSaving ||
                    optionsLoading ||
                    Boolean(optionsError) ||
                    pets.length === 0 ||
                    vaccineNames.length === 0 ||
                    vaccinationStatuses.length === 0
                  }
                >
                  Save & Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW VACCINATION */}

      {showViewModal && selectedVaccination && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div>
                <h2>Vaccination Details</h2>
                <p>View pet vaccination information</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={handleCloseView}
                disabled={isSaving}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="detail-row">
              <span>Pet Name</span>
              <strong>{selectedVaccination.pet}</strong>
            </div>

            <div className="detail-row">
              <span>Vaccine Name</span>
              <strong>{selectedVaccination.vaccine}</strong>
            </div>

            <div className="detail-row">
              <span>Date Given</span>

              <strong>
                {formatDate(selectedVaccination.dateGiven)}
              </strong>
            </div>

            <div className="detail-row">
              <span>Next Due Date</span>

              <strong>
                {formatDate(selectedVaccination.nextDueDate)}
              </strong>
            </div>

            <div className="detail-row">
              <span>Status</span>
              <strong>{selectedVaccination.status}</strong>
            </div>

            <div className="detail-row">
              <span>Notes</span>

              <strong>
                {selectedVaccination.notes || "—"}
              </strong>
            </div>

            <div className="vaccination-workflow-actions">
              <button
                type="button"
                className="vaccination-workflow-button vaccination-workflow-secondary"
                onClick={handleCloseView}
                disabled={isSaving}
              >
                Close
              </button>

              <button
                type="button"
                className="vaccination-workflow-button vaccination-workflow-primary"
                onClick={() =>
                  handleOpenEdit(selectedVaccination)
                }
                disabled={isSaving}
              >
                <FaPen />

                <span style={{ marginLeft: "7px" }}>
                  Edit Vaccination
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT VACCINATION */}

      {showEditModal && selectedVaccination && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div>
                <h2>Edit Vaccination</h2>
                <p>Update vaccination information</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={handleCloseEdit}
                disabled={isSaving}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleUpdateVaccination}
              aria-busy={isSaving}
            >
              <div className="form-row">
                <div className="form-field">
                  <label>Pet Name</label>

                  <select
                    name="petId"
                    value={selectedVaccination.petId}
                    onChange={handleEditChange}
                    disabled={isSaving}
                    required
                  >
                    <option value="">Select pet</option>

                    {pets.map((pet) => (
                      <option key={pet.id} value={pet.id}>
                        {pet.name}
                        {pet.owner ? ` — ${pet.owner}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="edit-vaccination-vaccine">
                    Vaccine Name
                  </label>

                  <input
                    id="edit-vaccination-vaccine"
                    type="text"
                    name="vaccine"
                    list="edit-vaccination-vaccine-options"
                    placeholder="Search vaccine names..."
                    value={selectedVaccination.vaccine}
                    onChange={handleEditChange}
                    maxLength={200}
                    autoComplete="off"
                    disabled={isSaving || optionsLoading}
                    required
                  />

                  <datalist id="edit-vaccination-vaccine-options">
                    {vaccineNames.map((name) => (
                      <option key={name} value={name} />
                    ))}

                    {vaccinations
                      .filter(
                        (item) =>
                          String(item.id) ===
                            String(selectedVaccination.id) &&
                          item.vaccine &&
                          !vaccineNames.includes(item.vaccine)
                      )
                      .map((item) => (
                        <option
                          key={`existing-${item.id}`}
                          value={item.vaccine}
                        />
                      ))}
                  </datalist>

                  {(optionsLoading || optionsError) && (
                    <p className="vaccination-options-note">
                      {optionsLoading
                        ? "Loading vaccine names..."
                        : optionsError}
                    </p>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Date Given</label>

                  <input
                    type="date"
                    name="dateGiven"
                    value={selectedVaccination.dateGiven}
                    onChange={handleEditChange}
                    disabled={isSaving}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Next Due Date</label>

                  <input
                    type="date"
                    name="nextDueDate"
                    value={selectedVaccination.nextDueDate}
                    min={
                      selectedVaccination.dateGiven ||
                      undefined
                    }
                    onChange={handleEditChange}
                    disabled={isSaving}
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Status</label>

                <select
                  name="status"
                  value={selectedVaccination.status}
                  onChange={handleEditChange}
                  disabled={isSaving || optionsLoading}
                  required
                >
                  <option value="">Select status</option>

                  {vaccinationStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}

                  {vaccinations
                    .filter(
                      (item) =>
                        String(item.id) ===
                          String(selectedVaccination.id) &&
                        item.status &&
                        !vaccinationStatuses.includes(
                          item.status
                        )
                    )
                    .map((item) => (
                      <option
                        key={`existing-${item.id}`}
                        value={item.status}
                      >
                        {item.status} (saved value)
                      </option>
                    ))}
                </select>

                {(optionsLoading || optionsError) && (
                  <p className="vaccination-options-note">
                    {optionsLoading
                      ? "Loading vaccination statuses..."
                      : optionsError}
                  </p>
                )}
              </div>

              <div className="form-field">
                <label>Notes</label>

                <textarea
                  name="notes"
                  rows="3"
                  value={selectedVaccination.notes || ""}
                  onChange={handleEditChange}
                  maxLength={4000}
                  disabled={isSaving}
                />
              </div>

              <div className="vaccination-workflow-actions">
                <button
                  type="button"
                  className="vaccination-workflow-button vaccination-workflow-secondary"
                  onClick={handleCloseEdit}
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="vaccination-workflow-button vaccination-workflow-primary"
                  disabled={
                    isSaving ||
                    optionsLoading ||
                    Boolean(optionsError)
                  }
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE VACCINATION */}

      {showDeleteModal && vaccinationToDelete && (
        <div className="vaccinations-delete-overlay">
          <div
            className="vaccinations-delete-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vaccination-delete-title"
          >
            <div className="vaccinations-delete-icon">
              <FaTrash />
            </div>

            <h3 id="vaccination-delete-title">
              Delete Vaccination
            </h3>

            <p>Are you sure you want to delete this?</p>

            <div className="vaccinations-delete-actions">
              <button
                type="button"
                className="vaccinations-delete-cancel"
                onClick={cancelDeleteVaccination}
                disabled={isSaving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="vaccinations-delete-confirm"
                onClick={confirmDeleteVaccination}
                disabled={isSaving}
              >
                {isSaving ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Vaccinations;