
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
          <h1>Owner Not Found</h1>
          <p>The requested owner could not be found.</p>

          <button
            type="button"
            onClick={() => navigate("/owners")}
            style={{
              padding: "10px 18px",
              width: "auto",
              cursor: "pointer",
            }}
          >
            <FaArrowLeft /> Back to Owners
          </button>
        </main>
      </div>
    );
  }

  const pets = owner.pets || [];
  const history = owner.history || [];

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #d5e5e3",
    borderRadius: "10px",
    padding: "18px 20px",
    boxSizing: "border-box",
    minWidth: 0,
  };

  const titleStyle = {
    margin: "0 0 16px",
    fontSize: "18px",
    fontWeight: 600,
    color: "#333333",
    display: "flex",
    alignItems: "center",
    gap: "9px",
  };

  const infoRowStyle = {
    display: "grid",
    gridTemplateColumns: "minmax(125px, 42%) minmax(0, 1fr)",
    alignItems: "center",
    columnGap: "12px",
    padding: "9px 0",
    minHeight: "40px",
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
    fontWeight: 600,
    textAlign: "left",
    overflowWrap: "anywhere",
    fontSize: "14px",
  };

  const emptyStyle = {
    padding: "18px",
    textAlign: "center",
    background: "#f7fbfa",
    borderRadius: "8px",
    color: "#718181",
    fontSize: "14px",
  };

  const ownerFullName =
    `${owner.firstName || ""} ${owner.lastName || ""}`.trim();

  const isActive =
    String(owner.status || "").toLowerCase() === "active";

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main owner-profile-main">
        <style>{`
          .owner-profile-main {
            flex: 1 1 0 !important;
            min-width: 0 !important;
            width: auto !important;
            max-width: none !important;
            box-sizing: border-box !important;
          }

          .owner-profile-main .owner-profile-top-row {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            gap: 20px !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 0 24px !important;
            padding: 0 !important;
            flex-wrap: wrap !important;
            box-sizing: border-box !important;
          }

          .owner-profile-main .owner-profile-back-btn {
            margin-left: auto !important;
            margin-right: 0 !important;
            position: static !important;
            transform: none !important;
            flex-shrink: 0 !important;
          }

          /* TWO CARDS SIDE BY SIDE */
          .owner-profile-main .owner-profile-two-columns {
            display: grid !important;
            grid-template-columns:
              minmax(0, 1fr) minmax(0, 1fr) !important;
            align-items: stretch !important;
            gap: 16px !important;
            width: 100% !important;
            margin-bottom: 14px !important;
          }

          .owner-profile-main .owner-profile-info-card,
          .owner-profile-main .owner-profile-pets-card {
            min-width: 0 !important;
            width: 100% !important;
            margin: 0 !important;
          }

          .owner-profile-main .owner-profile-pets-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: auto;
          }

          .owner-profile-main .owner-profile-pets-table th {
            text-align: left;
            padding: 11px 10px;
            background: #f3f9f8;
            color: #52605f;
            border-bottom: 1px solid #dcebea;
            font-size: 13px;
            white-space: nowrap;
          }

          .owner-profile-main .owner-profile-pets-table td {
            padding: 12px 10px;
            border-bottom: 1px solid #edf3f2;
            color: #455757;
            font-size: 13px;
          }

          .owner-profile-main .owner-profile-pets-table
          tbody tr:last-child td {
            border-bottom: none;
          }

          @media (max-width: 1050px) {
            .owner-profile-main .owner-profile-two-columns {
              grid-template-columns: minmax(0, 1fr) !important;
            }
          }

          @media (max-width: 600px) {
            .owner-profile-main .owner-profile-top-row {
              align-items: flex-start !important;
            }

            .owner-profile-main .owner-profile-info-card,
            .owner-profile-main .owner-profile-pets-card {
              padding: 16px !important;
            }
          }
        `}</style>

        {/* PAGE HEADER */}

        <div className="owner-profile-top-row">
          <div>
            <h1>{ownerFullName}</h1>
            <p>Owner Profile</p>
          </div>

          <button
            type="button"
            className="owner-profile-back-btn"
            onClick={() => navigate("/owners")}
            style={{
              width: "auto",
              minWidth: "160px",
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
            }}
          >
            <FaArrowLeft />
            Back to Owners
          </button>
        </div>

        {/* FIRST ROW: OWNER INFORMATION + PETS */}

        <div className="owner-profile-two-columns">

          {/* LEFT CARD: OWNER INFORMATION */}

          <div
            className="owner-profile-info-card"
            style={cardStyle}
          >
            <h2 style={titleStyle}>Owner Information</h2>

            <div style={infoRowStyle}>
              <span style={labelStyle}>Name</span>
              <span style={valueStyle}>{ownerFullName}</span>
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
              <span style={labelStyle}>Status</span>

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifySelf: "start",
                  gap: "7px",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: 600,
                  background: isActive
                    ? "#e1f5f3"
                    : "#f2f2f2",
                  color: isActive
                    ? "#319c97"
                    : "#7d8887",
                }}
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: isActive
                      ? "#319c97"
                      : "#7d8887",
                  }}
                />

                {isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          {/* RIGHT CARD: PETS */}

          <div
            className="owner-profile-pets-card"
            style={cardStyle}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
                flexWrap: "wrap",
              }}
            >
              <h2
                style={{
                  ...titleStyle,
                  marginBottom: 0,
                }}
              >
                <FaPaw style={{ color: "#319c97" }} />
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
                  height: "36px",
                  padding: "0 14px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#55b7b3",
                  color: "#ffffff",
                  cursor: "pointer",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                + Add Pet
              </button>
            </div>

            {pets.length > 0 ? (
              <div
                style={{
                  width: "100%",
                  overflowX: "auto",
                }}
              >
                <table className="owner-profile-pets-table">
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
              <div style={emptyStyle}>
                No pets linked to this owner.
              </div>
            )}
          </div>
        </div>

        {/* PART 2 CONTINUES DIRECTLY BELOW */}

        {/* NOTES - FULL WIDTH */}

        <div
          style={{
            ...cardStyle,
            marginBottom: "14px",
          }}
        >
          <h2 style={titleStyle}>
            <FaStickyNote style={{ color: "#319c97" }} />
            Notes
          </h2>

          <div
            style={{
              background: "#f7fbfa",
              border: "1px solid #e1eceb",
              borderRadius: "8px",
              padding: "11px 14px",
              color: "#52605f",
              lineHeight: 1.5,
              minHeight: "42px",
              boxSizing: "border-box",
            }}
          >
            {owner.notes || "No notes added for this owner."}
          </div>
        </div>

        {/* RECENT HISTORY - FULL WIDTH */}

        <div style={cardStyle}>
          <h2 style={titleStyle}>
            <FaHistory style={{ color: "#319c97" }} />
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
                    padding: "10px 0",
                    borderBottom:
                      index === history.length - 1
                        ? "none"
                        : "1px solid #e4eeee",
                  }}
                >
                  <div
                    style={{
                      color: "#333333",
                      fontWeight: 500,
                      fontSize: "14px",
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
            <div style={emptyStyle}>
              No history available for this owner.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default OwnerProfile;
