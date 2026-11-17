import { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getClinicOptions } from "../data/clinicOptionsApi";

import {
  FaEye,
  FaPen,
  FaTrash,
  FaSearch,
  FaTimes,
  FaFileExport,
} from "react-icons/fa";

const REMINDERS_API = "/api/reminders";

const getOwnerName = (owner) =>
  `${owner?.firstName || ""} ${owner?.lastName || ""}`.trim();

function cleanReminderOptions(values) {
  if (!Array.isArray(values)) return [];

  return [
    ...new Set(
      values
        .filter((value) => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
    ),
  ];
}

async function readReminderOptions(signal) {
  const records = await getClinicOptions({ signal });

  if (
    !Array.isArray(records) ||
    records.some(
      (record) =>
        typeof record.listKey !== "string" ||
        typeof record.value !== "string" ||
        typeof record.isActive !== "boolean" ||
        !Number.isInteger(record.sortOrder)
    )
  ) {
    throw new Error(
      "The server returned invalid reminder options."
    );
  }

  const valuesFor = (listKey) =>
    cleanReminderOptions(
      records
        .filter(
          (record) =>
            record.listKey === listKey &&
            record.isActive
        )
        .sort(
          (a, b) =>
            a.sortOrder - b.sortOrder ||
            a.value.localeCompare(b.value)
        )
        .map((record) => record.value)
    );

  return {
    types: valuesFor("reminder.types"),
    statuses: valuesFor("reminder.statuses"),
  };
}

const getEmptyReminder = (
  options = { types: [], statuses: [] }
) => ({
  petId: "",
  pet: "",
  ownerId: "",
  owner: "",
  type: options.types[0] || "",
  dueDate: "",
  message: "",
  status: options.statuses[0] || "",
});

async function requestReminderData(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    cache: "no-store",
    headers: {
      ...(options.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = "Unable to complete the request.";

    if (response.status === 401) {
      message =
        "Your session has expired. Please sign in again.";
    } else if (response.status === 403) {
      message = "You do not have access to these records.";
    } else if (response.status === 404) {
      message = "The requested record was not found.";
    }

    try {
      const problem = await response.json();

      if (
        response.status !== 401 &&
        response.status !== 403
      ) {
        const errors = Object.values(problem.errors || {})
          .flat()
          .filter((value) => typeof value === "string");

        if (errors.length) {
          message = errors.join("\n");
        } else if (typeof problem.detail === "string") {
          message = problem.detail;
        }
      }
    } catch {
      // Keep the default message.
    }

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;

  return response.json();
}

function normalizeReminder(reminder) {
  return {
    ...reminder,
    petId: String(reminder.petId ?? ""),
    ownerId: String(reminder.ownerId ?? ""),
    pet: reminder.pet || "",
    owner: reminder.owner || "",
    type: reminder.type || "",
    dueDate: reminder.dueDate || "",
    message: reminder.message || "",
    status: reminder.status || "",
  };
}

function reminderPayload(reminder) {
  return {
    petId: Number(reminder.petId),
    type: reminder.type.trim(),
    dueDate: reminder.dueDate || null,
    message: reminder.message.trim(),
    status: reminder.status.trim(),
  };
}

function ReminderSearchInput({
  inputId,
  value,
  selectedId,
  options,
  placeholder,
  emptyMessage,
  onType,
  onSelect,
  disabled,
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const wrapperRef = useRef(null);
  const listRef = useRef(null);

  const query = String(value || "").trim().toLowerCase();

  const matches = options.filter((option) =>
    option.label.toLowerCase().includes(query)
  );

  useEffect(() => {
    const handleOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleOutside);

    return () =>
      document.removeEventListener(
        "mousedown",
        handleOutside
      );
  }, []);

  useEffect(() => {
    if (activeIndex >= 0) {
      listRef.current
        ?.querySelector(`[data-index="${activeIndex}"]`)
        ?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const choose = (option) => {
    onSelect(option.record);
    setOpen(false);
    setActiveIndex(-1);
  };

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "relative",
        width: "100%",
        minWidth: 0,
      }}
    >
      <input
        id={inputId}
        type="text"
        value={value || ""}
        placeholder={placeholder}
        disabled={disabled}
        required
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open && !disabled}
        aria-controls={`${inputId}-options`}
        aria-activedescendant={
          open && activeIndex >= 0 && matches[activeIndex]
            ? `${inputId}-option-${activeIndex}`
            : undefined
        }
        onFocus={() => {
          setOpen(true);
          setActiveIndex(-1);
        }}
        onChange={(event) => {
          event.target.setCustomValidity("");
          onType(event.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onBlur={(event) => {
          if (
            !event.currentTarget.parentElement?.contains(
              event.relatedTarget
            )
          ) {
            setOpen(false);
            setActiveIndex(-1);
          }
        }}
        onInvalid={(event) => {
          event.currentTarget.setCustomValidity(
            selectedId
              ? ""
              : "Please select an existing name from the suggestions."
          );
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
            setActiveIndex(-1);
            return;
          }

          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((previous) =>
              Math.min(previous + 1, matches.length - 1)
            );
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((previous) =>
              matches.length
                ? Math.max(previous - 1, 0)
                : -1
            );
          } else if (
            event.key === "Enter" &&
            open &&
            activeIndex >= 0 &&
            matches[activeIndex]
          ) {
            event.preventDefault();
            choose(matches[activeIndex]);
          }
        }}
        style={{
          width: "100%",
          boxSizing: "border-box",
        }}
      />

      {open && !disabled && (
        <div
          ref={listRef}
          id={`${inputId}-options`}
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 100,
            maxHeight: "190px",
            overflowY: "auto",
            overscrollBehavior: "contain",
            background: "#ffffff",
            border: "1px solid #d5e5e3",
            borderRadius: "8px",
            boxShadow: "0 8px 20px rgba(0,0,0,.1)",
          }}
        >
          {matches.length ? (
            matches.map((option, index) => (
              <div
                key={option.id}
                id={`${inputId}-option-${index}`}
                data-index={index}
                role="option"
                aria-selected={
                  String(selectedId) === String(option.id)
                }
                onMouseDown={(event) =>
                  event.preventDefault()
                }
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(option)}
                style={{
                  padding: "10px 12px",
                  fontSize: "13px",
                  cursor: "pointer",
                  color: "#354d4b",
                  background:
                    activeIndex === index
                      ? "#e8f7f5"
                      : "#ffffff",
                  overflowWrap: "anywhere",
                }}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div
              style={{
                padding: "11px 12px",
                color: "#778985",
                fontSize: "13px",
              }}
            >
              {emptyMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Reminders() {
  const [settingsOptions, setSettingsOptions] = useState({
    types: [],
    statuses: [],
  });

  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState("");

  const [reminders, setReminders] = useState([]);
  const [pets, setPets] = useState([]);
  const [owners, setOwners] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [selectedReminder, setSelectedReminder] =
    useState(null);

  const [reminderToDelete, setReminderToDelete] =
    useState(null);

  const [newReminder, setNewReminder] =
    useState(() => getEmptyReminder());

  useEffect(() => {
    let active = true;
    let controller = null;
    let requestNumber = 0;

    const refreshOptions = async () => {
      const currentRequest = ++requestNumber;

      controller?.abort();
      controller = new AbortController();
      setOptionsLoading(true);

      try {
        const options = await readReminderOptions(
          controller.signal
        );

        if (
          !active ||
          currentRequest !== requestNumber
        ) {
          return;
        }

        setSettingsOptions(options);
        setOptionsError("");
      } catch (error) {
        if (
          !active ||
          currentRequest !== requestNumber ||
          error.name === "AbortError"
        ) {
          return;
        }

        setSettingsOptions({
          types: [],
          statuses: [],
        });

        setOptionsError(
          error.message ||
            "Unable to load reminder options."
        );
      } finally {
        if (
          active &&
          currentRequest === requestNumber
        ) {
          setOptionsLoading(false);
        }
      }
    };

    refreshOptions();

    window.addEventListener(
      "clinicOptionsUpdated",
      refreshOptions
    );
    window.addEventListener("focus", refreshOptions);

    return () => {
      active = false;
      controller?.abort();

      window.removeEventListener(
        "clinicOptionsUpdated",
        refreshOptions
      );
      window.removeEventListener("focus", refreshOptions);
    };
  }, [reloadKey]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function load() {
      setIsLoading(true);
      setLoadError("");

      try {
        const [savedReminders, savedPets, savedOwners] =
          await Promise.all([
            requestReminderData(REMINDERS_API, {
              signal: controller.signal,
            }),
            requestReminderData("/api/pets", {
              signal: controller.signal,
            }),
            requestReminderData("/api/owners", {
              signal: controller.signal,
            }),
          ]);

        if (
          !Array.isArray(savedReminders) ||
          !Array.isArray(savedPets) ||
          !Array.isArray(savedOwners)
        ) {
          throw new Error(
            "The server returned invalid records."
          );
        }

        if (!active) return;

        setReminders(savedReminders.map(normalizeReminder));

        setPets(
          [...savedPets].sort((a, b) =>
            (a.name || "").localeCompare(b.name || "")
          )
        );

        setOwners(
          [...savedOwners].sort((a, b) =>
            getOwnerName(a).localeCompare(getOwnerName(b))
          )
        );
      } catch (error) {
        if (!active || error.name === "AbortError") return;

        setLoadError(
          error.message || "Unable to load reminders."
        );
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();

    return () => {
      active = false;
      controller.abort();
    };
  }, [reloadKey]);

  const reminderTypes = useMemo(
    () =>
      cleanReminderOptions([
        ...settingsOptions.types,
        ...reminders.map((reminder) => reminder.type),
      ]).sort((a, b) => a.localeCompare(b)),
    [reminders, settingsOptions.types]
  );

  const reminderStatuses = useMemo(
    () =>
      cleanReminderOptions([
        ...settingsOptions.statuses,
        ...reminders.map((reminder) => reminder.status),
      ]),
    [reminders, settingsOptions.statuses]
  );

  const filteredReminders = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    const result = reminders.filter((reminder) => {
      const matchesSearch = [
        reminder.pet,
        reminder.type,
        reminder.dueDate,
        reminder.message,
        reminder.status,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(searchText)
      );

      const matchesStatus =
        statusFilter === "All" ||
        reminder.status === statusFilter;

      const matchesType =
        typeFilter === "All" ||
        reminder.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });

    return [...result].sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }

      if (sortBy === "petAZ") {
        return a.pet.localeCompare(b.pet);
      }

      if (sortBy === "petZA") {
        return b.pet.localeCompare(a.pet);
      }

      return new Date(b.dueDate) - new Date(a.dueDate);
    });
  }, [
    reminders,
    search,
    statusFilter,
    typeFilter,
    sortBy,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredReminders.length / rowsPerPage)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    statusFilter,
    typeFilter,
    sortBy,
    rowsPerPage,
  ]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex =
    (safeCurrentPage - 1) * rowsPerPage;

  const paginatedReminders = filteredReminders.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setTypeFilter("All");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const hasFilters =
    search !== "" ||
    statusFilter !== "All" ||
    typeFilter !== "All" ||
    sortBy !== "newest";

  const beginSave = () => {
    if (savingRef.current) return false;

    savingRef.current = true;
    setIsSaving(true);
    return true;
  };

  const endSave = () => {
    savingRef.current = false;
    setIsSaving(false);
  };

  const notifyRemindersChanged = () => {
    window.dispatchEvent(
      new Event("vetClinicRemindersUpdated")
    );
  };

  const handleOpenAdd = () => {
    if (isLoading || loadError || savingRef.current) return;

    if (optionsLoading) {
      window.alert(
        "Reminder options are loading. Please try again."
      );
      return;
    }

    if (optionsError) {
      window.alert(optionsError);
      return;
    }

    setNewReminder(getEmptyReminder(settingsOptions));
    setShowAddModal(true);
  };

  const handleCloseAdd = () => {
    if (savingRef.current) return;

    setShowAddModal(false);
    setNewReminder(getEmptyReminder());
  };

  const applyPetSelection = (previous, pet) => {
    if (!pet) {
      return { ...previous, petId: "", pet: "" };
    }

    const owner = owners.find(
      (item) => String(item.id) === String(pet.ownerId)
    );

    return {
      ...previous,
      petId: String(pet.id),
      pet: pet.name || "",
      ownerId: String(pet.ownerId ?? ""),
      owner: owner ? getOwnerName(owner) : pet.owner || "",
    };
  };

  const updateSelection = (mode, updater) => {
    if (savingRef.current) return;

    const setter =
      mode === "edit"
        ? setSelectedReminder
        : setNewReminder;

    setter((previous) =>
      previous ? updater(previous) : previous
    );
  };

  const handleOwnerType = (mode, value) => {
    updateSelection(mode, (previous) => ({
      ...previous,
      owner: value,
      ownerId: "",
      pet: "",
      petId: "",
    }));
  };

  const handleOwnerSelect = (mode, owner) => {
    updateSelection(mode, (previous) => {
      const ownerPets = pets.filter(
        (pet) => String(pet.ownerId) === String(owner.id)
      );

      const currentPet = ownerPets.find(
        (pet) => String(pet.id) === String(previous.petId)
      );

      const pet =
        currentPet ||
        (ownerPets.length === 1 ? ownerPets[0] : null);

      return {
        ...previous,
        ownerId: String(owner.id),
        owner: getOwnerName(owner),
        petId: pet ? String(pet.id) : "",
        pet: pet?.name || "",
      };
    });
  };

  const handlePetType = (mode, value) => {
    updateSelection(mode, (previous) => ({
      ...previous,
      pet: value,
      petId: "",
    }));
  };

  const handlePetSelect = (mode, pet) => {
    updateSelection(mode, (previous) =>
      applyPetSelection(previous, pet)
    );
  };

  const changeReminderField = (previous, name, value) => {
    if (!previous) return previous;

    if (name === "petId") {
      const pet = pets.find(
        (item) => String(item.id) === String(value)
      );

      return applyPetSelection(previous, pet);
    }

    return { ...previous, [name]: value };
  };

  const handleNewReminderChange = (event) => {
    const { name, value } = event.target;

    setNewReminder((previous) =>
      changeReminderField(previous, name, value)
    );
  };

  const validateReminder = async (reminder) => {
    const petId = Number(reminder.petId);

    const pet = pets.find(
      (item) => Number(item.id) === petId
    );

    if (!Number.isInteger(petId) || petId <= 0 || !pet) {
      throw new Error(
        "Please select a pet from the suggestions."
      );
    }

    if (
      !reminder.ownerId ||
      !owners.some(
        (owner) =>
          String(owner.id) === String(reminder.ownerId)
      ) ||
      String(pet.ownerId) !== String(reminder.ownerId)
    ) {
      throw new Error(
        "Please select the correct owner from the suggestions."
      );
    }

    if (
      !reminder.type.trim() ||
      reminder.type.trim().length > 100
    ) {
      throw new Error(
        "Please select a valid reminder type."
      );
    }

    if (!reminder.dueDate) {
      throw new Error("Please select a due date.");
    }

    if (!reminder.message.trim()) {
      throw new Error("Please enter a reminder message.");
    }

    if (reminder.message.trim().length > 4000) {
      throw new Error(
        "Message must be 4000 characters or fewer."
      );
    }

    if (
      !reminder.status.trim() ||
      reminder.status.trim().length > 100
    ) {
      throw new Error("Please select a valid status.");
    }

    const latestOptions = await readReminderOptions();

    setSettingsOptions(latestOptions);
    setOptionsError("");

    const original = reminder.id == null
      ? null
      : reminders.find(
          (item) => String(item.id) === String(reminder.id)
        );

    const typeAllowed =
      latestOptions.types.includes(reminder.type.trim()) ||
      (
        original &&
        original.type === reminder.type
      );

    const statusAllowed =
      latestOptions.statuses.includes(
        reminder.status.trim()
      ) ||
      (
        original &&
        original.status === reminder.status
      );

    if (!typeAllowed) {
      throw new Error(
        "Choose a reminder type saved in Settings."
      );
    }

    if (!statusAllowed) {
      throw new Error(
        "Choose a reminder status saved in Settings."
      );
    }
  };

  const handleAddReminder = async (event) => {
    event.preventDefault();

    if (!beginSave()) return;

    try {
      await validateReminder(newReminder);

      const response = await requestReminderData(
        REMINDERS_API,
        {
          method: "POST",
          body: JSON.stringify(
            reminderPayload(newReminder)
          ),
        }
      );

      const saved = normalizeReminder(response);

      setReminders((previous) => [...previous, saved]);
      setNewReminder(getEmptyReminder());
      setShowAddModal(false);
      setCurrentPage(1);
      notifyRemindersChanged();
    } catch (error) {
      window.alert(
        error.message || "Unable to save the reminder."
      );
    } finally {
      endSave();
    }
  };

  const handleViewReminder = (reminder) => {
    if (savingRef.current) return;

    setSelectedReminder(reminder);
    setShowViewModal(true);
  };

  const handleCloseView = () => {
    if (savingRef.current) return;

    setShowViewModal(false);
    setSelectedReminder(null);
  };

  const handleOpenEdit = (reminder) => {
    if (savingRef.current) return;

    const pet = pets.find(
      (item) => String(item.id) === String(reminder.petId)
    );

    setSelectedReminder(
      pet
        ? applyPetSelection({ ...reminder }, pet)
        : { ...reminder }
    );

    setShowViewModal(false);
    setShowEditModal(true);

    if (optionsError) {
      window.alert(optionsError);
    }
  };

  const handleCloseEdit = () => {
    if (savingRef.current) return;

    setShowEditModal(false);
    setSelectedReminder(null);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setSelectedReminder((previous) =>
      changeReminderField(previous, name, value)
    );
  };

  const handleUpdateReminder = async (event) => {
    event.preventDefault();

    if (!selectedReminder || !beginSave()) return;

    try {
      await validateReminder(selectedReminder);

      const response = await requestReminderData(
        `${REMINDERS_API}/${encodeURIComponent(
          selectedReminder.id
        )}`,
        {
          method: "PUT",
          body: JSON.stringify(
            reminderPayload(selectedReminder)
          ),
        }
      );

      const saved = normalizeReminder(response);

      setReminders((previous) =>
        previous.map((reminder) =>
          reminder.id === saved.id ? saved : reminder
        )
      );

      setShowEditModal(false);
      setSelectedReminder(null);
      notifyRemindersChanged();
    } catch (error) {
      window.alert(
        error.message || "Unable to update the reminder."
      );
    } finally {
      endSave();
    }
  };

  const handleOpenDelete = (reminder) => {
    if (savingRef.current) return;

    setReminderToDelete(reminder);
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    if (savingRef.current) return;

    setReminderToDelete(null);
    setShowDeleteModal(false);
  };

  const handleConfirmDelete = async () => {
    if (!reminderToDelete || !beginSave()) return;

    try {
      const id = reminderToDelete.id;

      await requestReminderData(
        `${REMINDERS_API}/${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );

      setReminders((previous) =>
        previous.filter((reminder) => reminder.id !== id)
      );

      setReminderToDelete(null);
      setShowDeleteModal(false);

      if (selectedReminder?.id === id) {
        setShowViewModal(false);
        setShowEditModal(false);
        setSelectedReminder(null);
      }

      notifyRemindersChanged();
    } catch (error) {
      window.alert(
        error.message || "Unable to delete the reminder."
      );
    } finally {
      endSave();
    }
  };

  const handleExport = () => {
    const headers = [
      "Pet Name",
      "Reminder Type",
      "Due Date",
      "Message",
      "Status",
    ];

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = filteredReminders.map((reminder) => [
      reminder.pet,
      reminder.type,
      reminder.dueDate,
      reminder.message,
      reminder.status,
    ]);

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "reminders.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  const formatDate = (date) => {
    if (!date) return "";

    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };

  const getStatusClass = (status) => {
    if (status === "Active") return "status confirmed";
    if (status === "Due Soon") return "status pending";
    if (status === "Completed") return "status cancelled";

    return "status";
  };

  const paginationButtonStyle = {
    width: "34px",
    minWidth: "34px",
    maxWidth: "34px",
    height: "34px",
    minHeight: "34px",
    maxHeight: "34px",
    padding: "0",
    margin: "0",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flex: "0 0 34px",
    boxSizing: "border-box",
    border: "1px solid #c9dddd",
    borderRadius: "7px",
    backgroundColor: "#ffffff",
    color: "#455757",
    fontSize: "14px",
    fontWeight: "700",
    lineHeight: "1",
    boxShadow: "none",
    cursor: "pointer",
  };

  const paginationActiveStyle = {
    ...paginationButtonStyle,
    backgroundColor: "#54b7b5",
    borderColor: "#54b7b5",
    color: "#ffffff",
  };

  const paginationDisabledStyle = {
    ...paginationButtonStyle,
    backgroundColor: "#edf3f2",
    borderColor: "#d7e5e3",
    color: "#9aadaa",
    cursor: "not-allowed",
    opacity: 1,
  };  const renderOwnerPetFields = (data, mode) => {
    const availablePets = data.ownerId
      ? pets.filter(
          (pet) =>
            String(pet.ownerId) === String(data.ownerId)
        )
      : pets;

    return (
      <div className="form-row">
        <div className="form-field">
          <label htmlFor={`${mode}-reminder-owner`}>
            Owner
          </label>

          <ReminderSearchInput
            inputId={`${mode}-reminder-owner`}
            value={data.owner}
            selectedId={data.ownerId}
            options={owners.map((owner) => ({
              id: owner.id,
              label: getOwnerName(owner),
              record: owner,
            }))}
            placeholder="Type owner name..."
            emptyMessage="No matching owners found."
            onType={(value) =>
              handleOwnerType(mode, value)
            }
            onSelect={(owner) =>
              handleOwnerSelect(mode, owner)
            }
            disabled={isSaving}
          />
        </div>

        <div className="form-field">
          <label htmlFor={`${mode}-reminder-pet`}>
            Pet Name
          </label>

          <ReminderSearchInput
            inputId={`${mode}-reminder-pet`}
            value={data.pet}
            selectedId={data.petId}
            options={availablePets.map((pet) => ({
              id: pet.id,
              label: pet.name || "",
              record: pet,
            }))}
            placeholder="Type pet name..."
            emptyMessage={
              data.ownerId
                ? "No matching pets for this owner."
                : "No matching pets found."
            }
            onType={(value) =>
              handlePetType(mode, value)
            }
            onSelect={(pet) =>
              handlePetSelect(mode, pet)
            }
            disabled={isSaving}
          />
        </div>
      </div>
    );
  };

  const renderReminderSelect = (data, mode, field) => {
    const isEdit = mode === "edit";
    const isType = field === "type";

    const values = isType
      ? settingsOptions.types
      : settingsOptions.statuses;

    const original = isEdit
      ? reminders.find(
          (item) => String(item.id) === String(data.id)
        )
      : null;

    const savedValue = original?.[field] || "";

    return (
      <div className="form-field">
        <label htmlFor={`${mode}-reminder-${field}`}>
          {isType ? "Reminder Type" : "Status"}
        </label>

        <select
          id={`${mode}-reminder-${field}`}
          name={field}
          value={data[field] || ""}
          onChange={
            isEdit
              ? handleEditChange
              : handleNewReminderChange
          }
          disabled={isSaving || optionsLoading}
          required
        >
          <option value="">
            {isType ? "Select reminder type" : "Select status"}
          </option>

          {values.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}

          {savedValue && !values.includes(savedValue) && (
            <option value={savedValue}>
              {savedValue} (saved value)
            </option>
          )}
        </select>

        {(optionsLoading ||
          optionsError ||
          values.length === 0) && (
          <small
            style={{
              color: "#7c8f94",
              lineHeight: 1.5,
            }}
          >
            {optionsLoading
              ? `Loading reminder ${isType ? "types" : "statuses"}...`
              : optionsError ||
                `Add options in Settings → Option List → Reminders → ${
                  isType ? "Type" : "Status"
                }, then click Save Settings.`}
          </small>
        )}
      </div>
    );
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main reminders-page">
        <div className="reminders-page-header">
          <h1>Reminders</h1>
          <p>Manage clinic reminders</p>
        </div>

        {isLoading && (
          <p role="status">Loading reminders...</p>
        )}

        {loadError && (
          <div role="alert">
            <p style={{ color: "#c0392b" }}>
              {loadError}
            </p>

            <button
              type="button"
              onClick={() =>
                setReloadKey((previous) => previous + 1)
              }
            >
              Try Again
            </button>
          </div>
        )}

        <div className="reminders-filters-row">
          <div className="reminders-search-box">
            <FaSearch className="reminders-search-icon" />

            <input
              type="text"
              placeholder="Search reminders..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            {hasFilters && (
              <button
                type="button"
                className="reminders-clear-button"
                onClick={clearFilters}
                title="Clear filters"
                aria-label="Clear filters"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <select
            className="reminders-filter-select"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="All">All Status</option>

            {reminderStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            className="reminders-filter-select"
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value)
            }
          >
            <option value="All">All Types</option>

            {reminderTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            className="reminders-sort-select"
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value)
            }
          >
            <option value="newest">Sort by Newest</option>
            <option value="oldest">Sort by Oldest</option>
            <option value="petAZ">Pet A - Z</option>
            <option value="petZA">Pet Z - A</option>
          </select>
        </div>

        <div className="reminders-toolbar-buttons">
          <button
            type="button"
            className="reminders-export-button"
            onClick={handleExport}
            disabled={isLoading || Boolean(loadError)}
          >
            <FaFileExport />
            Export
          </button>

          <button
            type="button"
            className="reminders-add-button"
            onClick={handleOpenAdd}
            disabled={
              isLoading || Boolean(loadError) || isSaving
            }
          >
            + Add Reminder
          </button>
        </div>

        <div className="owners-table-container reminders-table-container">
          <div className="reminders-table-scroll">
            <table className="owners-table reminders-table">
              <thead>
                <tr>
                  <th>Pet Name</th>
                  <th>Reminder Type</th>
                  <th>Due Date</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {isLoading || loadError ? (
                  <tr>
                    <td colSpan="6" className="no-results">
                      {isLoading
                        ? "Loading reminders..."
                        : "Unable to load reminders."}
                    </td>
                  </tr>
                ) : paginatedReminders.length > 0 ? (
                  paginatedReminders.map((reminder) => (
                    <tr key={reminder.id}>
                      <td>{reminder.pet}</td>
                      <td>{reminder.type}</td>

                      <td>
                        {formatDate(reminder.dueDate)}
                      </td>

                      <td>{reminder.message}</td>

                      <td>
                        <span
                          className={getStatusClass(
                            reminder.status
                          )}
                        >
                          {reminder.status}
                        </span>
                      </td>

                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="view-button icon-button"
                            onClick={() =>
                              handleViewReminder(reminder)
                            }
                            title="View"
                            aria-label="View reminder"
                            disabled={isSaving}
                          >
                            <FaEye />
                          </button>

                          <button
                            type="button"
                            className="edit-button icon-button"
                            onClick={() =>
                              handleOpenEdit(reminder)
                            }
                            title="Edit"
                            aria-label="Edit reminder"
                            disabled={isSaving}
                          >
                            <FaPen />
                          </button>

                          <button
                            type="button"
                            className="delete-button icon-button"
                            onClick={() =>
                              handleOpenDelete(reminder)
                            }
                            title="Delete"
                            aria-label="Delete reminder"
                            disabled={isSaving}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-results">
                      No reminders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="reminders-pagination">
          <div className="reminders-rows-per-page">
            <span>Rows per page:</span>

            <select
              value={rowsPerPage}
              onChange={(event) =>
                setRowsPerPage(Number(event.target.value))
              }
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div
            className="reminders-page-controls"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "6px",
            }}
          >
            <button
              type="button"
              disabled={safeCurrentPage === 1}
              onClick={() =>
                setCurrentPage((page) =>
                  Math.max(page - 1, 1)
                )
              }
              aria-label="Previous page"
              style={
                safeCurrentPage === 1
                  ? paginationDisabledStyle
                  : paginationButtonStyle
              }
            >
              &lt;
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => {
              const isActive = safeCurrentPage === page;

              return (
                <button
                  type="button"
                  key={page}
                  className={
                    isActive ? "reminders-page-active" : ""
                  }
                  onClick={() => setCurrentPage(page)}
                  aria-current={
                    isActive ? "page" : undefined
                  }
                  style={
                    isActive
                      ? paginationActiveStyle
                      : paginationButtonStyle
                  }
                >
                  {page}
                </button>
              );
            })}

            <button
              type="button"
              disabled={safeCurrentPage === totalPages}
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(page + 1, totalPages)
                )
              }
              aria-label="Next page"
              style={
                safeCurrentPage === totalPages
                  ? paginationDisabledStyle
                  : paginationButtonStyle
              }
            >
              &gt;
            </button>
          </div>
        </div>
      </main>

      {/* ADD REMINDER */}

      {showAddModal && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseAdd();
            }
          }}
        >
          <div className="modal-container">
            <div className="modal-header">
              <div>
                <h2>Add Reminder</h2>
                <p>Enter reminder information</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={handleCloseAdd}
                disabled={isSaving}
                aria-label="Close add reminder"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleAddReminder}
              aria-busy={isSaving}
            >
              {renderOwnerPetFields(newReminder, "add")}

              <div className="form-row">
                {renderReminderSelect(
                  newReminder,
                  "add",
                  "type"
                )}

                <div className="form-field">
                  <label>Due Date</label>

                  <input
                    type="date"
                    name="dueDate"
                    value={newReminder.dueDate}
                    onChange={handleNewReminderChange}
                    disabled={isSaving}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                {renderReminderSelect(
                  newReminder,
                  "add",
                  "status"
                )}
              </div>

              <div className="form-field">
                <label>Message</label>

                <textarea
                  name="message"
                  rows="4"
                  placeholder="Enter reminder message"
                  value={newReminder.message}
                  onChange={handleNewReminderChange}
                  maxLength={4000}
                  disabled={isSaving}
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={handleCloseAdd}
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                  disabled={
                    isSaving ||
                    optionsLoading ||
                    Boolean(optionsError) ||
                    pets.length === 0 ||
                    settingsOptions.types.length === 0 ||
                    settingsOptions.statuses.length === 0
                  }
                >
                  {isSaving ? "Saving..." : "Add Reminder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW REMINDER */}

      {showViewModal && selectedReminder && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseView();
            }
          }}
        >
          <div className="modal-container">
            <div className="modal-header">
              <div>
                <h2>Reminder Details</h2>
                <p>View reminder information</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={handleCloseView}
                disabled={isSaving}
                aria-label="Close reminder details"
              >
                ×
              </button>
            </div>

            <div className="detail-row">
              <span>Pet Name</span>
              <strong>{selectedReminder.pet}</strong>
            </div>

            <div className="detail-row">
              <span>Reminder Type</span>
              <strong>{selectedReminder.type}</strong>
            </div>

            <div className="detail-row">
              <span>Due Date</span>

              <strong>
                {formatDate(selectedReminder.dueDate)}
              </strong>
            </div>

            <div className="detail-row">
              <span>Message</span>
              <strong>{selectedReminder.message}</strong>
            </div>

            <div className="detail-row">
              <span>Status</span>

              <strong>
                <span
                  className={getStatusClass(
                    selectedReminder.status
                  )}
                >
                  {selectedReminder.status}
                </span>
              </strong>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="modal-cancel-button"
                onClick={handleCloseView}
                disabled={isSaving}
              >
                Close
              </button>

              <button
                type="button"
                className="edit-button reminders-modal-edit"
                onClick={() =>
                  handleOpenEdit(selectedReminder)
                }
                disabled={isSaving}
              >
                <FaPen />
                <span>Edit Reminder</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT REMINDER */}

      {showEditModal && selectedReminder && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseEdit();
            }
          }}
        >
          <div className="modal-container">
            <div className="modal-header">
              <div>
                <h2>Edit Reminder</h2>
                <p>Update reminder information</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={handleCloseEdit}
                disabled={isSaving}
                aria-label="Close edit reminder"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleUpdateReminder}
              aria-busy={isSaving}
            >
              {renderOwnerPetFields(
                selectedReminder,
                "edit"
              )}

              <div className="form-row">
                {renderReminderSelect(
                  selectedReminder,
                  "edit",
                  "type"
                )}

                <div className="form-field">
                  <label>Due Date</label>

                  <input
                    type="date"
                    name="dueDate"
                    value={selectedReminder.dueDate}
                    onChange={handleEditChange}
                    disabled={isSaving}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                {renderReminderSelect(
                  selectedReminder,
                  "edit",
                  "status"
                )}
              </div>

              <div className="form-field">
                <label>Message</label>

                <textarea
                  name="message"
                  rows="4"
                  value={selectedReminder.message}
                  onChange={handleEditChange}
                  maxLength={4000}
                  disabled={isSaving}
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={handleCloseEdit}
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                  disabled={
                    isSaving ||
                    optionsLoading ||
                    Boolean(optionsError)
                  }
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE REMINDER */}

      {showDeleteModal && reminderToDelete && (
        <div
          className="reminders-delete-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCancelDelete();
            }
          }}
        >
          <div
            className="reminders-delete-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reminder-delete-title"
          >
            <div className="reminders-delete-icon">
              <FaTrash />
            </div>

            <h3 id="reminder-delete-title">
              Delete Reminder
            </h3>

            <p>Are you sure you want to delete this?</p>

            <div className="reminders-delete-actions">
              <button
                type="button"
                className="reminders-delete-cancel"
                onClick={handleCancelDelete}
                disabled={isSaving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="reminders-delete-confirm"
                onClick={handleConfirmDelete}
                disabled={isSaving}
              >
                {isSaving ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reminders;