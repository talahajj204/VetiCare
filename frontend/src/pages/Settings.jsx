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
  FaPen,
} from "react-icons/fa";
import { FaTiktok } from "react-icons/fa6";

const STORAGE_KEY = "storeSettings";

const DEFAULT_STORE_COLORS = {
  primaryColor: "#1aa6a6",
  secondaryColor: "#11797b",
  lightColor: "#e8f7f7",
  borderColor: "#dcebea",
  backgroundColor: "#ffffff",
  textColor: "#344054",
  buttonColor: "#1aa6a6",
  buttonTextColor: "#ffffff",
  footerColor: "#11797b",
};

const STORE_COLOR_FIELDS = [
  ["primaryColor", "Primary Color"],
  ["secondaryColor", "Secondary Color"],
  ["lightColor", "Light Color"],
  ["borderColor", "Border Color"],
  ["backgroundColor", "Background Color"],
  ["textColor", "Text Color"],
  ["buttonColor", "Button Color"],
  ["buttonTextColor", "Button Text Color"],
  ["footerColor", "Footer Color"],
];

const isValidStoreColor = (value) =>
  typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);

const OPTION_GROUPS = [
  ["appointments", "Appointments"],
  ["medicalRecords", "Medical Records"],
  ["petOwners", "Pet Owners"],
  ["vaccination", "Vaccination"],
  ["reminder", "Reminder"],
  ["medication", "Medication"],
  ["ordersSalesBilling", "Orders / Sales / Billing"],
  ["revenueExpenses", "Revenue / Expenses"],
  ["userAuditLog", "User / Audit Log"],
];

function readSettings() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const parsed = data ? JSON.parse(data) : {};

    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
}

function readOptionLists() {
  const settings = readSettings();
  const stored = settings.optionLists;
  const lists =
    stored && typeof stored === "object" && !Array.isArray(stored)
      ? stored
      : {};

  return Object.fromEntries(
    OPTION_GROUPS.map(([key]) => [
      key,
      Array.isArray(lists[key])
        ? [
            ...new Set(
              lists[key]
                .filter((value) => typeof value === "string")
                .map((value) => value.trim())
                .filter(Boolean)
            ),
          ]
        : [],
    ])
  );
}

function ImageUploader({ label, image, onChange, onRemove }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const processFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image.");
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
        accept="image/*"
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

            <p>Your image is ready to display on the store.</p>

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
          className={`settings-upload-zone ${dragging ? "dragging" : ""}`}
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
          <p>Drag and drop an image or browse your files.</p>

          <button
            type="button"
            className="settings-btn settings-btn-outline"
            onClick={() => inputRef.current?.click()}
          >
            <FaImage />
            Choose Image
          </button>
        </div>
      )}
    </div>
  );
}

