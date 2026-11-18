import { useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  useOutletContext,
  useSearchParams,
} from "react-router-dom";

import { getStoreProducts } from "../api/storeProductsApi";
import { getPublicStoreSettings } from "../api/storeSettingsApi";

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

function readArray(key) {
  const saved = localStorage.getItem(key);

  if (saved === null) return [];

  const parsed = JSON.parse(saved);

  if (!Array.isArray(parsed)) {
    throw new Error("The saved data could not be read.");
  }

  return parsed;
}

function normalizeStoreColors(settings = {}) {
  const colors = { ...DEFAULT_COLORS };

  Object.keys(colors).forEach((key) => {
    const value = settings?.storeColors?.[key];

    if (
      typeof value === "string" &&
      /^#[0-9a-fA-F]{6}$/.test(value)
    ) {
      colors[key] = value;
    }
  });

  return colors;
}

function Products() {
  const navigate = useNavigate();
  const { clinicId, storeBasePath } = useOutletContext();
  const [searchParams] = useSearchParams();

  const categoryFromUrl = searchParams.get("category");
  const cartKey = `vetClinicStoreCart:${clinicId}`;
  const pendingKey = `vetClinicPendingStoreOrder:${clinicId}`;

  const [colorsState, setColorsState] = useState(() => ({
    clinicId: String(clinicId),
    colors: { ...DEFAULT_COLORS },
  }));

  const colors =
    colorsState.clinicId === String(clinicId)
      ? colorsState.colors
      : DEFAULT_COLORS;

  const [settingsError, setSettingsError] = useState("");
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  const [category, setCategory] = useState(
    categoryFromUrl || "All categories"
  );

  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [error, setError] = useState("");

  const [pendingCheckout, setPendingCheckout] =
    useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setSearch("");
    setFavorites([]);
  }, [clinicId]);

  useEffect(() => {
    let controller = null;
    let disposed = false;

    setColorsState({
      clinicId: String(clinicId),
      colors: { ...DEFAULT_COLORS },
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

        setColorsState({
          clinicId: String(clinicId),
          colors: normalizeStoreColors(result),
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

    const loadProducts = async () => {
      controller?.abort();

      const currentController = new AbortController();
      controller = currentController;

      try {
        const result = await getStoreProducts(clinicId, {
          signal: currentController.signal,
        });

        if (
          disposed ||
          currentController.signal.aborted
        ) {
          return;
        }

        const clinicProducts = result.filter(
          (product) =>
            product &&
            Number(product.clinicId) === Number(clinicId) &&
            product.showOnStore === true
        );

        setProducts(clinicProducts);
        setError("");

        try {
          localStorage.setItem(
            `vetClinicProducts:${clinicId}`,
            JSON.stringify(clinicProducts)
          );
        } catch {
          // Products remain available without caching.
        }
      } catch (exception) {
        if (
          disposed ||
          currentController.signal.aborted
        ) {
          return;
        }

        setError(
          exception.message ||
            "Could not load this clinic's products."
        );
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadProducts();
      }
    };

    setProducts([]);
    setError("");
    loadProducts();

    window.addEventListener(
      "vetClinicProductsUpdated",
      loadProducts
    );
    window.addEventListener(
      "productsUpdated",
      loadProducts
    );
    window.addEventListener("focus", loadProducts);

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      disposed = true;
      controller?.abort();

      window.removeEventListener(
        "vetClinicProductsUpdated",
        loadProducts
      );
      window.removeEventListener(
        "productsUpdated",
        loadProducts
      );
      window.removeEventListener("focus", loadProducts);

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [clinicId]);

  useEffect(() => {
    const refreshCart = () => {
      try {
        setCart(readArray(cartKey));
        setPendingCheckout(
          localStorage.getItem(pendingKey) !== null
        );
      } catch {
        setError("Could not read your saved cart.");
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

    refreshCart();

    window.addEventListener("cartUpdated", refreshCart);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("cartUpdated", refreshCart);
      window.removeEventListener("storage", handleStorage);
    };
  }, [cartKey, pendingKey]);

  useEffect(() => {
    setCategory(categoryFromUrl || "All categories");
  }, [categoryFromUrl, clinicId]);

  const storeProducts = useMemo(
    () =>
      products.filter(
        (product) => product.showOnStore === true
      ),
    [products]
  );

  const categories = useMemo(() => {
    const names = new Set();

    for (const product of storeProducts) {
      names.add(product.category || "Uncategorized");
    }

    return [...names]
      .sort((a, b) => a.localeCompare(b))
      .map((title) => ({
        id: title,
        title,
      }));
  }, [storeProducts]);

  const filteredProducts = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return storeProducts.filter((product) => {
      const name = String(
        product.name || ""
      ).toLowerCase();

      const productCategory =
        product.category || "Uncategorized";

      const description = String(
        product.description || ""
      ).toLowerCase();

      const matchesSearch =
        !searchValue ||
        name.includes(searchValue) ||
        productCategory.toLowerCase().includes(searchValue) ||
        description.includes(searchValue);

      const matchesCategory =
        category === "All categories" ||
        productCategory === category;

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

  const getProductStock = (product) => {
    const value = Number(product.quantity);

    return Number.isSafeInteger(value) && value >= 0
      ? value
      : 0;
  };

  const getProductPrice = (product) => {
    const value = Number(product.sellingPrice);

    return Number.isFinite(value) && value >= 0
      ? value
      : 0;
  };

  const getCartQuantity = (productId) => {
    const item = cart.find(
      (entry) => String(entry.id) === String(productId)
    );

    return Number(item?.quantity) || 0;
  };

  const openProduct = (product) => {
    navigate(`${storeBasePath}/products/${product.id}`);
  };

  const addToCart = (event, product) => {
    event.stopPropagation();
    setError("");

    const stock = getProductStock(product);
    const price = Number(product.sellingPrice);
    const productId = Number(product.id);

    if (stock <= 0) return;

    if (
      Number(product.clinicId) !== Number(clinicId) ||
      product.showOnStore !== true ||
      !Number.isSafeInteger(productId) ||
      productId <= 0 ||
      productId > 2147483647 ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      setError("This product is currently unavailable.");
      return;
    }

    try {
      if (localStorage.getItem(pendingKey) !== null) {
        setPendingCheckout(true);
        setError(
          "Please return to your cart and confirm your previous order first."
        );
        return;
      }

      const currentCart = readArray(cartKey);

      const existingItem = currentCart.find(
        (item) => String(item.id) === String(productId)
      );

      const currentQuantity = existingItem
        ? Number(existingItem.quantity)
        : 0;

      if (
        !Number.isSafeInteger(currentQuantity) ||
        currentQuantity < 0
      ) {
        setError(
          "This item's saved quantity is invalid. Remove it from your cart and try again."
        );
        return;
      }

      if (currentQuantity >= stock) {
        setCart(currentCart);
        setError(
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
        quantity: currentQuantity + 1,
      };

      const updatedCart = existingItem
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
    } catch {
      setError(
        "Could not save your cart. Please try again."
      );
    }
  };

  const handleProductKeyDown = (event, product) => {
    if (event.target !== event.currentTarget) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openProduct(product);
    }
  };

  const pageColors = {
    "--teal": colors.primaryColor,
    "--teal-dark": colors.secondaryColor,
    "--teal-light": colors.lightColor,
    "--border": colors.borderColor,
    "--page-bg": colors.backgroundColor,
    "--text": colors.textColor,
    "--button": colors.buttonColor,
    "--button-text": colors.buttonTextColor,
  };  return (
    <div className="products-page" style={pageColors}>
      

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
          opacity: .7;
          font-size: 14px;
          line-height: 1.7;
        }

        .products-toolbar {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 230px;
          gap: 14px;
          margin-bottom: 28px;
          padding: 18px;
          border: 1px solid var(--border);
          border-radius: 16px;
          background: var(--page-bg);
          box-shadow: 0 8px 25px rgba(0,0,0,.04);
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
          transition: border-color .2s, box-shadow .2s;
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

        .products-results-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 18px;
        }

        .products-results-count {
          color: var(--text);
          opacity: .8;
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
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 22px;
        }

        .products-page .product-card {
          position: relative;
          min-width: 0;
          overflow: hidden;
          border: 1px solid var(--border);
          border-radius: 17px;
          background: var(--page-bg);
          cursor: pointer;
          outline: none;
          transition:
            transform .2s,
            box-shadow .2s,
            border-color .2s;
        }

        .products-page .product-card:hover {
          transform: translateY(-4px);
          border-color: var(--teal);
          box-shadow: 0 14px 32px rgba(0,0,0,.09);
        }

        .products-page .product-card:focus-visible {
          border-color: var(--teal);
          box-shadow: 0 0 0 3px var(--teal-light);
        }

        .products-page .product-image {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 220px;
          overflow: hidden;
          background: var(--teal-light);
        }

        .products-page .product-image img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform .3s;
        }

        .products-page .product-card:hover .product-image img {
          transform: scale(1.025);
        }

        .products-page .product-image-placeholder {
          color: var(--teal);
          font-size: 55px;
        }

        .products-page .product-favorite {
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
          box-shadow: 0 4px 12px rgba(0,0,0,.07);
          cursor: pointer;
          transition: transform .2s, color .2s;
        }

        .products-page .product-favorite:hover {
          transform: scale(1.06);
          color: #e4576b;
        }

        .products-page .product-favorite.active {
          color: #e4576b;
        }

        .products-page .product-info {
          padding: 18px 20px 20px;
        }

        .products-page .product-name {
          margin: 0 0 7px;
          color: var(--text);
          font-size: 15px;
          font-weight: 800;
          line-height: 1.35;
          overflow-wrap: anywhere;
        }

        .products-page .product-category {
          margin-bottom: 12px;
          color: var(--text);
          opacity: .65;
          font-size: 11px;
        }

        .products-page .product-action-row {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: center;
          gap: 10px;
          width: 100%;
          margin-top: 4px;
        }

        .products-page .product-price {
          color: var(--text);
          font-size: 17px;
          font-weight: 900;
          white-space: nowrap;
        }

        .products-page .product-stock {
          justify-self: end;
          padding: 5px 9px;
          border-radius: 20px;
          background: #eaf9f3;
          color: #21865d;
          font-size: 9px;
          font-weight: 800;
          white-space: nowrap;
        }

        .products-page .product-stock.low {
          background: #fff6e5;
          color: #b7791f;
        }

        .products-page .product-stock.out {
          background: #fff0f0;
          color: #d92d20;
        }

        .products-page .product-add-cart {
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
          box-shadow: 0 6px 14px rgba(0,0,0,.1);
          transition:
            background .2s,
            transform .2s,
            box-shadow .2s;
        }

        .products-page .product-add-cart:hover:not(:disabled) {
          background: var(--teal-dark);
          transform: translateY(-2px) scale(1.04);
          box-shadow: 0 8px 18px rgba(0,0,0,.14);
        }

        .products-page .product-add-cart:disabled {
          background: #d5dddd;
          color: #8b9898;
          cursor: not-allowed;
          box-shadow: none;
        }

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
          opacity: .7;
          font-size: 12px;
        }

        .products-message {
          margin: 0 0 20px;
          padding: 12px 15px;
          border: 1px solid var(--border);
          border-radius: 10px;
          background: var(--teal-light);
          color: var(--teal-dark);
          font-size: 12px;
          line-height: 1.6;
        }

        .products-message.error {
          background: #fff1f0;
          border-color: #f0cccc;
          color: #b42318;
        }

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

          .products-page .product-action-row {
            grid-template-columns: auto minmax(0, 1fr) auto;
            gap: 8px;
          }
        }
      `}</style>

      <main className="products-container">
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

        {settingsError && (
          <div className="products-message error" role="alert">
            {settingsError}
          </div>
        )}

        {error && (
          <div className="products-message error" role="alert">
            {error}
          </div>
        )}

        {pendingCheckout && !error && (
          <div className="products-message" role="status">
            Return to your cart to confirm your previous order
            before adding more items.
          </div>
        )}

        <div className="products-toolbar">
          <div className="products-search">
            <FaSearch />

            <input
              type="text"
              placeholder="Search products..."
              aria-label="Search products"
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
            aria-label="Filter by category"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
          >
            <option value="All categories">
              All categories
            </option>

            {category !== "All categories" &&
              !categories.some(
                (item) => item.title === category
              ) && (
                <option value={category}>
                  {category}
                </option>
              )}

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

        <div className="products-grid">
          {filteredProducts.length === 0 ? (
            <div className="products-empty">
              <FaBoxOpen />

              <h3>No products found</h3>

              <p>
                {storeProducts.length === 0
                  ? "No products are currently available in this store."
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

              const stockLimitReached =
                getCartQuantity(product.id) >= stock;

              const rawPrice = Number(product.sellingPrice);

              const invalidPrice =
                !Number.isFinite(rawPrice) || rawPrice < 0;

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
                      {product.category || "Uncategorized"}
                    </div>

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
                        disabled={cartDisabled}
                        onClick={(event) =>
                          addToCart(event, product)
                        }
                        aria-label={`${cartLabel}: ${product.name}`}
                        title={cartLabel}
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