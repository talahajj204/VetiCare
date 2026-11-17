import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

import {
  getAppointments,
  createAppointment as saveAppointment,
  updateAppointment,
  deleteAppointment,
} from "../data/appointmentsApi";

import {
  getClinicOptions,
} from "../data/clinicOptionsApi";

import {
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
  FaPen,
  FaTrash,
  FaClock,
  FaUserDoctor,
  FaList,
  FaTableCellsLarge,
  FaMagnifyingGlass,
  FaFileExport,
  FaBell,
} from "react-icons/fa6";

const getTodayString = () => {
  const today = new Date();

  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
};

const isValidDateString = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
};

async function readAppointmentOptions(signal) {
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
      "The server returned invalid appointment options."
    );
  }

  const valuesFor = (listKey) => {
    const seen = new Set();

    return records
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
      .map((record) => record.value.trim())
      .filter((value) => {
        const comparison = value.toLowerCase();

        if (!value || seen.has(comparison)) {
          return false;
        }

        seen.add(comparison);
        return true;
      });
  };

  return {
    types: valuesFor("appointments.types"),
    statuses: valuesFor("appointments.statuses"),
  };
}

const emptyAppointment = (
  date = "",
  options = { types: [], statuses: [] }
) => ({
  petId: "",
  pet: "",
  ownerId: "",
  owner: "",
  type: options.types[0] || "",
  date,
  time: "",
  veterinarian: "",
  reason: "",
  status: options.statuses[0] || "",
});

const getOwnerName = (owner) =>
  `${owner.firstName || ""} ${owner.lastName || ""}`.trim();

