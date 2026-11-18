import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  getPets,
  createPet,
  updatePet,
  deletePet,
} from "../api/petsApi";
import { getOwners } from "../api/ownersApi";

import {
  FaEye,
  FaPen,
  FaTrash,
  FaSortAmountDown,
  FaSearch,
  FaTimes,
  FaFileExport,
  FaPaw,
  FaHeart,
  FaIdCard,
  FaCamera,
} from "react-icons/fa";

/* PET SPECIES + BREEDS */

const PET_BREEDS = {
  Bird: [
    "African Grey Parrot", "Budgerigar", "Canary",
    "Cockatiel", "Cockatoo", "Conure", "Finch",
    "Lovebird", "Macaw", "Parrot", "Other",
  ],
  Cat: [
    "Abyssinian", "American Shorthair", "Bengal",
    "Birman", "British Shorthair", "Burmese",
    "Domestic Longhair", "Domestic Shorthair",
    "Maine Coon", "Norwegian Forest Cat", "Persian",
    "Ragdoll", "Russian Blue", "Scottish Fold",
    "Siamese", "Sphynx", "Turkish Angora", "Other",
  ],
  Dog: [
    "Akita", "Alaskan Malamute", "Australian Shepherd",
    "Beagle", "Belgian Malinois", "Bernese Mountain Dog",
    "Bichon Frise", "Border Collie", "Boston Terrier",
    "Boxer", "Bulldog", "Cane Corso",
    "Cavalier King Charles Spaniel", "Chihuahua",
    "Chow Chow", "Cocker Spaniel", "Dachshund",
    "Dalmatian", "Doberman Pinscher", "French Bulldog",
    "German Shepherd", "Golden Retriever", "Great Dane",
    "Havanese", "Husky", "Jack Russell Terrier",
    "Labrador Retriever", "Maltese", "Miniature Schnauzer",
    "Mixed Breed", "Pekingese", "Pomeranian", "Poodle",
    "Pug", "Rottweiler", "Samoyed", "Shih Tzu",
    "Yorkshire Terrier", "Other",
  ],
  Ferret: [
    "Albino", "Black Sable", "Champagne", "Chocolate",
    "Cinnamon", "Sable", "Other",
  ],
  Fish: [
    "Angelfish", "Betta", "Cichlid", "Goldfish",
    "Guppy", "Koi", "Molly", "Tetra", "Other",
  ],
  "Guinea Pig": [
    "Abyssinian", "American", "Peruvian", "Silkie",
    "Skinny Pig", "Teddy", "Other",
  ],
  Hamster: [
    "Campbell's Dwarf", "Chinese", "Roborovski",
    "Syrian", "Winter White", "Other",
  ],
  Horse: [
    "Andalusian", "Appaloosa", "Arabian", "Friesian",
    "Quarter Horse", "Thoroughbred", "Warmblood", "Other",
  ],
  Rabbit: [
    "Angora", "Dutch", "Flemish Giant", "Holland Lop",
    "Lionhead", "Mini Lop", "Mini Rex",
    "Netherland Dwarf", "Rex", "Other",
  ],
  Reptile: [
    "Bearded Dragon", "Boa Constrictor", "Chameleon",
    "Corn Snake", "Gecko", "Iguana", "Python",
    "Tortoise", "Turtle", "Other",
  ],
  Other: ["Other"],
};

const PET_SPECIES = Object.keys(PET_BREEDS).sort((a, b) =>
  a.localeCompare(b)
);

/* AGE + DATE HELPERS */

// Use calendar dates without time-zone or daylight-saving shifts.
const getTodayDate = () => {
  const today = new Date();

  return new Date(Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ));
};

const formatCalendarDate = (date) => {
  if (!date || Number.isNaN(date.getTime())) return "";

  return [
    String(date.getUTCFullYear()).padStart(4, "0"),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
};

const parseCalendarDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) {
    return null;
  }

  const date = new Date(`${value}T00:00:00Z`);

  if (
    Number.isNaN(date.getTime()) ||
    formatCalendarDate(date) !== value
  ) {
    return null;
  }

  return date;
};

const shiftCalendarMonths = (date, amount) => {
  const shifted = new Date(date.getTime());
  const originalDay = shifted.getUTCDate();

  shifted.setUTCDate(1);
  shifted.setUTCMonth(shifted.getUTCMonth() + amount);

  const lastDay = new Date(Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth() + 1,
    0
  )).getUTCDate();

  shifted.setUTCDate(Math.min(originalDay, lastDay));
  return shifted;
};

const getAgePartsFromDOB = (dateOfBirth) => {
  const birth = parseCalendarDate(dateOfBirth);
  const today = getTodayDate();

  if (!birth || birth > today) {
    return {
      ageYears: "",
      ageMonths: "",
      ageDays: "",
    };
  }

  let totalMonths =
    (today.getUTCFullYear() - birth.getUTCFullYear()) * 12 +
    today.getUTCMonth() -
    birth.getUTCMonth();

  let anchor = shiftCalendarMonths(today, -totalMonths);

  if (anchor < birth) {
    totalMonths -= 1;
    anchor = shiftCalendarMonths(today, -totalMonths);
  }

  const days = Math.round(
    (anchor.getTime() - birth.getTime()) / 86400000
  );

  return {
    ageYears: String(Math.floor(totalMonths / 12)),
    ageMonths: String(totalMonths % 12),
    ageDays: String(days),
  };
};

const formatAgeParts = (parts) => {
  const fields = [
    ["ageYears", "year"],
    ["ageMonths", "month"],
    ["ageDays", "day"],
  ];

  return fields
    .filter(([field]) =>
      parts[field] !== "" &&
      parts[field] !== null &&
      parts[field] !== undefined
    )
    .map(([field, unit]) => {
      const value = Number(parts[field]);
      return `${value} ${unit}${value === 1 ? "" : "s"}`;
    })
    .join(" ");
};

const calculateAgeFromDOB = (dateOfBirth) =>
  formatAgeParts(getAgePartsFromDOB(dateOfBirth));

const estimatedDOBFromAgeParts = (parts) => {
  const hasAnyValue = [
    parts.ageYears,
    parts.ageMonths,
    parts.ageDays,
  ].some((value) =>
    value !== "" && value !== null && value !== undefined
  );

  if (!hasAnyValue) return "";

  const years = Number(parts.ageYears || 0);
  const months = Number(parts.ageMonths || 0);
  const days = Number(parts.ageDays || 0);

  if (
    !Number.isInteger(years) ||
    !Number.isInteger(months) ||
    !Number.isInteger(days) ||
    years < 0 ||
    years > 999 ||
    months < 0 ||
    months > 11 ||
    days < 0 ||
    days > 31
  ) {
    return "";
  }

  const date = shiftCalendarMonths(
    getTodayDate(),
    -(years * 12 + months)
  );

  if (parts.ageDays === "" ||
      parts.ageDays === null ||
      parts.ageDays === undefined) {
    // No day supplied: use the first day of the calculated month.
    date.setUTCDate(1);
  } else {
    // An explicit zero is different from an empty Days field.
    date.setUTCDate(date.getUTCDate() - days);
  }

  if (date.getUTCFullYear() < 1) return "";

  return formatCalendarDate(date);
};

const parseStoredAgeParts = (value) => {
  const text = String(value || "").trim().toLowerCase();

  const years = text.match(/(\d+)\s*years?\b/);
  const months = text.match(/(\d+)\s*months?\b/);
  const days = text.match(/(\d+)\s*days?\b/);

  if (years || months || days) {
    return {
      ageYears: years ? years[1] : "",
      ageMonths: months ? months[1] : "",
      ageDays: days ? days[1] : "",
    };
  }

  if (/^\d+$/.test(text)) {
    return {
      ageYears: text,
      ageMonths: "",
      ageDays: "",
    };
  }

  return null;
};

