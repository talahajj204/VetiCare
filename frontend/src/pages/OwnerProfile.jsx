import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaPaw,
  FaHistory,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaExclamationCircle,
  FaStickyNote,
} from "react-icons/fa";

import Sidebar from "../components/Sidebar";

function OwnerProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { ownerId } = useParams();

  const passedOwner = location.state?.owner;

  /*
    Fallback data so refreshing /owners/1
    still displays the demo owner.
  */

  const fallbackOwners = {
    1: {
      id: 1,
      firstName: "Tala",
      lastName: "El Hajj",
      email: "talaelhajj4@gmail.com",
      phone: "03 123 456",
      address: "Beirut",
      emergencyContact: "70 111 222",
      notes: "Prefers morning appointments.",
      status: "active",

      pets: [
        {
          id: 1,
          name: "Bella",
          species: "Dog",
          breed: "Golden Retriever",
          age: "4 years",
        },
      ],

      history: [
        {
          id: 1,
          date: "25/09/2026",
          description: "Bella - Medical record added",
        },
        {
          id: 2,
          date: "20/09/2026",
          description: "Bella - Routine appointment",
        },
      ],
    },

    2: {
      id: 2,
      firstName: "Fatima",
      lastName: "Abbas",
      email: "fatima@gmail.com",
      phone: "70 456 789",
      address: "Dahye",
      emergencyContact: "71 222 333",
      notes: "",
      status: "active",

      pets: [
        {
          id: 2,
          name: "Luna",
          species: "Cat",
          breed: "Persian",
          age: "3 years",
        },
      ],

      history: [
        {
          id: 1,
          date: "20/09/2026",
          description: "Luna - Routine checkup",
        },
      ],
    },

    3: {
      id: 3,
      firstName: "Karen",
      lastName: "N",
      email: "karen@email.com",
      phone: "71 555 222",
      address: "Tripoli",
      emergencyContact: "03 444 555",
      notes: "",
      status: "inactive",
      pets: [],
      history: [],
    },
  };

  const owner = passedOwner || fallbackOwners[ownerId];

  if (!owner) {
    return (
      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-main">
          <div className="page-header">
            <div>
              <h1>Owner Not Found</h1>
              <p>The requested owner could not be found.</p>
            </div>
          </div>

          <button
            type="button"
            className="save-button"
            onClick={() => navigate("/owners")}
            style={{
              width: "auto",
              padding: "10px 18px",
            }}
          >
            <FaArrowLeft />
            <span style={{ marginLeft: "7px" }}>
              Back to Owners
            </span>
          </button>
        </main>
      </div>
    );
  }

  const pets = owner.pets || [];
  const history = owner.history || [];

  const cardStyle = {
    background: "#fff",
    border: "1px solid #d5e5e3",
    borderRadius: "10px",
    padding: "22px",
    marginBottom: "20px",
  };

  const titleStyle = {
    margin: 0,
    marginBottom: "18px",
    fontSize: "18px",
    color: "#333",
    display: "flex",
    alignItems: "center",
    gap: "9px",
  };

  const infoRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    padding: "13px 0",
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
    color: "#333",
    fontWeight: "600",
    textAlign: "right",
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        {/* HEADER */}

        <div
          className="page-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div>
            <h1>
              {owner.firstName} {owner.lastName}
            </h1>

            <p>Owner Profile</p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/owners")}
            style={{
              width: "auto",
              height: "44px",
              padding: "0 16px",
              border: "1px solid #55b7b3",
              borderRadius: "8px",
              background: "#fff",
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
            Back to Owners
          </button>
        </div>

        {/* OWNER INFORMATION */}

        <div style={cardStyle}>
          <h2 style={titleStyle}>
            Owner Information
          </h2>

          <div style={infoRowStyle}>
            <span style={labelStyle}>
              Name
            </span>

            <span style={valueStyle}>
              {owner.firstName} {owner.lastName}
            </span>
          </div>

          <div style={infoRowStyle}>
            <span style={labelStyle}>
              <FaEnvelope />
              Email
            </span>

            <span style={valueStyle}>
              {owner.email || "—"}
            </span>
          </div>

          <div style={infoRowStyle}>
            <span style={labelStyle}>
              <FaPhone />
              Phone
            </span>

            <span style={valueStyle}>
              {owner.phone || "—"}
            </span>
          </div>

          <div style={infoRowStyle}>
            <span style={labelStyle}>
              <FaMapMarkerAlt />
              Address
            </span>

            <span style={valueStyle}>
              {owner.address || "—"}
            </span>
          </div>

          <div style={infoRowStyle}>
            <span style={labelStyle}>
              <FaExclamationCircle />
              Emergency Contact
            </span>

            <span style={valueStyle}>
              {owner.emergencyContact || "—"}
            </span>
          </div>

          <div
            style={{
              ...infoRowStyle,
              borderBottom: "none",
            }}
          >
            <span style={labelStyle}>
              Status
            </span>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: "600",

                background:
                  owner.status === "active"
                    ? "#e1f5f3"
                    : "#f2f2f2",

                color:
                  owner.status === "active"
                    ? "#319c97"
                    : "#7d8887",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background:
                    owner.status === "active"
                      ? "#319c97"
                      : "#7d8887",
                }}
              />

              {owner.status === "active"
                ? "Active"
                : "Inactive"}
            </span>
          </div>
        </div>

        {/* NOTES */}

        <div style={cardStyle}>
          <h2 style={titleStyle}>
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
              minHeight: "50px",
            }}
          >
            {owner.notes || "No notes added for this owner."}
          </div>
        </div>

        {/* OWNER PETS */}

        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "18px",
            }}
          >
            <h2
              style={{
                ...titleStyle,
                marginBottom: 0,
              }}
            >
              <FaPaw
                style={{
                  color: "#319c97",
                }}
              />
              Pets
            </h2>

            <button
              type="button"
              onClick={() =>
                navigate("/pets", {
                  state: {
                    openAddPet: true,
                    ownerId: owner.id,
                    owner,
                  },
                })
              }
              style={{
                width: "auto",
                height: "40px",
                padding: "0 15px",
                border: "none",
                borderRadius: "8px",
                background: "#55b7b3",
                color: "#fff",
                cursor: "pointer",
                fontWeight: "600",
                whiteSpace: "nowrap",
              }}
            >
              + Add Pet
            </button>
          </div>

          {pets.length > 0 ? (
            <div
              style={{
                overflowX: "auto",
              }}
            >
              <table
                className="owners-table"
                style={{
                  width: "100%",
                }}
              >
                <thead>
                  <tr>
                    <th>Pet Name</th>
                    <th>Species</th>
                    <th>Breed</th>
                    <th>Age</th>
                  </tr>
                </thead>

                <tbody>
                  {pets.map((pet) => (
                    <tr key={pet.id}>
                      <td>
                        <strong>{pet.name}</strong>
                      </td>

                      <td>{pet.species || "—"}</td>

                      <td>{pet.breed || "—"}</td>

                      <td>{pet.age || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div
              style={{
                padding: "25px",
                textAlign: "center",
                background: "#f7fbfa",
                borderRadius: "8px",
                color: "#718181",
              }}
            >
              No pets linked to this owner.
            </div>
          )}
        </div>

        {/* SHORT HISTORY */}

        <div style={cardStyle}>
          <h2 style={titleStyle}>
            <FaHistory
              style={{
                color: "#319c97",
              }}
            />
            Recent History
          </h2>

          {history.length > 0 ? (
            <div>
              {history.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "20px",
                    padding: "14px 0",

                    borderBottom:
                      index === history.length - 1
                        ? "none"
                        : "1px solid #e4eeee",
                  }}
                >
                  <div
                    style={{
                      color: "#333",
                      fontWeight: "500",
                    }}
                  >
                    {item.description}
                  </div>

                  <div
                    style={{
                      color: "#718181",
                      fontSize: "13px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.date}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: "25px",
                textAlign: "center",
                background: "#f7fbfa",
                borderRadius: "8px",
                color: "#718181",
              }}
            >
              No history available for this owner.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default OwnerProfile;