async function loadAppointmentData(path, signal, label) {
  const response = await fetch(path, {
    credentials: "include",
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(
      response.status === 401
        ? "Your session has expired. Please sign in again."
        : response.status === 403
          ? `You do not have access to these ${label}.`
          : `Unable to load ${label}.`
    );
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error(`The server returned invalid ${label}.`);
  }

  return data;
}

function AppointmentSearchInput({
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
    String(option.label || "").toLowerCase().includes(query)
  );

  useEffect(() => {
    const handleOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("pointerdown", handleOutside);

    return () =>
      document.removeEventListener(
        "pointerdown",
        handleOutside
      );
  }, []);

  useEffect(() => {
    setActiveIndex(-1);
  }, [value, selectedId]);

  useEffect(() => {
    if (activeIndex >= 0) {
      listRef.current
        ?.querySelector(
          `[data-option-index="${activeIndex}"]`
        )
        ?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const choose = (option) => {
    onSelect(option.record);
    setOpen(false);
    setActiveIndex(-1);
  };

  const listVisible = open && !disabled;

  return (
    <div
      ref={wrapperRef}
      className="appointment-search-select"
      style={{ position: "relative", minWidth: 0 }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
          setActiveIndex(-1);
        }
      }}
    >
      <input
        id={inputId}
        type="text"
        value={value || ""}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        required
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={listVisible}
        aria-controls={`${inputId}-options`}
        aria-activedescendant={
          listVisible &&
          activeIndex >= 0 &&
          matches[activeIndex]
            ? `${inputId}-option-${activeIndex}`
            : undefined
        }
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          onType(event.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((previous) =>
              matches.length
                ? Math.min(previous + 1, matches.length - 1)
                : -1
            );
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((previous) =>
              matches.length
                ? Math.max(previous - 1, 0)
                : -1
            );
          } else if (event.key === "Enter" && listVisible) {
            event.preventDefault();

            if (activeIndex >= 0 && matches[activeIndex]) {
              choose(matches[activeIndex]);
            } else if (matches.length === 1) {
              choose(matches[0]);
            }
          } else if (event.key === "Escape") {
            if (listVisible) {
              event.preventDefault();
              event.stopPropagation();
            }

            setOpen(false);
            setActiveIndex(-1);
          }
        }}
      />

      {listVisible && (
        <div
          ref={listRef}
          id={`${inputId}-options`}
          role="listbox"
          aria-label="Search results"
          style={{
            position: "absolute",
            top: "calc(100% + 5px)",
            left: 0,
            right: 0,
            maxHeight: "190px",
            overflowY: "auto",
            overscrollBehavior: "contain",
            zIndex: 50,
            background: "#ffffff",
            border: "1px solid #d5e5e3",
            borderRadius: "8px",
            boxShadow: "0 8px 20px rgba(24,56,56,.12)",
          }}
        >
          {matches.length ? (
            matches.map((option, index) => (
              <div
                key={option.id}
                id={`${inputId}-option-${index}`}
                role="option"
                aria-selected={
                  String(selectedId) === String(option.id)
                }
                data-option-index={index}
                onPointerDown={(event) =>
                  event.preventDefault()
                }
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(option)}
                style={{
                  padding: "11px 12px",
                  cursor: "pointer",
                  background:
                    activeIndex === index
                      ? "#e8f7f5"
                      : "#ffffff",
                  color: "#29434a",
                  fontSize: "13px",
                }}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div
              style={{
                padding: "12px",
                color: "#7c8f94",
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

function Appointments() {
  const navigate = useNavigate();
  const location = useLocation();

  const [appointmentOptions, setAppointmentOptions] =
    useState({ types: [], statuses: [] });

  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState("");

  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState([]);
  const [owners, setOwners] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const savingRef = useRef(false);

  const [canViewReminders, setCanViewReminders] =
    useState(false);

  const [reminders, setReminders] = useState([]);
  const [remindersLoading, setRemindersLoading] =
    useState(true);
  const [remindersError, setRemindersError] = useState("");
  const [remindersReloadKey, setRemindersReloadKey] =
    useState(0);
  const [selectedReminder, setSelectedReminder] =
    useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("calendar");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedAppointment, setSelectedAppointment] =
    useState(null);

  const [newAppointment, setNewAppointment] = useState(
    () => emptyAppointment()
  );

  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();

    return new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );
  });

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
        const options = await readAppointmentOptions(
          controller.signal
        );

        if (
          !active ||
          currentRequest !== requestNumber
        ) {
          return;
        }

        setAppointmentOptions(options);
        setOptionsError("");
      } catch (error) {
        if (
          !active ||
          currentRequest !== requestNumber ||
          error.name === "AbortError"
        ) {
          return;
        }

        setAppointmentOptions({
          types: [],
          statuses: [],
        });

        setOptionsError(
          error.message ||
            "Unable to load appointment options."
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

      window.removeEventListener(
        "focus",
        refreshOptions
      );
    };
  }, [reloadKey]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const load = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const [savedAppointments, savedPets, savedOwners] =
          await Promise.all([
            getAppointments({ signal: controller.signal }),
            loadAppointmentData(
              "/api/appointments/lookups/pets",
              controller.signal,
              "pets"
            ),
            loadAppointmentData(
              "/api/appointments/lookups/owners",
              controller.signal,
              "owners"
            ),
          ]);

        if (!active) return;

        setAppointments(savedAppointments);

        setPets(
          [...savedPets].sort((a, b) =>
            String(a.name || "").localeCompare(
              String(b.name || "")
            )
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
          error.message || "Unable to load appointments."
        );
      } finally {
        if (active) setIsLoading(false);
      }
    };

    load();

    return () => {
      active = false;
      controller.abort();
    };
  }, [reloadKey]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadReminders() {
      setRemindersLoading(true);
      setRemindersError("");

      try {
        setCanViewReminders(false);
        setReminders([]);
        setSelectedReminder(null);

        const accessResponse = await fetch(
          "/api/appointments/lookups/permissions",
          {
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        if (!accessResponse.ok) {
          throw new Error(
            accessResponse.status === 401
              ? "Your session has expired. Please sign in again."
              : "Unable to check reminder access."
          );
        }

        const access = await accessResponse.json();

        if (
          !access ||
          typeof access.canViewReminders !== "boolean"
        ) {
          throw new Error(
            "The server returned invalid reminder permissions."
          );
        }

        if (!active) return;

        setCanViewReminders(access.canViewReminders);

        if (!access.canViewReminders) {
          return;
        }

        const saved = await loadAppointmentData(
          "/api/reminders",
          controller.signal,
          "reminders"
        );

        if (!active) return;

        setReminders(
          saved.map((reminder) => ({
            ...reminder,
            dueDate: reminder.dueDate || "",
            pet: reminder.pet || "",
            owner: reminder.owner || "",
            type: reminder.type || "",
            message: reminder.message || "",
            status: reminder.status || "",
          }))
        );
      } catch (error) {
        if (!active || error.name === "AbortError") return;

        setRemindersError(
          error.message || "Unable to load reminders."
        );
      } finally {
        if (active) setRemindersLoading(false);
      }
    }

    loadReminders();

    return () => {
      active = false;
      controller.abort();
    };
  }, [reloadKey, remindersReloadKey]);

  useEffect(() => {
    const refreshReminders = () =>
      setRemindersReloadKey((previous) => previous + 1);

    window.addEventListener(
      "vetClinicRemindersUpdated",
      refreshReminders
    );

    return () =>
      window.removeEventListener(
        "vetClinicRemindersUpdated",
        refreshReminders
      );
  }, []);

  useEffect(() => {
    if (
      isLoading ||
      loadError ||
      optionsLoading ||
      !location.state?.openAddAppointment
    ) {
      return;
    }

    const state = location.state;
    const requestedPetId = state.petId || state.pet?.id;

    const pet = pets.find(
      (item) => String(item.id) === String(requestedPetId)
    );

    setNewAppointment({
      ...emptyAppointment("", appointmentOptions),
      ...(pet
        ? {
            petId: String(pet.id),
            pet: pet.name || "",
            ownerId: String(pet.ownerId || ""),
            owner: pet.owner || "",
          }
        : {}),
    });

    setShowAddModal(true);

    if (optionsError) {
      window.alert(optionsError);
    }

    navigate(location.pathname, {
      replace: true,
      state: null,
    });
  }, [
    isLoading,
    loadError,
    optionsLoading,
    optionsError,
    appointmentOptions,
    pets,
    location.state,
    location.pathname,
    navigate,
  ]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthTitle = currentDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const filteredAppointments = appointments
    .filter((appointment) => {
      const value = search.trim().toLowerCase();

      const matchesSearch = [
        appointment.pet,
        appointment.owner,
        appointment.type,
        appointment.veterinarian,
        appointment.reason,
        appointment.status,
        appointment.date,
        appointment.time,
      ].some((field) =>
        String(field || "").toLowerCase().includes(value)
      );

      const matchesStatus =
        statusFilter === "All" ||
        appointment.status === statusFilter;

      const matchesFromDate =
        !fromDate || appointment.date >= fromDate;

      const matchesToDate =
        !toDate || appointment.date <= toDate;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesFromDate &&
        matchesToDate
      );
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(`${b.date}T${b.time || "00:00"}`) -
          new Date(`${a.date}T${a.time || "00:00"}`)
        );
      }

      if (sortBy === "oldest") {
        return (
          new Date(`${a.date}T${a.time || "00:00"}`) -
          new Date(`${b.date}T${b.time || "00:00"}`)
        );
      }

      if (sortBy === "pet") {
        return a.pet.localeCompare(b.pet);
      }

      if (sortBy === "time") {
        return a.time.localeCompare(b.time);
      }

      return 0;
    });

  const filteredReminders = reminders.filter((reminder) => {
    const value = search.trim().toLowerCase();

    const matchesSearch = [
      reminder.pet,
      reminder.owner,
      reminder.type,
      reminder.message,
      reminder.status,
      reminder.dueDate,
    ].some((field) =>
      String(field || "").toLowerCase().includes(value)
    );

    return (
      matchesSearch &&
      (!fromDate || reminder.dueDate >= fromDate) &&
      (!toDate || reminder.dueDate <= toDate)
    );
  });

  const totalThisView = filteredAppointments.length;

  const confirmedCount = filteredAppointments.filter(
    (appointment) => appointment.status === "Confirmed"
  ).length;

  const pendingCount = filteredAppointments.filter(
    (appointment) => appointment.status === "Pending"
  ).length;

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setFromDate("");
    setToDate("");
    setSortBy("newest");
  };

  const filtersActive =
    search !== "" ||
    statusFilter !== "All" ||
    fromDate !== "" ||
    toDate !== "" ||
    sortBy !== "newest";

  const handleExport = () => {
    const headers = [
      "Pet",
      "Owner",
      "Type",
      "Date",
      "Time",
      "Veterinarian",
      "Reason",
      "Status",
    ];

    const rows = filteredAppointments.map((appointment) => [
      appointment.pet,
      appointment.owner,
      appointment.type,
      appointment.date,
      appointment.time,
      appointment.veterinarian,
      appointment.reason,
      appointment.status,
    ]);

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "appointments.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getDateString = (day) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

  const getAppointmentsForDay = (day) =>
    filteredAppointments.filter(
      (appointment) =>
        appointment.date === getDateString(day)
    );

  const getRemindersForDay = (day) =>
    filteredReminders.filter(
      (reminder) =>
        reminder.dueDate === getDateString(day)
    );

  const isPastDay = (day) =>
    getDateString(day) < getTodayString();

  const isToday = (day) => {
    const today = new Date();

    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

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

  const notifyAppointmentsChanged = () => {
    window.dispatchEvent(
      new Event("vetClinicAppointmentsUpdated")
    );
  };

  const openAddModal = (date = "") => {
    if (isLoading || loadError || savingRef.current) return;

    if (
      date &&
      (!isValidDateString(date) || date < getTodayString())
    ) {
      return;
    }

    if (optionsLoading) {
      window.alert(
        "Appointment options are loading. Please try again."
      );
      return;
    }

    if (optionsError) {
      window.alert(optionsError);
      return;
    }

    setNewAppointment(
      emptyAppointment(date, appointmentOptions)
    );

    setShowAddModal(true);
  };

  const getPetsForOwner = (ownerId) =>
    pets.filter(
      (pet) => String(pet.ownerId) === String(ownerId)
    );

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
      ownerId: String(pet.ownerId || ""),
      owner: owner ? getOwnerName(owner) : pet.owner || "",
    };
  };

  const applyOwnerSelection = (previous, owner) => {
    const ownerPets = getPetsForOwner(owner.id);

    const selectedPet = ownerPets.find(
      (pet) => String(pet.id) === String(previous.petId)
    );

    const pet =
      selectedPet ||
      (ownerPets.length === 1 ? ownerPets[0] : null);

    return {
      ...previous,
      ownerId: String(owner.id),
      owner: getOwnerName(owner),
      petId: pet ? String(pet.id) : "",
      pet: pet?.name || "",
    };
  };

  const updateSelection = (mode, updater) => {
    if (savingRef.current) return;

    const setter =
      mode === "edit"
        ? setSelectedAppointment
        : setNewAppointment;

    setter((previous) =>
      previous ? updater(previous) : previous
    );
  };

  const handleOwnerType = (mode, value) => {
    updateSelection(mode, (previous) => ({
      ...previous,
      owner: value,
      ownerId: "",
      petId: "",
      pet: "",
    }));
  };

  const handleOwnerSelect = (mode, owner) => {
    updateSelection(mode, (previous) =>
      applyOwnerSelection(previous, owner)
    );
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

  const changeAppointmentField = (previous, name, value) => {
    if (name === "petId") {
      const pet = pets.find(
        (item) => String(item.id) === String(value)
      );

      return applyPetSelection(previous, pet);
    }

    return { ...previous, [name]: value };
  };

  const handleNewAppointmentChange = (event) => {
    const { name, value } = event.target;

    setNewAppointment((previous) =>
      changeAppointmentField(previous, name, value)
    );
  };

  const validateAppointment = async (
    appointment,
    originalAppointment = null
  ) => {
    const pet = pets.find(
      (item) =>
        String(item.id) === String(appointment.petId)
    );

    if (!pet) {
      throw new Error("Please select an existing pet.");
    }

    if (
      !appointment.ownerId ||
      String(pet.ownerId) !== String(appointment.ownerId)
    ) {
      throw new Error(
        "Please select the owner and a pet belonging to that owner."
      );
    }

    if (!isValidDateString(appointment.date)) {
      throw new Error(
        "Please select a valid appointment date."
      );
    }

    if (appointment.date < getTodayString()) {
      const sameHistoricalBooking =
        originalAppointment &&
        originalAppointment.date === appointment.date &&
        originalAppointment.time === appointment.time &&
        String(originalAppointment.petId) ===
          String(appointment.petId);

      if (!sameHistoricalBooking) {
        throw new Error(
          "You cannot book an appointment before today."
        );
      }
    }

    if (!appointment.time) {
      throw new Error("Please select an appointment time.");
    }

    if (!appointment.veterinarian.trim()) {
      throw new Error("Please enter the veterinarian.");
    }

    if (!appointment.reason.trim()) {
      throw new Error(
        "Please enter the appointment reason."
      );
    }

    if (
      !appointment.type.trim() ||
      !appointment.status.trim()
    ) {
      throw new Error("Please select the type and status.");
    }

    const latestOptions = await readAppointmentOptions();

    setAppointmentOptions(latestOptions);
    setOptionsError("");

    const typeAllowed =
      latestOptions.types.includes(
        appointment.type.trim()
      ) ||
      (
        originalAppointment &&
        originalAppointment.type === appointment.type
      );

    const statusAllowed =
      latestOptions.statuses.includes(
        appointment.status.trim()
      ) ||
      (
        originalAppointment &&
        originalAppointment.status === appointment.status
      );

    if (!typeAllowed) {
      throw new Error(
        "Choose an appointment type saved in Settings."
      );
    }

    if (!statusAllowed) {
      throw new Error(
        "Choose an appointment status saved in Settings."
      );
    }

    if (appointment.veterinarian.trim().length > 200) {
      throw new Error(
        "Veterinarian must be 200 characters or fewer."
      );
    }

    if (appointment.reason.trim().length > 500) {
      throw new Error(
        "Reason must be 500 characters or fewer."
      );
    }
  };

  const createAppointment = async () => {
    if (!beginSave()) return null;

    try {
      await validateAppointment(newAppointment);

      const appointment =
        await saveAppointment(newAppointment);

      setAppointments((previous) => [
        ...previous,
        appointment,
      ]);

      const [appointmentYear, appointmentMonth] =
        appointment.date.split("-");

      setCurrentDate(
        new Date(
          Number(appointmentYear),
          Number(appointmentMonth) - 1,
          1
        )
      );

      setShowAddModal(false);

      setNewAppointment(
        emptyAppointment("", appointmentOptions)
      );

      notifyAppointmentsChanged();

      return appointment;
    } catch (error) {
      window.alert(
        error.message || "Unable to save the appointment."
      );

      return null;
    } finally {
      endSave();
    }
  };

  const handleAddAppointment = async (event) => {
    event.preventDefault();
    await createAppointment();
  };

  const handleStartVisit = (appointment) => {
    if (savingRef.current) return;

    setShowViewModal(false);

    navigate("/medical-records", {
      state: {
        openAddMedicalRecord: true,
        fromVisitFlow: true,
        appointment,
        appointmentId: appointment.id,
        petId: Number(appointment.petId),
        ownerId: Number(appointment.ownerId),
        pet: appointment.pet,
        owner: appointment.owner,
        veterinarian: appointment.veterinarian,
        appointmentType: appointment.type,
        appointmentDate: appointment.date,
        appointmentTime: appointment.time,
        reason: appointment.reason,
      },
    });
  };

  const handleSaveAndStartVisit = async (event) => {
    const form = event.currentTarget.form;

    if (form && !form.reportValidity()) return;

    const appointment = await createAppointment();

    if (appointment) {
      handleStartVisit(appointment);
    }
  };

  const handleViewAppointment = (appointment) => {
    if (savingRef.current) return;

    setSelectedAppointment(appointment);
    setShowViewModal(true);
  };

  const handleOpenEdit = (appointment) => {
    if (savingRef.current) return;

    setSelectedAppointment({
      ...appointment,
      petId: String(appointment.petId || ""),
      ownerId: String(appointment.ownerId || ""),
    });

    setShowViewModal(false);
    setShowEditModal(true);

    if (optionsError) {
      window.alert(optionsError);
    }
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setSelectedAppointment((previous) =>
      previous
        ? changeAppointmentField(previous, name, value)
        : previous
    );
  };

  const handleUpdateAppointment = async (event) => {
    event.preventDefault();

    if (!selectedAppointment || !beginSave()) return;

    try {
      const original = appointments.find(
        (appointment) =>
          appointment.id === selectedAppointment.id
      );

      await validateAppointment(
        selectedAppointment,
        original
      );

      const saved = await updateAppointment(
        selectedAppointment.id,
        selectedAppointment
      );

      setAppointments((previous) =>
        previous.map((appointment) =>
          appointment.id === saved.id
            ? saved
            : appointment
        )
      );

      setShowEditModal(false);
      setSelectedAppointment(null);
      notifyAppointmentsChanged();
    } catch (error) {
      window.alert(
        error.message ||
          "Unable to update the appointment."
      );
    } finally {
      endSave();
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (savingRef.current) return;

    if (
      !window.confirm(
        "Are you sure you want to delete this appointment?"
      )
    ) {
      return;
    }

    if (!beginSave()) return;

    try {
      await deleteAppointment(id);

      setAppointments((previous) =>
        previous.filter(
          (appointment) => appointment.id !== id
        )
      );

      setShowViewModal(false);
      setShowEditModal(false);
      setSelectedAppointment(null);
      notifyAppointmentsChanged();
    } catch (error) {
      window.alert(
        error.message ||
          "Unable to delete the appointment."
      );
    } finally {
      endSave();
    }
  };

  const closeAddModal = () => {
    if (savingRef.current) return;
    setShowAddModal(false);
  };

  const closeViewModal = () => {
    if (savingRef.current) return;
    setShowViewModal(false);
    setSelectedAppointment(null);
  };

  const closeEditModal = () => {
    if (savingRef.current) return;
    setShowEditModal(false);
    setSelectedAppointment(null);
  };

  const handleViewReminder = (reminder) => {
    if (savingRef.current) return;
    setSelectedReminder(reminder);
  };

  const closeReminderModal = () => {
    setSelectedReminder(null);
  };

  const formatDate = (date) => {
    if (!date) return "";

    const [y, m, d] = date.split("-");
    return `${d}/${m}/${y}`;
  };

  const formatTime = (time) => {
    if (!time) return "";

    const [hours, minutes] = time.split(":");
    let hour = Number(hours);
    const period = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;

    return `${hour}:${minutes} ${period}`;
  };  const headerStyle = {
    width: "100%",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "28px",
  };

  const headerActionsStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "10px",
    marginLeft: "auto",
  };

  const exportButtonStyle = {
    height: "42px",
    minWidth: "115px",
    padding: "0 16px",
    margin: 0,
    border: "1px solid #55b7b3",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#319c97",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    whiteSpace: "nowrap",
    boxSizing: "border-box",
  };

  const addButtonStyle = {
    height: "42px",
    minWidth: "170px",
    padding: "0 18px",
    margin: 0,
    border: "1px solid #55b7b3",
    borderRadius: "8px",
    background: "#55b7b3",
    color: "#ffffff",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    whiteSpace: "nowrap",
    boxSizing: "border-box",
  };

  const renderAppointmentFields = (data, mode) => {
    const isEdit = mode === "edit";

    const onChange = isEdit
      ? handleEditChange
      : handleNewAppointmentChange;

    const availablePets = data.ownerId
      ? getPetsForOwner(data.ownerId)
      : pets;

    const original = isEdit
      ? appointments.find((item) => item.id === data.id)
      : null;

    const today = getTodayString();

    const originalPastDate =
      original?.date && original.date < today
        ? original.date
        : "";

    return (
      <>
        <div className="form-row">
          <div className="form-field">
            <label htmlFor={`${mode}-appointment-pet`}>
              Pet Name
            </label>

            <AppointmentSearchInput
              inputId={`${mode}-appointment-pet`}
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

          <div className="form-field">
            <label htmlFor={`${mode}-appointment-owner`}>
              Owner
            </label>

            <AppointmentSearchInput
              inputId={`${mode}-appointment-owner`}
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
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Veterinarian</label>

            <input
              type="text"
              name="veterinarian"
              value={data.veterinarian || ""}
              onChange={onChange}
              placeholder="Enter veterinarian"
              maxLength={200}
              disabled={isSaving}
              required
            />
          </div>

          <div className="form-field">
            <label>Appointment Type</label>

            <select
              name="type"
              value={data.type}
              onChange={onChange}
              disabled={isSaving || optionsLoading}
              required
            >
              <option value="">
                Select appointment type
              </option>

              {appointmentOptions.types.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}

              {isEdit &&
                original?.type &&
                !appointmentOptions.types.includes(
                  original.type
                ) && (
                  <option value={original.type}>
                    {original.type} (saved value)
                  </option>
                )}
            </select>

            {(optionsLoading ||
              optionsError ||
              appointmentOptions.types.length === 0) && (
              <small
                style={{
                  color: "#7c8f94",
                  lineHeight: 1.5,
                }}
              >
                {optionsLoading
                  ? "Loading appointment types..."
                  : optionsError ||
                    "No options saved. Add them in Settings → Option List → Appointments → Type, then click Save Settings."}
              </small>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Date</label>

            <input
              type="date"
              name="date"
              value={data.date || ""}
              min={originalPastDate || today}
              onChange={(event) => {
                const value = event.target.value;

                event.target.setCustomValidity(
                  value &&
                    value < getTodayString() &&
                    value !== originalPastDate
                    ? "You cannot book an appointment before today."
                    : ""
                );

                onChange(event);
              }}
              disabled={isSaving}
              required
            />
          </div>

          <div className="form-field">
            <label>Time</label>

            <input
              type="time"
              name="time"
              value={data.time || ""}
              onChange={onChange}
              disabled={isSaving}
              required
            />
          </div>
        </div>

        <div className="form-field">
          <label>Reason</label>

          <input
            type="text"
            name="reason"
            value={data.reason || ""}
            onChange={onChange}
            placeholder="Enter reason for appointment"
            maxLength={500}
            disabled={isSaving}
            required
          />
        </div>

        <div className="form-field">
          <label>Status</label>

          <select
            name="status"
            value={data.status}
            onChange={onChange}
            disabled={isSaving || optionsLoading}
            required
          >
            <option value="">Select status</option>

            {appointmentOptions.statuses.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}

            {isEdit &&
              original?.status &&
              !appointmentOptions.statuses.includes(
                original.status
              ) && (
                <option value={original.status}>
                  {original.status} (saved value)
                </option>
              )}
          </select>

          {(optionsLoading ||
            optionsError ||
            appointmentOptions.statuses.length === 0) && (
            <small
              style={{
                color: "#7c8f94",
                lineHeight: 1.5,
              }}
            >
              {optionsLoading
                ? "Loading appointment statuses..."
                : optionsError ||
                  "No options saved. Add them in Settings → Option List → Appointments → Status, then click Save Settings."}
            </small>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="dashboard-layout">
      <style>{`
        .workflow-actions {
          display: flex !important;
          align-items: center !important;
          justify-content: flex-end !important;
          gap: 8px !important;
          flex-wrap: wrap !important;
          margin-top: 20px !important;
        }

        .modal-container .workflow-actions .workflow-button {
          width: auto !important;
          min-width: 0 !important;
          max-width: none !important;
          height: 34px !important;
          min-height: 34px !important;
          max-height: 34px !important;
          padding: 0 12px !important;
          margin: 0 !important;
          flex: 0 0 auto !important;
          border-radius: 7px !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          line-height: 1 !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          white-space: nowrap !important;
          box-sizing: border-box !important;
          cursor: pointer !important;
          box-shadow: none !important;
          font-family: inherit !important;
        }

        .modal-container
        .workflow-actions .workflow-button-secondary {
          background: #ffffff !important;
          color: #52605f !important;
          border: 1px solid #d5e5e3 !important;
        }

        .modal-container
        .workflow-actions .workflow-button-secondary:hover {
          background: #f7fbfa !important;
          border-color: #bdd8d5 !important;
        }

        .modal-container
        .workflow-actions .workflow-button-primary {
          background: #55b7b3 !important;
          color: #ffffff !important;
          border: 1px solid #55b7b3 !important;
        }

        .modal-container
        .workflow-actions .workflow-button-primary:hover {
          background: #319c97 !important;
          border-color: #319c97 !important;
        }

        .appointment-search-select {
          width: 100%;
          min-width: 0;
        }

        .appointment-search-select > input {
          width: 100%;
          box-sizing: border-box;
        }

        .appointment-search-select [role="option"] {
          text-align: left;
          -webkit-text-fill-color: currentColor !important;
        }

        .compact-calendar .compact-events {
          max-height: 170px;
          overflow-y: auto;
          overscroll-behavior: contain;
        }

        .compact-calendar .compact-event.calendar-reminder {
          background: #fff4dc !important;
          border: 1px solid #efd195 !important;
          color: #946817 !important;
          -webkit-text-fill-color: currentColor !important;
        }

        .compact-calendar
        .compact-event.calendar-reminder:hover {
          background: #ffebbf !important;
          color: #80560b !important;
        }

        .calendar-reminder svg {
          flex-shrink: 0;
        }

        .calendar-legend .legend-dot.reminder {
          background: #d89b37;
        }

        .compact-day-add:disabled {
          cursor: not-allowed !important;
          opacity: 0.35;
        }

        @media (max-width: 640px) {
          .workflow-actions {
            justify-content: flex-end !important;
          }

          .modal-container .workflow-actions .workflow-button {
            width: auto !important;
            flex: 0 0 auto !important;
          }
        }
      `}</style>

      <Sidebar />

      <main className="dashboard-main">
        <div style={headerStyle}>
          <div>
            <h1 style={{ margin: "0 0 5px" }}>
              Appointments
            </h1>

            <p style={{ margin: 0, color: "#718481" }}>
              Manage clinic appointments
            </p>
          </div>

          <div style={headerActionsStyle}>
            <button
              type="button"
              onClick={handleExport}
              style={exportButtonStyle}
              disabled={isLoading || Boolean(loadError)}
            >
              <FaFileExport />
              Export
            </button>

            <button
              type="button"
              onClick={() => openAddModal()}
              style={addButtonStyle}
              disabled={
                isLoading || Boolean(loadError) || isSaving
              }
            >
              <FaPlus />
              New Appointment
            </button>
          </div>
        </div>

        {isLoading && (
          <p role="status">Loading appointments...</p>
        )}

        {loadError && (
          <div role="alert">
            <p style={{ color: "#c0392b" }}>
              {loadError}
            </p>

            <button
              type="button"
              onClick={() =>
                setReloadKey((value) => value + 1)
              }
            >
              Try Again
            </button>
          </div>
        )}

        {/* FILTERS */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "nowrap",
            width: "100%",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              position: "relative",
              flex: "1 1 auto",
              minWidth: "260px",
            }}
          >
            <FaMagnifyingGlass
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#7b9693",
                fontSize: "14px",
                pointerEvents: "none",
                zIndex: 2,
              }}
            />

            <input
              type="text"
              placeholder="Search appointments..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              style={{
                width: "100%",
                height: "44px",
                padding: "0 44px 0 42px",
                border: "1px solid #d5e5e3",
                borderRadius: "8px",
                outline: "none",
                boxSizing: "border-box",
                background: "#ffffff",
                fontSize: "14px",
              }}
            />

            {filtersActive && (
              <button
                type="button"
                onClick={clearFilters}
                title="Clear filters"
                aria-label="Clear filters"
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "28px",
                  minWidth: "28px",
                  height: "28px",
                  padding: 0,
                  margin: 0,
                  border: "none",
                  borderRadius: "50%",
                  background: "transparent",
                  color: "#319c97",
                  fontSize: "20px",
                  lineHeight: 1,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "none",
                }}
              >
                ×
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            style={{
              width: "165px",
              minWidth: "165px",
              height: "44px",
              padding: "0 12px",
              border: "1px solid #d5e5e3",
              borderRadius: "8px",
              background: "#ffffff",
              outline: "none",
              cursor: "pointer",
              boxSizing: "border-box",
            }}
          >
            <option value="All">All Statuses</option>

            {[
              ...new Set([
                ...appointmentOptions.statuses,
                ...appointments.map((item) => item.status),
              ]),
            ]
              .filter(Boolean)
              .map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
          </select>

          <input
            type="date"
            value={fromDate}
            title="From Date"
            onChange={(event) =>
              setFromDate(event.target.value)
            }
            style={{
              width: "165px",
              minWidth: "165px",
              height: "44px",
              padding: "0 10px",
              border: "1px solid #d5e5e3",
              borderRadius: "8px",
              outline: "none",
              boxSizing: "border-box",
              background: "#ffffff",
            }}
          />

          <input
            type="date"
            value={toDate}
            title="To Date"
            onChange={(event) =>
              setToDate(event.target.value)
            }
            style={{
              width: "165px",
              minWidth: "165px",
              height: "44px",
              padding: "0 10px",
              border: "1px solid #d5e5e3",
              borderRadius: "8px",
              outline: "none",
              boxSizing: "border-box",
              background: "#ffffff",
            }}
          />
        </div>

        {/* SORT AND VIEW */}

        <div className="appointments-toolbar">
          <div />

          <div className="appointments-toolbar-right">
            <div className="appointment-sort">
              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value)
                }
              >
                <option value="newest">
                  Sort by Newest
                </option>

                <option value="oldest">
                  Sort by Oldest
                </option>

                <option value="pet">
                  Sort by Pet Name
                </option>

                <option value="time">
                  Sort by Time
                </option>
              </select>
            </div>

            <div className="appointment-view-switch">
              <button
                type="button"
                title="List View"
                className={
                  viewMode === "list" ? "active" : ""
                }
                onClick={() => setViewMode("list")}
              >
                <FaList />
              </button>

              <button
                type="button"
                title="Calendar View"
                className={
                  viewMode === "calendar" ? "active" : ""
                }
                onClick={() => setViewMode("calendar")}
              >
                <FaTableCellsLarge />
              </button>
            </div>
          </div>
        </div>

        {/* SUMMARY */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, minmax(180px, 1fr))",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #dceae8",
              borderRadius: "12px",
              padding: "17px 20px",
            }}
          >
            <p
              style={{
                margin: "0 0 7px",
                color: "#718481",
                fontSize: "13px",
              }}
            >
              Total This View
            </p>

            <h2 style={{ margin: 0 }}>
              {isLoading || loadError ? "—" : totalThisView}
            </h2>
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #dceae8",
              borderRadius: "12px",
              padding: "17px 20px",
            }}
          >
            <p
              style={{
                margin: "0 0 7px",
                color: "#718481",
                fontSize: "13px",
              }}
            >
              Confirmed
            </p>

            <h2 style={{ margin: 0, color: "#319c97" }}>
              {isLoading || loadError ? "—" : confirmedCount}
            </h2>
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #dceae8",
              borderRadius: "12px",
              padding: "17px 20px",
            }}
          >
            <p
              style={{
                margin: "0 0 7px",
                color: "#718481",
                fontSize: "13px",
              }}
            >
              Pending
            </p>

            <h2 style={{ margin: 0, color: "#d89b37" }}>
              {isLoading || loadError ? "—" : pendingCount}
            </h2>
          </div>
        </div>

        {/* CALENDAR */}

        {viewMode === "calendar" && (
          <>
            {remindersLoading && (
              <p role="status">Loading reminders...</p>
            )}

            {remindersError && (
              <div
                role="alert"
                style={{ marginBottom: 15 }}
              >
                <p style={{ color: "#c0392b" }}>
                  {remindersError}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setRemindersReloadKey(
                      (value) => value + 1
                    )
                  }
                >
                  Retry Reminders
                </button>
              </div>
            )}
          </>
        )}

        {viewMode === "calendar" &&
          !isLoading &&
          !loadError && (
            <div className="compact-calendar">
              <div className="compact-calendar-header">
                <div>
                  <h2>{monthTitle}</h2>

                  <p>
                    {filteredAppointments.length} appointment
                    {filteredAppointments.length !== 1
                      ? "s"
                      : ""}

                    {canViewReminders && !remindersLoading &&
                      !remindersError && (
                        <>
                          {" "}• {filteredReminders.length}
                          {" "}reminder
                          {filteredReminders.length !== 1
                            ? "s"
                            : ""}
                        </>
                      )}
                  </p>
                </div>

                <div className="compact-calendar-navigation">
                  <button
                    type="button"
                    onClick={previousMonth}
                    title="Previous month"
                  >
                    <FaChevronLeft />
                  </button>

                  <button
                    type="button"
                    onClick={nextMonth}
                    title="Next month"
                  >
                    <FaChevronRight />
                  </button>
                </div>
              </div>

              <div className="compact-calendar-weekdays">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>

              <div className="compact-calendar-grid">
                {Array.from({ length: firstDay }).map(
                  (_, index) => (
                    <div
                      key={`empty-${index}`}
                      className="compact-calendar-day empty"
                    />
                  )
                )}

                {Array.from({ length: daysInMonth }).map(
                  (_, index) => {
                    const day = index + 1;
                    const past = isPastDay(day);

                    const dayAppointments =
                      getAppointmentsForDay(day);

                    const dayReminders =
                      canViewReminders && !remindersLoading && !remindersError
                        ? getRemindersForDay(day)
                        : [];

                    return (
                      <div
                        key={day}
                        className={`compact-calendar-day ${
                          isToday(day) ? "today" : ""
                        }`}
                        style={{
                          cursor: past
                            ? "default"
                            : "pointer",
                        }}
                        onClick={() => {
                          if (!past) {
                            openAddModal(getDateString(day));
                          }
                        }}
                      >
                        <div className="compact-day-header">
                          <span className="compact-day-number">
                            {day}
                          </span>

                          <button
                            type="button"
                            className="compact-day-add"
                            title={
                              past
                                ? "Cannot book before today"
                                : "Add appointment"
                            }
                            disabled={isSaving || past}
                            onClick={(event) => {
                              event.stopPropagation();

                              openAddModal(
                                getDateString(day)
                              );
                            }}
                          >
                            <FaPlus />
                          </button>
                        </div>

                        <div
                          className="compact-events"
                          onClick={(event) =>
                            event.stopPropagation()
                          }
                        >
                          {dayAppointments.map(
                            (appointment) => (
                              <button
                                type="button"
                                key={`appointment-${appointment.id}`}
                                className={`compact-event ${
                                  String(
                                    appointment.status || ""
                                  ).toLowerCase()
                                }`}
                                disabled={isSaving}
                                onClick={(event) => {
                                  event.stopPropagation();

                                  handleViewAppointment(
                                    appointment
                                  );
                                }}
                                title={`${appointment.pet} — ${
                                  appointment.type ||
                                  "Appointment"
                                }`}
                              >
                                <span className="compact-event-time">
                                  {formatTime(
                                    appointment.time
                                  )}
                                </span>

                                <span className="compact-event-name">
                                  {appointment.pet}
                                </span>
                              </button>
                            )
                          )}

                          {dayReminders.map((reminder) => (
                            <button
                              type="button"
                              key={`reminder-${reminder.id}`}
                              className="compact-event calendar-reminder"
                              disabled={isSaving}
                              onClick={(event) => {
                                event.stopPropagation();
                                handleViewReminder(reminder);
                              }}
                              title={`${reminder.pet} — ${
                                reminder.type || "Reminder"
                              }${
                                reminder.message
                                  ? ` — ${reminder.message}`
                                  : ""
                              }`}
                            >
                              <span className="compact-event-time">
                                <FaBell />
                              </span>

                              <span className="compact-event-name">
                                {reminder.pet || "Reminder"}

                                {reminder.type
                                  ? ` • ${reminder.type}`
                                  : ""}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              <div className="calendar-legend">
                <span>
                  <i className="legend-dot confirmed" />
                  Confirmed
                </span>

                <span>
                  <i className="legend-dot pending" />
                  Pending
                </span>

                <span>
                  <i className="legend-dot completed" />
                  Completed
                </span>

                <span>
                  <i className="legend-dot cancelled" />
                  Cancelled
                </span>

                <span>
                  <i className="legend-dot reminder" />
                  Reminder
                </span>
              </div>
            </div>
          )}

        {/* LIST VIEW */}

        {viewMode === "list" && (
          <div className="owners-table-container appointment-list-table">
            <table className="owners-table">
              <thead>
                <tr>
                  <th>Pet</th>
                  <th>Owner</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Veterinarian</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ||
                loadError ||
                filteredAppointments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        textAlign: "center",
                        padding: "30px",
                      }}
                    >
                      {isLoading
                        ? "Loading appointments..."
                        : loadError
                          ? "Unable to load appointments."
                          : "No appointments found."}
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td>
                        <strong>{appointment.pet}</strong>
                      </td>

                      <td>{appointment.owner || "—"}</td>
                      <td>{appointment.type || "—"}</td>

                      <td>
                        {formatDate(appointment.date)}
                      </td>

                      <td>
                        {formatTime(appointment.time)}
                      </td>

                      <td>{appointment.veterinarian}</td>
                      <td>{appointment.reason}</td>

                      <td>
                        <span
                          className={`status ${
                            String(
                              appointment.status || ""
                            ).toLowerCase()
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </td>

                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="view-button"
                            disabled={isSaving}
                            onClick={() =>
                              handleViewAppointment(
                                appointment
                              )
                            }
                          >
                            View
                          </button>

                          <button
                            type="button"
                            className="edit-button"
                            disabled={isSaving}
                            onClick={() =>
                              handleOpenEdit(appointment)
                            }
                          >
                            <FaPen />
                          </button>

                          <button
                            type="button"
                            className="delete-button"
                            disabled={isSaving}
                            onClick={() =>
                              handleDeleteAppointment(
                                appointment.id
                              )
                            }
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* ADD APPOINTMENT */}

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div>
                <h2>New Appointment</h2>
                <p>Enter appointment information</p>
              </div>

              <button
                type="button"
                className="modal-close"
                disabled={isSaving}
                onClick={closeAddModal}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleAddAppointment}
              aria-busy={isSaving}
            >
              {renderAppointmentFields(
                newAppointment,
                "add"
              )}

              <div className="workflow-actions">
                <button
                  type="button"
                  className="workflow-button workflow-button-secondary"
                  onClick={closeAddModal}
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="workflow-button workflow-button-primary"
                  disabled={isSaving || pets.length === 0}
                >
                  {isSaving
                    ? "Saving..."
                    : "Add Appointment"}
                </button>

                <button
                  type="button"
                  className="workflow-button workflow-button-primary"
                  onClick={handleSaveAndStartVisit}
                  disabled={isSaving || pets.length === 0}
                >
                  Save & Start Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW APPOINTMENT */}

      {showViewModal && selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal-container appointment-view-modal">
            <div className="modal-header">
              <div>
                <h2>{selectedAppointment.pet}</h2>
                <p>Appointment details</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeViewModal}
                disabled={isSaving}
              >
                ×
              </button>
            </div>

            <div className="appointment-view-status">
              <span
                className={`status ${
                  String(
                    selectedAppointment.status || ""
                  ).toLowerCase()
                }`}
              >
                {selectedAppointment.status}
              </span>
            </div>

            <div className="detail-row">
              <span>Owner</span>

              <strong>
                {selectedAppointment.owner || "—"}
              </strong>
            </div>

            <div className="detail-row">
              <span>Appointment Type</span>

              <strong>
                {selectedAppointment.type || "—"}
              </strong>
            </div>

            <div className="detail-row">
              <span>Date</span>

              <strong>
                {formatDate(selectedAppointment.date)}
              </strong>
            </div>

            <div className="detail-row">
              <span>
                <FaClock /> Time
              </span>

              <strong>
                {formatTime(selectedAppointment.time)}
              </strong>
            </div>

            <div className="detail-row">
              <span>
                <FaUserDoctor /> Veterinarian
              </span>

              <strong>
                {selectedAppointment.veterinarian}
              </strong>
            </div>

            <div className="detail-row">
              <span>Reason</span>

              <strong>
                {selectedAppointment.reason}
              </strong>
            </div>

            <div className="workflow-actions">
              <button
                type="button"
                className="delete-button"
                disabled={isSaving}
                onClick={() =>
                  handleDeleteAppointment(
                    selectedAppointment.id
                  )
                }
              >
                <FaTrash />
              </button>

              <button
                type="button"
                className="workflow-button workflow-button-secondary"
                disabled={isSaving}
                onClick={() =>
                  handleOpenEdit(selectedAppointment)
                }
              >
                <FaPen />
                Edit
              </button>

              <button
                type="button"
                className="workflow-button workflow-button-primary"
                disabled={isSaving}
                onClick={() =>
                  handleStartVisit(selectedAppointment)
                }
              >
                Start Visit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT APPOINTMENT */}

      {showEditModal && selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div>
                <h2>Edit Appointment</h2>
                <p>Update appointment information</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeEditModal}
                disabled={isSaving}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleUpdateAppointment}
              aria-busy={isSaving}
            >
              {renderAppointmentFields(
                selectedAppointment,
                "edit"
              )}

              <div className="workflow-actions">
                <button
                  type="button"
                  className="workflow-button workflow-button-secondary"
                  onClick={closeEditModal}
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="workflow-button workflow-button-primary"
                  disabled={isSaving}
                >
                  {isSaving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REMINDER DETAILS */}

      {canViewReminders && selectedReminder && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeReminderModal();
            }
          }}
        >
          <div className="modal-container appointment-view-modal">
            <div className="modal-header">
              <div>
                <h2>Reminder Details</h2>

                <p>
                  {selectedReminder.pet || "Clinic reminder"}
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeReminderModal}
              >
                ×
              </button>
            </div>

            <div className="detail-row">
              <span>Pet</span>

              <strong>
                {selectedReminder.pet || "—"}
              </strong>
            </div>

            <div className="detail-row">
              <span>Owner</span>

              <strong>
                {selectedReminder.owner || "—"}
              </strong>
            </div>

            <div className="detail-row">
              <span>Type</span>

              <strong>
                {selectedReminder.type || "—"}
              </strong>
            </div>

            <div className="detail-row">
              <span>Due Date</span>

              <strong>
                {formatDate(selectedReminder.dueDate)}
              </strong>
            </div>

            <div className="detail-row">
              <span>Status</span>

              <strong>
                {selectedReminder.status || "—"}
              </strong>
            </div>

            <div
              className="detail-row"
              style={{ alignItems: "flex-start" }}
            >
              <span>Message</span>

              <strong
                style={{
                  maxWidth: "65%",
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                  textAlign: "right",
                }}
              >
                {selectedReminder.message || "—"}
              </strong>
            </div>

            <div className="workflow-actions">
              <button
                type="button"
                className="workflow-button workflow-button-secondary"
                onClick={closeReminderModal}
              >
                Close
              </button>

              <button
                type="button"
                className="workflow-button workflow-button-primary"
                onClick={() => navigate("/reminders")}
              >
                Open Reminders
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Appointments;