import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";

import {
  FaCloudUploadAlt,
  FaTrash,
  FaPlus,
  FaCheckCircle,
  FaCog,
  FaTimes,
  FaInstagram,
  FaWhatsapp,
  FaImage,
} from "react-icons/fa";

import { FaTiktok } from "react-icons/fa6";

function Settings() {
  // =====================================================
  // REFS
  // =====================================================

  const logoInputRef = useRef(null);
  const homeBannerInputRef = useRef(null);

  // =====================================================
  // STORE INFORMATION
  // =====================================================

  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");

  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");

  // =====================================================
  // STORE LOGO
  // storeBanner stays for Header + Footer compatibility
  // =====================================================

  const [storeBanner, setStoreBanner] = useState(null);
  const [isLogoDragging, setIsLogoDragging] = useState(false);

  // =====================================================
  // HOME BANNER
  // Everything is controlled from Settings.
  // NO predefined banner content.
  // =====================================================

  const [homeBanner, setHomeBanner] = useState(null);

  const [homeBannerTitle, setHomeBannerTitle] =
    useState("");

  const [
    homeBannerDescription,
    setHomeBannerDescription,
  ] = useState("");

  const [
    homeBannerButtonText,
    setHomeBannerButtonText,
  ] = useState("");

  const [
    isHomeBannerDragging,
    setIsHomeBannerDragging,
  ] = useState(false);

  // =====================================================
  // STATUS OPTIONS
  // =====================================================

  const [statuses, setStatuses] = useState([
    "Active",
    "Inactive",
    "Pending",
    "Completed",
    "Cancelled",
  ]);

  const [newStatus, setNewStatus] = useState("");

  const [
    showStatusModal,
    setShowStatusModal,
  ] = useState(false);

  const [saved, setSaved] = useState(false);

  // =====================================================
  // LOAD SETTINGS
  // =====================================================

  useEffect(() => {
    try {
      const savedSettings =
        localStorage.getItem("storeSettings");

      if (!savedSettings) return;

      const settings = JSON.parse(savedSettings);

      setStoreName(settings.storeName || "");

      setStoreDescription(
        settings.storeDescription || ""
      );

      setEmail(settings.email || "");
      setPhone(settings.phone || "");
      setWhatsapp(settings.whatsapp || "");
      setAddress(settings.address || "");

      setInstagram(settings.instagram || "");
      setTiktok(settings.tiktok || "");

      // Store Logo
      setStoreBanner(
        settings.storeBanner || null
      );

      // Home Banner Image
      setHomeBanner(
        settings.homeBanner || null
      );

      // Home Banner Content
      // No fallback/default text.
      setHomeBannerTitle(
        settings.homeBannerTitle || ""
      );

      setHomeBannerDescription(
        settings.homeBannerDescription || ""
      );

      setHomeBannerButtonText(
        settings.homeBannerButtonText || ""
      );

      if (Array.isArray(settings.statuses)) {
        setStatuses(settings.statuses);
      }
    } catch (error) {
      console.error(
        "Could not load store settings:",
        error
      );
    }
  }, []);

  // =====================================================
  // SAVE ONE IMAGE WITHOUT DELETING OTHER SETTINGS
  // =====================================================

  const saveImageImmediately = (
    key,
    imageData
  ) => {
    try {
      let currentSettings = {};

      const existing =
        localStorage.getItem("storeSettings");

      if (existing) {
        currentSettings = JSON.parse(existing);
      }

      const updatedSettings = {
        ...currentSettings,
        [key]: imageData,
      };

      localStorage.setItem(
        "storeSettings",
        JSON.stringify(updatedSettings)
      );

      window.dispatchEvent(
        new Event("storeSettingsUpdated")
      );
    } catch (error) {
      console.error(
        `Could not save ${key}:`,
        error
      );

      alert(
        "Could not save the image. Please try a smaller image."
      );
    }
  };

  // =====================================================
  // VALIDATE + READ IMAGE
  // =====================================================

  const readImageFile = (
    file,
    onSuccess
  ) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    // Images are temporarily stored as base64
    // inside localStorage.
    if (file.size > 2 * 1024 * 1024) {
      alert(
        "Please choose an image smaller than 2 MB."
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageData = reader.result;

      if (
        !imageData ||
        typeof imageData !== "string"
      ) {
        alert("Could not read the image.");
        return;
      }

      onSuccess(imageData);
    };

    reader.onerror = () => {
      console.error(
        "FileReader could not read image."
      );

      alert(
        "Could not read the selected image."
      );
    };

    reader.readAsDataURL(file);
  };

  // =====================================================
  // STORE LOGO
  // =====================================================

  const handleLogoFile = (file) => {
    readImageFile(file, (imageData) => {
      setStoreBanner(imageData);

      saveImageImmediately(
        "storeBanner",
        imageData
      );
    });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      handleLogoFile(file);
    }
  };

  const handleLogoDragOver = (e) => {
    e.preventDefault();
    setIsLogoDragging(true);
  };

  const handleLogoDragLeave = (e) => {
    e.preventDefault();
    setIsLogoDragging(false);
  };

  const handleLogoDrop = (e) => {
    e.preventDefault();

    setIsLogoDragging(false);

    const file =
      e.dataTransfer.files?.[0];

    if (file) {
      handleLogoFile(file);
    }
  };

  const handleRemoveLogo = (e) => {
    e.stopPropagation();

    setStoreBanner(null);

    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }

    saveImageImmediately(
      "storeBanner",
      null
    );
  };

  // =====================================================
  // HOME BANNER IMAGE
  // Completely separate from Store Logo
  // =====================================================

  const handleHomeBannerFile = (file) => {
    readImageFile(file, (imageData) => {
      setHomeBanner(imageData);

      saveImageImmediately(
        "homeBanner",
        imageData
      );
    });
  };

  const handleHomeBannerChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      handleHomeBannerFile(file);
    }
  };

  const handleHomeBannerDragOver = (e) => {
    e.preventDefault();
    setIsHomeBannerDragging(true);
  };

  const handleHomeBannerDragLeave = (e) => {
    e.preventDefault();
    setIsHomeBannerDragging(false);
  };

  const handleHomeBannerDrop = (e) => {
    e.preventDefault();

    setIsHomeBannerDragging(false);

    const file =
      e.dataTransfer.files?.[0];

    if (file) {
      handleHomeBannerFile(file);
    }
  };

  const handleRemoveHomeBanner = (e) => {
    e.stopPropagation();

    setHomeBanner(null);

    if (homeBannerInputRef.current) {
      homeBannerInputRef.current.value = "";
    }

    saveImageImmediately(
      "homeBanner",
      null
    );
  };

  // =====================================================
  // STATUS OPTIONS
  // =====================================================

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

    setStatuses((current) => [
      ...current,
      status,
    ]);

    setNewStatus("");
  };

  const handleStatusKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddStatus();
    }
  };

  const handleDeleteStatus = (
    statusToDelete
  ) => {
    setStatuses((current) =>
      current.filter(
        (status) =>
          status !== statusToDelete
      )
    );
  };

  const handleCloseStatusModal = () => {
    setShowStatusModal(false);
    setNewStatus("");
  };

  // =====================================================
  // SAVE ALL SETTINGS
  // =====================================================

  const handleSubmit = (e) => {
    e.preventDefault();

    /*
      Keep both images separate:

      storeBanner = Header + Footer Logo
      homeBanner  = Ecommerce Home Banner
    */

    let savedLogo = storeBanner;
    let savedHomeBanner = homeBanner;

    try {
      const existing =
        localStorage.getItem("storeSettings");

      if (existing) {
        const oldSettings =
          JSON.parse(existing);

        if (oldSettings.storeBanner) {
          savedLogo =
            oldSettings.storeBanner;
        }

        if (oldSettings.homeBanner) {
          savedHomeBanner =
            oldSettings.homeBanner;
        }
      }
    } catch (error) {
      console.error(
        "Could not read current images:",
        error
      );
    }

    const settings = {
      storeName,
      storeDescription,

      email,
      phone,
      whatsapp,
      address,

      instagram,
      tiktok,

      // Header + Footer Logo
      storeBanner: savedLogo,

      // Ecommerce Home Banner
      homeBanner: savedHomeBanner,

      // Banner content comes ONLY from Settings
      homeBannerTitle:
        homeBannerTitle.trim(),

      homeBannerDescription:
        homeBannerDescription.trim(),

      homeBannerButtonText:
        homeBannerButtonText.trim(),

      statuses,
    };

    try {
      localStorage.setItem(
        "storeSettings",
        JSON.stringify(settings)
      );

      setStoreBanner(savedLogo);
      setHomeBanner(savedHomeBanner);

      window.dispatchEvent(
        new Event("storeSettingsUpdated")
      );

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);

      console.log(
        "SETTINGS SAVED:",
        settings
      );
    } catch (error) {
      console.error(
        "Could not save settings:",
        error
      );

      alert(
        "Could not save the settings. Try using smaller images."
      );
    }
  };

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <div className="page-header">
          <div>
            <h1>Settings</h1>

            <p>
              Customize your store information,
              branding and homepage
            </p>
          </div>
        </div>

        <form
          className="settings-form"
          onSubmit={handleSubmit}
        >
          {/* =========================================
              STORE INFORMATION
          ========================================== */}

          <div className="settings-card">
            <div className="settings-card-header">
              <h2>Store Information</h2>

              <p>
                Customize the information displayed
                on your store
              </p>
            </div>

            <div className="form-field">
              <label>Store Name</label>

              <input
                type="text"
                placeholder="Enter store name"
                value={storeName}
                onChange={(e) =>
                  setStoreName(e.target.value)
                }
              />
            </div>

            <div className="form-field">
              <label>Store Description</label>

              <textarea
                placeholder="Write a short description about your store"
                value={storeDescription}
                onChange={(e) =>
                  setStoreDescription(
                    e.target.value
                  )
                }
                rows="4"
              />
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Email</label>

                <input
                  type="email"
                  placeholder="Enter store email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                />
              </div>

              <div className="form-field">
                <label>Phone Number</label>

                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>
                  <FaWhatsapp />
                  WhatsApp
                </label>

                <input
                  type="tel"
                  placeholder="Example: +961 3 123 456"
                  value={whatsapp}
                  onChange={(e) =>
                    setWhatsapp(e.target.value)
                  }
                />
              </div>

              <div className="form-field">
                <label>Address</label>

                <input
                  type="text"
                  placeholder="Enter store address"
                  value={address}
                  onChange={(e) =>
                    setAddress(e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* =========================================
              STORE LOGO
          ========================================== */}

          <div className="settings-card">
            <div className="settings-card-header">
              <h2>Store Branding</h2>

              <p>
                Upload your store logo. This logo
                appears in the store header and footer.
              </p>
            </div>

            <div className="form-field">
              <label>Store Logo</label>

              <div className="store-banner-wrapper">
                <div
                  className={`store-banner-upload ${
                    isLogoDragging
                      ? "dragging"
                      : ""
                  }`}
                  onDragOver={handleLogoDragOver}
                  onDragLeave={handleLogoDragLeave}
                  onDrop={handleLogoDrop}
                  onClick={() =>
                    logoInputRef.current?.click()
                  }
                >
                  {storeBanner ? (
                    <img
                      src={storeBanner}
                      alt="Store Logo"
                      className="store-banner-preview"
                    />
                  ) : (
                    <div className="store-banner-empty">
                      <FaCloudUploadAlt className="store-banner-upload-icon" />

                      <span>
                        Upload Store Logo
                      </span>

                      <small>
                        PNG, JPG, JPEG or WEBP •
                        Max 2 MB
                      </small>
                    </div>
                  )}
                </div>

                {storeBanner && (
                  <button
                    type="button"
                    className="store-banner-remove"
                    onClick={handleRemoveLogo}
                    title="Remove logo"
                  >
                    <FaTrash />
                  </button>
                )}

                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleLogoChange}
                  hidden
                />
              </div>
            </div>
          </div>

          {/* =========================================
              HOME BANNER
          ========================================== */}

          <div className="settings-card">
            <div className="settings-card-header">
              <h2>Home Banner</h2>

              <p>
                Customize the image and all content
                displayed in the main store banner.
              </p>
            </div>

            <div className="form-field">
              <label>Banner Image</label>

              <div className="store-banner-wrapper">
                <div
                  className={`store-banner-upload home-banner-upload ${
                    isHomeBannerDragging
                      ? "dragging"
                      : ""
                  }`}
                  onDragOver={
                    handleHomeBannerDragOver
                  }
                  onDragLeave={
                    handleHomeBannerDragLeave
                  }
                  onDrop={handleHomeBannerDrop}
                  onClick={() =>
                    homeBannerInputRef.current?.click()
                  }
                >
                  {homeBanner ? (
                    <img
                      src={homeBanner}
                      alt="Home Banner"
                      className="store-banner-preview home-banner-preview"
                    />
                  ) : (
                    <div className="store-banner-empty">
                      <FaImage className="store-banner-upload-icon" />

                      <span>
                        Upload Home Banner
                      </span>

                      <small>
                        PNG, JPG, JPEG or WEBP •
                        Max 2 MB
                      </small>

                      <small>
                        Recommended: 1600 × 600 px
                      </small>
                    </div>
                  )}
                </div>

                {homeBanner && (
                  <button
                    type="button"
                    className="store-banner-remove"
                    onClick={
                      handleRemoveHomeBanner
                    }
                    title="Remove home banner"
                  >
                    <FaTrash />
                  </button>
                )}

                <input
                  ref={homeBannerInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={
                    handleHomeBannerChange
                  }
                  hidden
                />
              </div>
            </div>

            {/* Banner text is completely user-defined */}

            <div className="form-field">
              <label>Banner Title</label>

              <input
                type="text"
                placeholder="Enter banner title"
                value={homeBannerTitle}
                onChange={(e) =>
                  setHomeBannerTitle(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="form-field">
              <label>
                Banner Description
              </label>

              <textarea
                placeholder="Enter banner description"
                value={
                  homeBannerDescription
                }
                onChange={(e) =>
                  setHomeBannerDescription(
                    e.target.value
                  )
                }
                rows="3"
              />
            </div>

            <div className="form-field">
              <label>Button Text</label>

              <input
                type="text"
                placeholder="Enter button text"
                value={
                  homeBannerButtonText
                }
                onChange={(e) =>
                  setHomeBannerButtonText(
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          {/* PART 2 CONTINUES HERE */}
                    {/* =========================================
              SOCIAL MEDIA
          ========================================== */}

<div className="settings-card">
            <div className="settings-card-header">
              <h2>Social Media</h2>

              <p>
                Add your social media accounts so
                customers can easily reach your store.
              </p>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>
                  <FaInstagram />
                  Instagram
                </label>

                <input
                  type="text"
                  placeholder="Instagram username or link"
                  value={instagram}
                  onChange={(e) =>
                    setInstagram(e.target.value)
                  }
                />
              </div>

              <div className="form-field">
                <label>
                  <FaTiktok />
                  TikTok
                </label>

                <input
                  type="text"
                  placeholder="TikTok username or link"
                  value={tiktok}
                  onChange={(e) =>
                    setTiktok(e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* =========================================
              STATUS MANAGEMENT
          ========================================== */}

          <div className="settings-card">
            <div className="settings-card-header settings-card-header-row">
              <div>
                <h2>Status Management</h2>

                <p>
                  Manage the status options used
                  throughout your system.
                </p>
              </div>

              <button
                type="button"
                className="settings-secondary-button"
                onClick={() =>
                  setShowStatusModal(true)
                }
              >
                <FaCog />
                Manage Statuses
              </button>
            </div>

            <div className="status-preview-list">
              {statuses.length > 0 ? (
                statuses.map((status) => (
                  <span
                    className="status-preview-item"
                    key={status}
                  >
                    <FaCheckCircle />
                    {status}
                  </span>
                ))
              ) : (
                <p className="status-empty-text">
                  No statuses added yet.
                </p>
              )}
            </div>
          </div>

          {/* =========================================
              SAVE SETTINGS
          ========================================== */}

          <div className="settings-save-section">
            <div className="settings-save-message">
              {saved && (
                <>
                  <FaCheckCircle />
                  Settings saved successfully
                </>
              )}
            </div>

            <button
              type="submit"
              className="settings-save-button"
            >
              <FaCheckCircle />
              Save Settings
            </button>
          </div>
        </form>
      </main>

      {/* =========================================
          STATUS MODAL
      ========================================== */}

      {showStatusModal && (
        <div
          className="settings-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseStatusModal();
            }
          }}
        >
          <div className="settings-modal">
            <div className="settings-modal-header">
              <div>
                <h2>Manage Statuses</h2>

                <p>
                  Add or remove status options.
                </p>
              </div>

              <button
                type="button"
                className="settings-modal-close"
                onClick={
                  handleCloseStatusModal
                }
              >
                <FaTimes />
              </button>
            </div>

            <div className="settings-modal-body">
              <div className="status-add-row">
                <input
                  type="text"
                  placeholder="Enter new status"
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
                  onClick={handleAddStatus}
                >
                  <FaPlus />
                  Add
                </button>
              </div>

              <div className="status-modal-list">
                {statuses.length > 0 ? (
                  statuses.map((status) => (
                    <div
                      className="status-modal-item"
                      key={status}
                    >
                      <div>
                        <FaCheckCircle />
                        <span>{status}</span>
                      </div>

                      <button
                        type="button"
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
                  ))
                ) : (
                  <div className="status-modal-empty">
                    No statuses added yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          CSS
      ========================================== */}

      <style>{`
        * {
          box-sizing: border-box;
        }

        .dashboard-layout {
          min-height: 100vh;
          display: flex;
          background: #f7faf9;
          color: #344054;

          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        .dashboard-main {
          width: 100%;
          min-width: 0;

          margin-left: 250px;

          padding:
            32px 38px 55px;
        }

        /* =====================================
           PAGE HEADER
        ====================================== */

        .page-header {
          margin-bottom: 24px;
        }

        .page-header h1 {
          margin: 0;

          color: #24364b;

          font-size: 27px;
          font-weight: 800;

          letter-spacing: -0.7px;
        }

        .page-header p {
          margin: 7px 0 0;

          color: #98a2b3;

          font-size: 11px;
          line-height: 1.6;
        }

        /* =====================================
           FORM
        ====================================== */

        .settings-form {
          width: 100%;
          max-width: 1050px;

          display: flex;
          flex-direction: column;

          gap: 20px;
        }

        /* =====================================
           CARDS
        ====================================== */

        .settings-card {
          width: 100%;

          padding: 25px 27px;

          border:
            1px solid #e2e9e8;

          border-radius: 15px;

          background: #ffffff;

          box-shadow:
            0 4px 16px
            rgba(16, 24, 40, 0.025);
        }

        .settings-card-header {
          margin-bottom: 22px;
        }

        .settings-card-header-row {
          display: flex;

          align-items: center;
          justify-content:
            space-between;

          gap: 20px;
        }

        .settings-card-header h2 {
          margin: 0;

          color: #344054;

          font-size: 15px;
          font-weight: 800;
        }

        .settings-card-header p {
          margin: 6px 0 0;

          color: #98a2b3;

          font-size: 10px;
          line-height: 1.55;
        }

        /* =====================================
           FORM FIELDS
        ====================================== */

        .form-row {
          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );

          gap: 17px;
        }

        .form-field {
          margin-bottom: 18px;
        }

        .form-field:last-child {
          margin-bottom: 0;
        }

        .form-field label {
          margin-bottom: 7px;

          display: flex;
          align-items: center;

          gap: 6px;

          color: #475467;

          font-size: 10px;
          font-weight: 750;
        }

        .form-field label svg {
          color: #159f9f;

          font-size: 12px;
        }

        .form-field input,
        .form-field textarea {
          width: 100%;

          border:
            1px solid #dce5e4;

          border-radius: 9px;

          outline: none;

          background: #ffffff;
          color: #344054;

          font-family: inherit;
          font-size: 11px;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .form-field input {
          height: 43px;

          padding: 0 13px;
        }

        .form-field textarea {
          min-height: 95px;

          padding: 12px 13px;

          resize: vertical;

          line-height: 1.6;
        }

        .form-field input::placeholder,
        .form-field textarea::placeholder {
          color: #b0b8c2;
        }

        .form-field input:focus,
        .form-field textarea:focus {
          border-color: #159f9f;

          box-shadow:
            0 0 0 3px
            rgba(
              21,
              159,
              159,
              0.08
            );
        }

        /* =====================================
           IMAGE UPLOAD
        ====================================== */

        .store-banner-wrapper {
          width: 100%;

          position: relative;
        }

        .store-banner-upload {
          width: 100%;
          min-height: 150px;

          border:
            1.5px dashed
            #cbdcda;

          border-radius: 13px;

          background:
            linear-gradient(
              135deg,
              #fbfefe,
              #f3faf9
            );

          display: flex;
          align-items: center;
          justify-content: center;

          overflow: hidden;

          cursor: pointer;

          position: relative;

          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            box-shadow 0.2s ease,
            transform 0.2s ease;
        }

        .store-banner-upload:hover {
          border-color:
            rgba(
              21,
              159,
              159,
              0.7
            );

          background: #f2fbfa;

          box-shadow:
            0 7px 20px
            rgba(
              21,
              159,
              159,
              0.06
            );
        }

        .store-banner-upload.dragging {
          border-color: #159f9f;

          background: #eaf8f7;

          box-shadow:
            0 0 0 4px
            rgba(
              21,
              159,
              159,
              0.08
            );
        }

        .store-banner-empty {
          padding: 25px;

          display: flex;
          flex-direction: column;

          align-items: center;
          justify-content: center;

          text-align: center;
        }

        .store-banner-upload-icon {
          margin-bottom: 10px;

          color: #159f9f;

          font-size: 27px;
        }

        .store-banner-empty span {
          color: #475467;

          font-size: 11px;
          font-weight: 750;
        }

        .store-banner-empty small {
          margin-top: 6px;

          display: block;

          color: #98a2b3;

          font-size: 8px;
          line-height: 1.5;
        }

        /* =====================================
           STORE LOGO PREVIEW
        ====================================== */

        .store-banner-preview {
          display: block;

          width: 100%;
          height: 150px;

          padding: 13px;

          object-fit: contain;

          background: #ffffff;
        }

        /* =====================================
           HOME BANNER PREVIEW
        ====================================== */

        .home-banner-upload {
          min-height: 270px;

          border-style: solid;

          background:
            linear-gradient(
              135deg,
              #f7fcfb,
              #eaf7f6
            );
        }

        .home-banner-preview {
          width: 100%;
          height: 270px;

          padding: 0;

          object-fit: cover;
          object-position: center;

          background: #edf7f6;
        }

        /* =====================================
           REMOVE IMAGE
        ====================================== */

        .store-banner-remove {
          width: 35px;
          height: 35px;

          padding: 0;

          border:
            1px solid
            rgba(
              217,
              45,
              32,
              0.14
            );

          border-radius: 50%;

          background:
            rgba(
              255,
              255,
              255,
              0.96
            );

          color: #d92d20;

          display: flex;
          align-items: center;
          justify-content: center;

          position: absolute;

          top: 12px;
          right: 12px;

          z-index: 5;

          cursor: pointer;

          box-shadow:
            0 5px 15px
            rgba(
              16,
              24,
              40,
              0.09
            );

          transition:
            background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        .store-banner-remove:hover {
          background: #d92d20;
          color: #ffffff;

          transform: scale(1.05);
        }

        /* =====================================
           STATUS
        ====================================== */

        .settings-secondary-button {
          min-height: 38px;

          padding: 0 14px;

          border:
            1px solid #cfe4e2;

          border-radius: 8px;

          background: #f4fbfa;
          color: #11797b;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

          font-size: 9px;
          font-weight: 750;

          cursor: pointer;

          white-space: nowrap;

          transition: 0.2s ease;
        }

        .settings-secondary-button:hover {
          border-color: #159f9f;

          background: #e9f8f6;
        }

        .status-preview-list {
          display: flex;
          flex-wrap: wrap;

          gap: 8px;
        }

        .status-preview-item {
          padding: 7px 10px;

          border:
            1px solid #d9ebe9;

          border-radius: 20px;

          background: #f2faf9;
          color: #52706e;

          display: inline-flex;
          align-items: center;

          gap: 6px;

          font-size: 9px;
          font-weight: 650;
        }

        .status-preview-item svg {
          color: #159f9f;

          font-size: 9px;
        }

        .status-empty-text {
          margin: 0;

          color: #98a2b3;

          font-size: 10px;
        }

        /* =====================================
           SAVE
        ====================================== */

        .settings-save-section {
          min-height: 60px;

          display: flex;

          align-items: center;
          justify-content:
            space-between;

          gap: 20px;
        }

        .settings-save-message {
          min-height: 30px;

          color: #159f9f;

          display: flex;
          align-items: center;

          gap: 7px;

          font-size: 10px;
          font-weight: 700;
        }

        .settings-save-button {
          min-width: 145px;
          height: 42px;

          padding: 0 18px;

          border: none;
          border-radius: 9px;

          background: #159f9f;
          color: #ffffff;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 8px;

          font-size: 10px;
          font-weight: 800;

          cursor: pointer;

          box-shadow:
            0 7px 16px
            rgba(
              21,
              159,
              159,
              0.16
            );

          transition:
            background 0.2s ease,
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .settings-save-button:hover {
          background: #11797b;

          transform:
            translateY(-1px);

          box-shadow:
            0 9px 20px
            rgba(
              17,
              121,
              123,
              0.2
            );
        }

        /* =====================================
           MODAL
        ====================================== */

        .settings-modal-overlay {
          position: fixed;

          inset: 0;

          padding: 20px;

          background:
            rgba(
              16,
              24,
              40,
              0.42
            );

          display: flex;
          align-items: center;
          justify-content: center;

          z-index: 9999;

          backdrop-filter:
            blur(3px);
        }

        .settings-modal {
          width:
            min(500px, 100%);

          max-height: 80vh;

          border:
            1px solid #e2e9e8;

          border-radius: 15px;

          background: #ffffff;

          overflow: hidden;

          box-shadow:
            0 24px 60px
            rgba(
              16,
              24,
              40,
              0.18
            );
        }

        .settings-modal-header {
          padding: 20px 22px;

          border-bottom:
            1px solid #edf1f1;

          display: flex;
          align-items: flex-start;
          justify-content:
            space-between;

          gap: 20px;
        }

        .settings-modal-header h2 {
          margin: 0;

          color: #344054;

          font-size: 15px;
        }

        .settings-modal-header p {
          margin: 5px 0 0;

          color: #98a2b3;

          font-size: 9px;
        }

        .settings-modal-close {
          width: 31px;
          height: 31px;

          padding: 0;

          border: none;
          border-radius: 50%;

          background: #f3f6f6;
          color: #667085;

          display: flex;
          align-items: center;
          justify-content: center;

          cursor: pointer;
        }

        .settings-modal-close:hover {
          background: #e8f7f7;
          color: #159f9f;
        }

        .settings-modal-body {
          max-height: 60vh;

          padding: 20px 22px;

          overflow-y: auto;
        }

        .status-add-row {
          display: grid;

          grid-template-columns:
            1fr auto;

          gap: 9px;

          margin-bottom: 17px;
        }

        .status-add-row input {
          height: 41px;

          padding: 0 12px;

          border:
            1px solid #dce5e4;

          border-radius: 8px;

          outline: none;

          color: #344054;

          font-size: 10px;
        }

        .status-add-row input:focus {
          border-color: #159f9f;

          box-shadow:
            0 0 0 3px
            rgba(
              21,
              159,
              159,
              0.08
            );
        }

        .status-add-row button {
          height: 41px;

          padding: 0 15px;

          border: none;
          border-radius: 8px;

          background: #159f9f;
          color: #ffffff;

          display: flex;
          align-items: center;

          gap: 6px;

          font-size: 9px;
          font-weight: 750;

          cursor: pointer;
        }

        .status-add-row button:hover {
          background: #11797b;
        }

        .status-modal-list {
          display: flex;
          flex-direction: column;

          gap: 7px;
        }

        .status-modal-item {
          min-height: 45px;

          padding:
            8px 10px 8px 13px;

          border:
            1px solid #e4eceb;

          border-radius: 9px;

          background: #fafcfc;

          display: flex;
          align-items: center;
          justify-content:
            space-between;

          gap: 15px;
        }

        .status-modal-item > div {
          display: flex;
          align-items: center;

          gap: 8px;

          color: #475467;

          font-size: 10px;
          font-weight: 650;
        }

        .status-modal-item > div svg {
          color: #159f9f;

          font-size: 11px;
        }

        .status-modal-item > button {
          width: 29px;
          height: 29px;

          padding: 0;

          border: none;
          border-radius: 50%;

          background: #fff0ef;
          color: #d92d20;

          display: flex;
          align-items: center;
          justify-content: center;

          cursor: pointer;
        }

        .status-modal-item > button:hover {
          background: #d92d20;
          color: #ffffff;
        }

        .status-modal-empty {
          padding: 30px;

          color: #98a2b3;

          text-align: center;

          font-size: 10px;
        }

        /* =====================================
           RESPONSIVE
        ====================================== */

        @media (max-width: 1100px) {
          .dashboard-main {
            padding:
              28px 25px 50px;
          }
        }

        @media (max-width: 850px) {
          .dashboard-main {
            margin-left: 0;

            padding:
              25px 18px 45px;
          }

          .settings-form {
            max-width: none;
          }

          .settings-card {
            padding: 22px 20px;
          }

          .home-banner-upload,
          .home-banner-preview {
            min-height: 220px;
            height: 220px;
          }
        }

        @media (max-width: 650px) {
          .form-row {
            grid-template-columns: 1fr;

            gap: 0;
          }

          .settings-card-header-row {
            align-items: flex-start;
            flex-direction: column;
          }

          .settings-secondary-button {
            width: 100%;
          }

          .settings-save-section {
            align-items: stretch;
            flex-direction: column;
          }

          .settings-save-button {
            width: 100%;
          }

          .home-banner-upload,
          .home-banner-preview {
            min-height: 180px;
            height: 180px;
          }

          .status-add-row {
            grid-template-columns: 1fr;
          }

          .status-add-row button {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}

export default Settings;