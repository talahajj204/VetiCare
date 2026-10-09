
import { useRef, useState } from "react";
import Sidebar from "../components/Sidebar";

import {
  FaCloudUploadAlt,
  FaTrash,
  FaPlus,
  FaCheckCircle,
  FaTimes,
  FaInstagram,
  FaFacebookF,
  FaWhatsapp,
  FaPaw,
  FaImage,
  FaSave,
} from "react-icons/fa";

import { FaTiktok } from "react-icons/fa6";

const STORAGE_KEY = "storeSettings";

const DEFAULT_STATUSES = [
  "Active",
  "Inactive",
  "Pending",
  "Completed",
  "Cancelled",
];

function readSettings() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const parsed = data ? JSON.parse(data) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function ImageUploader({
  label,
  image,
  onChange,
  onRemove,
  description,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const processFile = (file) => {
    if (!file) return;

    if (
      !["image/png", "image/jpeg", "image/webp"].includes(
        file.type
      )
    ) {
      alert("Please select a PNG, JPG or WEBP image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be smaller than 2 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        onChange(reader.result);
      }
    };

    reader.onerror = () => {
      alert("Could not read this image.");
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="settings-field settings-image-field">
      <label className="settings-label">{label}</label>

      <input
        ref={inputRef}
        className="settings-native-file"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        style={{ display: "none" }}
        tabIndex={-1}
        onChange={(event) => {
          processFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      {image ? (
        <div className="settings-image-preview">
          <div className="settings-preview-picture">
            <img src={image} alt={label} />
          </div>

          <div className="settings-preview-details">
            <span className="settings-image-status">
              <FaCheckCircle />
              Image uploaded
            </span>

            <p>
              Your image is ready to display on the store.
            </p>

            <button
              type="button"
              className="settings-btn settings-btn-danger"
              onClick={onRemove}
            >
              <FaTrash />
              Remove Image
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`settings-upload-zone ${
            dragging ? "dragging" : ""
          }`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            processFile(event.dataTransfer.files?.[0]);
          }}
        >
          <div className="settings-upload-icon">
            <FaCloudUploadAlt />
          </div>

          <strong>Upload {label}</strong>

          <p>
            Drag and drop an image or browse your files.
          </p>

          <button
            type="button"
            className="settings-btn settings-btn-outline"
            onClick={() => inputRef.current?.click()}
          >
            <FaImage />
            Choose Image
          </button>

          <small>PNG, JPG, WEBP · Max 2 MB</small>
          {description && <small>{description}</small>}
        </div>
      )}
    </div>
  );
}

function Settings() {
  const [form, setForm] = useState(readSettings);

  const [statuses, setStatuses] = useState(() => {
    const data = readSettings();

    return Array.isArray(data.statuses)
      ? data.statuses
      : DEFAULT_STATUSES;
  });

  const [newStatus, setNewStatus] = useState("");
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("store");

  const updateField = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setSaved(false);
  };

  const updateImage = (key, value) => {
    const updated = {
      ...readSettings(),
      ...form,
      [key]: value,
      statuses,
    };

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updated)
      );

      setForm(updated);
      setSaved(false);

      window.dispatchEvent(
        new Event("storeSettingsUpdated")
      );
    } catch (error) {
      console.error("Image save error:", error);
      alert("Could not save image. Try a smaller image.");
    }
  };

  const handleSave = (event) => {
    event.preventDefault();

    const updated = {
      ...readSettings(),
      ...form,
      statuses,
    };

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updated)
      );

      window.dispatchEvent(
        new Event("storeSettingsUpdated")
      );

      setForm(updated);
      setSaved(true);
    } catch (error) {
      console.error("Settings save error:", error);
      alert("Could not save settings. Try smaller images.");
    }
  };

  const addStatus = () => {
    const value = newStatus.trim();
    if (!value) return;

    if (
      statuses.some(
        (status) =>
          status.toLowerCase() === value.toLowerCase()
      )
    ) {
      alert("This status already exists.");
      return;
    }

    setStatuses((current) => [...current, value]);
    setNewStatus("");
    setSaved(false);
  };

  const removeStatus = (value) => {
    setStatuses((current) =>
      current.filter((status) => status !== value)
    );

    setSaved(false);
  };

  const renderInput = (
    label,
    key,
    placeholder = "",
    type = "text"
  ) => (
    <div className="settings-field" key={key}>
      <label className="settings-label">{label}</label>

      <input
        type={type}
        value={form[key] ?? ""}
        placeholder={placeholder}
        onChange={(event) =>
          updateField(key, event.target.value)
        }
      />
    </div>
  );

  const renderTextarea = (
    label,
    key,
    placeholder = ""
  ) => (
    <div className="settings-field" key={key}>
      <label className="settings-label">{label}</label>

      <textarea
        rows={4}
        value={form[key] ?? ""}
        placeholder={placeholder}
        onChange={(event) =>
          updateField(key, event.target.value)
        }
      />
    </div>
  );

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main settings-page">
        <style>{`
          .settings-page {
            min-height: 100vh;
            padding: 32px 38px 65px;
            background: #f6f9f9;
            color: #283f43;
            font-family: inherit;
          }

          .settings-page *,
          .settings-page *::before,
          .settings-page *::after {
            box-sizing: border-box;
          }

          .settings-container {
            width: 100%;
            max-width: 1120px;
            margin: 0 auto;
          }

          .settings-page-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 26px;
          }

          .settings-page-header h1 {
            margin: 0 0 7px;
            font-size: 28px;
            font-weight: 800;
            letter-spacing: -0.8px;
            color: #263f45;
          }

          .settings-page-header p {
            margin: 0;
            font-size: 13px;
            line-height: 1.7;
            color: #84969b;
          }

          .settings-header-icon {
            width: 46px;
            height: 46px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 14px;
            background: #e3f5f2;
            color: #159b97;
            font-size: 19px;
            flex-shrink: 0;
          }

          .settings-form {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .settings-card {
            padding: 26px 28px;
            background: #fff;
            border: 1px solid #e5ecee;
            border-radius: 17px;
            box-shadow: 0 3px 18px rgba(24, 58, 64, 0.025);
          }

          .settings-card-header {
            margin-bottom: 23px;
          }

          .settings-card-header h2 {
            margin: 0 0 7px;
            font-size: 17px;
            font-weight: 800;
            letter-spacing: -0.35px;
            color: #29414b;
          }

          .settings-card-header p {
            margin: 0;
            font-size: 12px;
            line-height: 1.7;
            color: #8b9da6;
          }

          .settings-section-divider {
            height: 1px;
            background: #edf1f2;
            margin: 25px 0;
          }

          .settings-field {
            display: flex;
            flex-direction: column;
            gap: 8px;
            min-width: 0;
            margin-bottom: 18px;
          }

          .settings-field:last-child {
            margin-bottom: 0;
          }

          .settings-label {
            display: block;
            font-size: 12px;
            font-weight: 750;
            color: #40565d;
          }

          .settings-field input:not([type="file"]),
          .settings-field textarea {
            width: 100%;
            min-width: 0;
            border: 1px solid #dce7e9;
            border-radius: 9px;
            padding: 11px 13px;
            background: #fcfdfd;
            color: #293f45;
            font-family: inherit;
            font-size: 12.5px;
            outline: none;
            transition: 0.2s ease;
          }

          .settings-field input:not([type="file"]) {
            height: 43px;
          }

          .settings-field textarea {
            min-height: 98px;
            resize: vertical;
            line-height: 1.65;
          }

          .settings-field input:focus,
          .settings-field textarea:focus {
            border-color: #19a49f;
            background: #fff;
            box-shadow: 0 0 0 3px rgba(25,164,159,0.07);
          }

          .settings-field input::placeholder,
          .settings-field textarea::placeholder {
            color: #a6b5bd;
          }

          .settings-row {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            column-gap: 18px;
          }

          /* IMAGE UPLOAD */

          .settings-page input.settings-native-file,
          .settings-page input[type="file"] {
            display: none !important;
            position: absolute !important;
            width: 0 !important;
            height: 0 !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }

          .settings-upload-zone {
            min-height: 155px;
            padding: 22px;
            border: 1.5px dashed #9ad8d3;
            border-radius: 12px;
            background: #f5fbfa;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 8px;
            text-align: center;
            transition: 0.2s;
          }

          .settings-upload-zone.dragging {
            background: #e7f7f4;
            border-color: #119e98;
          }

          .settings-upload-icon {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            background: #e0f4f1;
            color: #149e99;
            font-size: 18px;
          }

          .settings-upload-zone strong {
            font-size: 12px;
            font-weight: 750;
            color: #385660;
          }

          .settings-upload-zone p {
            margin: 0;
            font-size: 11px;
            color: #8ca2aa;
          }

          .settings-upload-zone small {
            font-size: 10px;
            color: #9aaeb4;
          }

          .settings-image-preview {
            min-height: 150px;
            display: flex;
            align-items: center;
            gap: 24px;
            padding: 18px;
            border: 1px solid #dcece9;
            border-radius: 12px;
            background: #f7fbfa;
          }

          .settings-preview-picture {
            width: 170px;
            height: 120px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            overflow: hidden;
            background: #e9f3f2;
          }

          .settings-preview-picture img {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: contain;
          }

          .settings-preview-details {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 9px;
            min-width: 0;
          }

          .settings-image-status {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            font-size: 12px;
            font-weight: 750;
            color: #139879;
          }

          .settings-preview-details p {
            margin: 0;
            font-size: 11px;
            color: #879da3;
            line-height: 1.5;
          }

          /* SMALL BUTTONS */

          .settings-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            width: auto !important;
            min-width: 0;
            min-height: 34px;
            padding: 8px 13px;
            border-radius: 8px;
            border: 1px solid transparent;
            font-family: inherit;
            font-size: 11.5px;
            font-weight: 750;
            line-height: 1.2;
            white-space: nowrap;
            cursor: pointer;
            transition: 0.18s;
          }

          .settings-btn svg {
            font-size: 11px;
          }

          .settings-btn-primary {
            color: white;
            background: #159d99;
            border-color: #159d99;
          }

          .settings-btn-primary:hover {
            background: #0d8581;
          }

          .settings-btn-outline {
            background: #fff;
            color: #118f8b;
            border-color: #bce0dc;
          }

          .settings-btn-outline:hover {
            background: #e8f7f5;
          }

          .settings-btn-danger {
            color: #c65353;
            background: #fff;
            border-color: #f0cece;
          }

          .settings-btn-danger:hover {
            background: #fff0f0;
          }

          /* ABOUT TIMELINE */

          .settings-timeline {

            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 13px;
          }

          .settings-timeline-card {
            padding: 17px;
            border: 1px solid #e0edeb;
            border-radius: 12px;
            background: #f8fbfa;
          }

          .settings-timeline-heading {
            display: flex;
            align-items: center;
            gap: 9px;
            margin-bottom: 16px;
          }

          .settings-timeline-number {
            width: 28px;
            height: 28px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            background: #ddf3ef;
            color: #15958f;
            font-size: 12px;
            font-weight: 800;
          }

          .settings-timeline-heading h3 {
            margin: 0;
            font-size: 12px;
            font-weight: 800;
            color: #38555b;
          }

          .settings-timeline-card .settings-field {
            margin-bottom: 14px;
          }

          .settings-timeline-card .settings-field:last-child {
            margin-bottom: 0;
          }

          .settings-timeline-card textarea {
            min-height: 90px;
          }

          /* SOCIAL MEDIA */

          .settings-social-icons {
            display: flex;
            align-items: center;
            gap: 9px;
            color: #159c97;
            font-size: 15px;
            margin-top: 4px;
          }

          .settings-social-icons span {
            width: 31px;
            height: 31px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #edf8f6;
            border-radius: 8px;
          }

          /* STATUS MANAGEMENT */

          .settings-status-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }

          .settings-status {
            display: inline-flex;
            align-items: center;
            gap: 9px;
            padding: 7px 10px;
            border-radius: 7px;
            border: 1px solid #dcefeb;
            background: #f0f9f7;
            color: #237e7a;
            font-size: 11.5px;
            font-weight: 700;
          }

          .settings-status button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: none;
            padding: 2px;
            background: transparent;
            color: #cf6868;
            cursor: pointer;
          }

          .settings-add-status {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 16px;
          }

          .settings-add-status input {
            flex: 1;
            min-width: 0;
            max-width: 350px;
            height: 37px;
            padding: 9px 12px;
            border: 1px solid #dce7e9;
            border-radius: 8px;
            outline: none;
            background: #fcfdfd;
            color: #29434a;
            font: inherit;
            font-size: 12px;
          }

          .settings-add-status input:focus {
            border-color: #19a49f;
          }

          /* SAVE SETTINGS */

          .settings-save-bar {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
            padding: 5px 0 30px;
          }

          .settings-saved {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            color: #159879;
            font-size: 12px;
            font-weight: 700;
          }

          .settings-save-bar .settings-btn {
            min-height: 38px;
            padding: 10px 18px;
            font-size: 12px;
          }

          @media (max-width: 1100px) {
            .settings-timeline {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 700px) {
            .settings-page {
              padding: 18px 14px 45px;
            }

            .settings-page-header h1 {
              font-size: 24px;
            }

            .settings-card {
              padding: 20px 16px;
              border-radius: 13px;
            }

            .settings-row {
              grid-template-columns: 1fr;
            }

            .settings-image-preview {
              flex-direction: column;
              align-items: stretch;
              gap: 13px;
            }

            .settings-preview-picture {
              width: 100%;
              height: 150px;
            }

            .settings-save-bar {
              justify-content: flex-start;
            }
          }

          /* SETTINGS TABS */

          .settings-tabs {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 24px;
            padding-bottom: 14px;
            border-bottom: 1px solid #e5ecee;
          }

          .settings-tab {
            width: auto;
            min-height: 39px;
            padding: 9px 16px;
            border: 1px solid #dce7e9;
            border-radius: 9px;
            background: #ffffff;
            color: #40565d;
            font-family: inherit;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            transition: 0.18s ease;
          }

          .settings-tab:hover {
            background: #f0f9f7;
          }

          .settings-tab.active {
            background: #159d99;
            border-color: #159d99;
            color: #ffffff;
          }
        `}</style>

        <div className="settings-container">
          <div className="settings-page-header">
            <div>
              <h1>Settings</h1>
              <p>
                Manage your store information, branding,
                public pages and preferences.
              </p>
            </div>

            <div className="settings-header-icon">
              <FaPaw />
            </div>
          </div>

          {/* SETTINGS TABS */}
          <div className="settings-tabs">
            <button
              type="button"
              className={`settings-tab ${
                activeTab === "store" ? "active" : ""
              }`}
              onClick={() => setActiveTab("store")}
            >
              Store Settings
            </button>

            <button
              type="button"
              className={`settings-tab ${
                activeTab === "about" ? "active" : ""
              }`}
              onClick={() => setActiveTab("about")}
            >
              About Us
            </button>

            <button
              type="button"
              className={`settings-tab ${
                activeTab === "contact" ? "active" : ""
              }`}
              onClick={() => setActiveTab("contact")}
            >
              Contact & Social Media
            </button>

            <button
              type="button"
              className={`settings-tab ${
                activeTab === "options" ? "active" : ""
              }`}
              onClick={() => setActiveTab("options")}
            >
              Option List
            </button>
          </div>

          <form
            className="settings-form"
            onSubmit={handleSave}
          >
            {/* STORE SETTINGS */}
            {activeTab === "store" && (
              <>
                {/* STORE INFORMATION */}
                <section className="settings-card">
                  <div className="settings-card-header">
                    <h2>Store Information</h2>
                    <p>
                      Basic contact details and information
                      displayed across your store.
                    </p>
                  </div>

                  {renderInput(
                    "Store Name",
                    "storeName",
                    "Enter store name"
                  )}

                  {renderTextarea(
                    "Store Description",
                    "storeDescription",
                    "Write a short description about your store"
                  )}

                  <div className="settings-row">
                    {renderInput(
                      "Email",
                      "email",
                      "Enter store email",
                      "email"
                    )}

                    {renderInput(
                      "Phone Number",
                      "phone",
                      "Enter phone number",
                      "tel"
                    )}
                  </div>

                  <div className="settings-row">
                    {renderInput(
                      "WhatsApp",
                      "whatsapp",
                      "Example: +961 3 123 456",
                      "tel"
                    )}

                    {renderInput(
                      "Address",
                      "address",
                      "Enter store address"
                    )}
                  </div>
                </section>

                {/* STORE BRANDING */}
                <section className="settings-card">
                  <div className="settings-card-header">
                    <h2>Store Branding</h2>
                    <p>
                      Upload the logo displayed in your
                      store header and footer.
                    </p>
                  </div>

                  <ImageUploader
                    label="Store Logo"
                    image={form.storeBanner}
                    onChange={(image) =>
                      updateImage("storeBanner", image)
                    }
                    onRemove={() =>
                      updateImage("storeBanner", null)
                    }
                  />
                </section>

                {/* HOME BANNER */}
                <section className="settings-card">
                  <div className="settings-card-header">
                    <h2>Home Banner</h2>
                    <p>
                      Control all text and images displayed
                      in the center of your store homepage.
                      Empty fields will not display text.
                    </p>
                  </div>

                  <ImageUploader
                    label="Home Banner"
                    image={form.homeBanner}
                    onChange={(image) =>
                      updateImage("homeBanner", image)
                    }
                    onRemove={() =>
                      updateImage("homeBanner", null)
                    }
                  />

                  <div className="settings-section-divider" />

                  {renderInput(
                    "Banner Badge Text",
                    "homeBannerBadge",
                    "Enter the small text above your banner title"
                  )}

                  {renderInput(
                    "Banner Title",
                    "homeBannerTitle",
                    "Enter the main banner title"
                  )}

                  {renderTextarea(
                    "Banner Description",
                    "homeBannerDescription",
                    "Enter the banner description"
                  )}

                  {renderInput(
                    "Button Text",
                    "homeBannerButtonText",
                    "Enter button text"
                  )}
                </section>
              </>
            )}

            {/* ABOUT US - ORIGINAL FIELDS */}
            {activeTab === "about" && (
              <section className="settings-card">
                <div className="settings-card-header">
                  <h2>About Us Page</h2>
                  <p>
                    Customize your story, image and journey
                    timeline. Content is saved dynamically.
                  </p>
                </div>

                {renderInput(
                  "About Title",
                  "aboutTitle",
                  "Enter your About Us title"
                )}

                {renderTextarea(
                  "About Description",
                  "aboutDescription",
                  "Write your clinic or store story"
                )}

                <ImageUploader
                  label="About Us Image"
                  image={form.aboutImage}
                  onChange={(image) =>
                    updateImage("aboutImage", image)
                  }
                  onRemove={() =>
                    updateImage("aboutImage", null)
                  }
                  description="Recommended: 1200 × 900 px"
                />

                <div className="settings-section-divider" />

                <div className="settings-card-header">
                  <h2>
                    <FaPaw
                      style={{
                        color: "#159c97",
                        marginRight: 8,
                        fontSize: 14,
                      }}
                    />
                    Our Journey Timeline
                  </h2>

                  <p>
                    Customize the three milestones displayed
                    beside your About Us image.
                  </p>
                </div>

                <div className="settings-timeline">
                  {[1, 2, 3].map((number) => (
                    <div
                      className="settings-timeline-card"
                      key={number}
                    >
                      <div className="settings-timeline-heading">
                        <span className="settings-timeline-number">
                          {number}
                        </span>

                        <h3>Timeline Step {number}</h3>
                      </div>

                      {renderInput(
                        `Step ${number} Title`,
                        `aboutStep${number}Title`,
                        `Enter step ${number} title`
                      )}

                      {renderTextarea(
                        `Step ${number} Description`,
                        `aboutStep${number}Description`,
                        `Enter step ${number} description`
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* CONTACT & SOCIAL MEDIA */}
            {activeTab === "contact" && (
              <>
                {/* CONTACT US */}
                <section className="settings-card">
                  <div className="settings-card-header">
                    <h2>Contact Us Page</h2>
                    <p>
                      Manage the contact details displayed
                      on your Contact Us page.
                    </p>
                  </div>

                  <div className="settings-row">
                    {renderInput(
                      "Contact Email",
                      "contactEmail",
                      "Enter contact email",
                      "email"
                    )}

                    {renderInput(
                      "Contact Phone",
                      "contactPhone",
                      "Enter contact phone number",
                      "tel"
                    )}
                  </div>

                  {renderInput(
                    "Contact Address",
                    "contactAddress",
                    "Enter clinic address"
                  )}

                  {renderTextarea(
                    "Contact Description",
                    "contactDescription",
                    "Enter a short message for visitors"
                  )}
                </section>

                {/* SOCIAL MEDIA */}
                <section className="settings-card">
                  <div className="settings-card-header">
                    <h2>Social Media</h2>
                    <p>
                      Manage your clinic social media links.
                    </p>

                    <div className="settings-social-icons">
                      <span>
                        <FaInstagram />
                      </span>

                      <span>
                        <FaFacebookF />
                      </span>

                      <span>
                        <FaWhatsapp />
                      </span>

                      <span>
                        <FaTiktok />
                      </span>
                    </div>
                  </div>

                  <div className="settings-row">
                    {renderInput(
                      "Instagram",
                      "instagram",
                      "https://instagram.com/..."
                    )}

                    {renderInput(
                      "Facebook",
                      "facebook",
                      "https://facebook.com/..."
                    )}
                  </div>

                  <div className="settings-row">
                    {renderInput(
                      "WhatsApp",
                      "socialWhatsapp",
                      "Enter WhatsApp link or number"
                    )}

                    {renderInput(
                      "TikTok",
                      "tiktok",
                      "https://tiktok.com/@..."
                    )}
                  </div>
                </section>
              </>
            )}

            {/* OPTION LIST */}
            {activeTab === "options" && (
              <section className="settings-card">
                <div className="settings-card-header">
                  <h2>Option List</h2>
                  <p>
                    Manage the available status options
                    used across your system.
                  </p>
                </div>

                <div className="settings-status-list">
                  {statuses.map((status) => (
                    <div
                      className="settings-status"
                      key={status}
                    >
                      <span>{status}</span>

                      <button
                        type="button"
                        onClick={() => removeStatus(status)}
                        title={`Remove ${status}`}
                        aria-label={`Remove ${status}`}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="settings-add-status">
                  <input
                    type="text"
                    placeholder="Enter new status"
                    value={newStatus}
                    onChange={(event) =>
                      setNewStatus(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addStatus();
                      }
                    }}
                  />

                  <button
                    type="button"
                    className="settings-btn settings-btn-outline"
                    onClick={addStatus}
                  >
                    <FaPlus />
                    Add Status
                  </button>
                </div>
              </section>
            )}

            {/* SAVE SETTINGS */}
            <div className="settings-save-bar">
              {saved && (
                <span className="settings-saved">
                  <FaCheckCircle />
                  Settings saved successfully
                </span>
              )}

              <button
                type="submit"
                className="settings-btn settings-btn-primary"
              >
                <FaSave />
                Save Settings
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Settings;
