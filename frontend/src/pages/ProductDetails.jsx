import { useEffect, useRef, useState } from "react";
import {
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";

import { getStoreProduct } from "../api/storeProductsApi";
import { getPublicStoreSettings } from "../api/storeSettingsApi";

import {
  FaArrowLeft,
  FaPaw,
  FaCartPlus,
  FaBoxOpen,
  FaCheckCircle,
} from "react-icons/fa";

const DEFAULT_COLORS = {
  primaryColor: "#1aa6a6",
  secondaryColor: "#11797b",
  lightColor: "#e8f7f7",
  borderColor: "#dcebea",
  backgroundColor: "#f8fbfa",
  textColor: "#263b4f",
  buttonColor: "#1aa6a6",
  buttonTextColor: "#ffffff",
};

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

function readCart(key) {
  const value = localStorage.getItem(key);

  if (!value) return [];

  const parsed = JSON.parse(value);

  if (!Array.isArray(parsed)) {
    throw new Error("Your saved cart could not be read.");
  }

  return parsed;
}

function ProductDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { clinicId, storeBasePath } = useOutletContext();

  const cartKey = `vetClinicStoreCart:${clinicId}`;
  const pendingKey = `vetClinicPendingStoreOrder:${clinicId}`;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  const [pendingCheckout, setPendingCheckout] =
    useState(false);

  const [settingsError, setSettingsError] = useState("");

  const [colorsState, setColorsState] = useState(() => ({
    clinicId: String(clinicId),
    colors: { ...DEFAULT_COLORS },
  }));

  const colors =
    colorsState.clinicId === String(clinicId)
      ? colorsState.colors
      : DEFAULT_COLORS;

  const addedTimer = useRef(null);

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
    setAdded(false);

    const refreshCart = () => {
      try {
        setCart(readCart(cartKey));
        setPendingCheckout(
          localStorage.getItem(pendingKey) !== null
        );
      } catch (exception) {
        setError(
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

    refreshCart();

    window.addEventListener("cartUpdated", refreshCart);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("cartUpdated", refreshCart);
      window.removeEventListener("storage", handleStorage);

      if (addedTimer.current !== null) {
        window.clearTimeout(addedTimer.current);
        addedTimer.current = null;
      }
    };
  }, [cartKey, pendingKey]);

  useEffect(() => {
    let controller = null;
    let disposed = false;

    const loadProduct = async () => {
      controller?.abort();

      const currentController = new AbortController();
      controller = currentController;

      try {
        const result = await getStoreProduct(
          clinicId,
          id,
          { signal: currentController.signal }
        );

        if (
          disposed ||
          currentController.signal.aborted
        ) {
          return;
        }

        if (result.showOnStore !== true) {
          setProduct(null);
          return;
        }

        setProduct(result);
        setError("");
      } catch (exception) {
        if (
          disposed ||
          currentController.signal.aborted
        ) {
          return;
        }

        setProduct(null);

        setError(
          exception.status === 404
            ? "This product is no longer available in this store."
            : exception.message ||
                "Could not load this product."
        );
      } finally {
        if (
          !disposed &&
          !currentController.signal.aborted
        ) {
          setLoading(false);
        }
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadProduct();
      }
    };

    setProduct(null);
    setLoading(true);
    setError("");
    setAdded(false);

    if (addedTimer.current !== null) {
      window.clearTimeout(addedTimer.current);
      addedTimer.current = null;
    }

    window.scrollTo(0, 0);
    loadProduct();

    window.addEventListener(
      "vetClinicProductsUpdated",
      loadProduct
    );
    window.addEventListener(
      "productsUpdated",
      loadProduct
    );
    window.addEventListener("focus", loadProduct);

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      disposed = true;
      controller?.abort();

      window.removeEventListener(
        "vetClinicProductsUpdated",
        loadProduct
      );
      window.removeEventListener(
        "productsUpdated",
        loadProduct
      );
      window.removeEventListener("focus", loadProduct);

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [id, clinicId]);

  const rawStock = Number(product?.quantity);

  const stock =
    Number.isSafeInteger(rawStock) && rawStock >= 0
      ? rawStock
      : 0;

  const rawPrice = Number(product?.sellingPrice);

  const price =
    Number.isFinite(rawPrice) && rawPrice >= 0
      ? rawPrice
      : 0;

  const existingCartItem = cart.find(
    (item) => String(item.id) === String(product?.id)
  );

  const quantityInCart =
    Number(existingCartItem?.quantity) || 0;

  const stockLimitReached = quantityInCart >= stock;

  const addToCart = () => {
    setError("");
    setAdded(false);

    if (!product || stock <= 0) return;

    if (
      Number(product.clinicId) !== Number(clinicId) ||
      product.showOnStore !== true
    ) {
      setError("This product is currently unavailable.");
      return;
    }

    if (!Number.isFinite(rawPrice) || rawPrice < 0) {
      setError("This product does not have a valid price.");
      return;
    }

    const productId = Number(product.id);

    if (
      !Number.isSafeInteger(productId) ||
      productId <= 0 ||
      productId > 2147483647
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

      const currentCart = readCart(cartKey);

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

      setAdded(true);

      if (addedTimer.current !== null) {
        window.clearTimeout(addedTimer.current);
      }

      addedTimer.current = window.setTimeout(() => {
        setAdded(false);
        addedTimer.current = null;
      }, 1800);
    } catch (exception) {
      setError(
        exception.message ||
          "Could not save your cart. Please try again."
      );
    }
  };

  const backToProducts = () => {
    navigate(`${storeBasePath}/products`);
  };

  const pageColors = {
    "--teal": colors.primaryColor,
    "--teal-dark": colors.secondaryColor,
    "--teal-light": colors.lightColor,
    "--text": colors.textColor,
    "--muted": `color-mix(
      in srgb,
      ${colors.textColor} 65%,
      ${colors.backgroundColor}
    )`,
    "--border": colors.borderColor,
    "--page-bg": colors.backgroundColor,
    "--button": colors.buttonColor,
    "--button-text": colors.buttonTextColor,
  };  return (
    <div className="product-details-page" style={pageColors}>
      

      <style>{`
        .product-details-page,
        .product-details-page * {
          box-sizing: border-box;
        }

        .product-details-page button {
          font: inherit;
        }

        .product-details-page {
          min-height: 100vh;
          background: var(--page-bg);
          color: var(--text);
          font-family: Arial, Helvetica, sans-serif;
        }

        .product-details-loading {
          min-height: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--muted);
        }

        .product-not-found {
          width: min(700px, 92%);
          min-height: 500px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .product-not-found > svg {
          margin-bottom: 18px;
          color: var(--teal);
          font-size: 60px;
        }

        .product-not-found h2 {
          margin: 0 0 8px;
          color: var(--text);
          font-size: 26px;
        }

        .product-not-found p {
          margin: 0 0 22px;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.6;
        }

        .product-not-found button {
          height: 42px;
          padding: 0 20px;
          border: none;
          border-radius: 10px;
          background: var(--button);
          color: var(--button-text);
          font-weight: 800;
          cursor: pointer;
        }

        .product-not-found button:hover {
          background: var(--teal-dark);
        }

        .product-details-container {
          width: min(1250px, 92%);
          margin: 0 auto;
          padding: 35px 0 80px;
        }

        .product-details-back {
          width: fit-content;
          margin-bottom: 25px;
          padding: 0;
          border: none;
          background: transparent;
          color: var(--teal-dark);
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px !important;
          font-weight: 800 !important;
          cursor: pointer;
        }

        .product-details-back:hover {
          color: var(--teal);
        }

        .product-details-card {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            minmax(0, 1fr);
          overflow: hidden;
          border: 1px solid var(--border);
          border-radius: 24px;
          background: var(--page-bg);
          box-shadow: 0 15px 45px rgba(17,121,123,.07);
        }

        .product-details-image-area {
          min-height: 560px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: linear-gradient(
            135deg,
            var(--page-bg),
            var(--teal-light)
          );
        }

        .product-details-image {
          width: 100%;
          height: 100%;
          min-height: 560px;
          object-fit: cover;
          display: block;
        }

        .product-details-placeholder {
          color: var(--teal);
          font-size: 100px;
        }

        .product-details-content {
          min-width: 0;
          padding: 55px 50px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .product-details-category {
          width: fit-content;
          margin-bottom: 14px;
          padding: 7px 11px;
          border-radius: 30px;
          background: var(--teal-light);
          color: var(--teal-dark);
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .6px;
          overflow-wrap: anywhere;
        }

        .product-details-name {
          margin: 0 0 15px;
          color: var(--text);
          font-size: clamp(30px, 4vw, 46px);
          line-height: 1.1;
          letter-spacing: -1px;
          overflow-wrap: anywhere;
        }

        .product-details-price {
          margin-bottom: 20px;
          color: var(--teal-dark);
          font-size: 29px;
          font-weight: 900;
        }

        .product-details-stock {
          width: fit-content;
          margin-bottom: 28px;
          padding: 7px 12px;
          border-radius: 30px;
          background: #eaf9f3;
          color: #21865d;
          font-size: 11px;
          font-weight: 800;
        }

        .product-details-stock.low {
          background: #fff6e5;
          color: #b7791f;
        }

        .product-details-stock.out {
          background: #fff0f0;
          color: #d92d20;
        }

        .product-details-description-title {
          margin: 0 0 8px;
          color: var(--text);
          font-size: 14px;
          font-weight: 900;
        }

        .product-details-description {
          margin: 0 0 30px;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.8;
          white-space: pre-line;
          overflow-wrap: anywhere;
        }

        .product-details-no-description {
          font-style: italic;
        }

        .product-details-info {
          margin-bottom: 30px;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }

        .product-details-info-row {
          min-height: 47px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          border-bottom: 1px solid var(--border);
        }

        .product-details-info-row:last-child {
          border-bottom: none;
        }

        .product-details-info-label {
          color: var(--muted);
          font-size: 11px;
          font-weight: 700;
        }

        .product-details-info-value {
          color: var(--text);
          font-size: 11px;
          font-weight: 800;
          text-align: right;
          overflow-wrap: anywhere;
        }

        .product-details-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .product-details-cart {
          min-width: 170px;
          height: 48px;
          padding: 0 20px;
          border: none;
          border-radius: 11px;
          background: var(--button);
          color: var(--button-text);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          font-size: 12px !important;
          font-weight: 900 !important;
          cursor: pointer;
          transition:
            background .2s ease,
            transform .2s ease,
            box-shadow .2s ease;
        }

        .product-details-cart:hover:not(:disabled) {
          background: var(--teal-dark);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(17,121,123,.18);
        }

        .product-details-cart:disabled {
          background: #d5dddd;
          color: #8b9898;
          cursor: not-allowed;
        }

        .product-added-message {
          min-height: 48px;
          padding: 0 14px;
          display: flex;
          align-items: center;
          gap: 7px;
          border-radius: 10px;
          background: #eaf9f3;
          color: #21865d;
          font-size: 11px;
          font-weight: 800;
        }

        .product-details-error {
          margin: 14px 0 0;
          color: #b42318;
          font-size: 12px;
          line-height: 1.6;
        }

        .product-details-settings-error {
          margin: 0 0 20px;
          padding: 12px 15px;
          border: 1px solid #f0cccc;
          border-radius: 10px;
          background: #fff1f0;
          color: #b42318;
          font-size: 12px;
          line-height: 1.6;
        }

        .product-details-pending {
          margin: 14px 0 0;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.6;
        }

        @media (max-width: 900px) {
          .product-details-card {
            grid-template-columns: 1fr;
          }

          .product-details-image-area {
            min-height: 420px;
          }

          .product-details-image {
            min-height: 420px;
            max-height: 500px;
          }
        }

        @media (max-width: 600px) {
          .product-details-container {
            width: 92%;
            padding-top: 25px;
          }

          .product-details-content {
            padding: 35px 25px;
          }

          .product-details-image-area {
            min-height: 330px;
          }

          .product-details-image {
            min-height: 330px;
          }

          .product-details-actions {
            align-items: stretch;
            flex-direction: column;
          }

          .product-details-cart {
            width: 100%;
          }

          .product-added-message {
            justify-content: center;
          }
        }
      `}</style>

      {loading ? (
        <div
          className="product-details-loading"
          role="status"
        >
          Loading product...
        </div>
      ) : !product ? (
        <div className="product-not-found">
          <FaBoxOpen />

          <h2>Product unavailable</h2>

          <p>
            {error ||
              "This product may no longer be available in the store."}
          </p>

          <button
            type="button"
            onClick={backToProducts}
          >
            Back to Products
          </button>
        </div>
      ) : (
        <main className="product-details-container">
          <button
            type="button"
            className="product-details-back"
            onClick={backToProducts}
          >
            <FaArrowLeft />
            Back to Products
          </button>

          {settingsError && (
            <div
              className="product-details-settings-error"
              role="alert"
            >
              {settingsError}
            </div>
          )}

          <div className="product-details-card">
            <div className="product-details-image-area">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-details-image"
                />
              ) : (
                <FaPaw className="product-details-placeholder" />
              )}
            </div>

            <div className="product-details-content">
              <div className="product-details-category">
                {product.category || "Uncategorized"}
              </div>

              <h1 className="product-details-name">
                {product.name}
              </h1>

              <div className="product-details-price">
                ${price.toFixed(2)}
              </div>

              <div
                className={`product-details-stock ${
                  stock <= 0
                    ? "out"
                    : stock <= 5
                      ? "low"
                      : ""
                }`}
              >
                {stock <= 0
                  ? "Out of Stock"
                  : `${stock} in stock`}
              </div>

              <h3 className="product-details-description-title">
                Product Description
              </h3>

              <p
                className={`product-details-description ${
                  !product.description
                    ? "product-details-no-description"
                    : ""
                }`}
              >
                {product.description ||
                  "No description has been added for this product yet."}
              </p>

              <div className="product-details-info">
                <div className="product-details-info-row">
                  <span className="product-details-info-label">
                    Category
                  </span>

                  <span className="product-details-info-value">
                    {product.category || "Uncategorized"}
                  </span>
                </div>

                <div className="product-details-info-row">
                  <span className="product-details-info-label">
                    Availability
                  </span>

                  <span className="product-details-info-value">
                    {stock > 0 ? "Available" : "Unavailable"}
                  </span>
                </div>

                <div className="product-details-info-row">
                  <span className="product-details-info-label">
                    Stock
                  </span>

                  <span className="product-details-info-value">
                    {stock} item{stock !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div className="product-details-actions">
                <button
                  type="button"
                  className="product-details-cart"
                  onClick={addToCart}
                  disabled={
                    stock <= 0 ||
                    stockLimitReached ||
                    pendingCheckout ||
                    !Number.isFinite(rawPrice) ||
                    rawPrice < 0
                  }
                >
                  <FaCartPlus />

                  {stock <= 0
                    ? "Out of Stock"
                    : stockLimitReached
                      ? "Stock Limit Reached"
                      : "Add to Cart"}
                </button>

                {added && (
                  <div
                    className="product-added-message"
                    role="status"
                  >
                    <FaCheckCircle />
                    Added to cart
                  </div>
                )}
              </div>

              {error && (
                <p
                  className="product-details-error"
                  role="alert"
                >
                  {error}
                </p>
              )}

              {pendingCheckout && !error && (
                <p className="product-details-pending">
                  Return to your cart to confirm your previous
                  order before adding more items.
                </p>
              )}
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

export default ProductDetails;