import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

import {
  FaEye,
  FaPen,
  FaTrash,
  FaFileExcel,
  FaSearch,
  FaTimes,
  FaPrescription,
} from "react-icons/fa";

import * as XLSX from "xlsx";
import { getClinicOptions } from "../data/clinicOptionsApi";

const MEDICATIONS_API = "/api/medications";

const getOwnerName = (owner) =>
  `${owner?.firstName || ""} ${owner?.lastName || ""}`.trim();

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMedicationStatus(medication, today = getLocalDateString()) {
  const endDate = String(medication.endDate || "").slice(0, 10);

  return endDate && endDate < today ? "Past" : "Active";
}

const getEmptyMedication = () => ({
  petId: "",
  pet: "",
  ownerId: "",
  owner: "",
  medication: "",
  dosage: "",
  frequency: "",
  route: "Oral",
  startDate: "",
  endDate: "",
  instructions: "",
  status: "Active",
});

async function requestMedicationData(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    cache: "no-store",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = "Unable to complete the request.";

    if (response.status === 401) {
      message = "Your session has expired. Please sign in again.";
    } else if (response.status === 403) {
      message = "You do not have access to these records.";
    } else if (response.status === 404) {
      message = "The requested record was not found.";
    }

    try {
      const problem = await response.json();

      if (response.status !== 401 && response.status !== 403) {
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

function normalizeMedication(medication) {
  return {
    ...medication,
    petId: String(medication.petId ?? ""),
    ownerId: String(medication.ownerId ?? ""),
    pet: medication.pet || "",
    owner: medication.owner || "",
    medication: medication.medication || "",
    dosage: medication.dosage || "",
    frequency: medication.frequency || "",
    route: medication.route || "Oral",
    startDate: medication.startDate || "",
    endDate: medication.endDate || "",
    instructions: medication.instructions || "",
    status: getMedicationStatus(medication),
  };
}

function medicationPayload(medication) {
  return {
    petId: Number(medication.petId),
    medication: medication.medication.trim(),
    dosage: medication.dosage.trim(),
    frequency: medication.frequency.trim(),
    route: medication.route.trim(),
    startDate: medication.startDate || null,
    endDate: medication.endDate || null,
    instructions: medication.instructions.trim(),
    status: getMedicationStatus(medication),
  };
}

function MedicationSearchInput({
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
  const inputRef = useRef(null);

  const query = String(value || "")
    .trim()
    .toLowerCase();

  const matches = options.filter((option) =>
    option.label.toLowerCase().includes(query)
  );

  useEffect(() => {
    const handleOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleOutside);

    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    if (activeIndex >= 0) {
      listRef.current
        ?.querySelector(`[data-index="${activeIndex}"]`)
        ?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  useEffect(() => {
    inputRef.current?.setCustomValidity(
      value && !selectedId
        ? "Please select an existing name from the suggestions."
        : ""
    );
  }, [value, selectedId]);

  const choose = (option) => {
    inputRef.current?.setCustomValidity("");
    onSelect(option.record);
    setOpen(false);
    setActiveIndex(-1);
  };

  return (
    <div
      ref={wrapperRef}
      className="medication-search-input"
      style={{
        position: "relative",
        width: "100%",
        minWidth: 0,
      }}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        value={value || ""}
        placeholder={placeholder}
        disabled={disabled}
        required
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open && !disabled}
        aria-controls={`${inputId}-options`}
        aria-activedescendant={
          open && activeIndex >= 0
            ? `${inputId}-option-${activeIndex}`
            : undefined
        }
        onFocus={() => {
          setOpen(true);
          setActiveIndex(-1);
        }}
        onChange={(event) => {
          event.target.setCustomValidity("");
          onType(event.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onBlur={(event) => {
          if (!wrapperRef.current?.contains(event.relatedTarget)) {
            setOpen(false);
            setActiveIndex(-1);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
            setActiveIndex(-1);
          } else if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((previous) =>
              Math.min(previous + 1, matches.length - 1)
            );
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((previous) =>
              matches.length ? Math.max(previous - 1, 0) : -1
            );
          } else if (
            event.key === "Enter" &&
            open &&
            activeIndex >= 0 &&
            matches[activeIndex]
          ) {
            event.preventDefault();
            choose(matches[activeIndex]);
          }
        }}
        style={{ width: "100%", boxSizing: "border-box" }}
      />

      {open && !disabled && (
        <div
          ref={listRef}
          id={`${inputId}-options`}
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 100,
            maxHeight: "190px",
            overflowY: "auto",
            overscrollBehavior: "contain",
            background: "#ffffff",
            border: "1px solid #d5e5e3",
            borderRadius: "8px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          }}
        >
          {matches.length ? (
            matches.map((option, index) => (
              <div
                key={option.id}
                id={`${inputId}-option-${index}`}
                data-index={index}
                role="option"
                aria-selected={String(selectedId) === String(option.id)}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(option)}
                style={{
                  padding: "10px 12px",
                  fontSize: "13px",
                  cursor: "pointer",
                  color: "#354d4b",
                  background: activeIndex === index ? "#e8f7f5" : "#ffffff",
                  overflowWrap: "anywhere",
                }}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div
              style={{
                padding: "11px 12px",
                color: "#778985",
                fontSize: "13px",
              }}
            >
              {emptyMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Medications() {
  const navigate = useNavigate();
  const [medicationStatuses, setMedicationStatuses] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    getClinicOptions({
      listKey: "medication",
      signal: controller.signal,
    })
      .then((options) => {
        setMedicationStatuses(
          options
            .filter((option) => option.isActive)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((option) => option.value)
        );
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          window.alert(error.message);
        }
      });

    return () => controller.abort();
  }, []);
  const [medications, setMedications] = useState([]);
  const [pets, setPets] = useState([]);
  const [owners, setOwners] = useState([]);

  const [today, setToday] = useState(getLocalDateString);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [routeFilter, setRouteFilter] = useState("All");

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedMedication, setSelectedMedication] = useState(null);
  const [medicationToDelete, setMedicationToDelete] = useState(null);
  const [newMedication, setNewMedication] = useState(getEmptyMedication);

  useEffect(() => {
    let timer;

    const refreshDate = () => {
      window.clearTimeout(timer);
      setToday(getLocalDateString());

      const now = new Date();
      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      );

      timer = window.setTimeout(
        refreshDate,
        nextMidnight.getTime() - now.getTime() + 100
      );
    };

    const handleVisibility = () => {
      if (!document.hidden) refreshDate();
    };

    refreshDate();
    window.addEventListener("focus", refreshDate);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", refreshDate);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function load() {
      setIsLoading(true);
      setLoadError("");

      try {
        const [savedMedications, savedPets, savedOwners] = await Promise.all([
          requestMedicationData(MEDICATIONS_API, {
            signal: controller.signal,
          }),
          requestMedicationData("/api/pets", {
            signal: controller.signal,
          }),
          requestMedicationData("/api/owners", {
            signal: controller.signal,
          }),
        ]);

        if (
          !Array.isArray(savedMedications) ||
          !Array.isArray(savedPets) ||
          !Array.isArray(savedOwners)
        ) {
          throw new Error("The server returned invalid records.");
        }

        if (!active) return;

        setMedications(savedMedications.map(normalizeMedication));

        setPets(
          [...savedPets].sort((a, b) =>
            (a.name || "").localeCompare(b.name || "")
          )
        );

        setOwners(
          [...savedOwners].sort((a, b) =>
            getOwnerName(a).localeCompare(getOwnerName(b))
          )
        );
      } catch (error) {
        if (!active || error.name === "AbortError") return;

        setLoadError(error.message || "Unable to load medications.");
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

  const datedMedications = useMemo(
    () =>
      medications.map((item) => ({
        ...item,
        status: getMedicationStatus(item, today),
      })),
    [medications, today]
  );

  const filteredMedications = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return datedMedications.filter((item) => {
      const matchesSearch = [
        item.pet,
        item.owner,
        item.medication,
        item.dosage,
        item.frequency,
        item.route,
        item.instructions,
        item.status,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(searchText)
      );

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      const matchesRoute = routeFilter === "All" || item.route === routeFilter;

      return matchesSearch && matchesStatus && matchesRoute;
    });
  }, [datedMedications, search, statusFilter, routeFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMedications.length / rowsPerPage)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, routeFilter, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const startIndex = (safeCurrentPage - 1) * rowsPerPage;

  const paginatedMedications = filteredMedications.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setRouteFilter("All");
    setCurrentPage(1);
  };

  const hasFilters =
    search !== "" || statusFilter !== "All" || routeFilter !== "All";

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

  const notifyMedicationsChanged = () => {
    window.dispatchEvent(new Event("vetClinicMedicationsUpdated"));
  };

  const handleOpenAdd = () => {
    if (isLoading || loadError || savingRef.current) return;
    setNewMedication(getEmptyMedication());
    setShowAddModal(true);
  };

  const handleCloseAdd = () => {
    if (savingRef.current) return;
    setShowAddModal(false);
    setNewMedication(getEmptyMedication());
  };

  const applyPetSelection = (previous, pet) => {
    if (!pet) return { ...previous, petId: "", pet: "" };

    const owner = owners.find(
      (item) => String(item.id) === String(pet.ownerId)
    );

    return {
      ...previous,
      petId: String(pet.id),
      pet: pet.name || "",
      ownerId: String(pet.ownerId ?? ""),
      owner: owner ? getOwnerName(owner) : pet.owner || "",
    };
  };

  const updateSelection = (mode, updater) => {
    if (savingRef.current) return;

    const setter = mode === "edit" ? setSelectedMedication : setNewMedication;

    setter((previous) => (previous ? updater(previous) : previous));
  };

  const handleOwnerType = (mode, value) => {
    updateSelection(mode, (previous) => ({
      ...previous,
      owner: value,
      ownerId: "",
      pet: "",
      petId: "",
    }));
  };

  const handleOwnerSelect = (mode, owner) => {
    updateSelection(mode, (previous) => {
      const ownerPets = pets.filter(
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
    updateSelection(mode, (previous) => ({
      ...previous,
      pet: value,
      petId: "",
    }));
  };

  const handlePetSelect = (mode, pet) => {
    updateSelection(mode, (previous) => applyPetSelection(previous, pet));
  };

  const changeMedicationField = (previous, name, value) => {
    if (name === "petId") {
      const pet = pets.find((item) => String(item.id) === String(value));

      return applyPetSelection(previous, pet);
    }

    const updated = { ...previous, [name]: value };

    return {
      ...updated,
      status: getMedicationStatus(updated),
    };
  };

  const handleNewMedicationChange = (e) => {
    const { name, value } = e.target;

    setNewMedication((previous) =>
      changeMedicationField(previous, name, value)
    );
  };

  const validateMedication = (medication) => {
    const petId = Number(medication.petId);
    const pet = pets.find((item) => Number(item.id) === petId);

    if (!Number.isInteger(petId) || petId <= 0 || !pet) {
      throw new Error("Please select a pet from the suggestions.");
    }

    if (
      !medication.ownerId ||
      !owners.some(
        (owner) => String(owner.id) === String(medication.ownerId)
      ) ||
      String(pet.ownerId) !== String(medication.ownerId)
    ) {
      throw new Error("Please select the correct owner from the suggestions.");
    }

    const fields = [
      ["Medication", medication.medication, 200],
      ["Dosage", medication.dosage, 200],
      ["Frequency", medication.frequency, 200],
      ["Route", medication.route, 100],
    ];

    for (const [label, value, maxLength] of fields) {
      if (!value.trim()) {
        throw new Error(`Please enter ${label.toLowerCase()}.`);
      }

      if (value.trim().length > maxLength) {
        throw new Error(`${label} must be ${maxLength} characters or fewer.`);
      }
    }

    if (!medication.startDate) {
      throw new Error("Please select a start date.");
    }

    if (medication.endDate && medication.endDate < medication.startDate) {
      throw new Error("End date cannot be before the start date.");
    }

    if (medication.instructions.trim().length > 4000) {
      throw new Error("Instructions must be 4000 characters or fewer.");
    }
  };

  const handleAddMedication = async (e) => {
    e.preventDefault();
    if (!beginSave()) return;

    try {
      validateMedication(newMedication);

      const response = await requestMedicationData(MEDICATIONS_API, {
        method: "POST",
        body: JSON.stringify(medicationPayload(newMedication)),
      });

      const saved = normalizeMedication(response);

      setMedications((previous) => [...previous, saved]);
      setNewMedication(getEmptyMedication());
      setShowAddModal(false);
      setCurrentPage(1);
      notifyMedicationsChanged();
    } catch (error) {
      window.alert(error.message || "Unable to save the medication.");
    } finally {
      endSave();
    }
  };

  const handleViewMedication = (medication) => {
    if (savingRef.current) return;
    setSelectedMedication(medication);
    setShowViewModal(true);
  };

  const handleCloseView = () => {
    if (savingRef.current) return;
    setShowViewModal(false);
    setSelectedMedication(null);
  };

  const handleOpenEdit = (medication) => {
    if (savingRef.current) return;

    const pet = pets.find(
      (item) => String(item.id) === String(medication.petId)
    );

    setSelectedMedication(
      pet ? applyPetSelection({ ...medication }, pet) : { ...medication }
    );

    setShowViewModal(false);
    setShowEditModal(true);
  };

  const handleCloseEdit = () => {
    if (savingRef.current) return;
    setShowEditModal(false);
    setSelectedMedication(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setSelectedMedication((previous) =>
      changeMedicationField(previous, name, value)
    );
  };

  const handleUpdateMedication = async (e) => {
    e.preventDefault();
    if (!selectedMedication || !beginSave()) return;

    try {
      validateMedication(selectedMedication);

      const response = await requestMedicationData(
        `${MEDICATIONS_API}/${encodeURIComponent(selectedMedication.id)}`,
        {
          method: "PUT",
          body: JSON.stringify(medicationPayload(selectedMedication)),
        }
      );

      const saved = normalizeMedication(response);

      setMedications((previous) =>
        previous.map((item) => (item.id === saved.id ? saved : item))
      );

      setShowEditModal(false);
      setSelectedMedication(null);
      notifyMedicationsChanged();
    } catch (error) {
      window.alert(error.message || "Unable to update the medication.");
    } finally {
      endSave();
    }
  };

  const handleOpenDelete = (medication) => {
    if (savingRef.current) return;
    setMedicationToDelete(medication);
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    if (savingRef.current) return;
    setShowDeleteModal(false);
    setMedicationToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!medicationToDelete || !beginSave()) return;

    try {
      const id = medicationToDelete.id;

      await requestMedicationData(
        `${MEDICATIONS_API}/${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );

      setMedications((previous) => previous.filter((item) => item.id !== id));

      setShowDeleteModal(false);
      setMedicationToDelete(null);

      if (selectedMedication?.id === id) {
        setShowViewModal(false);
        setShowEditModal(false);
        setSelectedMedication(null);
      }

      notifyMedicationsChanged();
    } catch (error) {
      window.alert(error.message || "Unable to delete the medication.");
    } finally {
      endSave();
    }
  };

  const handleCreatePrescription = (medication) => {
    const status = getMedicationStatus(medication);

    if (savingRef.current || status !== "Active") return;

    navigate("/prescriptions", {
      state: {
        openAddPrescription: true,
        medicationId: medication.id,
        petId: Number(medication.petId),
        ownerId: Number(medication.ownerId),
        pet: medication.pet,
        petName: medication.pet,
        owner: medication.owner,
        ownerName: medication.owner,
        medication: medication.medication,
        medicationName: medication.medication,
        dosage: medication.dosage,
        frequency: medication.frequency,
        route: medication.route,
        startDate: medication.startDate,
        endDate: medication.endDate,
        instructions: medication.instructions,
        medicationData: { ...medication, status },
      },
    });
  };

  const getStatusClass = (status) =>
    status === "Active" ? "status confirmed" : "status cancelled";

  const formatDate = (date) => {
    if (!date) return "—";
    const parts = date.split("-");
    if (parts.length !== 3) return date;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const exportToExcel = () => {
    const excelData = filteredMedications.map((item) => ({
      Pet: item.pet,
      Owner: item.owner,
      Medication: item.medication,
      Dosage: item.dosage,
      Frequency: item.frequency,
      Route: item.route,
      "Start Date": item.startDate,
      "End Date": item.endDate,
      Instructions: item.instructions,
      Status: item.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    worksheet["!cols"] = [
      { wch: 18 },
      { wch: 22 },
      { wch: 24 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 35 },
      { wch: 12 },
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Pet Medications");

    XLSX.writeFile(workbook, "vet-clinic-pet-medications.xlsx");
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
  };

  const prescriptionButtonStyle = {
    width: "auto",
    minWidth: "0",
    height: "32px",
    padding: "0 10px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    border: "1px solid #54b7b5",
    borderRadius: "6px",
    backgroundColor: "#54b7b5",
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: "600",
    lineHeight: "1",
    whiteSpace: "nowrap",
    cursor: "pointer",
  };
  const renderMedicationFields = (data, onChange, mode) => {
    const availablePets = data.ownerId
      ? pets.filter((pet) => String(pet.ownerId) === String(data.ownerId))
      : pets;

    return (
      <>
        <div className="form-row">
          <div className="form-field">
            <label htmlFor={`${mode}-medication-owner`}>Owner</label>

            <MedicationSearchInput
              inputId={`${mode}-medication-owner`}
              value={data.owner}
              selectedId={data.ownerId}
              options={owners.map((owner) => ({
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
            <label htmlFor={`${mode}-medication-pet`}>Pet</label>

            <MedicationSearchInput
              inputId={`${mode}-medication-pet`}
              value={data.pet}
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
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor={`${mode}-medication-name`}>Medication</label>

            <input
              id={`${mode}-medication-name`}
              type="text"
              name="medication"
              placeholder="Enter medication name"
              value={data.medication || ""}
              onChange={onChange}
              maxLength={200}
              required
              disabled={isSaving}
            />
          </div>

          <div className="form-field">
            <label htmlFor={`${mode}-medication-dosage`}>Dosage</label>

            <input
              id={`${mode}-medication-dosage`}
              type="text"
              name="dosage"
              placeholder="Example: 250 mg"
              value={data.dosage || ""}
              onChange={onChange}
              maxLength={200}
              required
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor={`${mode}-medication-frequency`}>Frequency</label>

            <input
              id={`${mode}-medication-frequency`}
              type="text"
              name="frequency"
              placeholder="Example: Twice daily"
              value={data.frequency || ""}
              onChange={onChange}
              maxLength={200}
              required
              disabled={isSaving}
            />
          </div>

          <div className="form-field">
            <label htmlFor={`${mode}-medication-route`}>Route</label>

            <select
              id={`${mode}-medication-route`}
              name="route"
              value={data.route || "Oral"}
              onChange={onChange}
              required
              disabled={isSaving}
            >
              {data.route &&
                ![
                  "Oral",
                  "Injection",
                  "Topical",
                  "Ophthalmic",
                  "Otic",
                  "Inhalation",
                  "Other",
                ].includes(data.route) && (
                  <option value={data.route}>{data.route}</option>
                )}

              <option value="Oral">Oral</option>
              <option value="Injection">Injection</option>
              <option value="Topical">Topical</option>
              <option value="Ophthalmic">Ophthalmic</option>
              <option value="Otic">Otic</option>
              <option value="Inhalation">Inhalation</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor={`${mode}-medication-start`}>Start Date</label>

            <input
              id={`${mode}-medication-start`}
              type="date"
              name="startDate"
              value={data.startDate || ""}
              onChange={onChange}
              required
              disabled={isSaving}
            />
          </div>

          <div className="form-field">
            <label htmlFor={`${mode}-medication-end`}>End Date</label>

            <input
              id={`${mode}-medication-end`}
              type="date"
              name="endDate"
              value={data.endDate || ""}
              min={data.startDate || undefined}
              onChange={onChange}
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor={`${mode}-medication-instructions`}>
            Instructions
          </label>

          <textarea
            id={`${mode}-medication-instructions`}
            name="instructions"
            placeholder="Enter medication instructions"
            value={data.instructions || ""}
            onChange={onChange}
            rows={3}
            maxLength={4000}
            disabled={isSaving}
          />
        </div>

        <div className="form-field">
          <label htmlFor={`${mode}-medication-status`}>Status</label>

          <input
            id={`${mode}-medication-status`}
            type="text"
            value={getMedicationStatus(data, today)}
            readOnly
            aria-readonly="true"
          />
        </div>
      </>
    );
  };

  const selectedMedicationStatus = selectedMedication
    ? getMedicationStatus(selectedMedication, today)
    : "Active";

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <style>{`
        .medications-main-table {
          min-width: 1180px;
        }

        .medications-main-table th,
        .medications-main-table td {
          white-space: nowrap;
        }

        .medication-instructions-cell {
          max-width: 220px;
          min-width: 180px;
          white-space: normal !important;
          line-height: 1.4;
        }

        .medications-actions-cell {
          min-width: 225px;
        }

        .medication-prescription-button:hover {
          background: #359f9b !important;
          border-color: #359f9b !important;
        }

        .medication-status-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 62px;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
        }

        .medication-status-active {
          color: #238d78;
          background: #e1f5ef;
        }

        .medication-status-past {
          color: #788685;
          background: #edf1f1;
        }

        .medication-detail-status {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 5px 11px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
        }

        .medications-modal-prescription {
          width: auto !important;
          min-width: 0 !important;
          height: 38px !important;
          padding: 0 14px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 6px !important;
          border: 1px solid #54b7b5 !important;
          border-radius: 7px !important;
          background: #54b7b5 !important;
          color: #ffffff !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          white-space: nowrap !important;
          cursor: pointer !important;
        }

        .medications-modal-prescription:hover {
          background: #359f9b !important;
          border-color: #359f9b !important;
        }

        html body #root
        .medication-form-modal form > .form-row {
          margin-top: 0 !important;
          margin-bottom: 18px !important;
          align-items: flex-start !important;
        }

        html body #root
        .medication-form-modal form > .form-field {
          margin-top: 0 !important;
          margin-bottom: 18px !important;
        }

        html body #root
        .medication-form-modal .form-row > .form-field {
          min-width: 0 !important;
          margin-top: 0 !important;
          margin-bottom: 0 !important;
        }

        html body #root
        .medication-form-modal .form-field > label {
          display: block !important;
          margin-top: 0 !important;
          margin-bottom: 8px !important;
        }

        html body #root
        .medication-form-modal .medication-search-input {
          width: 100%;
          min-width: 0;
        }

        html body #root
        .medication-form-modal .medication-search-input input {
          width: 100% !important;
          margin-bottom: 0 !important;
          box-sizing: border-box !important;
        }

        html body #root
        .medication-form-modal
        .medication-search-input [role="option"] {
          -webkit-text-fill-color: currentColor;
        }

        @media (max-width: 600px) {
          html body #root
          .medication-form-modal form > .form-row {
            row-gap: 18px !important;
          }
        }
      `}</style>

      <main className="dashboard-main medications-page">
        <div className="page-header">
          <div>
            <h1>Medications</h1>
            <p>Manage medications currently or previously taken by pets</p>
          </div>
        </div>

        {loadError && (
          <div role="alert" style={{ marginBottom: 16 }}>
            <p style={{ color: "#c0392b" }}>{loadError}</p>

            <button
              type="button"
              onClick={() => setReloadKey((previous) => previous + 1)}
              disabled={isLoading}
            >
              Retry
            </button>
          </div>
        )}

        <div className="medications-filter-row">
          <div className="medications-search-box">
            <FaSearch className="medications-search-icon" />

            <input
              type="text"
              placeholder="Search pet or medication..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {hasFilters && (
              <button
                type="button"
                className="medications-clear-button"
                onClick={clearFilters}
                title="Clear filters"
                aria-label="Clear filters"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <select
            className="medications-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            {medicationStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            className="medications-filter-select"
            value={routeFilter}
            onChange={(e) => setRouteFilter(e.target.value)}
          >
            <option value="All">All Routes</option>
            <option value="Oral">Oral</option>
            <option value="Injection">Injection</option>
            <option value="Topical">Topical</option>
            <option value="Ophthalmic">Ophthalmic</option>
            <option value="Otic">Otic</option>
            <option value="Inhalation">Inhalation</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="medications-toolbar-buttons">
          <button
            type="button"
            className="medications-export-button"
            onClick={exportToExcel}
            disabled={isLoading || Boolean(loadError)}
          >
            <FaFileExcel />
            <span>Export</span>
          </button>

          <button
            type="button"
            className="medications-add-button"
            onClick={handleOpenAdd}
            disabled={isLoading || Boolean(loadError) || isSaving}
          >
            + Add Medication
          </button>
        </div>

        <div className="owners-table-container medications-table-container">
          <div className="medications-table-scroll">
            <table className="owners-table medications-table medications-main-table">
              <thead>
                <tr>
                  <th>Pet</th>
                  <th>Medication</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Route</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Instructions</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="no-results">
                      Loading medications...
                    </td>
                  </tr>
                ) : loadError ? (
                  <tr>
                    <td colSpan={10} className="no-results">
                      Unable to load medications.
                    </td>
                  </tr>
                ) : paginatedMedications.length > 0 ? (
                  paginatedMedications.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.pet}</strong>

                        {item.owner && (
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#849291",
                              marginTop: "3px",
                            }}
                          >
                            {item.owner}
                          </div>
                        )}
                      </td>

                      <td>{item.medication}</td>
                      <td>{item.dosage}</td>
                      <td>{item.frequency}</td>
                      <td>{item.route}</td>
                      <td>{formatDate(item.startDate)}</td>
                      <td>{formatDate(item.endDate)}</td>

                      <td className="medication-instructions-cell">
                        {item.instructions || "—"}
                      </td>

                      <td>
                        <span
                          className={`medication-status-badge ${
                            item.status === "Active"
                              ? "medication-status-active"
                              : "medication-status-past"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="medications-actions-cell">
                        <div className="table-actions">
                          <button
                            type="button"
                            className="view-button icon-button"
                            onClick={() => handleViewMedication(item)}
                            title="View"
                            aria-label="View medication"
                            disabled={isSaving}
                          >
                            <FaEye />
                          </button>

                          <button
                            type="button"
                            className="edit-button icon-button"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit"
                            aria-label="Edit medication"
                            disabled={isSaving}
                          >
                            <FaPen />
                          </button>

                          <button
                            type="button"
                            className="delete-button icon-button"
                            onClick={() => handleOpenDelete(item)}
                            title="Delete"
                            aria-label="Delete medication"
                            disabled={isSaving}
                          >
                            <FaTrash />
                          </button>

                          {item.status === "Active" && (
                            <button
                              type="button"
                              className="medication-prescription-button"
                              style={prescriptionButtonStyle}
                              onClick={() => handleCreatePrescription(item)}
                              title="Create Prescription"
                              aria-label="Create prescription"
                              disabled={isSaving}
                            >
                              <FaPrescription />
                              <span></span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="no-results">
                      No medications found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="medications-pagination">
          <div className="medications-rows-per-page">
            <span>Rows per page:</span>

            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div
            className="medications-page-controls"
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
              onClick={() => setCurrentPage(Math.max(safeCurrentPage - 1, 1))}
              aria-label="Previous page"
              style={
                safeCurrentPage === 1
                  ? paginationDisabledStyle
                  : paginationButtonStyle
              }
            >
              &lt;
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <button
                  type="button"
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  aria-current={safeCurrentPage === page ? "page" : undefined}
                  style={
                    safeCurrentPage === page
                      ? paginationActiveStyle
                      : paginationButtonStyle
                  }
                >
                  {page}
                </button>
              )
            )}

            <button
              type="button"
              disabled={safeCurrentPage === totalPages}
              onClick={() =>
                setCurrentPage(Math.min(safeCurrentPage + 1, totalPages))
              }
              aria-label="Next page"
              style={
                safeCurrentPage === totalPages
                  ? paginationDisabledStyle
                  : paginationButtonStyle
              }
            >
              &gt;
            </button>
          </div>
        </div>
      </main>

      {showAddModal && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseAdd();
            }
          }}
        >
          <div className="modal-container medication-form-modal">
            <div className="modal-header">
              <div>
                <h2>Add Medication</h2>
                <p>Add a medication that a pet is taking</p>
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

            <form onSubmit={handleAddMedication} aria-busy={isSaving}>
              {renderMedicationFields(
                newMedication,
                handleNewMedicationChange,
                "add"
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={handleCloseAdd}
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Add Medication"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedMedication && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseView();
            }
          }}
        >
          <div className="modal-container">
            <div className="modal-header">
              <div>
                <h2>Medication Details</h2>
                <p>View pet medication information</p>
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
              <span>Pet</span>
              <strong>{selectedMedication.pet}</strong>
            </div>

            <div className="detail-row">
              <span>Owner</span>
              <strong>{selectedMedication.owner || "—"}</strong>
            </div>

            <div className="detail-row">
              <span>Medication</span>
              <strong>{selectedMedication.medication}</strong>
            </div>

            <div className="detail-row">
              <span>Dosage</span>
              <strong>{selectedMedication.dosage}</strong>
            </div>

            <div className="detail-row">
              <span>Frequency</span>
              <strong>{selectedMedication.frequency}</strong>
            </div>

            <div className="detail-row">
              <span>Route</span>
              <strong>{selectedMedication.route}</strong>
            </div>

            <div className="detail-row">
              <span>Start Date</span>
              <strong>{formatDate(selectedMedication.startDate)}</strong>
            </div>

            <div className="detail-row">
              <span>End Date</span>
              <strong>{formatDate(selectedMedication.endDate)}</strong>
            </div>

            <div className="detail-row">
              <span>Instructions</span>
              <strong>{selectedMedication.instructions || "—"}</strong>
            </div>

            <div className="detail-row">
              <span>Status</span>

              <strong>
                <span
                  className={`medication-detail-status ${
                    selectedMedicationStatus === "Active"
                      ? "medication-status-active"
                      : "medication-status-past"
                  }`}
                >
                  {selectedMedicationStatus}
                </span>
              </strong>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="modal-cancel-button"
                onClick={handleCloseView}
                disabled={isSaving}
              >
                Close
              </button>

              <button
                type="button"
                className="edit-button medications-modal-edit"
                onClick={() => handleOpenEdit(selectedMedication)}
                disabled={isSaving}
              >
                <FaPen />
                <span>Edit Medication</span>
              </button>

              {selectedMedicationStatus === "Active" && (
                <button
                  type="button"
                  className="medications-modal-prescription"
                  onClick={() => handleCreatePrescription(selectedMedication)}
                  disabled={isSaving}
                >
                  <FaPrescription />
                  <span>Create Prescription</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedMedication && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseEdit();
            }
          }}
        >
          <div className="modal-container medication-form-modal">
            <div className="modal-header">
              <div>
                <h2>Edit Medication</h2>
                <p>Update pet medication information</p>
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

            <form onSubmit={handleUpdateMedication} aria-busy={isSaving}>
              {renderMedicationFields(
                selectedMedication,
                handleEditChange,
                "edit"
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={handleCloseEdit}
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && medicationToDelete && (
        <div
          className="medications-delete-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              handleCancelDelete();
            }
          }}
        >
          <div className="medications-delete-dialog">
            <div className="medications-delete-icon">
              <FaTrash />
            </div>

            <h3>Delete Medication</h3>

            <p>
              Are you sure you want to delete{" "}
              <strong>{medicationToDelete.medication}</strong> for{" "}
              <strong>{medicationToDelete.pet}</strong>?
            </p>

            <div className="medications-delete-actions">
              <button
                type="button"
                className="medications-delete-cancel"
                onClick={handleCancelDelete}
                disabled={isSaving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="medications-delete-confirm"
                onClick={handleConfirmDelete}
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

export default Medications;