const getEditableAgeParts = (pet) => {
  // Preserve the precision originally entered for estimated dates.
  if (pet.estimatedDOB) {
    const savedParts = parseStoredAgeParts(pet.age);
    if (savedParts) return savedParts;
  }

  if (pet.dateOfBirth) {
    return getAgePartsFromDOB(pet.dateOfBirth);
  }

  return parseStoredAgeParts(pet.age) || {
    ageYears: "",
    ageMonths: "",
    ageDays: "",
  };
};

const extractAgeYears = (value) => {
  if (value === null || value === undefined) return null;

  const match = String(value).match(/\d+/);
  if (!match) return null;

  const years = Number(match[0]);
  return Number.isNaN(years) || years < 0 ? null : years;
};

/* EXISTING HELPERS */

const COLOR_PRESETS = [
  { name: "Black", value: "#1f1f1f" },
  { name: "White", value: "#ffffff" },
  { name: "Brown", value: "#8b5a2b" },
  { name: "Golden", value: "#d4a017" },
  { name: "Cream", value: "#f2dfbd" },
  { name: "Gray", value: "#8a8a8a" },
  { name: "Orange", value: "#d97721" },
  { name: "Tan", value: "#c79a63" },
];

const getColorHex = (color) => {
  const preset = COLOR_PRESETS.find(
    (item) =>
      item.name.toLowerCase() ===
      String(color || "").toLowerCase()
  );

  return preset?.value || "#55b7b2";
};

const getOwnerName = (owner) =>
  `${owner.firstName || ""} ${owner.lastName || ""}`.trim();

const getEmptyPet = () => ({
  name: "",
  owner: "",
  ownerId: "",
  species: "",
  breed: "",
  age: "",
  ageYears: "",
  ageMonths: "",
  ageDays: "",
  dateOfBirth: "",
  estimatedDOB: false,
  sex: "",
  color: "",
  colorHex: "#55b7b2",
  weight: "",
  microchipNumber: "",
  bloodType: "",
  allergies: "",
  chronicConditions: "",
  notes: "",
  profilePhoto: "",
  timeline: [],
});

const getPetPayload = (pet) => {
  const {
    ageYears,
    ageMonths,
    ageDays,
    ...payload
  } = pet;

  return payload;
};

/* SEARCHABLE OWNER INPUT */

