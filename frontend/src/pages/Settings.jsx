import { useEffect, useRef, useState } from "react";

import Sidebar from "../components/Sidebar";

import {
  FaCloudUploadAlt,
  FaTrash,
  FaPlus,
  FaCheckCircle,
  FaCog,
  FaTimes,
  FaInstagram,
  FaFacebookF,
  FaWhatsapp,
  FaImage,
} from "react-icons/fa";

import { FaTiktok } from "react-icons/fa6";

function Settings() {
  // =====================================================
  // REFS
  // =====================================================

  const logoInputRef = useRef(null);
  const homeBannerInputRef = useRef(null);
  const aboutImageInputRef = useRef(null);

  // =====================================================
  // STORE INFORMATION
  // =====================================================

  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] =
    useState("");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");

  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [facebook, setFacebook] = useState("");

  // =====================================================
  // ABOUT US PAGE
  // =====================================================

  const [aboutTitle, setAboutTitle] = useState("");
  const [aboutDescription, setAboutDescription] =
    useState("");
  const [aboutImage, setAboutImage] = useState(null);
  const [
    isAboutImageDragging,
    setIsAboutImageDragging,
  ] = useState(false);

  // =====================================================
  // CONTACT US PAGE
  // =====================================================

  const [contactTitle, setContactTitle] =
    useState("");
  const [
    contactDescription,
    setContactDescription,
  ] = useState("");

  // =====================================================
  // STORE LOGO
  // storeBanner stays for Header + Footer compatibility
  // =====================================================

  const [storeBanner, setStoreBanner] =
    useState(null);

  const [
    isLogoDragging,
    setIsLogoDragging,
  ] = useState(false);

  // =====================================================
  // HOME BANNER
  // Everything is controlled from Settings.
  // NO predefined banner content.
  // =====================================================

  const [homeBanner, setHomeBanner] =
    useState(null);

  const [
    homeBannerTitle,
    setHomeBannerTitle,
  ] = useState("");

  const [
    homeBannerDescription,
    setHomeBannerDescription,
  ] = useState("");

  const [
    homeBannerButtonText,
    setHomeBannerButtonText,
  ] = useState("");

  const [
    isHomeBannerDragging,
    setIsHomeBannerDragging,
  ] = useState(false);

  // =====================================================
  // STATUS OPTIONS
  // =====================================================

  const [statuses, setStatuses] = useState([
    "Active",
    "Inactive",
    "Pending",
    "Completed",
    "Cancelled",
  ]);

  const [newStatus, setNewStatus] =
    useState("");

  const [
    showStatusModal,
    setShowStatusModal,
  ] = useState(false);

  const [saved, setSaved] = useState(false);

  // =====================================================
  // LOAD SETTINGS
  // =====================================================

  useEffect(() => {
    try {
      const savedSettings =
        localStorage.getItem("storeSettings");

      if (!savedSettings) return;

      const settings =
        JSON.parse(savedSettings);

      setStoreName(
        settings.storeName || ""
      );

      setStoreDescription(
        settings.storeDescription || ""
      );

      setEmail(settings.email || "");
      setPhone(settings.phone || "");
      setWhatsapp(settings.whatsapp || "");
      setAddress(settings.address || "");

      setInstagram(
        settings.instagram || ""
      );

      setTiktok(
        settings.tiktok || ""
      );

      setFacebook(
        settings.facebook || ""
      );

      // About Us Page

      setAboutTitle(
        settings.aboutTitle || ""
      );

      setAboutDescription(
        settings.aboutDescription || ""
      );

      setAboutImage(
        settings.aboutImage || null
      );

      // Contact Us Page

      setContactTitle(
        settings.contactTitle || ""
      );

      setContactDescription(
        settings.contactDescription || ""
      );

      // Store Logo

      setStoreBanner(
        settings.storeBanner || null
      );

      // Home Banner Image

      setHomeBanner(
        settings.homeBanner || null
      );

      // Home Banner Content
      // No fallback/default text.

      setHomeBannerTitle(
        settings.homeBannerTitle || ""
      );

      setHomeBannerDescription(
        settings.homeBannerDescription || ""
      );

      setHomeBannerButtonText(
        settings.homeBannerButtonText || ""
      );

      if (Array.isArray(settings.statuses)) {
        setStatuses(settings.statuses);
      }
    } catch (error) {
      console.error(
        "Could not load store settings:",
        error
      );
    }
  }, []);

  // =====================================================
  // SAVE ONE IMAGE WITHOUT DELETING OTHER SETTINGS
  // =====================================================

  const saveImageImmediately = (
    key,
    imageData
  ) => {
    try {
      let currentSettings = {};

      const existing =
        localStorage.getItem(
          "storeSettings"
        );

      if (existing) {
        currentSettings =
          JSON.parse(existing);
      }

      const updatedSettings = {
        ...currentSettings,
        [key]: imageData,
      };

      localStorage.setItem(
        "storeSettings",
        JSON.stringify(
          updatedSettings
        )
      );

      window.dispatchEvent(
        new Event(
          "storeSettingsUpdated"
        )
      );
    } catch (error) {
      console.error(
        `Could not save ${key}:`,
        error
      );

      alert(
        "Could not save the image. Please try a smaller image."
      );
    }
  };

  // =====================================================
  // VALIDATE + READ IMAGE
  // =====================================================

  const readImageFile = (
    file,
    onSuccess
  ) => {
    if (!file) return;

    if (
      !file.type.startsWith("image/")
    ) {
      alert(
        "Please select an image file."
      );

      return;
    }

    // Images are temporarily stored as base64
    // inside localStorage.

    if (
      file.size >
      2 * 1024 * 1024
    ) {
      alert(
        "Please choose an image smaller than 2 MB."
      );

      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageData =
        reader.result;

      if (
        !imageData ||
        typeof imageData !== "string"
      ) {
        alert(
          "Could not read the image."
        );

        return;
      }

      onSuccess(imageData);
    };

    reader.onerror = () => {
      console.error(
        "FileReader could not read image."
      );

      alert(
        "Could not read the selected image."
      );
    };

    reader.readAsDataURL(file);
  };

  // =====================================================
  // STORE LOGO
  // =====================================================

  const handleLogoFile = (file) => {
    readImageFile(
      file,
      (imageData) => {
        setStoreBanner(imageData);

        saveImageImmediately(
          "storeBanner",
          imageData
        );
      }
    );
  };

  const handleLogoChange = (e) => {
    const file =
      e.target.files?.[0];

    if (file) {
      handleLogoFile(file);
    }
  };

  const handleLogoDragOver = (e) => {
    e.preventDefault();

    setIsLogoDragging(true);
  };

  const handleLogoDragLeave = (e) => {
    e.preventDefault();

    setIsLogoDragging(false);
  };

  const handleLogoDrop = (e) => {
    e.preventDefault();

    setIsLogoDragging(false);

    const file =
      e.dataTransfer.files?.[0];

    if (file) {
      handleLogoFile(file);
    }
  };

  const handleRemoveLogo = (e) => {
    e.stopPropagation();

    setStoreBanner(null);

    if (logoInputRef.current) {
      logoInputRef.current.value =
        "";
    }

    saveImageImmediately(
      "storeBanner",
      null
    );
  };

  // =====================================================
  // HOME BANNER IMAGE
  // Completely separate from Store Logo
  // =====================================================

  const handleHomeBannerFile = (
    file
  ) => {
    readImageFile(
      file,
      (imageData) => {
        setHomeBanner(imageData);

        saveImageImmediately(
          "homeBanner",
          imageData
        );
      }
    );
  };

  const handleHomeBannerChange = (
    e
  ) => {
    const file =
      e.target.files?.[0];

    if (file) {
      handleHomeBannerFile(file);
    }
  };

  const handleHomeBannerDragOver = (
    e
  ) => {
    e.preventDefault();

    setIsHomeBannerDragging(true);
  };

  const handleHomeBannerDragLeave = (
    e
  ) => {
    e.preventDefault();

    setIsHomeBannerDragging(false);
  };

  const handleHomeBannerDrop = (e) => {
    e.preventDefault();

    setIsHomeBannerDragging(false);

    const file =
      e.dataTransfer.files?.[0];

    if (file) {
      handleHomeBannerFile(file);
    }
  };

  const handleRemoveHomeBanner = (
    e
  ) => {
    e.stopPropagation();

    setHomeBanner(null);

    if (
      homeBannerInputRef.current
    ) {
      homeBannerInputRef.current.value =
        "";
    }

    saveImageImmediately(
      "homeBanner",
      null
    );
  };

  // =====================================================
  // ABOUT US IMAGE
  // =====================================================

  const handleAboutImageFile = (file) => {
    readImageFile(
      file,
      (imageData) => {
        setAboutImage(imageData);

        saveImageImmediately(
          "aboutImage",
          imageData
        );
      }
    );
  };

  const handleAboutImageChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      handleAboutImageFile(file);
    }
  };

  const handleAboutImageDragOver = (e) => {
    e.preventDefault();

    setIsAboutImageDragging(true);
  };

  const handleAboutImageDragLeave = (e) => {
    e.preventDefault();

    setIsAboutImageDragging(false);
  };

  const handleAboutImageDrop = (e) => {
    e.preventDefault();

    setIsAboutImageDragging(false);

    const file =
      e.dataTransfer.files?.[0];

    if (file) {
      handleAboutImageFile(file);
    }
  };

  const handleRemoveAboutImage = (e) => {
    e.stopPropagation();

    setAboutImage(null);

    if (aboutImageInputRef.current) {
      aboutImageInputRef.current.value = "";
    }

    saveImageImmediately(
      "aboutImage",
      null
    );
  };

  // =====================================================
  // STATUS OPTIONS
  // =====================================================

  const handleAddStatus = () => {
    const status =
      newStatus.trim();

    if (!status) return;

    const exists =
      statuses.some(
        (item) =>
          item.toLowerCase() ===
          status.toLowerCase()
      );

    if (exists) {
      alert(
        "This status already exists."
      );

      return;
    }

    setStatuses((current) => [
      ...current,
      status,
    ]);

    setNewStatus("");
  };

  const handleStatusKeyDown = (
    e
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();

      handleAddStatus();
    }
  };

  const handleDeleteStatus = (
    statusToDelete
  ) => {
    setStatuses((current) =>
      current.filter(
        (status) =>
          status !==
          statusToDelete
      )
    );
  };

  const handleCloseStatusModal =
    () => {
      setShowStatusModal(false);

      setNewStatus("");
    };

  // =====================================================
  // SAVE ALL SETTINGS
  // =====================================================

  const handleSubmit = (e) => {
    e.preventDefault();

    /*
      Keep images separate:

      storeBanner = Header + Footer Logo
      homeBanner  = Ecommerce Home Banner
      aboutImage  = About Us Page Image
    */

    let savedLogo = storeBanner;

    let savedHomeBanner =
      homeBanner;

    let savedAboutImage =
      aboutImage;

    try {
      const existing =
        localStorage.getItem(
          "storeSettings"
        );

      if (existing) {
        const oldSettings =
          JSON.parse(existing);

        if (
          oldSettings.storeBanner
        ) {
          savedLogo =
            oldSettings.storeBanner;
        }

        if (
          oldSettings.homeBanner
        ) {
          savedHomeBanner =
            oldSettings.homeBanner;
        }

        if (
          oldSettings.aboutImage
        ) {
          savedAboutImage =
            oldSettings.aboutImage;
        }
      }
    } catch (error) {
      console.error(
        "Could not read current images:",
        error
      );
    }

    const settings = {
      storeName,
      storeDescription,

      email,
      phone,
      whatsapp,
      address,

      instagram,
      tiktok,
      facebook,

      // Header + Footer Logo

      storeBanner: savedLogo,

      // Ecommerce Home Banner

      homeBanner:
        savedHomeBanner,

      // Banner content comes ONLY from Settings

      homeBannerTitle:
        homeBannerTitle.trim(),

      homeBannerDescription:
        homeBannerDescription.trim(),

      homeBannerButtonText:
        homeBannerButtonText.trim(),

      // About Us Page

      aboutTitle:
        aboutTitle.trim(),

      aboutDescription:
        aboutDescription.trim(),

      aboutImage:
        savedAboutImage,

      // Contact Us Page

      contactTitle:
        contactTitle.trim(),

      contactDescription:
        contactDescription.trim(),

      statuses,
    };

    try {
      localStorage.setItem(
        "storeSettings",
        JSON.stringify(settings)
      );

      setStoreBanner(savedLogo);

      setHomeBanner(
        savedHomeBanner
      );

      setAboutImage(
        savedAboutImage
      );

      window.dispatchEvent(
        new Event(
          "storeSettingsUpdated"
        )
      );

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);

      console.log(
        "SETTINGS SAVED:",
        settings
      );
    } catch (error) {
      console.error(
        "Could not save settings:",
        error
      );

      alert(
        "Could not save the settings. Try using smaller images."
      );
    }
  };

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <div className="page-header">
          <div>
            <h1>Settings</h1>

            <p>
              Customize your store
              information, branding and
              homepage
            </p>
          </div>
        </div>

        <form
          className="settings-form"
          onSubmit={handleSubmit}
        >
          {/* =========================================
              STORE INFORMATION
          ========================================== */}

          <div className="settings-card">
            <div className="settings-card-header">
              <h2>
                Store Information
              </h2>

              <p>
                Customize the information
                displayed on your store
              </p>
            </div>

            <div className="form-field">
              <label>
                Store Name
              </label>

              <input
                type="text"
                placeholder="Enter store name"
                value={storeName}
                onChange={(e) =>
                  setStoreName(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="form-field">
              <label>
                Store Description
              </label>

              <textarea
                placeholder="Write a short description about your store"
                value={
                  storeDescription
                }
                onChange={(e) =>
                  setStoreDescription(
                    e.target.value
                  )
                }
                rows="4"
              />
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Email</label>

                <input
                  type="email"
                  placeholder="Enter store email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="form-field">
                <label>
                  Phone Number
                </label>

                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) =>
                    setPhone(
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>
                  <FaWhatsapp />
                  WhatsApp
                </label>

                <input
                  type="tel"
                  placeholder="Example: +961 3 123 456"
                  value={whatsapp}
                  onChange={(e) =>
                    setWhatsapp(
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="form-field">
                <label>
                  Address
                </label>

                <input
                  type="text"
                  placeholder="Enter store address"
                  value={address}
                  onChange={(e) =>
                    setAddress(
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          </div>

          {/* =========================================
              STORE LOGO
          ========================================== */}

          <div className="settings-card">
            <div className="settings-card-header">
              <h2>
                Store Branding
              </h2>

              <p>
                Upload your store logo.
                This logo appears in the
                store header and footer.
              </p>
            </div>

            <div className="form-field">
              <label>
                Store Logo
              </label>

              <div className="store-banner-wrapper">
                <div
                  className={`store-banner-upload ${
                    isLogoDragging
                      ? "dragging"
                      : ""
                  }`}
                  onDragOver={
                    handleLogoDragOver
                  }
                  onDragLeave={
                    handleLogoDragLeave
                  }
                  onDrop={
                    handleLogoDrop
                  }
                  onClick={() =>
                    logoInputRef.current?.click()
                  }
                >
                  {storeBanner ? (
                    <img
                      src={storeBanner}
                      alt="Store Logo"
                      className="store-banner-preview"
                    />
                  ) : (
                    <div className="store-banner-empty">
                      <FaCloudUploadAlt className="store-banner-upload-icon" />

                      <span>
                        Upload Store Logo
                      </span>

                      <small>
                        PNG, JPG, JPEG or
                        WEBP • Max 2 MB
                      </small>
                    </div>
                  )}
                </div>

                {storeBanner && (
                  <button
                    type="button"
                    className="store-banner-remove"
                    onClick={
                      handleRemoveLogo
                    }
                    title="Remove logo"
                  >
                    <FaTrash />
                  </button>
                )}

                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={
                    handleLogoChange
                  }
                  hidden
                />
              </div>
            </div>
          </div>

          {/* =========================================
              HOME BANNER
          ========================================== */}

          <div className="settings-card">
            <div className="settings-card-header">
              <h2>
                Home Banner
              </h2>

              <p>
                Customize the image and
                all content displayed in
                the main store banner.
              </p>
            </div>

            <div className="form-field">
              <label>
                Banner Image
              </label>

              <div className="store-banner-wrapper">
                <div
                  className={`store-banner-upload home-banner-upload ${
                    isHomeBannerDragging
                      ? "dragging"
                      : ""
                  }`}
                  onDragOver={
                    handleHomeBannerDragOver
                  }
                  onDragLeave={
                    handleHomeBannerDragLeave
                  }
                  onDrop={
                    handleHomeBannerDrop
                  }
                  onClick={() =>
                    homeBannerInputRef.current?.click()
                  }
                >
                  {homeBanner ? (
                    <img
                      src={homeBanner}
                      alt="Home Banner"
                      className="store-banner-preview home-banner-preview"
                    />
                  ) : (
                    <div className="store-banner-empty">
                      <FaImage className="store-banner-upload-icon" />

                      <span>
                        Upload Home Banner
                      </span>

                      <small>
                        PNG, JPG, JPEG or
                        WEBP • Max 2 MB
                      </small>

                      <small>
                        Recommended:
                        1600 × 600 px
                      </small>
                    </div>
                  )}
                </div>

                {homeBanner && (
                  <button
                    type="button"
                    className="store-banner-remove"
                    onClick={
                      handleRemoveHomeBanner
                    }
                    title="Remove home banner"
                  >
                    <FaTrash />
                  </button>
                )}

                <input
                  ref={
                    homeBannerInputRef
                  }
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={
                    handleHomeBannerChange
                  }
                  hidden
                />
              </div>
            </div>

            <div className="form-field">
              <label>
                Banner Title
              </label>

              <input
                type="text"
                placeholder="Enter banner title"
                value={
                  homeBannerTitle
                }
                onChange={(e) =>
                  setHomeBannerTitle(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="form-field">
              <label>
                Banner Description
              </label>

              <textarea
                placeholder="Enter banner description"
                value={
                  homeBannerDescription
                }
                onChange={(e) =>
                  setHomeBannerDescription(
                    e.target.value
                  )
                }
                rows="3"
              />
            </div>

            <div className="form-field">
              <label>
                Button Text
              </label>

              <input
                type="text"
                placeholder="Enter button text"
                value={
                  homeBannerButtonText
                }
                onChange={(e) =>
                  setHomeBannerButtonText(
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          {/* =========================================
              ABOUT US PAGE
          ========================================== */}

          <div className="settings-card">
            <div className="settings-card-header">
              <h2>
                About Us Page
              </h2>

              <p>
                Customize the title,
                description and image
                displayed on your About
                Us page.
              </p>
            </div>

            <div className="form-field">
              <label>
                About Title
              </label>

              <input
                type="text"
                placeholder="Example: Caring for pets like family"
                value={aboutTitle}
                onChange={(e) =>
                  setAboutTitle(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="form-field">
              <label>
                About Description
              </label>

              <textarea
                placeholder="Write your clinic or store story..."
                value={
                  aboutDescription
                }
                onChange={(e) =>
                  setAboutDescription(
                    e.target.value
                  )
                }
                rows="5"
              />
            </div>

            <div className="form-field">
              <label>
                About Image
              </label>

              <div className="store-banner-wrapper">
                <div
                  className={`store-banner-upload about-image-upload ${
                    isAboutImageDragging
                      ? "dragging"
                      : ""
                  }`}
                  onDragOver={
                    handleAboutImageDragOver
                  }
                  onDragLeave={
                    handleAboutImageDragLeave
                  }
                  onDrop={
                    handleAboutImageDrop
                  }
                  onClick={() =>
                    aboutImageInputRef.current?.click()
                  }
                >
                  {aboutImage ? (
                    <img
                      src={aboutImage}
                      alt="About Us"
                      className="store-banner-preview about-image-preview"
                    />
                  ) : (
                    <div className="store-banner-empty">
                      <FaImage className="store-banner-upload-icon" />

                      <span>
                        Upload About Us
                        Image
                      </span>

                      <small>
                        PNG, JPG, JPEG or
                        WEBP • Max 2 MB
                      </small>

                      <small>
                        Recommended:
                        1200 × 900 px
                      </small>
                    </div>
                  )}
                </div>

                {aboutImage && (
                  <button
                    type="button"
                    className="store-banner-remove"
                    onClick={
                      handleRemoveAboutImage
                    }
                    title="Remove about image"
                  >
                    <FaTrash />
                  </button>
                )}

                <input
                  ref={
                    aboutImageInputRef
                  }
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={
                    handleAboutImageChange
                  }
                  hidden
                />
              </div>
            </div>
          </div>

          {/* =========================================
              CONTACT US PAGE
          ========================================== */}

          <div className="settings-card">
            <div className="settings-card-header">
              <h2>
                Contact Us Page
              </h2>

              <p>
                Customize your Contact Us
                page. Email, location and
                social media are connected
                automatically.
              </p>
            </div>

            <div className="form-field">
              <label>
                Contact Page Title
              </label>

              <input
                type="text"
                placeholder="Example: Contact Us"
                value={contactTitle}
                onChange={(e) =>
                  setContactTitle(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="form-field">
              <label>
                Contact Page Description
              </label>

              <textarea
                placeholder="Example: Have a question? We are always happy to help."
                value={
                  contactDescription
                }
                onChange={(e) =>
                  setContactDescription(
                    e.target.value
                  )
                }
                rows="4"
              />
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>
                  Contact Email
                </label>

                <input
                  type="email"
                  placeholder="Enter contact email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="form-field">
                <label>
                  Location
                </label>

                <input
                  type="text"
                  placeholder="Enter clinic or store location"
                  value={address}
                  onChange={(e) =>
                    setAddress(
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            <div className="contact-settings-note">
              Social media links for the
              Contact Us page are managed
              in the Social Media section
              below.
            </div>
          </div>

          {/* =========================================
              SOCIAL MEDIA
          ========================================== */}

          <div className="settings-card">
            <div className="settings-card-header">
              <h2>
                Social Media
              </h2>

              <p>
                Add your social media
                accounts so customers can
                easily reach your store.
              </p>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>
                  <FaInstagram />
                  Instagram
                </label>

                <input
                  type="text"
                  placeholder="Instagram username or link"
                  value={instagram}
                  onChange={(e) =>
                    setInstagram(
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="form-field">
                <label>
                  <FaTiktok />
                  TikTok
                </label>

                <input
                  type="text"
                  placeholder="TikTok username or link"
                  value={tiktok}
                  onChange={(e) =>
                    setTiktok(
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>
                  <FaFacebookF />
                  Facebook
                </label>

                <input
                  type="text"
                  placeholder="Facebook username or link"
                  value={facebook}
                  onChange={(e) =>
                    setFacebook(
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          </div>
                    {/* =========================================
              STATUS MANAGEMENT
          ========================================== */}

<div className="settings-card">
            <div className="settings-card-header settings-card-header-row">
              <div>
                <h2>Status Management</h2>

                <p>
                  Manage the status options used
                  throughout your system.
                </p>
              </div>

              <button
                type="button"
                className="settings-secondary-button"
                onClick={() =>
                  setShowStatusModal(true)
                }
              >
                <FaCog />
                Manage Statuses
              </button>
            </div>

            <div className="status-preview-list">
              {statuses.length > 0 ? (
                statuses.map((status) => (
                  <span
                    className="status-preview-item"
                    key={status}
                  >
                    <FaCheckCircle />
                    {status}
                  </span>
                ))
              ) : (
                <p className="status-empty-text">
                  No statuses added yet.
                </p>
              )}
            </div>
          </div>

          {/* =========================================
              SAVE SETTINGS
          ========================================== */}

          <div className="settings-save-section">
            <div className="settings-save-message">
              {saved && (
                <>
                  <FaCheckCircle />
                  Settings saved successfully
                </>
              )}
            </div>

            <button
              type="submit"
              className="settings-save-button"
            >
              <FaCheckCircle />
              Save Settings
            </button>
          </div>
        </form>
      </main>

      {/* =========================================
          STATUS MODAL
      ========================================== */}

      {showStatusModal && (
        <div
          className="settings-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseStatusModal();
            }
          }}
        >
          <div className="settings-modal">
            <div className="settings-modal-header">
              <div>
                <h2>Manage Statuses</h2>

                <p>
                  Add or remove status options.
                </p>
              </div>

              <button
                type="button"
                className="settings-modal-close"
                onClick={
                  handleCloseStatusModal
                }
              >
                <FaTimes />
              </button>
            </div>

            <div className="settings-modal-body">
              <div className="status-add-row">
                <input
                  type="text"
                  placeholder="Enter new status"
                  value={newStatus}
                  onChange={(e) =>
                    setNewStatus(
                      e.target.value
                    )
                  }
                  onKeyDown={
                    handleStatusKeyDown
                  }
                />

                <button
                  type="button"
                  onClick={handleAddStatus}
                >
                  <FaPlus />
                  Add
                </button>
              </div>

              <div className="status-modal-list">
                {statuses.length > 0 ? (
                  statuses.map((status) => (
                    <div
                      className="status-modal-item"
                      key={status}
                    >
                      <div>
                        <FaCheckCircle />
                        <span>{status}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteStatus(
                            status
                          )
                        }
                        title="Delete status"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="status-modal-empty">
                    No statuses added yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          CSS
      ========================================== */}

      <style>{`
        * {
          box-sizing: border-box;
        }

        .dashboard-layout {
          min-height: 100vh;
          display: flex;
          background: #f7faf9;
          color: #344054;

          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        .dashboard-main {
          width: 100%;
          min-width: 0;

          margin-left: 250px;

          padding:
            32px 38px 55px;
        }

        /* =====================================
           PAGE HEADER
        ====================================== */

        .page-header {
          margin-bottom: 24px;
        }

        .page-header h1 {
          margin: 0;

          color: #24364b;

          font-size: 27px;
          font-weight: 800;

          letter-spacing: -0.7px;
        }

        .page-header p {
          margin: 7px 0 0;

          color: #98a2b3;

          font-size: 11px;
          line-height: 1.6;
        }

        /* =====================================
           FORM
        ====================================== */

        .settings-form {
          width: 100%;
          max-width: 1050px;

          display: flex;
          flex-direction: column;

          gap: 20px;
        }

        /* =====================================
           CARDS
        ====================================== */

        .settings-card {
          width: 100%;

          padding: 25px 27px;

          border:
            1px solid #e2e9e8;

          border-radius: 15px;

          background: #ffffff;

          box-shadow:
            0 4px 16px
            rgba(16, 24, 40, 0.025);
        }

        .settings-card-header {
          margin-bottom: 22px;
        }

        .settings-card-header-row {
          display: flex;

          align-items: center;
          justify-content:
            space-between;

          gap: 20px;
        }

        .settings-card-header h2 {
          margin: 0;

          color: #344054;

          font-size: 15px;
          font-weight: 800;
        }

        .settings-card-header p {
          margin: 6px 0 0;

          color: #98a2b3;

          font-size: 10px;
          line-height: 1.55;
        }

        /* =====================================
           FORM FIELDS
        ====================================== */

        .form-row {
          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );

          gap: 17px;
        }

        .form-field {
          margin-bottom: 18px;
        }

        .form-field:last-child {
          margin-bottom: 0;
        }

        .form-field label {
          margin-bottom: 7px;

          display: flex;
          align-items: center;

          gap: 6px;

          color: #475467;

          font-size: 10px;
          font-weight: 750;
        }

        .form-field label svg {
          color: #159f9f;

          font-size: 12px;
        }

        .form-field input,
        .form-field textarea {
          width: 100%;

          border:
            1px solid #dce5e4;

          border-radius: 9px;

          outline: none;

          background: #ffffff;
          color: #344054;

          font-family: inherit;
          font-size: 11px;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .form-field input {
          height: 43px;

          padding: 0 13px;
        }

        .form-field textarea {
          min-height: 95px;

          padding: 12px 13px;

          resize: vertical;

          line-height: 1.6;
        }

        .form-field input::placeholder,
        .form-field textarea::placeholder {
          color: #b0b8c2;
        }

        .form-field input:focus,
        .form-field textarea:focus {
          border-color: #159f9f;

          box-shadow:
            0 0 0 3px
            rgba(
              21,
              159,
              159,
              0.08
            );
        }

        /* =====================================
           CONTACT SETTINGS NOTE
        ====================================== */

        .contact-settings-note {
          display: flex;
          align-items: center;

          min-height: 46px;

          margin-top: 3px;
          padding: 12px 15px;

          border:
            1px solid #d9eeee;

          border-radius: 9px;

          background: #f4fbfb;

          color: #668180;

          font-size: 10px;
          line-height: 1.6;
        }

        /* =====================================
           IMAGE UPLOAD
        ====================================== */

        .store-banner-wrapper {
          width: 100%;

          position: relative;
        }

        .store-banner-upload {
          width: 100%;
          min-height: 150px;

          border:
            1.5px dashed
            #cbdcda;

          border-radius: 13px;

          background:
            linear-gradient(
              135deg,
              #fbfefe,
              #f3faf9
            );

          display: flex;
          align-items: center;
          justify-content: center;

          overflow: hidden;

          cursor: pointer;

          position: relative;

          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            box-shadow 0.2s ease,
            transform 0.2s ease;
        }

        .store-banner-upload:hover {
          border-color: #159f9f;

          background:
            linear-gradient(
              135deg,
              #f8fdfd,
              #edf9f8
            );

          box-shadow:
            0 5px 18px
            rgba(
              21,
              159,
              159,
              0.08
            );
        }

        .store-banner-upload.dragging {
          border-color: #159f9f;

          background: #edf9f8;

          box-shadow:
            0 0 0 4px
            rgba(
              21,
              159,
              159,
              0.08
            );
        }

        .store-banner-empty {
          min-height: 145px;

          padding: 25px;

          display: flex;
          flex-direction: column;

          align-items: center;
          justify-content: center;

          gap: 8px;

          text-align: center;

          color: #98a2b3;
        }

        .store-banner-empty span {
          color: #475467;

          font-size: 11px;
          font-weight: 750;
        }

        .store-banner-empty small {
          color: #a5afb9;

          font-size: 9px;
          line-height: 1.4;
        }

        .store-banner-upload-icon {
          margin-bottom: 3px;

          color: #159f9f;

          font-size: 28px;
        }

        .store-banner-preview {
          display: block;

          width: 100%;
          height: 180px;

          object-fit: contain;

          padding: 12px;

          background: #ffffff;
        }

        .home-banner-upload {
          min-height: 230px;
        }

        .home-banner-preview {
          height: 270px;

          padding: 0;

          object-fit: cover;
        }

        /* =====================================
           ABOUT US IMAGE
        ====================================== */

        .about-image-upload {
          min-height: 260px;

          background:
            linear-gradient(
              135deg,
              #f9fdfd,
              #eef9f8
            );
        }

        .about-image-upload
        .store-banner-empty {
          min-height: 255px;
        }

        .about-image-preview {
          width: 100%;
          height: 300px;

          padding: 0;

          object-fit: cover;
        }

        .store-banner-remove {
          width: 34px;
          height: 34px;

          padding: 0;

          position: absolute;

          top: 10px;
          right: 10px;

          z-index: 5;

          border: none;
          border-radius: 9px;

          background:
            rgba(
              255,
              255,
              255,
              0.95
            );

          color: #d92d20;

          display: flex;
          align-items: center;
          justify-content: center;

          cursor: pointer;

          box-shadow:
            0 4px 12px
            rgba(
              16,
              24,
              40,
              0.12
            );

          transition:
            transform 0.2s ease,
            background 0.2s ease,
            color 0.2s ease;
        }

        .store-banner-remove:hover {
          transform: translateY(-1px);

          background: #d92d20;

          color: #ffffff;
        }

        /* =====================================
           STATUS MANAGEMENT
        ====================================== */

        .settings-secondary-button {
          min-height: 38px;

          padding: 0 15px;

          border:
            1px solid #d8e6e5;

          border-radius: 9px;

          background: #ffffff;

          color: #475467;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

          cursor: pointer;

          font-size: 10px;
          font-weight: 750;

          white-space: nowrap;

          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            color 0.2s ease;
        }

        .settings-secondary-button svg {
          color: #159f9f;
        }

        .settings-secondary-button:hover {
          border-color: #159f9f;

          background: #f2fbfa;

          color: #159f9f;
        }

        .status-preview-list {
          display: flex;
          flex-wrap: wrap;

          gap: 9px;
        }

        .status-preview-item {
          min-height: 32px;

          padding: 0 12px;

          border:
            1px solid #d8ebe9;

          border-radius: 20px;

          background: #f4fbfa;

          color: #52706e;

          display: inline-flex;
          align-items: center;

          gap: 6px;

          font-size: 9px;
          font-weight: 700;
        }

        .status-preview-item svg {
          color: #159f9f;

          font-size: 10px;
        }

        .status-empty-text {
          margin: 0;

          color: #98a2b3;

          font-size: 10px;
        }

        /* =====================================
           SAVE SECTION
        ====================================== */

        .settings-save-section {
          width: 100%;

          margin-top: 3px;

          padding: 18px 0 0;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 20px;
        }

        .settings-save-message {
          min-height: 35px;

          color: #159f9f;

          display: flex;
          align-items: center;

          gap: 7px;

          font-size: 10px;
          font-weight: 750;
        }

        .settings-save-button {
          min-width: 150px;
          height: 43px;

          padding: 0 20px;

          border: none;
          border-radius: 9px;

          background: #159f9f;

          color: #ffffff;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

          cursor: pointer;

          font-size: 10px;
          font-weight: 800;

          box-shadow:
            0 5px 14px
            rgba(
              21,
              159,
              159,
              0.16
            );

          transition:
            transform 0.2s ease,
            background 0.2s ease,
            box-shadow 0.2s ease;
        }

        .settings-save-button:hover {
          transform: translateY(-1px);

          background: #118f8f;

          box-shadow:
            0 7px 18px
            rgba(
              21,
              159,
              159,
              0.2
            );
        }

        .settings-save-button:active {
          transform: translateY(0);
        }

        /* =====================================
           STATUS MODAL
        ====================================== */

        .settings-modal-overlay {
          position: fixed;

          inset: 0;

          z-index: 9999;

          padding: 20px;

          background:
            rgba(
              16,
              24,
              40,
              0.42
            );

          display: flex;
          align-items: center;
          justify-content: center;

          backdrop-filter:
            blur(3px);
        }

        .settings-modal {
          width: 100%;
          max-width: 520px;

          max-height:
            calc(100vh - 40px);

          overflow: hidden;

          border:
            1px solid #e3ebea;

          border-radius: 16px;

          background: #ffffff;

          box-shadow:
            0 24px 60px
            rgba(
              16,
              24,
              40,
              0.18
            );
        }

        .settings-modal-header {
          padding: 20px 22px;

          border-bottom:
            1px solid #edf1f0;

          display: flex;
          align-items: flex-start;
          justify-content:
            space-between;

          gap: 15px;
        }

        .settings-modal-header h2 {
          margin: 0;

          color: #344054;

          font-size: 16px;
          font-weight: 800;
        }

        .settings-modal-header p {
          margin: 5px 0 0;

          color: #98a2b3;

          font-size: 10px;
          line-height: 1.5;
        }

        .settings-modal-close {
          width: 32px;
          height: 32px;

          padding: 0;

          border:
            1px solid #e1e8e7;

          border-radius: 8px;

          background: #ffffff;

          color: #667085;

          display: flex;
          align-items: center;
          justify-content: center;

          cursor: pointer;

          flex-shrink: 0;

          transition:
            background 0.2s ease,
            color 0.2s ease;
        }

        .settings-modal-close:hover {
          background: #f5f7f7;

          color: #d92d20;
        }

        .settings-modal-body {
          max-height:
            calc(100vh - 160px);

          overflow-y: auto;

          padding: 22px;
        }

        .status-add-row {
          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            auto;

          gap: 10px;

          margin-bottom: 20px;
        }

        .status-add-row input {
          width: 100%;
          height: 42px;

          padding: 0 13px;

          border:
            1px solid #dce5e4;

          border-radius: 9px;

          outline: none;

          background: #ffffff;

          color: #344054;

          font-family: inherit;
          font-size: 11px;
        }

        .status-add-row input:focus {
          border-color: #159f9f;

          box-shadow:
            0 0 0 3px
            rgba(
              21,
              159,
              159,
              0.08
            );
        }

        .status-add-row button {
          min-width: 90px;
          height: 42px;

          padding: 0 16px;

          border: none;
          border-radius: 9px;

          background: #159f9f;

          color: #ffffff;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 6px;

          cursor: pointer;

          font-size: 10px;
          font-weight: 750;
        }

        .status-add-row button:hover {
          background: #118f8f;
        }

        .status-modal-list {
          display: flex;
          flex-direction: column;

          gap: 8px;
        }

        .status-modal-item {
          min-height: 45px;

          padding: 8px 10px 8px 13px;

          border:
            1px solid #e3ebea;

          border-radius: 9px;

          background: #fbfdfd;

          display: flex;
          align-items: center;
          justify-content:
            space-between;

          gap: 12px;
        }

        .status-modal-item > div {
          min-width: 0;

          display: flex;
          align-items: center;

          gap: 8px;

          color: #475467;

          font-size: 10px;
          font-weight: 700;
        }

        .status-modal-item > div svg {
          color: #159f9f;

          flex-shrink: 0;
        }

        .status-modal-item button {
          width: 31px;
          height: 31px;

          padding: 0;

          border: none;
          border-radius: 7px;

          background: #fff2f0;

          color: #d92d20;

          display: flex;
          align-items: center;
          justify-content: center;

          cursor: pointer;

          flex-shrink: 0;

          transition:
            background 0.2s ease,
            color 0.2s ease;
        }

        .status-modal-item button:hover {
          background: #d92d20;

          color: #ffffff;
        }

        .status-modal-empty {
          padding: 30px 15px;

          border:
            1px dashed #dce5e4;

          border-radius: 10px;

          color: #98a2b3;

          text-align: center;

          font-size: 10px;
        }

        /* =====================================
           SCROLLBAR
        ====================================== */

        .settings-modal-body::-webkit-scrollbar {
          width: 6px;
        }

        .settings-modal-body::-webkit-scrollbar-track {
          background: transparent;
        }

        .settings-modal-body::-webkit-scrollbar-thumb {
          border-radius: 20px;

          background: #d8e4e3;
        }

        /* =====================================
           RESPONSIVE
        ====================================== */

        @media (max-width: 1100px) {
          .dashboard-main {
            padding:
              30px 28px 50px;
          }

          .settings-form {
            max-width: 100%;
          }
        }

        @media (max-width: 900px) {
          .dashboard-main {
            margin-left: 0;

            padding:
              80px 20px 45px;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .settings-card-header-row {
            align-items: flex-start;
          }
        }

        @media (max-width: 650px) {
          .dashboard-main {
            padding:
              75px 14px 35px;
          }

          .page-header h1 {
            font-size: 23px;
          }

          .settings-card {
            padding: 20px 17px;

            border-radius: 12px;
          }

          .settings-card-header-row {
            flex-direction: column;
          }

          .settings-secondary-button {
            width: 100%;
          }

          .settings-save-section {
            flex-direction: column;

            align-items: stretch;
          }

          .settings-save-message {
            justify-content: center;
          }

          .settings-save-button {
            width: 100%;
          }

          .store-banner-preview {
            height: 150px;
          }

          .home-banner-upload {
            min-height: 190px;
          }

          .home-banner-preview {
            height: 210px;
          }

          .about-image-upload {
            min-height: 210px;
          }

          .about-image-upload
          .store-banner-empty {
            min-height: 205px;
          }

          .about-image-preview {
            height: 230px;
          }

          .settings-modal-overlay {
            padding: 12px;
          }

          .settings-modal-header,
          .settings-modal-body {
            padding: 17px;
          }

          .status-add-row {
            grid-template-columns: 1fr;
          }

          .status-add-row button {
            width: 100%;
          }
        }

        @media (max-width: 430px) {
          .dashboard-main {
            padding-left: 11px;
            padding-right: 11px;
          }

          .settings-card {
            padding: 18px 14px;
          }

          .store-banner-upload,
          .store-banner-empty {
            min-height: 130px;
          }

          .home-banner-upload {
            min-height: 165px;
          }

          .home-banner-preview {
            height: 180px;
          }

          .about-image-upload {
            min-height: 185px;
          }

          .about-image-upload
          .store-banner-empty {
            min-height: 180px;
          }

          .about-image-preview {
            height: 200px;
          }
        }
      `}</style>
    </div>
  );
}

export default Settings;