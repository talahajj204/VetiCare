import { useEffect, useState } from "react";
import {
  Link,
  useOutletContext,
  useParams,
} from "react-router-dom";

import {
  FaPhoneAlt,
  FaEnvelope,
  FaWhatsapp,
  FaInstagram,
  FaMapMarkerAlt,
} from "react-icons/fa";

import { FaTiktok } from "react-icons/fa6";
import { getPublicStoreSettings } from "../api/storeSettingsApi";

import "../components/Footer.css";

const DEFAULT_FOOTER_COLOR = "#11797b";

const getFooterPhoneNumbers = (settings) => {
  const numbers = Array.isArray(settings?.phoneNumbers)
    ? settings.phoneNumbers
    : [];

  const validNumbers = numbers
    .filter((number) => typeof number === "string")
    .map((number) => number.trim())
    .filter(Boolean);

  if (validNumbers.length > 0) {
    return [...new Set(validNumbers)];
  }

  const phone =
    typeof settings?.phone === "string"
      ? settings.phone.trim()
      : "";

  return phone ? [phone] : [];
};

const normalizeFooterSettings = (settings = {}) => {
  const text = (key) =>
    typeof settings?.[key] === "string"
      ? settings[key].trim()
      : "";

  const color = (key, fallback) => {
    const value = settings?.storeColors?.[key];

    return typeof value === "string" &&
      /^#[0-9a-fA-F]{6}$/.test(value)
      ? value
      : fallback;
  };

  return {
    storeName: text("storeName"),
    storeDescription: text("storeDescription"),
    email: text("email"),
    phone: text("phone"),
    phoneNumbers: getFooterPhoneNumbers(settings),
    whatsapp: text("socialWhatsapp"),
    address: text("address"),
    instagram: text("instagram"),
    tiktok: text("tiktok"),
    storeBanner: text("storeBanner"),
    backgroundColor: color("backgroundColor", "#ffffff"),
    footerColor: color(
      "footerColor",
      DEFAULT_FOOTER_COLOR
    ),
  };
};

const getReadableFooterText = (hex) => {
  const color = String(hex || "").replace("#", "");

  if (!/^[0-9a-fA-F]{6}$/.test(color)) {
    return "#ffffff";
  }

  const red = parseInt(color.slice(0, 2), 16) / 255;
  const green = parseInt(color.slice(2, 4), 16) / 255;
  const blue = parseInt(color.slice(4, 6), 16) / 255;

  const linearize = (value) =>
    value <= 0.04045
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4;

  const luminance =
    0.2126 * linearize(red) +
    0.7152 * linearize(green) +
    0.0722 * linearize(blue);

  return luminance > 0.179 ? "#172b2b" : "#ffffff";
};

const getSocialLink = (value, platform) => {
  const input = String(value || "").trim();

  if (!input) return "";

  if (/^https?:\/\//i.test(input)) {
    return input;
  }

  const username = input.replace(/^@/, "");

  if (platform === "instagram") {
    return `https://instagram.com/${username}`;
  }

  if (platform === "tiktok") {
    return `https://tiktok.com/@${username}`;
  }

  return "";
};

const getWhatsAppLink = (value) => {
  const input = String(value || "").trim();

  if (!input) return "";

  if (/^https?:\/\//i.test(input)) {
    return input;
  }

  const cleanNumber = input.replace(/\D/g, "");

  return cleanNumber
    ? `https://wa.me/${cleanNumber}`
    : "";
};

