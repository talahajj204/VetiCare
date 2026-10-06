import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import StoreHeader from "./StoreHeader";

import {
  FaPaw,
  FaBone,
  FaPumpSoap,
  FaCapsules,
  FaDog,
  FaHeart,
  FaBasketShopping,
  FaTooth,
  FaBed,
  FaGift,
} from "react-icons/fa6";


/* =========================================================
   CATEGORIES
========================================================= */

const CATEGORIES = [
  {
    name: "Food",
    icon: <FaBone />,
  },
  {
    name: "Care",
    icon: <FaPaw />,
  },
  {
    name: "Hygiene",
    icon: <FaPumpSoap />,
  },
  {
    name: "Accessories",
    icon: <FaDog />,
  },
  {
    name: "Supplements",
    icon: <FaCapsules />,
  },
  {
    name: "Grooming",
    icon: <FaPumpSoap />,
  },
  {
    name: "Toys",
    icon: <FaGift />,
  },
  {
    name: "Treats",
    icon: <FaBone />,
  },
  {
    name: "Beds",
    icon: <FaBed />,
  },
  {
    name: "Bowls",
    icon: <FaBasketShopping />,
  },
  {
    name: "Dental Care",
    icon: <FaTooth />,
  },
  {
    name: "Pet Essentials",
    icon: <FaPaw />,
  },
];


/* =========================================================
   HOME PRODUCTS
========================================================= */

const HOME_PRODUCTS = [
  {
    id: 1,
    name: "Royal Canin Adult Dog",
    category: "Food",
    price: 28.5,
    stock: 14,
    image: "",
  },
  {
    id: 2,
    name: "Royal Canin Kitten",
    category: "Food",
    price: 24,
    stock: 8,
    image: "",
  },
  {
    id: 3,
    name: "Dental Care Chews",
    category: "Care",
    price: 12.5,
    stock: 21,
    image: "",
  },
  {
    id: 4,
    name: "Pet Shampoo",
    category: "Grooming",
    price: 9.75,
    stock: 12,
    image: "",
  },
];


/* =========================================================
   HOME
========================================================= */

