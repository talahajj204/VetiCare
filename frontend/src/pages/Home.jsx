import { useEffect, useState } from "react";
import {
  useNavigate,
  useOutletContext,
} from "react-router-dom";


import { getStoreProducts } from "../api/storeProductsApi";
import { getStoreCategories } from "../api/storeCategoriesApi";
import { getPublicStoreSettings } from "../api/storeSettingsApi";

import {
  FaPaw,
  FaArrowRight,
  FaShoppingCart,
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
    homeBanner: text("homeBanner"),
    homeBannerBadge: text("homeBannerBadge"),
    homeBannerTitle: text("homeBannerTitle"),
    homeBannerDescription: text("homeBannerDescription"),
    homeBannerButtonText: text("homeBannerButtonText"),
    storeColors: colors,
  };
}

function readCart(key) {
  const saved = localStorage.getItem(key);

  if (saved === null) return [];

  const parsed = JSON.parse(saved);

  if (!Array.isArray(parsed)) {
    throw new Error("Your saved cart could not be read.");
  }

  return parsed;
}

function Home() {
  const navigate = useNavigate();
  const { clinicId, storeBasePath } = useOutletContext();

  const cartKey = `vetClinicStoreCart:${clinicId}`;
  const pendingKey = `vetClinicPendingStoreOrder:${clinicId}`;

  const [settingsState, setSettingsState] = useState(() => ({
    clinicId: String(clinicId),
    data: normalizeSettings(),
  }));

  const settings =
    settingsState.clinicId === String(clinicId)
      ? settingsState.data
      : normalizeSettings();

  const [settingsError, setSettingsError] = useState("");

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [categoriesLoading, setCategoriesLoading] =
    useState(true);
  const [productsLoading, setProductsLoading] =
    useState(true);

  const [categoriesError, setCategoriesError] =
    useState("");
  const [productsError, setProductsError] =
    useState("");
  const [cartError, setCartError] = useState("");

  const [cart, setCart] = useState([]);
  const [pendingCheckout, setPendingCheckout] =
    useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

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

  useEffect(() => {
    let controller = null;
    let disposed = false;

    const loadStore = async () => {
      controller?.abort();

      const currentController = new AbortController();
      controller = currentController;

      setCategoriesLoading(true);
      setProductsLoading(true);

      const [categoryResult, productResult] =
        await Promise.allSettled([
          getStoreCategories(clinicId, {
            signal: currentController.signal,
          }),
          getStoreProducts(clinicId, {
            signal: currentController.signal,
          }),
        ]);

      if (
        disposed ||
        currentController.signal.aborted
      ) {
        return;
      }

      if (categoryResult.status === "fulfilled") {
        setCategories(categoryResult.value);
        setCategoriesError("");
      } else {
        setCategoriesError(
          categoryResult.reason?.message ||
            "Unable to load categories."
        );
      }

      if (productResult.status === "fulfilled") {
        const visible = productResult.value.filter(
          (product) =>
            product &&
            Number(product.clinicId) === Number(clinicId) &&
            product.showOnStore === true
        );

        const featured = visible.filter(
          (product) => product.featured === true
        );

        const other = visible.filter(
          (product) => product.featured !== true
        );

        setProducts(
          [...featured, ...other].slice(0, 4)
        );
        setProductsError("");
      } else {
        setProductsError(
          productResult.reason?.message ||
            "Unable to load products."
        );
      }

      setCategoriesLoading(false);
      setProductsLoading(false);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadStore();
      }
    };

    setCategories([]);
    setProducts([]);
    setCategoriesError("");
    setProductsError("");

    loadStore();

    window.addEventListener(
      "vetClinicCategoriesUpdated",
      loadStore
    );
    window.addEventListener(
      "vetClinicProductsUpdated",
      loadStore
    );
    window.addEventListener("productsUpdated", loadStore);
    window.addEventListener("focus", loadStore);

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      disposed = true;
      controller?.abort();

      window.removeEventListener(
        "vetClinicCategoriesUpdated",
        loadStore
      );
      window.removeEventListener(
        "vetClinicProductsUpdated",
        loadStore
      );
      window.removeEventListener(
        "productsUpdated",
        loadStore
      );
      window.removeEventListener("focus", loadStore);

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [clinicId]);

  useEffect(() => {
    const refreshCart = () => {
      try {
        setCart(readCart(cartKey));
        setPendingCheckout(
          localStorage.getItem(pendingKey) !== null
        );
      } catch (exception) {
        setCartError(
          exception.message || "Could not read your cart."
        );
      }
    };

    const handleStorage = (event) => {
      if (
        event.key === null ||
        event.key === cartKey ||
        event.key === pendingKey
      ) {
        refreshCart();
      }
    };

    setCartError("");
    refreshCart();

    window.addEventListener("cartUpdated", refreshCart);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("cartUpdated", refreshCart);
      window.removeEventListener("storage", handleStorage);
    };
  }, [cartKey, pendingKey]);

  const goToProducts = () => {
    navigate(`${storeBasePath}/products`);
  };

  const goToCategory = (title) => {
    navigate(
      `${storeBasePath}/products?category=${encodeURIComponent(
        title
      )}`
    );
  };

  const goToProduct = (product) => {
    navigate(`${storeBasePath}/products/${product.id}`);
  };

  const getProductStock = (product) => {
    const quantity = Number(product.quantity);

    return Number.isSafeInteger(quantity) && quantity >= 0
      ? quantity
      : 0;
  };

  const getProductPrice = (product) => {
    const price = Number(product.sellingPrice);

    return Number.isFinite(price) && price >= 0
      ? price
      : 0;
  };

  const getCartQuantity = (productId) => {
    const item = cart.find(
      (entry) => String(entry.id) === String(productId)
    );

    return Number(item?.quantity) || 0;
  };

  const addToCart = (product) => {
    setCartError("");

    const productId = Number(product.id);
    const stock = getProductStock(product);
    const price = Number(product.sellingPrice);

    if (
      Number(product.clinicId) !== Number(clinicId) ||
      product.showOnStore !== true ||
      !Number.isSafeInteger(productId) ||
      productId <= 0 ||
      productId > 2147483647 ||
      !Number.isFinite(price) ||
      price < 0 ||
      stock <= 0
    ) {
      setCartError("This product is currently unavailable.");
      return;
    }

    try {
      if (localStorage.getItem(pendingKey) !== null) {
        setPendingCheckout(true);
        setCartError(
          "Please return to your cart and confirm your previous order first."
        );
        return;
      }

      const currentCart = readCart(cartKey);

      const existing = currentCart.find(
        (item) => String(item.id) === String(productId)
      );

      const quantity = existing
        ? Number(existing.quantity)
        : 0;

      if (
        !Number.isSafeInteger(quantity) ||
        quantity < 0
      ) {
        setCartError(
          "This item's saved quantity is invalid. Remove it from your cart and try again."
        );
        return;
      }

      if (quantity >= stock) {
        setCart(currentCart);
        setCartError(
          "You already have the available quantity in your cart."
        );
        return;
      }

      const cartProduct = {
        id: productId,
        clinicId: Number(clinicId),
        name: product.name,
        category: product.category || "Uncategorized",
        image: product.image || "",
        price,
        stock,
        quantity: quantity + 1,
      };

      const updatedCart = existing
        ? currentCart.map((item) =>
            String(item.id) === String(productId)
              ? cartProduct
              : item
          )
        : [...currentCart, cartProduct];

      localStorage.setItem(
        cartKey,
        JSON.stringify(updatedCart)
      );

      setCart(updatedCart);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (exception) {
      setCartError(
        exception.message ||
          "Could not save your cart. Please try again."
      );
    }
  };

  const badge = settings.homeBannerBadge.trim();
  const title = settings.homeBannerTitle.trim();
  const description = settings.homeBannerDescription.trim();
  const buttonText = settings.homeBannerButtonText.trim();
  const bannerImage = settings.homeBanner;

  const colors = settings.storeColors;

  const homeColors = {
    "--home-primary": colors.primaryColor,
    "--home-secondary": colors.secondaryColor,
    "--home-light": colors.lightColor,
    "--home-border": colors.borderColor,
    "--home-background": colors.backgroundColor,
    "--home-text": colors.textColor,
    "--home-button": colors.buttonColor,
    "--home-button-text": colors.buttonTextColor,
  };  return (
    <div className="home-page" style={homeColors}>
      

      <style>{`
        .home-page {
          min-height: 100vh;
          width: 100%;
          background: var(--home-background);
          color: var(--home-text);
          font-family: Arial, Helvetica, sans-serif;
          overflow-x: hidden;
        }

        .home-page * {
          box-sizing: border-box;
        }

        .home-page .home-hero {
          position: relative;
          width: min(94%, 1380px);
          min-height: 440px;
          margin: 30px auto 0;
          padding: 65px 7%;
          display: flex;
          align-items: center;
          overflow: hidden;
          border-radius: 24px;
          background: linear-gradient(
            120deg,
            var(--home-light) 0%,
            var(--home-background) 100%
          );
          background-size: cover;
          background-position: center;
        }

        .home-page .home-hero.has-image {
          background-color: var(--home-secondary);
        }

        .home-page .home-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            rgba(5,48,51,.85),
            rgba(5,48,51,.5),
            rgba(5,48,51,.1)
          );
        }

        .home-page .home-hero-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: min(100%, 650px);
        }

        .home-page .home-hero-badge-slot {
          width: 100%;
          min-height: 65px;
        }

        .home-page .home-hero-title-slot {
          width: 100%;
          min-height: 100px;
        }

        .home-page .home-hero-description-slot {
          width: 100%;
          min-height: 75px;
        }

        .home-page .home-hero-button-slot {
          width: 100%;
          min-height: 52px;
          display: flex;
          align-items: flex-start;
          justify-content: flex-start;
        }

        .home-page .home-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 9px 15px;
          margin-bottom: 20px;
          border-radius: 30px;
          background: rgba(255,255,255,.8);
          color: var(--home-secondary);
          font-size: 12px;
          font-weight: 800;
        }

        .home-page .home-hero-badge svg {
          font-size: 12px;
        }

        .home-page .home-hero h1 {
          margin: 0 0 20px;
          font-size: clamp(34px, 4.5vw, 61px);
          font-weight: 850;
          letter-spacing: -1.5px;
          line-height: 1.13;
          color: var(--home-secondary);
          overflow-wrap: anywhere;
        }

        .home-page .home-hero p {
          max-width: 520px;
          margin: 0 0 28px;
          color: var(--home-text);
          font-size: 15px;
          line-height: 1.9;
          white-space: pre-line;
        }

        .home-page .home-hero.has-image h1 {
          color: #fff;
        }

        .home-page .home-hero.has-image p {
          color: rgba(255,255,255,.88);
        }

        .home-page button.home-shop-button {
          display: inline-flex !important;
          align-items: center;
          justify-content: center;
          align-self: flex-start;
          gap: 10px;
          width: fit-content !important;
          max-width: 100%;
          min-height: 42px;
          padding: 12px 22px;
          flex: 0 0 auto;
          border: 0;
          border-radius: 10px;
          background: var(--home-button) !important;
          color: var(--home-button-text) !important;
          font-size: 13px;
          font-weight: 800;
          white-space: nowrap;
          cursor: pointer;
          transition:
            background .2s ease,
            transform .2s ease;
        }

        .home-page button.home-shop-button:hover {
          background: var(--home-secondary) !important;
          color: var(--home-button-text) !important;
          transform: translateY(-2px);
        }

        .home-page .home-container {
          width: min(92%, 1240px);
          margin: 0 auto;
          padding: 65px 0 90px;
        }

        .home-page .home-section-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .home-page .home-section-header h2 {
          margin: 0 0 10px;
          color: var(--home-text);
          font-size: clamp(23px, 3vw, 31px);
          font-weight: 850;
          letter-spacing: -.6px;
        }

        .home-page .home-section-header p {
          margin: 0;
          color: var(--home-text);
          opacity: .7;
          font-size: 13px;
          line-height: 1.7;
        }

        .home-page .home-categories-section {
          margin-bottom: 75px;
        }

        .home-page .home-categories-window {
          width: 100%;
          overflow-x: auto;
          overflow-y: hidden;
          padding: 8px 0 20px;
        }

        .home-page .home-categories-track {
          display: flex;
          gap: 17px;
          width: max-content;
          min-width: 100%;
          justify-content: center;
          animation: none;
          transform: none;
        }

        .home-page button.home-category-card {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          width: 185px;
          flex: 0 0 185px;
          padding: 0;
          overflow: hidden;
          border: 1px solid var(--home-border) !important;
          border-radius: 15px;
          background: var(--home-background) !important;
          color: var(--home-text) !important;
          box-shadow: 0 5px 15px rgba(0,0,0,.04);
          text-align: center;
          cursor: pointer;
          transition:
            transform .2s ease,
            box-shadow .2s ease,
            border-color .2s ease;
        }

        .home-page button.home-category-card:hover,
        .home-page button.home-category-card:focus-visible {
          background: var(--home-background) !important;
          color: var(--home-text) !important;
          border-color: var(--home-primary) !important;
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0,0,0,.12);
        }

        .home-page button.home-category-card:active {
          background: var(--home-background) !important;
          color: var(--home-text) !important;
        }

        .home-page .home-category-image-wrapper {
          width: 100%;
          height: 130px;
          overflow: hidden;
          background: var(--home-light) !important;
        }

        .home-page .home-category-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .home-page .home-category-no-image {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background: var(--home-light);
          color: var(--home-primary);
          font-size: 32px;
        }

        .home-page button.home-category-card:hover
        .home-category-image-wrapper,
        .home-page button.home-category-card:hover
        .home-category-no-image {
          background: var(--home-light) !important;
        }

        .home-page button.home-category-card
        .home-category-name {
          display: block;
          width: 100%;
          padding: 15px 12px;
          background: var(--home-background) !important;
          color: var(--home-text) !important;
          font-size: 13px;
          font-weight: 800;
          overflow-wrap: anywhere;
          transition: color .2s ease;
        }

        .home-page button.home-category-card:hover
        .home-category-name {
          background: var(--home-background) !important;
          color: var(--home-primary) !important;
        }

        .home-page .home-products-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 28px;
        }

        .home-page .home-products-header
        .home-section-header {
          margin: 0;
          text-align: left;
        }

        .home-page .home-products-header
        button.home-view-all-button {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 8px !important;
          width: max-content !important;
          min-width: 0 !important;
          max-width: max-content !important;
          height: 42px !important;
          min-height: 42px !important;
          flex: 0 0 auto !important;
          flex-grow: 0 !important;
          flex-shrink: 0 !important;
          margin: 0 0 0 auto !important;
          padding: 10px 16px !important;
          border: 1px solid var(--home-border) !important;
          border-radius: 9px !important;
          background: var(--home-background) !important;
          color: var(--home-primary) !important;
          font-size: 12px !important;
          font-weight: 800 !important;
          line-height: 1 !important;
          white-space: nowrap !important;
          cursor: pointer;
          transition:
            background .2s ease,
            border-color .2s ease;
        }

        .home-page .home-products-header
        button.home-view-all-button:hover {
          background: var(--home-light) !important;
          color: var(--home-secondary) !important;
          border-color: var(--home-primary) !important;
        }

        .home-page .home-products-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
        }

        .home-page .home-product-card {
          min-width: 0;
          overflow: hidden;
          border: 1px solid var(--home-border);
          border-radius: 16px;
          background: var(--home-background);
          transition:
            transform .2s ease,
            box-shadow .2s ease,
            border-color .2s ease;
        }

        .home-page .home-product-card:hover {
          background: var(--home-background);
          border-color: var(--home-primary);
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0,0,0,.09);
        }

        .home-page .home-product-image-area {
          height: 200px;
          background: var(--home-light);
          cursor: pointer;
          overflow: hidden;
        }

        .home-page .home-product-image {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition: transform .25s;
        }

        .home-page .home-product-card:hover
        .home-product-image {
          transform: scale(1.04);
        }

        .home-page .home-product-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: var(--home-light);
          color: var(--home-primary);
          font-size: 40px;
        }

        .home-page .home-product-info {
          padding: 17px;
          background: var(--home-background);
        }

        .home-page .home-product-info h3 {
          margin: 0 0 8px;
          font-size: 15px;
          font-weight: 800;
          color: var(--home-text);
          cursor: pointer;
          overflow-wrap: anywhere;
        }

        .home-page .home-product-info h3:hover {
          color: var(--home-primary);
        }

        .home-page .home-product-category {
          display: block;
          color: var(--home-text);
          opacity: .65;
          font-size: 11px;
          margin-bottom: 15px;
        }

        .home-page .home-product-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .home-page .home-product-price {
          color: var(--home-primary);
          font-size: 17px;
          font-weight: 850;
        }

        .home-page button.home-add-cart {
          width: 36px !important;
          min-width: 36px !important;
          max-width: 36px !important;
          height: 36px !important;
          min-height: 36px !important;
          padding: 0 !important;
          flex: 0 0 36px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          border: 0 !important;
          border-radius: 8px;
          background: var(--home-light) !important;
          color: var(--home-secondary) !important;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          transition:
            background .2s ease,
            color .2s ease;
        }

        .home-page button.home-add-cart svg {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          color: inherit !important;
        }

        .home-page button.home-add-cart:hover:not(:disabled) {
          background: var(--home-button) !important;
          color: var(--home-button-text) !important;
        }

        .home-page button.home-add-cart:disabled {
          opacity: .45;
          cursor: not-allowed;
        }

        .home-page .home-empty {
          padding: 35px;
          border: 1px dashed var(--home-border);
          border-radius: 12px;
          text-align: center;
          color: var(--home-text);
          opacity: .7;
          font-size: 13px;
        }

        .home-page .home-message {
          padding: 12px 15px;
          margin-bottom: 18px;
          border: 1px solid var(--home-border);
          border-radius: 10px;
          background: var(--home-light);
          color: var(--home-secondary);
          font-size: 12px;
          line-height: 1.6;
        }

        .home-page .home-message.error {
          background: #fff1f0;
          border-color: #f0cccc;
          color: #b42318;
        }

        @media (max-width: 1000px) {
          .home-page .home-products-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 600px) {
          .home-page .home-hero {
            width: 94%;
            min-height: 380px;
            margin-top: 15px;
            padding: 35px 25px;
            border-radius: 17px;
          }

          .home-page .home-hero h1 {
            font-size: 34px;
          }

          .home-page .home-hero p {
            font-size: 13px;
          }

          .home-page .home-hero-badge-slot {
            min-height: 55px;
          }

          .home-page .home-hero-title-slot {
            min-height: 70px;
          }

          .home-page .home-hero-description-slot {
            min-height: 65px;
          }

          .home-page .home-container {
            padding: 45px 0 65px;
          }

          .home-page button.home-category-card {
            width: 150px;
            flex-basis: 150px;
          }

          .home-page .home-category-image-wrapper {
            height: 110px;
          }

          .home-page .home-products-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }

          .home-page .home-product-image-area {
            height: 140px;
          }

          .home-page .home-product-info {
            padding: 12px;
          }

          .home-page .home-product-info h3 {
            font-size: 12px;
          }

          .home-page .home-product-price {
            font-size: 14px;
          }

          .home-page .home-product-bottom {
            flex-wrap: wrap;
          }

          .home-page .home-products-header {
            flex-wrap: wrap;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .home-page .home-categories-track {
            animation: none;
          }
        }
      `}</style>

      <section
        className={`home-hero ${
          bannerImage ? "has-image" : ""
        }`}
        style={
          bannerImage
            ? {
                backgroundImage: `url(${JSON.stringify(
                  bannerImage
                )})`,
              }
            : undefined
        }
      >
        {bannerImage && (
          <div className="home-hero-overlay" />
        )}

        <div className="home-hero-content">
          <div className="home-hero-badge-slot">
            {badge && (
              <div className="home-hero-badge">
                <FaPaw />
                <span>{badge}</span>
              </div>
            )}
          </div>

          <div className="home-hero-title-slot">
            {title && <h1>{title}</h1>}
          </div>

          <div className="home-hero-description-slot">
            {description && <p>{description}</p>}
          </div>

          <div className="home-hero-button-slot">
            {buttonText && (
              <button
                type="button"
                className="home-shop-button"
                onClick={goToProducts}
              >
                {buttonText}
                <FaArrowRight />
              </button>
            )}
          </div>
        </div>
      </section>

      <main className="home-container">
        {settingsError && (
          <div className="home-message error" role="alert">
            {settingsError}
          </div>
        )}

        {cartError && (
          <div className="home-message error" role="alert">
            {cartError}
          </div>
        )}

        {pendingCheckout && !cartError && (
          <div className="home-message" role="status">
            Return to your cart to confirm your previous
            order before adding more items.
          </div>
        )}

        <section className="home-categories-section">
          <div className="home-section-header">
            <h2>Shop by Category</h2>
            <p>Explore our available categories.</p>
          </div>

          {categoriesError && (
            <div className="home-message error" role="alert">
              {categoriesError}
            </div>
          )}

          {categories.length > 0 ? (
            <div className="home-categories-window">
              <div className="home-categories-track">
                {categories.map((category) => (
                  <button
                    type="button"
                    key={category.id}
                    className="home-category-card"
                    onClick={() =>
                      goToCategory(category.title)
                    }
                  >
                    <div className="home-category-image-wrapper">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.title}
                          className="home-category-image"
                        />
                      ) : (
                        <div className="home-category-no-image">
                          <FaPaw />
                        </div>
                      )}
                    </div>

                    <span className="home-category-name">
                      {category.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : categoriesLoading ? (
            <div className="home-empty" role="status">
              Loading categories...
            </div>
          ) : !categoriesError ? (
            <div className="home-empty">
              No categories available yet.
            </div>
          ) : null}
        </section>

        <section className="home-products-section">
          <div className="home-products-header">
            <div className="home-section-header">
              <h2>Featured Products</h2>
              <p>Explore products from our store.</p>
            </div>

            <button
              type="button"
              className="home-view-all-button"
              onClick={goToProducts}
            >
              View All
              <FaArrowRight />
            </button>
          </div>

          {productsError && (
            <div className="home-message error" role="alert">
              {productsError}
            </div>
          )}

          {products.length > 0 ? (
            <div className="home-products-grid">
              {products.map((product) => {
                const stock = getProductStock(product);
                const price = getProductPrice(product);

                const stockLimitReached =
                  getCartQuantity(product.id) >= stock;

                const rawPrice = Number(
                  product.sellingPrice
                );

                const invalidPrice =
                  !Number.isFinite(rawPrice) ||
                  rawPrice < 0;

                const cartDisabled =
                  stock <= 0 ||
                  stockLimitReached ||
                  pendingCheckout ||
                  invalidPrice;

                const cartLabel =
                  stock <= 0
                    ? "Out of Stock"
                    : pendingCheckout
                      ? "Confirm your previous order first"
                      : invalidPrice
                        ? "Currently unavailable"
                        : stockLimitReached
                          ? "Stock Limit Reached"
                          : "Add to Cart";

                return (
                  <article
                    className="home-product-card"
                    key={product.id}
                  >
                    <div
                      className="home-product-image-area"
                      role="link"
                      tabIndex={0}
                      aria-label={`View ${product.name}`}
                      onClick={() =>
                        goToProduct(product)
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" ||
                          event.key === " "
                        ) {
                          event.preventDefault();
                          goToProduct(product);
                        }
                      }}
                    >
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="home-product-image"
                        />
                      ) : (
                        <div className="home-product-placeholder">
                          <FaPaw />
                        </div>
                      )}
                    </div>

                    <div className="home-product-info">
                      <h3
                        onClick={() =>
                          goToProduct(product)
                        }
                      >
                        {product.name}
                      </h3>

                      <span className="home-product-category">
                        {product.category || "Uncategorized"}
                      </span>

                      <div className="home-product-bottom">
                        <span className="home-product-price">
                          ${price.toFixed(2)}
                        </span>

                        <button
                          type="button"
                          className="home-add-cart"
                          onClick={() =>
                            addToCart(product)
                          }
                          disabled={cartDisabled}
                          title={cartLabel}
                          aria-label={`${cartLabel}: ${product.name}`}
                        >
                          <FaShoppingCart aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : productsLoading ? (
            <div className="home-empty" role="status">
              Loading products...
            </div>
          ) : !productsError ? (
            <div className="home-empty">
              No featured products available yet.
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}

export default Home;