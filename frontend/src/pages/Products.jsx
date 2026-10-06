import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import StoreHeader from "./StoreHeader";

import {
  FaSearch,
  FaHeart,
  FaPaw,
  FaPlus,
  FaTimes,
  FaBoxOpen,
} from "react-icons/fa";


/* =========================================================
   PRODUCTS
========================================================= */

const PRODUCTS = [
  {
    id: 1,
    name: "Royal Canin Adult Dog",
    category: "Food",
    price: 28.5,
    stock: 14,
    image: "",
    showOnStore: true,
  },
  {
    id: 2,
    name: "Royal Canin Kitten",
    category: "Food",
    price: 24,
    stock: 8,
    image: "",
    showOnStore: true,
  },
  {
    id: 3,
    name: "Dental Care Chews",
    category: "Care",
    price: 12.5,
    stock: 21,
    image: "",
    showOnStore: true,
  },
  {
    id: 4,
    name: "Pet Shampoo",
    category: "Grooming",
    price: 9.75,
    stock: 12,
    image: "",
    showOnStore: true,
  },
  {
    id: 5,
    name: "Flea & Tick Collar",
    category: "Accessories",
    price: 18,
    stock: 7,
    image: "",
    showOnStore: true,
  },
  {
    id: 6,
    name: "Vitamin Supplement",
    category: "Supplements",
    price: 16.25,
    stock: 5,
    image: "",
    showOnStore: true,
  },
  {
    id: 7,
    name: "Cat Litter",
    category: "Hygiene",
    price: 11,
    stock: 18,
    image: "",
    showOnStore: true,
  },
  {
    id: 8,
    name: "Ear Cleaning Solution",
    category: "Care",
    price: 8.5,
    stock: 9,
    image: "",
    showOnStore: true,
  },
  {
    id: 9,
    name: "Pet Travel Bowl",
    category: "Accessories",
    price: 7.25,
    stock: 3,
    image: "",
    showOnStore: true,
  },
  {
    id: 10,
    name: "Puppy Training Pads",
    category: "Hygiene",
    price: 14,
    stock: 22,
    image: "",
    showOnStore: true,
  },
  {
    id: 11,
    name: "Dog Toy Ball",
    category: "Accessories",
    price: 6.5,
    stock: 15,
    image: "",
    showOnStore: true,
  },
  {
    id: 12,
    name: "Eye Drops",
    category: "Care",
    price: 10,
    stock: 11,
    image: "",
    showOnStore: true,
  },
];


/* =========================================================
   CATEGORIES
========================================================= */

const CATEGORIES = [
  "Food",
  "Care",
  "Hygiene",
  "Accessories",
  "Supplements",
  "Grooming",
  "Toys",
  "Treats",
  "Beds",
  "Bowls",
  "Dental Care",
  "Pet Essentials",
];


/* =========================================================
   PRODUCTS PAGE
========================================================= */