function OwnerSearchInput({
  owners,
  value,
  selectedId,
  onType,
  onSelect,
  disabled,
  inputId,
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const listRef = useRef(null);

  const query = String(value || "").trim().toLowerCase();

  const matches = useMemo(
    () => owners.filter((owner) =>
      getOwnerName(owner).toLowerCase().includes(query)
    ),
    [owners, query]
  );

  useEffect(() => {
    const closeOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("pointerdown", closeOutside);

    return () =>
      document.removeEventListener("pointerdown", closeOutside);
  }, []);

  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  useEffect(() => {
    if (activeIndex >= 0) {
      listRef.current
        ?.querySelector(`[data-option-index="${activeIndex}"]`)
        ?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const chooseOwner = (owner) => {
    onSelect(owner);
    setOpen(false);
    setActiveIndex(-1);
  };

  const listVisible = open && !disabled;

  return (
    <div
      ref={wrapperRef}
      className="pet-owner-search"
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
        placeholder={
          owners.length ? "Type owner name..." : "No owners available"
        }
        autoComplete="off"
        required
        disabled={disabled}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={listVisible}
        aria-controls={`${inputId}-options`}
        aria-activedescendant={
          listVisible && activeIndex >= 0
            ? `${inputId}-option-${activeIndex}`
            : undefined
        }
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          onType(event.target.value);
          setOpen(true);
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
              chooseOwner(matches[activeIndex]);
            } else if (matches.length === 1) {
              chooseOwner(matches[0]);
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
          aria-label="Matching owners"
          className="pet-owner-options"
          style={{
            position: "absolute",
            top: "calc(100% + 5px)",
            left: 0,
            right: 0,
            zIndex: 30,
            maxHeight: "200px",
            overflowY: "auto",
            overscrollBehavior: "contain",
            background: "#ffffff",
            border: "1px solid #d5e5e3",
            borderRadius: "8px",
            boxShadow: "0 8px 20px rgba(24, 56, 56, 0.12)",
          }}
        >
          {matches.length ? (
            matches.map((owner, index) => (
              <div
                key={owner.id}
                id={`${inputId}-option-${index}`}
                role="option"
                data-option-index={index}
                aria-selected={
                  String(selectedId) === String(owner.id)
                }
                className="pet-owner-option"
                onPointerDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => chooseOwner(owner)}
                style={{
                  padding: "11px 12px",
                  cursor: "pointer",
                  background:
                    activeIndex === index ? "#e8f7f7" : "#ffffff",
                  color: "#405656",
                  fontSize: "14px",
                  overflowWrap: "anywhere",
                }}
              >
                <div>{getOwnerName(owner)}</div>

                {owner.phone && (
                  <div
                    style={{
                      marginTop: "3px",
                      color: "#7b8d8d",
                      fontSize: "11px",
                    }}
                  >
                    {owner.phone}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div
              style={{
                padding: "12px",
                color: "#7b8d8d",
                fontSize: "13px",
              }}
            >
              No matching owners found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* AGE INPUTS */

function PetAgeInputs({ data, onChange, disabled }) {
  return (
    <div className="form-field">
      <label>Age</label>

      <div
        className="pet-age-inputs"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "8px",
          minWidth: 0,
        }}
      >
        {[
          ["ageYears", "Years", 999],
          ["ageMonths", "Months", 11],
          ["ageDays", "Days", 31],
        ].map(([name, label, max]) => (
          <div key={name} style={{ minWidth: 0 }}>
            <input
              type="number"
              name={name}
              aria-label={`Age in ${label.toLowerCase()}`}
              value={data[name] ?? ""}
              onChange={onChange}
              placeholder={label}
              min={0}
              max={max}
              step={1}
              disabled={disabled}
              style={{
                width: "100%",
                minWidth: 0,
                boxSizing: "border-box",
              }}
            />

            <span
              style={{
                display: "block",
                marginTop: "4px",
                color: "#7b8d8d",
                fontSize: "11px",
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      <span className="pet-field-hint">
        Leave Days empty to use the first day of the calculated
        month. Enter Days, including 0, for a full date calculation.
      </span>
    </div>
  );
}

/* PETS */

function Pets() {
  const location = useLocation();
  const navigate = useNavigate();

  const [pets, setPets] = useState([]);
  const [owners, setOwners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const savingRef = useRef(false);
  const photoReadingRef = useRef({
    add: false,
    edit: false,
  });

  const tableScrollRef = useRef(null);

  const [addPhotoLoading, setAddPhotoLoading] = useState(false);
  const [editPhotoLoading, setEditPhotoLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);

  const [addTab, setAddTab] = useState("basic");
  const [editTab, setEditTab] = useState("basic");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);

  const [newPet, setNewPet] = useState(getEmptyPet);

  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;

    async function loadData() {
      setIsLoading(true);
      setLoadError("");

      try {
        const [savedPets, savedOwners] = await Promise.all([
          getPets({ signal: controller.signal }),
          getOwners({ signal: controller.signal }),
        ]);

        if (disposed) return;

        setPets(savedPets);
        setOwners(savedOwners);
      } catch (error) {
        if (disposed || error.name === "AbortError") return;

        setLoadError(
          error.message || "Unable to load pets. Please try again."
        );
      } finally {
        if (!disposed) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      disposed = true;
      controller.abort();
    };
  }, []);

  // Horizontal trackpad gestures scroll naturally.
  // A regular mouse wheel moves the table horizontally when it overflows.
  useEffect(() => {
    const element = tableScrollRef.current;
    if (!element) return;

    const handleWheel = (event) => {
      if (event.ctrlKey || event.metaKey) return;

      const maxScroll = element.scrollWidth - element.clientWidth;
      if (maxScroll <= 1) return;

      let delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;

      if (event.deltaMode === 1) delta *= 16;
      if (event.deltaMode === 2) delta *= element.clientWidth;

      if (!delta) return;

      const next = Math.max(
        0,
        Math.min(maxScroll, element.scrollLeft + delta)
      );

      if (Math.abs(next - element.scrollLeft) > 0.5) {
        event.preventDefault();
        element.scrollLeft = next;
      }
    };

    element.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    return () =>
      element.removeEventListener("wheel", handleWheel);
  }, []);

  const sortedOwners = useMemo(
    () => [...owners].sort((a, b) =>
      getOwnerName(a).localeCompare(getOwnerName(b))
    ),
    [owners]
  );

  const newPetBreeds = useMemo(() => {
    if (!newPet.species) return [];

    return [...(PET_BREEDS[newPet.species] || [])].sort(
      (a, b) => a.localeCompare(b)
    );
  }, [newPet.species]);

  const editPetBreeds = useMemo(() => {
    if (!selectedPet?.species) return [];

    return [...(PET_BREEDS[selectedPet.species] || [])].sort(
      (a, b) => a.localeCompare(b)
    );
  }, [selectedPet?.species]);

  useEffect(() => {
    if (!location.state?.openAddPet || isLoading || loadError) {
      return;
    }

    const ownerFromPreviousStep = location.state?.owner;

    const requestedOwnerId =
      location.state?.ownerId ??
      (typeof ownerFromPreviousStep === "object"
        ? ownerFromPreviousStep?.id
        : null);

    let matchingOwner = owners.find(
      (owner) =>
        requestedOwnerId != null &&
        String(owner.id) === String(requestedOwnerId)
    );

    if (!matchingOwner && requestedOwnerId == null) {
      const requestedName =
        typeof ownerFromPreviousStep === "string"
          ? ownerFromPreviousStep.trim()
          : ownerFromPreviousStep
            ? getOwnerName(ownerFromPreviousStep)
            : "";

      const matches = owners.filter(
        (owner) =>
          requestedName &&
          getOwnerName(owner).toLowerCase() ===
            requestedName.toLowerCase()
      );

      if (matches.length === 1) matchingOwner = matches[0];
    }

    setNewPet({
      ...getEmptyPet(),
      ownerId: matchingOwner ? String(matchingOwner.id) : "",
      owner: matchingOwner ? getOwnerName(matchingOwner) : "",
    });

    setAddTab("basic");
    setShowAddModal(true);

    navigate(location.pathname, {
      replace: true,
      state: null,
    });
  }, [
    location.state,
    location.pathname,
    navigate,
    owners,
    isLoading,
    loadError,
  ]);

  const filteredPets = pets.filter((pet) => {
    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      (pet.name || "").toLowerCase().includes(searchText) ||
      (pet.owner || "").toLowerCase().includes(searchText) ||
      (pet.species || "").toLowerCase().includes(searchText) ||
      (pet.breed || "").toLowerCase().includes(searchText) ||
      (pet.age || "").toLowerCase().includes(searchText);

    const matchesSpecies =
      speciesFilter === "all" || pet.species === speciesFilter;

    return matchesSearch && matchesSpecies;
  });

  const sortedPets = [...filteredPets].sort((a, b) => {
    if (sortBy === "name-asc") {
      return (a.name || "").localeCompare(b.name || "");
    }

    if (sortBy === "name-desc") {
      return (b.name || "").localeCompare(a.name || "");
    }

    if (sortBy === "owner-asc") {
      return (a.owner || "").localeCompare(b.owner || "");
    }

    if (sortBy === "owner-desc") {
      return (b.owner || "").localeCompare(a.owner || "");
    }

    if (sortBy === "species-asc") {
      return (a.species || "").localeCompare(b.species || "");
    }

    if (sortBy === "species-desc") {
      return (b.species || "").localeCompare(a.species || "");
    }

    if (sortBy === "age-low") {
      return (
        (extractAgeYears(a.age) ?? 999) -
        (extractAgeYears(b.age) ?? 999)
      );
    }

    if (sortBy === "age-high") {
      return (
        (extractAgeYears(b.age) ?? -1) -
        (extractAgeYears(a.age) ?? -1)
      );
    }

    return Number(a.id) - Number(b.id);
  });

  const totalPages = Math.max(
    1,
    Math.ceil(sortedPets.length / itemsPerPage)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);
  const indexOfLastPet = safeCurrentPage * itemsPerPage;
  const indexOfFirstPet = indexOfLastPet - itemsPerPage;

  const currentPets = sortedPets.slice(
    indexOfFirstPet,
    indexOfLastPet
  );

  const handleExport = () => {
    const headers = [
      "Pet Name", "Owner", "Species", "Breed", "Age",
      "Sex", "Date of Birth", "Color", "Weight",
      "Microchip Number", "Blood Type", "Allergies",
      "Chronic Conditions", "Notes",
    ];

    const rows = sortedPets.map((pet) => [
      pet.name,
      pet.owner,
      pet.species,
      pet.breed,
      pet.age,
      pet.sex || "",
      pet.dateOfBirth || "",
      pet.color || "",
      pet.weight || "",
      pet.microchipNumber || "",
      pet.bloodType || "",
      pet.allergies || "",
      pet.chronicConditions || "",
      pet.notes || "",
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
    link.download = "pets-data.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

  const notifyPetsUpdated = () => {
    window.dispatchEvent(new Event("vetClinicPetsUpdated"));
  };

  const handleOpenAdd = () => {
    if (isLoading || loadError || savingRef.current) return;

    setNewPet(getEmptyPet());
    setAddTab("basic");
    setShowAddModal(true);
  };

  const handleCloseAdd = () => {
    if (savingRef.current || photoReadingRef.current.add) return;

    setShowAddModal(false);
    setAddTab("basic");
    setNewPet(getEmptyPet());
  };

  const changePetField = (previous, name, value) => {
    if (name === "ownerId") {
      const owner = owners.find(
        (item) => String(item.id) === String(value)
      );

      return {
        ...previous,
        ownerId: value,
        owner: owner ? getOwnerName(owner) : "",
      };
    }

    if (name === "species") {
      return {
        ...previous,
        species: value,
        breed: "",
      };
    }

    if (name === "dateOfBirth") {
      return {
        ...previous,
        dateOfBirth: value,
        ...getAgePartsFromDOB(value),
        age: calculateAgeFromDOB(value),
        estimatedDOB: false,
      };
    }

    if (["ageYears", "ageMonths", "ageDays"].includes(name)) {
      if (value !== "" && !/^\d+$/.test(value)) {
        return previous;
      }

      const parts = {
        ageYears: previous.ageYears ?? "",
        ageMonths: previous.ageMonths ?? "",
        ageDays: previous.ageDays ?? "",
        [name]: value,
      };

      const dateOfBirth = estimatedDOBFromAgeParts(parts);

      return {
        ...previous,
        ...parts,
        age: formatAgeParts(parts),
        dateOfBirth,
        estimatedDOB: Boolean(dateOfBirth),
      };
    }

    return {
      ...previous,
      [name]: value,
    };
  };

  const handleNewPetChange = (e) => {
    const { name, value } = e.target;

    setNewPet((previous) =>
      changePetField(previous, name, value)
    );
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setSelectedPet((previous) =>
      previous ? changePetField(previous, name, value) : previous
    );
  };

  const handleNewOwnerType = (value) => {
    setNewPet((previous) => ({
      ...previous,
      owner: value,
      ownerId: "",
    }));
  };

  const handleNewOwnerSelect = (owner) => {
    setNewPet((previous) => ({
      ...previous,
      ownerId: String(owner.id),
      owner: getOwnerName(owner),
    }));
  };

  const handleEditOwnerType = (value) => {
    setSelectedPet((previous) => ({
      ...previous,
      owner: value,
      ownerId: "",
    }));
  };

  const handleEditOwnerSelect = (owner) => {
    setSelectedPet((previous) => ({
      ...previous,
      ownerId: String(owner.id),
      owner: getOwnerName(owner),
    }));
  };

  const handleNewPetColorChange = (e) => {
    const colorHex = e.target.value;

    setNewPet((previous) => ({
      ...previous,
      colorHex,
      color: colorHex,
    }));
  };

  const handleNewPetColorNameChange = (e) => {
    const color = e.target.value;

    setNewPet((previous) => ({
      ...previous,
      color,
    }));
  };

  const readPhoto = (e, target) => {
    const file = e.target.files?.[0];

    if (
      !file ||
      savingRef.current ||
      photoReadingRef.current[target]
    ) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      window.alert("Please choose an image file.");
      e.target.value = "";
      return;
    }

    const isAdd = target === "add";
    const setLoading = isAdd
      ? setAddPhotoLoading
      : setEditPhotoLoading;

    photoReadingRef.current[target] = true;
    setLoading(true);

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") return;

      if (isAdd) {
        setNewPet((previous) => ({
          ...previous,
          profilePhoto: reader.result,
        }));
      } else {
        setSelectedPet((previous) =>
          previous
            ? { ...previous, profilePhoto: reader.result }
            : previous
        );
      }
    };

    reader.onerror = () => {
      window.alert("Unable to read this image. Please try again.");
    };

    reader.onloadend = () => {
      photoReadingRef.current[target] = false;
      setLoading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleNewPetPhoto = (e) => readPhoto(e, "add");
  const handleEditPetPhoto = (e) => readPhoto(e, "edit");

  const validatePetAge = (pet) => {
    const limits = [
      ["ageYears", 999],
      ["ageMonths", 11],
      ["ageDays", 31],
    ];

    let hasAge = false;

    for (const [field, max] of limits) {
      const value = pet[field];

      if (value === "" || value == null) continue;

      hasAge = true;
      const number = Number(value);

      if (
        !Number.isInteger(number) ||
        number < 0 ||
        number > max
      ) {
        return "Enter a valid age: Years 0–999, Months 0–11 and Days 0–31.";
      }
    }

    if (hasAge && !pet.dateOfBirth) {
      return "Please enter a valid age.";
    }

    if (pet.dateOfBirth) {
      const birth = parseCalendarDate(pet.dateOfBirth);

      if (!birth || birth > getTodayDate()) {
        return "Date of birth must be a valid date, today or earlier.";
      }
    }

    return "";
  };

  const handleAddPet = async (e) => {
    e.preventDefault();

    if (photoReadingRef.current.add || savingRef.current) return;

    const action = e.nativeEvent.submitter?.value;

    const ownerExists = owners.some(
      (owner) => String(owner.id) === String(newPet.ownerId)
    );

    if (
      !newPet.name.trim() ||
      !ownerExists ||
      !newPet.species ||
      !newPet.breed
    ) {
      setAddTab("basic");
      window.alert(
        "Please enter the pet name and select an existing owner, species and breed."
      );
      return;
    }

    const ageError = validatePetAge(newPet);

    if (ageError) {
      setAddTab("basic");
      window.alert(ageError);
      return;
    }

    if (!beginSave()) return;

    try {
      const pet = await createPet({
        ...getPetPayload(newPet),
        colorHex: newPet.colorHex || getColorHex(newPet.color),
      });

      setPets((previousPets) => [...previousPets, pet]);

      setNewPet(getEmptyPet());
      setAddTab("basic");
      setShowAddModal(false);
      notifyPetsUpdated();

      if (action === "save-and-book-appointment") {
        navigate("/appointments", {
          state: {
            openAddAppointment: true,
            petId: pet.id,
            pet,
            ownerId: pet.ownerId,
            ownerName: pet.owner,
            owner: pet.owner,
          },
        });
      }
    } catch (error) {
      window.alert(error.message || "Unable to save the pet.");
    } finally {
      endSave();
    }
  };

  const handleViewPet = (pet) => {
    navigate(`/pets/${pet.id}`, {
      state: { pet },
    });
  };

  const handleOpenEdit = (pet) => {
    if (savingRef.current) return;

    setSelectedPet({
      ...pet,
      ...getEditableAgeParts(pet),
      ownerId: String(pet.ownerId),
      colorHex: pet.colorHex || getColorHex(pet.color),
      estimatedDOB: pet.estimatedDOB || false,
    });

    setEditTab("basic");
    setShowEditModal(true);
  };

  const handleCloseEdit = () => {
    if (savingRef.current || photoReadingRef.current.edit) return;

    setShowEditModal(false);
    setSelectedPet(null);
    setEditTab("basic");
  };

  const handleEditColorChange = (e) => {
    const colorHex = e.target.value;

    setSelectedPet((previous) => ({
      ...previous,
      colorHex,
      color: colorHex,
    }));
  };

  const handleEditColorNameChange = (e) => {
    const color = e.target.value;

    setSelectedPet((previous) => ({
      ...previous,
      color,
    }));
  };

  const handleUpdatePet = async (e) => {
    e.preventDefault();

    if (
      !selectedPet ||
      savingRef.current ||
      photoReadingRef.current.edit
    ) {
      return;
    }

    const ownerExists = owners.some(
      (owner) =>
        String(owner.id) === String(selectedPet.ownerId)
    );

    if (
      !selectedPet.name.trim() ||
      !ownerExists ||
      !selectedPet.species ||
      !selectedPet.breed
    ) {
      setEditTab("basic");
      window.alert(
        "Please enter the pet name and select an existing owner, species and breed."
      );
      return;
    }

    const ageError = validatePetAge(selectedPet);

    if (ageError) {
      setEditTab("basic");
      window.alert(ageError);
      return;
    }

    if (!beginSave()) return;

    try {
      const savedPet = await updatePet(
        selectedPet.id,
        getPetPayload(selectedPet)
      );

      setPets((previousPets) =>
        previousPets.map((pet) =>
          pet.id === savedPet.id ? savedPet : pet
        )
      );

      setShowEditModal(false);
      setSelectedPet(null);
      setEditTab("basic");
      notifyPetsUpdated();
    } catch (error) {
      window.alert(error.message || "Unable to update the pet.");
    } finally {
      endSave();
    }
  };

  const handleDeletePet = (pet) => {
    if (savingRef.current) return;

    setPetToDelete(pet);
    setShowDeleteModal(true);
  };

  const cancelDeletePet = () => {
    if (savingRef.current) return;

    setShowDeleteModal(false);
    setPetToDelete(null);
  };

  const confirmDeletePet = async () => {
    if (!petToDelete || !beginSave()) return;

    try {
      await deletePet(petToDelete.id);

      setPets((previousPets) =>
        previousPets.filter((pet) => pet.id !== petToDelete.id)
      );

      setShowDeleteModal(false);
      setPetToDelete(null);
      notifyPetsUpdated();
    } catch (error) {
      window.alert(error.message || "Unable to delete the pet.");
    } finally {
      endSave();
    }
  };

  const ModalTabs = ({ activeTab, onChange }) => (
    <div className="pet-modal-tabs">
      <button
        type="button"
        className={`pet-modal-tab ${
          activeTab === "basic" ? "active" : ""
        }`}
        onClick={() => onChange("basic")}
      >
        <FaPaw />
        Basic Info
      </button>

      <button
        type="button"
        className={`pet-modal-tab ${
          activeTab === "health" ? "active" : ""
        }`}
        onClick={() => onChange("health")}
      >
        <FaHeart />
        Health
      </button>

      <button
        type="button"
        className={`pet-modal-tab ${
          activeTab === "identification" ? "active" : ""
        }`}
        onClick={() => onChange("identification")}
      >
        <FaIdCard />
        Identification
      </button>

      <button
        type="button"
        className={`pet-modal-tab ${
          activeTab === "photo" ? "active" : ""
        }`}
        onClick={() => onChange("photo")}
      >
        <FaCamera />
        Photo & Notes
      </button>
    </div>
  );
  const renderPetFields = (data, mode) => {
    const isEdit = mode === "edit";
    const activeTab = isEdit ? editTab : addTab;
    const onChange = isEdit
      ? handleEditChange
      : handleNewPetChange;

    const breeds = isEdit ? editPetBreeds : newPetBreeds;
    const photoLoading = isEdit
      ? editPhotoLoading
      : addPhotoLoading;

    return (
      <>
        {activeTab === "basic" && (
          <div className="pet-tab-panel">
            <div className="pet-form-grid">
              <div className="form-field">
                <label>Pet Name *</label>
                <input
                  type="text"
                  name="name"
                  value={data.name || ""}
                  onChange={onChange}
                  placeholder="Enter pet name"
                  maxLength={100}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor={`${mode}-pet-owner`}>
                  Owner Name *
                </label>

                <OwnerSearchInput
                  inputId={`${mode}-pet-owner`}
                  owners={sortedOwners}
                  value={data.owner}
                  selectedId={data.ownerId}
                  onType={
                    isEdit
                      ? handleEditOwnerType
                      : handleNewOwnerType
                  }
                  onSelect={
                    isEdit
                      ? handleEditOwnerSelect
                      : handleNewOwnerSelect
                  }
                  disabled={isSaving}
                />
              </div>

              <div className="form-field">
                <label>Species *</label>
                <select
                  name="species"
                  value={data.species || ""}
                  onChange={onChange}
                  required
                >
                  <option value="">Select species</option>
                  {PET_SPECIES.map((species) => (
                    <option key={species} value={species}>
                      {species}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Breed *</label>
                <select
                  name="breed"
                  value={data.breed || ""}
                  onChange={onChange}
                  disabled={!data.species}
                  required
                >
                  <option value="">
                    {data.species
                      ? "Select breed"
                      : "Select species first"}
                  </option>

                  {breeds.map((breed) => (
                    <option key={breed} value={breed}>
                      {breed}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Sex</label>
                <select
                  name="sex"
                  value={data.sex || ""}
                  onChange={onChange}
                >
                  <option value="">Select sex</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>

              <div className="form-field">
                <label>Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={data.weight ?? ""}
                  onChange={onChange}
                  min="0"
                  max="99999999.99"
                  step="0.01"
                  placeholder="Enter weight"
                />
              </div>

              <div className="form-field">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={data.dateOfBirth || ""}
                  onChange={onChange}
                  max={formatCalendarDate(getTodayDate())}
                  disabled={isSaving}
                />

                {data.estimatedDOB && (
                  <span className="pet-field-hint">
                    Estimated from age. You can replace it
                    with the exact date.
                  </span>
                )}
              </div>

              <PetAgeInputs
                data={data}
                onChange={onChange}
                disabled={isSaving}
              />

              <div className="form-field pet-full-field">
                <label>Color</label>

                <div className="pet-color-picker-row">
                  <input
                    className="pet-color-picker"
                    type="color"
                    value={data.colorHex || "#55b7b2"}
                    onChange={
                      isEdit
                        ? handleEditColorChange
                        : handleNewPetColorChange
                    }
                  />

                  <input
                    type="text"
                    name="color"
                    value={data.color || ""}
                    onChange={
                      isEdit
                        ? handleEditColorNameChange
                        : handleNewPetColorNameChange
                    }
                    placeholder="Example: Golden, Black & White, Cream"
                    maxLength={100}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "health" && (
          <div className="pet-tab-panel">
            <div className="pet-form-grid pet-health-grid">
              <div className="form-field pet-full-field">
                <label>Blood Type</label>
                <input
                  type="text"
                  name="bloodType"
                  value={data.bloodType || ""}
                  onChange={onChange}
                  placeholder="Enter blood type"
                  maxLength={100}
                />
              </div>

              <div className="form-field">
                <label>Allergies</label>
                <textarea
                  name="allergies"
                  value={data.allergies || ""}
                  onChange={onChange}
                  placeholder="Enter allergies"
                  rows={5}
                  maxLength={4000}
                />
              </div>

              <div className="form-field">
                <label>Chronic Conditions</label>
                <textarea
                  name="chronicConditions"
                  value={data.chronicConditions || ""}
                  onChange={onChange}
                  placeholder="Enter chronic conditions"
                  rows={5}
                  maxLength={4000}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "identification" && (
          <div className="pet-tab-panel">
            <div className="pet-form-grid">
              <div className="form-field pet-full-field">
                <label>Microchip Number</label>
                <input
                  type="text"
                  name="microchipNumber"
                  value={data.microchipNumber || ""}
                  onChange={onChange}
                  placeholder="Enter microchip number"
                  maxLength={100}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "photo" && (
          <div className="pet-tab-panel">
            <div className="pet-form-grid pet-photo-notes-grid">
              <div className="form-field">
                <label>Profile Photo</label>

                <div className="pet-photo-box">
                  {data.profilePhoto && (
                    <img
                      src={data.profilePhoto}
                      alt="Pet preview"
                    />
                  )}

                  <label className="pet-choose-image">
                    Choose Image
                    <input
                      type="file"
                      accept="image/*"
                      aria-label="Choose Image"
                      onChange={
                        isEdit
                          ? handleEditPetPhoto
                          : handleNewPetPhoto
                      }
                      disabled={isSaving || photoLoading}
                    />
                  </label>
                </div>
              </div>

              <div className="form-field">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={data.notes || ""}
                  onChange={onChange}
                  placeholder="Enter notes"
                  rows={8}
                  maxLength={4000}
                />
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main pets-design-page">
        {/* HEADER */}

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "20px",
            marginBottom: "28px",
          }}
        >
          <div>
            <h1 style={{ margin: "0 0 5px" }}>Pets</h1>
            <p style={{ margin: 0, color: "#718181" }}>
              Manage registered pets
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={handleExport}
              disabled={isLoading || Boolean(loadError)}
              style={{
                height: "42px",
                padding: "0 18px",
                border: "1px solid #55b7b2",
                borderRadius: "8px",
                background: "#ffffff",
                color: "#159f9f",
                fontWeight: "700",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                cursor: "pointer",
              }}
            >
              <FaFileExport />
              Export
            </button>

            <button
              type="button"
              onClick={handleOpenAdd}
              disabled={
                isLoading || Boolean(loadError) || isSaving
              }
              style={{
                height: "42px",
                padding: "0 18px",
                border: "1px solid #159f9f",
                borderRadius: "8px",
                background: "#159f9f",
                color: "#ffffff",
                fontWeight: "700",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              + Add Pet
            </button>
          </div>
        </div>

        {/* SEARCH + FILTERS */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            width: "100%",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              position: "relative",
              flex: "1 1 auto",
              minWidth: 0,
            }}
          >
            <FaSearch
              style={{
                position: "absolute",
                left: "15px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#829391",
                fontSize: "14px",
                pointerEvents: "none",
              }}
            />

            <input
              type="text"
              value={search}
              placeholder="Search pets..."
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: "100%",
                height: "46px",
                boxSizing: "border-box",
                padding: search
                  ? "0 43px 0 42px"
                  : "0 14px 0 42px",
                border: "1px solid #c9dddd",
                borderRadius: "8px",
                background: "#ffffff",
                color: "#405252",
                fontSize: "14px",
                outline: "none",
              }}
            />

            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "30px",
                  height: "30px",
                  padding: 0,
                  border: "none",
                  background: "transparent",
                  color: "#829391",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title="Clear search"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <select
            value={speciesFilter}
            onChange={(e) => {
              setSpeciesFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: "190px",
              height: "46px",
              padding: "0 34px 0 13px",
              border: "1px solid #c9dddd",
              borderRadius: "8px",
              background: "#ffffff",
              color: "#455757",
              fontSize: "14px",
              outline: "none",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <option value="all">All Species</option>

            {PET_SPECIES.map((species) => (
              <option key={species} value={species}>
                {species}
              </option>
            ))}
          </select>

          <div
            style={{
              position: "relative",
              width: "180px",
              flexShrink: 0,
            }}
          >
            <FaSortAmountDown
              style={{
                position: "absolute",
                left: "13px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#829391",
                fontSize: "14px",
                pointerEvents: "none",
                zIndex: 1,
              }}
            />

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: "100%",
                height: "46px",
                padding: "0 32px 0 38px",
                border: "1px solid #c9dddd",
                borderRadius: "8px",
                background: "#ffffff",
                color: "#455757",
                fontSize: "14px",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="default">Sort By</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="owner-asc">Owner A-Z</option>
              <option value="owner-desc">Owner Z-A</option>
              <option value="species-asc">Species Z-A</option>
              <option value="species-desc">Species Z-A</option>
              <option value="age-low">Age Low-High</option>
              <option value="age-high">Age High-Low</option>
            </select>
          </div>
        </div>

        {/* TABLE */}

        <div
          ref={tableScrollRef}
          className="owners-table-container pets-table-scroll"
          tabIndex={0}
          role="region"
          aria-label="Pets table. Scroll horizontally to see all columns."
        >
          <table className="owners-table">
            <thead>
              <tr>
                <th>Pet Name</th>
                <th>Owner</th>
                <th>Species</th>
                <th>Breed</th>
                <th>Age</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading || loadError ? (
                <tr>
                  <td
                    colSpan={6}
                    className="no-results"
                    style={{
                      textAlign: "center",
                      padding: "35px",
                      color: "#718181",
                    }}
                  >
                    {isLoading ? "Loading pets..." : loadError}
                  </td>
                </tr>
              ) : currentPets.length > 0 ? (
                currentPets.map((pet) => (
                  <tr key={pet.id}>
                    <td>{pet.name}</td>
                    <td>{pet.owner}</td>
                    <td>{pet.species}</td>
                    <td>{pet.breed}</td>
                    <td>{pet.age}</td>

                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="view-button icon-button"
                          onClick={() => handleViewPet(pet)}
                          title="View Pet"
                        >
                          <FaEye />
                        </button>

                        <button
                          type="button"
                          className="edit-button icon-button"
                          onClick={() => handleOpenEdit(pet)}
                          disabled={isSaving}
                          title="Edit Pet"
                        >
                          <FaPen />
                        </button>

                        <button
                          type="button"
                          className="delete-button icon-button"
                          onClick={() => handleDeletePet(pet)}
                          disabled={isSaving}
                          title="Delete Pet"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="no-results"
                    style={{
                      textAlign: "center",
                      padding: "35px",
                      color: "#718181",
                    }}
                  >
                    No pets found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "15px",
            marginTop: "18px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              color: "#617472",
            }}
          >
            <span>Rows per page:</span>

            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                height: "34px",
                padding: "0 28px 0 10px",
                border: "1px solid #c9dddd",
                borderRadius: "7px",
                background: "#ffffff",
                color: "#455757",
                fontSize: "13px",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "6px",
            }}
          >
            <button
              type="button"
              onClick={() =>
                setCurrentPage((previous) =>
                  Math.max(1, previous - 1)
                )
              }
              disabled={safeCurrentPage === 1}
              aria-label="Previous page"
              style={{
                width: "34px",
                height: "34px",
                padding: 0,
                border: "1px solid #c9dddd",
                borderRadius: "7px",
                background:
                  safeCurrentPage === 1 ? "#f4f7f7" : "#ffffff",
                color:
                  safeCurrentPage === 1 ? "#b6c0c0" : "#526666",
                fontSize: "18px",
                lineHeight: 1,
                cursor:
                  safeCurrentPage === 1
                    ? "not-allowed"
                    : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              &lt;
            </button>

            <button
              type="button"
              aria-current="page"
              style={{
                width: "34px",
                height: "34px",
                padding: 0,
                border: "1px solid #159f9f",
                borderRadius: "7px",
                background: "#159f9f",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "default",
              }}
            >
              {safeCurrentPage}
            </button>

            <button
              type="button"
              onClick={() =>
                setCurrentPage((previous) =>
                  Math.min(totalPages, previous + 1)
                )
              }
              disabled={safeCurrentPage === totalPages}
              aria-label="Next page"
              style={{
                width: "34px",
                height: "34px",
                padding: 0,
                border: "1px solid #c9dddd",
                borderRadius: "7px",
                background:
                  safeCurrentPage === totalPages
                    ? "#f4f7f7"
                    : "#ffffff",
                color:
                  safeCurrentPage === totalPages
                    ? "#b6c0c0"
                    : "#526666",
                fontSize: "18px",
                lineHeight: 1,
                cursor:
                  safeCurrentPage === totalPages
                    ? "not-allowed"
                    : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              &gt;
            </button>
          </div>
        </div>

        {/* ADD PET MODAL */}

        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal-container pet-form-modal">
              <div className="modal-header">
                <div>
                  <h2>Add Pet</h2>
                  <p>Register a new pet profile</p>
                </div>

                <button
                  type="button"
                  className="modal-close"
                  onClick={handleCloseAdd}
                  disabled={isSaving || addPhotoLoading}
                >
                  ×
                </button>
              </div>

              <ModalTabs
                activeTab={addTab}
                onChange={setAddTab}
              />

              <form
                className="pet-tab-form"
                onSubmit={handleAddPet}
              >
                <div className="pet-tab-content">
                  {renderPetFields(newPet, "add")}
                </div>

                <div className="pet-modal-footer">
                  <button
                    type="button"
                    className="modal-cancel-button"
                    onClick={handleCloseAdd}
                    disabled={isSaving || addPhotoLoading}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="save-button"
                    value="save"
                    disabled={isSaving || addPhotoLoading}
                  >
                    Save Pet
                  </button>

                  <button
                    type="submit"
                    className="save-button"
                    value="save-and-book-appointment"
                    disabled={isSaving || addPhotoLoading}
                  >
                    Save & Book Appointment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT PET MODAL */}

        {showEditModal && selectedPet && (
          <div className="modal-overlay">
            <div className="modal-container pet-form-modal">
              <div className="modal-header">
                <div>
                  <h2>Edit Pet</h2>
                  <p>Update {selectedPet.name}'s information</p>
                </div>

                <button
                  type="button"
                  className="modal-close"
                  onClick={handleCloseEdit}
                  disabled={isSaving || editPhotoLoading}
                >
                  ×
                </button>
              </div>

              <ModalTabs
                activeTab={editTab}
                onChange={setEditTab}
              />

              <form
                className="pet-tab-form"
                onSubmit={handleUpdatePet}
              >
                <div className="pet-tab-content">
                  {renderPetFields(selectedPet, "edit")}
                </div>

                <div className="pet-modal-footer">
                  <button
                    type="button"
                    className="modal-cancel-button"
                    onClick={handleCloseEdit}
                    disabled={isSaving || editPhotoLoading}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="save-button"
                    disabled={isSaving || editPhotoLoading}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DELETE PET MODAL */}

        {showDeleteModal && petToDelete && (
          <div className="modal-overlay">
            <div className="modal-container pet-delete-modal">
              <div className="modal-header">
                <div>
                  <h2>Archive Pet</h2>
                  <p>Linked records will be kept</p>
                </div>

                <button
                  type="button"
                  className="modal-close"
                  onClick={cancelDeletePet}
                  disabled={isSaving}
                >
                  ×
                </button>
              </div>

              <div className="pet-delete-body">
                <p>
                  Are you sure you want to delete{" "}
                  <strong>{petToDelete.name}</strong>?
                </p>

                <span>
                  The pet profile will be archived.
                </span>
              </div>

              <div className="pet-modal-footer">
                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={cancelDeletePet}
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="pets-delete-confirm"
                  onClick={confirmDeletePet}
                  disabled={isSaving}
                >
                  <FaTrash />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <style>{`
          .pet-delete-modal {
            max-width: 450px !important;
            padding: 0 !important;
            overflow: hidden !important;
          }

          .pet-delete-body {
            padding: 28px 32px;
          }

          .pet-delete-body p {
            margin: 0 0 8px;
            color: #2e3c3c;
            font-size: 15px;
          }

          .pet-delete-body span {
            color: #788888;
            font-size: 13px;
          }

          html body #root main.pets-design-page {
            min-width: 0 !important;
            box-sizing: border-box !important;
          }

          html body #root .pets-design-page
          .owners-table-container.pets-table-scroll {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            box-sizing: border-box !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
            overscroll-behavior-x: contain;
            -webkit-overflow-scrolling: touch;
            touch-action: pan-x pan-y;
          }

          html body #root .pets-design-page
          .pets-table-scroll > .owners-table {
            display: table !important;
            width: 100% !important;
            min-width: 900px !important;
            max-width: none !important;
            table-layout: fixed !important;
          }

          .pets-design-page .owners-table th,
          .pets-design-page .owners-table td {
            box-sizing: border-box;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .pets-design-page .owners-table th:nth-child(1),
          .pets-design-page .owners-table td:nth-child(1) {
            width: 15%;
          }

          .pets-design-page .owners-table th:nth-child(2),
          .pets-design-page .owners-table td:nth-child(2) {
            width: 19%;
          }

          .pets-design-page .owners-table th:nth-child(3),
          .pets-design-page .owners-table td:nth-child(3) {
            width: 13%;
          }

          .pets-design-page .owners-table th:nth-child(4),
          .pets-design-page .owners-table td:nth-child(4) {
            width: 22%;
          }

          .pets-design-page .owners-table th:nth-child(5),
          .pets-design-page .owners-table td:nth-child(5) {
            width: 12%;
          }

          .pets-design-page .owners-table th:nth-child(6),
          .pets-design-page .owners-table td:nth-child(6) {
            width: 19%;
          }

          .pets-design-page .owners-table .table-actions {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            gap: 8px;
            overflow: visible;
          }

          .pets-design-page .owners-table
          .table-actions .icon-button {
            flex: 0 0 auto;
          }

          ${getPetModalCSS()}
        `}</style>
      </main>
    </div>
  );
}

function getPetModalCSS() {
  return `
    .pet-form-modal {
      width: min(820px, calc(100vw - 32px)) !important;
      max-width: 820px !important;
      max-height: 90vh !important;
      padding: 0 !important;
      overflow: hidden !important;
      background: #ffffff !important;
      border-radius: 16px !important;
      display: flex !important;
      flex-direction: column !important;
      box-shadow: 0 24px 65px rgba(24, 56, 56, 0.22) !important;
    }

    .pet-form-modal > .modal-header,
    .pet-delete-modal > .modal-header {
      flex: 0 0 auto !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 22px 30px !important;
      box-sizing: border-box !important;
      background: #55b7b2 !important;
      color: #ffffff !important;
      border: none !important;
      border-radius: 16px 16px 0 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 20px !important;
    }

    .pet-form-modal > .modal-header h2,
    .pet-delete-modal > .modal-header h2 {
      margin: 0 !important;
      color: #ffffff !important;
      font-size: 25px !important;
      line-height: 1.2 !important;
      font-weight: 800 !important;
    }

    .pet-form-modal > .modal-header p,
    .pet-delete-modal > .modal-header p {
      margin: 5px 0 0 !important;
      color: rgba(255, 255, 255, 0.9) !important;
      font-size: 13px !important;
    }

    .pet-form-modal .modal-close,
    .pet-delete-modal .modal-close {
      width: 42px !important;
      min-width: 42px !important;
      height: 42px !important;
      padding: 0 !important;
      margin: 0 !important;
      border: 0 !important;
      border-radius: 50% !important;
      background: #ffffff !important;
      color: #4f6b6b !important;
      font-size: 24px !important;
      line-height: 1 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
    }

    .pet-modal-tabs {
      flex: 0 0 auto;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      padding: 16px 24px;
      background: #f7fbfb;
      border-bottom: 1px solid #e1ebeb;
    }

    .pet-form-modal .pet-modal-tabs .pet-modal-tab {
      min-height: 44px;
      border: 1px solid #dce7e7;
      border-radius: 9px;
      background: #ffffff !important;
      color: #617575 !important;
      -webkit-text-fill-color: currentColor !important;
      opacity: 1 !important;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      padding: 8px 10px;
      font-family: inherit;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: 0.18s ease;
    }

    .pet-form-modal .pet-modal-tabs .pet-modal-tab svg {
      color: inherit !important;
      fill: currentColor !important;
      opacity: 1 !important;
      flex-shrink: 0;
    }

    .pet-form-modal .pet-modal-tabs .pet-modal-tab:hover,
    .pet-form-modal .pet-modal-tabs .pet-modal-tab:active {
      background: #ffffff !important;
      border-color: #55b7b2 !important;
      color: #159f9f !important;
      -webkit-text-fill-color: currentColor !important;
      opacity: 1 !important;
    }

    .pet-form-modal .pet-modal-tabs .pet-modal-tab.active,
    .pet-form-modal .pet-modal-tabs .pet-modal-tab.active:hover,
    .pet-form-modal .pet-modal-tabs .pet-modal-tab.active:focus,
    .pet-form-modal .pet-modal-tabs .pet-modal-tab.active:active {
      background: #159f9f !important;
      border-color: #159f9f !important;
      color: #ffffff !important;
      -webkit-text-fill-color: #ffffff !important;
      opacity: 1 !important;
      box-shadow: 0 4px 12px rgba(21, 159, 159, 0.18);
    }

    .pet-form-modal .pet-modal-tabs .pet-modal-tab.active svg {
      color: #ffffff !important;
      fill: currentColor !important;
    }

    .pet-tab-form {
      min-height: 0 !important;
      flex: 1 1 auto !important;
      padding: 0 !important;
      margin: 0 !important;
      overflow: hidden !important;
      display: flex !important;
      flex-direction: column !important;
    }

    .pet-tab-content {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 24px 30px;
      background: #ffffff;
      box-sizing: border-box;
    }

    .pet-tab-content::-webkit-scrollbar {
      width: 7px;
    }

    .pet-tab-content::-webkit-scrollbar-track {
      background: #eef6f5;
    }

    .pet-tab-content::-webkit-scrollbar-thumb {
      background: #55b7b2;
      border-radius: 10px;
    }

    .pet-tab-panel {
      width: 100%;
    }

    .pet-form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 20px 24px;
      width: 100%;
    }

    .pet-form-grid .form-field {
      min-width: 0;
      margin: 0 !important;
      display: flex;
      flex-direction: column;
      gap: 7px;
    }

    .pet-form-grid .form-field label {
      margin: 0 !important;
      padding: 0 !important;
      color: #3b4d4d;
      font-size: 13px;
      font-weight: 700;
      line-height: 1.35;
    }

    .pet-form-grid
      input:not([type="color"]):not([type="file"]),
    .pet-form-grid select,
    .pet-form-grid textarea {
      width: 100% !important;
      box-sizing: border-box !important;
      border: 1px solid #d8e2e2 !important;
      border-radius: 8px !important;
      background: #ffffff !important;
      color: #2d3d3d !important;
      font-family: inherit !important;
      font-size: 14px !important;
      outline: none !important;
      transition: 0.15s ease !important;
    }

    .pet-form-grid
      input:not([type="color"]):not([type="file"]),
    .pet-form-grid select {
      min-height: 44px !important;
      height: 44px !important;
      padding: 0 12px !important;
    }

    .pet-form-grid textarea {
      min-height: 110px !important;
      padding: 11px 12px !important;
      resize: vertical !important;
    }

    .pet-form-grid input:focus,
    .pet-form-grid select:focus,
    .pet-form-grid textarea:focus {
      border-color: #55b7b2 !important;
      box-shadow: 0 0 0 3px rgba(85, 183, 178, 0.12) !important;
    }

    .pet-form-grid select:disabled {
      background: #f4f7f7 !important;
      color: #9ba8a8 !important;
      cursor: not-allowed;
    }

    .pet-full-field {
      grid-column: 1 / -1;
    }

    .pet-field-hint {
      display: block;
      color: #849393;
      font-size: 11px;
      line-height: 1.45;
      margin-top: 1px;
    }

    .pet-color-picker-row {
      display: grid;
      grid-template-columns: 58px 1fr;
      gap: 10px;
      align-items: center;
    }

    .pet-color-picker {
      width: 58px !important;
      height: 44px !important;
      min-height: 44px !important;
      padding: 4px !important;
      border: 1px solid #d8e2e2 !important;
      border-radius: 8px !important;
      background: #ffffff !important;
      cursor: pointer;
      box-sizing: border-box;
    }

    .pet-form-modal .pet-health-grid {
      align-items: start;
    }

    .pet-form-modal .pet-health-grid .form-field > label,
    .pet-form-modal .pet-photo-notes-grid .form-field > label {
      min-height: 18px;
    }

    .pet-form-modal .pet-health-grid textarea {
      height: 130px !important;
      min-height: 130px !important;
      margin: 0 !important;
    }

    .pet-form-modal .pet-photo-notes-grid {
      align-items: start;
    }

    .pet-form-modal .pet-photo-notes-grid textarea {
      height: 190px !important;
      min-height: 190px !important;
      max-height: 190px !important;
      margin: 0 !important;
      resize: none !important;
    }

    .pet-form-modal .pet-photo-box {
      width: 100% !important;
      height: 190px !important;
      min-height: 190px !important;
      margin: 0 !important;
      padding: 12px !important;
      box-sizing: border-box !important;
      border: 1px solid #d8e2e2 !important;
      border-radius: 8px !important;
      background: #ffffff !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 10px !important;
      overflow: hidden;
    }

    .pet-form-modal .pet-photo-box img {
      display: block;
      width: 100%;
      height: 110px;
      min-height: 0;
      border-radius: 5px;
      object-fit: contain;
    }

    .pet-form-modal .pet-photo-box .pet-choose-image {
      position: relative !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      flex: 0 0 auto !important;
      width: auto !important;
      min-height: 36px !important;
      height: 36px !important;
      margin: 0 !important;
      padding: 0 16px !important;
      box-sizing: border-box !important;
      border: 1px solid #55b7b2 !important;
      border-radius: 6px !important;
      background: #ffffff !important;
      color: #159f9f !important;
      -webkit-text-fill-color: currentColor !important;
      font-family: inherit !important;
      font-size: 13px !important;
      font-weight: 700 !important;
      line-height: 1 !important;
      cursor: pointer !important;
      overflow: hidden !important;
    }

    .pet-form-modal .pet-photo-box .pet-choose-image:hover {
      background: #f7fbfb !important;
      color: #159f9f !important;
    }

    .pet-form-modal .pet-photo-box .pet-choose-image:focus-within {
      box-shadow: 0 0 0 3px rgba(85, 183, 178, 0.12) !important;
    }

    .pet-form-modal .pet-choose-image input[type="file"] {
      position: absolute !important;
      inset: 0 !important;
      display: block !important;
      width: 100% !important;
      height: 100% !important;
      min-height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
      opacity: 0 !important;
      cursor: pointer !important;
      box-sizing: border-box !important;
    }

    .pet-modal-footer {
      flex: 0 0 auto;
      padding: 16px 30px;
      border-top: 1px solid #e4ecec;
      background: #ffffff;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      box-sizing: border-box;
    }

    .pet-modal-footer .modal-cancel-button,
    .pet-modal-footer .save-button,
    .pet-modal-footer .pets-delete-confirm {
      width: auto !important;
      min-width: 105px;
      min-height: 42px;
      height: 42px;
      padding: 0 17px !important;
      border-radius: 8px !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 7px !important;
      font-family: inherit !important;
      font-size: 13px !important;
      font-weight: 700 !important;
      cursor: pointer !important;
    }

    .pet-modal-footer .modal-cancel-button {
      border: 1px solid #d6e0e0 !important;
      background: #ffffff !important;
      color: #607272 !important;
    }

    .pet-modal-footer .modal-cancel-button:hover {
      background: #f5f9f9 !important;
    }

    .pet-modal-footer .save-button {
      border: 1px solid #159f9f !important;
      background: #159f9f !important;
      color: #ffffff !important;
    }

    .pet-modal-footer .save-button:hover {
      background: #128e8e !important;
      border-color: #128e8e !important;
    }

    .pet-modal-footer .pets-delete-confirm {
      border: 1px solid #d94b4b !important;
      background: #d94b4b !important;
      color: #ffffff !important;
    }

    .pet-modal-footer .pets-delete-confirm:hover {
      background: #c53f3f !important;
      border-color: #c53f3f !important;
    }

    .pet-delete-modal {
      width: min(450px, calc(100vw - 32px)) !important;
      max-width: 450px !important;
      padding: 0 !important;
      overflow: hidden !important;
      background: #ffffff !important;
      border-radius: 16px !important;
      box-shadow: 0 24px 65px rgba(24, 56, 56, 0.22) !important;
    }

    .pet-form-modal .pet-owner-search {
      width: 100%;
      min-width: 0;
    }

    .pet-form-modal .pet-owner-options {
      text-align: left;
    }

    .pet-form-modal .pet-owner-option {
      -webkit-text-fill-color: currentColor !important;
    }

    .pet-form-modal .pet-age-inputs input {
      min-width: 0 !important;
      padding-left: 9px !important;
      padding-right: 5px !important;
    }

    @media (max-width: 720px) {
      .pet-modal-tabs {
        grid-template-columns: repeat(2, 1fr);
        padding: 12px 15px;
      }

      .pet-form-grid {
        grid-template-columns: 1fr;
      }

      .pet-full-field {
        grid-column: auto;
      }

      .pet-tab-content {
        padding: 20px 18px;
      }

      .pet-modal-footer {
        padding: 14px 18px;
      }

      .pet-form-modal > .modal-header,
      .pet-delete-modal > .modal-header {
        padding: 19px 20px !important;
      }
    }
  `;
}

export default Pets;