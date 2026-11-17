import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaPaw,
  FaUser,
  FaBirthdayCake,
  FaPalette,
  FaWeightHanging,
  FaMicrochip,
  FaTint,
  FaExclamationTriangle,
  FaNotesMedical,
  FaStickyNote,
  FaCalendarCheck,
  FaSyringe,
  FaPills,
  FaPrescriptionBottleAlt,
  FaBell,
  FaStethoscope,
  FaFileInvoiceDollar,
  FaUserMd,
  FaMoneyBillWave,
} from "react-icons/fa";

import Sidebar from "../components/Sidebar";
import { getPet } from "../api/petsApi";

async function fetchPetRecords(path, petId, signal, label) {
  let response;

  try {
    response = await fetch(
      `${path}?petId=${encodeURIComponent(petId)}`,
      {
        credentials: "include",
        cache: "no-store",
        signal,
      }
    );
  } catch (error) {
    if (error.name === "AbortError") throw error;

    throw new Error(
      `Unable to connect to the server to load ${label}.`
    );
  }

  if (!response.ok) {
    let message = `Unable to load ${label}.`;

    if (response.status === 401) {
      message = "Your session has expired. Please sign in again.";
    } else if (response.status === 403) {
      message = `You do not have permission to view these ${label}.`;
    } else {
      try {
        const problem = await response.json();

        const errors = Object.values(problem.errors || {})
          .flat()
          .filter((value) => typeof value === "string");

        if (errors.length) {
          message = errors.join("\n");
        } else if (typeof problem.detail === "string") {
          message = problem.detail;
        }
      } catch {
        // Keep the default error message.
      }
    }

    throw new Error(message);
  }

  const records = await response.json();

  if (!Array.isArray(records)) {
    throw new Error(`The server returned invalid ${label}.`);
  }

  return records.filter(
    (record) => String(record.petId) === String(petId)
  );
}

async function fetchPetMedicalRecords(petId, signal) {
  const records = await fetchPetRecords(
    "/api/medical-records",
    petId,
    signal,
    "medical records"
  );

  return records
    .map((record) => ({
      ...record,
      reason: record.reasonForVisit || "",
      date: record.date || "",
      veterinarian: record.veterinarian || "",
      diagnosis: record.diagnosis || "",
      treatment: record.treatment || "",
      notes: record.notes || "",
    }))
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) ||
        Number(b.id) - Number(a.id)
    );
}

async function fetchPetAppointments(petId, signal) {
  const records = await fetchPetRecords(
    "/api/appointments",
    petId,
    signal,
    "appointments"
  );

  return records
    .map((appointment) => ({
      ...appointment,
      type: appointment.type || "",
      date: appointment.date || "",
      time: appointment.time
        ? appointment.time.slice(0, 5)
        : "",
      veterinarian: appointment.veterinarian || "",
      reason: appointment.reason || "",
      status: appointment.status || "",
    }))
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) ||
        b.time.localeCompare(a.time) ||
        Number(b.id) - Number(a.id)
    );
}

async function fetchPetVaccinations(petId, signal) {
  const records = await fetchPetRecords(
    "/api/vaccinations",
    petId,
    signal,
    "vaccinations"
  );

  return records
    .map((vaccination) => ({
      ...vaccination,
      vaccine: vaccination.vaccine || "",
      dateGiven: vaccination.dateGiven || "",
      nextDueDate: vaccination.nextDueDate || "",
      status: vaccination.status || "",
      notes: vaccination.notes || "",
    }))
    .sort(
      (a, b) =>
        b.dateGiven.localeCompare(a.dateGiven) ||
        Number(b.id) - Number(a.id)
    );
}

async function fetchPetReminders(petId, signal) {
  const records = await fetchPetRecords(
    "/api/reminders",
    petId,
    signal,
    "reminders"
  );

  return records
    .map((reminder) => ({
      ...reminder,
      type: reminder.type || "",
      dueDate: reminder.dueDate || "",
      message: reminder.message || "",
      status: reminder.status || "",
      date: reminder.dueDate || "",
      title: reminder.message || reminder.type || "Reminder",
    }))
    .sort(
      (a, b) =>
        b.dueDate.localeCompare(a.dueDate) ||
        Number(b.id) - Number(a.id)
    );
}

async function fetchPetMedications(petId, signal) {
  const records = await fetchPetRecords(
    "/api/medications",
    petId,
    signal,
    "medications"
  );

  return records
    .map((medication) => ({
      ...medication,
      name: medication.medication || medication.name || "",
      dosage: medication.dosage || "",
      frequency: medication.frequency || "",
      route: medication.route || "",
      startDate: medication.startDate || "",
      endDate: medication.endDate || "",
      instructions: medication.instructions || "",
      status: medication.status || "",
    }))
    .sort(
      (a, b) =>
        b.startDate.localeCompare(a.startDate) ||
        Number(b.id) - Number(a.id)
    );
}