function Settings() {
  const [form, setForm] = useState(readSettings);
  const [optionLists, setOptionLists] = useState(readOptionLists);
  const [optionGroup, setOptionGroup] = useState("appointments");
  const [newOption, setNewOption] = useState("");
  const [editingOption, setEditingOption] = useState(null);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("store");

  const currentOptions = optionLists[optionGroup] || [];
  const currentGroupLabel =
    OPTION_GROUPS.find(([key]) => key === optionGroup)?.[1] || "";

  const updateField = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
    setSaved(false);
  };

  const getPhoneNumbers = (settings, listKey, legacyKey) => {
    if (
      Array.isArray(settings[listKey]) &&
      settings[listKey].length > 0
    ) {
      return settings[listKey].map((value) => String(value ?? ""));
    }

    return [String(settings[legacyKey] ?? "")];
  };

  const updatePhoneNumber = (listKey, legacyKey, index, value) => {
    setForm((current) => {
      const numbers = getPhoneNumbers(current, listKey, legacyKey);
      numbers[index] = value;

      return {
        ...current,
        [listKey]: numbers,
        [legacyKey]: numbers[0] || "",
      };
    });
    setSaved(false);
  };

  const addPhoneNumber = (listKey, legacyKey) => {
    setForm((current) => ({
      ...current,
      [listKey]: [
        ...getPhoneNumbers(current, listKey, legacyKey),
        "",
      ],
    }));
    setSaved(false);
  };

  const removePhoneNumber = (listKey, legacyKey, index) => {
    setForm((current) => {
      const numbers = getPhoneNumbers(
        current,
        listKey,
        legacyKey
      ).filter((_, itemIndex) => itemIndex !== index);

      const updatedNumbers = numbers.length ? numbers : [""];

      return {
        ...current,
        [listKey]: updatedNumbers,
        [legacyKey]: updatedNumbers[0] || "",
      };
    });
    setSaved(false);
  };

  const renderPhoneNumbers = (
    label,
    listKey,
    legacyKey,
    placeholder
  ) => {
    const numbers = getPhoneNumbers(form, listKey, legacyKey);

    return (
      <div className="settings-field" key={listKey}>
        <label className="settings-label">{label}</label>

        <div className="settings-phone-list">
          {numbers.map((number, index) => (
            <div className="settings-phone-row" key={index}>
              <input
                type="tel"
                value={number}
                placeholder={placeholder}
                aria-label={`${label} ${index + 1}`}
                onChange={(event) =>
                  updatePhoneNumber(
                    listKey,
                    legacyKey,
                    index,
                    event.target.value
                  )
                }
              />

              {numbers.length > 1 && (
                <button
                  type="button"
                  className="settings-btn settings-btn-danger settings-phone-remove"
                  aria-label={`Remove ${label} ${index + 1}`}
                  title="Remove phone number"
                  onClick={() =>
                    removePhoneNumber(listKey, legacyKey, index)
                  }
                >
                  <FaTrash />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          className="settings-btn settings-btn-outline settings-phone-add"
          onClick={() => addPhoneNumber(listKey, legacyKey)}
        >
          <FaPlus />
          Add Phone Number
        </button>
      </div>
    );
  };

  const updateStoreColor = (key, value) => {
    setForm((current) => ({
      ...current,
      storeColors: {
        ...DEFAULT_STORE_COLORS,
        ...(current.storeColors || {}),
        [key]: value,
      },
    }));
    setSaved(false);
  };

  const resetStoreColors = () => {
    setForm((current) => ({
      ...current,
      storeColors: { ...DEFAULT_STORE_COLORS },
    }));
    setSaved(false);
  };

  const updateImage = (key, value) => {
    const updated = {
      ...readSettings(),
      ...form,
      [key]: value,
      optionLists,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setForm(updated);
      setSaved(false);
      window.dispatchEvent(new Event("storeSettingsUpdated"));
    } catch (error) {
      console.error("Image save error:", error);
      alert(
        "Could not save this image because browser storage is full."
      );
    }
  };

  const handleSave = (event) => {
    event.preventDefault();

    const colors = {
      ...DEFAULT_STORE_COLORS,
      ...(form.storeColors || {}),
    };

    const invalidColor = STORE_COLOR_FIELDS.some(
      ([key]) => !isValidStoreColor(colors[key])
    );

    if (invalidColor) {
      alert("Please enter valid HEX colors (example: #1aa6a6).");
      setActiveTab("colors");
      return;
    }

    const updated = {
      ...readSettings(),
      ...form,
      storeColors: colors,
      optionLists,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("storeSettingsUpdated"));
      setForm(updated);
      setSaved(true);
    } catch (error) {
      console.error("Settings save error:", error);
      alert(
        "Could not save settings because browser storage is full."
      );
    }
  };

  const changeOptionGroup = (value) => {
    setOptionGroup(value);
    setNewOption("");
    setEditingOption(null);
  };

  const saveOption = () => {
    const value = newOption.trim();
    if (!value) return;

    const duplicate = currentOptions.some(
      (option, index) =>
        index !== editingOption &&
        option.toLowerCase() === value.toLowerCase()
    );

    if (duplicate) {
      alert("This option already exists.");
      return;
    }

    setOptionLists((current) => {
      const options = [...(current[optionGroup] || [])];

      if (editingOption === null) {
        options.push(value);
      } else {
        options[editingOption] = value;
      }

      return {
        ...current,
        [optionGroup]: options,
      };
    });

    setNewOption("");
    setEditingOption(null);
    setSaved(false);
  };

  const editOption = (index) => {
    setEditingOption(index);
    setNewOption(currentOptions[index]);
  };

  const removeOption = (index) => {
    setOptionLists((current) => ({
      ...current,
      [optionGroup]: (current[optionGroup] || []).filter(
        (_, itemIndex) => itemIndex !== index
      ),
    }));

    if (editingOption === index) {
      setEditingOption(null);
      setNewOption("");
    } else if (editingOption !== null && editingOption > index) {
      setEditingOption(editingOption - 1);
    }

    setSaved(false);
  };

  const renderInput = (
    label,
    key,
    placeholder = "",
    type = "text"
  ) => (
    <div className="settings-field" key={key}>
      <label className="settings-label" htmlFor={`settings-${key}`}>
        {label}
      </label>

      <input
        id={`settings-${key}`}
        name={key}
        type={type}
        value={form[key] ?? ""}
        placeholder={placeholder}
        onChange={(event) => updateField(key, event.target.value)}
      />
    </div>
  );

  const renderTextarea = (label, key, placeholder = "") => (
    <div className="settings-field" key={key}>
      <label className="settings-label" htmlFor={`settings-${key}`}>
        {label}
      </label>

      <textarea
        id={`settings-${key}`}
        name={key}
        rows={4}
        value={form[key] ?? ""}
        placeholder={placeholder}
        readOnly={false}
        disabled={false}
        onChange={(event) => updateField(key, event.target.value)}
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
            box-shadow: 0 0 0 3px rgba(25,164,159,.07);
          }
          .settings-field input::placeholder,
          .settings-field textarea::placeholder {
            color: #a6b5bd;
          }
          .settings-row {
            display: grid;
            grid-template-columns: repeat(2,minmax(0,1fr));
            column-gap: 18px;
          }
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
            transition: .2s;
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
            transition: .18s;
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
          html body #root .settings-page .settings-timeline {
            display: grid !important;
            grid-template-columns: repeat(3,minmax(0,1fr)) !important;
            gap: 13px;
          }
          .settings-timeline-card {
            padding: 17px;
            border: 1px solid #e0edeb;
            border-radius: 12px;
            background: #f8fbfa;
          }
          html body #root .settings-page
          .settings-timeline > .settings-timeline-card {
            min-width: 0 !important;
            grid-column: auto !important;
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
          html body #root .settings-page
          .settings-about-section .settings-field textarea {
            position: relative !important;
            z-index: 1 !important;
            pointer-events: auto !important;
            user-select: text !important;
            -webkit-user-select: text !important;
            cursor: text !important;
            opacity: 1 !important;
          }
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
          html body #root .settings-page
          .settings-label.settings-social-label {
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: flex-start !important;
            gap: 8px !important;
          }
          .settings-social-label svg {
            color: #159c97;
            font-size: 15px;
            flex-shrink: 0;
          }
          .settings-phone-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
            min-width: 0;
          }
          .settings-phone-row {
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 0;
          }
          .settings-phone-row input {
            flex: 1;
            min-width: 0;
          }
          html body #root .settings-page
          .settings-phone-row > .settings-phone-remove {
            position: static !important;
            flex: 0 0 36px !important;
            width: 36px !important;
            min-width: 36px !important;
            height: 36px !important;
            padding: 0 !important;
            margin: 0 !important;
            transform: none !important;
          }
          html body #root .settings-page .settings-phone-add {
            position: static !important;
            align-self: flex-start !important;
            width: auto !important;
            margin: 0 !important;
            transform: none !important;
          }
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
          .settings-page .settings-option-select {
            width: 100% !important;
            min-width: 0 !important;
            height: 43px !important;
            padding: 0 36px 0 13px !important;
            border: 1px solid #dce7e9 !important;
            border-radius: 9px !important;
            background: #fcfdfd !important;
            color: #293f45 !important;
            font-family: inherit !important;
            font-size: 12.5px !important;
            cursor: pointer;
          }
          .settings-page .settings-option-editor {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 10px;
          }
          .settings-option-editor input {
            flex: 1 1 180px;
          }
          .settings-option-table {
            width: 100%;
            border: 1px solid #e0edeb;
            border-radius: 10px;
            overflow: hidden;
          }
          .settings-option-row {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 90px;
            align-items: center;
            gap: 12px;
            padding: 12px 14px;
            border-bottom: 1px solid #edf1f2;
            color: #40565d;
            font-size: 12.5px;
          }
          .settings-option-row:last-child {
            border-bottom: 0;
          }
          .settings-option-row > span {
            min-width: 0;
            overflow-wrap: anywhere;
          }
          .settings-option-heading {
            background: #f8fbfa;
            font-weight: 750;
          }
          .settings-option-actions {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 8px;
          }
          html body #root .settings-page .settings-option-action {
            position: static !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 30px !important;
            min-width: 30px !important;
            height: 30px !important;
            padding: 0 !important;
            margin: 0 !important;
            border: 0 !important;
            border-radius: 6px !important;
            background: transparent !important;
            color: #118f8b !important;
            transform: none !important;
            cursor: pointer !important;
          }
          html body #root .settings-page
          .settings-option-action.settings-option-delete {
            color: #c65353 !important;
          }
          html body #root .settings-page
          .settings-option-action:hover {
            background: #e8f7f5 !important;
          }
          .settings-option-empty,
          .settings-option-note {
            margin: 0;
            color: #8b9da6;
            font-size: 12px;
            line-height: 1.7;
          }
          .settings-option-empty {
            padding: 16px 14px;
          }
          .settings-option-note {
            margin-top: 14px;
          }
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
            width: auto !important;
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
          .settings-colors-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
          }
          .settings-color-item {
            min-width: 0;
            padding: 16px;
            border: 1px solid #e0edeb;
            border-radius: 12px;
            background: #f8fbfa;
          }
          .settings-color-controls {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-top: 12px;
          }
          .settings-color-picker {
            width: 55px;
            min-width: 55px;
            height: 43px;
            padding: 3px;
            border: 1px solid #dce7e9;
            border-radius: 9px;
            background: #fff;
            cursor: pointer;
          }
          .settings-color-hex {
            flex: 1;
            width: 100%;
            min-width: 0;
            height: 43px;
            padding: 10px 12px;
            border: 1px solid #dce7e9;
            border-radius: 9px;
            background: #fff;
            color: #29434a;
            font-family: inherit;
            font-size: 12px;
          }
          .settings-color-preview {
            margin-top: 20px;
            padding: 18px;
            border: 1px solid #e0edeb;
            border-radius: 12px;
          }
          .settings-color-preview button {
            width: auto !important;
            padding: 10px 16px;
            border: 0;
            border-radius: 8px;
            font-family: inherit;
            font-size: 12px;
            font-weight: 700;
          }
          @media (max-width: 700px) {
            html body #root .settings-page .settings-timeline {
              grid-template-columns: 1fr !important;
            }
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
            .settings-row,
            .settings-colors-grid {
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
        `}</style>        <div className="settings-container">
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
              activeTab === "colors" ? "active" : ""
            }`}
            onClick={() => setActiveTab("colors")}
          >
            Store Colors
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

        <form className="settings-form" onSubmit={handleSave}>
          {activeTab === "store" && (
            <>
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

                  {renderPhoneNumbers(
                    "Phone Number",
                    "phoneNumbers",
                    "phone",
                    "Enter phone number"
                  )}
                </div>

                {renderInput(
                  "Address",
                  "address",
                  "Enter store address"
                )}
              </section>

              <section className="settings-card">
                <div className="settings-card-header">
                  <h2>Store Branding</h2>
                  <p>
                    Upload the branding image displayed
                    across your store.
                  </p>
                </div>

                <ImageUploader
                  label="Store Banner"
                  image={form.storeBanner}
                  onChange={(value) =>
                    updateImage("storeBanner", value)
                  }
                  onRemove={() =>
                    updateImage("storeBanner", "")
                  }
                />
              </section>

              <section className="settings-card">
                <div className="settings-card-header">
                  <h2>Home Banner</h2>
                  <p>
                    Customize the main banner displayed
                    on your store homepage.
                  </p>
                </div>

                <ImageUploader
                  label="Home Banner Image"
                  image={form.homeBanner}
                  onChange={(value) =>
                    updateImage("homeBanner", value)
                  }
                  onRemove={() =>
                    updateImage("homeBanner", "")
                  }
                />

                <div className="settings-section-divider" />

                {renderInput(
                  "Banner Badge",
                  "homeBannerBadge",
                  "Enter banner badge"
                )}

                {renderInput(
                  "Banner Title",
                  "homeBannerTitle",
                  "Enter banner title"
                )}

                {renderTextarea(
                  "Banner Description",
                  "homeBannerDescription",
                  "Enter banner description"
                )}

                {renderInput(
                  "Button Text",
                  "homeBannerButtonText",
                  "Example: Shop Now"
                )}
              </section>
            </>
          )}

          {activeTab === "about" && (
            <section className="settings-card settings-about-section">
              <div className="settings-card-header">
                <h2>About Us</h2>
                <p>
                  Customize the content displayed on
                  your store's About Us page.
                </p>
              </div>

              {renderInput(
                "About Page Title",
                "aboutTitle",
                "Enter About Us title"
              )}

              {renderTextarea(
                "About Description",
                "aboutDescription",
                "Write your store story"
              )}

              <ImageUploader
                label="About Us Image"
                image={form.aboutImage}
                onChange={(value) =>
                  updateImage("aboutImage", value)
                }
                onRemove={() =>
                  updateImage("aboutImage", "")
                }
              />

              <div className="settings-section-divider" />

              <div className="settings-card-header">
                <h2>Our Journey</h2>
                <p>
                  Manage the three timeline sections
                  displayed on your About Us page.
                </p>
              </div>

              <div className="settings-timeline">
                <div className="settings-timeline-card">
                  <div className="settings-timeline-heading">
                    <span className="settings-timeline-number">
                      1
                    </span>
                    <h3>First Milestone</h3>
                  </div>

                  {renderInput(
                    "Title",
                    "timeline1Title",
                    "Enter title"
                  )}

                  {renderTextarea(
                    "Description",
                    "timeline1Description",
                    "Enter description"
                  )}
                </div>

                <div className="settings-timeline-card">
                  <div className="settings-timeline-heading">
                    <span className="settings-timeline-number">
                      2
                    </span>
                    <h3>Second Milestone</h3>
                  </div>

                  {renderInput(
                    "Title",
                    "timeline2Title",
                    "Enter title"
                  )}

                  {renderTextarea(
                    "Description",
                    "timeline2Description",
                    "Enter description"
                  )}
                </div>

                <div className="settings-timeline-card">
                  <div className="settings-timeline-heading">
                    <span className="settings-timeline-number">
                      3
                    </span>
                    <h3>Third Milestone</h3>
                  </div>

                  {renderInput(
                    "Title",
                    "timeline3Title",
                    "Enter title"
                  )}

                  {renderTextarea(
                    "Description",
                    "timeline3Description",
                    "Enter description"
                  )}
                </div>
              </div>
            </section>
          )}

          {activeTab === "contact" && (
            <>
              <section className="settings-card">
                <div className="settings-card-header">
                  <h2>Contact Us</h2>
                  <p>
                    Manage the contact details displayed
                    on your store's Contact Us page.
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
                    "Contact Address",
                    "contactAddress",
                    "Enter contact address"
                  )}
                </div>

                {renderTextarea(
                  "Contact Description",
                  "contactDescription",
                  "Enter contact page description"
                )}
              </section>

              <section className="settings-card">
                <div className="settings-card-header">
                  <h2>Social Media</h2>
                  <p>
                    Add your social media links so
                    customers can connect with your store.
                  </p>
                </div>

                <div className="settings-section-divider" />

                {renderInput(
                  <span className="settings-label settings-social-label">
                    <FaInstagram />
                    Instagram
                  </span>,
                  "instagram",
                  "Enter Instagram URL",
                  "url"
                )}

                {renderInput(
                  <span className="settings-label settings-social-label">
                    <FaFacebookF />
                    Facebook
                  </span>,
                  "facebook",
                  "Enter Facebook URL",
                  "url"
                )}

                {renderInput(
                  <span className="settings-label settings-social-label">
                    <FaWhatsapp />
                    WhatsApp
                  </span>,
                  "socialWhatsapp",
                  "Enter WhatsApp URL"
                )}

                {renderInput(
                  <span className="settings-label settings-social-label">
                    <FaTiktok />
                    TikTok
                  </span>,
                  "tiktok",
                  "Enter TikTok URL",
                  "url"
                )}
              </section>
            </>
          )}

          {activeTab === "colors" && (
            <section className="settings-card">
              <div className="settings-card-header">
                <h2>Store Colors</h2>
                <p>
                  Customize your store appearance.
                  Choose your colors, preview them,
                  and click Save Settings to apply changes.
                </p>
              </div>

              <div className="settings-colors-grid">
                {STORE_COLOR_FIELDS.map(([key, label]) => {
                  const value =
                    form.storeColors?.[key] ??
                    DEFAULT_STORE_COLORS[key];

                  return (
                    <div
                      className="settings-color-item"
                      key={key}
                    >
                      <label className="settings-label">
                        {label}
                        {key === "primaryColor" &&
                          " (Main brand color for highlights and icons)"}
                        {key === "secondaryColor" &&
                          " (Accent color for hover states and secondary details)"}
                        {key === "lightColor" &&
                          " (Soft backgrounds for highlighted sections)"}
                      </label>

                      <div className="settings-color-controls">
                        <input
                          className="settings-color-picker"
                          type="color"
                          aria-label={`Choose ${label}`}
                          value={
                            isValidStoreColor(value)
                              ? value
                              : DEFAULT_STORE_COLORS[key]
                          }
                          onChange={(event) =>
                            updateStoreColor(
                              key,
                              event.target.value
                            )
                          }
                        />

                        <input
                          className="settings-color-hex"
                          type="text"
                          aria-label={`${label} HEX value`}
                          value={value}
                          maxLength={7}
                          placeholder="#000000"
                          onChange={(event) =>
                            updateStoreColor(
                              key,
                              event.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  flexWrap: "wrap",
                  gap: 12,
                  marginTop: 23,
                }}
              >
                <button
                  type="button"
                  className="settings-btn settings-btn-outline"
                  onClick={resetStoreColors}
                >
                  Default Colors
                </button>
              </div>
            </section>
          )}

          {activeTab === "options" && (
            <section className="settings-card">
              <div className="settings-card-header">
                <h2>Option List</h2>
                <p>
                  Manage options for each page or group.
                </p>
              </div>

              <div className="settings-field">
                <label
                  className="settings-label"
                  htmlFor="settings-option-group"
                >
                  Page / Group
                </label>

                <select
                  id="settings-option-group"
                  className="settings-option-select"
                  value={optionGroup}
                  onChange={(event) =>
                    changeOptionGroup(event.target.value)
                  }
                >
                  {OPTION_GROUPS.map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="settings-field">
                <label
                  className="settings-label"
                  htmlFor="settings-option-name"
                >
                  Option name
                </label>

                <div className="settings-option-editor">
                  <input
                    id="settings-option-name"
                    type="text"
                    value={newOption}
                    placeholder="Enter an option..."
                    onChange={(event) =>
                      setNewOption(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        saveOption();
                      }
                    }}
                  />

                  <button
                    type="button"
                    className="settings-btn settings-btn-primary"
                    onClick={saveOption}
                  >
                    {editingOption === null ? (
                      <FaPlus />
                    ) : (
                      <FaCheckCircle />
                    )}
                    {editingOption === null ? "Add" : "Update"}
                  </button>

                  {editingOption !== null && (
                    <button
                      type="button"
                      className="settings-btn settings-btn-outline"
                      onClick={() => {
                        setEditingOption(null);
                        setNewOption("");
                      }}
                    >
                      <FaTimes />
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div className="settings-option-table">
                <div className="settings-option-row settings-option-heading">
                  <span>Option</span>
                  <span style={{ textAlign: "right" }}>
                    Actions
                  </span>
                </div>

                {currentOptions.length > 0 ? (
                  currentOptions.map((option, index) => (
                    <div
                      className="settings-option-row"
                      key={`${optionGroup}-${option}`}
                    >
                      <span>{option}</span>

                      <div className="settings-option-actions">
                        <button
                          type="button"
                          className="settings-option-action"
                          aria-label={`Edit ${option}`}
                          title="Edit option"
                          onClick={() => editOption(index)}
                        >
                          <FaPen />
                        </button>

                        <button
                          type="button"
                          className="settings-option-action settings-option-delete"
                          aria-label={`Delete ${option}`}
                          title="Delete option"
                          onClick={() => removeOption(index)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="settings-option-empty">
                    No options added yet.
                  </p>
                )}
              </div>

              <p className="settings-option-note">
                {optionGroup === "ordersSalesBilling"
                  ? "This list is shared by Orders, Sales, and Billing."
                  : optionGroup === "revenueExpenses"
                    ? "This list is shared by Revenue and Expenses."
                    : optionGroup === "userAuditLog"
                      ? "This list is shared by User and Audit Log."
                      : `Options for ${currentGroupLabel}.`}{" "}
                Click Save Settings to save your changes.
              </p>
            </section>
          )}

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