import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import StoreHeader from "./StoreHeader";
import { getPublicStoreSettings } from "../api/storeSettingsApi";

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

const DEFAULT_COLORS = {
  primaryColor: "#199a96",
  secondaryColor: "#117b78",
  lightColor: "#eaf8f7",
  borderColor: "#dcebea",
};

function normalizeSettings(data = {}) {
  const colors = { ...DEFAULT_COLORS };

  Object.keys(colors).forEach((key) => {
    const value = data?.storeColors?.[key];

    if (
      typeof value === "string" &&
      /^#[0-9a-fA-F]{6}$/.test(value)
    ) {
      colors[key] = value;
    }
  });

  const text = (key) =>
    typeof data?.[key] === "string" ? data[key] : "";

  return {
    contactDescription: text("contactDescription"),
    contactEmail: text("contactEmail"),
    email: text("email"),
    contactAddress: text("contactAddress"),
    address: text("address"),
    socialWhatsapp: text("socialWhatsapp"),
    instagram: text("instagram"),
    facebook: text("facebook"),
    tiktok: text("tiktok"),
    storeColors: colors,
  };
}

const firstFilled = (...values) =>
  values.find(
    (value) =>
      typeof value === "string" && value.trim() !== ""
  )?.trim() || "";

const isWebLink = (value) =>
  /^https?:\/\//i.test(String(value || "").trim());

const socialUrl = (value, platform) => {
  const input = String(value || "").trim();

  if (!input) return "";

  if (isWebLink(input)) return input;

  const username = input.replace(/^@/, "");

  if (platform === "instagram") {
    return `https://instagram.com/${username}`;
  }

  if (platform === "facebook") {
    return `https://facebook.com/${username}`;
  }

  if (platform === "tiktok") {
    return `https://tiktok.com/@${username}`;
  }

  return "";
};

const whatsappUrl = (value) => {
  const input = String(value || "").trim();

  if (!input) return "";

  if (isWebLink(input)) return input;

  const digits = input.replace(/\D/g, "");

  return digits ? `https://wa.me/${digits}` : "";
};

const mapsUrl = (address) => {
  const input = String(address || "").trim();

  if (!input) return "";

  if (isWebLink(input)) return input;

  return (
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(input)
  );
};