function usePetRecords(petId, fetchRecords, eventName) {
  const [result, setResult] = useState({
    petId: null,
    records: [],
    loading: true,
    error: "",
  });

  useEffect(() => {
    let controller;
    let disposed = false;
    let requestNumber = 0;

    async function load() {
      controller?.abort();
      controller = new AbortController();

      const currentRequest = ++requestNumber;

      setResult({
        petId,
        records: [],
        loading: true,
        error: "",
      });

      try {
        const records = await fetchRecords(
          petId,
          controller.signal
        );

        if (disposed || currentRequest !== requestNumber) return;

        setResult({
          petId,
          records,
          loading: false,
          error: "",
        });
      } catch (error) {
        if (
          disposed ||
          currentRequest !== requestNumber ||
          error.name === "AbortError"
        ) {
          return;
        }

        setResult({
          petId,
          records: [],
          loading: false,
          error: error.message || "Unable to load records.",
        });
      }
    }

    load();
    window.addEventListener(eventName, load);

    return () => {
      disposed = true;
      controller?.abort();
      window.removeEventListener(eventName, load);
    };
  }, [petId, fetchRecords, eventName]);

  return {
    records: result.petId === petId ? result.records : [],
    loading: result.petId !== petId || result.loading,
    error: result.petId === petId ? result.error : "",
  };
}

