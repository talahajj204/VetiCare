import { useEffect, useRef, useState } from "react";
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

import {
  getClinicOptions,
  createClinicOption,
  updateClinicOption,
} from "../data/clinicOptionsApi";

import {
  getAdminStoreSettings,
  updateStoreSettings,
} from "../api/storeSettingsApi";

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
  typeof value === "string" &&
  /^#[0-9a-fA-F]{6}$/.test(value);

const OPTION_PAGES = [
  {
    key: "appointments",
    label: "Appointments",
    fields: [
      {
        key: "appointments.statuses",
        label: "Status",
        placeholder: "Enter an appointment status...",
      },
      {
        key: "appointments.types",
        label: "Type",
        placeholder: "Enter an appointment type...",
      },
    ],
  },
  {
    key: "medicalRecords",
    label: "Medical Records",
    fields: [
      {
        key: "medicalRecords",
        label: "Options",
        placeholder: "Enter a medical record option...",
      },
    ],
  },
  {
    key: "petOwners",
    label: "Pet Owners",
    fields: [
      {
        key: "petOwners",
        label: "Options",
        placeholder: "Enter a pet owner option...",
      },
    ],
  },
  {
    key: "vaccinations",
    label: "Vaccinations",
    fields: [
      {
        key: "vaccination.vaccineNames",
        label: "Vaccine Name",
        placeholder: "Enter a vaccine name...",
      },
      {
        key: "vaccination.statuses",
        label: "Status",
        placeholder: "Enter a vaccination status...",
      },
    ],
  },
  {
    key: "reminders",
    label: "Reminders",
    fields: [
      {
        key: "reminder.types",
        label: "Type",
        placeholder: "Enter a reminder type...",
      },
      {
        key: "reminder.statuses",
        label: "Status",
        placeholder: "Enter a reminder status...",
      },
    ],
  },
  {
    key: "medication",
    label: "Medication",
    fields: [
      {
        key: "medication",
        label: "Options",
        placeholder: "Enter a medication option...",
      },
    ],
  },
  {
    key: "ordersSalesBilling",
    label: "Orders / Sales / Billing",
    fields: [
      {
        key: "ordersSalesBilling",
        label: "Status",
        placeholder: "Enter an option...",
      },
      {
        key: "pos.paymentMethods",
        label: "Payment Method",
        placeholder: "Enter a payment method...",
      },
    ],
  },
  {
    key: "billing",
    label: "Billing",
    fields: [
      {
        key: "billing.statuses",
        label: "Status",
        placeholder: "Enter a billing status...",
      },
      {
        key: "billing.consultations",
        label: "Consultation",
        placeholder: "Enter a consultation option...",
      },
    ],
  },
  {
    key: "revenueExpenses",
    label: "Revenue / Expenses",
    fields: [
      {
        key: "revenueExpenses",
        label: "Options",
        placeholder: "Enter a financial option...",
      },
    ],
  },
  {
    key: "userAuditLog",
    label: "User / Audit Log",
    fields: [
      {
        key: "userAuditLog",
        label: "Options",
        placeholder: "Enter a user or audit log option...",
      },
    ],
  },
  {
    key: "users",
    label: "Users",
    fields: [
      {
        key: "users.roles",
        label: "Role",
        placeholder: "Enter a staff role...",
      },
    ],
  },
];

const LEGACY_OPTION_FIELDS = [
  { key: "appointments", label: "Appointments" },
  { key: "vaccination", label: "Vaccination" },
  { key: "reminder", label: "Reminder" },
];

const STORE_STRING_FIELDS = [
  "storeName",
  "storeDescription",
  "email",
  "phone",
  "address",
  "storeBanner",
  "homeBanner",
  "homeBannerBadge",
  "homeBannerTitle",
  "homeBannerDescription",
  "homeBannerButtonText",
  "aboutTitle",
  "aboutDescription",
  "aboutImage",
  "timeline1Title",
  "timeline1Description",
  "timeline2Title",
  "timeline2Description",
  "timeline3Title",
  "timeline3Description",
  "contactEmail",
  "contactAddress",
  "contactDescription",
  "instagram",
  "facebook",
  "socialWhatsapp",
  "tiktok",
];

function compareValue(value) {
  return String(value ?? "").trim().toLowerCase();
}

function sortRecords(records) {
  return [...records].sort(
    (a, b) =>
      a.listKey.localeCompare(b.listKey) ||
      a.sortOrder - b.sortOrder ||
      a.id - b.id
  );
}

