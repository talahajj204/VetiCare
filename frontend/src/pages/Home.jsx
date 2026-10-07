import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import StoreHeader from "./StoreHeader";

import { FaPaw } from "react-icons/fa6";

/* =========================================================
   HOME
========================================================= */

function Home() {
  const navigate = useNavigate();

  /* =========================================================
     STORE SETTINGS
  ========================================================= */

  const [storeSettings, setStoreSettings] = useState({
    storeName: "",
    storeDescription: "",
    homeBanner: null,
    homeBannerTitle: "",
    homeBannerDescription: "",
    homeBannerButtonText: "",
  });

  /* =========================================================
     DYNAMIC CATEGORIES
  ========================================================= */

  const [categories, setCategories] = useState([]);

  /* =========================================================
     DYNAMIC PRODUCTS
  ========================================================= */

  const [products, setProducts] = useState([]);

  /* =========================================================
     LOAD SETTINGS
  ========================================================= */

  useEffect(() => {
    const loadSettings = () => {
      try {
        const saved = localStorage.getItem("storeSettings");

        if (!saved) return;

        const settings = JSON.parse(saved);

        setStoreSettings({
          storeName: settings.storeName || "",
          storeDescription: settings.storeDescription || "",
          homeBanner: settings.homeBanner || null,
          homeBannerTitle: settings.homeBannerTitle || "",
          homeBannerDescription:
            settings.homeBannerDescription || "",
          homeBannerButtonText:
            settings.homeBannerButtonText || "",
        });
      } catch (error) {
        console.error(
          "Could not load store settings:",
          error
        );
      }
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

  /* =========================================================
     LOAD CATEGORIES FROM CATEGORIES.JSX
  ========================================================= */

  useEffect(() => {
    const sortCategories = (list) => {
      return [...list].sort((a, b) => {
        const orderA = Number(a.sortOrder) || 0;
        const orderB = Number(b.sortOrder) || 0;

        if (orderA !== orderB) {
          return orderA - orderB;
        }

        return (a.title || "").localeCompare(
          b.title || ""
        );
      });
    };

    const loadCategories = () => {
      try {
        const saved = localStorage.getItem(
          "vetClinicCategories"
        );

        if (!saved) {
          setCategories([]);
          return;
        }

        const parsed = JSON.parse(saved);

        if (!Array.isArray(parsed)) {
          setCategories([]);
          return;
        }

        setCategories(sortCategories(parsed));
      } catch (error) {
        console.error(
          "Could not load store categories:",
          error
        );

        setCategories([]);
      }
    };

    const handleCategoriesUpdated = (event) => {
      if (Array.isArray(event.detail)) {
        setCategories(
          sortCategories(event.detail)
        );

        return;
      }

      loadCategories();
    };

    loadCategories();

    window.addEventListener(
      "vetClinicCategoriesUpdated",
      handleCategoriesUpdated
    );

    window.addEventListener(
      "storage",
      loadCategories
    );

    return () => {
      window.removeEventListener(
        "vetClinicCategoriesUpdated",
        handleCategoriesUpdated
      );

      window.removeEventListener(
        "storage",
        loadCategories
      );
    };
  }, []);

  /* =========================================================
     LOAD PRODUCTS FROM INVENTORY.JSX
  ========================================================= */

  useEffect(() => {
    const prepareProducts = (list) => {
      if (!Array.isArray(list)) {
        return [];
      }

      /*
        Only products enabled for the public Store.

        Featured products appear first.

        If fewer than 4 products are marked Featured,
        the remaining Store products fill the empty spaces.
      */

      const storeProducts = list.filter(
        (product) => product.showOnStore === true
      );

      const featuredProducts = storeProducts.filter(
        (product) => product.featured === true
      );

      const otherProducts = storeProducts.filter(
        (product) => product.featured !== true
      );

      return [
        ...featuredProducts,
        ...otherProducts,
      ].slice(0, 4);
    };

    const loadProducts = () => {
      try {
        const saved = localStorage.getItem(
          "vetClinicProducts"
        );

        if (!saved) {
          setProducts([]);
          return;
        }

        const parsed = JSON.parse(saved);

        setProducts(
          prepareProducts(parsed)
        );
      } catch (error) {
        console.error(
          "Could not load store products:",
          error
        );

        setProducts([]);
      }
    };

    const handleProductsUpdated = (event) => {
      if (Array.isArray(event.detail)) {
        setProducts(
          prepareProducts(event.detail)
        );

        return;
      }

      loadProducts();
    };

    loadProducts();

    window.addEventListener(
      "vetClinicProductsUpdated",
      handleProductsUpdated
    );

    window.addEventListener(
      "storage",
      loadProducts
    );

    return () => {
      window.removeEventListener(
        "vetClinicProductsUpdated",
        handleProductsUpdated
      );

      window.removeEventListener(
        "storage",
        loadProducts
      );
    };
  }, []);

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const goToProducts = () => {
    navigate("/products");
  };

  const goToCategory = (category) => {
    navigate(
      `/products?category=${encodeURIComponent(
        category
      )}`
    );
  };

  const goToProduct = (product) => {
    navigate(`/products/${product.id}`);
  };

  /* =========================================================
     PRICE
  ========================================================= */

  const formatPrice = (price) => {
    const number = Number(price);

    if (Number.isNaN(number)) {
      return "$0.00";
    }

    return `$${number.toFixed(2)}`;
  };

  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <div className="home-page">

      {/* =====================================================
          STORE HEADER
      ===================================================== */}

      <StoreHeader />

      <style>{`
        * {
          box-sizing: border-box;
        }

        .home-page {
          width: 100%;
          min-height: 100vh;

          background: #f8fbfa;
          color: #263b4f;

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          overflow: hidden;
        }

        /* =====================================================
           HERO
        ===================================================== */

        .home-hero {
          width: calc(100% - 8%);
          max-width: 1450px;

          min-height: 410px;

          margin: 28px auto 45px;

          padding: 55px 60px;

          border-radius: 24px;

          display: flex;
          align-items: center;

          position: relative;

          overflow: hidden;

          background:
            linear-gradient(
              120deg,
              #f7fcfb 0%,
              #eef9f8 50%,
              #e4f6f4 100%
            );

          border: 1px solid #d7ebe9;
        }

        .home-hero.has-image {
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;

          border: none;

          box-shadow:
            0 18px 45px
            rgba(17, 121, 123, 0.12);
        }

        .home-hero-overlay {
          position: absolute;

          inset: 0;

          background:
            linear-gradient(
              90deg,
              rgba(8, 50, 52, 0.82) 0%,
              rgba(8, 50, 52, 0.68) 38%,
              rgba(8, 50, 52, 0.30) 70%,
              rgba(8, 50, 52, 0.08) 100%
            );

          z-index: 1;
        }

        .home-hero-content {
          width: 60%;
          max-width: 680px;

          position: relative;

          z-index: 2;
        }

        .home-hero-badge {
          width: fit-content;

          padding: 8px 13px;

          margin-bottom: 18px;

          display: flex;
          align-items: center;

          gap: 7px;

          border-radius: 50px;

          background: #e8f7f7;

          color: #11797b;

          font-size: 12px;
          font-weight: 800;
        }

        .home-hero.has-image
        .home-hero-badge {
          background:
            rgba(255, 255, 255, 0.15);

          color: white;

          border:
            1px solid
            rgba(255, 255, 255, 0.25);

          backdrop-filter: blur(8px);
        }

        .home-hero h1 {
          margin: 0 0 17px;

          max-width: 650px;

          font-size:
            clamp(
              34px,
              4vw,
              58px
            );

          line-height: 1.04;

          letter-spacing: -1.8px;

          color: #263b4f;
        }

        .home-hero p {
          max-width: 600px;

          margin: 0 0 25px;

          color: #728197;

          font-size: 15px;

          line-height: 1.7;
        }

        .home-hero.has-image h1 {
          color: white;
        }

        .home-hero.has-image p {
          color:
            rgba(
              255,
              255,
              255,
              0.90
            );
        }

        .home-shop-button {
          width: fit-content;

          min-width: 0;

          height: 34px;

          padding: 0 15px;

          border: none;

          border-radius: 8px;

          background: #1aa6a6;

          color: white;

          font-size: 12px;

          font-weight: 800;

          cursor: pointer;

          transition: 0.2s ease;
        }

        .home-shop-button:hover {
          background: #11797b;

          transform:
            translateY(-2px);
        }

        .home-hero.has-image
        .home-shop-button {
          background: white;

          color: #11797b;
        }

        /* =====================================================
           MAIN CONTENT
        ===================================================== */

        .home-container {
          width: 92%;

          max-width: 1450px;

          margin: 0 auto;
        }

        /* =====================================================
           SECTION HEADER
        ===================================================== */

        .home-section-header {
          margin-bottom: 20px;
        }

        .home-section-header h2 {
          margin: 0 0 6px;

          color: #263b4f;

          font-size: 27px;

          font-weight: 800;

          letter-spacing: -0.6px;
        }

        .home-section-header p {
          margin: 0;

          color: #8290a3;

          font-size: 13px;
        }

        /* =====================================================
           CATEGORIES
        ===================================================== */

        .home-categories-section {
          margin-bottom: 50px;

          overflow: hidden;
        }

        .home-categories-window {
          width: 100%;

          overflow: hidden;

          padding: 2px 0 8px;
        }

        .home-categories-track {
          width: max-content;

          display: flex;

          gap: 16px;

          animation:
            categoryScroll
            28s
            linear
            infinite;
        }

        .home-categories-track:hover {
          animation-play-state: paused;
        }

        @keyframes categoryScroll {
          from {
            transform:
              translateX(0);
          }

          to {
            transform:
              translateX(-50%);
          }
        }
        .home-category-card {
          width: 150px;
          min-width: 150px;
          min-height: 150px;
        
          padding: 0;
        
          border: 1px solid #dfeceb;
          border-radius: 17px;
        
          background: white;
        
          display: flex;
          flex-direction: column;
        
          align-items: center;
          justify-content: flex-start;
        
          gap: 0;
        
          text-align: center;
        
          cursor: pointer;
        
          transition: 0.25s ease;
        
          overflow: hidden;
        
          box-shadow:
            0 7px 20px
            rgba(38, 59, 79, 0.04);
        }

        .home-category-card:hover {
          transform:
            translateY(-5px);

          border-color: #9dd9d5;

          box-shadow:
            0 13px 27px
            rgba(
              17,
              121,
              123,
              0.11
            );
        }

        /* =====================================================
           DYNAMIC CATEGORY IMAGE
        ===================================================== */
        .home-category-image-wrapper {
          width: 100%;
          height: 105px;
        
          border-radius: 0;
        
          overflow: hidden;
        
          display: flex;
          align-items: center;
          justify-content: center;
        
          background: #eef9f8;
        
          border: none;
        }

        .home-category-image {
          width: 100%;
          height: 100%;

          object-fit: cover;

          display: block;
        }

        .home-category-no-image {
          width: 100%;
          height: 100%;

          display: flex;
          align-items: center;
          justify-content: center;

          color: #55b8b4;

          font-size: 29px;
        }

        .home-category-name {
          width: 100%;
        
          padding: 12px 8px;
        
          color: #34495e;
        
          font-size: 13px;
          font-weight: 800;
          line-height: 1.3;
        }

        /* =====================================================
           EMPTY CATEGORIES
        ===================================================== */

        .home-categories-empty {
          width: 100%;

          padding: 30px;

          border:
            1px dashed
            #cfe1df;

          border-radius: 15px;

          background: white;

          color: #8290a3;

          font-size: 13px;

          text-align: center;
        }

        /* =====================================================
           PRODUCTS
        ===================================================== */

        .home-products-section {
          margin-bottom: 55px;
        }

        .home-products-header {
          display: flex;

          align-items: flex-end;
          justify-content: space-between;

          gap: 20px;

          margin-bottom: 20px;
        }

        .home-view-all-button {
          width: fit-content;

          min-width: 0;

          padding: 0;

          border: none;

          background: transparent;

          color: #159f9f;

          font-size: 13px;

          font-weight: 800;

          cursor: pointer;
        }

        .home-view-all-button:hover {
          color: #11797b;
        }

        .home-products-grid {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 18px;
        }

        .home-product-card {
          overflow: hidden;

          border:
            1px solid
            #e0eceb;

          border-radius: 17px;

          background: white;

          transition: 0.25s ease;

          cursor: pointer;

          box-shadow:
            0 7px 22px
            rgba(
              38,
              59,
              79,
              0.04
            );
        }

        .home-product-card:hover {
          transform:
            translateY(-4px);

          box-shadow:
            0 14px 30px
            rgba(
              38,
              59,
              79,
              0.09
            );
        }

        .home-product-image-area {
          width: 100%;

          height: 190px;

          display: flex;
          align-items: center;
          justify-content: center;

          overflow: hidden;

          background:
            linear-gradient(
              145deg,
              #f5fbfa,
              #eaf7f6
            );
        }

        .home-product-image {
          width: 100%;
          height: 100%;

          object-fit: cover;

          display: block;
        }

        .home-product-placeholder {
          color: #7bc9c5;

          font-size: 47px;
        }

        .home-product-content {
          padding: 16px;
        }

        .home-product-category {
          margin-bottom: 6px;

          color: #159f9f;

          font-size: 11px;

          font-weight: 800;

          text-transform: uppercase;

          letter-spacing: 0.5px;
        }

        .home-product-name {
          margin: 0 0 11px;

          color: #263b4f;

          font-size: 15px;

          font-weight: 800;

          line-height: 1.35;
        }

        .home-product-bottom {
          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 10px;
        }

        .home-product-price {
          color: #263b4f;

          font-size: 16px;

          font-weight: 800;
        }

        .home-product-stock {
          color: #8290a3;

          font-size: 11px;
        }

        /* =====================================================
           EMPTY PRODUCTS
        ===================================================== */

        .home-products-empty {
          grid-column: 1 / -1;

          width: 100%;

          padding: 45px 25px;

          border:
            1px dashed
            #cfe1df;

          border-radius: 17px;

          background: white;

          color: #8290a3;

          text-align: center;

          font-size: 13px;
        }

        .home-products-empty-icon {
          display: flex;
          align-items: center;
          justify-content: center;

          margin-bottom: 12px;

          color: #7bc9c5;

          font-size: 36px;
        }

        .home-products-empty strong {
          display: block;

          margin-bottom: 5px;

          color: #34495e;

          font-size: 15px;
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 1050px) {
          .home-products-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .home-hero-content {
            width: 75%;
          }
        }

        @media (max-width: 700px) {
          .home-hero {
            width:
              calc(100% - 28px);

            min-height: 370px;

            margin-top: 18px;

            padding: 38px 25px;
          }

          .home-hero-content {
            width: 100%;
          }

          .home-products-grid {
            grid-template-columns: 1fr;
          }

          .home-products-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .home-category-card {
            width: 135px;
            min-width: 135px;

            min-height: 140px;
          }

          .home-category-image-wrapper {
            width: 72px;
            height: 72px;
          }
        }
      `}</style>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className={`home-hero ${
          storeSettings.homeBanner
            ? "has-image"
            : ""
        }`}
        style={
          storeSettings.homeBanner
            ? {
                backgroundImage:
                  `url(${storeSettings.homeBanner})`,
              }
            : undefined
        }
      >
        {storeSettings.homeBanner && (
          <div className="home-hero-overlay" />
        )}

        <div className="home-hero-content">
          <div className="home-hero-badge">
            <FaPaw />
            Everything your pet needs
          </div>

          <h1>
            {storeSettings.homeBannerTitle ||
              "Healthy pets. Happy homes."}
          </h1>

          <p>
            {storeSettings.homeBannerDescription ||
              storeSettings.storeDescription ||
              "Discover carefully selected food, care products, accessories, and everyday essentials for your pets."}
          </p>

          <button
            type="button"
            className="home-shop-button"
            onClick={goToProducts}
          >
            {storeSettings.homeBannerButtonText ||
              "Shop Now"}
          </button>
        </div>
      </section>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="home-container">

        {/* =====================================================
            SHOP BY CATEGORY
        ===================================================== */}

        <section className="home-categories-section">
          <div className="home-section-header">
            <h2>Shop by Category</h2>

            <p>
              Find exactly what your pet needs.
            </p>
          </div>

          {categories.length > 0 ? (
            <div className="home-categories-window">
              <div className="home-categories-track">

                {/* FIRST SET */}

                {categories.map((category) => (
                  <button
                    type="button"
                    className="home-category-card"
                    key={`category-first-${category.id}`}
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

                {/* SECOND SET FOR AUTO SCROLL */}

                {categories.map((category) => (
                  <button
                    type="button"
                    className="home-category-card"
                    key={`category-second-${category.id}`}
                    onClick={() =>
                      goToCategory(category.title)
                    }
                    aria-hidden="true"
                    tabIndex={-1}
                  >
                    <div className="home-category-image-wrapper">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt=""
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
          ) : (
            <div className="home-categories-empty">
              No categories are available yet.
            </div>
          )}
        </section>

        {/* =====================================================
            DYNAMIC FEATURED PRODUCTS
        ===================================================== */}

        <section className="home-products-section">
          <div className="home-products-header">
            <div className="home-section-header">
              <h2>Featured Products</h2>

              <p>
                Popular products selected for your pets.
              </p>
            </div>

            <button
              type="button"
              className="home-view-all-button"
              onClick={goToProducts}
            >
              View All →
            </button>
          </div>

          <div className="home-products-grid">
            {products.length > 0 ? (
              products.map((product) => (
                <article
                  className="home-product-card"
                  key={product.id}
                  onClick={() =>
                    goToProduct(product)
                  }
                >
                  <div className="home-product-image-area">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="home-product-image"
                      />
                    ) : (
                      <FaPaw className="home-product-placeholder" />
                    )}
                  </div>

                  <div className="home-product-content">
                    <div className="home-product-category">
                      {product.category ||
                        "Uncategorized"}
                    </div>

                    <h3 className="home-product-name">
                      {product.name}
                    </h3>

                    <div className="home-product-bottom">
                      <span className="home-product-price">
                        {formatPrice(
                          product.sellingPrice
                        )}
                      </span>

                      <span className="home-product-stock">
                        {Number(product.quantity) > 0
                          ? `${product.quantity} in stock`
                          : "Out of stock"}
                      </span>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="home-products-empty">
                <div className="home-products-empty-icon">
                  <FaPaw />
                </div>

                <strong>
                  No store products yet
                </strong>

                Products enabled with "Show on Store"
                from Admin will appear here.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;