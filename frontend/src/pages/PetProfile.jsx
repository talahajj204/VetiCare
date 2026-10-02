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
} from "react-icons/fa";

import Sidebar from "../components/Sidebar";

function PetProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { petId } = useParams();

  const passedPet = location.state?.pet;

  // Demo/fallback pet data.
  // This keeps the page working even after a browser refresh.
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

      timeline: [
        {
          id: 1,
          type: "visit",
          title: "Veterinary Visit",
          description: "Skin allergy examination",
          date: "25/09/2026",
        },
        {
          id: 2,
          type: "medication",
          title: "Medication",
          description: "Allergy medication prescribed",
          date: "25/09/2026",
        },
        {
          id: 3,
          type: "vaccination",
          title: "Vaccination",
          description: "Rabies vaccination administered",
          date: "15/08/2026",
        },
        {
          id: 4,
          type: "prescription",
          title: "Prescription",
          description: "Prescription issued after examination",
          date: "25/09/2026",
        },
        {
          id: 5,
          type: "reminder",
          title: "Reminder",
          description: "Next vaccination due",
          date: "15/08/2027",
        },
      ],
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

      timeline: [
        {
          id: 1,
          type: "visit",
          title: "Veterinary Visit",
          description: "Routine checkup",
          date: "20/09/2026",
        },
        {
          id: 2,
          type: "reminder",
          title: "Reminder",
          description: "Routine follow-up",
          date: "20/03/2027",
        },
      ],
    },
  };

  const fallbackPet = fallbackPets[petId];

  /*
    Merge the table pet with the profile fallback.
    This means the name/owner/species/breed/age passed from Pets.jsx
    stay current, while profile-only fields still have demo values.
  */
  const pet = passedPet
    ? {
        ...(fallbackPet || {}),
        ...passedPet,
        timeline:
          passedPet.timeline ||
          fallbackPet?.timeline ||
          [],
      }
    : fallbackPet;

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

  const timeline = pet.timeline || [];

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
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
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

  const getTimelineIcon = (type) => {
    if (type === "visit") {
      return <FaStethoscope />;
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

    return <FaCalendarCheck />;
  };

  const getTimelineLabel = (type) => {
    if (type === "visit") return "Visit";
    if (type === "vaccination") return "Vaccination";
    if (type === "medication") return "Medication";
    if (type === "prescription") return "Prescription";
    if (type === "reminder") return "Reminder";

    return "Activity";
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main pets-page">
        {/* HEADER */}

        <div
          className="page-header pets-page-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div className="pets-title-area">
            <h1>{pet.name}</h1>
            <p>Pet Profile</p>
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

        {/* PROFILE CARD */}

        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "22px",
              paddingBottom: "22px",
              marginBottom: "5px",
              borderBottom: "1px solid #e4eeee",
              flexWrap: "wrap",
            }}
          >
            {/* PROFILE PHOTO */}

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

            <div style={{ flex: 1 }}>
              <h2
                style={{
                  margin: "0 0 6px",
                  fontSize: "24px",
                  color: "#333333",
                }}
              >
                {pet.name}
              </h2>

              <p
                style={{
                  margin: "0 0 10px",
                  color: "#718181",
                }}
              >
                {pet.species} • {pet.breed}
              </p>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "6px 11px",
                  borderRadius: "20px",
                  background: "#e1f5f3",
                  color: "#319c97",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                <FaUser />
                Owner: {pet.owner}
              </div>
            </div>
          </div>

          {/* BASIC INFORMATION */}

          <h2
            style={{
              ...sectionTitleStyle,
              marginTop: "22px",
            }}
          >
            <FaPaw style={{ color: "#319c97" }} />
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
                {pet.dateOfBirth || "—"}
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

        {/* MEDICAL INFORMATION */}

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <FaNotesMedical style={{ color: "#319c97" }} />
            Medical Information
          </h2>

          <div
            style={{
              marginBottom: "16px",
            }}
          >
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
                border: "1px solid #e1eceb",
                borderRadius: "8px",
                padding: "14px",
                color: "#52605f",
              }}
            >
              {pet.allergies || "No known allergies."}
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
                border: "1px solid #e1eceb",
                borderRadius: "8px",
                padding: "14px",
                color: "#52605f",
              }}
            >
              {pet.chronicConditions ||
                "No chronic conditions recorded."}
            </div>
          </div>
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
              lineHeight: "1.6",
              minHeight: "55px",
            }}
          >
            {pet.notes || "No notes added for this pet."}
          </div>
        </div>

        {/* ONE COMPLETE TIMELINE */}

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <FaCalendarCheck style={{ color: "#319c97" }} />
            Pet Timeline
          </h2>

          <p
            style={{
              margin: "-10px 0 22px",
              color: "#718181",
              fontSize: "14px",
            }}
          >
            Visits, vaccinations, medications, prescriptions and reminders
          </p>

          {timeline.length > 0 ? (
            <div
              style={{
                position: "relative",
                paddingLeft: "18px",
              }}
            >
              {timeline.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    gap: "16px",
                    position: "relative",
                    paddingBottom:
                      index === timeline.length - 1
                        ? "0"
                        : "22px",
                  }}
                >
                  {/* TIMELINE LINE */}

                  {index !== timeline.length - 1 && (
                    <div
                      style={{
                        position: "absolute",
                        left: "19px",
                        top: "38px",
                        bottom: "0",
                        width: "2px",
                        background: "#d9e9e7",
                      }}
                    />
                  )}

                  {/* ICON */}

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
                    {getTimelineIcon(item.type)}
                  </div>

                  {/* CONTENT */}

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
                            fontWeight: "700",
                            color: "#319c97",
                            background: "#e1f5f3",
                            borderRadius: "15px",
                            padding: "4px 9px",
                            marginBottom: "7px",
                          }}
                        >
                          {getTimelineLabel(item.type)}
                        </span>

                        <h3
                          style={{
                            margin: 0,
                            color: "#333333",
                            fontSize: "15px",
                          }}
                        >
                          {item.title}
                        </h3>
                      </div>

                      <span
                        style={{
                          color: "#718181",
                          fontSize: "13px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.date}
                      </span>
                    </div>

                    <p
                      style={{
                        margin: "6px 0 0",
                        color: "#52605f",
                        fontSize: "14px",
                        lineHeight: "1.5",
                      }}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: "30px",
                textAlign: "center",
                background: "#f7fbfa",
                borderRadius: "8px",
                color: "#718181",
              }}
            >
              No timeline activity available for this pet.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default PetProfile;