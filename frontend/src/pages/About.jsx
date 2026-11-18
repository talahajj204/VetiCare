import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { getPublicStoreSettings } from "../api/storeSettingsApi";

import {
  FaPaw,
  FaHeart,
  FaSeedling,
  FaUsers,
} from "react-icons/fa";

const DEFAULT_COLORS = {
  primaryColor: "#1aa6a6",
  secondaryColor: "#11797b",
  lightColor: "#e8f7f7",
  borderColor: "#dcebea",
  backgroundColor: "#ffffff",
  textColor: "#344054",
  buttonColor: "#1aa6a6",
  buttonTextColor: "#ffffff",
  footerColor: "#11797b",
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
    aboutTitle: text("aboutTitle"),
    aboutDescription: text("aboutDescription"),
    aboutImage: text("aboutImage"),
    timeline1Title: text("timeline1Title"),
    timeline1Description: text("timeline1Description"),
    timeline2Title: text("timeline2Title"),
    timeline2Description: text("timeline2Description"),
    timeline3Title: text("timeline3Title"),
    timeline3Description: text("timeline3Description"),
    storeColors: colors,
  };
}

function About() {
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
            "Unable to load store settings."
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

  const colors = settings.storeColors;

  const aboutColors = {
    "--about-primary": colors.primaryColor,
    "--about-secondary": colors.secondaryColor,
    "--about-light": colors.lightColor,
    "--about-border": colors.borderColor,
    "--about-background": colors.backgroundColor,
    "--about-text": colors.textColor,
    "--about-button": colors.buttonColor,
    "--about-button-text": colors.buttonTextColor,
    "--footer-color": colors.footerColor,
    "--footer-light": colors.lightColor,
    "--footer-border": colors.borderColor,
  };

  const aboutTitle = settings.aboutTitle;
  const aboutDescription = settings.aboutDescription;
  const aboutImage = settings.aboutImage;

  const timeline = [
    {
      number: "1",
      icon: <FaSeedling />,
      title: settings.timeline1Title,
      description: settings.timeline1Description,
    },
    {
      number: "2",
      icon: <FaUsers />,
      title: settings.timeline2Title,
      description: settings.timeline2Description,
    },
    {
      number: "3",
      icon: <FaHeart />,
      title: settings.timeline3Title,
      description: settings.timeline3Description,
    },
  ];

  return (
    <div className="about-page" style={aboutColors}>
      <style>{aboutStyles}</style>

      

      <main className="about-main">
        {settingsError && (
          <div
            role="alert"
            style={{
              marginBottom: 24,
              padding: "12px 15px",
              border: "1px solid #f0cccc",
              borderRadius: 10,
              background: "#fff1f0",
              color: "#b42318",
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            {settingsError}
          </div>
        )}

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
                <div
                  className="about-step"
                  key={step.number}
                >
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

export default About;const aboutStyles = `
.about-page,
.about-page * {
  box-sizing: border-box;
}

.about-page {
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
  background: var(--about-background);
  color: var(--about-text);
}

.about-page .about-main {
  max-width: 1320px;
  margin: 0 auto;
  padding: 95px 40px 110px;
}

.about-page .about-layout {
  display: grid;
  grid-template-columns:
    minmax(0, 0.9fr)
    minmax(0, 1.1fr);
  gap: 75px;
  align-items: center;
}

.about-page .about-image-side {
  position: relative;
  width: 100%;
  padding: 35px 15px 35px 10px;
}

.about-page .about-image-bg {
  position: absolute;
  inset: 65px 0 10px 25px;
  background: var(--about-light);
  border-radius: 44% 56% 46% 54%;
  transform: rotate(-8deg);
}

.about-page .about-image-box {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 590px;
  overflow: hidden;
  border-radius: 120px 38px 130px 45px;
  background: var(--about-light);
  box-shadow: 0 24px 65px rgba(0,0,0,.12);
}

.about-page .about-image-box img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.about-page .about-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  color: var(--about-secondary);
}

.about-page .about-image-placeholder svg {
  font-size: 65px;
}

.about-page .about-image-placeholder span {
  font-size: 15px;
  font-weight: 600;
}

.about-page .about-floating-card {
  position: absolute;
  z-index: 3;
  left: -12px;
  bottom: 75px;
  padding: 20px 23px;
  background: var(--about-background);
  border: 1px solid var(--about-border);
  border-radius: 23px;
  box-shadow: 0 14px 45px rgba(0,0,0,.12);
}

.about-page .about-floating-card svg {
  color: var(--about-primary);
  font-size: 27px;
  margin-bottom: 9px;
}

.about-page .about-floating-card p {
  margin: 0;
  color: var(--about-text);
  font-size: 14px;
  font-weight: 800;
  line-height: 1.5;
}

.about-page .about-paw-one,
.about-page .about-paw-two {
  position: absolute;
  color: var(--about-primary);
  opacity: .18;
}

.about-page .about-paw-one {
  top: 0;
  left: 12px;
  font-size: 44px;
  transform: rotate(-18deg);
}

.about-page .about-paw-two {
  right: -8px;
  bottom: 10px;
  font-size: 48px;
  transform: rotate(22deg);
}

.about-page .about-text-side {
  width: 100%;
  min-width: 0;
}

.about-page .about-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 20px;
  padding: 9px 15px;
  background: var(--about-light);
  border-radius: 30px;
  color: var(--about-secondary);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1px;
}

.about-page .about-text-side h1 {
  margin: 0 0 20px;
  color: var(--about-text);
  font-size: clamp(38px, 4vw, 57px);
  font-weight: 850;
  line-height: 1.12;
  letter-spacing: -1.5px;
  overflow-wrap: anywhere;
}

.about-page .about-description {
  margin: 0 0 35px;
  color: var(--about-text);
  opacity: .8;
  font-size: 16px;
  line-height: 1.9;
  white-space: pre-line;
}

.about-page .about-timeline {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.about-page .about-timeline::before {
  content: "";
  position: absolute;
  top: 38px;
  bottom: 38px;
  left: 23px;
  border-left: 2px dashed var(--about-primary);
  opacity: .5;
}

.about-page .about-step {
  position: relative;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  align-items: center;
  gap: 18px;
}

.about-page .about-step-number {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--about-button);
  color: var(--about-button-text);
  font-size: 18px;
  font-weight: 800;
  box-shadow: 0 5px 15px rgba(0,0,0,.12);
}

.about-page .about-step-card {
  display: flex;
  align-items: center;
  gap: 20px;
  min-height: 130px;
  padding: 23px;
  background: var(--about-light);
  border: 1px solid var(--about-border);
  border-radius: 23px;
  transition:
    transform .25s ease,
    box-shadow .25s ease,
    background .25s ease;
}

.about-page .about-step-card:hover {
  transform: translateY(-4px);
  background: var(--about-light);
  box-shadow: 0 12px 30px rgba(0,0,0,.1);
}

.about-page .about-step-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--about-background);
  color: var(--about-primary);
  font-size: 25px;
  border: 3px solid var(--about-border);
}

.about-page .about-step-content {
  min-width: 0;
}

.about-page .about-step-content h3 {
  margin: 0 0 9px;
  color: var(--about-text);
  font-size: 19px;
  font-weight: 800;
  overflow-wrap: anywhere;
}

.about-page .about-step-content p {
  margin: 0;
  color: var(--about-text);
  opacity: .8;
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-line;
}

@media (max-width: 1100px) {
  .about-page .about-main {
    padding: 75px 28px;
  }

  .about-page .about-layout {
    gap: 40px;
  }

  .about-page .about-image-box {
    height: 510px;
  }

  .about-page .about-step-card {
    padding: 18px;
    gap: 14px;
  }
}

@media (max-width: 850px) {
  .about-page .about-main {
    max-width: 690px;
    padding: 55px 24px 80px;
  }

  .about-page .about-layout {
    grid-template-columns: 1fr;
    gap: 45px;
  }

  .about-page .about-image-side {
    max-width: 520px;
    margin: 0 auto;
  }

  .about-page .about-image-box {
    height: 470px;
  }

  .about-page .about-text-side h1 {
    font-size: 40px;
  }
}

@media (max-width: 520px) {
  .about-page .about-main {
    padding: 35px 17px 60px;
  }

  .about-page .about-image-side {
    padding: 20px 8px;
  }

  .about-page .about-image-box {
    height: 350px;
    border-radius: 75px 25px 85px 30px;
  }

  .about-page .about-floating-card {
    left: -5px;
    bottom: 35px;
    padding: 12px 14px;
  }

  .about-page .about-floating-card svg {
    font-size: 20px;
  }

  .about-page .about-floating-card p {
    font-size: 11px;
  }

  .about-page .about-text-side h1 {
    font-size: 34px;
  }

  .about-page .about-description {
    font-size: 14px;
  }

  .about-page .about-step {
    grid-template-columns: 38px minmax(0, 1fr);
    gap: 10px;
  }

  .about-page .about-step-number {
    width: 38px;
    height: 38px;
    font-size: 15px;
  }

  .about-page .about-timeline::before {
    left: 18px;
  }

  .about-page .about-step-card {
    padding: 15px 12px;
    min-height: 110px;
    gap: 12px;
  }

  .about-page .about-step-icon {
    width: 43px;
    height: 43px;
    font-size: 18px;
  }

  .about-page .about-step-content h3 {
    font-size: 15px;
  }

  .about-page .about-step-content p {
    font-size: 12px;
  }
}
`;