import { useEffect, useMemo, useState } from "react";
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

const MEDICAL_RECORDS_STORAGE_KEY = "vetClinicMedicalRecords";

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
      } catch (error) {
        console.error("Could not prepare print logo:", error);
        resolve(null);
      }
    };

    image.onerror = () => resolve(null);
    image.src = source;
  });

const readMedicalRecords = () => {
  try {
    const saved = localStorage.getItem(
      MEDICAL_RECORDS_STORAGE_KEY
    );

    if (saved !== null) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    }

    return [
      {
        id: 1,
        pet: "Bella",
        owner: "Tala El Hajj",
        treatment: "Medication",
      },
      {
        id: 2,
        pet: "Luna",
        owner: "Maya Khalil",
        treatment: "No treatment required",
      },
    ];
  } catch {
    return [];
  }
};

const normalizePetName = (value) =>
  String(value || "").trim().toLowerCase();

function Prescriptions() {
  const location = useLocation();
  const navigate = useNavigate();

  // CLINIC INFORMATION

  const CLINIC_NAME = "PawCare Veterinary Clinic";
  const CLINIC_SUBTITLE = "Veterinary Medical Center";

  // DATA

  const [prescriptions, setPrescriptions] = useState([
    {
      id: 1,
      clinic: "PawCare Veterinary Clinic",
      veterinarian: "Dr. Sarah Haddad",
      owner: "Tala El Hajj",
      pet: "Bella",
      date: "2026-09-29",
      medication: "Amoxicillin",
      dosage: "250 mg",
      instructions:
        "Give 250 mg orally twice daily after food for 7 days.",
    },
    {
      id: 2,
      clinic: "PawCare Veterinary Clinic",
      veterinarian: "Dr. Karim Mansour",
      owner: "Fatima Abbas",
      pet: "Luna",
      date: "2026-09-25",
      medication: "Meloxicam",
      dosage: "1.5 mg",
      instructions:
        "Give 1.5 mg orally once daily with food for 5 days.",
    },
  ]);

  const [medicalRecords, setMedicalRecords] = useState(
    readMedicalRecords
  );

  useEffect(() => {
    const refreshMedicalRecords = () => {
      setMedicalRecords(readMedicalRecords());
    };

    window.addEventListener(
      "vetClinicMedicalRecordsUpdated",
      refreshMedicalRecords
    );

    window.addEventListener(
      "storage",
      refreshMedicalRecords
    );

    window.addEventListener(
      "focus",
      refreshMedicalRecords
    );

    return () => {
      window.removeEventListener(
        "vetClinicMedicalRecordsUpdated",
        refreshMedicalRecords
      );

      window.removeEventListener(
        "storage",
        refreshMedicalRecords
      );

      window.removeEventListener(
        "focus",
        refreshMedicalRecords
      );
    };
  }, []);

  const petOptions = useMemo(() => {
    return [
      ...new Set(
        medicalRecords
          .map((record) => String(record.pet || "").trim())
          .filter(Boolean)
      ),
    ];
  }, [medicalRecords]);

  const getTreatmentOptions = (pet) => {
    const petName = normalizePetName(pet);

    if (!petName) return [];

    return [
      ...new Set(
        medicalRecords
          .filter(
            (record) =>
              normalizePetName(record.pet) === petName
          )
          .map((record) =>
            String(record.treatment || "").trim()
          )
          .filter(Boolean)
      ),
    ];
  };

  const openMedicalRecords = (prescription) => {
    navigate("/medical-records", {
      state: {
        prescriptionPet: prescription.pet || "",
      },
    });
  };

  // EMPTY PRESCRIPTION

  const getEmptyPrescription = () => ({
    clinic: CLINIC_NAME,
    veterinarian: "",
    owner: "",
    pet: "",
    date: "",
    medication: "",
    dosage: "",
    instructions: "",
  });

  // SEARCH + DATE FILTERS

  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // PAGINATION

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // MODALS

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedPrescription, setSelectedPrescription] =
    useState(null);

  const [prescriptionToDelete, setPrescriptionToDelete] =
    useState(null);

  const [newPrescription, setNewPrescription] = useState(
    getEmptyPrescription()
  );

  // RECEIVE MEDICATION FROM MEDICATIONS PAGE

  useEffect(() => {
    const state = location.state;

    if (!state?.openAddPrescription) return;

    const medicationData = state.medicationData || {};

    setNewPrescription({
      clinic: CLINIC_NAME,
      veterinarian: "",
      owner:
        state.owner ||
        state.ownerName ||
        medicationData.owner ||
        "",
      pet:
        state.pet ||
        state.petName ||
        medicationData.pet ||
        "",
      date: new Date().toISOString().split("T")[0],
      medication:
        state.medication ||
        state.medicationName ||
        medicationData.medication ||
        "",
      dosage:
        state.dosage ||
        medicationData.dosage ||
        "",
      instructions:
        state.instructions ||
        medicationData.instructions ||
        "",
    });

    setShowAddModal(true);
  }, [location.state]);

  // FILTERED PRESCRIPTIONS

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
          String(value || "")
            .toLowerCase()
            .includes(searchText)
        );

      const matchesFrom =
        !dateFrom || prescription.date >= dateFrom;

      const matchesTo =
        !dateTo || prescription.date <= dateTo;

      return matchesSearch && matchesFrom && matchesTo;
    });
  }, [prescriptions, search, dateFrom, dateTo]);

  // PAGINATION

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPrescriptions.length / rowsPerPage)
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, dateFrom, dateTo, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * rowsPerPage;

  const paginatedPrescriptions = filteredPrescriptions.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // CLEAR FILTERS

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

  // DATE FORMAT

  const formatDate = (date) => {
    if (!date) return "—";

    const parts = date.split("-");

    if (parts.length !== 3) return date;

    const [year, month, day] = parts;

    return `${day}/${month}/${year}`;
  };

  // ADD

  const handleNewPrescriptionChange = (e) => {
    const { name, value } = e.target;

    setNewPrescription((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "pet" ? { medication: "" } : {}),
    }));
  };

  const handleAddPrescription = (e) => {
    e.preventDefault();

    const prescription = {
      id: Date.now(),
      ...newPrescription,
    };

    setPrescriptions((previous) => [
      ...previous,
      prescription,
    ]);

    setNewPrescription(getEmptyPrescription());
    setShowAddModal(false);
  };

  // VIEW

  const handleViewPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setShowViewModal(true);
  };

  // EDIT

  const handleOpenEdit = (prescription) => {
    setSelectedPrescription({
      ...prescription,
    });

    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setSelectedPrescription((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "pet" ? { medication: "" } : {}),
    }));
  };

  const handleUpdatePrescription = (e) => {
    e.preventDefault();

    setPrescriptions((previous) =>
      previous.map((prescription) =>
        prescription.id === selectedPrescription.id
          ? selectedPrescription
          : prescription
      )
    );

    setShowEditModal(false);
    setSelectedPrescription(null);
  };

  // DELETE

  const handleOpenDelete = (prescription) => {
    setPrescriptionToDelete(prescription);
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setPrescriptionToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (!prescriptionToDelete) return;

    setPrescriptions((previous) =>
      previous.filter(
        (prescription) =>
          prescription.id !== prescriptionToDelete.id
      )
    );

    setShowDeleteModal(false);
    setPrescriptionToDelete(null);
  };

  // EXPORT EXCEL

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

    const worksheet =
      XLSX.utils.json_to_sheet(exportData);

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

  // PRINT PDF

  const handlePrintPrescription = async (prescription) => {
    const printClinicName = readPrintClinicName();
    const logoSource = readPrintClinicLogo();

    // Open during the click so loading the image does not
    // cause the browser to block the print window.
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

      // HEADER / LOGO

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

      // TITLE

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

      // VETERINARIAN

      let y = 75;

      doc.setFillColor(242, 248, 248);
      doc.roundedRect(
        margin,
        y,
        contentWidth,
        25,
        3,
        3,
        "F"
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

      // OWNER / PET / DATE

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

      // MEDICATION BOX

      y += 28;

      doc.setDrawColor(215, 228, 228);
      doc.setLineWidth(0.4);
      doc.roundedRect(
        margin,
        y,
        contentWidth,
        50,
        3,
        3,
        "S"
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

      // INSTRUCTIONS

      y += 65;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(84, 183, 181);
      doc.text("INSTRUCTIONS", margin, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(45, 60, 60);

      const instructionLines = doc.splitTextToSize(
        prescription.instructions ||
          "No additional instructions.",
        contentWidth
      );

      doc.text(instructionLines, margin, y + 10);

      const instructionsHeight = instructionLines.length * 6;

      // SIGNATURE

      const signatureY = Math.max(
        y + instructionsHeight + 35,
        230
      );

      doc.setDrawColor(160, 175, 175);
      doc.setLineWidth(0.3);
      doc.line(
        margin,
        signatureY,
        margin + 65,
        signatureY
      );

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

      // FOOTER

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

      // OPEN PDF + PRINT

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

      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 60000);
    } catch (error) {
      console.error("Could not print prescription:", error);

      if (printWindow && !printWindow.closed) {
        printWindow.close();
      }

      alert("Could not prepare the prescription for printing.");
    }
  };  // FORM FIELDS

  const renderPrescriptionFields = (data, onChange) => {
    const treatments = getTreatmentOptions(data.pet);
    const selectedMedication = String(data.medication || "");
    const petSelected = Boolean(normalizePetName(data.pet));

    const preserveCurrentMedication =
      selectedMedication &&
      !treatments.includes(selectedMedication);

    return (
      <>
        <div className="form-row">
          <div className="form-field">
            <label>Clinic</label>

            <input
              type="text"
              name="clinic"
              placeholder="Enter clinic name"
              value={data.clinic || ""}
              onChange={onChange}
              required
            />
          </div>

          <div className="form-field">
            <label>Veterinarian</label>

            <input
              type="text"
              name="veterinarian"
              placeholder="Example: Dr. Sarah Haddad"
              value={data.veterinarian || ""}
              onChange={onChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Owner</label>

            <input
              type="text"
              name="owner"
              placeholder="Enter owner name"
              value={data.owner || ""}
              onChange={onChange}
              required
            />
          </div>

          <div className="form-field">
            <label>Pet</label>

            <input
              className="prescription-pet-name-input"
              type="text"
              name="pet"
              list="prescription-pet-options"
              placeholder="Enter pet name"
              value={data.pet || ""}
              onChange={onChange}
              required
            />

            <datalist id="prescription-pet-options">
              {petOptions.map((pet) => (
                <option key={pet} value={pet} />
              ))}
            </datalist>
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
            />
          </div>

          <div className="form-field">
            <label>Medication</label>

            <select
              className="prescription-treatment-select"
              name="medication"
              value={selectedMedication}
              onChange={onChange}
              disabled={!petSelected}
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
            required
          />
        </div>

        <div className="form-field">
          <label>Instructions</label>

          <textarea
            name="instructions"
            placeholder="Enter prescription instructions"
            value={data.instructions || ""}
            onChange={onChange}
            rows="4"
            required
          />
        </div>
      </>
    );
  };

  // PAGINATION STYLE

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

  // RETURN

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

        {/* HEADER */}

        <div className="page-header">
          <div>
            <h1>Prescriptions</h1>

            <p>
              Manage and print veterinary prescriptions
            </p>
          </div>
        </div>

        {/* SEARCH + DATE FILTERS */}

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

        {/* EXPORT + ADD */}

        <div className="prescriptions-toolbar-buttons">
          <button
            type="button"
            className="prescriptions-export-button"
            onClick={exportToExcel}
          >
            <FaFileExcel />
            <span>Export</span>
          </button>

          <button
            type="button"
            className="prescriptions-add-button"
            onClick={() => {
              setNewPrescription(getEmptyPrescription());
              setShowAddModal(true);
            }}
          >
            + Add Prescription
          </button>
        </div>

        {/* TABLE */}

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
                {paginatedPrescriptions.length > 0 ? (
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
                        {prescription.instructions}
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
                    <td colSpan="9" className="no-results">
                      No prescriptions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION */}

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
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((page) => Math.max(page - 1, 1))
              }
              aria-label="Previous page"
              style={
                currentPage === 1
                  ? paginationDisabledStyle
                  : paginationButtonStyle
              }
            >
              &lt;
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => {
              const isActive = currentPage === page;

              return (
                <button
                  type="button"
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  aria-current={isActive ? "page" : undefined}
                  style={
                    isActive
                      ? paginationActiveStyle
                      : paginationButtonStyle
                  }
                >
                  {page}
                </button>
              );
            })}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(page + 1, totalPages)
                )
              }
              aria-label="Next page"
              style={
                currentPage === totalPages
                  ? paginationDisabledStyle
                  : paginationButtonStyle
              }
            >
              &gt;
            </button>
          </div>
        </div>
      </main>

      {/* ADD PRESCRIPTION */}

      {showAddModal && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddModal(false);
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
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddPrescription}>
              {renderPrescriptionFields(
                newPrescription,
                handleNewPrescriptionChange
              )}

              <div className="form-actions prescription-form-footer">
                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="save-button prescription-medical-records-button"
                  onClick={() =>
                    openMedicalRecords(newPrescription)
                  }
                >
                  Medical Records
                </button>

                <button type="submit" className="save-button">
                  Add Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PRESCRIPTION */}

      {showViewModal && selectedPrescription && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowViewModal(false);
              setSelectedPrescription(null);
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
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedPrescription(null);
                }}
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
              <strong>
                {selectedPrescription.medication}
              </strong>
            </div>

            <div className="detail-row">
              <span>Dosage</span>
              <strong>{selectedPrescription.dosage}</strong>
            </div>

            <div className="detail-row prescription-detail-instructions">
              <span>Instructions</span>
              <strong>
                {selectedPrescription.instructions}
              </strong>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="modal-cancel-button"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedPrescription(null);
                }}
              >
                Close
              </button>

              <button
                type="button"
                className="edit-button prescriptions-modal-edit"
                onClick={() => {
                  setShowViewModal(false);
                  setShowEditModal(true);
                }}
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
              >
                <FaPrint />
                <span>Print PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PRESCRIPTION */}

      {showEditModal && selectedPrescription && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditModal(false);
              setSelectedPrescription(null);
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
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedPrescription(null);
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdatePrescription}>
              {renderPrescriptionFields(
                selectedPrescription,
                handleEditChange
              )}

              <div className="form-actions prescription-form-footer">
                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedPrescription(null);
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="save-button prescription-medical-records-button"
                  onClick={() =>
                    openMedicalRecords(selectedPrescription)
                  }
                >
                  Medical Records
                </button>

                <button type="submit" className="save-button">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE PRESCRIPTION */}

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
              Are you sure you want to delete
              the prescription for{" "}
              <strong>{prescriptionToDelete.pet}</strong>?
            </p>

            <div className="medications-delete-actions">
              <button
                type="button"
                className="medications-delete-cancel"
                onClick={handleCancelDelete}
              >
                Cancel
              </button>

              <button
                type="button"
                className="medications-delete-confirm"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Prescriptions;