
import { useEffect, useState } from "react";

import {
  FaPhoneAlt,
  FaEnvelope,
  FaWhatsapp,
  FaInstagram,
  FaMapMarkerAlt,
} from "react-icons/fa";

import { FaTiktok } from "react-icons/fa6";

import "../components/Footer.css";

/* =========================================
   DEFAULT FOOTER COLOR
========================================= */

const DEFAULT_FOOTER_COLOR = "#11797b";

/* =========================================
   READ SETTINGS FROM LOCAL STORAGE
========================================= */

const readFooterSettings = () => {
  try {
    const settings = JSON.parse(
      localStorage.getItem("storeSettings") || "{}"
    );

    return {
      storeName: settings.storeName || "",
      storeDescription: settings.storeDescription || "",
      email: settings.email || "",
      phone: settings.phone || "",
      whatsapp: settings.whatsapp || "",
      address: settings.address || "",
      instagram: settings.instagram || "",
      tiktok: settings.tiktok || "",
      storeBanner: settings.storeBanner || null,

      footerColor:
        settings.storeColors?.footerColor ||
        DEFAULT_FOOTER_COLOR,
    };
  } catch (error) {
    console.error(
      "Could not load store settings:",
      error
    );

    return {
      storeName: "",
      storeDescription: "",
      email: "",
      phone: "",
      whatsapp: "",
      address: "",
      instagram: "",
      tiktok: "",
      storeBanner: null,
      footerColor: DEFAULT_FOOTER_COLOR,
    };
  }
};

/* =========================================
   AUTOMATIC READABLE TEXT COLOR
========================================= */

const getReadableFooterText = (hex) => {
  const color = String(hex || "").replace("#", "");

  if (!/^[0-9a-fA-F]{6}$/.test(color)) {
    return "#ffffff";
  }

  const red = parseInt(color.slice(0, 2), 16) / 255;
  const green = parseInt(color.slice(2, 4), 16) / 255;
  const blue = parseInt(color.slice(4, 6), 16) / 255;

  const linearize = (value) => {
    return value <= 0.04045
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4;
  };

  const luminance =
    0.2126 * linearize(red) +
    0.7152 * linearize(green) +
    0.0722 * linearize(blue);

  return luminance > 0.179
    ? "#172b2b"
    : "#ffffff";
};

/* =========================================
   FOOTER COMPONENT
========================================= */

function Footer() {
  const [storeSettings, setStoreSettings] = useState(
    readFooterSettings
  );

  /* =========================================
     LOAD SETTINGS + LISTEN FOR ADMIN UPDATES
  ========================================= */

  useEffect(() => {
    const loadSettings = () => {
      setStoreSettings(readFooterSettings());
    };

    loadSettings();

    window.addEventListener(
      "storeSettingsUpdated",
      loadSettings
    );

    window.addEventListener(
      "storage",
      loadSettings
    );

    return () => {
      window.removeEventListener(
        "storeSettingsUpdated",
        loadSettings
      );

      window.removeEventListener(
        "storage",
        loadSettings
      );
    };
  }, []);

  /* =========================================
     HELPERS
  ========================================= */

  const getSocialLink = (value, platform) => {
    if (!value) return "#";

    if (
      value.startsWith("http://") ||
      value.startsWith("https://")
    ) {
      return value;
    }

    const username = value.replace("@", "").trim();

    if (platform === "instagram") {
      return `https://instagram.com/${username}`;
    }

    if (platform === "tiktok") {
      return `https://tiktok.com/@${username}`;
    }

    return "#";
  };

  const getWhatsAppLink = (number) => {
    if (!number) return "#";

    const cleanNumber = number.replace(/\D/g, "");

    return `https://wa.me/${cleanNumber}`;
  };

  const currentYear = new Date().getFullYear();

  /* =========================================
     DYNAMIC FOOTER COLORS
  ========================================= */

  const footerColor =
    storeSettings.footerColor ||
    DEFAULT_FOOTER_COLOR;

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
  };

  return (
    <footer
      className="store-footer"
      style={footerStyles}
    >
      {/* =====================================
          CURVED TOP
      ===================================== */}

      <div className="footer-wave">
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
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

      {/* =====================================
          FOOTER CONTENT
      ===================================== */}

      <div className="footer-main">
        <div className="footer-container">

          {/* BRAND */}

          <div className="footer-brand">
            {storeSettings.storeBanner && (
              <div className="footer-banner">
                <img
                  src={storeSettings.storeBanner}
                  alt={
                    storeSettings.storeName ||
                    "Store Banner"
                  }
                />
              </div>
            )}

            {storeSettings.storeName && (
              <h2>{storeSettings.storeName}</h2>
            )}

            {storeSettings.storeDescription && (
              <p>
                {storeSettings.storeDescription}
              </p>
            )}
          </div>

          {/* EXPLORE */}

          <div className="footer-column">
            <h3>Explore</h3>

            <a href="/">Home</a>

            <a href="/products">
              All Products
            </a>

            <a href="/cart">
              Cart
            </a>

            <a href="/contact">
              Contact
            </a>
          </div>

          {/* =================================
              CONTACT
          ================================= */}

<div className="footer-column">
            <h3>Contact</h3>

            {storeSettings.phone && (
              <a
                href={`tel:${storeSettings.phone}`}
                className="footer-contact-link"
              >
                <FaPhoneAlt />

                <span>
                  {storeSettings.phone}
                </span>
              </a>
            )}

            {storeSettings.email && (
              <a
                href={`mailto:${storeSettings.email}`}
                className="footer-contact-link"
              >
                <FaEnvelope />

                <span>
                  {storeSettings.email}
                </span>
              </a>
            )}

            {storeSettings.whatsapp && (
              <a
                href={getWhatsAppLink(
                  storeSettings.whatsapp
                )}
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

                <span>
                  {storeSettings.address}
                </span>
              </div>
            )}
          </div>

          {/* =================================
              FOLLOW
          ================================= */}

          <div className="footer-column">
            <h3>Follow</h3>

            {storeSettings.instagram && (
              <a
                href={getSocialLink(
                  storeSettings.instagram,
                  "instagram"
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-contact-link"
              >
                <FaInstagram />

                <span>Instagram</span>
              </a>
            )}

            {storeSettings.tiktok && (
              <a
                href={getSocialLink(
                  storeSettings.tiktok,
                  "tiktok"
                )}
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

      {/* =====================================
          BOTTOM BAR
      ===================================== */}

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


