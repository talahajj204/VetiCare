
import { useEffect, useState } from "react";
import StoreHeader from "./StoreHeader";
import {
  FaPaw,
  FaHeart,
  FaSeedling,
  FaUsers,
} from "react-icons/fa";

const STORE_SETTINGS_KEY = "storeSettings";

const loadStoreSettings = () => {
  try {
    const saved = localStorage.getItem(STORE_SETTINGS_KEY);
    return saved ? JSON.parse(saved) || {} : {};
  } catch (error) {
    console.error("Could not load store settings:", error);
    return {};
  }
};

function About() {
  const [settings, setSettings] = useState(loadStoreSettings);

  useEffect(() => {
    const refreshSettings = () => {
      setSettings(loadStoreSettings());
    };

    window.addEventListener(
      "storeSettingsUpdated",
      refreshSettings
    );
    window.addEventListener("storage", refreshSettings);

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

  const aboutTitle = settings.aboutTitle || "";
  const aboutDescription = settings.aboutDescription || "";
  const aboutImage = settings.aboutImage || "";

  const timeline = [
    {
      number: "1",
      icon: <FaSeedling />,
      title: settings.aboutStep1Title || "",
      description: settings.aboutStep1Description || "",
    },
    {
      number: "2",
      icon: <FaUsers />,
      title: settings.aboutStep2Title || "",
      description: settings.aboutStep2Description || "",
    },
    {
      number: "3",
      icon: <FaHeart />,
      title: settings.aboutStep3Title || "",
      description: settings.aboutStep3Description || "",
    },
  ];

  return (
    <div className="about-page">
      <style>{`
        .about-page,
        .about-page * {
          box-sizing: border-box;
        }

        .about-page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 5% 38%,
              rgba(26, 163, 159, 0.06),
              transparent 23%
            ),
            radial-gradient(
              circle at 95% 8%,
              rgba(26, 163, 159, 0.08),
              transparent 22%
            ),
            #ffffff;
          color: #263d3d;
        }

        .about-main {
          max-width: 1320px;
          margin: 0 auto;
          padding: 95px 40px 110px;
        }

        .about-layout {
          display: grid;
          grid-template-columns:
            minmax(0, 0.9fr)
            minmax(0, 1.1fr);
          gap: 75px;
          align-items: center;
        }

        /* IMAGE */

        .about-image-side {
          position: relative;
          width: 100%;
          padding: 35px 15px 35px 10px;
        }

        .about-image-bg {
          position: absolute;
          inset: 65px 0 10px 25px;
          background: #e2f5f3;
          border-radius: 44% 56% 46% 54%;
          transform: rotate(-8deg);
        }

        .about-image-box {
          position: relative;
          z-index: 2;
          width: 100%;
          height: 590px;
          overflow: hidden;
          border-radius:
            120px 38px 130px 45px;
          background: #eaf7f6;
          box-shadow:
            0 24px 65px rgba(18, 82, 80, 0.12);
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
          gap: 15px;
          color: #74aaa7;
        }

        .about-image-placeholder svg {
          font-size: 65px;
        }

        .about-image-placeholder span {
          font-size: 15px;
          font-weight: 600;
        }

        .about-floating-card {
          position: absolute;
          z-index: 3;
          left: -12px;
          bottom: 75px;
          padding: 20px 23px;
          background: rgba(255,255,255,0.96);
          border: 1px solid #e4f2f0;
          border-radius: 23px;
          box-shadow:
            0 14px 45px rgba(23, 80, 78, 0.12);
        }

        .about-floating-card svg {
          color: #16a09c;
          font-size: 27px;
          margin-bottom: 9px;
        }

        .about-floating-card p {
          margin: 0;
          color: #284340;
          font-size: 14px;
          font-weight: 800;
          line-height: 1.5;
        }

        .about-paw-one,
        .about-paw-two {
          position: absolute;
          color: rgba(25, 160, 156, 0.18);
        }

        .about-paw-one {
          top: 0;
          left: 12px;
          font-size: 44px;
          transform: rotate(-18deg);
        }

        .about-paw-two {
          right: -8px;
          bottom: 10px;
          font-size: 48px;
          transform: rotate(22deg);
        }

        /* TEXT */

        .about-text-side {
          width: 100%;
          min-width: 0;
        }

        .about-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 20px;
          padding: 9px 15px;
          background: #e7f7f5;
          border-radius: 30px;
          color: #169b97;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .about-text-side h1 {
          margin: 0 0 20px;
          color: #233b3c;
          font-size: clamp(38px, 4vw, 57px);
          font-weight: 850;
          line-height: 1.12;
          letter-spacing: -1.5px;
          overflow-wrap: anywhere;
        }

        .about-description {
          margin: 0 0 35px;
          color: #687e80;
          font-size: 16px;
          line-height: 1.9;
          white-space: pre-line;
        }

        /* TIMELINE */

        .about-timeline {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .about-timeline::before {
          content: "";
          position: absolute;
          top: 38px;
          bottom: 38px;
          left: 23px;
          border-left: 2px dashed #9fd8d5;
        }

        .about-step {
          position: relative;
          display: grid;
          grid-template-columns: 48px minmax(0, 1fr);
          align-items: center;
          gap: 18px;
        }

        .about-step-number {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background:
            linear-gradient(135deg, #17a8a4, #0d8987);
          color: #ffffff;
          font-size: 18px;
          font-weight: 800;
          box-shadow:
            0 5px 15px rgba(22, 160, 156, 0.2);
        }

        .about-step-card {
          display: flex;
          align-items: center;
          gap: 20px;
          min-height: 130px;
          padding: 23px;
          background: #f5fbfa;
          border: 1px solid #edf6f5;
          border-radius: 23px;
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            background 0.25s ease;
        }

        .about-step-card:hover {
          transform: translateY(-4px);
          background: #effaf8;
          box-shadow:
            0 12px 30px rgba(20, 90, 86, 0.08);
        }

        .about-step-icon {
          display: flex;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #e1f3f1;
          color: #16a09c;
          font-size: 25px;
          border: 3px solid #ffffff;
        }

        .about-step-content {
          min-width: 0;
        }

        .about-step-content h3 {
          margin: 0 0 9px;
          color: #243e42;
          font-size: 19px;
          font-weight: 800;
          overflow-wrap: anywhere;
        }

        .about-step-content p {
          margin: 0;
          color: #718589;
          font-size: 14px;
          line-height: 1.7;
          white-space: pre-line;
        }

        /* RESPONSIVE */

        @media (max-width: 1100px) {
          .about-main {
            padding: 75px 28px;
          }

          .about-layout {
            gap: 40px;
          }

          .about-image-box {
            height: 510px;
          }

          .about-step-card {
            padding: 18px;
            gap: 14px;
          }
        }

        @media (max-width: 850px) {
          .about-main {
            max-width: 690px;
            padding: 55px 24px 80px;
          }

          .about-layout {
            grid-template-columns: 1fr;
            gap: 45px;
          }

          .about-image-side {
            max-width: 520px;
            margin: 0 auto;
          }

          .about-image-box {
            height: 470px;
          }

          .about-text-side h1 {
            font-size: 40px;
          }
        }

        @media (max-width: 520px) {
          .about-main {
            padding: 35px 17px 60px;
          }

          .about-image-side {
            padding: 20px 8px;
          }

          .about-image-box {
            height: 350px;
            border-radius:
              75px 25px 85px 30px;
          }

          .about-floating-card {
            left: -5px;
            bottom: 35px;
            padding: 12px 14px;
          }

          .about-floating-card svg {
            font-size: 20px;
          }

          .about-floating-card p {
            font-size: 11px;
          }

          .about-text-side h1 {
            font-size: 34px;
          }

          .about-description {
            font-size: 14px;
          }

          .about-step {
            grid-template-columns: 38px minmax(0, 1fr);
            gap: 10px;
          }

          .about-step-number {
            width: 38px;
            height: 38px;
            font-size: 15px;
          }

          .about-timeline::before {
            left: 18px;
          }

          .about-step-card {
            padding: 15px 12px;
            min-height: 110px;
            gap: 12px;
          }

          .about-step-icon {
            width: 43px;
            height: 43px;
            font-size: 18px;
          }

          .about-step-content h3 {
            font-size: 15px;
          }

          .about-step-content p {
            font-size: 12px;
          }
        }
      `}</style>

      <StoreHeader />

      <main className="about-main">
        <div className="about-layout">
          <div className="about-image-side">
            <div className="about-image-bg" />

            <FaPaw className="about-paw-one" />
            <FaPaw className="about-paw-two" />

            <div className="about-image-box">
              {aboutImage ? (
                <img
                  src={aboutImage}
                  alt={aboutTitle || "Clinic"}
                />
              ) : (
                <div className="about-image-placeholder">
                  <FaPaw />
                  <span>Upload image from Settings</span>
                </div>
              )}
            </div>

            <div className="about-floating-card">
              <FaPaw />
              <p>
                Healthy Pets
                <br />
                Happier Lives
              </p>
            </div>
          </div>

          <div className="about-text-side">
            <div className="about-eyebrow">
              <FaPaw />
              OUR JOURNEY
            </div>

            {aboutTitle && <h1>{aboutTitle}</h1>}

            {aboutDescription && (
              <p className="about-description">
                {aboutDescription}
              </p>
            )}

            <div className="about-timeline">
              {timeline.map((step) => (
                <div className="about-step" key={step.number}>
                  <div className="about-step-number">
                    {step.number}
                  </div>

                  <div className="about-step-card">
                    <div className="about-step-icon">
                      {step.icon}
                    </div>

                    <div className="about-step-content">
                      {step.title && <h3>{step.title}</h3>}

                      {step.description && (
                        <p>{step.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default About;
