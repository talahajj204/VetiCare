import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

import {
  FaEye,
  FaPen,
  FaTrash,
  FaFileExcel,
  FaSearch,
  FaTimes,
  FaPaperclip,
} from "react-icons/fa";

import * as XLSX from "xlsx";
import { getClinicOptions } from "../data/clinicOptionsApi";

const MEDICAL_RECORDS_API = "/api/medical-records";

const getOwnerName = (owner) =>
  `${owner.firstName || ""} ${owner.lastName || ""}`.trim();

async function requestMedicalData(url, options = {}) {
  let response;

  try {
    response = await fetch(url, {
      ...options,
      credentials: "include",
      cache: "no-store",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;

    throw new Error("Unable to connect to the server. Please try again.");
  }

  if (!response.ok) {
    let message = "Unable to complete the request.";

    if (response.status === 401) {
      message = "Your session has expired. Please sign in again.";
    } else if (response.status === 403) {
      message = "You do not have permission to access these records.";
    } else if (response.status === 404) {
      message = "The requested record could not be found.";
    } else {
      try {
        const problem = await response.json();

        const errors = Object.values(problem.errors || {})
          .flat()
          .filter((value) => typeof value === "string");

        if (errors.length > 0) {
          message = errors.join("\n");
        } else if (typeof problem.message === "string") {
          message = problem.message;
        } else if (typeof problem.detail === "string") {
          message = problem.detail;
        }
      } catch {
        // Keep the default message.
      }
    }

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;

  return response.json();
}

function normalizeMedicalRecord(record) {
  return {
    ...record,
    petId: record.petId == null ? "" : String(record.petId),
    ownerId: record.ownerId == null ? "" : String(record.ownerId),
    pet: record.pet || "",
    owner: record.owner || "",
    date: record.date || "",
    veterinarian: record.veterinarian || "",
    reasonForVisit: record.reasonForVisit || "",
    symptoms: record.symptoms || "",
    procedures: record.procedures || "",
    weight:
      record.weight === null || record.weight === undefined
        ? ""
        : String(record.weight),
    followUpDate: record.followUpDate || "",
    fileName: record.fileName || "",
    diagnosis: record.diagnosis || "",
    treatment: record.treatment || "",
    notes: record.notes || "",
    status: record.status || "In Progress",
  };
}

function medicalRecordPayload(record) {
  const petId = Number(record.petId);

  if (!Number.isInteger(petId) || petId <= 0) {
    throw new Error("Please select a valid pet.");
  }

  const weightText = String(record.weight ?? "").trim();
  const weight = weightText === "" ? null : Number(weightText);

  if (weight !== null && (!Number.isFinite(weight) || weight < 0)) {
    throw new Error("Please enter a valid, non-negative weight.");
  }

  return {
    petId,
    date: record.date || null,
    veterinarian: String(record.veterinarian ?? "").trim(),
    reasonForVisit: String(record.reasonForVisit ?? "").trim(),
    symptoms: String(record.symptoms ?? "").trim(),
    procedures: String(record.procedures ?? "").trim(),
    weight,
    followUpDate: record.followUpDate || null,
    diagnosis: String(record.diagnosis ?? "").trim(),
    treatment: String(record.treatment ?? "").trim(),
    notes: String(record.notes ?? "").trim(),
    fileName: String(record.fileName ?? "").trim(),
    status: String(record.status ?? "In Progress").trim(),
  };
}

function medicalRecordPath(id) {
  return `${MEDICAL_RECORDS_API}/${encodeURIComponent(String(id))}`;
}

function getEmptyRecord() {
  return {
    petId: "",
    pet: "",
    ownerId: "",
    owner: "",
    date: "",
    veterinarian: "",
    reasonForVisit: "",
    symptoms: "",
    procedures: "",
    weight: "",
    followUpDate: "",
    fileName: "",
    diagnosis: "",
    treatment: "",
    notes: "",
    status: "In Progress",
  };
}

/* SEARCHABLE OWNER / PET INPUT */

function MedicalRecordSearchInput({
  inputId,
  value,
  selectedId,
  options,
  placeholder,
  emptyMessage,
  onType,
  onSelect,
  disabled,
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const wrapperRef = useRef(null);
  const listRef = useRef(null);

  const query = String(value || "")
    .trim()
    .toLowerCase();

  const matches = options.filter((option) =>
    String(option.label || "")
      .toLowerCase()
      .includes(query)
  );

  useEffect(() => {
    const closeOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("pointerdown", closeOutside);

    return () => document.removeEventListener("pointerdown", closeOutside);
  }, []);

  useEffect(() => {
    setActiveIndex(-1);
  }, [value, selectedId]);

  useEffect(() => {
    if (activeIndex >= 0) {
      listRef.current
        ?.querySelector(`[data-option-index="${activeIndex}"]`)
        ?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const choose = (option) => {
    onSelect(option.record);
    setOpen(false);
    setActiveIndex(-1);
  };

  const listVisible = open && !disabled;

  return (
    <div
      ref={wrapperRef}
      className="medical-record-search-input"
      style={{ position: "relative", minWidth: 0 }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
          setActiveIndex(-1);
        }
      }}
    >
      <input
        id={inputId}
        type="text"
        value={value || ""}
        placeholder={placeholder}
        autoComplete="off"
        disabled={disabled}
        required
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={listVisible}
        aria-controls={`${inputId}-options`}
        aria-activedescendant={
          listVisible && activeIndex >= 0 && matches[activeIndex]
            ? `${inputId}-option-${activeIndex}`
            : undefined
        }
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          onType(event.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((previous) =>
              matches.length ? Math.min(previous + 1, matches.length - 1) : -1
            );
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((previous) =>
              matches.length ? Math.max(previous - 1, 0) : -1
            );
          } else if (event.key === "Enter" && listVisible) {
            event.preventDefault();

            if (activeIndex >= 0 && matches[activeIndex]) {
              choose(matches[activeIndex]);
            } else if (matches.length === 1) {
              choose(matches[0]);
            }
          } else if (event.key === "Escape") {
            if (listVisible) {
              event.preventDefault();
              event.stopPropagation();
            }

            setOpen(false);
            setActiveIndex(-1);
          }
        }}
      />

      {listVisible && (
        <div
          ref={listRef}
          id={`${inputId}-options`}
          role="listbox"
          aria-label="Matching names"
          style={{
            position: "absolute",
            top: "calc(100% + 5px)",
            left: 0,
            right: 0,
            zIndex: 50,
            maxHeight: "190px",
            overflowY: "auto",
            overscrollBehavior: "contain",
            background: "#ffffff",
            border: "1px solid #d5e5e3",
            borderRadius: "8px",
            boxShadow: "0 8px 20px rgba(24, 56, 56, 0.12)",
          }}
        >
          {matches.length ? (
            matches.map((option, index) => (
              <div
                key={option.id}
                id={`${inputId}-option-${index}`}
                role="option"
                aria-selected={String(selectedId) === String(option.id)}
                data-option-index={index}
                onPointerDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(option)}
                style={{
                  padding: "10px 12px",
                  background: activeIndex === index ? "#e8f7f7" : "#ffffff",
                  color: "#405656",
                  cursor: "pointer",
                  fontSize: "13px",
                  textAlign: "left",
                  overflowWrap: "anywhere",
                }}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div
              style={{
                padding: "12px",
                color: "#7b8d8d",
                fontSize: "13px",
              }}
            >
              {emptyMessage || "No matches found."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* MEDICAL RECORDS */

function MedicalRecords() {
  const navigate = useNavigate();
  const location = useLocation();
  const [medicalStatuses, setMedicalStatuses] = useState([]);
  const [statusesError, setStatusesError] = useState("");

  useEffect(() => {
    let controller;
    let disposed = false;

    const loadStatuses = async () => {
      controller?.abort();
      controller = new AbortController();
      const currentController = controller;

      try {
        const options = await getClinicOptions({
          listKey: "medicalRecords",
          signal: currentController.signal,
        });

        if (disposed || currentController.signal.aborted) return;

        setMedicalStatuses([
          ...new Set(
            options
              .filter((option) => option.isActive)
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((option) => option.value.trim())
              .filter(Boolean)
          ),
        ]);

        setStatusesError("");
      } catch (error) {
        if (!disposed && !currentController.signal.aborted) {
          setStatusesError(error.message);
        }
      }
    };

    loadStatuses();

    window.addEventListener("clinicOptionsUpdated", loadStatuses);
    window.addEventListener("focus", loadStatuses);

    return () => {
      disposed = true;
      controller?.abort();

      window.removeEventListener("clinicOptionsUpdated", loadStatuses);
      window.removeEventListener("focus", loadStatuses);
    };
  }, []);
  const [records, setRecords] = useState([]);
  const [pets, setPets] = useState([]);
  const [owners, setOwners] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const savingRef = useRef(false);
  const appointmentRef = useRef(null);

  const [search, setSearch] = useState("");
  const [veterinarianFilter, setVeterinarianFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [newRecord, setNewRecord] = useState(getEmptyRecord);

  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;

    async function loadData() {
      setIsLoading(true);
      setLoadError("");

      try {
        const [savedRecords, savedPets, savedOwners] = await Promise.all([
          requestMedicalData(MEDICAL_RECORDS_API, {
            signal: controller.signal,
          }),
          requestMedicalData("/api/pets", {
            signal: controller.signal,
          }),
          requestMedicalData("/api/owners", {
            signal: controller.signal,
          }),
        ]);

        if (
          !Array.isArray(savedRecords) ||
          !Array.isArray(savedPets) ||
          !Array.isArray(savedOwners)
        ) {
          throw new Error("The server returned an invalid response.");
        }

        if (disposed) return;

        setRecords(savedRecords.map(normalizeMedicalRecord));
        setPets(savedPets);
        setOwners(savedOwners);
      } catch (error) {
        if (disposed || error.name === "AbortError") return;

        setLoadError(error.message || "Unable to load medical records.");
      } finally {
        if (!disposed) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      disposed = true;
      controller.abort();
    };
  }, []);

  const petOptions = useMemo(
    () =>
      [...pets].sort((a, b) =>
        String(a.name || "").localeCompare(String(b.name || ""))
      ),
    [pets]
  );

  const ownerOptions = useMemo(
    () =>
      [...owners].sort((a, b) =>
        getOwnerName(a).localeCompare(getOwnerName(b))
      ),
    [owners]
  );

  useEffect(() => {
    if (!location.state?.openAddMedicalRecord || isLoading || loadError) {
      return;
    }

    const state = location.state;
    const appointment = state.appointment || {};

    appointmentRef.current = state.appointment || null;

    const passedPet = state.pet ?? appointment.pet;
    const passedOwner = state.owner ?? appointment.owner;

    const requestedPetId =
      state.petId ??
      appointment.petId ??
      (typeof passedPet === "object" ? passedPet?.id : null);

    let matchingPet = pets.find(
      (pet) =>
        requestedPetId != null && String(pet.id) === String(requestedPetId)
    );

    if (!matchingPet && requestedPetId == null) {
      const petName =
        typeof passedPet === "string"
          ? passedPet.trim()
          : passedPet?.name || "";

      const ownerName =
        typeof passedOwner === "string"
          ? passedOwner.trim()
          : passedOwner
          ? `${passedOwner.firstName || ""} ${
              passedOwner.lastName || ""
            }`.trim()
          : "";

      const matches = pets.filter(
        (pet) =>
          petName &&
          String(pet.name || "").toLowerCase() === petName.toLowerCase() &&
          (!ownerName ||
            String(pet.owner || "").toLowerCase() === ownerName.toLowerCase())
      );

      if (matches.length === 1) {
        matchingPet = matches[0];
      }
    }

    setNewRecord({
      ...getEmptyRecord(),
      petId: matchingPet ? String(matchingPet.id) : "",
      pet: matchingPet?.name || "",
      ownerId: matchingPet ? String(matchingPet.ownerId || "") : "",
      owner: matchingPet?.owner || "",
      date: state.appointmentDate || appointment.date || "",
      veterinarian: state.veterinarian || appointment.veterinarian || "",
      reasonForVisit: state.reason || appointment.reason || "",
    });

    setShowAddModal(true);

    navigate(location.pathname, {
      replace: true,
      state: null,
    });
  }, [location.state, location.pathname, navigate, pets, isLoading, loadError]);

  const veterinarianOptions = [
    ...new Set(records.map((record) => record.veterinarian).filter(Boolean)),
  ];

  const filteredRecords = records.filter((record) => {
    const value = search.trim().toLowerCase();

    const matchesSearch = [
      record.pet,
      record.owner,
      record.date,
      record.veterinarian,
      record.reasonForVisit,
      record.symptoms,
      record.procedures,
      record.diagnosis,
      record.treatment,
      record.notes,
    ].some((field) =>
      String(field || "")
        .toLowerCase()
        .includes(value)
    );

    const matchesVeterinarian =
      veterinarianFilter === "All" ||
      record.veterinarian === veterinarianFilter;

    const matchesFrom = !fromDate || record.date >= fromDate;

    const matchesTo = !toDate || record.date <= toDate;

    return matchesSearch && matchesVeterinarian && matchesFrom && matchesTo;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRecords.length / itemsPerPage)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;

  const paginatedRecords = filteredRecords.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const goToPreviousPage = () => {
    setCurrentPage((previous) => Math.max(previous - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((previous) => Math.min(previous + 1, totalPages));
  };

  const clearFilters = () => {
    setSearch("");
    setVeterinarianFilter("All");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  const hasFilters =
    search !== "" ||
    veterinarianFilter !== "All" ||
    fromDate !== "" ||
    toDate !== "";

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

  const notifyRecordsUpdated = () => {
    window.dispatchEvent(new Event("vetClinicMedicalRecordsUpdated"));
  };

  const handleOpenAdd = () => {
    if (isLoading || loadError || savingRef.current) return;

    appointmentRef.current = null;
    setNewRecord(getEmptyRecord());
    setShowAddModal(true);
  };

  const handleCloseAdd = () => {
    if (savingRef.current) return;

    setShowAddModal(false);
    setNewRecord(getEmptyRecord());
    appointmentRef.current = null;
  };

  const handleCloseView = () => {
    if (savingRef.current) return;

    setShowViewModal(false);
    setSelectedRecord(null);
  };

  const handleCloseEdit = () => {
    if (savingRef.current) return;

    setShowEditModal(false);
    setSelectedRecord(null);
  };

  const applyPetSelection = (previous, pet) => {
    if (!pet) {
      return {
        ...previous,
        petId: "",
        pet: "",
      };
    }

    const owner = owners.find(
      (item) => String(item.id) === String(pet.ownerId)
    );

    return {
      ...previous,
      petId: String(pet.id),
      pet: pet.name || "",
      ownerId: String(pet.ownerId || ""),
      owner: owner ? getOwnerName(owner) : pet.owner || "",
    };
  };

  const updateRecordSelection = (mode, updater) => {
    if (savingRef.current) return;

    const setter = mode === "edit" ? setSelectedRecord : setNewRecord;

    setter((previous) => (previous ? updater(previous) : previous));
  };

  const handleOwnerType = (mode, value) => {
    updateRecordSelection(mode, (previous) => ({
      ...previous,
      owner: value,
      ownerId: "",
      petId: "",
      pet: "",
    }));
  };

  const handleOwnerSelect = (mode, owner) => {
    updateRecordSelection(mode, (previous) => {
      const ownerPets = petOptions.filter(
        (pet) => String(pet.ownerId) === String(owner.id)
      );

      const currentPet = ownerPets.find(
        (pet) => String(pet.id) === String(previous.petId)
      );

      const pet = currentPet || (ownerPets.length === 1 ? ownerPets[0] : null);

      return {
        ...previous,
        ownerId: String(owner.id),
        owner: getOwnerName(owner),
        petId: pet ? String(pet.id) : "",
        pet: pet?.name || "",
      };
    });
  };

  const handlePetType = (mode, value) => {
    updateRecordSelection(mode, (previous) => ({
      ...previous,
      pet: value,
      petId: "",
    }));
  };

  const handlePetSelect = (mode, pet) => {
    updateRecordSelection(mode, (previous) => applyPetSelection(previous, pet));
  };

  const handleNewRecordChange = (e) => {
    const { name, value } = e.target;

    if (name === "petId") {
      const pet = pets.find((item) => String(item.id) === value);

      setNewRecord((previous) => applyPetSelection(previous, pet));
      return;
    }

    setNewRecord((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    if (name === "petId") {
      const pet = pets.find((item) => String(item.id) === value);

      setSelectedRecord((previous) => applyPetSelection(previous, pet));
      return;
    }

    setSelectedRecord((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleNewFileChange = (e) => {
    const file = e.target.files?.[0];

    setNewRecord((previous) => ({
      ...previous,
      fileName: file ? file.name : "",
    }));
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files?.[0];

    setSelectedRecord((previous) => ({
      ...previous,
      fileName: file ? file.name : previous?.fileName || "",
    }));
  };

  const validateMedicalRecord = (record) => {
    const pet = pets.find((item) => String(item.id) === String(record.petId));

    if (
      !pet ||
      !record.ownerId ||
      String(pet.ownerId) !== String(record.ownerId)
    ) {
      window.alert(
        "Please select an existing owner and a pet belonging to that owner."
      );
      return false;
    }

    if (
      !record.date ||
      !record.veterinarian.trim() ||
      !record.reasonForVisit.trim() ||
      !record.diagnosis.trim() ||
      !record.treatment.trim()
    ) {
      window.alert(
        "Please select a pet and complete the required medical record fields."
      );
      return false;
    }

    if (record.followUpDate && record.followUpDate < record.date) {
      window.alert("Follow-up date cannot be before the visit date.");
      return false;
    }

    return true;
  };

  const createMedicalRecord = async (
    status = newRecord.status || "In Progress"
  ) => {
    if (savingRef.current || !validateMedicalRecord(newRecord)) {
      return null;
    }

    if (!beginSave()) return null;

    try {
      const response = await requestMedicalData(MEDICAL_RECORDS_API, {
        method: "POST",
        body: JSON.stringify(medicalRecordPayload({ ...newRecord, status })),
      });

      const record = normalizeMedicalRecord(response);

      setRecords((previous) => [...previous, record]);
      setNewRecord(getEmptyRecord());
      setShowAddModal(false);
      setCurrentPage(1);

      notifyRecordsUpdated();
      return record;
    } catch (error) {
      window.alert(error.message || "Unable to save the medical record.");
      return null;
    } finally {
      endSave();
    }
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    await createMedicalRecord("In Progress");
  };

  const handleSaveAndAddVaccination = async () => {
    const savedRecord = await createMedicalRecord("In Progress");

    if (!savedRecord) return;

    navigate("/vaccinations", {
      state: {
        openAddVaccination: true,
        fromVisitFlow: true,
        petId: savedRecord.petId,
        pet: savedRecord.pet,
        ownerId: savedRecord.ownerId,
        owner: savedRecord.owner,
        veterinarian: savedRecord.veterinarian,
        date: savedRecord.date,
        diagnosis: savedRecord.diagnosis,
        treatment: savedRecord.treatment,
        medicalRecordId: savedRecord.id,
        medicalRecord: savedRecord,
        appointment: appointmentRef.current,
      },
    });
  };

  const handleCompleteVisit = async () => {
    const completedRecord = await createMedicalRecord("Completed");

    if (!completedRecord) return;

    setSelectedRecord(completedRecord);
    setShowViewModal(true);
  };

  const handleCompleteAndCreateInvoice = async () => {
    const completedRecord = await createMedicalRecord("Completed");

    if (!completedRecord) return;

    navigate("/billing", {
      state: {
        openAddInvoice: true,
        fromVisitFlow: true,
        petId: completedRecord.petId,
        pet: completedRecord.pet,
        ownerId: completedRecord.ownerId,
        owner: completedRecord.owner,
        veterinarian: completedRecord.veterinarian,
        date: completedRecord.date,
        reasonForVisit: completedRecord.reasonForVisit,
        diagnosis: completedRecord.diagnosis,
        treatment: completedRecord.treatment,
        procedures: completedRecord.procedures,
        medicalRecordId: completedRecord.id,
        medicalRecord: completedRecord,
        appointment: appointmentRef.current,
      },
    });
  };

  const handleCreateInvoice = (record) => {
    if (!record || savingRef.current) return;

    setShowViewModal(false);

    navigate("/billing", {
      state: {
        openAddInvoice: true,
        fromVisitFlow: true,
        petId: record.petId,
        pet: record.pet,
        ownerId: record.ownerId,
        owner: record.owner,
        veterinarian: record.veterinarian,
        date: record.date,
        reasonForVisit: record.reasonForVisit,
        diagnosis: record.diagnosis,
        treatment: record.treatment,
        procedures: record.procedures,
        medicalRecordId: record.id,
        medicalRecord: record,
        appointment: null,
      },
    });
  };

  const handleViewRecord = (record) => {
    if (savingRef.current) return;

    setSelectedRecord(record);
    setShowViewModal(true);
  };

  const handleOpenEdit = (record) => {
    if (savingRef.current) return;

    const pet = pets.find((item) => String(item.id) === String(record.petId));

    setSelectedRecord({
      ...record,
      petId: String(record.petId || ""),
      ownerId: String(pet?.ownerId || record.ownerId || ""),
      pet: pet?.name || record.pet || "",
      owner: pet?.owner || record.owner || "",
    });

    setShowViewModal(false);
    setShowEditModal(true);
  };

  const handleUpdateRecord = async (e) => {
    e.preventDefault();

    if (
      !selectedRecord ||
      savingRef.current ||
      !validateMedicalRecord(selectedRecord)
    ) {
      return;
    }

    if (!beginSave()) return;

    try {
      const response = await requestMedicalData(
        medicalRecordPath(selectedRecord.id),
        {
          method: "PUT",
          body: JSON.stringify(medicalRecordPayload(selectedRecord)),
        }
      );

      const updatedRecord = normalizeMedicalRecord(response);

      setRecords((previous) =>
        previous.map((record) =>
          record.id === updatedRecord.id ? updatedRecord : record
        )
      );

      setShowEditModal(false);
      setSelectedRecord(null);
      notifyRecordsUpdated();
    } catch (error) {
      window.alert(error.message || "Unable to update the medical record.");
    } finally {
      endSave();
    }
  };

  const handleDeleteRecord = async (id) => {
    if (savingRef.current) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this medical record?"
    );

    if (!confirmDelete || !beginSave()) return;

    try {
      await requestMedicalData(medicalRecordPath(id), {
        method: "DELETE",
      });

      setRecords((previous) => previous.filter((record) => record.id !== id));

      setShowViewModal(false);
      setShowEditModal(false);
      setSelectedRecord(null);
      notifyRecordsUpdated();
    } catch (error) {
      window.alert(error.message || "Unable to delete the medical record.");
    } finally {
      endSave();
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const [year, month, day] = date.split("-");

    if (!year || !month || !day) return date;

    return `${day}/${month}/${year}`;
  };

  const exportToExcel = () => {
    const excelData = filteredRecords.map((record) => ({
      Pet: record.pet,
      Owner: record.owner || "",
      Date: formatDate(record.date),
      Veterinarian: record.veterinarian,
      "Reason for Visit": record.reasonForVisit || "",
      Symptoms: record.symptoms || "",
      Procedures: record.procedures || "",
      "Weight (kg)": record.weight || "",
      "Follow-up Date": record.followUpDate
        ? formatDate(record.followUpDate)
        : "",
      Diagnosis: record.diagnosis,
      Treatment: record.treatment,
      Notes: record.notes || "",
      File: record.fileName || "",
      Status: record.status || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    worksheet["!cols"] = [
      { wch: 18 },
      { wch: 22 },
      { wch: 15 },
      { wch: 22 },
      { wch: 30 },
      { wch: 30 },
      { wch: 30 },
      { wch: 14 },
      { wch: 18 },
      { wch: 30 },
      { wch: 30 },
      { wch: 45 },
      { wch: 25 },
      { wch: 15 },
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Medical Records");

    XLSX.writeFile(workbook, "vet-clinic-medical-records.xlsx");
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
    border: "1px solid #c9dddd",
    borderRadius: "7px",
    background: "#ffffff",
    color: "#455757",
    fontSize: "14px",
    fontWeight: "700",
    lineHeight: "1",
    boxSizing: "border-box",
  };

  const paginationDisabledStyle = {
    ...paginationButtonStyle,
    background: "#eef4f4",
    borderColor: "#d6e3e3",
    color: "#aab9b9",
    cursor: "not-allowed",
  };

  const paginationActiveStyle = {
    ...paginationButtonStyle,
    background: "#54b7b5",
    borderColor: "#54b7b5",
    color: "#ffffff",
    cursor: "pointer",
  };
  const renderMedicalFields = (data, mode) => {
    const isEdit = mode === "edit";

    const onChange = isEdit ? handleEditChange : handleNewRecordChange;

    const availablePets = data.ownerId
      ? petOptions.filter((pet) => String(pet.ownerId) === String(data.ownerId))
      : petOptions;

    return (
      <div className="medical-compact-grid">
        <div className="form-field">
          <label htmlFor={`${mode}-medical-owner`}>Owner</label>

          <MedicalRecordSearchInput
            inputId={`${mode}-medical-owner`}
            value={data.owner || ""}
            selectedId={data.ownerId}
            options={ownerOptions.map((owner) => ({
              id: owner.id,
              label: getOwnerName(owner),
              record: owner,
            }))}
            placeholder="Type owner name..."
            emptyMessage="No matching owners found."
            onType={(value) => handleOwnerType(mode, value)}
            onSelect={(owner) => handleOwnerSelect(mode, owner)}
            disabled={isSaving}
          />
        </div>

        <div className="form-field">
          <label htmlFor={`${mode}-medical-pet`}>Pet Name</label>

          <MedicalRecordSearchInput
            inputId={`${mode}-medical-pet`}
            value={data.pet || ""}
            selectedId={data.petId}
            options={availablePets.map((pet) => ({
              id: pet.id,
              label: pet.name || "",
              record: pet,
            }))}
            placeholder="Type pet name..."
            emptyMessage={
              data.ownerId
                ? "No matching pets for this owner."
                : "No matching pets found."
            }
            onType={(value) => handlePetType(mode, value)}
            onSelect={(pet) => handlePetSelect(mode, pet)}
            disabled={isSaving}
          />
        </div>

        <div className="form-field">
          <label htmlFor={`${mode}-medical-date`}>Date</label>

          <input
            id={`${mode}-medical-date`}
            type="date"
            name="date"
            value={data.date || ""}
            onChange={onChange}
            required
            disabled={isSaving}
          />
        </div>

        <div className="form-field">
          <label htmlFor={`${mode}-medical-veterinarian`}>Veterinarian</label>

          <input
            id={`${mode}-medical-veterinarian`}
            type="text"
            name="veterinarian"
            value={data.veterinarian || ""}
            onChange={onChange}
            placeholder={isEdit ? undefined : "Enter veterinarian name"}
            maxLength={200}
            required
            disabled={isSaving}
          />
        </div>

        <div className="form-field">
          <label htmlFor={`${mode}-medical-reason`}>Reason for Visit</label>

          <input
            id={`${mode}-medical-reason`}
            type="text"
            name="reasonForVisit"
            value={data.reasonForVisit || ""}
            onChange={onChange}
            placeholder={isEdit ? undefined : "Enter reason for visit"}
            maxLength={500}
            required
            disabled={isSaving}
          />
        </div>

        <div className="form-field">
          <label htmlFor={`${mode}-medical-symptoms`}>Symptoms</label>

          <input
            id={`${mode}-medical-symptoms`}
            type="text"
            name="symptoms"
            value={data.symptoms || ""}
            onChange={onChange}
            placeholder={isEdit ? undefined : "Enter symptoms"}
            maxLength={4000}
            disabled={isSaving}
          />
        </div>

        <div className="form-field">
          <label htmlFor={`${mode}-medical-procedures`}>Procedures</label>

          <input
            id={`${mode}-medical-procedures`}
            type="text"
            name="procedures"
            value={data.procedures || ""}
            onChange={onChange}
            placeholder={isEdit ? undefined : "Enter procedures"}
            maxLength={4000}
            disabled={isSaving}
          />
        </div>

        <div className="form-field">
          <label htmlFor={`${mode}-medical-weight`}>Weight (kg)</label>

          <input
            id={`${mode}-medical-weight`}
            type="number"
            name="weight"
            value={data.weight ?? ""}
            onChange={onChange}
            placeholder={isEdit ? undefined : "Enter weight"}
            min="0"
            max="99999999.99"
            step="0.1"
            disabled={isSaving}
          />
        </div>

        <div className="form-field">
          <label htmlFor={`${mode}-medical-diagnosis`}>Diagnosis</label>

          <textarea
            id={`${mode}-medical-diagnosis`}
            name="diagnosis"
            value={data.diagnosis || ""}
            onChange={onChange}
            placeholder={isEdit ? undefined : "Enter diagnosis"}
            rows={2}
            maxLength={4000}
            required
            disabled={isSaving}
          />
        </div>

        <div className="form-field">
          <label htmlFor={`${mode}-medical-treatment`}>Treatment</label>

          <textarea
            id={`${mode}-medical-treatment`}
            name="treatment"
            value={data.treatment || ""}
            onChange={onChange}
            placeholder={isEdit ? undefined : "Enter treatment"}
            rows={2}
            maxLength={4000}
            required
            disabled={isSaving}
          />
        </div>

        <div className="form-field">
          <label htmlFor={`${mode}-medical-follow-up`}>Follow-up Date</label>

          <input
            id={`${mode}-medical-follow-up`}
            type="date"
            name="followUpDate"
            value={data.followUpDate || ""}
            min={data.date || undefined}
            onChange={onChange}
            disabled={isSaving}
          />
        </div>

        <div className="form-field">
          <label
            htmlFor={`${mode}-medical-file`}
            className="medical-file-label"
          >
            <FaPaperclip />
            Attach File
          </label>

          <input
            id={`${mode}-medical-file`}
            type="file"
            onChange={isEdit ? handleEditFileChange : handleNewFileChange}
            disabled={isSaving}
          />

          {data.fileName && (
            <p className="medical-file-name">
              {isEdit ? "Current:" : "Selected:"} {data.fileName}
            </p>
          )}
        </div>

        <div className="form-field medical-compact-full">
          <label htmlFor={`${mode}-medical-notes`}>Notes</label>

          <textarea
            id={`${mode}-medical-notes`}
            name="notes"
            value={data.notes || ""}
            onChange={onChange}
            placeholder={isEdit ? undefined : "Enter additional notes"}
            rows={2}
            maxLength={4000}
            disabled={isSaving}
          />
        </div>
        {isEdit && (
  <div className="form-field">
    <label htmlFor={`${mode}-medical-status`}>
      Status
    </label>

    <select
      id={`${mode}-medical-status`}
      name="status"
      value={data.status || "In Progress"}
      onChange={onChange}
      disabled={isSaving}
    >
      <option value="">Select status</option>

      {medicalStatuses.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}

      {data.status &&
        !medicalStatuses.includes(data.status) && (
          <option value={data.status}>
            {data.status} (saved value)
          </option>
        )}
    </select>

    {statusesError && (
      <small role="alert" style={{ color: "#b42318" }}>
        {statusesError}
      </small>
    )}
  </div>
)}
      </div>
    );
  };

  return (
    <div className="dashboard-layout">
      <style>{`
        .medical-workflow-actions {
          display: flex !important;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 18px;
        }

        .modal-container
        .medical-workflow-actions
        .medical-workflow-button {
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
          gap: 5px !important;

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
        .medical-workflow-actions
        .medical-workflow-secondary {
          background: #ffffff !important;
          color: #52605f !important;
          border: 1px solid #d5e5e3 !important;
        }

        .modal-container
        .medical-workflow-actions
        .medical-workflow-secondary:hover:not(:disabled) {
          background: #f7fbfa !important;
          border-color: #bdd8d5 !important;
        }

        .modal-container
        .medical-workflow-actions
        .medical-workflow-primary {
          background: #55b7b3 !important;
          color: #ffffff !important;
          border: 1px solid #55b7b3 !important;
        }

        .modal-container
        .medical-workflow-actions
        .medical-workflow-primary:hover:not(:disabled) {
          background: #319c97 !important;
          border-color: #319c97 !important;
        }

        .modal-container
        form
        .medical-workflow-actions
        button {
          width: auto !important;
          min-width: 0 !important;
          height: 34px !important;
          padding-left: 12px !important;
          padding-right: 12px !important;
          flex: 0 0 auto !important;
        }

        .medical-status {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          padding: 5px 9px;
          border-radius: 20px;

          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        .medical-status.in-progress {
          background: #fff4d9;
          color: #8b6815;
        }

        .medical-status.completed {
          background: #e0f4f1;
          color: #278d88;
        }

        .medical-file-name {
          margin-top: 7px;
          font-size: 12px;
          color: #617472;
        }

        .medical-file-label {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        html body #root
        .modal-container.medical-record-form-modal {
          width: min(1000px, calc(100vw - 32px)) !important;
          max-width: 1000px !important;
          max-height: 92vh !important;

          padding: 0 !important;
          box-sizing: border-box !important;
          overflow: hidden !important;

          display: flex !important;
          flex-direction: column !important;
        }

        html body #root
        .medical-record-form-modal > .modal-header {
          flex: 0 0 auto !important;
          margin: 0 !important;
          padding: 18px 24px !important;
          box-sizing: border-box !important;
        }

        html body #root
        .medical-record-form-modal > form.medical-compact-form {
          flex: 1 1 auto !important;
          min-height: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;

          display: flex !important;
          flex-direction: column !important;
        }

        html body #root
        .medical-record-form-modal .medical-compact-body {
          flex: 1 1 auto !important;
          min-height: 0 !important;

          padding: 18px 24px !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          box-sizing: border-box !important;
        }

        html body #root
        .medical-record-form-modal .medical-compact-grid {
          display: grid !important;
          grid-template-columns:
            repeat(2, minmax(0, 1fr)) !important;

          gap: 12px 22px !important;
          width: 100% !important;
          align-items: start !important;
        }

        html body #root
        .medical-record-form-modal
        .medical-compact-grid > .form-field {
          min-width: 0 !important;
          width: auto !important;
          margin: 0 !important;
          padding: 0 !important;

          display: flex !important;
          flex-direction: column !important;
          gap: 5px !important;
        }

        html body #root
        .medical-record-form-modal
        .medical-compact-grid > .medical-compact-full {
          grid-column: 1 / -1 !important;
        }

        html body #root
        .medical-record-form-modal
        .medical-compact-grid label {
          margin: 0 !important;
          padding: 0 !important;
          font-size: 13px !important;
          line-height: 1.35 !important;
        }

        html body #root
        .medical-record-form-modal
        .medical-compact-grid input,
        html body #root
        .medical-record-form-modal
        .medical-compact-grid select,
        html body #root
        .medical-record-form-modal
        .medical-compact-grid textarea {
          width: 100% !important;
          min-width: 0 !important;
          margin: 0 !important;

          box-sizing: border-box !important;
          font-family: inherit !important;
          font-size: 13px !important;
        }

        html body #root
        .medical-record-form-modal
        .medical-compact-grid input:not([type="file"]),
        html body #root
        .medical-record-form-modal
        .medical-compact-grid select {
          height: 40px !important;
          min-height: 40px !important;
          padding: 0 11px !important;
        }

        html body #root
        .medical-record-form-modal
        .medical-compact-grid input[type="file"] {
          min-height: 40px !important;
          padding: 6px 9px !important;
        }

        html body #root
        .medical-record-form-modal
        .medical-compact-grid textarea {
          height: 66px !important;
          min-height: 66px !important;
          max-height: 180px !important;

          padding: 8px 11px !important;
          line-height: 1.4 !important;
          resize: vertical !important;
        }

        html body #root
        .medical-record-form-modal
        .medical-file-name {
          margin: 0 !important;
          font-size: 11px !important;
          overflow-wrap: anywhere;
        }

        html body #root
        .medical-record-form-modal
        .medical-record-search-input {
          width: 100%;
          min-width: 0;
        }

        html body #root
        .medical-record-form-modal
        .medical-record-search-input [role="option"] {
          -webkit-text-fill-color: currentColor;
        }

        html body #root
        .medical-record-form-modal
        .medical-workflow-actions.medical-compact-footer {
          flex: 0 0 auto !important;
          margin: 0 !important;
          padding: 12px 24px !important;

          border-top: 1px solid #e4eeee !important;
          background: #ffffff !important;
          box-sizing: border-box !important;
        }

        @media (max-width: 700px) {
          html body #root
          .medical-record-form-modal .medical-compact-grid {
            grid-template-columns: minmax(0, 1fr) !important;
          }

          html body #root
          .medical-record-form-modal > .modal-header {
            padding: 16px 18px !important;
          }

          html body #root
          .medical-record-form-modal .medical-compact-body {
            padding: 16px 18px !important;
          }

          html body #root
          .medical-record-form-modal
          .medical-workflow-actions.medical-compact-footer {
            padding: 12px 18px !important;
          }

          .modal-container
          .medical-workflow-actions
          .medical-workflow-button {
            width: auto !important;
          }
        }
      `}</style>

      <Sidebar />

      <main className="dashboard-main medical-records-page">
        <div className="medical-records-page-header">
          <div>
            <h1>Medical Records</h1>
            <p>View and manage pet medical records.</p>
          </div>

          <div className="medical-records-header-actions">
            <button
              type="button"
              className="medical-records-export-button"
              onClick={exportToExcel}
              disabled={isLoading || Boolean(loadError)}
            >
              <FaFileExcel />
              <span>Export</span>
            </button>

            <button
              type="button"
              className="medical-records-add-button"
              onClick={handleOpenAdd}
              disabled={isLoading || Boolean(loadError) || isSaving}
            >
              + Add Medical Record
            </button>
          </div>
        </div>

        <div className="medical-records-toolbar">
          <div className="medical-records-filters">
            <div
              className="medical-records-search"
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                alignSelf: "center",
                margin: 0,
              }}
            >
              <FaSearch
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  margin: 0,
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              />

              <input
                type="text"
                placeholder="Search medical records..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  width: "100%",
                  margin: 0,
                  paddingLeft: "42px",
                  paddingRight: "40px",
                  boxSizing: "border-box",
                }}
              />

              {hasFilters && (
                <button
                  type="button"
                  className="medical-records-clear"
                  onClick={clearFilters}
                  aria-label="Clear filters"
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    margin: 0,
                  }}
                >
                  <FaTimes />
                </button>
              )}
            </div>

            <select
              className="medical-records-filter-select"
              value={veterinarianFilter}
              onChange={(e) => {
                setVeterinarianFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by veterinarian"
            >
              <option value="All">All Veterinarians</option>

              {veterinarianOptions.map((veterinarian) => (
                <option key={veterinarian} value={veterinarian}>
                  {veterinarian}
                </option>
              ))}
            </select>

            <div className="medical-records-date-filter">
              <span>From</span>

              <input
                type="date"
                value={fromDate}
                max={toDate || undefined}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="From date"
              />
            </div>

            <div className="medical-records-date-filter">
              <span>To</span>

              <input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="To date"
              />
            </div>
          </div>
        </div>

        <div className="owners-table-container">
          <table className="owners-table">
            <thead>
              <tr>
                <th>Pet</th>
                <th>Date</th>
                <th>Veterinarian</th>
                <th>Diagnosis</th>
                <th>Treatment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="no-results">
                    Loading medical records...
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={7} className="no-results">
                    {loadError}
                  </td>
                </tr>
              ) : filteredRecords.length > 0 ? (
                paginatedRecords.map((record) => (
                  <tr key={record.id}>
                    <td>{record.pet || "-"}</td>

                    <td>{formatDate(record.date)}</td>

                    <td>{record.veterinarian || "-"}</td>

                    <td>{record.diagnosis || "-"}</td>

                    <td>{record.treatment || "-"}</td>

                    <td>
                      <span
                        className={`medical-status ${
                          record.status === "Completed"
                            ? "completed"
                            : "in-progress"
                        }`}
                      >
                        {record.status || "In Progress"}
                      </span>
                    </td>

                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="icon-button view-button"
                          onClick={() => handleViewRecord(record)}
                          title="View medical record"
                          aria-label="View medical record"
                          disabled={isSaving}
                        >
                          <FaEye />
                        </button>

                        <button
                          type="button"
                          className="icon-button edit-button"
                          onClick={() => handleOpenEdit(record)}
                          title="Edit medical record"
                          aria-label="Edit medical record"
                          disabled={isSaving}
                        >
                          <FaPen />
                        </button>

                        <button
                          type="button"
                          className="icon-button delete-button"
                          onClick={() => handleDeleteRecord(record.id)}
                          title="Delete medical record"
                          aria-label="Delete medical record"
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
                  <td colSpan={7} className="no-results">
                    No medical records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "13px",
              color: "#617472",
            }}
          >
            <span>Rows per page</span>

            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              aria-label="Rows per page"
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

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "6px",
            }}
          >
            <button
              type="button"
              onClick={goToPreviousPage}
              disabled={safeCurrentPage === 1}
              aria-label="Previous page"
              style={
                safeCurrentPage === 1
                  ? paginationDisabledStyle
                  : {
                      ...paginationButtonStyle,
                      cursor: "pointer",
                    }
              }
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
              onClick={goToNextPage}
              disabled={safeCurrentPage === totalPages}
              aria-label="Next page"
              style={
                safeCurrentPage === totalPages
                  ? paginationDisabledStyle
                  : {
                      ...paginationButtonStyle,
                      cursor: "pointer",
                    }
              }
            >
              &gt;
            </button>
          </div>
        </div>

        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal-container medical-record-form-modal">
              <div className="modal-header">
                <div>
                  <h2>Add Medical Record</h2>
                  <p>Enter medical record information.</p>
                </div>

                <button
                  type="button"
                  className="modal-close"
                  onClick={handleCloseAdd}
                  aria-label="Close add medical record"
                  disabled={isSaving}
                >
                  <FaTimes />
                </button>
              </div>

              <form
                className="medical-compact-form"
                onSubmit={handleAddRecord}
                aria-busy={isSaving}
              >
                <div className="medical-compact-body">
                  {renderMedicalFields(newRecord, "add")}
                </div>

                <div className="medical-workflow-actions medical-compact-footer">
                  <button
                    type="button"
                    className="medical-workflow-button medical-workflow-secondary"
                    onClick={handleCloseAdd}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="medical-workflow-button medical-workflow-primary"
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Add Medical Record"}
                  </button>

                  <button
                    type="button"
                    className="medical-workflow-button medical-workflow-primary"
                    onClick={handleSaveAndAddVaccination}
                    disabled={isSaving}
                  >
                    Save & Add Vaccination
                  </button>

                  <button
                    type="button"
                    className="medical-workflow-button medical-workflow-primary"
                    onClick={handleCompleteAndCreateInvoice}
                    disabled={isSaving}
                  >
                    Complete & Create Invoice
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showViewModal && selectedRecord && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header">
                <div>
                  <h2>Medical Record Details</h2>
                  <p>View complete medical information.</p>
                </div>

                <button
                  type="button"
                  className="modal-close"
                  onClick={handleCloseView}
                  aria-label="Close medical record details"
                  disabled={isSaving}
                >
                  <FaTimes />
                </button>
              </div>

              <div className="modal-body">
                <div className="detail-row">
                  <strong>Pet:</strong>
                  <span>{selectedRecord.pet || "-"}</span>
                </div>

                <div className="detail-row">
                  <strong>Owner:</strong>
                  <span>{selectedRecord.owner || "-"}</span>
                </div>

                <div className="detail-row">
                  <strong>Date:</strong>
                  <span>{formatDate(selectedRecord.date)}</span>
                </div>

                <div className="detail-row">
                  <strong>Veterinarian:</strong>
                  <span>{selectedRecord.veterinarian || "-"}</span>
                </div>

                <div className="detail-row">
                  <strong>Status:</strong>

                  <span
                    className={`medical-status ${
                      selectedRecord.status === "Completed"
                        ? "completed"
                        : "in-progress"
                    }`}
                  >
                    {selectedRecord.status || "In Progress"}
                  </span>
                </div>

                <div className="detail-row">
                  <strong>Reason for Visit:</strong>
                  <span>{selectedRecord.reasonForVisit || "-"}</span>
                </div>

                <div className="detail-row">
                  <strong>Symptoms:</strong>
                  <span>{selectedRecord.symptoms || "-"}</span>
                </div>

                <div className="detail-row">
                  <strong>Procedures:</strong>
                  <span>{selectedRecord.procedures || "-"}</span>
                </div>

                <div className="detail-row">
                  <strong>Weight:</strong>

                  <span>
                    {selectedRecord.weight !== "" &&
                    selectedRecord.weight !== null &&
                    selectedRecord.weight !== undefined
                      ? `${selectedRecord.weight} kg`
                      : "-"}
                  </span>
                </div>

                <div className="detail-row">
                  <strong>Diagnosis:</strong>
                  <span>{selectedRecord.diagnosis || "-"}</span>
                </div>

                <div className="detail-row">
                  <strong>Treatment:</strong>
                  <span>{selectedRecord.treatment || "-"}</span>
                </div>

                <div className="detail-row">
                  <strong>Follow-up Date:</strong>

                  <span>{formatDate(selectedRecord.followUpDate)}</span>
                </div>

                <div className="detail-row">
                  <strong>File:</strong>
                  <span>{selectedRecord.fileName || "-"}</span>
                </div>

                <div className="detail-row">
                  <strong>Notes:</strong>
                  <span>{selectedRecord.notes || "-"}</span>
                </div>
              </div>

              <div className="medical-workflow-actions">
                <button
                  type="button"
                  className="icon-button delete-button"
                  onClick={() => handleDeleteRecord(selectedRecord.id)}
                  title="Delete medical record"
                  aria-label="Delete medical record"
                  disabled={isSaving}
                >
                  <FaTrash />
                </button>

                <button
                  type="button"
                  className="medical-workflow-button medical-workflow-secondary"
                  onClick={handleCloseView}
                  disabled={isSaving}
                >
                  Close
                </button>

                <button
                  type="button"
                  className="medical-workflow-button medical-workflow-secondary"
                  onClick={() => handleOpenEdit(selectedRecord)}
                  disabled={isSaving}
                >
                  <FaPen />
                  Edit
                </button>

                {selectedRecord.status === "Completed" && (
                  <button
                    type="button"
                    className="medical-workflow-button medical-workflow-primary"
                    onClick={() => handleCreateInvoice(selectedRecord)}
                    disabled={isSaving}
                  >
                    Create Invoice
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {showEditModal && selectedRecord && (
          <div className="modal-overlay">
            <div className="modal-container medical-record-form-modal">
              <div className="modal-header">
                <div>
                  <h2>Edit Medical Record</h2>
                  <p>Update medical record information.</p>
                </div>

                <button
                  type="button"
                  className="modal-close"
                  onClick={handleCloseEdit}
                  aria-label="Close edit medical record"
                  disabled={isSaving}
                >
                  <FaTimes />
                </button>
              </div>

              <form
                className="medical-compact-form"
                onSubmit={handleUpdateRecord}
                aria-busy={isSaving}
              >
                <div className="medical-compact-body">
                  {renderMedicalFields(selectedRecord, "edit")}
                </div>

                <div className="medical-workflow-actions medical-compact-footer">
                  <button
                    type="button"
                    className="medical-workflow-button medical-workflow-secondary"
                    onClick={handleCloseEdit}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="medical-workflow-button medical-workflow-primary"
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
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

export default MedicalRecords;
