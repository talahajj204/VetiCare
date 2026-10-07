import { useEffect, useState } from "react";
import StoreHeader from "./StoreHeader";
import { FaPaw } from "react-icons/fa";

const STORE_SETTINGS_KEY = "storeSettings";

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

function About() {
  const [settings, setSettings] = useState(loadStoreSettings);

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

  const aboutTitle =
    settings.aboutTitle ||
    "About Us";

  const aboutDescription =
    settings.aboutDescription ||
    "Welcome to our veterinary clinic. We are dedicated to providing professional care and quality services for your pets.";

  const aboutImage =
    settings.aboutImage || "";

  return (
    <div className="about-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .about-page {
          min-height: 100vh;
          background: #ffffff;
          color: #243434;
        }

        /* =========================================
           SMALL HERO
        ========================================= */

        .about-hero {
          position: relative;
          overflow: hidden;

          padding: 28px 20px 25px;

          background:
            linear-gradient(
              135deg,
              #edf9f8 0%,
              #f8fcfc 55%,
              #e8f7f6 100%
            );
        }

        .about-hero::before {
          content: "";

          position: absolute;

          width: 160px;
          height: 160px;

          top: -90px;
          right: -35px;

          border-radius: 50%;

          background:
            rgba(27, 158, 154, 0.07);
        }

        .about-hero::after {
          content: "";

          position: absolute;

          width: 120px;
          height: 120px;

          bottom: -75px;
          left: -35px;

          border-radius: 50%;

          background:
            rgba(27, 158, 154, 0.05);
        }

        .about-hero-content {
          position: relative;
          z-index: 2;

          max-width: 700px;

          margin: 0 auto;

          text-align: center;
        }

        .about-small-title {
          display: inline-flex;

          align-items: center;

          gap: 6px;

          margin-bottom: 8px;

          padding: 5px 10px;

          border-radius: 25px;

          background:
            rgba(25, 154, 150, 0.1);

          color: #188f8b;

          font-size: 9px;

          font-weight: 800;

          letter-spacing: 0.8px;

          text-transform: uppercase;
        }

        .about-small-title svg {
          font-size: 9px;
        }

        .about-hero h1 {
          margin: 0;

          color: #273b3a;

          font-size:
            clamp(27px, 3vw, 36px);

          font-weight: 800;

          line-height: 1.1;
        }

        .about-hero-line {
          width: 42px;
          height: 3px;

          margin: 13px auto 0;

          border-radius: 10px;

          background: #199a96;
        }

        /* =========================================
           MAIN
        ========================================= */

        .about-main {
          width: 100%;

          max-width: 900px;

          margin: 0 auto;

          padding: 38px 25px 55px;
        }

        .about-card {
          display: grid;

          grid-template-columns:
            300px minmax(0, 1fr);

          align-items: center;

          gap: 50px;
        }

        /* =========================================
           IMAGE
        ========================================= */

        .about-image-side {
          position: relative;

          width: 300px;
        }

        .about-image-box {
          position: relative;

          width: 300px;
          height: 300px;

          overflow: hidden;

          border-radius: 17px;

          background: #edf7f6;

          box-shadow:
            0 10px 28px
            rgba(28, 74, 72, 0.09);
        }

        .about-image-box img {
          display: block;

          width: 100%;
          height: 100%;

          object-fit: cover;
        }

        .about-image-placeholder {
          width: 100%;
          height: 100%;

          display: flex;

          flex-direction: column;

          align-items: center;
          justify-content: center;

          gap: 10px;

          color: #78aaa7;
        }

        .about-image-placeholder svg {
          font-size: 38px;
        }

        .about-image-placeholder span {
          font-size: 11px;
          font-weight: 600;
        }

        .about-decoration {
          position: absolute;

          width: 75px;
          height: 75px;

          right: -12px;
          bottom: -12px;

          z-index: -1;

          border-radius: 18px;

          background: #dff3f1;
        }

        /* =========================================
           TEXT
        ========================================= */

        .about-text-side {
          width: 100%;

          padding: 5px 0;
        }

        .about-section-label {
          margin-bottom: 8px;

          color: #199a96;

          font-size: 10px;

          font-weight: 800;

          letter-spacing: 1.1px;

          text-transform: uppercase;
        }

        .about-text-side h2 {
          margin: 0 0 13px;

          color: #293d3c;

          font-size:
            clamp(24px, 3vw, 30px);

          font-weight: 800;

          line-height: 1.2;
        }

        .about-description {
          margin: 0;

          color: #667c7a;

          font-size: 12px;

          line-height: 1.7;

          white-space: pre-line;
        }

        /* =========================================
           INFO BOX
        ========================================= */

        .about-info-box {
          margin-top: 18px;

          padding: 14px 16px;

          border-left:
            3px solid #199a96;

          border-radius:
            0 10px 10px 0;

          background: #f4fafa;

          color: #536c6a;

          font-size: 11px;

          line-height: 1.6;
        }

        /* =========================================
           TABLET
        ========================================= */

        @media (max-width: 800px) {
          .about-main {
            max-width: 620px;

            padding:
              35px 20px 55px;
          }

          .about-card {
            grid-template-columns: 1fr;

            gap: 28px;
          }

          .about-image-side {
            width: 100%;
          }

          .about-image-box {
            width: 300px;
            height: 300px;

            margin: 0 auto;
          }

          .about-decoration {
            display: none;
          }

          .about-text-side {
            max-width: 500px;

            margin: 0 auto;
          }
        }

        /* =========================================
           MOBILE
        ========================================= */

        @media (max-width: 520px) {
          .about-hero {
            padding:
              23px 16px 21px;
          }

          .about-small-title {
            margin-bottom: 7px;
          }

          .about-hero h1 {
            font-size: 26px;
          }

          .about-hero-line {
            width: 37px;

            margin-top: 11px;
          }

          .about-main {
            padding:
              28px 16px 45px;
          }

          .about-card {
            gap: 24px;
          }

          .about-image-box {
            width: 100%;
            max-width: 280px;
            height: 280px;

            border-radius: 14px;
          }

          .about-text-side {
            max-width: 100%;
          }

          .about-text-side h2 {
            margin-bottom: 11px;

            font-size: 24px;
          }

          .about-description {
            font-size: 11.5px;

            line-height: 1.65;
          }

          .about-info-box {
            margin-top: 15px;

            padding: 12px 14px;

            font-size: 10.5px;
          }
        }
      `}</style>

      {/* =========================================
          HEADER
      ========================================= */}

      <StoreHeader />

      {/* =========================================
          SMALL HERO
      ========================================= */}

      <section className="about-hero">
        <div className="about-hero-content">
          <div className="about-small-title">
            <FaPaw />
            OUR STORY
          </div>

          <h1>{aboutTitle}</h1>

          <div className="about-hero-line" />
        </div>
      </section>

      {/* =========================================
          ABOUT CONTENT
      ========================================= */}

      <main className="about-main">
        <div className="about-card">

          {/* IMAGE */}

          <div className="about-image-side">
            <div className="about-image-box">
              {aboutImage ? (
                <img
                  src={aboutImage}
                  alt={aboutTitle}
                />
              ) : (
                <div className="about-image-placeholder">
                  <FaPaw />

                  <span>
                    About Us Image
                  </span>
                </div>
              )}
            </div>

            <div className="about-decoration" />
          </div>

          {/* TEXT */}

          <div className="about-text-side">
            <div className="about-section-label">
              About Our Clinic
            </div>

            <h2>{aboutTitle}</h2>

            <p className="about-description">
              {aboutDescription}
            </p>

            <div className="about-info-box">
              We care about the health, happiness and
              well-being of every pet that visits our
              clinic.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default About;