function Contact() {
  const { clinicId } = useOutletContext();

  const [settingsState, setSettingsState] = useState(() => ({
    clinicId: String(clinicId),
    data: normalizeSettings(),
  }));

  const [settingsError, setSettingsError] = useState("");

  const settings =
    settingsState.clinicId === String(clinicId)
      ? settingsState.data
      : normalizeSettings();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    petName: "",
    subject: "",
    message: "",
  });

  const [messageSent, setMessageSent] = useState(false);

  useEffect(() => {
    let controller = null;
    let disposed = false;

    setSettingsState({
      clinicId: String(clinicId),
      data: normalizeSettings(),
    });
    setSettingsError("");

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
          data: normalizeSettings(result),
        });
        setSettingsError("");
      } catch (exception) {
        if (
          disposed ||
          currentController.signal.aborted
        ) {
          return;
        }

        setSettingsError(
          exception.message ||
            "Unable to load contact information."
        );
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
  }, [clinicId]);

  const contactTitle = "Contact Us";

  const contactDescription = firstFilled(
    settings.contactDescription,
    "Our veterinary team is here to help. Contact us with any questions about your pet, our services, products, or clinic."
  );

  const email = firstFilled(
    settings.contactEmail,
    settings.email
  );

  const address = firstFilled(
    settings.contactAddress,
    settings.address
  );

  const whatsapp = firstFilled(settings.socialWhatsapp);
  const instagram = firstFilled(settings.instagram);
  const facebook = firstFilled(settings.facebook);
  const tiktok = firstFilled(settings.tiktok);

  const whatsappLink = whatsappUrl(whatsapp);
  const googleMapsLink = mapsUrl(address);

  const socialLinks = [
    {
      name: "Instagram",
      icon: <FaInstagram />,
      value: instagram,
      link: socialUrl(instagram, "instagram"),
    },
    {
      name: "Facebook",
      icon: <FaFacebookF />,
      value: facebook,
      link: socialUrl(facebook, "facebook"),
    },
    {
      name: "TikTok",
      icon: <FaTiktok />,
      value: tiktok,
      link: socialUrl(tiktok, "tiktok"),
    },
  ].filter((social) => social.value && social.link);

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

    // Message delivery is not connected to an API yet.
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

  const storeColors = settings.storeColors;

  const contactColors = {
    "--contact-primary": storeColors.primaryColor,
    "--contact-secondary": storeColors.secondaryColor,
    "--contact-light": storeColors.lightColor,
    "--contact-border": storeColors.borderColor,
  };  return (
    <div className="contact-page" style={contactColors}>
      <style>{`
        .contact-page,
        .contact-page * {
          box-sizing: border-box;
        }

        .contact-page {
          min-height: 100vh;
          background: #ffffff;
          color: #263b3a;
        }

        .contact-top {
          padding: 32px 24px 28px;
          background: linear-gradient(
            135deg,
            var(--contact-light) 0%,
            #ffffff 52%,
            var(--contact-light) 100%
          );
          text-align: center;
          border-bottom: 1px solid var(--contact-border);
        }

        .contact-top-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-bottom: 8px;
          color: var(--contact-primary);
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

        .contact-main {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding: 35px 25px 65px;
        }

        .contact-info-box {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          border: 1px solid var(--contact-border);
          border-radius: 16px;
          background: #ffffff;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(31,76,73,.05);
        }

        .contact-info-item {
          min-height: 150px;
          padding: 21px;
          display: flex;
          align-items: flex-start;
          gap: 13px;
          border-right: 1px solid var(--contact-border);
        }

        .contact-info-item:last-child {
          border-right: none;
        }

        .contact-info-icon {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          border-radius: 11px;
          background: var(--contact-light);
          color: var(--contact-primary);
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
          color: var(--contact-primary);
          font-size: 10px;
          font-weight: 800;
          text-decoration: none;
          transition: .2s ease;
        }

        .contact-info-link:hover {
          color: var(--contact-secondary);
        }

        .contact-info-link svg {
          font-size: 8px;
        }

        .contact-empty {
          margin-top: 7px !important;
          color: #9cacab !important;
          font-style: italic;
        }

        .contact-social-icons {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 10px;
        }

        .contact-social-icon {
          width: 31px;
          height: 31px;
          border: 1px solid var(--contact-border);
          border-radius: 50%;
          background: var(--contact-light);
          color: var(--contact-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          text-decoration: none;
          transition: .2s ease;
        }

        .contact-social-icon:hover {
          background: var(--contact-primary);
          border-color: var(--contact-primary);
          color: #ffffff;
          transform: translateY(-2px);
        }

        .contact-form-section {
          margin-top: 35px;
          display: grid;
          grid-template-columns:
            minmax(240px, .7fr)
            minmax(0, 1.3fr);
          gap: 42px;
          padding: 34px;
          border: 1px solid var(--contact-border);
          border-radius: 17px;
          background: linear-gradient(
            135deg,
            var(--contact-light),
            #ffffff
          );
          box-shadow: 0 10px 30px rgba(32,76,73,.04);
        }

        .contact-form-intro {
          padding: 4px;
        }

        .contact-form-intro-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 11px;
          color: var(--contact-primary);
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
          background: var(--contact-light);
          display: flex;
          align-items: flex-start;
          gap: 9px;
        }

        .contact-form-pet-note svg {
          flex-shrink: 0;
          margin-top: 2px;
          color: var(--contact-primary);
          font-size: 14px;
        }

        .contact-form-pet-note p {
          margin: 0;
          color: #58716f;
          font-size: 10px;
          line-height: 1.6;
        }

        .contact-form {
          width: 100%;
        }

        .contact-form-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
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
          border: 1px solid var(--contact-border);
          border-radius: 8px;
          outline: none;
          background: #ffffff;
          color: #344846;
          font-family: inherit;
          font-size: 11px;
          transition:
            border-color .2s ease,
            box-shadow .2s ease;
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
          border-color: var(--contact-primary);
          box-shadow: 0 0 0 3px
            color-mix(
              in srgb,
              var(--contact-primary) 7%,
              transparent
            );
        }

        .contact-form-field input::placeholder,
        .contact-form-field textarea::placeholder {
          color: #a2b1b0;
        }

        .contact-send-button {
          height: 40px;
          width: 20%;
          min-width: 145px;
          padding: 0 19px;
          border: none;
          border-radius: 8px;
          background: var(--contact-primary);
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          transition:
            background .2s ease,
            transform .2s ease;
        }

        .contact-send-button:hover {
          background: var(--contact-secondary);
          transform: translateY(-1px);
        }

        .contact-success-message {
          margin-bottom: 13px;
          padding: 11px 13px;
          border: 1px solid var(--contact-border);
          border-radius: 8px;
          background: var(--contact-light);
          color: var(--contact-secondary);
          font-size: 11px;
          font-weight: 650;
        }

        .contact-settings-error {
          margin-bottom: 20px;
          padding: 12px 15px;
          border: 1px solid #f0cccc;
          border-radius: 10px;
          background: #fff1f0;
          color: #b42318;
          font-size: 12px;
          line-height: 1.6;
        }

        @media (max-width: 1000px) {
          .contact-info-box {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .contact-info-item:nth-child(2) {
            border-right: none;
          }

          .contact-info-item:nth-child(1),
          .contact-info-item:nth-child(2) {
            border-bottom: 1px solid var(--contact-border);
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
            border-bottom: 1px solid var(--contact-border);
          }

          .contact-info-item:last-child {
            border-bottom: none;
          }

          .contact-form-section {
            margin-top: 25px;
            padding: 21px 16px;
            gap: 25px;
          }

          .contact-form-row {
            grid-template-columns: 1fr;
          }

          .contact-form-intro h2 {
            font-size: 23px;
          }

          .contact-send-button {
            width: 100%;
          }
        }
      `}</style>

      <StoreHeader />

      <section className="contact-top">
        <div className="contact-top-badge">
          <FaPaw />
          WE ARE HERE TO HELP
        </div>

        <h1>{contactTitle}</h1>
        <p>{contactDescription}</p>
      </section>

      <main className="contact-main">
        {settingsError && (
          <div
            className="contact-settings-error"
            role="alert"
          >
            {settingsError}
          </div>
        )}

        <section className="contact-info-box">
          <div className="contact-info-item">
            <div className="contact-info-icon">
              <FaWhatsapp />
            </div>

            <div className="contact-info-content">
              <h3>WhatsApp Us</h3>
              <p>Chat directly with our clinic team.</p>

              {whatsappLink ? (
                <>
                  <p className="contact-info-value">
                    {whatsapp}
                  </p>

                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-info-link"
                  >
                    Chat on WhatsApp
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

          <div className="contact-info-item">
            <div className="contact-info-icon">
              <FaEnvelope />
            </div>

            <div className="contact-info-content">
              <h3>Email Us</h3>
              <p>Send a message to our clinic team.</p>

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

          <div className="contact-info-item">
            <div className="contact-info-icon">
              <FaLocationDot />
            </div>

            <div className="contact-info-content">
              <h3>Find Our Clinic</h3>

              <p>
                Visit our clinic or find us on Google Maps.
              </p>

              {address ? (
                <>
                  <p className="contact-info-value">
                    {address}
                  </p>

                  <a
                    href={googleMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-info-link"
                  >
                    Open Google Maps
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
                      rel="noopener noreferrer"
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

        <section className="contact-form-section">
          <div className="contact-form-intro">
            <span className="contact-form-intro-badge">
              <FaPaw />
              CONTACT OUR TEAM
            </span>

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
            <div className="contact-form-row">
              <div className="contact-form-field">
                <label htmlFor="contact-full-name">
                  Full Name *
                </label>

                <input
                  id="contact-full-name"
                  type="text"
                  name="fullName"
                  placeholder="Full name"
                  value={formData.fullName}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="contact-form-field">
                <label htmlFor="contact-email">
                  Email *
                </label>

                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                />
              </div>
            </div>

            <div className="contact-form-row">
              <div className="contact-form-field">
                <label htmlFor="contact-phone">
                  Phone
                </label>

                <input
                  id="contact-phone"
                  type="tel"
                  name="phone"
                  placeholder="+961"
                  value={formData.phone}
                  onChange={handleFormChange}
                />
              </div>

              <div className="contact-form-field">
                <label htmlFor="contact-pet-name">
                  Pet Name
                </label>

                <input
                  id="contact-pet-name"
                  type="text"
                  name="petName"
                  placeholder="Pet name"
                  value={formData.petName}
                  onChange={handleFormChange}
                />
              </div>
            </div>

            <div className="contact-form-field full">
              <label htmlFor="contact-subject">
                How can we help? *
              </label>

              <select
                id="contact-subject"
                name="subject"
                value={formData.subject}
                onChange={handleFormChange}
                required
              >
                <option value="">
                  Select a reason
                </option>
                <option value="General Inquiry">
                  General Inquiry
                </option>
                <option value="Appointment">
                  Appointment
                </option>
                <option value="Pet Health">
                  Pet Health
                </option>
                <option value="Products">
                  Products
                </option>
                <option value="Orders">
                  Orders
                </option>
                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            <div className="contact-form-field full">
              <label htmlFor="contact-message">
                Message *
              </label>

              <textarea
                id="contact-message"
                name="message"
                placeholder="Write your message..."
                value={formData.message}
                onChange={handleFormChange}
                rows={5}
                required
              />
            </div>

            {messageSent && (
              <div
                className="contact-success-message"
                role="status"
              >
                Your form has been completed. Message
                delivery is not configured yet.
              </div>
            )}

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