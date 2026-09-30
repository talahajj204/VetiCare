import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";

import {
  FaCloudUploadAlt,
  FaTrash,
  FaPlus,
  FaCheckCircle,
  FaCog,
  FaTimes,
} from "react-icons/fa";

function Settings() {
  const fileInputRef = useRef(null);

  // =========================================
  // CLINIC INFORMATION
  // =========================================

  const [clinicName, setClinicName] = useState("Vet Clinic");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [openingTime, setOpeningTime] = useState("");
  const [closingTime, setClosingTime] = useState("");

  // =========================================
  // LOGO
  // =========================================

  const [logo, setLogo] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // =========================================
  // STATUS OPTIONS
  // =========================================

  const [statuses, setStatuses] = useState([
    "Active",
    "Inactive",
    "Pending",
    "Completed",
    "Cancelled",
  ]);

  const [newStatus, setNewStatus] = useState("");

  const [showStatusModal, setShowStatusModal] =
    useState(false);

  // =========================================
  // SAVED MESSAGE
  // =========================================

  const [saved, setSaved] = useState(false);

  // =========================================
  // LOAD SETTINGS
  // =========================================

  useEffect(() => {
    const savedSettings =
      localStorage.getItem("clinicSettings");

    if (!savedSettings) return;

    try {
      const settings = JSON.parse(savedSettings);

      setClinicName(
        settings.clinicName || "Vet Clinic"
      );

      setEmail(settings.email || "");
      setPhone(settings.phone || "");
      setAddress(settings.address || "");

      setOpeningTime(
        settings.openingTime || ""
      );

      setClosingTime(
        settings.closingTime || ""
      );

      setLogo(settings.logo || null);

      if (
        Array.isArray(settings.statuses) &&
        settings.statuses.length > 0
      ) {
        setStatuses(settings.statuses);
      }
    } catch (error) {
      console.error(
        "Could not load settings:",
        error
      );
    }
  }, []);

  // =========================================
  // LOGO
  // =========================================

  const handleLogoFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setLogo(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];

    handleLogoFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();

    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();

    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();

    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];

    handleLogoFile(file);
  };

  const handleRemoveLogo = (e) => {
    e.stopPropagation();

    setLogo(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // =========================================
  // ADD STATUS
  // =========================================

  const handleAddStatus = () => {
    const status = newStatus.trim();

    if (!status) return;

    const exists = statuses.some(
      (item) =>
        item.toLowerCase() ===
        status.toLowerCase()
    );

    if (exists) {
      alert("This status already exists.");
      return;
    }

    setStatuses((previousStatuses) => [
      ...previousStatuses,
      status,
    ]);

    setNewStatus("");
  };

  // =========================================
  // ENTER TO ADD STATUS
  // =========================================

  const handleStatusKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      handleAddStatus();
    }
  };

  // =========================================
  // DELETE STATUS
  // =========================================

  const handleDeleteStatus = (
    statusToDelete
  ) => {
    setStatuses((previousStatuses) =>
      previousStatuses.filter(
        (status) =>
          status !== statusToDelete
      )
    );
  };

  // =========================================
  // CLOSE STATUS MODAL
  // =========================================

  const handleCloseStatusModal = () => {
    setShowStatusModal(false);
    setNewStatus("");
  };

  // =========================================
  // SAVE SETTINGS
  // =========================================

  const handleSubmit = (e) => {
    e.preventDefault();

    const settings = {
      clinicName,
      email,
      phone,
      address,
      openingTime,
      closingTime,
      logo,
      statuses,
    };

    localStorage.setItem(
      "clinicSettings",
      JSON.stringify(settings)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);

    // Backend later
    console.log(
      "Settings saved:",
      settings
    );
  };

  return (
    <div className="dashboard-layout">

      <Sidebar />

      <main className="dashboard-main">

        {/* =====================================
            HEADER
        ===================================== */}

        <div className="page-header">

          <div>
            <h1>Settings</h1>

            <p>
              Manage clinic information and settings
            </p>
          </div>

        </div>

        {/* =====================================
            SETTINGS
        ===================================== */}

        <form
          className="settings-form"
          onSubmit={handleSubmit}
        >

          {/* =================================
              CLINIC LOGO
          ================================= */}

          <div className="settings-card">

            <div className="settings-card-header">
              <h2>Clinic Logo</h2>

              <p>
                Upload the logo that will represent
                your clinic
              </p>
            </div>

            <div
              className={`logo-upload-box ${
                isDragging ? "dragging" : ""
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() =>
                fileInputRef.current?.click()
              }
            >

              {logo ? (

                <div className="logo-preview">

                  <img
                    src={logo}
                    alt="Clinic Logo"
                  />

                  <p>
                    Click or drag a new logo
                    to replace it
                  </p>

                </div>

              ) : (

                <div className="logo-upload-content">

                  <FaCloudUploadAlt />

                  <h3>
                    Upload Clinic Logo
                  </h3>

                  <p>
                    Drag & drop your logo here
                  </p>

                  <span>
                    or click to browse
                  </span>

                </div>

              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                hidden
              />

            </div>

            {logo && (

              <button
                type="button"
                className="remove-logo-button"
                onClick={handleRemoveLogo}
              >
                <FaTrash />

                Remove Logo
              </button>

            )}

          </div>

          {/* =================================
              CLINIC INFORMATION
          ================================= */}

          <div className="settings-card">

            <div className="settings-card-header">

              <h2>Clinic Information</h2>

              <p>
                Update the main information
                for your clinic
              </p>

            </div>

            {/* CLINIC NAME */}

            <div className="form-field">

              <label>
                Clinic Name
              </label>

              <input
                type="text"
                placeholder="Enter clinic name"
                value={clinicName}
                onChange={(e) =>
                  setClinicName(
                    e.target.value
                  )
                }
              />

            </div>

            {/* EMAIL + PHONE */}

            <div className="form-row">

              <div className="form-field">

                <label>Email</label>

                <input
                  type="email"
                  placeholder="Enter clinic email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                />

              </div>

              <div className="form-field">

                <label>
                  Phone Number
                </label>

                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) =>
                    setPhone(
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

            {/* ADDRESS */}

            <div className="form-field">

              <label>Address</label>

              <input
                type="text"
                placeholder="Enter clinic address"
                value={address}
                onChange={(e) =>
                  setAddress(
                    e.target.value
                  )
                }
              />

            </div>

            {/* OPENING + CLOSING */}

            <div className="form-row">

              <div className="form-field">

                <label>
                  Opening Time
                </label>

                <input
                  type="time"
                  value={openingTime}
                  onChange={(e) =>
                    setOpeningTime(
                      e.target.value
                    )
                  }
                />

              </div>

              <div className="form-field">

                <label>
                  Closing Time
                </label>

                <input
                  type="time"
                  value={closingTime}
                  onChange={(e) =>
                    setClosingTime(
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

          </div>

          {/* =================================
              SYSTEM OPTIONS
          ================================= */}

          <div className="settings-card">

            <div className="settings-card-header">

              <h2>System Options</h2>

              <p>
                Customize options available
                throughout the system
              </p>

            </div>

            {/* STATUS BUTTON */}

            <button
              type="button"
              className="settings-option-button"
              onClick={() =>
                setShowStatusModal(true)
              }
            >

              <div className="settings-option-left">

                <div className="settings-option-icon">
                  <FaCog />
                </div>

                <div>
                  <strong>
                    Status Options
                  </strong>

                  <span>
                    Manage available statuses
                  </span>
                </div>

              </div>

              <div className="settings-option-count">
                {statuses.length}
              </div>

            </button>

          </div>

          {/* =================================
              SAVE
          ================================= */}

          <div className="settings-save-section">

            {saved && (

              <div className="settings-saved-message">

                <FaCheckCircle />

                Settings saved successfully

              </div>

            )}

            <button
              type="submit"
              className="save-button"
            >
              Save Settings
            </button>

          </div>

        </form>

      </main>

      {/* =====================================
          STATUS OPTIONS MODAL
      ===================================== */}

      {showStatusModal && (

        <div
          className="modal-overlay"
          onMouseDown={
            handleCloseStatusModal
          }
        >

          <div
            className="modal-container status-modal"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="modal-header">

              <div>
                <h2>
                  Status Options
                </h2>

                <p>
                  Add or remove statuses
                  available in the system
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={
                  handleCloseStatusModal
                }
              >
                <FaTimes />
              </button>

            </div>

            {/* ADD STATUS */}

            <div className="status-add-row">

              <input
                type="text"
                placeholder="Example: In Progress"
                value={newStatus}
                onChange={(e) =>
                  setNewStatus(
                    e.target.value
                  )
                }
                onKeyDown={
                  handleStatusKeyDown
                }
              />

              <button
                type="button"
                className="add-status-button"
                onClick={
                  handleAddStatus
                }
              >
                <FaPlus />

                Add Status
              </button>

            </div>

            {/* STATUS LIST */}

            <div className="status-options-list">

              {statuses.length > 0 ? (

                statuses.map(
                  (status) => (

                    <div
                      className="status-option-item"
                      key={status}
                    >

                      <div className="status-option-name">

                        <span className="status-dot" />

                        <span>
                          {status}
                        </span>

                      </div>

                      <button
                        type="button"
                        className="status-delete-button"
                        onClick={() =>
                          handleDeleteStatus(
                            status
                          )
                        }
                        title="Delete status"
                      >
                        <FaTrash />
                      </button>

                    </div>

                  )
                )

              ) : (

                <div className="no-status-options">
                  No status options added yet.
                </div>

              )}

            </div>

            {/* MODAL FOOTER */}

            <div className="status-modal-footer">

              <button
                type="button"
                className="save-button"
                onClick={
                  handleCloseStatusModal
                }
              >
                Done
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Settings;