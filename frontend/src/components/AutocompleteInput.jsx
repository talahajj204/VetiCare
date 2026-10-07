import { useEffect, useRef, useState } from "react";

function AutocompleteInput({
  label,
  name,
  value = "",
  onChange,
  options = [],
  placeholder = "Start typing...",
  required = false,
  disabled = false,
}) {
  const [inputValue, setInputValue] = useState(value || "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef(null);

  /* =========================================
     KEEP VALUE SYNCED WITH PARENT
  ========================================= */

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  /* =========================================
     NORMALIZE OPTIONS

     Supports:
     ["Tala", "Dobby"]

     OR:
     [
       { id: 1, name: "Tala" },
       { id: 2, name: "Dobby" }
     ]
  ========================================= */

  const normalizedOptions = options.map((option, index) => {
    if (typeof option === "string") {
      return {
        id: option,
        label: option,
        original: option,
      };
    }

    return {
      id: option.id ?? index,

      label:
        option.label ??
        option.name ??
        option.ownerName ??
        option.petName ??
        "",

      original: option,
    };
  });

  /* =========================================
     FILTER
  ========================================= */

  const filteredOptions = normalizedOptions
    .filter((option) => {
      if (!inputValue.trim()) {
        return true;
      }

      return option.label
        .toLowerCase()
        .includes(inputValue.toLowerCase().trim());
    })
    .slice(0, 8);

  /* =========================================
     INPUT CHANGE
  ========================================= */

  const handleInputChange = (event) => {
    const newValue = event.target.value;

    setInputValue(newValue);

    setShowSuggestions(true);

    setActiveIndex(-1);

    if (onChange) {
      onChange(newValue, null);
    }
  };

  /* =========================================
     SELECT OPTION
  ========================================= */

  const selectOption = (option) => {
    setInputValue(option.label);

    setShowSuggestions(false);

    setActiveIndex(-1);

    if (onChange) {
      onChange(option.label, option.original);
    }
  };

  /* =========================================
     KEYBOARD
  ========================================= */

  const handleKeyDown = (event) => {
    if (!showSuggestions || filteredOptions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      setActiveIndex((current) =>
        current < filteredOptions.length - 1
          ? current + 1
          : 0
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setActiveIndex((current) =>
        current > 0
          ? current - 1
          : filteredOptions.length - 1
      );
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();

      selectOption(filteredOptions[activeIndex]);
    }

    if (event.key === "Escape") {
      setShowSuggestions(false);

      setActiveIndex(-1);
    }
  };

  /* =========================================
     CLOSE WHEN CLICKING OUTSIDE
  ========================================= */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);

        setActiveIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  /* =========================================
     RETURN
  ========================================= */

  return (
    <div
      className="autocomplete-container"
      ref={containerRef}
    >
      <style>{`
        .autocomplete-container {
          width: 100%;
          position: relative;
        }

        .autocomplete-label {
          display: block;
          margin-bottom: 8px;

          color: #263b4f;

          font-size: 14px;
          font-weight: 700;
        }

        .autocomplete-required {
          color: #d92d20;
          margin-left: 3px;
        }

        .autocomplete-input {
          width: 100%;
          height: 48px;

          padding: 0 14px;

          border: 1px solid #d5e1e1;
          border-radius: 9px;

          outline: none;

          background: white;

          color: #263b4f;

          font-size: 14px;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .autocomplete-input::placeholder {
          color: #9ba6b2;
        }

        .autocomplete-input:focus {
          border-color: #1aa6a6;

          box-shadow:
            0 0 0 3px
            rgba(26, 166, 166, 0.1);
        }

        .autocomplete-input:disabled {
          background: #f3f6f6;
          color: #9ba6b2;
          cursor: not-allowed;
        }

        .autocomplete-dropdown {
          width: 100%;
          max-height: 230px;

          position: absolute;

          top: calc(100% + 5px);
          left: 0;

          z-index: 99999;

          overflow-y: auto;

          padding: 6px;

          border: 1px solid #dce7e6;
          border-radius: 10px;

          background: white;

          box-shadow:
            0 10px 28px
            rgba(38, 59, 79, 0.15);
        }

        .autocomplete-option {
          width: 100%;

          padding: 11px 12px;

          border: none;
          border-radius: 7px;

          background: transparent;

          color: #34495e;

          display: block;

          text-align: left;

          font-size: 13px;
          font-weight: 600;

          cursor: pointer;
        }

        .autocomplete-option:hover,
        .autocomplete-option.active {
          background: #e8f7f7;
          color: #11797b;
        }

        .autocomplete-empty {
          padding: 12px;

          color: #8a98a8;

          font-size: 12px;

          text-align: center;
        }

        .autocomplete-dropdown::-webkit-scrollbar {
          width: 6px;
        }

        .autocomplete-dropdown::-webkit-scrollbar-thumb {
          background: #b9d8d6;
          border-radius: 20px;
        }
      `}</style>

      {label && (
        <label className="autocomplete-label">
          {label}

          {required && (
            <span className="autocomplete-required">
              *
            </span>
          )}
        </label>
      )}

      <input
        type="text"
        name={name}
        className="autocomplete-input"
        value={inputValue}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete="off"
        onChange={handleInputChange}
        onFocus={() => {
          if (!disabled) {
            setShowSuggestions(true);
          }
        }}
        onKeyDown={handleKeyDown}
      />

      {showSuggestions && !disabled && (
        <div className="autocomplete-dropdown">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <button
                key={`${option.id}-${index}`}
                type="button"
                className={`autocomplete-option ${
                  index === activeIndex ? "active" : ""
                }`}
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectOption(option);
                }}
                onMouseEnter={() => setActiveIndex(index)}
              >
                {option.label}
              </button>
            ))
          ) : (
            <div className="autocomplete-empty">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AutocompleteInput;