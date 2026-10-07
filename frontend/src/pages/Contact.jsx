import { useEffect, useState } from "react";
import StoreHeader from "./StoreHeader";

import {
  FaEnvelope,
  FaLocationDot,
  FaInstagram,
  FaFacebookF,
  FaTiktok,
  FaWhatsapp,
  FaPaw,
  FaArrowUpRightFromSquare,
  FaPaperPlane,
} from "react-icons/fa6";

const STORE_SETTINGS_KEY = "storeSettings";

/* =========================================================
   LOAD STORE SETTINGS
========================================================= */

const loadStoreSettings = () => {
  try {
    const saved = localStorage.getItem(STORE_SETTINGS_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);

      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Could not load store settings:", error);
  }

  return {};
};

/* =========================================================
   CONTACT
========================================================= */

function Contact() {
  const [settings, setSettings] = useState(loadStoreSettings);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    petName: "",
    subject: "",
    message: "",
  });

  const [messageSent, setMessageSent] = useState(false);

  /* =========================================================
     REFRESH SETTINGS
  ========================================================= */

  useEffect(() => {
    const refreshSettings = () => {
      setSettings(loadStoreSettings());
    };

    refreshSettings();

    window.addEventListener(
      "storeSettingsUpdated",
      refreshSettings
    );

    window.addEventListener(
      "storage",
      refreshSettings
    );

    return () => {
      window.removeEventListener(
        "storeSettingsUpdated",
        refreshSettings
      );

      window.removeEventListener(
        "storage",
        refreshSettings
      );
    };
  }, []);

  /* =========================================================
     SETTINGS VALUES
  ========================================================= */

  const contactTitle =
    settings.contactTitle || "Contact Us";

  const contactDescription =
    settings.contactDescription ||
    "Our veterinary team is here to help. Contact us with any questions about your pet, our services, products, or clinic.";

  const email =
    settings.email ||
    settings.storeEmail ||
    "";

  const location =
    settings.location ||
    settings.storeLocation ||
    settings.address ||
    "";

  const instagram = settings.instagram || "";
  const facebook = settings.facebook || "";
  const tiktok = settings.tiktok || "";
  const whatsapp = settings.whatsapp || "";

  /* =========================================================
     SOCIAL LINKS
  ========================================================= */

  const normalizeUsername = (value) => {
    return String(value || "")
      .trim()
      .replace(/^@/, "");
  };

  const getInstagramLink = () => {
    if (!instagram) return "#";

    if (
      instagram.startsWith("http://") ||
      instagram.startsWith("https://")
    ) {
      return instagram;
    }

    return `https://instagram.com/${normalizeUsername(
      instagram
    )}`;
  };

  const getFacebookLink = () => {
    if (!facebook) return "#";

    if (
      facebook.startsWith("http://") ||
      facebook.startsWith("https://")
    ) {
      return facebook;
    }

    return `https://facebook.com/${normalizeUsername(
      facebook
    )}`;
  };

  const getTikTokLink = () => {
    if (!tiktok) return "#";

    if (
      tiktok.startsWith("http://") ||
      tiktok.startsWith("https://")
    ) {
      return tiktok;
    }

    return `https://tiktok.com/@${normalizeUsername(
      tiktok
    )}`;
  };

  const getWhatsAppLink = () => {
    if (!whatsapp) return "#";

    if (
      whatsapp.startsWith("http://") ||
      whatsapp.startsWith("https://")
    ) {
      return whatsapp;
    }

    const phone = String(whatsapp).replace(/\D/g, "");

    return `https://wa.me/${phone}`;
  };

  /* =========================================================
     GOOGLE MAPS
  ========================================================= */

  const getGoogleMapsLink = () => {
    if (!location) return "#";

    if (
      location.startsWith("http://") ||
      location.startsWith("https://")
    ) {
      return location;
    }

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      location
    )}`;
  };

  /* =========================================================
     SOCIAL MEDIA
  ========================================================= */

  const socialLinks = [
    {
      name: "Instagram",
      icon: <FaInstagram />,
      value: instagram,
      link: getInstagramLink(),
    },
    {
      name: "Facebook",
      icon: <FaFacebookF />,
      value: facebook,
      link: getFacebookLink(),
    },
    {
      name: "TikTok",
      icon: <FaTiktok />,
      value: tiktok,
      link: getTikTokLink(),
    },
  ].filter((social) => social.value);

  /* =========================================================
     FORM
  ========================================================= */

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (messageSent) {
      setMessageSent(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setMessageSent(true);

    setFormData({
      fullName: "",
      email: "",
      phone: "",
      petName: "",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="contact-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .contact-page {
          min-height: 100vh;
          background: #ffffff;
          color: #263b3a;
        }

        /* =====================================================
           COMPACT TOP
        ===================================================== */

        .contact-top {
          padding: 32px 24px 28px;

          background:
            linear-gradient(
              135deg,
              #f0faf9 0%,
              #ffffff 52%,
              #edf9f8 100%
            );

          text-align: center;

          border-bottom: 1px solid #edf4f3;
        }

        .contact-top-badge {
          display: inline-flex;

          align-items: center;
          justify-content: center;

          gap: 6px;

          margin-bottom: 8px;

          color: #199a96;

          font-size: 10px;
          font-weight: 800;

          letter-spacing: 1.2px;

          text-transform: uppercase;
        }

        .contact-top h1 {
          margin: 0;

          color: #293e3d;

          font-size: 35px;
          font-weight: 800;

          line-height: 1.15;
        }

        .contact-top p {
          max-width: 620px;

          margin: 9px auto 0;

          color: #748987;

          font-size: 12px;

          line-height: 1.6;

          white-space: pre-line;
        }

        /* =====================================================
           MAIN
        ===================================================== */

        .contact-main {
          width: 100%;

          max-width: 1180px;

          margin: 0 auto;

          padding: 35px 25px 65px;
        }

        /* =====================================================
           COMPACT CONTACT INFORMATION
        ===================================================== */

        .contact-info-box {
          display: grid;

          grid-template-columns:
            repeat(4, minmax(0, 1fr));

          border: 1px solid #dcebea;

          border-radius: 16px;

          background: #ffffff;

          overflow: hidden;

          box-shadow:
            0 10px 30px
            rgba(31, 76, 73, 0.05);
        }

        .contact-info-item {
          min-height: 150px;

          padding: 21px;

          display: flex;

          align-items: flex-start;

          gap: 13px;

          border-right:
            1px solid #e4efee;
        }

        .contact-info-item:last-child {
          border-right: none;
        }

        .contact-info-icon {
          width: 40px;
          height: 40px;

          flex-shrink: 0;

          border-radius: 11px;

          background: #eaf8f7;

          color: #199a96;

          display: flex;

          align-items: center;
          justify-content: center;

          font-size: 16px;
        }

        .contact-info-content {
          flex: 1;

          min-width: 0;
        }

        .contact-info-content h3 {
          margin: 2px 0 6px;

          color: #2d4240;

          font-size: 14px;
          font-weight: 800;
        }

        .contact-info-content p {
          margin: 0;

          color: #7a8d8b;

          font-size: 10.5px;

          line-height: 1.5;

          word-break: break-word;
        }

        .contact-info-value {
          margin-top: 7px !important;

          color: #506866 !important;

          font-weight: 650;
        }

        .contact-info-link {
          display: inline-flex;

          align-items: center;

          gap: 5px;

          margin-top: 8px;

          color: #199a96;

          font-size: 10px;

          font-weight: 800;

          text-decoration: none;

          transition: 0.2s ease;
        }

        .contact-info-link:hover {
          color: #117b78;
        }

        .contact-info-link svg {
          font-size: 8px;
        }

        .contact-empty {
          margin-top: 7px !important;

          color: #9cacab !important;

          font-style: italic;
        }

        /* =====================================================
           SOCIAL MEDIA
        ===================================================== */

        .contact-social-icons {
          display: flex;

          flex-wrap: wrap;

          gap: 7px;

          margin-top: 10px;
        }

        .contact-social-icon {
          width: 31px;
          height: 31px;

          border: 1px solid #d6e8e6;

          border-radius: 50%;

          background: #f5fbfa;

          color: #199a96;

          display: flex;

          align-items: center;
          justify-content: center;

          font-size: 12px;

          text-decoration: none;

          transition: 0.2s ease;
        }

        .contact-social-icon:hover {
          background: #199a96;

          border-color: #199a96;

          color: #ffffff;

          transform: translateY(-2px);
        }

        /* =====================================================
           CONTACT FORM SECTION
        ===================================================== */

        .contact-form-section {
          margin-top: 35px;

          display: grid;

          grid-template-columns:
            minmax(240px, 0.7fr)
            minmax(0, 1.3fr);

          gap: 42px;

          padding: 34px;

          border: 1px solid #e0eceb;

          border-radius: 17px;

          background:
            linear-gradient(
              135deg,
              #f8fcfc,
              #ffffff
            );

          box-shadow:
            0 10px 30px
            rgba(32, 76, 73, 0.04);
        }

        .contact-form-intro {
          padding: 4px;
        }

        .contact-form-intro-badge {
          display: inline-flex;

          align-items: center;

          gap: 7px;

          margin-bottom: 11px;

          color: #199a96;

          font-size: 10px;
          font-weight: 800;

          letter-spacing: 1px;

          text-transform: uppercase;
        }

        .contact-form-intro h2 {
          margin: 0;

          color: #2c403f;

          font-size: 26px;

          font-weight: 800;

          line-height: 1.2;
        }

        .contact-form-intro > p {
          margin: 12px 0 0;

          color: #748987;

          font-size: 11.5px;

          line-height: 1.7;
        }

        .contact-form-pet-note {
          margin-top: 19px;

          padding: 13px;

          border-radius: 11px;

          background: #eaf8f7;

          display: flex;

          align-items: flex-start;

          gap: 9px;
        }

        .contact-form-pet-note svg {
          flex-shrink: 0;

          margin-top: 2px;

          color: #199a96;

          font-size: 14px;
        }

        .contact-form-pet-note p {
          margin: 0;

          color: #58716f;

          font-size: 10px;

          line-height: 1.6;
        }

        /* =====================================================
           FORM
        ===================================================== */

        .contact-form {
          width: 100%;
        }

        .contact-form-row {
          display: grid;

          grid-template-columns:
            repeat(2, minmax(0, 1fr));

          gap: 13px;

          margin-bottom: 13px;
        }

        .contact-form-field {
          display: flex;

          flex-direction: column;

          gap: 6px;
        }

        .contact-form-field.full {
          margin-bottom: 13px;
        }

        .contact-form-field label {
          color: #405654;

          font-size: 10px;

          font-weight: 750;
        }

        .contact-form-field input,
        .contact-form-field select,
        .contact-form-field textarea {
          width: 100%;

          border: 1px solid #d8e6e4;

          border-radius: 8px;

          outline: none;

          background: #ffffff;

          color: #344846;

          font-family: inherit;

          font-size: 11px;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .contact-form-field input,
        .contact-form-field select {
          height: 40px;

          padding: 0 11px;
        }

        .contact-form-field textarea {
          min-height: 95px;

          padding: 11px;

          resize: vertical;

          line-height: 1.5;
        }

        .contact-form-field input:focus,
        .contact-form-field select:focus,
        .contact-form-field textarea:focus {
          border-color: #199a96;

          box-shadow:
            0 0 0 3px
            rgba(25, 154, 150, 0.07);
        }

        .contact-form-field input::placeholder,
        .contact-form-field textarea::placeholder {
          color: #a2b1b0;
        }

        .contact-send-button {
          height: 40px;

          padding: 0 19px;

          border: none;

          border-radius: 8px;

          background: #199a96;

          color: #ffffff;

          display: inline-flex;

          align-items: center;
          justify-content: center;

          gap: 8px;

          font-size: 11px;

          font-weight: 800;

          cursor: pointer;

          transition:
            background 0.2s ease,
            transform 0.2s ease;
        }

        .contact-send-button:hover {
          background: #147f7c;

          transform: translateY(-1px);
        }

        .contact-success-message {
          margin-bottom: 13px;

          padding: 11px 13px;

          border: 1px solid #bce1de;

          border-radius: 8px;

          background: #ecf9f7;

          color: #187d78;

          font-size: 11px;

          font-weight: 650;
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 1000px) {
          .contact-info-box {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .contact-info-item:nth-child(2) {
            border-right: none;
          }

          .contact-info-item:nth-child(1),
          .contact-info-item:nth-child(2) {
            border-bottom:
              1px solid #e4efee;
          }

          .contact-form-section {
            grid-template-columns: 1fr;

            gap: 28px;
          }
        }

        @media (max-width: 650px) {
          .contact-top {
            padding: 27px 17px 24px;
          }

          .contact-top h1 {
            font-size: 29px;
          }

          .contact-top p {
            font-size: 11px;
          }

          .contact-main {
            padding: 27px 16px 50px;
          }

          .contact-info-box {
            grid-template-columns: 1fr;
          }

          .contact-info-item {
            min-height: auto;

            border-right: none;

            border-bottom:
              1px solid #e4efee;
          }

          .contact-info-item:nth-child(2) {
            border-bottom:
              1px solid #e4efee;
          }

          .contact-info-item:last-child {
            border-bottom: none;
          }

          .contact-form-section {
            margin-top: 27px;

            padding: 22px 17px;

            gap: 24px;
          }

          .contact-form-row {
            grid-template-columns: 1fr;
          }

          .contact-send-button {
            width: 100%;
          }
        }
      `}</style>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <StoreHeader />

      {/* =====================================================
          COMPACT CONTACT HEADER
      ===================================================== */}

      <section className="contact-top">
        <div className="contact-top-badge">
          <FaPaw />
          GET IN TOUCH
        </div>

        <h1>{contactTitle}</h1>

        <p>{contactDescription}</p>
      </section>

      <main className="contact-main">

        {/* =====================================================
            CONTACT INFORMATION
        ===================================================== */}

        <section className="contact-info-box">

          {/* WHATSAPP */}

          <div className="contact-info-item">
            <div className="contact-info-icon">
              <FaWhatsapp />
            </div>

            <div className="contact-info-content">
              <h3>WhatsApp Us</h3>

              <p>
                Chat directly with our clinic team.
              </p>

              {whatsapp ? (
                <>
                  <p className="contact-info-value">
                    {whatsapp}
                  </p>

                  <a
                    href={getWhatsAppLink()}
                    target="_blank"
                    rel="noreferrer"
                    className="contact-info-link"
                  >
                    Start Chat
                    <FaArrowUpRightFromSquare />
                  </a>
                </>
              ) : (
                <p className="contact-empty">
                  Not available
                </p>
              )}
            </div>
          </div>

          {/* EMAIL */}

          <div className="contact-info-item">
            <div className="contact-info-icon">
              <FaEnvelope />
            </div>

            <div className="contact-info-content">
              <h3>Email Us</h3>

              <p>
                Send a message to our clinic team.
              </p>

              {email ? (
                <>
                  <p className="contact-info-value">
                    {email}
                  </p>

                  <a
                    href={`mailto:${email}`}
                    className="contact-info-link"
                  >
                    Send Email
                    <FaArrowUpRightFromSquare />
                  </a>
                </>
              ) : (
                <p className="contact-empty">
                  Not available
                </p>
              )}
            </div>
          </div>

          {/* LOCATION */}

          <div className="contact-info-item">
            <div className="contact-info-icon">
              <FaLocationDot />
            </div>

            <div className="contact-info-content">
              <h3>Find Our Clinic</h3>

              <p>
                Visit our clinic or find us on Google Maps.
              </p>

              {location ? (
                <>
                  <p className="contact-info-value">
                    {location}
                  </p>

                  <a
                    href={getGoogleMapsLink()}
                    target="_blank"
                    rel="noreferrer"
                    className="contact-info-link"
                  >
                    Google Maps
                    <FaArrowUpRightFromSquare />
                  </a>
                </>
              ) : (
                <p className="contact-empty">
                  Not available
                </p>
              )}
            </div>
          </div>

          {/* SOCIAL MEDIA */}

          <div className="contact-info-item">
            <div className="contact-info-icon">
              <FaPaw />
            </div>

            <div className="contact-info-content">
              <h3>Follow Us</h3>

              <p>
                Follow our clinic for pet care updates.
              </p>

              {socialLinks.length > 0 ? (
                <div className="contact-social-icons">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.link}
                      target="_blank"
                      rel="noreferrer"
                      className="contact-social-icon"
                      title={social.name}
                      aria-label={social.name}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              ) : (
                <p className="contact-empty">
                  Not available
                </p>
              )}
            </div>
          </div>
        </section>

        {/* =====================================================
            CONTACT FORM
        ===================================================== */}

        <section className="contact-form-section">

          <div className="contact-form-intro">
            <div className="contact-form-intro-badge">
              <FaPaw />
              CONTACT OUR TEAM
            </div>

            <h2>Send us a message</h2>

            <p>
              Have a question about your pet or our
              veterinary services? Send us a message
              and tell us how we can help.
            </p>

            <div className="contact-form-pet-note">
              <FaPaw />

              <p>
                For urgent pet health concerns,
                please contact the clinic directly.
              </p>
            </div>
          </div>

          <form
            className="contact-form"
            onSubmit={handleSubmit}
          >
            {messageSent && (
              <div className="contact-success-message">
                Thank you! Your message has been submitted.
              </div>
            )}

            {/* NAME + EMAIL */}

            <div className="contact-form-row">
              <div className="contact-form-field">
                <label htmlFor="contactFullName">
                  Full Name *
                </label>

                <input
                  id="contactFullName"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleFormChange}
                  placeholder="Full name"
                  required
                />
              </div>

              <div className="contact-form-field">
                <label htmlFor="contactEmail">
                  Email *
                </label>

                <input
                  id="contactEmail"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  placeholder="Email address"
                  required
                />
              </div>
            </div>

            {/* PHONE + PET */}

            <div className="contact-form-row">
              <div className="contact-form-field">
                <label htmlFor="contactPhone">
                  Phone
                </label>

                <input
                  id="contactPhone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  placeholder="+961"
                />
              </div>

              <div className="contact-form-field">
                <label htmlFor="contactPetName">
                  Pet Name
                </label>

                <input
                  id="contactPetName"
                  type="text"
                  name="petName"
                  value={formData.petName}
                  onChange={handleFormChange}
                  placeholder="Pet name"
                />
              </div>
            </div>

            {/* SUBJECT */}

            <div className="contact-form-field full">
              <label htmlFor="contactSubject">
                How can we help? *
              </label>

              <select
                id="contactSubject"
                name="subject"
                value={formData.subject}
                onChange={handleFormChange}
                required
              >
                <option value="">
                  Select a reason
                </option>

                <option value="General Question">
                  General Question
                </option>

                <option value="Appointment">
                  Appointment
                </option>

                <option value="Pet Care">
                  Pet Care
                </option>

                <option value="Vaccination">
                  Vaccination
                </option>

                <option value="Medication">
                  Medication
                </option>

                <option value="Store Product">
                  Store / Product
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            {/* MESSAGE */}

            <div className="contact-form-field full">
              <label htmlFor="contactMessage">
                Message *
              </label>

              <textarea
                id="contactMessage"
                name="message"
                value={formData.message}
                onChange={handleFormChange}
                placeholder="Write your message..."
                required
              />
            </div>

            {/* SEND */}

            <button
              type="submit"
              className="contact-send-button"
            >
              <FaPaperPlane />
              Send Message
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default Contact;