function ImageUploader({
  label,
  image,
  onChange,
  onRemove,
  disabled = false,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const processFile = (file) => {
    if (!file || disabled) return;

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/gif",
      "image/avif",
    ];

    if (!allowedTypes.includes(file.type)) {
      window.alert(
        "Please select a PNG, JPEG, WebP, GIF or AVIF image."
      );
      return;
    }

    if (file.size > 2_900_000) {
      window.alert(
        "Please select an image smaller than 2.9 MB."
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        onChange(reader.result);
      }
    };

    reader.onerror = () => {
      window.alert("Could not read this image.");
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
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        style={{ display: "none" }}
        tabIndex={-1}
        disabled={disabled}
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
              Image selected
            </span>

            <p>Click Save Settings to apply your changes.</p>

            <button
              type="button"
              className="settings-btn settings-btn-danger"
              onClick={onRemove}
              disabled={disabled}
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
            if (!disabled) setDragging(true);
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
            disabled={disabled}
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
  const [form, setForm] = useState({
    storeColors: { ...DEFAULT_STORE_COLORS },
  });

  const [settingsReady, setSettingsReady] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [optionRecords, setOptionRecords] = useState([]);
  const [optionsReady, setOptionsReady] = useState(false);
  const [optionsError, setOptionsError] = useState("");

  const [optionPage, setOptionPage] =
    useState("appointments");
  const [optionGroup, setOptionGroup] =
    useState("appointments.statuses");

  const [newOption, setNewOption] = useState("");
  const [editingOption, setEditingOption] = useState(null);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("store");

  const serverRecordsRef = useRef([]);
  const savingRef = useRef(false);
  const temporaryIdRef = useRef(-1);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const loadSettings = async () => {
      try {
        const settings = await getAdminStoreSettings({
          signal: controller.signal,
        });

        if (!active || controller.signal.aborted) return;

        setForm(settings);
        setSettingsError("");
        setSettingsReady(true);
      } catch (error) {
        if (!active || controller.signal.aborted) return;

        setSettingsReady(false);
        setSettingsError(
          error.message || "Could not load store settings."
        );
      }
    };

    const loadOptions = async () => {
      try {
        const records = await getClinicOptions({
          includeInactive: true,
          signal: controller.signal,
        });

        if (!active || controller.signal.aborted) return;

        if (
          !Array.isArray(records) ||
          records.some(
            (item) =>
              !Number.isInteger(item.id) ||
              typeof item.listKey !== "string" ||
              typeof item.value !== "string" ||
              typeof item.isActive !== "boolean" ||
              !Number.isInteger(item.sortOrder)
          )
        ) {
          throw new Error(
            "The server returned invalid option data."
          );
        }

        serverRecordsRef.current =
          records.map((item) => ({ ...item }));

        setOptionRecords(sortRecords(records));
        setOptionsError("");
        setOptionsReady(true);
      } catch (error) {
        if (!active || controller.signal.aborted) return;

        setOptionsError(
          error.message || "Could not load option lists."
        );
      }
    };

    void Promise.allSettled([
      loadSettings(),
      loadOptions(),
    ]);

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const optionLists = {};

  optionRecords.forEach((record) => {
    if (!record.isActive) return;

    if (!optionLists[record.listKey]) {
      optionLists[record.listKey] = [];
    }

    optionLists[record.listKey].push(record.value);
  });

  const knownFieldKeys = new Set(
    OPTION_PAGES.flatMap((page) =>
      page.fields.map((field) => field.key)
    )
  );

  const legacyLabelByKey = Object.fromEntries(
    LEGACY_OPTION_FIELDS.map((field) => [
      field.key,
      field.label,
    ])
  );

  const legacyFields = Object.keys(optionLists)
    .filter(
      (key) =>
        !knownFieldKeys.has(key) &&
        optionLists[key].length > 0
    )
    .map((key) => ({
      key,
      label: legacyLabelByKey[key] || key,
      placeholder: "Enter an option...",
    }));

  const availablePages = [
    ...OPTION_PAGES,
    ...(legacyFields.length > 0
      ? [{
          key: "previousOptions",
          label: "Previous Unsorted Lists",
          fields: legacyFields,
        }]
      : []),
  ];

  const currentPage =
    availablePages.find(
      (page) => page.key === optionPage
    ) || OPTION_PAGES[0];

  const currentField =
    currentPage.fields.find(
      (field) => field.key === optionGroup
    ) || currentPage.fields[0];

  const currentOptionKey = currentField.key;

  const currentOptionRecords = optionRecords.filter(
    (record) =>
      record.listKey === currentOptionKey &&
      record.isActive
  );

  const currentOptions = currentOptionRecords.map(
    (record) => record.value
  );

  const currentGroupLabel =
    `${currentPage.label} / ${currentField.label}`;

  const updateField = (key, value) => {
    if (savingRef.current || !settingsReady) return;

    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setSaved(false);
  };

  const getPhoneNumbers = (
    settings,
    listKey,
    legacyKey
  ) => {
    if (
      Array.isArray(settings[listKey]) &&
      settings[listKey].length > 0
    ) {
      return settings[listKey].map((value) =>
        String(value ?? "")
      );
    }

    return [String(settings[legacyKey] ?? "")];
  };

  const updatePhoneNumber = (
    listKey,
    legacyKey,
    index,
    value
  ) => {
    if (savingRef.current || !settingsReady) return;

    setForm((current) => {
      const numbers = getPhoneNumbers(
        current,
        listKey,
        legacyKey
      );

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
    if (savingRef.current || !settingsReady) return;

    const numbers = getPhoneNumbers(
      form,
      listKey,
      legacyKey
    );

    if (numbers.length >= 10) {
      window.alert("You can add up to 10 phone numbers.");
      return;
    }

    setForm((current) => ({
      ...current,
      [listKey]: [
        ...getPhoneNumbers(current, listKey, legacyKey),
        "",
      ],
    }));

    setSaved(false);
  };

  const removePhoneNumber = (
    listKey,
    legacyKey,
    index
  ) => {
    if (savingRef.current || !settingsReady) return;

    setForm((current) => {
      const numbers = getPhoneNumbers(
        current,
        listKey,
        legacyKey
      ).filter((_, itemIndex) => itemIndex !== index);

      const updated = numbers.length ? numbers : [""];

      return {
        ...current,
        [listKey]: updated,
        [legacyKey]: updated[0] || "",
      };
    });

    setSaved(false);
  };

  const renderPhoneNumbers = (
    label,
    listKey,
    legacyKey,
    placeholder
  ) => (
    <div className="settings-field" key={listKey}>
      <label className="settings-label">{label}</label>

      <div className="settings-phone-list">
        {getPhoneNumbers(form, listKey, legacyKey).map(
          (number, index, numbers) => (
            <div className="settings-phone-row" key={index}>
              <input
                type="tel"
                value={number}
                maxLength={50}
                placeholder={placeholder}
                disabled={!settingsReady || isSaving}
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
                  disabled={!settingsReady || isSaving}
                  onClick={() =>
                    removePhoneNumber(
                      listKey,
                      legacyKey,
                      index
                    )
                  }
                >
                  <FaTrash />
                </button>
              )}
            </div>
          )
        )}
      </div>

      <button
        type="button"
        className="settings-btn settings-btn-outline settings-phone-add"
        disabled={!settingsReady || isSaving}
        onClick={() => addPhoneNumber(listKey, legacyKey)}
      >
        <FaPlus />
        Add Phone Number
      </button>
    </div>
  );

  const updateStoreColor = (key, value) => {
    if (savingRef.current || !settingsReady) return;

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
    if (savingRef.current || !settingsReady) return;

    setForm((current) => ({
      ...current,
      storeColors: { ...DEFAULT_STORE_COLORS },
    }));

    setSaved(false);
  };

  const updateImage = (key, value) => {
    updateField(key, value);
  };

  const ensureOptionsReady = () => {
    if (savingRef.current) return false;

    if (!optionsReady) {
      window.alert(
        optionsError ||
          "Option lists are still loading. Please wait."
      );
      return false;
    }

    return true;
  };

  const changeOptionPage = (pageKey) => {
    if (savingRef.current) return;

    const page = availablePages.find(
      (item) => item.key === pageKey
    );

    if (!page) return;

    setOptionPage(page.key);
    setOptionGroup(page.fields[0].key);
    setNewOption("");
    setEditingOption(null);
  };

  const changeOptionGroup = (fieldKey) => {
    if (
      savingRef.current ||
      !currentPage.fields.some(
        (field) => field.key === fieldKey
      )
    ) {
      return;
    }

    setOptionGroup(fieldKey);
    setNewOption("");
    setEditingOption(null);
  };

  const saveOption = () => {
    if (!ensureOptionsReady()) return;

    const value = newOption.trim();
    if (!value) return;

    const maxLength =
      currentOptionKey === "vaccination.vaccineNames" ||
      ["appointments", "vaccination", "reminder"].includes(
        currentOptionKey
      )
        ? 200
        : 100;

    if (value.length > maxLength) {
      window.alert(
        `This option must not exceed ${maxLength} characters.`
      );
      return;
    }

    const editingRecord =
      editingOption === null
        ? null
        : currentOptionRecords[editingOption];

    if (editingOption !== null && !editingRecord) {
      setEditingOption(null);
      setNewOption("");
      return;
    }

    const duplicate = optionRecords.some(
      (record) =>
        record.listKey === currentOptionKey &&
        record.isActive &&
        record.id !== editingRecord?.id &&
        compareValue(record.value) === compareValue(value)
    );

    if (duplicate) {
      window.alert("This option already exists.");
      return;
    }

    if (editingRecord) {
      setOptionRecords((current) =>
        current.map((record) =>
          record.id === editingRecord.id
            ? { ...record, value }
            : record
        )
      );
    } else {
      const inactiveRecord = optionRecords.find(
        (record) =>
          record.listKey === currentOptionKey &&
          !record.isActive &&
          compareValue(record.value) === compareValue(value)
      );

      const nextSortOrder =
        Math.max(
          -1,
          ...currentOptionRecords.map(
            (record) => record.sortOrder
          )
        ) + 1;

      if (inactiveRecord) {
        setOptionRecords((current) => [
          ...current.filter(
            (record) => record.id !== inactiveRecord.id
          ),
          {
            ...inactiveRecord,
            value,
            isActive: true,
            sortOrder: nextSortOrder,
          },
        ]);
      } else {
        const temporaryId = temporaryIdRef.current--;

        setOptionRecords((current) => [
          ...current,
          {
            id: temporaryId,
            listKey: currentOptionKey,
            value,
            sortOrder: nextSortOrder,
            isActive: true,
          },
        ]);
      }
    }

    setNewOption("");
    setEditingOption(null);
    setSaved(false);
  };

  const editOption = (index) => {
    if (!ensureOptionsReady()) return;

    setEditingOption(index);
    setNewOption(currentOptions[index]);
  };

  const removeOption = (index) => {
    if (!ensureOptionsReady()) return;

    const target = currentOptionRecords[index];
    if (!target) return;

    setOptionRecords((current) =>
      target.id < 0
        ? current.filter(
            (record) => record.id !== target.id
          )
        : current.map((record) =>
            record.id === target.id
              ? { ...record, isActive: false }
              : record
          )
    );

    if (editingOption === index) {
      setEditingOption(null);
      setNewOption("");
    } else if (
      editingOption !== null &&
      editingOption > index
    ) {
      setEditingOption(editingOption - 1);
    }

    setSaved(false);
  };

  const rememberSavedRecord = (record, previousId) => {
    serverRecordsRef.current = [
      ...serverRecordsRef.current.filter(
        (item) => item.id !== record.id
      ),
      { ...record },
    ];

    setOptionRecords((current) =>
      current.map((item) =>
        item.id === previousId
          ? { ...record }
          : item
      )
    );
  };

  const persistOptionLists = async () => {
    const draft = optionRecords.map(
      (record) => ({ ...record })
    );

    const originalById = new Map(
      serverRecordsRef.current.map(
        (record) => [record.id, record]
      )
    );

    const changed = draft.filter((record) => {
      if (record.id < 0) return record.isActive;

      const original = originalById.get(record.id);

      return (
        !original ||
        original.value !== record.value ||
        original.sortOrder !== record.sortOrder ||
        original.isActive !== record.isActive
      );
    });

    changed.sort(
      (a, b) => Number(a.isActive) - Number(b.isActive)
    );

    let completed = 0;

    try {
      for (const record of changed) {
        const payload = {
          value: record.value,
          sortOrder: record.sortOrder,
          isActive: record.isActive,
        };

        const savedRecord =
          record.id > 0
            ? await updateClinicOption(record.id, payload)
            : await createClinicOption({
                ...payload,
                listKey: record.listKey,
              });

        rememberSavedRecord(savedRecord, record.id);
        completed += 1;
      }
    } catch (error) {
      throw new Error(
        completed > 0
          ? `Some option changes were saved, but the rest failed. ${
              error.message || "Please try again."
            } Your remaining changes are still on this page.`
          : error.message || "Could not save option lists."
      );
    } finally {
      if (completed > 0) {
        window.dispatchEvent(
          new Event("clinicOptionsUpdated")
        );
      }
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (savingRef.current) return;

    if (!settingsReady) {
      window.alert(
        settingsError ||
          "Store settings are still loading. Please wait."
      );
      return;
    }

    const colors = {
      ...DEFAULT_STORE_COLORS,
      ...(form.storeColors || {}),
    };

    if (
      STORE_COLOR_FIELDS.some(
        ([key]) => !isValidStoreColor(colors[key])
      )
    ) {
      window.alert(
        "Please enter valid HEX colors (example: #1aa6a6)."
      );
      setActiveTab("colors");
      return;
    }

    if (activeTab === "options" && !optionsReady) {
      window.alert(
        optionsError ||
          "Option lists are still loading. Please wait."
      );
      return;
    }

    const payload = Object.fromEntries(
      STORE_STRING_FIELDS.map((key) => [
        key,
        String(form[key] ?? "").trim(),
      ])
    );

    payload.phoneNumbers = getPhoneNumbers(
      form,
      "phoneNumbers",
      "phone"
    )
      .map((phone) => String(phone).trim())
      .filter(Boolean);

    payload.phone =
      payload.phoneNumbers[0] || payload.phone;

    payload.storeColors = colors;

    savingRef.current = true;
    setIsSaving(true);
    setSaved(false);

    let storeSaved = false;

    try {
      const result = await updateStoreSettings(payload);

      storeSaved = true;
      setForm(result);

      window.dispatchEvent(
        new Event("storeSettingsUpdated")
      );

      if (optionsReady) {
        await persistOptionLists();
      }

      setSaved(true);
    } catch (error) {
      const message =
        error.message || "Could not save settings.";

      window.alert(
        storeSaved
          ? `Store settings were saved, but some option changes could not be saved. ${message}`
          : message
      );
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  const renderInput = (
    label,
    key,
    placeholder = "",
    type = "text"
  ) => (
    <div className="settings-field" key={key}>
      <label
        className="settings-label"
        htmlFor={`settings-${key}`}
      >
        {label}
      </label>

      <input
        id={`settings-${key}`}
        name={key}
        type={type}
        value={form[key] ?? ""}
        placeholder={placeholder}
        disabled={!settingsReady || isSaving}
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
      <label
        className="settings-label"
        htmlFor={`settings-${key}`}
      >
        {label}
      </label>

      <textarea
        id={`settings-${key}`}
        name={key}
        rows={4}
        value={form[key] ?? ""}
        placeholder={placeholder}
        disabled={!settingsReady || isSaving}
        onChange={(event) =>
          updateField(key, event.target.value)
        }
      />
    </div>
  );  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main settings-page">
        <style>{`
          .settings-page {
            min-height:100vh;
            padding:32px 38px 65px;
            background:#f6f9f9;
            color:#283f43;
            font-family:inherit;
          }

          .settings-page *,
          .settings-page *::before,
          .settings-page *::after {
            box-sizing:border-box;
          }

          .settings-container {
            width:100%;
            max-width:1120px;
            margin:0 auto;
          }

          .settings-page-header {
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:16px;
            margin-bottom:26px;
          }

          .settings-page-header h1 {
            margin:0 0 7px;
            font-size:28px;
            font-weight:800;
            letter-spacing:-.8px;
            color:#263f45;
          }

          .settings-page-header p {
            margin:0;
            font-size:13px;
            line-height:1.7;
            color:#84969b;
          }

          .settings-header-icon {
            width:46px;
            height:46px;
            display:flex;
            align-items:center;
            justify-content:center;
            border-radius:14px;
            background:#e3f5f2;
            color:#159b97;
            font-size:19px;
            flex-shrink:0;
          }

          .settings-form {
            display:flex;
            flex-direction:column;
            gap:20px;
          }

          .settings-card {
            padding:26px 28px;
            background:#fff;
            border:1px solid #e5ecee;
            border-radius:17px;
            box-shadow:0 3px 18px rgba(24,58,64,.025);
          }

          .settings-card-header { margin-bottom:23px; }

          .settings-card-header h2 {
            margin:0 0 7px;
            font-size:17px;
            font-weight:800;
            letter-spacing:-.35px;
            color:#29414b;
          }

          .settings-card-header p {
            margin:0;
            font-size:12px;
            line-height:1.7;
            color:#8b9da6;
          }

          .settings-section-divider {
            height:1px;
            background:#edf1f2;
            margin:25px 0;
          }

          .settings-field {
            display:flex;
            flex-direction:column;
            gap:8px;
            min-width:0;
            margin-bottom:18px;
          }

          .settings-field:last-child { margin-bottom:0; }

          .settings-label {
            display:block;
            font-size:12px;
            font-weight:750;
            color:#40565d;
          }

          .settings-field input:not([type="file"]),
          .settings-field textarea {
            width:100%;
            min-width:0;
            border:1px solid #dce7e9;
            border-radius:9px;
            padding:11px 13px;
            background:#fcfdfd;
            color:#293f45;
            font-family:inherit;
            font-size:12.5px;
            outline:none;
            transition:.2s ease;
          }

          .settings-field input:not([type="file"]) {
            height:43px;
          }

          .settings-field textarea {
            min-height:98px;
            resize:vertical;
            line-height:1.65;
          }

          .settings-field input:focus,
          .settings-field textarea:focus {
            border-color:#19a49f;
            background:#fff;
            box-shadow:0 0 0 3px rgba(25,164,159,.07);
          }

          .settings-field input::placeholder,
          .settings-field textarea::placeholder {
            color:#a6b5bd;
          }

          .settings-row {
            display:grid;
            grid-template-columns:repeat(2,minmax(0,1fr));
            column-gap:18px;
          }

          .settings-page input.settings-native-file,
          .settings-page input[type="file"] {
            display:none!important;
            position:absolute!important;
            width:0!important;
            height:0!important;
            opacity:0!important;
            pointer-events:none!important;
          }

          .settings-upload-zone {
            min-height:155px;
            padding:22px;
            border:1.5px dashed #9ad8d3;
            border-radius:12px;
            background:#f5fbfa;
            display:flex;
            flex-direction:column;
            justify-content:center;
            align-items:center;
            gap:8px;
            text-align:center;
            transition:.2s;
          }

          .settings-upload-zone.dragging {
            background:#e7f7f4;
            border-color:#119e98;
          }

          .settings-upload-icon {
            width:36px;
            height:36px;
            display:flex;
            align-items:center;
            justify-content:center;
            border-radius:10px;
            background:#e0f4f1;
            color:#149e99;
            font-size:18px;
          }

          .settings-upload-zone strong {
            font-size:12px;
            font-weight:750;
            color:#385660;
          }

          .settings-upload-zone p {
            margin:0;
            font-size:11px;
            color:#8ca2aa;
          }

          .settings-image-preview {
            min-height:150px;
            display:flex;
            align-items:center;
            gap:24px;
            padding:18px;
            border:1px solid #dcece9;
            border-radius:12px;
            background:#f7fbfa;
          }

          .settings-preview-picture {
            width:170px;
            height:120px;
            flex-shrink:0;
            display:flex;
            align-items:center;
            justify-content:center;
            border-radius:10px;
            overflow:hidden;
            background:#e9f3f2;
          }

          .settings-preview-picture img {
            display:block;
            width:100%;
            height:100%;
            object-fit:contain;
          }

          .settings-preview-details {
            display:flex;
            flex-direction:column;
            align-items:flex-start;
            gap:9px;
            min-width:0;
          }

          .settings-image-status {
            display:inline-flex;
            align-items:center;
            gap:7px;
            font-size:12px;
            font-weight:750;
            color:#139879;
          }

          .settings-preview-details p {
            margin:0;
            font-size:11px;
            color:#879da3;
            line-height:1.5;
          }

          .settings-btn {
            display:inline-flex;
            align-items:center;
            justify-content:center;
            gap:7px;
            width:auto!important;
            min-width:0;
            min-height:34px;
            padding:8px 13px;
            border-radius:8px;
            border:1px solid transparent;
            font-family:inherit;
            font-size:11.5px;
            font-weight:750;
            line-height:1.2;
            white-space:nowrap;
            cursor:pointer;
            transition:.18s;
          }

          .settings-btn svg { font-size:11px; }

          .settings-btn-primary {
            color:white;
            background:#159d99;
            border-color:#159d99;
          }

          .settings-btn-primary:hover:not(:disabled) {
            background:#0d8581;
          }

          .settings-btn-outline {
            background:#fff;
            color:#118f8b;
            border-color:#bce0dc;
          }

          .settings-btn-outline:hover:not(:disabled) {
            background:#e8f7f5;
          }

          .settings-btn-danger {
            color:#c65353;
            background:#fff;
            border-color:#f0cece;
          }

          .settings-btn-danger:hover:not(:disabled) {
            background:#fff0f0;
          }

          .settings-page button:disabled,
          .settings-page input:disabled,
          .settings-page textarea:disabled,
          .settings-page select:disabled {
            cursor:not-allowed;
          }

          .settings-page button:disabled { opacity:.55; }

          html body #root .settings-page .settings-timeline {
            display:grid!important;
            grid-template-columns:repeat(3,minmax(0,1fr))!important;
            gap:13px;
          }

          .settings-timeline-card {
            padding:17px;
            border:1px solid #e0edeb;
            border-radius:12px;
            background:#f8fbfa;
          }

          html body #root .settings-page
          .settings-timeline > .settings-timeline-card {
            min-width:0!important;
            grid-column:auto!important;
          }

          .settings-timeline-heading {
            display:flex;
            align-items:center;
            gap:9px;
            margin-bottom:16px;
          }

          .settings-timeline-number {
            width:28px;
            height:28px;
            flex-shrink:0;
            display:flex;
            align-items:center;
            justify-content:center;
            border-radius:8px;
            background:#ddf3ef;
            color:#15958f;
            font-size:12px;
            font-weight:800;
          }

          .settings-timeline-heading h3 {
            margin:0;
            font-size:12px;
            font-weight:800;
            color:#38555b;
          }

          .settings-timeline-card .settings-field {
            margin-bottom:14px;
          }

          .settings-timeline-card .settings-field:last-child {
            margin-bottom:0;
          }

          .settings-timeline-card textarea { min-height:90px; }

          html body #root .settings-page
          .settings-about-section .settings-field textarea {
            position:relative!important;
            z-index:1!important;
            pointer-events:auto!important;
            user-select:text!important;
            -webkit-user-select:text!important;
            opacity:1!important;
          }

          html body #root .settings-page
          .settings-label.settings-social-label {
            display:flex!important;
            flex-direction:row!important;
            align-items:center!important;
            justify-content:flex-start!important;
            gap:8px!important;
          }

          .settings-social-label svg {
            color:#159c97;
            font-size:15px;
            flex-shrink:0;
          }

          .settings-phone-list {
            display:flex;
            flex-direction:column;
            gap:8px;
            min-width:0;
          }

          .settings-phone-row {
            display:flex;
            align-items:center;
            gap:8px;
            min-width:0;
          }

          .settings-phone-row input { flex:1; min-width:0; }

          html body #root .settings-page
          .settings-phone-row > .settings-phone-remove {
            position:static!important;
            flex:0 0 36px!important;
            width:36px!important;
            min-width:36px!important;
            height:36px!important;
            padding:0!important;
            margin:0!important;
            transform:none!important;
          }

          html body #root .settings-page .settings-phone-add {
            position:static!important;
            align-self:flex-start!important;
            width:auto!important;
            margin:0!important;
            transform:none!important;
          }

          .settings-page .settings-option-select {
            width:100%!important;
            min-width:0!important;
            height:43px!important;
            padding:0 36px 0 13px!important;
            border:1px solid #dce7e9!important;
            border-radius:9px!important;
            background:#fcfdfd!important;
            color:#293f45!important;
            font-family:inherit!important;
            font-size:12.5px!important;
            cursor:pointer;
          }

          .settings-page .settings-option-editor {
            display:flex;
            flex-wrap:wrap;
            align-items:center;
            gap:10px;
          }

          .settings-option-editor input { flex:1 1 180px; }

          .settings-option-table {
            width:100%;
            border:1px solid #e0edeb;
            border-radius:10px;
            overflow:hidden;
          }

          .settings-option-row {
            display:grid;
            grid-template-columns:minmax(0,1fr) 90px;
            align-items:center;
            gap:12px;
            padding:12px 14px;
            border-bottom:1px solid #edf1f2;
            color:#40565d;
            font-size:12.5px;
          }

          .settings-option-row:last-child { border-bottom:0; }

          .settings-option-row > span {
            min-width:0;
            overflow-wrap:anywhere;
          }

          .settings-option-heading {
            background:#f8fbfa;
            font-weight:750;
          }

          .settings-option-actions {
            display:flex;
            align-items:center;
            justify-content:flex-end;
            gap:8px;
          }

          html body #root .settings-page .settings-option-action {
            position:static!important;
            display:inline-flex!important;
            align-items:center!important;
            justify-content:center!important;
            width:30px!important;
            min-width:30px!important;
            height:30px!important;
            padding:0!important;
            margin:0!important;
            border:0!important;
            border-radius:6px!important;
            background:transparent!important;
            color:#118f8b!important;
            transform:none!important;
            cursor:pointer;
          }

          html body #root .settings-page
          .settings-option-action.settings-option-delete {
            color:#c65353!important;
          }

          html body #root .settings-page
          .settings-option-action:hover:not(:disabled) {
            background:#e8f7f5!important;
          }

          .settings-option-empty,
          .settings-option-note {
            margin:0;
            color:#8b9da6;
            font-size:12px;
            line-height:1.7;
          }

          .settings-option-empty { padding:16px 14px; }
          .settings-option-note { margin-top:14px; }

          .settings-option-selectors {
            display:grid;
            grid-template-columns:repeat(2,minmax(0,1fr));
            gap:18px;
            margin-bottom:18px;
          }

          .settings-option-selectors .settings-field {
            margin-bottom:0;
          }

          .settings-save-bar {
            display:flex;
            justify-content:flex-end;
            align-items:center;
            flex-wrap:wrap;
            gap:15px;
            padding:5px 0 30px;
          }

          .settings-saved {
            display:inline-flex;
            align-items:center;
            gap:7px;
            color:#159879;
            font-size:12px;
            font-weight:700;
          }

          .settings-save-bar .settings-btn {
            min-height:38px;
            padding:10px 18px;
            font-size:12px;
          }

          .settings-tabs {
            display:flex;
            align-items:center;
            flex-wrap:wrap;
            gap:10px;
            margin-bottom:24px;
            padding-bottom:14px;
            border-bottom:1px solid #e5ecee;
          }

          .settings-tab {
            width:auto!important;
            min-height:39px;
            padding:9px 16px;
            border:1px solid #dce7e9;
            border-radius:9px;
            background:#fff;
            color:#40565d;
            font-family:inherit;
            font-size:12px;
            font-weight:700;
            cursor:pointer;
            transition:.18s ease;
          }

          .settings-tab:hover { background:#f0f9f7; }

          .settings-tab.active {
            background:#159d99;
            border-color:#159d99;
            color:#fff;
          }

          .settings-colors-grid {
            display:grid;
            grid-template-columns:repeat(2,minmax(0,1fr));
            gap:16px;
          }

          .settings-color-item {
            min-width:0;
            padding:16px;
            border:1px solid #e0edeb;
            border-radius:12px;
            background:#f8fbfa;
          }

          .settings-color-controls {
            display:flex;
            align-items:center;
            gap:12px;
            margin-top:12px;
          }

          .settings-color-picker {
            width:55px;
            min-width:55px;
            height:43px;
            padding:3px;
            border:1px solid #dce7e9;
            border-radius:9px;
            background:#fff;
            cursor:pointer;
          }

          .settings-color-hex {
            flex:1;
            width:100%;
            min-width:0;
            height:43px;
            padding:10px 12px;
            border:1px solid #dce7e9;
            border-radius:9px;
            background:#fff;
            color:#29434a;
            font-family:inherit;
            font-size:12px;
          }

          .settings-load-message {
            padding:12px 15px;
            margin-bottom:20px;
            border:1px solid #dcece9;
            border-radius:9px;
            background:#edf8f6;
            color:#237e7a;
            font-size:12px;
            line-height:1.6;
          }

          .settings-load-message.error {
            background:#fff1f0;
            color:#b42318;
            border-color:#f0cece;
          }

          @media(max-width:700px) {
            html body #root .settings-page .settings-timeline {
              grid-template-columns:1fr!important;
            }

            .settings-page { padding:18px 14px 45px; }
            .settings-page-header h1 { font-size:24px; }
            .settings-card { padding:20px 16px; border-radius:13px; }

            .settings-row,
            .settings-colors-grid,
            .settings-option-selectors {
              grid-template-columns:1fr;
            }

            .settings-image-preview {
              flex-direction:column;
              align-items:stretch;
              gap:13px;
            }

            .settings-preview-picture {
              width:100%;
              height:150px;
            }

            .settings-save-bar { justify-content:flex-start; }
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

          {!settingsReady && !settingsError && (
            <div className="settings-load-message" role="status">
              Loading store settings...
            </div>
          )}

          {settingsError && (
            <div
              className="settings-load-message error"
              role="alert"
            >
              {settingsError} Reload this page to try again.
            </div>
          )}

          <div className="settings-tabs">
            {[
              ["store", "Store Settings"],
              ["about", "About Us"],
              ["contact", "Contact & Social Media"],
              ["colors", "Store Colors"],
              ["options", "Option List"],
            ].map(([key, label]) => (
              <button
                type="button"
                key={key}
                className={`settings-tab ${
                  activeTab === key ? "active" : ""
                }`}
                disabled={isSaving}
                onClick={() => setActiveTab(key)}
              >
                {label}
              </button>
            ))}
          </div>

          <form
            className="settings-form"
            onSubmit={handleSave}
            aria-busy={isSaving}
          >
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
                      Customize the branding displayed
                      across your store.
                    </p>
                  </div>

                  <ImageUploader
                    label="Store Logo"
                    image={form.storeBanner}
                    disabled={!settingsReady || isSaving}
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
                    disabled={!settingsReady || isSaving}
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
                  disabled={!settingsReady || isSaving}
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
                  {[
                    [1, "First Milestone"],
                    [2, "Second Milestone"],
                    [3, "Third Milestone"],
                  ].map(([number, label]) => (
                    <div
                      className="settings-timeline-card"
                      key={number}
                    >
                      <div className="settings-timeline-heading">
                        <span className="settings-timeline-number">
                          {number}
                        </span>
                        <h3>{label}</h3>
                      </div>

                      {renderInput(
                        "Title",
                        `timeline${number}Title`,
                        "Enter title"
                      )}

                      {renderTextarea(
                        "Description",
                        `timeline${number}Description`,
                        "Enter description"
                      )}
                    </div>
                  ))}
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
                    "Enter WhatsApp URL",
                    "url"
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
                            disabled={!settingsReady || isSaving}
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
                            disabled={!settingsReady || isSaving}
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
                    disabled={!settingsReady || isSaving}
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
                    Choose a page and field to manage
                    its options.
                  </p>
                </div>

                {optionsError && (
                  <div
                    className="settings-load-message error"
                    role="alert"
                  >
                    {optionsError}
                  </div>
                )}

                <div className="settings-option-selectors">
                  <div className="settings-field">
                    <label
                      className="settings-label"
                      htmlFor="settings-option-page"
                    >
                      Page
                    </label>

                    <select
                      id="settings-option-page"
                      className="settings-option-select"
                      value={currentPage.key}
                      disabled={isSaving}
                      onChange={(event) =>
                        changeOptionPage(event.target.value)
                      }
                    >
                      {availablePages.map((page) => (
                        <option
                          key={page.key}
                          value={page.key}
                        >
                          {page.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="settings-field">
                    <label
                      className="settings-label"
                      htmlFor="settings-option-field"
                    >
                      Field
                    </label>

                    <select
                      id="settings-option-field"
                      className="settings-option-select"
                      value={currentOptionKey}
                      disabled={isSaving}
                      onChange={(event) =>
                        changeOptionGroup(event.target.value)
                      }
                    >
                      {currentPage.fields.map((field) => (
                        <option
                          key={field.key}
                          value={field.key}
                        >
                          {field.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {currentPage.key === "previousOptions" && (
                  <p
                    className="settings-option-note"
                    style={{
                      marginTop: 0,
                      marginBottom: 18,
                    }}
                  >
                    These older lists contain unsorted
                    options. Their saved values are preserved
                    here. Add any needed values to the
                    appropriate page and field.
                  </p>
                )}

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
                      disabled={!optionsReady || isSaving}
                      placeholder={
                        currentField.placeholder ||
                        "Enter an option..."
                      }
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
                      disabled={!optionsReady || isSaving}
                      onClick={saveOption}
                    >
                      {editingOption === null ? (
                        <FaPlus />
                      ) : (
                        <FaCheckCircle />
                      )}

                      {editingOption === null
                        ? "Add"
                        : "Update"}
                    </button>

                    {editingOption !== null && (
                      <button
                        type="button"
                        className="settings-btn settings-btn-outline"
                        disabled={isSaving}
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
                        key={currentOptionRecords[index].id}
                      >
                        <span>{option}</span>

                        <div className="settings-option-actions">
                          <button
                            type="button"
                            className="settings-option-action"
                            aria-label={`Edit ${option}`}
                            title="Edit option"
                            disabled={isSaving}
                            onClick={() => editOption(index)}
                          >
                            <FaPen />
                          </button>

                          <button
                            type="button"
                            className="settings-option-action settings-option-delete"
                            aria-label={`Delete ${option}`}
                            title="Delete option"
                            disabled={isSaving}
                            onClick={() => removeOption(index)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="settings-option-empty">
                      {!optionsReady
                        ? optionsError || "Loading options..."
                        : "No options added yet."}
                    </p>
                  )}
                </div>

                <p className="settings-option-note">
                  Options for {currentGroupLabel}. Click
                  Save Settings to save your changes.
                </p>
              </section>
            )}

            <div className="settings-save-bar">
              {saved && (
                <span className="settings-saved" role="status">
                  <FaCheckCircle />
                  Settings saved successfully
                </span>
              )}

              <button
                type="submit"
                className="settings-btn settings-btn-primary"
                disabled={
                  !settingsReady ||
                  isSaving ||
                  (activeTab === "options" && !optionsReady)
                }
              >
                <FaSave />
                {isSaving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Settings;