function Products() {
  const [searchParams] = useSearchParams();

  const categoryFromUrl =
    searchParams.get("category");

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState(
    categoryFromUrl || "All categories"
  );

  const [favorites, setFavorites] = useState([]);

  const [cart, setCart] = useState(() => {
    try {
      const savedCart =
        localStorage.getItem("vetClinicStoreCart");

      return savedCart
        ? JSON.parse(savedCart)
        : [];
    } catch {
      return [];
    }
  });


  /* =========================================================
     CATEGORY FROM URL
  ========================================================= */

  useEffect(() => {
    setCategory(
      categoryFromUrl || "All categories"
    );
  }, [categoryFromUrl]);


  /* =========================================================
     SAVE CART
  ========================================================= */

  useEffect(() => {
    localStorage.setItem(
      "vetClinicStoreCart",
      JSON.stringify(cart)
    );

    window.dispatchEvent(
      new Event("cartUpdated")
    );
  }, [cart]);


  /* =========================================================
     FILTER PRODUCTS
  ========================================================= */

  const products = useMemo(() => {
    return PRODUCTS.filter(
      (product) => product.showOnStore
    );
  }, []);


  const filteredProducts = useMemo(() => {
    const searchValue =
      search.toLowerCase().trim();

    return products.filter((product) => {
      const matchesSearch =
        !searchValue ||
        product.name
          .toLowerCase()
          .includes(searchValue) ||
        product.category
          .toLowerCase()
          .includes(searchValue);

      const matchesCategory =
        category === "All categories" ||
        product.category === category;

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [products, search, category]);


  /* =========================================================
     FAVORITES
  ========================================================= */

  const toggleFavorite = (productId) => {
    setFavorites((current) =>
      current.includes(productId)
        ? current.filter(
            (id) => id !== productId
          )
        : [...current, productId]
    );
  };


  /* =========================================================
     ADD TO CART
  ========================================================= */

  const addToCart = (product) => {
    if (product.stock <= 0) return;

    setCart((currentCart) => {
      const existingItem =
        currentCart.find(
          (item) =>
            item.id === product.id
        );

      if (existingItem) {
        if (
          existingItem.quantity >=
          product.stock
        ) {
          return currentCart;
        }

        return currentCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity:
                  item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  };


  return (
    <div className="products-page">

      <StoreHeader />

      <style>{`

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        button,
        input,
        select {
          font: inherit;
        }

        .products-page {
          --teal: #1aa6a6;
          --teal-dark: #11797b;
          --teal-light: #e8f7f7;
          --teal-soft: #f1fbfa;
          --text: #263b4f;
          --muted: #728197;
          --border: #dcebea;

          min-height: 100vh;

          background: #f8fbfa;

          color: var(--text);

          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }


        /* ==========================================
           PAGE HEADER
        ========================================== */

        .products-container {
          width: min(1400px, 92%);

          margin: 0 auto;

          padding:
            55px 0
            75px;
        }

        .products-heading {
          margin-bottom: 32px;
        }

        .products-heading-badge {
          display: inline-flex;

          align-items: center;

          gap: 7px;

          margin-bottom: 12px;

          padding: 7px 12px;

          border-radius: 30px;

          background:
            var(--teal-light);

          color:
            var(--teal-dark);

          font-size: 11px;

          font-weight: 800;
        }

        .products-heading h1 {
          margin:
            0 0 10px;

          color:
            var(--text);

          font-size:
            clamp(
              32px,
              4vw,
              48px
            );

          line-height: 1.05;

          letter-spacing:
            -1.5px;
        }

        .products-heading p {
          margin: 0;

          color:
            var(--muted);

          font-size: 14px;

          line-height: 1.7;
        }


        /* ==========================================
           TOOLBAR
        ========================================== */

        .products-toolbar {
          margin-bottom: 28px;

          padding: 18px;

          display: grid;

          grid-template-columns:
            1fr 230px;

          gap: 14px;

          border:
            1px solid
            var(--border);

          border-radius: 16px;

          background: white;

          box-shadow:
            0 8px 25px
            rgba(
              17,
              121,
              123,
              0.05
            );
        }


        /* SEARCH */

        .products-search {
          height: 48px;

          padding:
            0 15px;

          display: flex;

          align-items: center;

          gap: 10px;

          border:
            1px solid
            #dce7e6;

          border-radius: 11px;

          background: white;

          color: #98a2b3;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .products-search:focus-within {
          border-color:
            rgba(
              26,
              166,
              166,
              0.65
            );

          box-shadow:
            0 0 0 3px
            rgba(
              26,
              166,
              166,
              0.08
            );
        }

        .products-search > svg {
          flex-shrink: 0;

          color:
            var(--teal);

          font-size: 14px;
        }

        .products-search input {
          width: 100%;

          height: 100%;

          padding: 0;

          border: none;

          outline: none;

          background:
            transparent;

          color:
            var(--text);

          font-size: 13px;
        }

        .products-search input::placeholder {
          color: #a3adba;
        }

        .products-search-clear {
          width: 30px;

          height: 30px;

          padding: 0;

          flex-shrink: 0;

          border: none;

          border-radius: 50%;

          background:
            #f3f6f6;

          color: #8995a5;

          display: flex;

          align-items: center;

          justify-content: center;

          cursor: pointer;
        }

        .products-search-clear:hover {
          background:
            var(--teal-light);

          color:
            var(--teal-dark);
        }


        /* CATEGORY SELECT */

        .products-category-select {
          height: 48px;

          padding:
            0 14px;

          border:
            1px solid
            #dce7e6;

          border-radius: 11px;

          outline: none;

          background: white;

          color:
            var(--text);

          font-size: 12px;

          font-weight: 700;

          cursor: pointer;
        }

        .products-category-select:focus {
          border-color:
            var(--teal);

          box-shadow:
            0 0 0 3px
            rgba(
              26,
              166,
              166,
              0.08
            );
        }


        /* ==========================================
           RESULTS
        ========================================== */

        .products-results-row {
          margin-bottom: 18px;

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 15px;
        }

        .products-results-count {
          color:
            #8290a3;

          font-size: 12px;
        }

        .products-results-count strong {
          color:
            var(--text);
        }

        .products-active-category {
          padding:
            7px 11px;

          border-radius: 30px;

          background:
            var(--teal-light);

          color:
            var(--teal-dark);

          font-size: 10px;

          font-weight: 800;
        }


        /* ==========================================
           PRODUCT GRID
        ========================================== */

        .products-grid {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 22px;
        }

        .product-card {
          position: relative;

          overflow: hidden;

          border:
            1px solid
            var(--border);

          border-radius: 17px;

          background: white;

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease;
        }

        .product-card:hover {
          transform:
            translateY(-4px);

          border-color:
            rgba(
              26,
              166,
              166,
              0.35
            );

          box-shadow:
            0 14px 32px
            rgba(
              17,
              121,
              123,
              0.10
            );
        }


        /* IMAGE */

        .product-image {
          height: 220px;

          position: relative;

          display: flex;

          align-items: center;

          justify-content: center;

          overflow: hidden;

          background:
            linear-gradient(
              135deg,
              #f1fbfa,
              #e6f7f6
            );
        }

        .product-image img {
          width: 100%;

          height: 100%;

          object-fit: cover;
        }

        .product-image-placeholder {
          color: #75d2ce;

          font-size: 55px;
        }


        /* FAVORITE */

        .product-favorite {
          width: 38px;

          height: 38px;

          position: absolute;

          top: 13px;

          right: 13px;

          z-index: 3;

          padding: 0;

          border: none;

          border-radius: 50%;

          background: white;

          color: #b5c0ce;

          display: flex;

          align-items: center;

          justify-content: center;

          box-shadow:
            0 4px 12px
            rgba(
              0,
              0,
              0,
              0.07
            );

          cursor: pointer;

          transition:
            transform 0.2s ease,
            color 0.2s ease;
        }

        .product-favorite:hover {
          transform:
            scale(1.06);

          color: #e4576b;
        }

        .product-favorite.active {
          color: #e4576b;
        }


        /* INFO */

        .product-info {
          padding: 20px;
        }

        .product-name {
          min-height: 38px;

          margin:
            0 0 8px;

          color:
            #34455a;

          font-size: 15px;

          font-weight: 800;

          line-height: 1.35;
        }

        .product-category {
          margin-bottom: 15px;

          color:
            #91a0b3;

          font-size: 11px;
        }

        .product-meta {
          margin-bottom: 17px;

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 10px;
        }

        .product-price {
          color:
            var(--text);

          font-size: 17px;

          font-weight: 900;
        }

        .product-stock {
          padding:
            5px 9px;

          border-radius: 20px;

          background:
            #eaf9f3;

          color:
            #21865d;

          font-size: 9px;

          font-weight: 800;
        }

        .product-stock.low {
          background:
            #fff6e5;

          color:
            #b7791f;
        }

        .product-stock.out {
          background:
            #fff0f0;

          color:
            #d92d20;
        }


        /* ADD TO CART */

        .product-add-cart {
          width: 100%;

          height: 42px;

          border: none;

          border-radius: 10px;

          background:
            var(--teal);

          color: white;

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 8px;

          font-size: 11px;

          font-weight: 800;

          cursor: pointer;

          transition:
            background 0.2s ease,
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .product-add-cart:hover:not(:disabled) {
          background:
            var(--teal-dark);

          transform:
            translateY(-1px);

          box-shadow:
            0 7px 16px
            rgba(
              17,
              121,
              123,
              0.17
            );
        }

        .product-add-cart:disabled {
          background: #d5dddd;

          color: #8b9898;

          cursor:
            not-allowed;
        }


        /* ==========================================
           EMPTY
        ========================================== */

        .products-empty {
          grid-column: 1 / -1;

          min-height: 300px;

          padding: 50px 20px;

          border:
            1px dashed
            #cfdfde;

          border-radius: 18px;

          background: white;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          text-align: center;
        }

        .products-empty > svg {
          margin-bottom: 15px;

          color:
            #8ed8d4;

          font-size: 48px;
        }

        .products-empty h3 {
          margin:
            0 0 7px;

          color:
            var(--text);

          font-size: 18px;
        }

        .products-empty p {
          margin: 0;

          color:
            var(--muted);

          font-size: 12px;
        }


        /* ==========================================
           RESPONSIVE
        ========================================== */

        @media (max-width: 1100px) {

          .products-grid {
            grid-template-columns:
              repeat(3, 1fr);
          }

        }


        @media (max-width: 850px) {

          .products-toolbar {
            grid-template-columns:
              1fr;
          }

          .products-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

        }


        @media (max-width: 560px) {

          .products-container {
            width: 92%;

            padding-top: 35px;
          }

          .products-heading h1 {
            font-size: 32px;
          }

          .products-grid {
            grid-template-columns:
              1fr;
          }

          .products-results-row {
            align-items:
              flex-start;

            flex-direction:
              column;
          }

        }

      `}</style>


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <main className="products-container">

        <div className="products-heading">

          <div className="products-heading-badge">
            <FaPaw />
            Pet Store
          </div>

          <h1>All Products</h1>

          <p>
            Browse our complete collection of
            pet care products.
          </p>

        </div>


        {/* ===================================================
            SEARCH + FILTER
        =================================================== */}

        <div className="products-toolbar">

          <div className="products-search">

            <FaSearch />

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

            {search && (
              <button
                type="button"
                className="products-search-clear"
                onClick={() =>
                  setSearch("")
                }
                aria-label="Clear search"
              >
                <FaTimes />
              </button>
            )}

          </div>


          <select
            className="products-category-select"
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value
              )
            }
          >

            <option value="All categories">
              All categories
            </option>

            {CATEGORIES.map(
              (categoryName) => (
                <option
                  key={categoryName}
                  value={categoryName}
                >
                  {categoryName}
                </option>
              )
            )}

          </select>

        </div>


        {/* ===================================================
            RESULTS INFO
        =================================================== */}

        <div className="products-results-row">

          <div className="products-results-count">
            Showing{" "}
            <strong>
              {filteredProducts.length}
            </strong>{" "}
            product
            {filteredProducts.length !== 1
              ? "s"
              : ""}
          </div>

          {category !== "All categories" && (
            <div className="products-active-category">
              {category}
            </div>
          )}

        </div>


        {/* ===================================================
            PRODUCTS
        =================================================== */}

        <div className="products-grid">

          {filteredProducts.length === 0 ? (

            <div className="products-empty">

              <FaBoxOpen />

              <h3>No products found</h3>

              <p>
                Try another search or category.
              </p>

            </div>

          ) : (

            filteredProducts.map(
              (product) => {

                const isFavorite =
                  favorites.includes(
                    product.id
                  );

                return (
                  <article
                    className="product-card"
                    key={product.id}
                  >

                    <button
                      type="button"
                      className={`product-favorite ${
                        isFavorite
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        toggleFavorite(
                          product.id
                        )
                      }
                      aria-label={`Favorite ${product.name}`}
                    >
                      <FaHeart />
                    </button>


                    <div className="product-image">

                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                        />
                      ) : (
                        <FaPaw className="product-image-placeholder" />
                      )}

                    </div>


                    <div className="product-info">

                      <h3 className="product-name">
                        {product.name}
                      </h3>

                      <div className="product-category">
                        {product.category}
                      </div>


                      <div className="product-meta">

                        <span className="product-price">
                          $
                          {product.price.toFixed(
                            2
                          )}
                        </span>

                        <span
                          className={`product-stock ${
                            product.stock === 0
                              ? "out"
                              : product.stock <= 5
                              ? "low"
                              : ""
                          }`}
                        >
                          {product.stock === 0
                            ? "Out of stock"
                            : `${product.stock} in stock`}
                        </span>

                      </div>


                      <button
                        type="button"
                        className="product-add-cart"
                        disabled={
                          product.stock <= 0
                        }
                        onClick={() =>
                          addToCart(product)
                        }
                      >
                        <FaPlus />

                        {product.stock > 0
                          ? "Add to Cart"
                          : "Out of Stock"}
                      </button>

                    </div>

                  </article>
                );
              }
            )

          )}

        </div>

      </main>

    </div>
  );
}

export default Products;