function Footer() {
  const context = useOutletContext();
  const params = useParams();

  const clinicId = Number(
    context?.clinicId ?? params.clinicId
  );

  const validClinicId =
    Number.isInteger(clinicId) &&
    clinicId > 0 &&
    clinicId <= 2147483647;

  const storeBasePath = validClinicId
    ? `/store/${clinicId}`
    : "";

  const [settingsState, setSettingsState] = useState(() => ({
    clinicId: String(clinicId),
    data: normalizeFooterSettings(),
  }));

  const storeSettings =
    settingsState.clinicId === String(clinicId)
      ? settingsState.data
      : normalizeFooterSettings();

  useEffect(() => {
    let controller = null;
    let disposed = false;

    setSettingsState({
      clinicId: String(clinicId),
      data: normalizeFooterSettings(),
    });

    if (!validClinicId) return;

    const loadSettings = async () => {
      controller?.abort();

      const currentController = new AbortController();
      controller = currentController;

      try {
        const result = await getPublicStoreSettings(
          clinicId,
          { signal: currentController.signal }
        );

        if (
          disposed ||
          currentController.signal.aborted
        ) {
          return;
        }

        setSettingsState({
          clinicId: String(clinicId),
          data: normalizeFooterSettings(result),
        });
      } catch {
        // Keep this clinic's last successfully loaded settings.
        // Never use another clinic's cached branding.
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadSettings();
      }
    };

    loadSettings();

    window.addEventListener(
      "storeSettingsUpdated",
      loadSettings
    );
    window.addEventListener(
      "clinic-branding-updated",
      loadSettings
    );
    window.addEventListener("focus", loadSettings);

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      disposed = true;
      controller?.abort();

      window.removeEventListener(
        "storeSettingsUpdated",
        loadSettings
      );
      window.removeEventListener(
        "clinic-branding-updated",
        loadSettings
      );
      window.removeEventListener("focus", loadSettings);

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [clinicId, validClinicId]);

  const currentYear = new Date().getFullYear();

  const phoneNumbers =
    getFooterPhoneNumbers(storeSettings);

  const footerColor =
    storeSettings.footerColor || DEFAULT_FOOTER_COLOR;

  const footerTextColor =
    getReadableFooterText(footerColor);

  const footerMutedColor =
    footerTextColor === "#ffffff"
      ? "rgba(255, 255, 255, 0.82)"
      : "rgba(23, 43, 43, 0.82)";

  const footerStyles = {
    "--footer-color": footerColor,
    "--footer-dark": footerColor,
    "--footer-text": footerTextColor,
    "--footer-muted": footerMutedColor,
    "--footer-page-background":
      storeSettings.backgroundColor || "#ffffff",
  };

  const whatsappLink =
    getWhatsAppLink(storeSettings.whatsapp);

  const instagramLink = getSocialLink(
    storeSettings.instagram,
    "instagram"
  );

  const tiktokLink = getSocialLink(
    storeSettings.tiktok,
    "tiktok"
  );  return (
    <footer className="store-footer" style={footerStyles}>
      <style>{`
        html body #root footer.store-footer {
          background-color:
            var(--footer-page-background) !important;
        }

        html body #root footer.store-footer > .footer-wave,
        html body #root footer.store-footer > .footer-wave > svg {
          background-color:
            var(--footer-page-background) !important;
        }
      `}</style>

      <div className="footer-wave">
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            className="footer-wave-line footer-wave-line-one"
            d="M0,65 C320,125 540,5 850,45 C1120,80 1270,115 1440,55"
          />

          <path
            className="footer-wave-line footer-wave-line-two"
            d="M0,82 C300,140 560,25 850,62 C1110,95 1280,125 1440,70"
          />

          <path
            className="footer-wave-fill"
            d="M0,92 C300,150 560,40 850,75 C1110,110 1280,140 1440,85 L1440,120 L0,120 Z"
          />
        </svg>
      </div>

      <div className="footer-main">
        <div className="footer-container">
          <div className="footer-brand">
            {storeSettings.storeBanner && (
              <div className="footer-banner">
                <img
                  src={storeSettings.storeBanner}
                  alt={
                    storeSettings.storeName || "Store Banner"
                  }
                />
              </div>
            )}

            {storeSettings.storeName && (
              <h2>{storeSettings.storeName}</h2>
            )}

            {storeSettings.storeDescription && (
              <p>{storeSettings.storeDescription}</p>
            )}
          </div>

          <div className="footer-column">
            <h3>Explore</h3>

            {validClinicId && (
              <>
                <Link to={storeBasePath}>
                  Home
                </Link>

                <Link to={`${storeBasePath}/products`}>
                  All Products
                </Link>

                <Link to={`${storeBasePath}/cart`}>
                  Cart
                </Link>

                <Link to={`${storeBasePath}/contact`}>
                  Contact
                </Link>
              </>
            )}
          </div>

          <div className="footer-column">
            <h3>Contact</h3>

            {phoneNumbers.map((number, index) => (
              <a
                key={`${number}-${index}`}
                href={`tel:${number}`}
                className="footer-contact-link"
              >
                <FaPhoneAlt />
                <span>{number}</span>
              </a>
            ))}

            {storeSettings.email && (
              <a
                href={`mailto:${storeSettings.email}`}
                className="footer-contact-link"
              >
                <FaEnvelope />
                <span>{storeSettings.email}</span>
              </a>
            )}

            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-contact-link"
              >
                <FaWhatsapp />
                <span>WhatsApp</span>
              </a>
            )}

            {storeSettings.address && (
              <div className="footer-contact-link footer-address">
                <FaMapMarkerAlt />
                <span>{storeSettings.address}</span>
              </div>
            )}
          </div>

          <div className="footer-column">
            <h3>Follow</h3>

            {instagramLink && (
              <a
                href={instagramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-contact-link"
              >
                <FaInstagram />
                <span>Instagram</span>
              </a>
            )}

            {tiktokLink && (
              <a
                href={tiktokLink}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-contact-link"
              >
                <FaTiktok />
                <span>TikTok</span>
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>
            © {currentYear}{" "}
            {storeSettings.storeName || "Store"}.
            All rights reserved.
          </p>

          <a
            href="https://diraya.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="diraya-link"
          >
            Powered by <strong>Diraya</strong>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;