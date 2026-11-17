import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

import {
  FaEye,
  FaPen,
  FaTrash,
  FaSearch,
  FaTimes,
  FaFileExcel,
  FaPrint,
} from "react-icons/fa";

import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";

const readPrintClinicName = () => {
  try {
    const settings = JSON.parse(
      localStorage.getItem("storeSettings") || "{}"
    );

    return String(settings?.storeName || "").trim();
  } catch {
    return "";
  }
};

const readPrintClinicLogo = () => {
  try {
    const settings = JSON.parse(
      localStorage.getItem("storeSettings") || "{}"
    );

    return typeof settings?.storeBanner === "string"
      ? settings.storeBanner.trim()
      : "";
  } catch {
    return "";
  }
};

const loadPrintLogo = (source) =>
  new Promise((resolve) => {
    if (!source) {
      resolve(null);
      return;
    }

    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      try {
        const width = image.naturalWidth;
        const height = image.naturalHeight;

        if (!width || !height) {
          resolve(null);
          return;
        }

        const canvas = document.createElement("canvas");
        const scale = Math.min(1, 1200 / Math.max(width, height));

        canvas.width = Math.max(1, Math.round(width * scale));
        canvas.height = Math.max(1, Math.round(height * scale));

        const context = canvas.getContext("2d");

        if (!context) {
          resolve(null);
          return;
        }

        context.drawImage(
          image,
          0,
          0,
          canvas.width,
          canvas.height
        );

        resolve({
          data: canvas.toDataURL("image/png"),
          width,
          height,
        });
      } catch {
        resolve(null);
      }
    };

    image.onerror = () => resolve(null);
    image.src = source;
  });

const emptyPrescription = () => ({
  petId: "",
  pet: "",
  ownerId: "",
  owner: "",
  clinic: "",
  veterinarian: "",
  date: "",
  medication: "",
  dosage: "",
  instructions: "",
});

const normalizePrescription = (item) => ({
  ...item,
  petId: String(item.petId || ""),
  ownerId: String(item.ownerId || ""),
  pet: item.pet || "",
  owner: item.owner || "",
  clinic: item.clinic || "",
  veterinarian: item.veterinarian || "",
  date: item.date || "",
  medication: item.medication || "",
  dosage: item.dosage || "",
  instructions: item.instructions || "",
});

async function prescriptionRequest(path, options = {}) {
  const response = await fetch(path, {
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
      message = "Your session has expired. Please sign in again.";
    } else if (response.status === 403) {
      message = "You do not have permission to access this data.";
    } else if (response.status === 404) {
      message = "The requested record could not be found.";
    } else {
      try {
        const problem = await response.json();
        const errors = Object.values(problem.errors || {})
          .flat()
          .filter((value) => typeof value === "string");

        message = errors.length
          ? errors.join("\n")
          : problem.detail || problem.title || message;
      } catch {
        // Keep the default message.
      }
    }

    throw new Error(message);
  }

  if (response.status === 204) return null;

  return response.json();
}
function PrescriptionNameSearch({
  value,
  selectedId,
  options,
  placeholder,
  onType,
  onSelect,
  disabled,
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const query = String(value || "").trim().toLowerCase();

  const matches = options.filter((option) =>
    option.label.toLowerCase().includes(query)
  );

  useEffect(() => {
    inputRef.current?.setCustomValidity(
      value && !selectedId
        ? "Please select a name from the suggestions."
        : ""
    );
  }, [value, selectedId]);

  useEffect(() => {
    const closeOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOutside);

    return () =>
      document.removeEventListener("mousedown", closeOutside);
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "relative",
        width: "100%",
        minWidth: 0,
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={value || ""}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        required
        aria-label={placeholder}
        aria-expanded={open}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          event.target.setCustomValidity("");
          onType(event.target.value);
          setOpen(true);
        }}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
        style={{
          width: "100%",
          boxSizing: "border-box",
        }}
      />

      {open && !disabled && (
        <div
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
            matches.map((option) => (
              <div
                key={option.id}
                onMouseDown={(event) => {
                  event.preventDefault();
                  inputRef.current?.setCustomValidity("");
                  onSelect(option.id);
                  setOpen(false);
                }}
                style={{
                  padding: "10px 12px",
                  fontSize: "13px",
                  color: "#354d4b",
                  cursor: "pointer",
                  overflowWrap: "anywhere",
                  background:
                    String(option.id) === String(selectedId)
                      ? "#e8f7f5"
                      : "#ffffff",
                }}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div
              style={{
                padding: "10px 12px",
                fontSize: "13px",
                color: "#778985",
              }}
            >
              No matching names found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Prescriptions() {
  const location = useLocation();
  const navigate = useNavigate();

  const CLINIC_SUBTITLE = "Veterinary Medical Center";

  const [prescriptions, setPrescriptions] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [pets, setPets] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);
  const receivedNavigation = useRef(null);

  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedPrescription, setSelectedPrescription] =
    useState(null);

  const [prescriptionToDelete, setPrescriptionToDelete] =
    useState(null);

  const [newPrescription, setNewPrescription] =
    useState(emptyPrescription);

  const CLINIC_NAME =
    readPrintClinicName() ||
    prescriptions.find((item) => item.clinic)?.clinic ||
    "";

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function load() {
      setIsLoading(true);
      setLoadError("");

      try {
        const [savedPrescriptions, savedPets, savedMedicalRecords] =
          await Promise.all([
            prescriptionRequest("/api/prescriptions", {
              signal: controller.signal,
            }),
            prescriptionRequest("/api/pets", {
              signal: controller.signal,
            }),
            prescriptionRequest("/api/medical-records", {
              signal: controller.signal,
            }),
          ]);

        if (
          !Array.isArray(savedPrescriptions) ||
          !Array.isArray(savedPets) ||
          !Array.isArray(savedMedicalRecords)
        ) {
          throw new Error("The server returned invalid records.");
        }

        if (!active) return;

        setPrescriptions(
          savedPrescriptions.map(normalizePrescription)
        );

        setPets(
          [...savedPets].sort((a, b) =>
            String(a.name || "").localeCompare(
              String(b.name || "")
            )
          )
        );

        setMedicalRecords(savedMedicalRecords);
      } catch (error) {
        if (!active || error.name === "AbortError") return;

        setLoadError(
          error.message || "Unable to load prescriptions."
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
    const refreshMedicalRecords = () => {
      if (!savingRef.current) {
        setReloadKey((previous) => previous + 1);
      }
    };

    window.addEventListener(
      "vetClinicMedicalRecordsUpdated",
      refreshMedicalRecords
    );

    return () => {
      window.removeEventListener(
        "vetClinicMedicalRecordsUpdated",
        refreshMedicalRecords
      );
    };
  }, []);

  const petOptions = pets;

  const getTreatmentOptions = (petId) => {
    if (!petId) return [];

    return [
      ...new Set(
        medicalRecords
          .filter(
            (record) =>
              String(record.petId) === String(petId)
          )
          .map((record) =>
            String(record.treatment || "").trim()
          )
          .filter(Boolean)
      ),
    ];
  };

  const getEmptyPrescription = () => ({
    ...emptyPrescription(),
    clinic: CLINIC_NAME,
  });

  const openMedicalRecords = (prescription) => {
    if (savingRef.current) return;

    navigate("/medical-records", {
      state: {
        prescriptionPet: prescription.pet || "",
        petId: prescription.petId
          ? Number(prescription.petId)
          : undefined,
      },
    });
  };

  useEffect(() => {
    if (
      isLoading ||
      loadError ||
      !location.state?.openAddPrescription ||
      receivedNavigation.current === location.key
    ) {
      return;
    }

    receivedNavigation.current = location.key;

    const state = location.state;
    const medicationData = state.medicationData || {};
    const requestedPetId = state.petId || medicationData.petId;

    const requestedPetName =
      state.pet ||
      state.petName ||
      medicationData.pet ||
      "";

    const matchedPet = requestedPetId
      ? pets.find(
          (pet) => String(pet.id) === String(requestedPetId)
        )
      : pets.find(
          (pet) =>
            String(pet.name || "").trim().toLowerCase() ===
            String(requestedPetName).trim().toLowerCase()
        );

    const today = new Date();
    const localDate = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");

    setNewPrescription({
      ...emptyPrescription(),
      clinic: CLINIC_NAME,
      petId: matchedPet ? String(matchedPet.id) : "",
      pet: matchedPet?.name || "",
      ownerId: String(matchedPet?.ownerId || ""),
      owner: matchedPet?.owner || "",
      date: localDate,
      medication:
        state.medication ||
        state.medicationName ||
        medicationData.medication ||
        "",
      dosage: state.dosage || medicationData.dosage || "",
      instructions:
        state.instructions ||
        medicationData.instructions ||
        "",
    });

    setShowAddModal(true);

    navigate(
      {
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
      },
      { replace: true, state: null }
    );
  }, [
    isLoading,
    loadError,
    location.key,
    location.state,
    location.pathname,
    location.search,
    location.hash,
    pets,
    CLINIC_NAME,
    navigate,
  ]);

  const filteredPrescriptions = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return prescriptions.filter((prescription) => {
      const searchableValues = [
        prescription.clinic,
        prescription.veterinarian,
        prescription.owner,
        prescription.pet,
        prescription.date,
        prescription.medication,
        prescription.dosage,
        prescription.instructions,
      ];

      const matchesSearch =
        !searchText ||
        searchableValues.some((value) =>
          String(value || "").toLowerCase().includes(searchText)
        );

      const matchesFrom =
        !dateFrom || prescription.date >= dateFrom;

      const matchesTo =
        !dateTo || prescription.date <= dateTo;

      return matchesSearch && matchesFrom && matchesTo;
    });
  }, [prescriptions, search, dateFrom, dateTo]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPrescriptions.length / rowsPerPage)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, dateFrom, dateTo, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (safeCurrentPage - 1) * rowsPerPage;

  const paginatedPrescriptions = filteredPrescriptions.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const clearFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const hasFilters =
    search.trim() !== "" ||
    dateFrom !== "" ||
    dateTo !== "";

  const formatDate = (date) => {
    if (!date) return "—";

    const parts = String(date).split("-");

    if (parts.length !== 3) return String(date);

    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
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

  const notifyUpdated = () => {
    window.dispatchEvent(
      new Event("vetClinicPrescriptionsUpdated")
    );
  };
  const changePrescriptionField = (previous, name, value) => {
    if (name === "ownerSearch") {
      return {
        ...previous,
        owner: value,
        ownerId: "",
        pet: "",
        petId: "",
        medication: "",
      };
    }

    if (name === "petSearch") {
      return {
        ...previous,
        pet: value,
        petId: "",
        medication: "",
      };
    }

    if (name === "ownerId") {
      const ownerPets = pets.filter(
        (pet) => String(pet.ownerId) === String(value)
      );

      const currentPet = ownerPets.find(
        (pet) => String(pet.id) === String(previous.petId)
      );

      const selectedPet =
        currentPet ||
        (ownerPets.length === 1 ? ownerPets[0] : null);

      const samePet =
        selectedPet &&
        String(selectedPet.id) === String(previous.petId);

      return {
        ...previous,
        ownerId: String(value),
        owner: ownerPets[0]?.owner || "",
        petId: selectedPet ? String(selectedPet.id) : "",
        pet: selectedPet?.name || "",
        medication: samePet ? previous.medication : "",
      };
    }

    if (name === "petId") {
      const pet = pets.find(
        (item) => String(item.id) === String(value)
      );

      return {
        ...previous,
        petId: pet ? String(pet.id) : "",
        pet: pet?.name || "",
        ownerId: String(pet?.ownerId || ""),
        owner: pet?.owner || "",
        medication:
          pet && String(pet.id) === String(previous.petId)
            ? previous.medication
            : "",
      };
    }

    return { ...previous, [name]: value };
  };

  const handleNewPrescriptionChange = (e) => {
    const { name, value } = e.target;

    setNewPrescription((previous) =>
      changePrescriptionField(previous, name, value)
    );
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setSelectedPrescription((previous) =>
      previous
        ? changePrescriptionField(previous, name, value)
        : previous
    );
  };

  const validatePrescription = (data) => {
    if (
      !data.petId ||
      !pets.some(
        (pet) => String(pet.id) === String(data.petId)
      )
    ) {
      throw new Error("Please select a valid pet.");
    }

    if (!data.date) {
      throw new Error("Please select a prescription date.");
    }

    for (const [field, label] of [
      ["veterinarian", "Veterinarian"],
      ["medication", "Medication"],
      ["dosage", "Dosage"],
    ]) {
      const value = String(data[field] || "").trim();

      if (!value) {
        throw new Error(`${label} is required.`);
      }

      if (value.length > 200) {
        throw new Error(
          `${label} cannot exceed 200 characters.`
        );
      }
    }

    if (String(data.instructions || "").length > 4000) {
      throw new Error(
        "Instructions cannot exceed 4000 characters."
      );
    }
  };

  const buildPayload = (data) => ({
    petId: Number(data.petId),
    date: data.date || null,
    veterinarian: data.veterinarian.trim(),
    medication: data.medication.trim(),
    dosage: data.dosage.trim(),
    instructions: String(data.instructions || "").trim(),
  });

  const handleOpenAdd = () => {
    if (isLoading || loadError || savingRef.current) return;

    setNewPrescription(getEmptyPrescription());
    setShowAddModal(true);
  };

  const handleCloseAdd = () => {
    if (savingRef.current) return;

    setShowAddModal(false);
    setNewPrescription(getEmptyPrescription());
  };

  const handleAddPrescription = async (e) => {
    e.preventDefault();

    if (!beginSave()) return;

    try {
      validatePrescription(newPrescription);

      const saved = await prescriptionRequest(
        "/api/prescriptions",
        {
          method: "POST",
          body: JSON.stringify(buildPayload(newPrescription)),
        }
      );

      setPrescriptions((previous) => [
        normalizePrescription(saved),
        ...previous,
      ]);

      setNewPrescription(getEmptyPrescription());
      setShowAddModal(false);
      setCurrentPage(1);
      notifyUpdated();
    } catch (error) {
      alert(error.message || "Unable to save prescription.");
    } finally {
      endSave();
    }
  };

  const handleViewPrescription = (prescription) => {
    if (savingRef.current) return;

    setSelectedPrescription(prescription);
    setShowViewModal(true);
  };

  const handleCloseView = () => {
    if (savingRef.current) return;

    setShowViewModal(false);
    setSelectedPrescription(null);
  };

  const handleOpenEdit = (prescription) => {
    if (savingRef.current) return;

    setSelectedPrescription({ ...prescription });
    setShowViewModal(false);
    setShowEditModal(true);
  };

  const handleCloseEdit = () => {
    if (savingRef.current) return;

    setShowEditModal(false);
    setSelectedPrescription(null);
  };

  const handleUpdatePrescription = async (e) => {
    e.preventDefault();

    if (!selectedPrescription || !beginSave()) return;

    try {
      validatePrescription(selectedPrescription);

      const saved = await prescriptionRequest(
        `/api/prescriptions/${selectedPrescription.id}`,
        {
          method: "PUT",
          body: JSON.stringify(buildPayload(selectedPrescription)),
        }
      );

      setPrescriptions((previous) =>
        previous.map((prescription) =>
          prescription.id === saved.id
            ? normalizePrescription(saved)
            : prescription
        )
      );

      setShowEditModal(false);
      setSelectedPrescription(null);
      notifyUpdated();
    } catch (error) {
      alert(error.message || "Unable to update prescription.");
    } finally {
      endSave();
    }
  };

  const handleOpenDelete = (prescription) => {
    if (savingRef.current) return;

    setPrescriptionToDelete(prescription);
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    if (savingRef.current) return;

    setShowDeleteModal(false);
    setPrescriptionToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!prescriptionToDelete || !beginSave()) return;

    try {
      const id = prescriptionToDelete.id;

      await prescriptionRequest(`/api/prescriptions/${id}`, {
        method: "DELETE",
      });

      setPrescriptions((previous) =>
        previous.filter((prescription) => prescription.id !== id)
      );

      setShowDeleteModal(false);
      setPrescriptionToDelete(null);

      if (selectedPrescription?.id === id) {
        setShowViewModal(false);
        setShowEditModal(false);
        setSelectedPrescription(null);
      }

      notifyUpdated();
    } catch (error) {
      alert(error.message || "Unable to delete prescription.");
    } finally {
      endSave();
    }
  };

  const exportToExcel = () => {
    const exportData = filteredPrescriptions.map(
      (prescription) => ({
        Clinic: prescription.clinic,
        Veterinarian: prescription.veterinarian,
        Owner: prescription.owner,
        Pet: prescription.pet,
        Date: formatDate(prescription.date),
        Medication: prescription.medication,
        Dosage: prescription.dosage,
        Instructions: prescription.instructions,
      })
    );

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    worksheet["!cols"] = [
      { wch: 28 },
      { wch: 24 },
      { wch: 22 },
      { wch: 18 },
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 45 },
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Prescriptions"
    );

    XLSX.writeFile(
      workbook,
      "vet-clinic-prescriptions.xlsx"
    );
  };
  const handlePrintPrescription = async (prescription) => {
    const printClinicName =
      readPrintClinicName() || prescription.clinic || "";
    const logoSource = readPrintClinicLogo();
    const printWindow = window.open("", "_blank");

    try {
      const logo = await loadPrintLogo(logoSource);

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;

      if (logo) {
        const boxX = 18;
        const boxY = 15;
        const boxWidth = 18;
        const boxHeight = 18;

        const scale = Math.min(
          boxWidth / logo.width,
          boxHeight / logo.height
        );

        const logoWidth = logo.width * scale;
        const logoHeight = logo.height * scale;

        doc.addImage(
          logo.data,
          "PNG",
          boxX + (boxWidth - logoWidth) / 2,
          boxY + (boxHeight - logoHeight) / 2,
          logoWidth,
          logoHeight
        );
      }

      doc.setTextColor(40, 65, 65);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text(printClinicName, 42, 21);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(110, 125, 125);
      doc.text(CLINIC_SUBTITLE, 42, 27);

      doc.setDrawColor(84, 183, 181);
      doc.setLineWidth(0.7);
      doc.line(margin, 38, pageWidth - margin, 38);

      doc.setTextColor(40, 65, 65);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text(
        "VETERINARY PRESCRIPTION",
        pageWidth / 2,
        53,
        { align: "center" }
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(125, 135, 135);
      doc.text(
        `Prescription #${prescription.id}`,
        pageWidth / 2,
        60,
        { align: "center" }
      );

      let y = 75;

      doc.setFillColor(242, 248, 248);
      doc.roundedRect(
        margin, y, contentWidth, 25, 3, 3, "F"
      );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(95, 115, 115);
      doc.text("VETERINARIAN", margin + 6, y + 8);

      doc.setFontSize(13);
      doc.setTextColor(40, 65, 65);
      doc.text(
        prescription.veterinarian || "—",
        margin + 6,
        y + 17
      );

      y += 38;

      doc.setFontSize(9);
      doc.setTextColor(110, 120, 120);
      doc.setFont("helvetica", "bold");
      doc.text("OWNER", margin, y);
      doc.text("PET", margin + 65, y);
      doc.text("DATE", margin + 120, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(45, 60, 60);
      doc.text(prescription.owner || "—", margin, y + 8);
      doc.text(prescription.pet || "—", margin + 65, y + 8);
      doc.text(
        formatDate(prescription.date),
        margin + 120,
        y + 8
      );

      y += 28;

      doc.setDrawColor(215, 228, 228);
      doc.setLineWidth(0.4);
      doc.roundedRect(
        margin, y, contentWidth, 50, 3, 3, "S"
      );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(84, 183, 181);
      doc.text("MEDICATION", margin + 7, y + 10);

      doc.setFontSize(15);
      doc.setTextColor(40, 65, 65);
      doc.text(
        prescription.medication || "—",
        margin + 7,
        y + 20
      );

      doc.setFontSize(9);
      doc.setTextColor(110, 120, 120);
      doc.text("DOSAGE", margin + 7, y + 32);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(40, 65, 65);
      doc.text(
        prescription.dosage || "—",
        margin + 7,
        y + 41
      );

      y += 65;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(84, 183, 181);
      doc.text("INSTRUCTIONS", margin, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(45, 60, 60);

      const instructionLines = doc.splitTextToSize(
        prescription.instructions || "No additional instructions.",
        contentWidth
      );

      doc.text(instructionLines, margin, y + 10);

      const instructionsHeight = instructionLines.length * 6;
      const signatureY = Math.max(
        y + instructionsHeight + 35,
        230
      );

      doc.setDrawColor(160, 175, 175);
      doc.setLineWidth(0.3);
      doc.line(margin, signatureY, margin + 65, signatureY);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(110, 120, 120);
      doc.text(
        "Veterinarian Signature",
        margin,
        signatureY + 6
      );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(45, 60, 60);
      doc.text(
        prescription.veterinarian || "",
        margin,
        signatureY - 5
      );

      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setDrawColor(225, 232, 232);
      doc.line(
        margin,
        pageHeight - 24,
        pageWidth - margin,
        pageHeight - 24
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(135, 145, 145);
      doc.text(
        printClinicName,
        pageWidth / 2,
        pageHeight - 16,
        { align: "center" }
      );

      doc.text(
        "Veterinary Prescription",
        pageWidth / 2,
        pageHeight - 11,
        { align: "center" }
      );

      const safePetName = String(prescription.pet || "pet")
        .replace(/[^a-z0-9]/gi, "-")
        .toLowerCase();

      const safeDate = prescription.date || "prescription";
      const fileName =
        `prescription-${safePetName}-${safeDate}.pdf`;

      const pdfBlob = doc.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);

      if (printWindow && !printWindow.closed) {
        printWindow.onload = () => {
          if (printWindow.closed) return;
          printWindow.focus();
          printWindow.print();
        };

        printWindow.location.href = pdfUrl;
      } else {
        doc.save(fileName);
      }

      setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);
    } catch (error) {
      console.error("Could not print prescription:", error);

      if (printWindow && !printWindow.closed) {
        printWindow.close();
      }

      alert("Could not prepare the prescription for printing.");
    }
  };

  const renderPrescriptionFields = (data, onChange) => {
    const treatments = getTreatmentOptions(data.petId);
    const selectedMedication = String(data.medication || "");
    const petSelected = Boolean(data.petId);

    const preserveCurrentMedication =
      selectedMedication &&
      !treatments.includes(selectedMedication);

    return (
      <>
               <div className="form-row">
          <div className="form-field">
            <label>Owner</label>

            <PrescriptionNameSearch
              value={data.owner}
              selectedId={data.ownerId}
              options={Array.from(
                new Map(
                  petOptions
                    .filter((pet) => pet.ownerId && pet.owner)
                    .map((pet) => [
                      String(pet.ownerId),
                      {
                        id: String(pet.ownerId),
                        label: pet.owner,
                      },
                    ])
                ).values()
              ).sort((a, b) => a.label.localeCompare(b.label))}
              placeholder="Type owner name..."
              onType={(value) =>
                onChange({
                  target: {
                    name: "ownerSearch",
                    value,
                  },
                })
              }
              onSelect={(value) =>
                onChange({
                  target: {
                    name: "ownerId",
                    value,
                  },
                })
              }
              disabled={isSaving}
            />
          </div>

          <div className="form-field">
            <label>Pet</label>

            <PrescriptionNameSearch
              value={data.pet}
              selectedId={data.petId}
              options={petOptions
                .filter(
                  (pet) =>
                    !data.ownerId ||
                    String(pet.ownerId) === String(data.ownerId)
                )
                .map((pet) => ({
                  id: String(pet.id),
                  label: pet.name || "",
                }))}
              placeholder="Type pet name..."
              onType={(value) =>
                onChange({
                  target: {
                    name: "petSearch",
                    value,
                  },
                })
              }
              onSelect={(value) =>
                onChange({
                  target: {
                    name: "petId",
                    value,
                  },
                })
              }
              disabled={isSaving}
            />
          </div>
        </div>

       

        <div className="form-row">
          <div className="form-field">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={data.date || ""}
              onChange={onChange}
              required
              disabled={isSaving}
            />
          </div>

          <div className="form-field">
            <label>Medication</label>
            <select
              className="prescription-treatment-select"
              name="medication"
              value={selectedMedication}
              onChange={onChange}
              disabled={!petSelected || isSaving}
              required
            >
              <option value="">
                {!petSelected
                  ? "Select pet first"
                  : treatments.length === 0
                    ? "No treatment found for this pet"
                    : "Select treatment"}
              </option>

              {preserveCurrentMedication && (
                <option value={selectedMedication}>
                  {selectedMedication}
                </option>
              )}

              {treatments.map((treatment) => (
                <option key={treatment} value={treatment}>
                  {treatment}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-field">
          <label>Dosage</label>
          <input
            type="text"
            name="dosage"
            placeholder="Example: 250 mg twice daily"
            value={data.dosage || ""}
            onChange={onChange}
            maxLength={200}
            required
            disabled={isSaving}
          />
        </div>

        <div className="form-field">
          <label>Instructions</label>
          <textarea
            name="instructions"
            placeholder="Enter prescription instructions"
            value={data.instructions || ""}
            onChange={onChange}
            rows={4}
            maxLength={4000}
            required
            disabled={isSaving}
          />
        </div>
      </>
    );
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

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main prescriptions-page">
        <style>{`
          .prescriptions-main-table {
            min-width: 1450px;
          }

          .prescriptions-main-table th,
          .prescriptions-main-table td {
            white-space: nowrap;
          }

          .prescription-instructions-cell {
            min-width: 240px;
            max-width: 300px;
            white-space: normal !important;
            line-height: 1.45;
          }

          .prescription-actions-cell {
            min-width: 180px;
          }

          .prescription-print-button {
            width: auto !important;
            min-width: 0 !important;
            height: 32px !important;
            padding: 0 11px !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 5px !important;
            border: 1px solid #54b7b5 !important;
            border-radius: 6px !important;
            background: #54b7b5 !important;
            color: #ffffff !important;
            font-size: 11px !important;
            font-weight: 600 !important;
            line-height: 1 !important;
            white-space: nowrap !important;
            cursor: pointer !important;
          }

          .prescription-print-button:hover {
            background: #359f9b !important;
            border-color: #359f9b !important;
          }

          .prescription-modal-print {
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
            color: white !important;
            font-size: 12px !important;
            font-weight: 600 !important;
            cursor: pointer !important;
          }

          .prescription-modal-print:hover {
            background: #359f9b !important;
            border-color: #359f9b !important;
          }

          .prescription-detail-instructions {
            align-items: flex-start !important;
          }

          .prescription-detail-instructions strong {
            max-width: 65%;
            text-align: right;
            line-height: 1.5;
          }

          html body #root .modal-container
          input.prescription-pet-name-input {
            appearance: none !important;
            -webkit-appearance: none !important;
            background-image: none !important;
          }

          html body #root .modal-container
          input.prescription-pet-name-input::-webkit-calendar-picker-indicator {
            display: none !important;
            opacity: 0 !important;
          }

          html body #root .modal-container
          .prescription-treatment-select {
            width: 100% !important;
            min-width: 0 !important;
            box-sizing: border-box !important;
            height: 43px !important;
            padding: 0 12px !important;
            border: 1px solid #d5e5e3 !important;
            border-radius: 8px !important;
            background: #ffffff !important;
            color: #333333 !important;
            font-family: inherit !important;
            font-size: 14px !important;
          }

          html body #root .modal-container
          .prescription-treatment-select:disabled {
            background: #f4f7f7 !important;
            color: #849393 !important;
            cursor: not-allowed !important;
          }

          html body #root .modal-container
          .form-actions.prescription-form-footer {
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: flex-end !important;
            gap: 12px !important;
            flex-wrap: wrap !important;
          }

          html body #root .modal-container
          .prescription-form-footer
          button.prescription-medical-records-button {
            position: static !important;
            width: auto !important;
            min-width: 0 !important;
            max-width: 100% !important;
            height: 42px !important;
            min-height: 42px !important;
            padding: 0 20px !important;
            margin: 0 !important;
            flex: 0 0 auto !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-sizing: border-box !important;
            border: 1px solid #54b7b5 !important;
            border-radius: 8px !important;
            background: #54b7b5 !important;
            color: #ffffff !important;
            -webkit-text-fill-color: #ffffff !important;
            font-family: inherit !important;
            font-size: 14px !important;
            font-weight: 700 !important;
            line-height: 1 !important;
            white-space: nowrap !important;
            cursor: pointer !important;
            transform: none !important;
            box-shadow: none !important;
            opacity: 1 !important;
          }

          html body #root .modal-container
          .prescription-form-footer
          button.prescription-medical-records-button:hover,
          html body #root .modal-container
          .prescription-form-footer
          button.prescription-medical-records-button:focus,
          html body #root .modal-container
          .prescription-form-footer
          button.prescription-medical-records-button:active {
            background: #359f9b !important;
            border-color: #359f9b !important;
            color: #ffffff !important;
            -webkit-text-fill-color: #ffffff !important;
            transform: none !important;
            opacity: 1 !important;
          }
        `}</style>

        <div className="page-header">
          <div>
            <h1>Prescriptions</h1>
            <p>Manage and print veterinary prescriptions</p>
          </div>
        </div>

        {loadError && (
          <div role="alert" style={{ marginBottom: 16 }}>
            <p style={{ color: "#c0392b" }}>{loadError}</p>
            <button
              type="button"
              onClick={() =>
                setReloadKey((previous) => previous + 1)
              }
              disabled={isLoading || isSaving}
            >
              Retry
            </button>
          </div>
        )}

        <div className="prescriptions-filter-row">
          <div className="prescriptions-search-box">
            <FaSearch className="prescriptions-search-icon" />

            <input
              type="text"
              placeholder="Search prescriptions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {hasFilters && (
              <button
                type="button"
                className="prescriptions-clear-button"
                onClick={clearFilters}
                title="Clear filters"
                aria-label="Clear filters"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <div className="prescriptions-date-filter">
            <span>From</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div className="prescriptions-date-filter">
            <span>To</span>
            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>

        <div className="prescriptions-toolbar-buttons">
          <button
            type="button"
            className="prescriptions-export-button"
            onClick={exportToExcel}
            disabled={isLoading || Boolean(loadError)}
          >
            <FaFileExcel />
            <span>Export</span>
          </button>

          <button
            type="button"
            className="prescriptions-add-button"
            onClick={handleOpenAdd}
            disabled={isLoading || Boolean(loadError) || isSaving}
          >
            + Add Prescription
          </button>
        </div>

        <div className="owners-table-container prescriptions-table-container">
          <div className="prescriptions-table-scroll">
            <table className="owners-table prescriptions-table prescriptions-main-table">
              <thead>
                <tr>
                  <th>Clinic</th>
                  <th>Veterinarian</th>
                  <th>Owner</th>
                  <th>Pet</th>
                  <th>Date</th>
                  <th>Medication</th>
                  <th>Dosage</th>
                  <th>Instructions</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="no-results">
                      Loading prescriptions...
                    </td>
                  </tr>
                ) : loadError ? (
                  <tr>
                    <td colSpan={9} className="no-results">
                      Unable to load prescriptions.
                    </td>
                  </tr>
                ) : paginatedPrescriptions.length > 0 ? (
                  paginatedPrescriptions.map((prescription) => (
                    <tr key={prescription.id}>
                      <td>{prescription.clinic}</td>
                      <td>
                        <strong>
                          {prescription.veterinarian}
                        </strong>
                      </td>
                      <td>{prescription.owner}</td>
                      <td>{prescription.pet}</td>
                      <td>{formatDate(prescription.date)}</td>
                      <td>{prescription.medication}</td>
                      <td>{prescription.dosage}</td>

                      <td className="prescription-instructions-cell">
                        {prescription.instructions || "—"}
                      </td>

                      <td className="prescription-actions-cell">
                        <div className="table-actions">
                          <button
                            type="button"
                            className="view-button icon-button"
                            onClick={() =>
                              handleViewPrescription(prescription)
                            }
                            title="View"
                            aria-label="View prescription"
                            disabled={isSaving}
                          >
                            <FaEye />
                          </button>

                          <button
                            type="button"
                            className="edit-button icon-button"
                            onClick={() =>
                              handleOpenEdit(prescription)
                            }
                            title="Edit"
                            aria-label="Edit prescription"
                            disabled={isSaving}
                          >
                            <FaPen />
                          </button>

                          <button
                            type="button"
                            className="delete-button icon-button"
                            onClick={() =>
                              handleOpenDelete(prescription)
                            }
                            title="Delete"
                            aria-label="Delete prescription"
                            disabled={isSaving}
                          >
                            <FaTrash />
                          </button>

                          <button
                            type="button"
                            className="prescription-print-button"
                            onClick={() =>
                              handlePrintPrescription(prescription)
                            }
                            title="Print PDF"
                            aria-label="Print prescription PDF"
                            disabled={isSaving}
                          >
                            <FaPrint />
                            <span></span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="no-results">
                      No prescriptions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="prescriptions-pagination">
          <div className="prescriptions-rows-per-page">
            <span>Rows per page:</span>

            <select
              value={rowsPerPage}
              onChange={(e) =>
                setRowsPerPage(Number(e.target.value))
              }
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div
            className="prescriptions-page-controls"
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
                setCurrentPage(Math.max(safeCurrentPage - 1, 1))
              }
              aria-label="Previous page"
              style={
                safeCurrentPage === 1
                  ? paginationDisabledStyle
                  : paginationButtonStyle
              }
            >
              &lt;
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => (
              <button
                type="button"
                key={page}
                onClick={() => setCurrentPage(page)}
                aria-current={
                  safeCurrentPage === page ? "page" : undefined
                }
                style={
                  safeCurrentPage === page
                    ? paginationActiveStyle
                    : paginationButtonStyle
                }
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              disabled={safeCurrentPage === totalPages}
              onClick={() =>
                setCurrentPage(
                  Math.min(safeCurrentPage + 1, totalPages)
                )
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
          <div className="modal-container">
            <div className="modal-header">
              <div>
                <h2>Add Prescription</h2>
                <p>Enter prescription information</p>
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
              onSubmit={handleAddPrescription}
              aria-busy={isSaving}
            >
              {renderPrescriptionFields(
                newPrescription,
                handleNewPrescriptionChange
              )}

              <div className="form-actions prescription-form-footer">
                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={handleCloseAdd}
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="save-button prescription-medical-records-button"
                  onClick={() =>
                    openMedicalRecords(newPrescription)
                  }
                  disabled={isSaving}
                >
                  Medical Records
                </button>

                <button
                  type="submit"
                  className="save-button"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Add Prescription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedPrescription && (
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
                <h2>Prescription Details</h2>
                <p>View prescription information</p>
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
              <span>Clinic</span>
              <strong>{selectedPrescription.clinic}</strong>
            </div>

            <div className="detail-row">
              <span>Veterinarian</span>
              <strong>
                {selectedPrescription.veterinarian}
              </strong>
            </div>

            <div className="detail-row">
              <span>Owner</span>
              <strong>{selectedPrescription.owner}</strong>
            </div>

            <div className="detail-row">
              <span>Pet</span>
              <strong>{selectedPrescription.pet}</strong>
            </div>

            <div className="detail-row">
              <span>Date</span>
              <strong>
                {formatDate(selectedPrescription.date)}
              </strong>
            </div>

            <div className="detail-row">
              <span>Medication</span>
              <strong>{selectedPrescription.medication}</strong>
            </div>

            <div className="detail-row">
              <span>Dosage</span>
              <strong>{selectedPrescription.dosage}</strong>
            </div>

            <div className="detail-row prescription-detail-instructions">
              <span>Instructions</span>
              <strong>
                {selectedPrescription.instructions || "—"}
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
                className="edit-button prescriptions-modal-edit"
                onClick={() =>
                  handleOpenEdit(selectedPrescription)
                }
                disabled={isSaving}
              >
                <FaPen />
                <span>Edit Prescription</span>
              </button>

              <button
                type="button"
                className="prescription-modal-print"
                onClick={() =>
                  handlePrintPrescription(selectedPrescription)
                }
                disabled={isSaving}
              >
                <FaPrint />
                <span>Print PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedPrescription && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseEdit();
            }
          }}
        >
          <div className="modal-container">
            <div className="modal-header">
              <div>
                <h2>Edit Prescription</h2>
                <p>Update prescription information</p>
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
              onSubmit={handleUpdatePrescription}
              aria-busy={isSaving}
            >
              {renderPrescriptionFields(
                selectedPrescription,
                handleEditChange
              )}

              <div className="form-actions prescription-form-footer">
                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={handleCloseEdit}
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="save-button prescription-medical-records-button"
                  onClick={() =>
                    openMedicalRecords(selectedPrescription)
                  }
                  disabled={isSaving}
                >
                  Medical Records
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

      {showDeleteModal && prescriptionToDelete && (
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

            <h3>Delete Prescription</h3>

            <p>
              Are you sure you want to delete the prescription
              for <strong>{prescriptionToDelete.pet}</strong>?
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

export default Prescriptions;