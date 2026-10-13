
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StoreHeader from "./StoreHeader";
import { FaPaw, FaArrowRight } from "react-icons/fa";

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

const readSettings = () => {
  try {
    return (
      JSON.parse(localStorage.getItem("storeSettings") || "{}") || {}
    );
  } catch {
    return {};
  }
};

const readCategories = () => {
  try {
    const data = JSON.parse(
      localStorage.getItem("vetClinicCategories") || "[]"
    );

    if (!Array.isArray(data)) return [];

    return [...data].sort(
      (a, b) =>
        Number(a.sortOrder || 0) -
        Number(b.sortOrder || 0)
    );
  } catch {
    return [];
  }
};

const readProducts = () => {
  try {
    const data = JSON.parse(
      localStorage.getItem("vetClinicProducts") || "[]"
    );

    if (!Array.isArray(data)) return [];

    const visible = data.filter(
      (product) => product.showOnStore === true
    );

    const featured = visible.filter(
      (product) => product.featured === true
    );

    const other = visible.filter(
      (product) => product.featured !== true
    );

    return [...featured, ...other].slice(0, 4);
  } catch {
    return [];
  }
};

function Home() {
  const navigate = useNavigate();

  const [settings, setSettings] = useState(readSettings);
  const [categories, setCategories] = useState(readCategories);
  const [products, setProducts] = useState(readProducts);

  useEffect(() => {
    const refreshSettings = () => setSettings(readSettings());
    const refreshCategories = () => setCategories(readCategories());
    const refreshProducts = () => setProducts(readProducts());

    const refreshAll = () => {
      refreshSettings();
      refreshCategories();
      refreshProducts();
    };

    window.addEventListener(
      "storeSettingsUpdated",
      refreshSettings
    );

    window.addEventListener(
      "vetClinicCategoriesUpdated",
      refreshCategories
    );

    window.addEventListener(
      "vetClinicProductsUpdated",
      refreshProducts
    );

    window.addEventListener("storage", refreshAll);

    return () => {
      window.removeEventListener(
        "storeSettingsUpdated",
        refreshSettings
      );

      window.removeEventListener(
        "vetClinicCategoriesUpdated",
        refreshCategories
      );

      window.removeEventListener(
        "vetClinicProductsUpdated",
        refreshProducts
      );

      window.removeEventListener("storage", refreshAll);
    };
  }, []);

  const goToProducts = () => navigate("/products");

  const goToCategory = (title) => {
    navigate(
      `/products?category=${encodeURIComponent(title)}`
    );
  };

  const goToProduct = (product) => {
    navigate(`/products/${product.id}`);
  };

  const addToCart = (product) => {
    try {
      const stored = JSON.parse(
        localStorage.getItem("vetClinicStoreCart") || "[]"
      );

      const cart = Array.isArray(stored)
        ? [...stored]
        : [];

      const existing = cart.find(
        (item) =>
          String(item.id) === String(product.id)
      );

      if (existing) {
        existing.quantity =
          Number(existing.quantity || 0) + 1;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          image: product.image || "",
          price: Number(product.sellingPrice || 0),
          quantity: 1,
        });
      }

      localStorage.setItem(
        "vetClinicStoreCart",
        JSON.stringify(cart)
      );

      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Cart error:", error);
    }
  };

  const badge = String(
    settings.homeBannerBadge || ""
  ).trim();

  const title = String(
    settings.homeBannerTitle || ""
  ).trim();

  const description = String(
    settings.homeBannerDescription || ""
  ).trim();

  const buttonText = String(
    settings.homeBannerButtonText || ""
  ).trim();

  const bannerImage = settings.homeBanner || "";

  // COLORS FROM ADMIN SETTINGS

  const colors = {
    ...DEFAULT_COLORS,
    ...(settings.storeColors || {}),
  };

  const homeColors = {
    "--home-primary": colors.primaryColor,
    "--home-secondary": colors.secondaryColor,
    "--home-light": colors.lightColor,
    "--home-border": colors.borderColor,
    "--home-background": colors.backgroundColor,
    "--home-text": colors.textColor,
    "--home-button": colors.buttonColor,
    "--home-button-text": colors.buttonTextColor,
  };

  return (
    <div className="home-page" style={homeColors}>
      <StoreHeader />

      <style>{`
        /* ======================================
           HOME PAGE - ISOLATED STYLES
        ====================================== */

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

        /* HERO BANNER */

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

        /* SHOP BUTTON */

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

        /* MAIN CONTENT */

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

        /* CATEGORY CAROUSEL */

        .home-page .home-categories-section {
          margin-bottom: 75px;
        }

        .home-page .home-categories-window {
          width: 100%;
          overflow: hidden;
          padding: 8px 0 20px;
        }

        .home-page .home-categories-track {
          display: flex;
          gap: 17px;
          width: max-content;
          animation: homeCategoryScroll 35s linear infinite;
        }

        .home-page .home-categories-window:hover
        .home-categories-track {
          animation-play-state: paused;
        }

        @keyframes homeCategoryScroll {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        /* CATEGORY CARD */

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

        /*
          FIX:
          NO TURQUOISE BACKGROUND ON HOVER.
          NO PURPLE/RED TEXT FROM GLOBAL CSS.
        */

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

        /* ONLY NAME COLOR CHANGES ON HOVER */

        .home-page button.home-category-card:hover
        .home-category-name {
          background: var(--home-background) !important;
          color: var(--home-primary) !important;
        }

        /* FEATURED PRODUCTS */

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

        /* VIEW ALL BUTTON */

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
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 20px;
        }

        /* PRODUCT CARDS */

        .home-page .home-product-card {
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
          padding: 9px 12px;
          border: 0 !important;
          border-radius: 8px;
          background: var(--home-light) !important;
          color: var(--home-secondary) !important;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          transition:
            background .2s ease,
            color .2s ease;
        }

        .home-page button.home-add-cart:hover {
          background: var(--home-button) !important;
          color: var(--home-button-text) !important;
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

        /* RESPONSIVE */

        @media (max-width: 1000px) {
          .home-page .home-products-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
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
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
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

      {/* HOME BANNER — ALL TEXT FROM SETTINGS */}

      <section
        className={`home-hero ${
          bannerImage ? "has-image" : ""
        }`}
        style={
          bannerImage
            ? {
                backgroundImage: `url("${bannerImage}")`,
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
        {/* SHOP BY CATEGORY */}

        <section className="home-categories-section">
          <div className="home-section-header">
            <h2>Shop by Category</h2>
            <p>Explore our available categories.</p>
          </div>

          {categories.length > 0 ? (
            <div className="home-categories-window">
              <div className="home-categories-track">
                {[...categories, ...categories].map(
                  (category, index) => (
                    <button
                      type="button"
                      key={`${category.id}-${index}`}
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
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="home-empty">
              No categories available yet.
            </div>
          )}
        </section>

        {/* FEATURED PRODUCTS */}

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

          {products.length > 0 ? (
            <div className="home-products-grid">
              {products.map((product) => (
                <article
                  className="home-product-card"
                  key={product.id}
                >
                  <div
                    className="home-product-image-area"
                    onClick={() =>
                      goToProduct(product)
                    }
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
                      {product.category}
                    </span>

                    <div className="home-product-bottom">
                      <span className="home-product-price">
                        $
                        {Number(
                          product.sellingPrice || 0
                        ).toFixed(2)}
                      </span>

                      <button
                        type="button"
                        className="home-add-cart"
                        onClick={() =>
                          addToCart(product)
                        }
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="home-empty">
              No featured products available yet.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Home;
