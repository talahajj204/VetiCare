import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import StoreHeader from "./StoreHeader";

import {
  FaSearch,
  FaHeart,
  FaPaw,
  FaTimes,
  FaBoxOpen,
  FaCartPlus,
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
};

const readStoreColors = () => {
  try {
    const settings = JSON.parse(
      localStorage.getItem("storeSettings") || "{}"
    );

    return {
      ...DEFAULT_COLORS,
      ...(settings.storeColors || {}),
    };
  } catch {
    return { ...DEFAULT_COLORS };
  }
};

function Products() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get("category");

  const [colors, setColors] = useState(readStoreColors);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");

  const [category, setCategory] = useState(
    categoryFromUrl || "All categories"
  );

  const [favorites, setFavorites] = useState([]);

  const [cart, setCart] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("vetClinicStoreCart") || "[]"
      );

      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // LIVE STORE COLORS

  useEffect(() => {
    const refreshColors = () => setColors(readStoreColors());

    window.addEventListener("storeSettingsUpdated", refreshColors);
    window.addEventListener("storage", refreshColors);

    return () => {
      window.removeEventListener("storeSettingsUpdated", refreshColors);
      window.removeEventListener("storage", refreshColors);
    };
  }, []);

  // PRODUCTS FROM ADMIN INVENTORY

  useEffect(() => {
    const loadProducts = () => {
      try {
        const saved = JSON.parse(
          localStorage.getItem("vetClinicProducts") || "[]"
        );

        setProducts(Array.isArray(saved) ? saved : []);
      } catch (error) {
        console.error("Could not load store products:", error);
        setProducts([]);
      }
    };

    const handleProductsUpdated = (event) => {
      if (Array.isArray(event.detail)) {
        setProducts(event.detail);
      } else {
        loadProducts();
      }
    };

    loadProducts();

    window.addEventListener(
      "vetClinicProductsUpdated",
      handleProductsUpdated
    );

    window.addEventListener("storage", loadProducts);

    return () => {
      window.removeEventListener(
        "vetClinicProductsUpdated",
        handleProductsUpdated
      );

      window.removeEventListener("storage", loadProducts);
    };
  }, []);

  // CATEGORIES FROM ADMIN

  useEffect(() => {
    const sortCategories = (list) =>
      [...list].sort((a, b) => {
        const difference =
          (Number(a.sortOrder) || 0) -
          (Number(b.sortOrder) || 0);

        return (
          difference ||
          String(a.title || "").localeCompare(
            String(b.title || "")
          )
        );
      });

    const loadCategories = () => {
      try {
        const saved = JSON.parse(
          localStorage.getItem("vetClinicCategories") || "[]"
        );

        setCategories(
          Array.isArray(saved) ? sortCategories(saved) : []
        );
      } catch (error) {
        console.error("Could not load categories:", error);
        setCategories([]);
      }
    };

    const handleCategoriesUpdated = (event) => {
      if (Array.isArray(event.detail)) {
        setCategories(sortCategories(event.detail));
      } else {
        loadCategories();
      }
    };

    loadCategories();

    window.addEventListener(
      "vetClinicCategoriesUpdated",
      handleCategoriesUpdated
    );

    window.addEventListener("storage", loadCategories);

    return () => {
      window.removeEventListener(
        "vetClinicCategoriesUpdated",
        handleCategoriesUpdated
      );

      window.removeEventListener("storage", loadCategories);
    };
  }, []);

  useEffect(() => {
    setCategory(categoryFromUrl || "All categories");
  }, [categoryFromUrl]);

  // SAVE CART

  useEffect(() => {
    localStorage.setItem(
      "vetClinicStoreCart",
      JSON.stringify(cart)
    );

    window.dispatchEvent(new Event("cartUpdated"));
  }, [cart]);

  const storeProducts = useMemo(
    () => products.filter((product) => product.showOnStore === true),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return storeProducts.filter((product) => {
      const name = String(product.name || "").toLowerCase();

      const productCategory = String(
        product.category || ""
      ).toLowerCase();

      const description = String(
        product.description || ""
      ).toLowerCase();

      const matchesSearch =
        !searchValue ||
        name.includes(searchValue) ||
        productCategory.includes(searchValue) ||
        description.includes(searchValue);

      const matchesCategory =
        category === "All categories" ||
        product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [storeProducts, search, category]);

  const toggleFavorite = (event, productId) => {
    event.stopPropagation();

    setFavorites((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    );
  };

  const getProductStock = (product) =>
    Number(product.quantity) || 0;

  const getProductPrice = (product) =>
    Number(product.sellingPrice) || 0;

  const openProduct = (product) => {
    navigate(`/products/${product.id}`);
  };

  const addToCart = (event, product) => {
    event.stopPropagation();

    const stock = getProductStock(product);

    if (stock <= 0) return;

    const price = getProductPrice(product);

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => String(item.id) === String(product.id)
      );

      if (existingItem) {
        if (Number(existingItem.quantity) >= stock) {
          return currentCart;
        }

        return currentCart.map((item) =>
          String(item.id) === String(product.id)
            ? {
                ...item,
                quantity: Number(item.quantity) + 1,
                stock,
                price,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          price,
          stock,
          quantity: 1,
        },
      ];
    });
  };

  const handleProductKeyDown = (event, product) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openProduct(product);
    }
  };

  // ADMIN SETTINGS -> CSS VARIABLES

  const pageColors = {
    "--teal": colors.primaryColor,
    "--teal-dark": colors.secondaryColor,
    "--teal-light": colors.lightColor,
    "--border": colors.borderColor,
    "--page-bg": colors.backgroundColor,
    "--text": colors.textColor,
    "--button": colors.buttonColor,
    "--button-text": colors.buttonTextColor,
  };

  return (
    <div className="products-page" style={pageColors}>
      <StoreHeader />

      <style>{`
        .products-page,
        .products-page * {
          box-sizing: border-box;
        }

        .products-page {
          min-height: 100vh;
          width: 100%;
          background: var(--page-bg);
          color: var(--text);
          font-family: Arial, Helvetica, sans-serif;
          overflow-x: hidden;
        }

        .products-page .products-container button,
        .products-page .products-container input,
        .products-page .products-container select {
          font: inherit;
        }

        .products-container {
          width: min(1400px, 92%);
          margin: 0 auto;
          padding: 55px 0 75px;
        }

        /* PAGE HEADING */

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
          background: var(--teal-light);
          color: var(--teal-dark);
          font-size: 11px;
          font-weight: 800;
        }

        .products-heading h1 {
          margin: 0 0 10px;
          color: var(--text);
          font-size: clamp(32px, 4vw, 48px);
          line-height: 1.05;
          letter-spacing: -1.5px;
        }

        .products-heading p {
          margin: 0;
          color: var(--text);
          opacity: 0.7;
          font-size: 14px;
          line-height: 1.7;
        }

        /* SEARCH AND FILTER */

        .products-toolbar {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 230px;
          gap: 14px;
          margin-bottom: 28px;
          padding: 18px;
          border: 1px solid var(--border);
          border-radius: 16px;
          background: var(--page-bg);
          box-shadow: 0 8px 25px rgba(0,0,0,0.04);
        }

        .products-search {
          display: flex;
          align-items: center;
          gap: 10px;
          height: 48px;
          padding: 0 15px;
          border: 1px solid var(--border);
          border-radius: 11px;
          background: var(--page-bg);
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .products-search:focus-within {
          border-color: var(--teal);
          box-shadow: 0 0 0 3px var(--teal-light);
        }

        .products-search > svg {
          flex-shrink: 0;
          color: var(--teal);
          font-size: 14px;
        }

        .products-search input {
          width: 100%;
          min-width: 0;
          height: 100%;
          padding: 0;
          border: none;
          outline: none;
          background: transparent;
          color: var(--text);
          font-size: 13px;
        }

        .products-search input::placeholder {
          color: #98a2b3;
        }

        .products-search-clear {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 30px;
          height: 30px;
          padding: 0;
          border: none;
          border-radius: 50%;
          background: var(--teal-light);
          color: var(--teal-dark);
          cursor: pointer;
        }

        .products-category-select {
          width: 100%;
          min-width: 0;
          height: 48px;
          padding: 0 14px;
          border: 1px solid var(--border);
          border-radius: 11px;
          outline: none;
          background: var(--page-bg);
          color: var(--text);
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .products-category-select:focus {
          border-color: var(--teal);
          box-shadow: 0 0 0 3px var(--teal-light);
        }

        /* RESULTS */

        .products-results-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 18px;
        }

        .products-results-count {
          color: var(--text);
          opacity: 0.8;
          font-size: 12px;
        }

        .products-results-count strong {
          color: var(--teal-dark);
        }

        .products-active-category {
          padding: 7px 11px;
          border-radius: 30px;
          background: var(--teal-light);
          color: var(--teal-dark);
          font-size: 10px;
          font-weight: 800;
        }        /* PRODUCT GRID */

        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 22px;
        }

        .product-card {
          position: relative;
          min-width: 0;
          overflow: hidden;
          border: 1px solid var(--border);
          border-radius: 17px;
          background: var(--page-bg);
          cursor: pointer;
          outline: none;

          transition:
            transform 0.2s,
            box-shadow 0.2s,
            border-color 0.2s;
        }

        .product-card:hover {
          transform: translateY(-4px);
          border-color: var(--teal);
          box-shadow: 0 14px 32px rgba(0,0,0,0.09);
        }

        .product-card:focus-visible {
          border-color: var(--teal);
          box-shadow: 0 0 0 3px var(--teal-light);
        }

        .product-image {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 220px;
          overflow: hidden;
          background: var(--teal-light);
        }

        .product-image img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        .product-card:hover .product-image img {
          transform: scale(1.025);
        }

        .product-image-placeholder {
          color: var(--teal);
          font-size: 55px;
        }

        /* FAVORITES */

        .product-favorite {
          position: absolute;
          top: 13px;
          right: 13px;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          padding: 0;
          border: none;
          border-radius: 50%;
          background: var(--page-bg);
          color: #b5c0ce;
          box-shadow: 0 4px 12px rgba(0,0,0,0.07);
          cursor: pointer;
          transition: transform 0.2s, color 0.2s;
        }

        .product-favorite:hover {
          transform: scale(1.06);
          color: #e4576b;
        }

        .product-favorite.active {
          color: #e4576b;
        }

        /* PRODUCT DETAILS ON CARD */

        .product-info {
          padding: 18px 20px 20px;
        }

        .product-name {
          margin: 0 0 7px;
          color: var(--text);
          font-size: 15px;
          font-weight: 800;
          line-height: 1.35;
          overflow-wrap: anywhere;
        }

        .product-category {
          margin-bottom: 12px;
          color: var(--text);
          opacity: 0.65;
          font-size: 11px;
        }

        .product-action-row {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: center;
          gap: 10px;
          width: 100%;
          margin-top: 4px;
        }

        .product-price {
          color: var(--text);
          font-size: 17px;
          font-weight: 900;
          white-space: nowrap;
        }

        .product-stock {
          justify-self: end;
          padding: 5px 9px;
          border-radius: 20px;
          background: #eaf9f3;
          color: #21865d;
          font-size: 9px;
          font-weight: 800;
          white-space: nowrap;
        }

        .product-stock.low {
          background: #fff6e5;
          color: #b7791f;
        }

        .product-stock.out {
          background: #fff0f0;
          color: #d92d20;
        }

        /* CART BUTTON */

        .product-add-cart {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 42px;
          height: 42px;
          padding: 0;
          border: none;
          border-radius: 50%;
          background: var(--button);
          color: var(--button-text);
          font-size: 15px;
          cursor: pointer;
          box-shadow: 0 6px 14px rgba(0,0,0,0.10);

          transition:
            background 0.2s,
            transform 0.2s,
            box-shadow 0.2s;
        }

        .product-add-cart:hover:not(:disabled) {
          background: var(--teal-dark);
          transform: translateY(-2px) scale(1.04);
          box-shadow: 0 8px 18px rgba(0,0,0,0.14);
        }

        .product-add-cart:disabled {
          background: #d5dddd;
          color: #8b9898;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* EMPTY STATE */

        .products-empty {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          padding: 50px 20px;
          border: 1px dashed var(--border);
          border-radius: 18px;
          background: var(--page-bg);
          text-align: center;
        }

        .products-empty > svg {
          margin-bottom: 15px;
          color: var(--teal);
          font-size: 48px;
        }

        .products-empty h3 {
          margin: 0 0 7px;
          color: var(--text);
          font-size: 18px;
        }

        .products-empty p {
          margin: 0;
          color: var(--text);
          opacity: 0.7;
          font-size: 12px;
        }

        /* RESPONSIVE */

        @media (max-width: 1100px) {
          .products-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 850px) {
          .products-toolbar {
            grid-template-columns: minmax(0, 1fr);
          }

          .products-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
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
            grid-template-columns: minmax(0, 1fr);
          }

          .products-results-row {
            align-items: flex-start;
            flex-direction: column;
          }

          .product-action-row {
            grid-template-columns: auto minmax(0, 1fr) auto;
            gap: 8px;
          }
        }
      `}</style>

      <main className="products-container">
        {/* PAGE HEADING */}

        <div className="products-heading">
          <div className="products-heading-badge">
            <FaPaw />
            Pet Store
          </div>

          <h1>All Products</h1>

          <p>
            Browse our complete collection of pet care products.
          </p>
        </div>

        {/* SEARCH + CATEGORY FILTER */}

        <div className="products-toolbar">
          <div className="products-search">
            <FaSearch />

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            {search && (
              <button
                type="button"
                className="products-search-clear"
                onClick={() => setSearch("")}
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
              setCategory(event.target.value)
            }
          >
            <option value="All categories">
              All categories
            </option>

            {categories.map((categoryItem) => (
              <option
                key={categoryItem.id}
                value={categoryItem.title}
              >
                {categoryItem.title}
              </option>
            ))}
          </select>
        </div>

        {/* RESULTS INFO */}

        <div className="products-results-row">
          <div className="products-results-count">
            Showing{" "}
            <strong>{filteredProducts.length}</strong>{" "}
            product
            {filteredProducts.length !== 1 ? "s" : ""}
          </div>

          {category !== "All categories" && (
            <div className="products-active-category">
              {category}
            </div>
          )}
        </div>

        {/* PRODUCT GRID */}

        <div className="products-grid">
          {filteredProducts.length === 0 ? (
            <div className="products-empty">
              <FaBoxOpen />

              <h3>No products found</h3>

              <p>
                {storeProducts.length === 0
                  ? "Products enabled for the Store from Admin will appear here."
                  : "Try another search or category."}
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const isFavorite = favorites.includes(
                product.id
              );

              const stock = getProductStock(product);
              const price = getProductPrice(product);

              return (
                <article
                  className="product-card"
                  key={product.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openProduct(product)}
                  onKeyDown={(event) =>
                    handleProductKeyDown(event, product)
                  }
                  aria-label={`View ${product.name}`}
                >
                  {/* FAVORITE BUTTON */}

                  <button
                    type="button"
                    className={`product-favorite ${
                      isFavorite ? "active" : ""
                    }`}
                    onClick={(event) =>
                      toggleFavorite(event, product.id)
                    }
                    aria-label={`Favorite ${product.name}`}
                    aria-pressed={isFavorite}
                  >
                    <FaHeart />
                  </button>

                  {/* PRODUCT IMAGE */}

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

                  {/* PRODUCT INFORMATION */}

                  <div className="product-info">
                    <h3 className="product-name">
                      {product.name}
                    </h3>

                    <div className="product-category">
                      {product.category || "Uncategorized"}
                    </div>

                    {/* PRICE + STOCK + CART */}

                    <div className="product-action-row">
                      <span className="product-price">
                        ${price.toFixed(2)}
                      </span>

                      <span
                        className={`product-stock ${
                          stock <= 0
                            ? "out"
                            : stock <= 5
                              ? "low"
                              : ""
                        }`}
                      >
                        {stock <= 0
                          ? "Out of stock"
                          : `${stock} in stock`}
                      </span>

                      <button
                        type="button"
                        className="product-add-cart"
                        disabled={stock <= 0}
                        onClick={(event) =>
                          addToCart(event, product)
                        }
                        aria-label={
                          stock > 0
                            ? `Add ${product.name} to cart`
                            : `${product.name} is out of stock`
                        }
                        title={
                          stock > 0
                            ? "Add to Cart"
                            : "Out of Stock"
                        }
                      >
                        <FaCartPlus />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

export default Products;