function Home() {
  const navigate = useNavigate();

  const [storeSettings, setStoreSettings] = useState({
    storeName: "",
    storeDescription: "",
    homeBanner: null,
    homeBannerTitle: "",
    homeBannerDescription: "",
    homeBannerButtonText: "",
  });


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
     NAVIGATION
  ========================================================= */

  const goToProducts = () => {
    navigate("/products");
  };

  const goToCategory = (category) => {
    navigate(
      `/products?category=${encodeURIComponent(category)}`
    );
  };


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
          font-family: Arial, Helvetica, sans-serif;
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

        .home-hero.has-image .home-hero-badge {
          background: rgba(255,255,255,0.15);

          color: white;

          border:
            1px solid
            rgba(255,255,255,0.25);

          backdrop-filter: blur(8px);
        }

        .home-hero h1 {
          margin: 0 0 17px;

          max-width: 650px;

          font-size: clamp(
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
          color: rgba(255,255,255,0.90);
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

          transform: translateY(-2px);
        }

        .home-hero.has-image .home-shop-button {
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
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        .home-category-card {
          flex: 0 0 210px;

          height: 128px;

          border:
            1px solid
            #dcebea;

          border-radius: 16px;

          background: white;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          gap: 12px;

          cursor: pointer;

          transition:
            transform 0.2s ease,
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .home-category-card:hover {
          transform: translateY(-4px);

          border-color: #1aa6a6;

          box-shadow:
            0 10px 25px
            rgba(17,121,123,0.10);
        }

        .home-category-icon {
          width: 50px;

          height: 50px;

          border-radius: 50%;

          display: flex;

          align-items: center;

          justify-content: center;

          background: #e8f7f7;

          color: #1aa6a6;

          font-size: 19px;
        }

        .home-category-name {
          color: #34455a;

          font-size: 13px;

          font-weight: 800;
        }


        /* =====================================================
           PRODUCTS
        ===================================================== */

        .home-products-section {
          padding-bottom: 60px;
        }

        .home-products-grid {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 22px;
        }

        .home-product-card {
          overflow: hidden;

          border:
            1px solid
            #dcebea;

          border-radius: 17px;

          background: white;

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .home-product-card:hover {
          transform: translateY(-4px);

          box-shadow:
            0 12px 30px
            rgba(17,121,123,0.10);
        }

        .home-product-image {
          height: 215px;

          position: relative;

          display: flex;

          align-items: center;

          justify-content: center;

          background:
            linear-gradient(
              135deg,
              #f1fbfa,
              #e6f7f6
            );
        }

        .home-product-image img {
          width: 100%;

          height: 100%;

          object-fit: cover;
        }

        .home-product-placeholder {
          color: #75d2ce;

          font-size: 48px;
        }

        .home-favorite {
          width: 38px;

          height: 38px;

          position: absolute;

          top: 13px;

          right: 13px;

          border: none;

          border-radius: 50%;

          display: flex;

          align-items: center;

          justify-content: center;

          background: white;

          color: #b5c0ce;

          box-shadow:
            0 4px 12px
            rgba(0,0,0,0.07);

          cursor: pointer;
        }

        .home-product-info {
          padding: 20px;
        }

        .home-product-info h3 {
          min-height: 38px;

          margin: 0 0 10px;

          color: #34455a;

          font-size: 15px;

          font-weight: 800;
        }

        .home-product-category {
          display: block;

          margin-bottom: 14px;

          color: #91a0b3;

          font-size: 12px;
        }

        .home-product-bottom {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 12px;
        }

        .home-product-price {
          color: #263b4f;

          font-size: 16px;

          font-weight: 900;
        }

        .home-product-stock {
          padding: 5px 9px;

          border-radius: 20px;

          background: #eaf9f3;

          color: #21865d;

          font-size: 10px;

          font-weight: 800;
        }


        /* =====================================================
           VIEW ALL
        ===================================================== */

        .home-view-all-wrapper {
          margin-top: 30px;

          display: flex;

          justify-content: center;
        }

        .home-view-all {
          min-width: 170px;

          height: 44px;

          padding: 0 22px;

          border: none;

          border-radius: 10px;

          background: #1aa6a6;

          color: white;

          font-size: 13px;

          font-weight: 800;

          cursor: pointer;

          transition: 0.2s ease;
        }

        .home-view-all:hover {
          background: #11797b;

          transform: translateY(-2px);

          box-shadow:
            0 8px 18px
            rgba(17,121,123,0.18);
        }


        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 1000px) {
          .home-products-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .home-hero-content {
            width: 75%;
          }
        }

        @media (max-width: 600px) {
          .home-hero {
            width: 92%;

            min-height: 380px;

            padding: 35px 25px;
          }

          .home-hero-content {
            width: 100%;
          }

          .home-hero h1 {
            font-size: 35px;
          }

          .home-products-grid {
            grid-template-columns: 1fr;
          }

          .home-category-card {
            flex-basis: 165px;

            height: 115px;
          }
        }

      `}</style>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        id="store-about"
        className={`home-hero ${
          storeSettings.homeBanner
            ? "has-image"
            : ""
        }`}
        style={
          storeSettings.homeBanner
            ? {
                backgroundImage: `url("${storeSettings.homeBanner}")`,
              }
            : {}
        }
      >
        {storeSettings.homeBanner && (
          <div className="home-hero-overlay" />
        )}

        <div className="home-hero-content">

          {storeSettings.storeName && (
            <div className="home-hero-badge">
              <FaPaw />

              {storeSettings.storeName}
            </div>
          )}

          {storeSettings.homeBannerTitle && (
            <h1>
              {storeSettings.homeBannerTitle}
            </h1>
          )}

          {storeSettings.homeBannerDescription && (
            <p>
              {storeSettings.homeBannerDescription}
            </p>
          )}

          {storeSettings.homeBannerButtonText && (
            <button
              type="button"
              className="home-shop-button"
              onClick={goToProducts}
            >
              {storeSettings.homeBannerButtonText}
            </button>
          )}

        </div>
      </section>


      {/* =====================================================
          HOME CONTENT
      ===================================================== */}

      <main className="home-container">

        {/* ===================================================
            CATEGORIES
        =================================================== */}

        <section className="home-categories-section">

          <div className="home-section-header">
            <h2>Shop by Category</h2>

            <p>
              Find the right products for your pet.
            </p>
          </div>

          <div className="home-categories-window">

            <div className="home-categories-track">

              {[...CATEGORIES, ...CATEGORIES].map(
                (item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="home-category-card"
                    onClick={() =>
                      goToCategory(item.name)
                    }
                  >
                    <div className="home-category-icon">
                      {item.icon}
                    </div>

                    <span className="home-category-name">
                      {item.name}
                    </span>
                  </div>
                )
              )}

            </div>

          </div>

        </section>


        {/* ===================================================
            PRODUCTS
        =================================================== */}

        <section className="home-products-section">

          <div className="home-section-header">
            <h2>Our Products</h2>

            <p>
              Discover some of our pet care products.
            </p>
          </div>

          <div className="home-products-grid">

            {HOME_PRODUCTS.map((product) => (
              <div
                className="home-product-card"
                key={product.id}
              >

                <div className="home-product-image">

                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                    />
                  ) : (
                    <FaPaw className="home-product-placeholder" />
                  )}

                  <button
                    type="button"
                    className="home-favorite"
                    aria-label={`Favorite ${product.name}`}
                  >
                    <FaHeart />
                  </button>

                </div>

                <div className="home-product-info">

                  <h3>
                    {product.name}
                  </h3>

                  <span className="home-product-category">
                    {product.category}
                  </span>

                  <div className="home-product-bottom">

                    <span className="home-product-price">
                      ${product.price.toFixed(2)}
                    </span>

                    <span className="home-product-stock">
                      {product.stock} in stock
                    </span>

                  </div>

                </div>

              </div>
            ))}

          </div>


          <div className="home-view-all-wrapper">

            <button
              type="button"
              className="home-view-all"
              onClick={goToProducts}
            >
              View All Products →
            </button>

          </div>

        </section>


        {/* CONTACT TARGET FOR HEADER */}

        <div id="store-contact-anchor" />

      </main>

    </div>
  );
}

export default Home;