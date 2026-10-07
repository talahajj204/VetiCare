import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import StoreHeader from "./StoreHeader";

import {
  FaArrowLeft,
  FaPaw,
  FaCartPlus,
  FaBoxOpen,
  FaCheckCircle,
} from "react-icons/fa";

/* =========================================================
   PRODUCT DETAILS
========================================================= */

function ProductDetails() {
  const navigate = useNavigate();

  const { id } = useParams();

  /* =========================================================
     PRODUCT
  ========================================================= */

  const [product, setProduct] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  /* =========================================================
     CART
  ========================================================= */

  const [cart, setCart] = useState(() => {
    try {
      const savedCart =
        localStorage.getItem(
          "vetClinicStoreCart"
        );

      return savedCart
        ? JSON.parse(savedCart)
        : [];
    } catch {
      return [];
    }
  });

  /* =========================================================
     ADDED MESSAGE
  ========================================================= */

  const [added, setAdded] =
    useState(false);

  /* =========================================================
     LOAD PRODUCT
  ========================================================= */

  useEffect(() => {
    const loadProduct = () => {
      try {
        const savedProducts =
          localStorage.getItem(
            "vetClinicProducts"
          );

        if (!savedProducts) {
          setProduct(null);
          setLoading(false);
          return;
        }

        const parsedProducts =
          JSON.parse(savedProducts);

        if (
          !Array.isArray(
            parsedProducts
          )
        ) {
          setProduct(null);
          setLoading(false);
          return;
        }

        const foundProduct =
          parsedProducts.find(
            (item) =>
              String(item.id) ===
                String(id) &&
              item.showOnStore === true
          );

        setProduct(
          foundProduct || null
        );

        setLoading(false);
      } catch (error) {
        console.error(
          "Could not load product:",
          error
        );

        setProduct(null);
        setLoading(false);
      }
    };

    const handleProductsUpdated = () => {
      loadProduct();
    };

    loadProduct();

    window.addEventListener(
      "vetClinicProductsUpdated",
      handleProductsUpdated
    );

    window.addEventListener(
      "storage",
      handleProductsUpdated
    );

    return () => {
      window.removeEventListener(
        "vetClinicProductsUpdated",
        handleProductsUpdated
      );

      window.removeEventListener(
        "storage",
        handleProductsUpdated
      );
    };
  }, [id]);

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
     VALUES
  ========================================================= */

  const stock = product
    ? Number(product.quantity) || 0
    : 0;

  const price = product
    ? Number(
        product.sellingPrice
      ) || 0
    : 0;

  /* =========================================================
     ADD TO CART
  ========================================================= */

  const addToCart = () => {
    if (!product || stock <= 0) {
      return;
    }

    setCart((currentCart) => {
      const existingItem =
        currentCart.find(
          (item) =>
            String(item.id) ===
            String(product.id)
        );

      if (existingItem) {
        if (
          Number(
            existingItem.quantity
          ) >= stock
        ) {
          return currentCart;
        }

        return currentCart.map(
          (item) =>
            String(item.id) ===
            String(product.id)
              ? {
                  ...item,

                  quantity:
                    Number(
                      item.quantity
                    ) + 1,

                  price,

                  stock,
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

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1800);
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="product-details-page">
        <StoreHeader />

        <div
          style={{
            minHeight: "500px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#728197",
            fontFamily:
              "Arial, Helvetica, sans-serif",
          }}
        >
          Loading product...
        </div>
      </div>
    );
  }

  /* =========================================================
     PRODUCT NOT FOUND
  ========================================================= */

  if (!product) {
    return (
      <div className="product-details-page">
        <StoreHeader />

        <style>{`
          .product-not-found {
            width: min(700px, 92%);
            min-height: 500px;

            margin: 0 auto;

            display: flex;
            flex-direction: column;

            align-items: center;
            justify-content: center;

            text-align: center;

            font-family:
              Arial,
              Helvetica,
              sans-serif;
          }

          .product-not-found svg {
            margin-bottom: 18px;

            color: #7bc9c5;

            font-size: 60px;
          }

          .product-not-found h2 {
            margin: 0 0 8px;

            color: #263b4f;

            font-size: 26px;
          }

          .product-not-found p {
            margin: 0 0 22px;

            color: #728197;

            font-size: 13px;
          }

          .product-not-found button {
            height: 42px;

            padding: 0 20px;

            border: none;

            border-radius: 10px;

            background: #1aa6a6;

            color: white;

            font-weight: 800;

            cursor: pointer;
          }

          .product-not-found button:hover {
            background: #11797b;
          }
        `}</style>

        <div className="product-not-found">
          <FaBoxOpen />

          <h2>
            Product not found
          </h2>

          <p>
            This product may no longer be
            available in the store.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/products")
            }
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <div className="product-details-page">

      <StoreHeader />

      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        button {
          font: inherit;
        }

        .product-details-page {
          --teal: #1aa6a6;
          --teal-dark: #11797b;
          --teal-light: #e8f7f7;
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
           CONTAINER
        ========================================== */

        .product-details-container {
          width: min(1250px, 92%);

          margin: 0 auto;

          padding:
            35px 0
            80px;
        }

        /* ==========================================
           BACK BUTTON
        ========================================== */

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

          font-size: 12px;

          font-weight: 800;

          cursor: pointer;
        }

        .product-details-back:hover {
          color: var(--teal);
        }

        /* ==========================================
           CARD
        ========================================== */

        .product-details-card {
          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            minmax(0, 1fr);

          overflow: hidden;

          border:
            1px solid
            var(--border);

          border-radius: 24px;

          background: white;

          box-shadow:
            0 15px 45px
            rgba(
              17,
              121,
              123,
              0.07
            );
        }

        /* ==========================================
           IMAGE
        ========================================== */

        .product-details-image-area {
          min-height: 560px;

          display: flex;

          align-items: center;

          justify-content: center;

          overflow: hidden;

          background:
            linear-gradient(
              135deg,
              #f2fbfa,
              #e5f6f5
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
          color: #75d2ce;

          font-size: 100px;
        }

        /* ==========================================
           CONTENT
        ========================================== */

        .product-details-content {
          padding:
            55px 50px;

          display: flex;

          flex-direction: column;

          justify-content: center;
        }

        .product-details-category {
          width: fit-content;

          margin-bottom: 14px;

          padding:
            7px 11px;

          border-radius: 30px;

          background:
            var(--teal-light);

          color:
            var(--teal-dark);

          font-size: 10px;

          font-weight: 900;

          text-transform: uppercase;

          letter-spacing: 0.6px;
        }

        .product-details-name {
          margin:
            0 0 15px;

          color:
            var(--text);

          font-size:
            clamp(
              30px,
              4vw,
              46px
            );

          line-height: 1.1;

          letter-spacing:
            -1px;
        }

        /* ==========================================
           PRICE
        ========================================== */

        .product-details-price {
          margin-bottom: 20px;

          color:
            var(--teal-dark);

          font-size: 29px;

          font-weight: 900;
        }

        /* ==========================================
           STOCK
        ========================================== */

        .product-details-stock {
          width: fit-content;

          margin-bottom: 28px;

          padding:
            7px 12px;

          border-radius: 30px;

          background:
            #eaf9f3;

          color:
            #21865d;

          font-size: 11px;

          font-weight: 800;
        }

        .product-details-stock.low {
          background:
            #fff6e5;

          color:
            #b7791f;
        }

        .product-details-stock.out {
          background:
            #fff0f0;

          color:
            #d92d20;
        }

        /* ==========================================
           DESCRIPTION
        ========================================== */

        .product-details-description-title {
          margin:
            0 0 8px;

          color:
            var(--text);

          font-size: 14px;

          font-weight: 900;
        }

        .product-details-description {
          margin:
            0 0 30px;

          color:
            var(--muted);

          font-size: 13px;

          line-height: 1.8;

          white-space: pre-line;
        }

        .product-details-no-description {
          font-style: italic;

          color: #9aa5b3;
        }

        /* ==========================================
           INFO
        ========================================== */

        .product-details-info {
          margin-bottom: 30px;

          border-top:
            1px solid
            #edf2f2;

          border-bottom:
            1px solid
            #edf2f2;
        }

        .product-details-info-row {
          min-height: 47px;

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 20px;

          border-bottom:
            1px solid
            #edf2f2;
        }

        .product-details-info-row:last-child {
          border-bottom: none;
        }

        .product-details-info-label {
          color: #8290a3;

          font-size: 11px;

          font-weight: 700;
        }

        .product-details-info-value {
          color:
            var(--text);

          font-size: 11px;

          font-weight: 800;

          text-align: right;
        }

        /* ==========================================
           ADD TO CART
        ========================================== */

        .product-details-actions {
          display: flex;

          align-items: center;

          gap: 12px;
        }

        .product-details-cart {
          min-width: 170px;

          height: 48px;

          padding:
            0 20px;

          border: none;

          border-radius: 11px;

          background:
            var(--teal);

          color: white;

          display: inline-flex;

          align-items: center;

          justify-content: center;

          gap: 9px;

          font-size: 12px;

          font-weight: 900;

          cursor: pointer;

          transition:
            background 0.2s ease,
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .product-details-cart:hover:not(:disabled) {
          background:
            var(--teal-dark);

          transform:
            translateY(-2px);

          box-shadow:
            0 8px 20px
            rgba(
              17,
              121,
              123,
              0.18
            );
        }

        .product-details-cart:disabled {
          background: #d5dddd;

          color: #8b9898;

          cursor: not-allowed;
        }

        /* ==========================================
           ADDED
        ========================================== */

        .product-added-message {
          min-height: 48px;

          padding:
            0 14px;

          display: flex;

          align-items: center;

          gap: 7px;

          border-radius: 10px;

          background:
            #eaf9f3;

          color:
            #21865d;

          font-size: 11px;

          font-weight: 800;
        }

        /* ==========================================
           RESPONSIVE
        ========================================== */

        @media (max-width: 900px) {
          .product-details-card {
            grid-template-columns:
              1fr;
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
            padding:
              35px 25px;
          }

          .product-details-image-area {
            min-height: 330px;
          }

          .product-details-image {
            min-height: 330px;
          }

          .product-details-actions {
            align-items:
              stretch;

            flex-direction:
              column;
          }

          .product-details-cart {
            width: 100%;
          }

          .product-added-message {
            justify-content:
              center;
          }
        }
      `}</style>

      <main className="product-details-container">

        {/* BACK */}

        <button
          type="button"
          className="product-details-back"
          onClick={() =>
            navigate("/products")
          }
        >
          <FaArrowLeft />

          Back to Products
        </button>

        {/* PRODUCT */}

        <div className="product-details-card">

          {/* IMAGE */}

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

          {/* CONTENT */}

          <div className="product-details-content">

            <div className="product-details-category">
              {product.category ||
                "Uncategorized"}
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

            {/* DESCRIPTION */}

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

            {/* PRODUCT INFO */}

            <div className="product-details-info">

              <div className="product-details-info-row">

                <span className="product-details-info-label">
                  Category
                </span>

                <span className="product-details-info-value">
                  {product.category ||
                    "Uncategorized"}
                </span>

              </div>

              <div className="product-details-info-row">

                <span className="product-details-info-label">
                  Availability
                </span>

                <span className="product-details-info-value">
                  {stock > 0
                    ? "Available"
                    : "Unavailable"}
                </span>

              </div>

              <div className="product-details-info-row">

                <span className="product-details-info-label">
                  Stock
                </span>

                <span className="product-details-info-value">
                  {stock} item
                  {stock !== 1
                    ? "s"
                    : ""}
                </span>

              </div>

            </div>

            {/* ACTION */}

            <div className="product-details-actions">

              <button
                type="button"
                className="product-details-cart"
                onClick={addToCart}
                disabled={stock <= 0}
              >
                <FaCartPlus />

                {stock > 0
                  ? "Add to Cart"
                  : "Out of Stock"}
              </button>

              {added && (
                <div className="product-added-message">
                  <FaCheckCircle />

                  Added to cart
                </div>
              )}

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default ProductDetails;