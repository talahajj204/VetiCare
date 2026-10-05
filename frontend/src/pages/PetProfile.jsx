import { useLocation, useNavigate, useParams } from "react-router-dom";
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
  FaCamera,
  FaFileInvoiceDollar,
  FaClock,
  FaUserMd,
  FaMoneyBillWave,
  FaCheckCircle,
} from "react-icons/fa";

import Sidebar from "../components/Sidebar";

import {
  getPetRecords,
  getPetBillingSummary,
  getNextAppointment,
  getNextVaccinationDue,
  getPetTimeline,
} from "../data/petRecords";

function PetProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { petId } = useParams();

  const passedPet = location.state?.pet;

  // =====================================================
  // FALLBACK PET DATA
  // =====================================================

  const fallbackPets = {
    1: {
      id: 1,
      name: "Bella",
      owner: "Tala El Hajj",
      species: "Dog",
      breed: "Golden Retriever",
      age: "4 years",

      sex: "Female",
      dateOfBirth: "2022-04-15",
      color: "Golden",
      weight: "28 kg",

      microchipNumber: "985141000123456",
      bloodType: "DEA 1.1 Positive",

      allergies: "Chicken",
      chronicConditions: "None",

      notes: "Friendly pet. Prefers calm handling.",
      profilePhoto: "",
    },

    2: {
      id: 2,
      name: "Luna",
      owner: "Fatima Abbas",
      species: "Bird",
      breed: "Love Birds",
      age: "2 years",

      sex: "Female",
      dateOfBirth: "2024-03-10",
      color: "Green / Yellow",
      weight: "55 g",

      microchipNumber: "Not available",
      bloodType: "Not recorded",

      allergies: "None known",
      chronicConditions: "None",

      notes: "Routine checkups only.",
      profilePhoto: "",
    },
  };

  const fallbackPet = fallbackPets[petId];

  // =====================================================
  // PET
  // =====================================================

  const pet = passedPet
    ? {
        ...(fallbackPet || {}),
        ...passedPet,
      }
    : fallbackPet;

  // =====================================================
  // PET NOT FOUND
  // =====================================================

  if (!pet) {
    return (
      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-main">
          <div className="page-header">
            <div>
              <h1>Pet Not Found</h1>
              <p>The requested pet could not be found.</p>
            </div>
          </div>

          <button
            type="button"
            className="save-button"
            onClick={() => navigate("/pets")}
            style={{
              width: "auto",
              padding: "10px 18px",
            }}
          >
            <FaArrowLeft />

            <span style={{ marginLeft: "7px" }}>
              Back to Pets
            </span>
          </button>
        </main>
      </div>
    );
  }

  // =====================================================
  // RECORDS
  // =====================================================

  const records = getPetRecords(pet.name);

  const billingSummary = getPetBillingSummary(pet.name);

  const nextAppointment = getNextAppointment(pet.name);

  const nextVaccination = getNextVaccinationDue(pet.name);

  const timeline = getPetTimeline(pet.name);

  // =====================================================
  // HELPERS
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "—";

    const parts = String(date).split("-");

    if (parts.length !== 3) {
      return date;
    }

    const [year, month, day] = parts;

    return `${day}/${month}/${year}`;
  };

  const formatTime = (time) => {
    if (!time) return "—";

    const [hours, minutes] = time.split(":");

    let hour = Number(hours);

    const period = hour >= 12 ? "PM" : "AM";

    hour = hour % 12 || 12;

    return `${hour}:${minutes} ${period}`;
  };

  const formatMoney = (amount) => {
    return `$${Number(amount || 0).toFixed(2)}`;
  };

  // =====================================================
  // STYLES
  // =====================================================

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #d5e5e3",
    borderRadius: "10px",
    padding: "22px",
    marginBottom: "20px",
  };

  const sectionTitleStyle = {
    margin: 0,
    marginBottom: "20px",
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

  // =====================================================
  // STATUS
  // =====================================================

  const getStatusStyle = (status) => {
    const normalizedStatus =
      String(status || "").toLowerCase();

    if (
      normalizedStatus === "paid" ||
      normalizedStatus === "completed" ||
      normalizedStatus === "confirmed" ||
      normalizedStatus === "active"
    ) {
      return {
        background: "#e5f7ef",
        color: "#27845f",
      };
    }

    if (
      normalizedStatus === "pending" ||
      normalizedStatus === "due" ||
      normalizedStatus === "partially paid" ||
      normalizedStatus === "upcoming"
    ) {
      return {
        background: "#fff5dc",
        color: "#9a7117",
      };
    }

    if (
      normalizedStatus === "overdue" ||
      normalizedStatus === "cancelled"
    ) {
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

  const StatusBadge = ({ status }) => {
    const style = getStatusStyle(status);

    return (
      <span
        style={{
          ...style,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "5px 10px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: "700",
          whiteSpace: "nowrap",
        }}
      >
        {status || "—"}
      </span>
    );
  };

  // =====================================================
  // TIMELINE
  // =====================================================

  const getTimelineIcon = (type) => {
    if (type === "medical") {
      return <FaStethoscope />;
    }

    if (type === "appointment") {
      return <FaCalendarCheck />;
    }

    if (type === "vaccination") {
      return <FaSyringe />;
    }

    if (type === "medication") {
      return <FaPills />;
    }

    if (type === "prescription") {
      return <FaPrescriptionBottleAlt />;
    }

    if (type === "reminder") {
      return <FaBell />;
    }

    if (type === "billing") {
      return <FaFileInvoiceDollar />;
    }

    return <FaCalendarCheck />;
  };

  const getTimelineLabel = (type) => {
    if (type === "medical") return "Medical Record";

    if (type === "appointment") return "Appointment";

    if (type === "vaccination") return "Vaccination";

    if (type === "medication") return "Medication";

    if (type === "prescription") return "Prescription";

    if (type === "reminder") return "Reminder";

    if (type === "billing") return "Billing";

    return "Activity";
  };

  const getTimelineDescription = (item) => {
    if (item.timelineType === "appointment") {
      return `${item.reason || item.type || "Appointment"}${
        item.veterinarian
          ? ` • ${item.veterinarian}`
          : ""
      }${
        item.time
          ? ` • ${formatTime(item.time)}`
          : ""
      }`;
    }

    if (item.timelineType === "vaccination") {
      return `${item.vaccine || "Vaccination"}${
        item.notes ? ` • ${item.notes}` : ""
      }`;
    }

    if (item.timelineType === "medical") {
      return `${item.diagnosis || item.reason || "Medical record"}${
        item.veterinarian
          ? ` • ${item.veterinarian}`
          : ""
      }`;
    }

    if (item.timelineType === "medication") {
      return `${item.name || "Medication"}${
        item.dosage ? ` • ${item.dosage}` : ""
      }${
        item.frequency
          ? ` • ${item.frequency}`
          : ""
      }`;
    }

    if (item.timelineType === "prescription") {
      return `${item.medication || "Prescription"}${
        item.dosage ? ` • ${item.dosage}` : ""
      }`;
    }

    if (item.timelineType === "reminder") {
      return item.title || item.type || "Reminder";
    }

    if (item.timelineType === "billing") {
      return `${item.invoiceNumber || "Invoice"} • ${formatMoney(
        item.total
      )} • ${item.status || ""}`;
    }

    return "";
  };

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main pets-page">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div
          className="page-header pets-page-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div className="pets-title-area">
            <h1>{pet.name}</h1>

            <p>
              Complete patient profile and medical history
            </p>
          </div>

          <button
            type="button"
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
              fontWeight: "600",
              whiteSpace: "nowrap",
            }}
          >
            <FaArrowLeft />

            Back to Pets
          </button>
        </div>

        {/* =====================================================
            PET HERO
        ===================================================== */}

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
                <FaPaw
                  style={{
                    fontSize: "44px",
                  }}
                />
              )}
            </div>

            <div
              style={{
                flex: "1 1 300px",
              }}
            >
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
                {pet.species || "—"} •{" "}
                {pet.breed || "—"}
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
                  fontWeight: "600",
                }}
              >
                <FaUser />

                Owner: {pet.owner || "—"}
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            SUMMARY CARDS
        ===================================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          {/* NEXT APPOINTMENT */}

          <div style={cardStyle}>
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
              <FaCalendarCheck />
            </div>

            <div
              style={{
                color: "#718181",
                fontSize: "13px",
                marginBottom: "6px",
              }}
            >
              Next Appointment
            </div>

            <div
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#333333",
              }}
            >
              {nextAppointment
                ? formatDate(nextAppointment.date)
                : "No appointment"}
            </div>

            {nextAppointment && (
              <div
                style={{
                  marginTop: "5px",
                  color: "#718181",
                  fontSize: "13px",
                }}
              >
                {formatTime(nextAppointment.time)}
              </div>
            )}
          </div>

          {/* NEXT VACCINE */}

          <div style={cardStyle}>
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
              <FaSyringe />
            </div>

            <div
              style={{
                color: "#718181",
                fontSize: "13px",
                marginBottom: "6px",
              }}
            >
              Next Vaccine Due
            </div>

            <div
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#333333",
              }}
            >
              {nextVaccination
                ? formatDate(
                    nextVaccination.nextDueDate
                  )
                : "No vaccine due"}
            </div>

            {nextVaccination && (
              <div
                style={{
                  marginTop: "5px",
                  color: "#718181",
                  fontSize: "13px",
                }}
              >
                {nextVaccination.vaccine}
              </div>
            )}
          </div>

          {/* TOTAL BILLING */}

          <div style={cardStyle}>
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
              <FaFileInvoiceDollar />
            </div>

            <div
              style={{
                color: "#718181",
                fontSize: "13px",
                marginBottom: "6px",
              }}
            >
              Total Billing
            </div>

            <div
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#333333",
              }}
            >
              {formatMoney(billingSummary.total)}
            </div>

            <div
              style={{
                marginTop: "5px",
                color: "#718181",
                fontSize: "13px",
              }}
            >
              Paid {formatMoney(billingSummary.paid)}
            </div>
          </div>

          {/* BALANCE */}

          <div style={cardStyle}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                background:
                  billingSummary.balance > 0
                    ? "#fff5dc"
                    : "#e5f7ef",
                color:
                  billingSummary.balance > 0
                    ? "#9a7117"
                    : "#27845f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "14px",
              }}
            >
              <FaMoneyBillWave />
            </div>

            <div
              style={{
                color: "#718181",
                fontSize: "13px",
                marginBottom: "6px",
              }}
            >
              Outstanding Balance
            </div>

            <div
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color:
                  billingSummary.balance > 0
                    ? "#9a7117"
                    : "#27845f",
              }}
            >
              {formatMoney(
                billingSummary.balance
              )}
            </div>

            <div
              style={{
                marginTop: "5px",
                color: "#718181",
                fontSize: "13px",
              }}
            >
              {billingSummary.balance > 0
                ? "Payment remaining"
                : "Fully paid"}
            </div>
          </div>
        </div>

        {/* =====================================================
            PET INFORMATION
        ===================================================== */}

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <FaPaw
              style={{
                color: "#319c97",
              }}
            />

            Pet Information
          </h2>

          <div style={infoGridStyle}>
            <div style={infoRowStyle}>
              <span style={labelStyle}>
                Pet Name
              </span>

              <span style={valueStyle}>
                {pet.name || "—"}
              </span>
            </div>

            <div style={infoRowStyle}>
              <span style={labelStyle}>
                <FaUser />
                Owner
              </span>

              <span style={valueStyle}>
                {pet.owner || "—"}
              </span>
            </div>

            <div style={infoRowStyle}>
              <span style={labelStyle}>
                Species
              </span>

              <span style={valueStyle}>
                {pet.species || "—"}
              </span>
            </div>

            <div style={infoRowStyle}>
              <span style={labelStyle}>
                Breed
              </span>

              <span style={valueStyle}>
                {pet.breed || "—"}
              </span>
            </div>

            <div style={infoRowStyle}>
              <span style={labelStyle}>
                Sex
              </span>

              <span style={valueStyle}>
                {pet.sex || "—"}
              </span>
            </div>

            <div style={infoRowStyle}>
              <span style={labelStyle}>
                <FaBirthdayCake />
                Date of Birth
              </span>

              <span style={valueStyle}>
                {formatDate(
                  pet.dateOfBirth
                )}
              </span>
            </div>

            <div style={infoRowStyle}>
              <span style={labelStyle}>
                Age
              </span>

              <span style={valueStyle}>
                {pet.age || "—"}
              </span>
            </div>

            <div style={infoRowStyle}>
              <span style={labelStyle}>
                <FaPalette />
                Color
              </span>

              <span style={valueStyle}>
                {pet.color || "—"}
              </span>
            </div>

            <div style={infoRowStyle}>
              <span style={labelStyle}>
                <FaWeightHanging />
                Weight
              </span>

              <span style={valueStyle}>
                {pet.weight || "—"}
              </span>
            </div>

            <div style={infoRowStyle}>
              <span style={labelStyle}>
                <FaMicrochip />
                Microchip Number
              </span>

              <span style={valueStyle}>
                {pet.microchipNumber || "—"}
              </span>
            </div>

            <div style={infoRowStyle}>
              <span style={labelStyle}>
                <FaTint />
                Blood Type
              </span>

              <span style={valueStyle}>
                {pet.bloodType || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* =====================================================
            MEDICAL INFORMATION
        ===================================================== */}

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <FaNotesMedical
              style={{
                color: "#319c97",
              }}
            />

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
            <div>
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
                <FaExclamationTriangle />

                Allergies
              </div>

              <div
                style={{
                  background: "#f7fbfa",
                  border:
                    "1px solid #e1eceb",
                  borderRadius: "8px",
                  padding: "14px",
                  color: "#52605f",
                  minHeight: "50px",
                }}
              >
                {pet.allergies ||
                  "No known allergies."}
              </div>
            </div>

            <div>
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
                <FaNotesMedical />

                Chronic Conditions
              </div>

              <div
                style={{
                  background: "#f7fbfa",
                  border:
                    "1px solid #e1eceb",
                  borderRadius: "8px",
                  padding: "14px",
                  color: "#52605f",
                  minHeight: "50px",
                }}
              >
                {pet.chronicConditions ||
                  "No chronic conditions recorded."}
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            APPOINTMENTS
        ===================================================== */}

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <FaCalendarCheck
              style={{
                color: "#319c97",
              }}
            />

            Appointments
          </h2>

          {records.appointments.length > 0 ? (
            <div style={tableWrapperStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Type</th>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Time</th>
                    <th style={thStyle}>
                      Veterinarian
                    </th>
                    <th style={thStyle}>
                      Reason
                    </th>
                    <th style={thStyle}>
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {records.appointments.map(
                    (appointment) => (
                      <tr key={appointment.id}>
                        <td style={tdStyle}>
                          {appointment.type ||
                            "—"}
                        </td>

                        <td style={tdStyle}>
                          {formatDate(
                            appointment.date
                          )}
                        </td>

                        <td style={tdStyle}>
                          {formatTime(
                            appointment.time
                          )}
                        </td>

                        <td style={tdStyle}>
                          {appointment.veterinarian ||
                            "—"}
                        </td>

                        <td style={tdStyle}>
                          {appointment.reason ||
                            "—"}
                        </td>

                        <td style={tdStyle}>
                          <StatusBadge
                            status={
                              appointment.status
                            }
                          />
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={emptyStyle}>
              No appointments recorded for{" "}
              {pet.name}.
            </div>
          )}
        </div>

        {/* =====================================================
            MEDICAL RECORDS
        ===================================================== */}

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <FaStethoscope
              style={{
                color: "#319c97",
              }}
            />

            Medical Records
          </h2>

          {records.medicalRecords.length >
          0 ? (
            <div
              style={{
                display: "grid",
                gap: "14px",
              }}
            >
              {records.medicalRecords.map(
                (record) => (
                  <div
                    key={record.id}
                    style={{
                      border:
                        "1px solid #e1eceb",
                      borderRadius: "9px",
                      padding: "16px",
                      background: "#f9fcfc",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "flex-start",
                        gap: "15px",
                        flexWrap: "wrap",
                        marginBottom: "14px",
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            margin:
                              "0 0 5px",
                            fontSize: "16px",
                            color: "#333333",
                          }}
                        >
                          {record.reason ||
                            "Medical Visit"}
                        </h3>

                        <div
                          style={{
                            color:
                              "#718181",
                            fontSize:
                              "13px",
                          }}
                        >
                          <FaUserMd
                            style={{
                              marginRight:
                                "6px",
                            }}
                          />

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
                        {formatDate(
                          record.date
                        )}
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
                      <div>
                        <div
                          style={{
                            color:
                              "#718181",
                            fontSize:
                              "12px",
                            marginBottom:
                              "4px",
                          }}
                        >
                          Diagnosis
                        </div>

                        <strong>
                          {record.diagnosis ||
                            "—"}
                        </strong>
                      </div>

                      <div>
                        <div
                          style={{
                            color:
                              "#718181",
                            fontSize:
                              "12px",
                            marginBottom:
                              "4px",
                          }}
                        >
                          Treatment
                        </div>

                        <strong>
                          {record.treatment ||
                            "—"}
                        </strong>
                      </div>
                    </div>

                    {record.notes && (
                      <div
                        style={{
                          marginTop: "14px",
                          paddingTop: "14px",
                          borderTop:
                            "1px solid #e4eeee",
                          color: "#52605f",
                          fontSize: "14px",
                        }}
                      >
                        {record.notes}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          ) : (
            <div style={emptyStyle}>
              No medical records available.
            </div>
          )}
        </div>

        {/* =====================================================
            VACCINATIONS
        ===================================================== */}

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <FaSyringe
              style={{
                color: "#319c97",
              }}
            />

            Vaccinations
          </h2>

          {records.vaccinations.length >
          0 ? (
            <div style={tableWrapperStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>
                      Vaccine
                    </th>

                    <th style={thStyle}>
                      Date Given
                    </th>

                    <th style={thStyle}>
                      Next Due
                    </th>

                    <th style={thStyle}>
                      Status
                    </th>

                    <th style={thStyle}>
                      Notes
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {records.vaccinations.map(
                    (vaccination) => (
                      <tr
                        key={
                          vaccination.id
                        }
                      >
                        <td style={tdStyle}>
                          <strong>
                            {vaccination.vaccine ||
                              "—"}
                          </strong>
                        </td>

                        <td style={tdStyle}>
                          {formatDate(
                            vaccination.dateGiven
                          )}
                        </td>

                        <td style={tdStyle}>
                          {formatDate(
                            vaccination.nextDueDate
                          )}
                        </td>

                        <td style={tdStyle}>
                          <StatusBadge
                            status={
                              vaccination.status
                            }
                          />
                        </td>

                        <td style={tdStyle}>
                          {vaccination.notes ||
                            "—"}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={emptyStyle}>
              No vaccination records
              available.
            </div>
          )}
        </div>

        {/* =====================================================
            MEDICATIONS
        ===================================================== */}

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <FaPills
              style={{
                color: "#319c97",
              }}
            />

            Medications
          </h2>

          {records.medications.length >
          0 ? (
            <div style={tableWrapperStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>
                      Medication
                    </th>

                    <th style={thStyle}>
                      Dosage
                    </th>

                    <th style={thStyle}>
                      Frequency
                    </th>

                    <th style={thStyle}>
                      Route
                    </th>

                    <th style={thStyle}>
                      Start
                    </th>

                    <th style={thStyle}>
                      End
                    </th>

                    <th style={thStyle}>
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {records.medications.map(
                    (medication) => (
                      <tr
                        key={medication.id}
                      >
                        <td style={tdStyle}>
                          <strong>
                            {medication.name ||
                              "—"}
                          </strong>
                        </td>

                        <td style={tdStyle}>
                          {medication.dosage ||
                            "—"}
                        </td>

                        <td style={tdStyle}>
                          {medication.frequency ||
                            "—"}
                        </td>

                        <td style={tdStyle}>
                          {medication.route ||
                            "—"}
                        </td>

                        <td style={tdStyle}>
                          {formatDate(
                            medication.startDate
                          )}
                        </td>

                        <td style={tdStyle}>
                          {formatDate(
                            medication.endDate
                          )}
                        </td>

                        <td style={tdStyle}>
                          <StatusBadge
                            status={
                              medication.status
                            }
                          />
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={emptyStyle}>
              No medications recorded.
            </div>
          )}
        </div>

        {/* =====================================================
            PRESCRIPTIONS
        ===================================================== */}

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <FaPrescriptionBottleAlt
              style={{
                color: "#319c97",
              }}
            />

            Prescriptions
          </h2>

          {records.prescriptions.length >
          0 ? (
            <div
              style={{
                display: "grid",
                gap: "12px",
              }}
            >
              {records.prescriptions.map(
                (prescription) => (
                  <div
                    key={prescription.id}
                    style={{
                      border:
                        "1px solid #e1eceb",
                      background: "#f9fcfc",
                      borderRadius: "9px",
                      padding: "16px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "flex-start",
                        gap: "15px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            margin:
                              "0 0 6px",
                            color: "#333333",
                            fontSize:
                              "16px",
                          }}
                        >
                          {prescription.medication ||
                            "Prescription"}
                        </h3>

                        <div
                          style={{
                            color:
                              "#718181",
                            fontSize:
                              "13px",
                          }}
                        >
                          {prescription.veterinarian ||
                            "—"}
                        </div>
                      </div>

                      <span
                        style={{
                          color: "#718181",
                          fontSize: "13px",
                        }}
                      >
                        {formatDate(
                          prescription.date
                        )}
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: "14px",
                        paddingTop: "14px",
                        borderTop:
                          "1px solid #e4eeee",
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "15px",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            color:
                              "#718181",
                            fontSize:
                              "12px",
                            marginBottom:
                              "4px",
                          }}
                        >
                          Dosage
                        </div>

                        <strong>
                          {prescription.dosage ||
                            "—"}
                        </strong>
                      </div>

                      <div>
                        <div
                          style={{
                            color:
                              "#718181",
                            fontSize:
                              "12px",
                            marginBottom:
                              "4px",
                          }}
                        >
                          Instructions
                        </div>

                        <strong>
                          {prescription.instructions ||
                            "—"}
                        </strong>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div style={emptyStyle}>
              No prescriptions recorded.
            </div>
          )}
        </div>

        {/* =====================================================
            REMINDERS
        ===================================================== */}

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <FaBell
              style={{
                color: "#319c97",
              }}
            />

            Reminders
          </h2>

          {records.reminders.length > 0 ? (
            <div
              style={{
                display: "grid",
                gap: "12px",
              }}
            >
              {records.reminders.map(
                (reminder) => (
                  <div
                    key={reminder.id}
                    style={{
                      border:
                        "1px solid #e1eceb",
                      background: "#f9fcfc",
                      borderRadius: "9px",
                      padding: "15px 16px",
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      gap: "15px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems:
                          "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius:
                            "50%",
                          background:
                            "#e1f5f3",
                          color: "#319c97",
                          display: "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                        }}
                      >
                        <FaBell />
                      </div>

                      <div>
                        <strong
                          style={{
                            display:
                              "block",
                            color:
                              "#333333",
                            marginBottom:
                              "4px",
                          }}
                        >
                          {reminder.title ||
                            reminder.type ||
                            "Reminder"}
                        </strong>

                        <span
                          style={{
                            color:
                              "#718181",
                            fontSize:
                              "13px",
                          }}
                        >
                          {formatDate(
                            reminder.date
                          )}
                        </span>
                      </div>
                    </div>

                    <StatusBadge
                      status={reminder.status}
                    />
                  </div>
                )
              )}
            </div>
          ) : (
            <div style={emptyStyle}>
              No reminders available.
            </div>
          )}
        </div>

        {/* =====================================================
            BILLING
        ===================================================== */}

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <FaFileInvoiceDollar
              style={{
                color: "#319c97",
              }}
            />

            Billing & Invoices
          </h2>

          {records.billing.length > 0 ? (
            <div
              style={{
                display: "grid",
                gap: "16px",
              }}
            >
              {records.billing.map(
                (invoice) => (
                  <div
                    key={invoice.id}
                    style={{
                      border:
                        "1px solid #dcebea",
                      borderRadius: "9px",
                      overflow: "hidden",
                    }}
                  >
                    {/* INVOICE HEADER */}

                    <div
                      style={{
                        background: "#f3f9f8",
                        padding:
                          "14px 16px",
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "center",
                        gap: "15px",
                        flexWrap: "wrap",
                        borderBottom:
                          "1px solid #dcebea",
                      }}
                    >
                      <div>
                        <strong
                          style={{
                            display:
                              "block",
                            color:
                              "#333333",
                            marginBottom:
                              "4px",
                          }}
                        >
                          {invoice.invoiceNumber ||
                            `Invoice #${invoice.id}`}
                        </strong>

                        <span
                          style={{
                            color:
                              "#718181",
                            fontSize:
                              "13px",
                          }}
                        >
                          {formatDate(
                            invoice.date
                          )}
                        </span>
                      </div>

                      <StatusBadge
                        status={invoice.status}
                      />
                    </div>

                    {/* INVOICE ITEMS */}

                    {invoice.items?.length >
                      0 && (
                      <div
                        style={
                          tableWrapperStyle
                        }
                      >
                        <table
                          style={{
                            ...tableStyle,
                            minWidth:
                              "600px",
                          }}
                        >
                          <thead>
                            <tr>
                              <th
                                style={
                                  thStyle
                                }
                              >
                                Type
                              </th>

                              <th
                                style={
                                  thStyle
                                }
                              >
                                Description
                              </th>

                              <th
                                style={
                                  thStyle
                                }
                              >
                                Qty
                              </th>

                              <th
                                style={
                                  thStyle
                                }
                              >
                                Unit Price
                              </th>

                              <th
                                style={
                                  thStyle
                                }
                              >
                                Total
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {invoice.items.map(
                              (
                                item,
                                index
                              ) => (
                                <tr
                                  key={
                                    index
                                  }
                                >
                                  <td
                                    style={
                                      tdStyle
                                    }
                                  >
                                    {item.type ||
                                      "—"}
                                  </td>

                                  <td
                                    style={
                                      tdStyle
                                    }
                                  >
                                    {item.description ||
                                      "—"}
                                  </td>

                                  <td
                                    style={
                                      tdStyle
                                    }
                                  >
                                    {item.quantity ||
                                      1}
                                  </td>

                                  <td
                                    style={
                                      tdStyle
                                    }
                                  >
                                    {formatMoney(
                                      item.unitPrice
                                    )}
                                  </td>

                                  <td
                                    style={
                                      tdStyle
                                    }
                                  >
                                    {formatMoney(
                                      Number(
                                        item.quantity ||
                                          1
                                      ) *
                                        Number(
                                          item.unitPrice ||
                                            0
                                        )
                                    )}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* TOTALS */}

                    <div
                      style={{
                        padding:
                          "16px",
                        display: "flex",
                        justifyContent:
                          "flex-end",
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          maxWidth:
                            "330px",
                        }}
                      >
                        <div
                          style={{
                            ...infoRowStyle,
                            minHeight:
                              "42px",
                            padding:
                              "7px 0",
                          }}
                        >
                          <span
                            style={
                              labelStyle
                            }
                          >
                            Total
                          </span>

                          <strong>
                            {formatMoney(
                              invoice.total
                            )}
                          </strong>
                        </div>

                        <div
                          style={{
                            ...infoRowStyle,
                            minHeight:
                              "42px",
                            padding:
                              "7px 0",
                          }}
                        >
                          <span
                            style={
                              labelStyle
                            }
                          >
                            Paid
                          </span>

                          <strong
                            style={{
                              color:
                                "#27845f",
                            }}
                          >
                            {formatMoney(
                              invoice.paid
                            )}
                          </strong>
                        </div>

                        <div
                          style={{
                            ...infoRowStyle,
                            minHeight:
                              "42px",
                            padding:
                              "7px 0",
                            borderBottom:
                              "none",
                          }}
                        >
                          <span
                            style={
                              labelStyle
                            }
                          >
                            Balance
                          </span>

                          <strong
                            style={{
                              color:
                                Number(
                                  invoice.balance ||
                                    0
                                ) > 0
                                  ? "#b47a18"
                                  : "#27845f",
                            }}
                          >
                            {formatMoney(
                              invoice.balance
                            )}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div style={emptyStyle}>
              No invoices available for{" "}
              {pet.name}.
            </div>
          )}
        </div>

        {/* =====================================================
            NOTES
        ===================================================== */}

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <FaStickyNote
              style={{
                color: "#319c97",
              }}
            />

            Notes
          </h2>

          <div
            style={{
              background: "#f7fbfa",
              border: "1px solid #e1eceb",
              borderRadius: "8px",
              padding: "15px",
              color: "#52605f",
              lineHeight: "1.6",
              minHeight: "55px",
            }}
          >
            {pet.notes ||
              "No notes added for this pet."}
          </div>
        </div>

        {/* =====================================================
            COMPLETE TIMELINE
        ===================================================== */}

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <FaCalendarCheck
              style={{
                color: "#319c97",
              }}
            />

            Complete Pet Timeline
          </h2>

          <p
            style={{
              margin: "-10px 0 22px",
              color: "#718181",
              fontSize: "14px",
            }}
          >
            Appointments, medical records,
            vaccinations, medications,
            prescriptions, reminders and
            billing.
          </p>

          {timeline.length > 0 ? (
            <div
              style={{
                position: "relative",
                paddingLeft: "18px",
              }}
            >
              {timeline.map(
                (item, index) => (
                  <div
                    key={`${item.timelineType}-${item.id}-${index}`}
                    style={{
                      display: "flex",
                      gap: "16px",
                      position:
                        "relative",
                      paddingBottom:
                        index ===
                        timeline.length -
                          1
                          ? "0"
                          : "22px",
                    }}
                  >
                    {/* LINE */}

                    {index !==
                      timeline.length -
                        1 && (
                      <div
                        style={{
                          position:
                            "absolute",
                          left: "19px",
                          top: "38px",
                          bottom: "0",
                          width: "2px",
                          background:
                            "#d9e9e7",
                        }}
                      />
                    )}

                    {/* ICON */}

                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        minWidth:
                          "40px",
                        borderRadius:
                          "50%",
                        background:
                          "#e1f5f3",
                        color:
                          "#319c97",
                        display: "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        zIndex: 1,
                        fontSize:
                          "15px",
                      }}
                    >
                      {getTimelineIcon(
                        item.timelineType
                      )}
                    </div>

                    {/* CONTENT */}

                    <div
                      style={{
                        flex: 1,
                        background:
                          "#f9fcfc",
                        border:
                          "1px solid #e1eceb",
                        borderRadius:
                          "9px",
                        padding:
                          "14px 16px",
                      }}
                    >
                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          alignItems:
                            "flex-start",
                          gap: "15px",
                          flexWrap:
                            "wrap",
                          marginBottom:
                            "5px",
                        }}
                      >
                        <div>
                          <span
                            style={{
                              display:
                                "inline-block",
                              fontSize:
                                "11px",
                              fontWeight:
                                "700",
                              color:
                                "#319c97",
                              background:
                                "#e1f5f3",
                              borderRadius:
                                "15px",
                              padding:
                                "4px 9px",
                              marginBottom:
                                "7px",
                            }}
                          >
                            {getTimelineLabel(
                              item.timelineType
                            )}
                          </span>

                          <h3
                            style={{
                              margin: 0,
                              color:
                                "#333333",
                              fontSize:
                                "15px",
                            }}
                          >
                            {item.timelineTitle ||
                              "Activity"}
                          </h3>
                        </div>

                        <span
                          style={{
                            color:
                              "#718181",
                            fontSize:
                              "13px",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {formatDate(
                            item.timelineDate
                          )}
                        </span>
                      </div>

                      <p
                        style={{
                          margin:
                            "6px 0 0",
                          color:
                            "#52605f",
                          fontSize:
                            "14px",
                          lineHeight:
                            "1.5",
                        }}
                      >
                        {getTimelineDescription(
                          item
                        )}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div style={emptyStyle}>
              No timeline activity
              available for this pet.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default PetProfile;