function PetProfile() {
  const navigate = useNavigate();
  const { petId } = useParams();

  const [result, setResult] = useState({
    petId: null,
    pet: null,
    loading: true,
    error: "",
  });

  const {
    records: medicalRecords,
    loading: medicalRecordsLoading,
    error: medicalRecordsError,
  } = usePetRecords(
    petId,
    fetchPetMedicalRecords,
    "vetClinicMedicalRecordsUpdated"
  );

  const {
    records: appointments,
    loading: appointmentsLoading,
    error: appointmentsError,
  } = usePetRecords(
    petId,
    fetchPetAppointments,
    "vetClinicAppointmentsUpdated"
  );

  const {
    records: vaccinations,
    loading: vaccinationsLoading,
    error: vaccinationsError,
  } = usePetRecords(
    petId,
    fetchPetVaccinations,
    "vetClinicVaccinationsUpdated"
  );

  const {
    records: reminders,
    loading: remindersLoading,
    error: remindersError,
  } = usePetRecords(
    petId,
    fetchPetReminders,
    "vetClinicRemindersUpdated"
  );

  const {
    records: medications,
    loading: medicationsLoading,
    error: medicationsError,
  } = usePetRecords(
    petId,
    fetchPetMedications,
    "vetClinicMedicationsUpdated"
  );

  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;

    async function loadPet() {
      setResult({
        petId,
        pet: null,
        loading: true,
        error: "",
      });

      try {
        const savedPet = await getPet(petId, {
          signal: controller.signal,
        });

        if (disposed) return;

        setResult({
          petId,
          pet: savedPet,
          loading: false,
          error: "",
        });
      } catch (error) {
        if (disposed || error.name === "AbortError") return;

        setResult({
          petId,
          pet: null,
          loading: false,
          error:
            error.status === 404
              ? ""
              : error.message || "Unable to load the pet profile.",
        });
      }
    }

    loadPet();

    return () => {
      disposed = true;
      controller.abort();
    };
  }, [petId]);

  const loading = result.petId !== petId || result.loading;
  const pet = result.petId === petId ? result.pet : null;
  const error = result.petId === petId ? result.error : "";

  const prescriptions = [];
  const billing = [];

  const nextAppointment = appointments
    .filter((appointment) => {
      const status = appointment.status.trim().toLowerCase();

      if (["cancelled", "canceled", "completed"].includes(status)) {
        return false;
      }

      if (!appointment.date || !appointment.time) return false;

      const scheduledAt = new Date(
        `${appointment.date}T${appointment.time}`
      ).getTime();

      return (
        Number.isFinite(scheduledAt) &&
        scheduledAt >= Date.now()
      );
    })
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        a.time.localeCompare(b.time) ||
        Number(a.id) - Number(b.id)
    )[0] || null;

  const latestVaccinationsByName = new Map();

  for (const vaccination of vaccinations) {
    const key = vaccination.vaccine.trim().toLowerCase();

    if (!latestVaccinationsByName.has(key)) {
      latestVaccinationsByName.set(key, vaccination);
    }
  }

  const nextVaccination = [
    ...latestVaccinationsByName.values(),
  ]
    .filter((vaccination) => vaccination.nextDueDate)
    .sort(
      (a, b) =>
        a.nextDueDate.localeCompare(b.nextDueDate) ||
        Number(a.id) - Number(b.id)
    )[0] || null;

  const today = new Date();

  const todayDateString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const vaccineDueLabel = nextVaccination
    ? nextVaccination.nextDueDate < todayDateString
      ? "Overdue"
      : nextVaccination.nextDueDate === todayDateString
        ? "Due today"
        : ""
    : "";

  const timeline = [
    ...medicalRecords.map((record) => ({
      ...record,
      timelineType: "medical",
      timelineDate: record.date,
      timelineTitle: record.reason || "Medical Record",
    })),
    ...appointments.map((appointment) => ({
      ...appointment,
      timelineType: "appointment",
      timelineDate: appointment.date,
      timelineTitle: appointment.type || "Appointment",
    })),
    ...vaccinations.map((vaccination) => ({
      ...vaccination,
      timelineType: "vaccination",
      timelineDate: vaccination.dateGiven,
      timelineTitle: vaccination.vaccine || "Vaccination",
    })),
    ...reminders.map((reminder) => ({
      ...reminder,
      timelineType: "reminder",
      timelineDate: reminder.dueDate,
      timelineTitle: reminder.type || "Reminder",
    })),
    ...medications.map((medication) => ({
      ...medication,
      timelineType: "medication",
      timelineDate: medication.startDate,
      timelineTitle: medication.name || "Medication",
    })),
  ].sort((a, b) => {
    const dateA = new Date(
      `${a.timelineDate}T${a.time || "00:00"}`
    ).getTime();

    const dateB = new Date(
      `${b.timelineDate}T${b.time || "00:00"}`
    ).getTime();

    return (
      (Number.isFinite(dateB) ? dateB : 0) -
        (Number.isFinite(dateA) ? dateA : 0) ||
      Number(b.id) - Number(a.id)
    );
  });

  const timelineLoading =
    medicalRecordsLoading ||
    appointmentsLoading ||
    vaccinationsLoading ||
    remindersLoading ||
    medicationsLoading;

  const timelineErrors = [
    medicalRecordsError,
    appointmentsError,
    vaccinationsError,
    remindersError,
    medicationsError,
  ].filter(Boolean);

  const formatDate = (date) => {
    if (!date) return "—";

    const parts = String(date).split("-");

    if (parts.length !== 3) return String(date);

    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  };

  const formatTime = (time) => {
    if (!time) return "—";

    const [hours, minutes] = String(time).split(":");

    if (!minutes) return String(time);

    let hour = Number(hours);
    const period = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;

    return `${hour}:${minutes} ${period}`;
  };

  const formatMoney = (amount) =>
    `$${Number(amount || 0).toFixed(2)}`;

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #d5e5e3",
    borderRadius: "10px",
    padding: "22px",
    marginBottom: "20px",
  };

  const sectionTitleStyle = {
    margin: "0 0 20px",
    fontSize: "18px",
    color: "#333333",
    display: "flex",
    alignItems: "center",
    gap: "9px",
  };

  const infoGridStyle = {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "0 30px",
  };

  const infoRowStyle = {
    minHeight: "58px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    padding: "12px 0",
    borderBottom: "1px solid #e4eeee",
  };

  const labelStyle = {
    color: "#718181",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const valueStyle = {
    color: "#333333",
    fontWeight: "600",
    textAlign: "right",
  };

  const emptyStyle = {
    padding: "28px",
    textAlign: "center",
    background: "#f7fbfa",
    border: "1px solid #e1eceb",
    borderRadius: "8px",
    color: "#718181",
    fontSize: "14px",
  };

  const tableWrapperStyle = {
    width: "100%",
    overflowX: "auto",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "720px",
  };

  const thStyle = {
    textAlign: "left",
    padding: "13px 14px",
    fontSize: "13px",
    color: "#52605f",
    background: "#f3f9f8",
    borderBottom: "1px solid #dcebea",
    whiteSpace: "nowrap",
  };

  const tdStyle = {
    padding: "14px",
    fontSize: "14px",
    color: "#455757",
    borderBottom: "1px solid #edf3f2",
    verticalAlign: "middle",
  };

  const getStatusStyle = (status) => {
    const normalized = String(status || "").toLowerCase();

    if (
      ["paid", "completed", "confirmed", "active"].includes(
        normalized
      )
    ) {
      return {
        background: "#e5f7ef",
        color: "#27845f",
      };
    }

    if (
      ["pending", "due", "partially paid", "upcoming"].includes(
        normalized
      )
    ) {
      return {
        background: "#fff5dc",
        color: "#9a7117",
      };
    }

    if (["overdue", "cancelled"].includes(normalized)) {
      return {
        background: "#fdeaea",
        color: "#b34d4d",
      };
    }

    return {
      background: "#edf3f2",
      color: "#52605f",
    };
  };

  const StatusBadge = ({ status }) => (
    <span
      style={{
        ...getStatusStyle(status),
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "5px 10px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {status || "—"}
    </span>
  );

  const getTimelineIcon = (type) => {
    const icons = {
      medical: <FaStethoscope />,
      appointment: <FaCalendarCheck />,
      vaccination: <FaSyringe />,
      medication: <FaPills />,
      prescription: <FaPrescriptionBottleAlt />,
      reminder: <FaBell />,
      billing: <FaFileInvoiceDollar />,
    };

    return icons[type] || <FaCalendarCheck />;
  };

  const getTimelineLabel = (type) => {
    const labels = {
      medical: "Medical Record",
      appointment: "Appointment",
      vaccination: "Vaccination",
      medication: "Medication",
      prescription: "Prescription",
      reminder: "Reminder",
      billing: "Billing",
    };

    return labels[type] || "Activity";
  };

  const getTimelineDescription = (item) => {
    if (item.timelineType === "appointment") {
      return `${item.reason || item.type || "Appointment"}${
        item.veterinarian ? ` • ${item.veterinarian}` : ""
      }${item.time ? ` • ${formatTime(item.time)}` : ""}`;
    }

    if (item.timelineType === "vaccination") {
      return `${item.vaccine || "Vaccination"}${
        item.notes ? ` • ${item.notes}` : ""
      }`;
    }

    if (item.timelineType === "medical") {
      return `${item.diagnosis || item.reason || "Medical record"}${
        item.veterinarian ? ` • ${item.veterinarian}` : ""
      }`;
    }

    if (item.timelineType === "medication") {
      return `${item.name || "Medication"}${
        item.dosage ? ` • ${item.dosage}` : ""
      }${item.frequency ? ` • ${item.frequency}` : ""}`;
    }

    if (item.timelineType === "prescription") {
      return `${item.medication || "Prescription"}${
        item.dosage ? ` • ${item.dosage}` : ""
      }`;
    }

    if (item.timelineType === "reminder") {
      return item.message || item.title || item.type || "Reminder";
    }

    if (item.timelineType === "billing") {
      return `${item.invoiceNumber || "Invoice"} • ${formatMoney(
        item.total
      )} • ${item.status || ""}`;
    }

    return "";
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-main">
          <p>Loading pet profile...</p>
        </main>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-main">
          <h1>{error ? "Unable to Load Pet" : "Pet Not Found"}</h1>

          <p role={error ? "alert" : undefined}>
            {error || "The requested pet could not be found."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/pets")}
          >
            <FaArrowLeft /> Back to Pets
          </button>
        </main>
      </div>
    );
  }
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main pets-page pet-profile-main">
        <style>{`
          .pet-profile-main {
            flex: 1 1 0 !important;
            min-width: 0 !important;
            width: auto !important;
            max-width: none !important;
            box-sizing: border-box !important;
          }

          .pet-profile-main .pet-profile-top-row {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            width: 100% !important;
            max-width: none !important;
            min-width: 0 !important;
            box-sizing: border-box !important;
            margin: 0 0 30px !important;
            padding: 0 !important;
            gap: 20px !important;
            flex-wrap: wrap !important;
          }

          .pet-profile-main .pet-profile-back-btn {
            margin-left: auto !important;
            margin-right: 0 !important;
            position: static !important;
            transform: none !important;
            flex-shrink: 0 !important;
          }

          @media (max-width: 600px) {
            .pet-profile-main .pet-profile-top-row {
              align-items: flex-start !important;
            }
          }
        `}</style>

        {/* HEADER */}

        <div
          className="pet-profile-top-row"
          style={{
            display: "flex",
            width: "100%",
            maxWidth: "none",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div className="pets-title-area">
            <h1>{pet.name}</h1>
            <p>Complete patient profile and medical history</p>
          </div>

          <button
            type="button"
            className="pet-profile-back-btn"
            onClick={() => navigate("/pets")}
            style={{
              width: "auto",
              minWidth: "120px",
              height: "44px",
              padding: "0 16px",
              border: "1px solid #55b7b3",
              borderRadius: "8px",
              background: "#ffffff",
              color: "#319c97",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "7px",
              fontWeight: 600,
              whiteSpace: "nowrap",
              marginLeft: "auto",
              marginRight: 0,
              flexShrink: 0,
            }}
          >
            <FaArrowLeft />
            Back to Pets
          </button>
        </div>

        {/* PET HERO */}

        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "22px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                width: "115px",
                height: "115px",
                minWidth: "115px",
                borderRadius: "50%",
                overflow: "hidden",
                background: "#e4f5f3",
                border: "3px solid #d5eae8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#319c97",
              }}
            >
              {pet.profilePhoto ? (
                <img
                  src={pet.profilePhoto}
                  alt={pet.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <FaPaw style={{ fontSize: "44px" }} />
              )}
            </div>

            <div style={{ flex: "1 1 300px" }}>
              <h2
                style={{
                  margin: "0 0 6px",
                  fontSize: "25px",
                  color: "#333333",
                }}
              >
                {pet.name}
              </h2>

              <p
                style={{
                  margin: "0 0 12px",
                  color: "#718181",
                }}
              >
                {pet.species || "—"} • {pet.breed || "—"}
              </p>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "7px 12px",
                  borderRadius: "20px",
                  background: "#e1f5f3",
                  color: "#319c97",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                <FaUser />
                Owner: {pet.owner || "—"}
              </div>
            </div>
          </div>
        </div>

        {/* SUMMARY CARDS */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          {[
            {
              title: "Next Appointment",
              icon: <FaCalendarCheck />,
              value: appointmentsLoading
                ? "Loading..."
                : appointmentsError
                  ? "—"
                  : nextAppointment
                    ? formatDate(nextAppointment.date)
                    : "—",
              detail: appointmentsLoading
                ? ""
                : appointmentsError
                  ? appointmentsError
                  : nextAppointment
                    ? `${formatTime(nextAppointment.time)}${
                        nextAppointment.veterinarian
                          ? ` • ${nextAppointment.veterinarian}`
                          : ""
                      }`
                    : "No upcoming appointment",
            },
            {
              title: "Next Vaccine Due",
              icon: <FaSyringe />,
              value: vaccinationsLoading
                ? "Loading..."
                : vaccinationsError
                  ? "—"
                  : nextVaccination
                    ? formatDate(nextVaccination.nextDueDate)
                    : "—",
              detail: vaccinationsLoading
                ? ""
                : vaccinationsError
                  ? vaccinationsError
                  : nextVaccination
                    ? `${nextVaccination.vaccine}${
                        vaccineDueLabel
                          ? ` • ${vaccineDueLabel}`
                          : ""
                      }`
                    : "No vaccine due date recorded",
            },
            {
              title: "Total Billing",
              icon: <FaFileInvoiceDollar />,
              value: "—",
              detail: "Not connected yet",
            },
            {
              title: "Outstanding Balance",
              icon: <FaMoneyBillWave />,
              value: "—",
              detail: "Not connected yet",
              balance: true,
            },
          ].map((card) => (
            <div key={card.title} style={cardStyle}>
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  background: "#e1f5f3",
                  color: "#319c97",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "14px",
                }}
              >
                {card.icon}
              </div>

              <div
                style={{
                  color: "#718181",
                  fontSize: "13px",
                  marginBottom: "6px",
                }}
              >
                {card.title}
              </div>

              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#333333",
                }}
              >
                {card.value}
              </div>

              {card.detail && (
                <div
                  style={{
                    marginTop: "5px",
                    color: "#718181",
                    fontSize: "13px",
                  }}
                >
                  {card.detail}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* PET INFORMATION */}

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <FaPaw style={{ color: "#319c97" }} />
            Pet Information
          </h2>

          <div style={infoGridStyle}>
            {[
              ["Pet Name", pet.name],
              ["Owner", pet.owner, <FaUser />],
              ["Species", pet.species],
              ["Breed", pet.breed],
              ["Sex", pet.sex],
              [
                "Date of Birth",
                formatDate(pet.dateOfBirth),
                <FaBirthdayCake />,
              ],
              ["Age", pet.age],
              ["Color", pet.color, <FaPalette />],
              [
                "Weight",
                pet.weight !== "" &&
                pet.weight !== null &&
                pet.weight !== undefined
                  ? `${pet.weight} kg`
                  : "",
                <FaWeightHanging />,
              ],
              [
                "Microchip Number",
                pet.microchipNumber,
                <FaMicrochip />,
              ],
              ["Blood Type", pet.bloodType, <FaTint />],
            ].map(([label, value, icon]) => (
              <div key={label} style={infoRowStyle}>
                <span style={labelStyle}>
                  {icon}
                  {label}
                </span>

                <span style={valueStyle}>
                  {value || "—"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* MEDICAL INFORMATION */}

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <FaNotesMedical style={{ color: "#319c97" }} />
            Medical Information
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "16px",
            }}
          >
            {[
              {
                title: "Allergies",
                icon: <FaExclamationTriangle />,
                value: pet.allergies || "No known allergies.",
              },
              {
                title: "Chronic Conditions",
                icon: <FaNotesMedical />,
                value:
                  pet.chronicConditions ||
                  "No chronic conditions recorded.",
              },
            ].map((item) => (
              <div key={item.title}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#718181",
                    fontSize: "14px",
                    marginBottom: "7px",
                  }}
                >
                  {item.icon}
                  {item.title}
                </div>

                <div
                  style={{
                    background: "#f7fbfa",
                    border: "1px solid #e1eceb",
                    borderRadius: "8px",
                    padding: "14px",
                    color: "#52605f",
                    minHeight: "50px",
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* APPOINTMENTS */}

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <FaCalendarCheck style={{ color: "#319c97" }} />
            Appointments
          </h2>

          {appointmentsLoading ? (
            <div style={emptyStyle}>Loading appointments...</div>
          ) : appointmentsError ? (
            <div style={emptyStyle} role="alert">
              {appointmentsError}
            </div>
          ) : appointments.length > 0 ? (
            <div style={tableWrapperStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    {[
                      "Type",
                      "Date",
                      "Time",
                      "Veterinarian",
                      "Reason",
                      "Status",
                    ].map((heading) => (
                      <th key={heading} style={thStyle}>
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td style={tdStyle}>
                        {appointment.type || "—"}
                      </td>
                      <td style={tdStyle}>
                        {formatDate(appointment.date)}
                      </td>
                      <td style={tdStyle}>
                        {formatTime(appointment.time)}
                      </td>
                      <td style={tdStyle}>
                        {appointment.veterinarian || "—"}
                      </td>
                      <td style={tdStyle}>
                        {appointment.reason || "—"}
                      </td>
                      <td style={tdStyle}>
                        <StatusBadge status={appointment.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={emptyStyle}>
              No appointments available for this pet.
            </div>
          )}
        </div>

        {/* MEDICAL RECORDS */}

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <FaStethoscope style={{ color: "#319c97" }} />
            Medical Records
          </h2>

          {medicalRecordsLoading ? (
            <div style={emptyStyle}>Loading medical records...</div>
          ) : medicalRecordsError ? (
            <div style={emptyStyle} role="alert">
              {medicalRecordsError}
            </div>
          ) : medicalRecords.length > 0 ? (
            <div style={{ display: "grid", gap: "14px" }}>
              {medicalRecords.map((record) => (
                <div
                  key={record.id}
                  style={{
                    border: "1px solid #e1eceb",
                    borderRadius: "9px",
                    padding: "16px",
                    background: "#f9fcfc",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "15px",
                      flexWrap: "wrap",
                      marginBottom: "14px",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          margin: "0 0 5px",
                          fontSize: "16px",
                          color: "#333333",
                        }}
                      >
                        {record.reason || "Medical Visit"}
                      </h3>

                      <div
                        style={{
                          color: "#718181",
                          fontSize: "13px",
                        }}
                      >
                        <FaUserMd style={{ marginRight: "6px" }} />
                        {record.veterinarian ||
                          "Veterinarian not recorded"}
                      </div>
                    </div>

                    <span
                      style={{
                        color: "#718181",
                        fontSize: "13px",
                      }}
                    >
                      {formatDate(record.date)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "12px",
                    }}
                  >
                    {[
                      ["Diagnosis", record.diagnosis],
                      ["Treatment", record.treatment],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <div
                          style={{
                            color: "#718181",
                            fontSize: "12px",
                            marginBottom: "4px",
                          }}
                        >
                          {label}
                        </div>

                        <strong>{value || "—"}</strong>
                      </div>
                    ))}
                  </div>

                  {record.notes && (
                    <div
                      style={{
                        marginTop: "14px",
                        paddingTop: "14px",
                        borderTop: "1px solid #e4eeee",
                        color: "#52605f",
                        fontSize: "14px",
                      }}
                    >
                      {record.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={emptyStyle}>
              No medical records available for this pet.
            </div>
          )}
        </div>

        {/* VACCINATIONS */}

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <FaSyringe style={{ color: "#319c97" }} />
            Vaccinations
          </h2>

          {vaccinationsLoading ? (
            <div style={emptyStyle}>Loading vaccinations...</div>
          ) : vaccinationsError ? (
            <div style={emptyStyle} role="alert">
              {vaccinationsError}
            </div>
          ) : vaccinations.length > 0 ? (
            <div style={tableWrapperStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    {[
                      "Vaccine",
                      "Date Given",
                      "Next Due",
                      "Status",
                      "Notes",
                    ].map((heading) => (
                      <th key={heading} style={thStyle}>
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {vaccinations.map((vaccination) => (
                    <tr key={vaccination.id}>
                      <td style={tdStyle}>
                        <strong>{vaccination.vaccine || "—"}</strong>
                      </td>
                      <td style={tdStyle}>
                        {formatDate(vaccination.dateGiven)}
                      </td>
                      <td style={tdStyle}>
                        {formatDate(vaccination.nextDueDate)}
                      </td>
                      <td style={tdStyle}>
                        <StatusBadge status={vaccination.status} />
                      </td>
                      <td style={tdStyle}>
                        {vaccination.notes || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={emptyStyle}>
              No vaccinations available for this pet.
            </div>
          )}
        </div>

        {/* MEDICATIONS */}

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <FaPills style={{ color: "#319c97" }} />
            Medications
          </h2>

          {medicationsLoading ? (
            <div style={emptyStyle}>Loading medications...</div>
          ) : medicationsError ? (
            <div style={emptyStyle} role="alert">
              {medicationsError}
            </div>
          ) : medications.length > 0 ? (
            <div style={tableWrapperStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    {[
                      "Medication",
                      "Dosage",
                      "Frequency",
                      "Route",
                      "Start",
                      "End",
                      "Status",
                    ].map((heading) => (
                      <th key={heading} style={thStyle}>
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {medications.map((medication) => (
                    <tr key={medication.id}>
                      <td style={tdStyle}>
                        <strong>{medication.name || "—"}</strong>
                      </td>
                      <td style={tdStyle}>
                        {medication.dosage || "—"}
                      </td>
                      <td style={tdStyle}>
                        {medication.frequency || "—"}
                      </td>
                      <td style={tdStyle}>
                        {medication.route || "—"}
                      </td>
                      <td style={tdStyle}>
                        {formatDate(medication.startDate)}
                      </td>
                      <td style={tdStyle}>
                        {formatDate(medication.endDate)}
                      </td>
                      <td style={tdStyle}>
                        <StatusBadge status={medication.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={emptyStyle}>
              No medications available for this pet.
            </div>
          )}
        </div>

        {/* PRESCRIPTIONS */}

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <FaPrescriptionBottleAlt style={{ color: "#319c97" }} />
            Prescriptions
          </h2>

          {prescriptions.length > 0 ? (
            <div style={{ display: "grid", gap: "12px" }}>
              {prescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  style={{
                    border: "1px solid #e1eceb",
                    background: "#f9fcfc",
                    borderRadius: "9px",
                    padding: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "15px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          margin: "0 0 6px",
                          color: "#333333",
                          fontSize: "16px",
                        }}
                      >
                        {prescription.medication || "Prescription"}
                      </h3>

                      <div
                        style={{
                          color: "#718181",
                          fontSize: "13px",
                        }}
                      >
                        {prescription.veterinarian || "—"}
                      </div>
                    </div>

                    <span
                      style={{
                        color: "#718181",
                        fontSize: "13px",
                      }}
                    >
                      {formatDate(prescription.date)}
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: "14px",
                      paddingTop: "14px",
                      borderTop: "1px solid #e4eeee",
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "15px",
                    }}
                  >
                    {[
                      ["Dosage", prescription.dosage],
                      ["Instructions", prescription.instructions],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <div
                          style={{
                            color: "#718181",
                            fontSize: "12px",
                            marginBottom: "4px",
                          }}
                        >
                          {label}
                        </div>

                        <strong>{value || "—"}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={emptyStyle}>
              Prescription records are not connected yet.
            </div>
          )}
        </div>

        {/* REMINDERS */}

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <FaBell style={{ color: "#319c97" }} />
            Reminders
          </h2>

          {remindersLoading ? (
            <div style={emptyStyle}>Loading reminders...</div>
          ) : remindersError ? (
            <div style={emptyStyle} role="alert">
              {remindersError}
            </div>
          ) : reminders.length > 0 ? (
            <div style={{ display: "grid", gap: "12px" }}>
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  style={{
                    border: "1px solid #e1eceb",
                    background: "#f9fcfc",
                    borderRadius: "9px",
                    padding: "15px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "15px",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "50%",
                        background: "#e1f5f3",
                        color: "#319c97",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FaBell />
                    </div>

                    <div>
                      <strong
                        style={{
                          display: "block",
                          color: "#333333",
                          marginBottom: "4px",
                        }}
                      >
                        {reminder.title || reminder.type || "Reminder"}
                      </strong>

                      <span
                        style={{
                          color: "#718181",
                          fontSize: "13px",
                        }}
                      >
                        {formatDate(reminder.date)}
                      </span>
                    </div>
                  </div>

                  <StatusBadge status={reminder.status} />
                </div>
              ))}
            </div>
          ) : (
            <div style={emptyStyle}>
              No reminders available for this pet.
            </div>
          )}
        </div>

        {/* BILLING & INVOICES */}

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <FaFileInvoiceDollar style={{ color: "#319c97" }} />
            Billing & Invoices
          </h2>

          {billing.length > 0 ? (
            <div style={{ display: "grid", gap: "16px" }}>
              {billing.map((invoice) => (
                <div
                  key={invoice.id}
                  style={{
                    border: "1px solid #dcebea",
                    borderRadius: "9px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      background: "#f3f9f8",
                      padding: "14px 16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "15px",
                      flexWrap: "wrap",
                      borderBottom: "1px solid #dcebea",
                    }}
                  >
                    <div>
                      <strong
                        style={{
                          display: "block",
                          color: "#333333",
                          marginBottom: "4px",
                        }}
                      >
                        {invoice.invoiceNumber || `Invoice #${invoice.id}`}
                      </strong>

                      <span
                        style={{
                          color: "#718181",
                          fontSize: "13px",
                        }}
                      >
                        {formatDate(invoice.date)}
                      </span>
                    </div>

                    <StatusBadge status={invoice.status} />
                  </div>

                  {invoice.items?.length > 0 && (
                    <div style={tableWrapperStyle}>
                      <table
                        style={{
                          ...tableStyle,
                          minWidth: "600px",
                        }}
                      >
                        <thead>
                          <tr>
                            {[
                              "Type",
                              "Description",
                              "Qty",
                              "Unit Price",
                              "Total",
                            ].map((heading) => (
                              <th key={heading} style={thStyle}>
                                {heading}
                              </th>
                            ))}
                          </tr>
                        </thead>

                        <tbody>
                          {invoice.items.map((item, index) => (
                            <tr key={index}>
                              <td style={tdStyle}>{item.type || "—"}</td>
                              <td style={tdStyle}>
                                {item.description || "—"}
                              </td>
                              <td style={tdStyle}>{item.quantity || 1}</td>
                              <td style={tdStyle}>
                                {formatMoney(item.unitPrice)}
                              </td>
                              <td style={tdStyle}>
                                {formatMoney(
                                  Number(item.quantity || 1) *
                                    Number(item.unitPrice || 0)
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div
                    style={{
                      padding: "16px",
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        maxWidth: "330px",
                      }}
                    >
                      {[
                        ["Total", invoice.total, "#333333"],
                        ["Paid", invoice.paid, "#27845f"],
                        [
                          "Balance",
                          invoice.balance,
                          Number(invoice.balance || 0) > 0
                            ? "#b47a18"
                            : "#27845f",
                        ],
                      ].map(([label, value, color], index) => (
                        <div
                          key={label}
                          style={{
                            ...infoRowStyle,
                            minHeight: "42px",
                            padding: "7px 0",
                            borderBottom:
                              index === 2
                                ? "none"
                                : "1px solid #e4eeee",
                          }}
                        >
                          <span style={labelStyle}>{label}</span>

                          <strong style={{ color }}>
                            {formatMoney(value)}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={emptyStyle}>
              Billing records are not connected yet.
            </div>
          )}
        </div>

        {/* NOTES */}

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <FaStickyNote style={{ color: "#319c97" }} />
            Notes
          </h2>

          <div
            style={{
              background: "#f7fbfa",
              border: "1px solid #e1eceb",
              borderRadius: "8px",
              padding: "15px",
              color: "#52605f",
              lineHeight: 1.6,
              minHeight: "55px",
            }}
          >
            {pet.notes || "No notes added for this pet."}
          </div>
        </div>

        {/* COMPLETE PET TIMELINE */}

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <FaCalendarCheck style={{ color: "#319c97" }} />
            Complete Pet Timeline
          </h2>

          <p
            style={{
              margin: "-10px 0 22px",
              color: "#718181",
              fontSize: "14px",
            }}
          >
            Appointments, medical records, vaccinations,
            medications, prescriptions, reminders and billing.
          </p>

          {timelineLoading && (
            <div style={emptyStyle}>Loading pet activity...</div>
          )}

          {timelineErrors.map((message, index) => (
            <div
              key={`${index}-${message}`}
              style={emptyStyle}
              role="alert"
            >
              {message}
            </div>
          ))}

          {timeline.length > 0 ? (
            <div
              style={{
                position: "relative",
                paddingLeft: "18px",
              }}
            >
              {timeline.map((item, index) => (
                <div
                  key={`${item.timelineType}-${item.id}-${index}`}
                  style={{
                    display: "flex",
                    gap: "16px",
                    position: "relative",
                    paddingBottom:
                      index === timeline.length - 1 ? 0 : "22px",
                  }}
                >
                  {index !== timeline.length - 1 && (
                    <div
                      style={{
                        position: "absolute",
                        left: "19px",
                        top: "38px",
                        bottom: 0,
                        width: "2px",
                        background: "#d9e9e7",
                      }}
                    />
                  )}

                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      minWidth: "40px",
                      borderRadius: "50%",
                      background: "#e1f5f3",
                      color: "#319c97",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 1,
                      fontSize: "15px",
                    }}
                  >
                    {getTimelineIcon(item.timelineType)}
                  </div>

                  <div
                    style={{
                      flex: 1,
                      background: "#f9fcfc",
                      border: "1px solid #e1eceb",
                      borderRadius: "9px",
                      padding: "14px 16px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "15px",
                        flexWrap: "wrap",
                        marginBottom: "5px",
                      }}
                    >
                      <div>
                        <span
                          style={{
                            display: "inline-block",
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "#319c97",
                            background: "#e1f5f3",
                            borderRadius: "15px",
                            padding: "4px 9px",
                            marginBottom: "7px",
                          }}
                        >
                          {getTimelineLabel(item.timelineType)}
                        </span>

                        <h3
                          style={{
                            margin: 0,
                            color: "#333333",
                            fontSize: "15px",
                          }}
                        >
                          {item.timelineTitle || "Activity"}
                        </h3>
                      </div>

                      <span
                        style={{
                          color: "#718181",
                          fontSize: "13px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDate(item.timelineDate)}
                      </span>
                    </div>

                    <p
                      style={{
                        margin: "6px 0 0",
                        color: "#52605f",
                        fontSize: "14px",
                        lineHeight: 1.5,
                      }}
                    >
                      {getTimelineDescription(item)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !timelineLoading &&
            timelineErrors.length === 0 && (
              <div style={emptyStyle}>
                No appointment, medical record, vaccination,
                medication or reminder activity available for this pet.
                Other timeline modules are not connected yet.
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}

export default PetProfile;