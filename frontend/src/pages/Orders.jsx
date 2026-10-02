import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaBoxOpen,
  FaCheckCircle,
  FaClock,
  FaPaw,
  FaShoppingBag,
  FaTruck,
  FaStore,
  FaChevronDown,
  FaChevronUp,
  FaReceipt,
  FaCalendarAlt,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";

function Orders() {
  const navigate = useNavigate();

  // =========================================
  // LOAD ORDERS
  // =========================================

  const [orders] = useState(() => {
    try {
      const savedOrders = localStorage.getItem(
        "vetClinicStoreOrders"
      );

      return savedOrders
        ? JSON.parse(savedOrders)
        : [];
    } catch {
      return [];
    }
  });

  const [filter, setFilter] = useState("All");

  const [expandedOrder, setExpandedOrder] =
    useState(null);

  // =========================================
  // FILTER
  // =========================================

  const filteredOrders = useMemo(() => {
    if (filter === "All") {
      return orders;
    }

    return orders.filter(
      (order) => order.status === filter
    );
  }, [orders, filter]);

  // =========================================
  // DATE
  // =========================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    return parsedDate.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatTime = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    return parsedDate.toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =========================================
  // STATUS
  // =========================================

  const getStatusClass = (status) => {
    switch (status) {
      case "Confirmed":
        return "status-confirmed";

      case "Preparing":
        return "status-preparing";

      case "Completed":
        return "status-completed";

      case "Cancelled":
        return "status-cancelled";

      default:
        return "status-pending";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Confirmed":
        return <FaCheckCircle />;

      case "Preparing":
        return <FaBoxOpen />;

      case "Completed":
        return <FaCheckCircle />;

      case "Cancelled":
        return <FaBoxOpen />;

      default:
        return <FaClock />;
    }
  };

  // =========================================
  // EMPTY ORDERS
  // =========================================

  if (orders.length === 0) {
    return (
      <div className="orders-page">
        <style>{styles}</style>

        {/* HEADER */}

        <header className="orders-header">
          <div
            className="orders-logo"
            onClick={() => navigate("/store")}
          >
            <FaPaw />

            <span>
              Vet <b>Clinic</b>
            </span>
          </div>

          <button
            type="button"
            className="orders-store-button"
            onClick={() => navigate("/store")}
          >
            <FaShoppingBag />

            Store
          </button>
        </header>

        {/* EMPTY */}

        <main className="orders-empty-wrapper">
          <div className="orders-empty-card">
            <div className="orders-empty-icon">
              <FaBoxOpen />
            </div>

            <h1>No orders yet</h1>

            <p>
              You haven't placed any orders yet.
              Browse our store and find products
              for your pet.
            </p>

            <button
              type="button"
              className="orders-primary-button"
              onClick={() => navigate("/store")}
            >
              <FaShoppingBag />

              Start Shopping
            </button>
          </div>
        </main>
      </div>
    );
  }

  // =========================================
  // PAGE
  // =========================================

  return (
    <div className="orders-page">
      <style>{styles}</style>

      {/* =====================================
          HEADER
      ====================================== */}

      <header className="orders-header">
        <div
          className="orders-logo"
          onClick={() => navigate("/store")}
        >
          <FaPaw />

          <span>
            Vet <b>Clinic</b>
          </span>
        </div>

        <button
          type="button"
          className="orders-store-button"
          onClick={() => navigate("/store")}
        >
          <FaShoppingBag />

          Store
        </button>
      </header>

      {/* =====================================
          CONTENT
      ====================================== */}

      <main className="orders-container">
        <button
          type="button"
          className="orders-back"
          onClick={() => navigate("/store")}
        >
          <FaArrowLeft />

          Back to Store
        </button>

        {/* =================================
            TITLE
        ================================== */}

        <div className="orders-title">
          <div>
            <h1>My Orders</h1>

            <p>
              Track and review your store
              purchases.
            </p>
          </div>

          <div className="orders-count">
            <FaBoxOpen />

            <div>
              <strong>{orders.length}</strong>

              <span>
                {orders.length === 1
                  ? "Order"
                  : "Orders"}
              </span>
            </div>
          </div>
        </div>

        {/* =================================
            FILTERS
        ================================== */}

        <div className="orders-filters">
          {[
            "All",
            "Pending",
            "Confirmed",
            "Preparing",
            "Completed",
            "Cancelled",
          ].map((status) => (
            <button
              type="button"
              key={status}
              className={
                filter === status
                  ? "active"
                  : ""
              }
              onClick={() =>
                setFilter(status)
              }
            >
              {status}
            </button>
          ))}
        </div>

        {/* =================================
            NO FILTER RESULTS
        ================================== */}

        {filteredOrders.length === 0 ? (
          <div className="orders-no-results">
            <FaBoxOpen />

            <h2>No {filter} orders</h2>

            <p>
              There are no orders with this
              status.
            </p>
          </div>
        ) : (
          /* =================================
             ORDERS LIST
          ================================== */

          <div className="orders-list">
            {filteredOrders.map((order) => {
              const isExpanded =
                expandedOrder === order.id;

              const itemCount =
                order.items?.reduce(
                  (total, item) =>
                    total +
                    (item.quantity || 0),
                  0
                ) || 0;

              return (
                <article
                  className="order-card"
                  key={order.id}
                >
                  {/* =========================
                      ORDER TOP
                  ========================== */}

                  <div className="order-top">
                    <div className="order-number">
                      <div className="order-number-icon">
                        <FaReceipt />
                      </div>

                      <div>
                        <span>
                          Order
                        </span>

                        <h2>
                          #{order.id}
                        </h2>
                      </div>
                    </div>

                    <div
                      className={`order-status ${getStatusClass(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(
                        order.status
                      )}

                      {order.status ||
                        "Pending"}
                    </div>
                  </div>

                  {/* =========================
                      ORDER SUMMARY
                  ========================== */}

                  <div className="order-summary-grid">
                    <div className="order-summary-box">
                      <FaCalendarAlt />

                      <div>
                        <span>
                          Order Date
                        </span>

                        <strong>
                          {formatDate(
                            order.date
                          )}
                        </strong>

                        <small>
                          {formatTime(
                            order.date
                          )}
                        </small>
                      </div>
                    </div>

                    <div className="order-summary-box">
                      {order.deliveryMethod ===
                      "pickup" ? (
                        <FaStore />
                      ) : (
                        <FaTruck />
                      )}

                      <div>
                        <span>
                          Delivery
                        </span>

                        <strong>
                          {order.deliveryMethod ===
                          "pickup"
                            ? "Clinic Pickup"
                            : "Home Delivery"}
                        </strong>
                      </div>
                    </div>

                    <div className="order-summary-box">
                      <FaShoppingBag />

                      <div>
                        <span>
                          Products
                        </span>

                        <strong>
                          {itemCount}{" "}
                          {itemCount === 1
                            ? "Item"
                            : "Items"}
                        </strong>
                      </div>
                    </div>

                    <div className="order-summary-box total">
                      <span>Total</span>

                      <strong>
                        $
                        {Number(
                          order.total || 0
                        ).toFixed(2)}
                      </strong>
                    </div>
                  </div>

                  {/* =========================
                      PREVIEW PRODUCTS
                  ========================== */}

                  <div className="order-products-preview">
                    {order.items
                      ?.slice(0, 4)
                      .map((item) => (
                        <div
                          className="order-preview-product"
                          key={item.id}
                        >
                          <div className="order-preview-image">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={
                                  item.name
                                }
                              />
                            ) : (
                              <FaPaw />
                            )}

                            <span>
                              {
                                item.quantity
                              }
                            </span>
                          </div>

                          <div>
                            <strong>
                              {item.name}
                            </strong>

                            <span>
                              $
                              {Number(
                                item.price
                              ).toFixed(
                                2
                              )}
                            </span>
                          </div>
                        </div>
                      ))}

                    {order.items?.length >
                      4 && (
                      <div className="order-more-products">
                        +
                        {order.items.length -
                          4}{" "}
                        more
                      </div>
                    )}
                  </div>

                  {/* =========================
                      VIEW DETAILS
                  ========================== */}

                  <button
                    type="button"
                    className="order-details-button"
                    onClick={() =>
                      setExpandedOrder(
                        isExpanded
                          ? null
                          : order.id
                      )
                    }
                  >
                    <span>
                      {isExpanded
                        ? "Hide order details"
                        : "View order details"}
                    </span>

                    {isExpanded ? (
                      <FaChevronUp />
                    ) : (
                      <FaChevronDown />
                    )}
                  </button>

                  {/* =========================
                      EXPANDED DETAILS
                  ========================== */}

                  {isExpanded && (
                    <div className="order-expanded">
                      {/* PRODUCTS */}

                      <div className="order-detail-section">
                        <h3>
                          Order Items
                        </h3>

                        <div className="order-items">
                          {order.items?.map(
                            (item) => (
                              <div
                                className="order-item-row"
                                key={
                                  item.id
                                }
                              >
                                <div className="order-item-image">
                                  {item.image ? (
                                    <img
                                      src={
                                        item.image
                                      }
                                      alt={
                                        item.name
                                      }
                                    />
                                  ) : (
                                    <FaPaw />
                                  )}
                                </div>

                                <div className="order-item-info">
                                  <strong>
                                    {
                                      item.name
                                    }
                                  </strong>

                                  <span>
                                    {
                                      item.category
                                    }
                                  </span>

                                  <small>
                                    $
                                    {Number(
                                      item.price
                                    ).toFixed(
                                      2
                                    )}{" "}
                                    ×{" "}
                                    {
                                      item.quantity
                                    }
                                  </small>
                                </div>

                                <b>
                                  $
                                  {(
                                    Number(
                                      item.price
                                    ) *
                                    Number(
                                      item.quantity
                                    )
                                  ).toFixed(
                                    2
                                  )}
                                </b>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* CUSTOMER */}

                      <div className="order-details-columns">
                        <div className="order-detail-section">
                          <h3>
                            Customer
                          </h3>

                          <div className="order-info-line">
                            <strong>
                              Name
                            </strong>

                            <span>
                              {order
                                .customer
                                ?.fullName ||
                                "-"}
                            </span>
                          </div>

                          <div className="order-info-line">
                            <strong>
                              <FaPhone />
                              Phone
                            </strong>

                            <span>
                              {order
                                .customer
                                ?.phone ||
                                "-"}
                            </span>
                          </div>
                        </div>

                        {/* DELIVERY */}

                        <div className="order-detail-section">
                          <h3>
                            Delivery
                          </h3>

                          <div className="order-info-line">
                            <strong>
                              Method
                            </strong>

                            <span>
                              {order.deliveryMethod ===
                              "pickup"
                                ? "Clinic Pickup"
                                : "Home Delivery"}
                            </span>
                          </div>

                          <div className="order-info-line">
                            <strong>
                              <FaMapMarkerAlt />
                              Address
                            </strong>

                            <span>
                              {order.address ||
                                "-"}
                            </span>
                          </div>

                          {order.addressDetails && (
                            <div className="order-info-line">
                              <strong>
                                Details
                              </strong>

                              <span>
                                {
                                  order.addressDetails
                                }
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* NOTES */}

                      {order.notes && (
                        <div className="order-detail-section">
                          <h3>
                            Order Notes
                          </h3>

                          <div className="order-notes">
                            {order.notes}
                          </div>
                        </div>
                      )}

                      {/* TOTALS */}

                      <div className="order-total-section">
                        <div>
                          <span>
                            Subtotal
                          </span>

                          <strong>
                            $
                            {Number(
                              order.subtotal ||
                                0
                            ).toFixed(
                              2
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Delivery
                          </span>

                          <strong>
                            {Number(
                              order.deliveryFee ||
                                0
                            ) === 0
                              ? "Free"
                              : `$${Number(
                                  order.deliveryFee
                                ).toFixed(
                                  2
                                )}`}
                          </strong>
                        </div>

                        <div className="order-final-total">
                          <span>
                            Total
                          </span>

                          <strong>
                            $
                            {Number(
                              order.total || 0
                            ).toFixed(
                              2
                            )}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

// =========================================
// CSS
// =========================================

const styles = `
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
  }

  .orders-page {
    min-height: 100vh;

    background: #f7faf9;
    color: #344054;

    font-family: Arial, Helvetica, sans-serif;
  }

  /* ========================================
     HEADER
  ======================================== */

  .orders-header {
    height: 70px;

    padding: 0 5%;

    background: #ffffff;

    border-bottom: 1px solid #e5eceb;

    display: flex;
    align-items: center;
    justify-content: space-between;

    position: sticky;

    top: 0;

    z-index: 100;
  }

  .orders-logo {
    display: flex;
    align-items: center;

    gap: 9px;

    color: #176d6a;

    font-size: 19px;
    font-weight: 800;

    cursor: pointer;
  }

  .orders-logo svg {
    color: #159f9f;

    font-size: 25px;
  }

  .orders-logo b {
    color: #159f9f;
  }

  .orders-store-button {
    height: 38px;

    padding: 0 14px;

    border: 1px solid #dfe8e7;

    border-radius: 7px;

    background: #ffffff;

    color: #475467;

    display: flex;
    align-items: center;

    gap: 7px;

    font-size: 10px;

    font-weight: 700;

    cursor: pointer;
  }

  .orders-store-button:hover {
    color: #159f9f;

    border-color: #159f9f;
  }

  /* ========================================
     CONTAINER
  ======================================== */

  .orders-container {
    width: min(1100px, 92%);

    margin: auto;

    padding: 28px 0 60px;
  }

  .orders-back {
    padding: 0;

    margin-bottom: 25px;

    border: 0;

    background: transparent;

    color: #667085;

    display: flex;
    align-items: center;

    gap: 8px;

    font-size: 10px;

    font-weight: 600;

    cursor: pointer;
  }

  .orders-back:hover {
    color: #159f9f;
  }

  /* ========================================
     TITLE
  ======================================== */

  .orders-title {
    margin-bottom: 22px;

    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .orders-title h1 {
    margin: 0;

    color: #27364a;

    font-size: 28px;
  }

  .orders-title p {
    margin: 6px 0 0;

    color: #98a2b3;

    font-size: 10px;
  }

  .orders-count {
    min-width: 110px;

    padding: 11px 14px;

    border: 1px solid #dfe8e7;

    border-radius: 9px;

    background: #ffffff;

    display: flex;
    align-items: center;

    gap: 10px;
  }

  .orders-count > svg {
    color: #159f9f;

    font-size: 18px;
  }

  .orders-count strong {
    display: block;

    color: #344054;

    font-size: 13px;
  }

  .orders-count span {
    display: block;

    margin-top: 2px;

    color: #98a2b3;

    font-size: 8px;
  }

  /* ========================================
     FILTERS
  ======================================== */

  .orders-filters {
    margin-bottom: 20px;

    padding: 5px;

    border: 1px solid #e2e9e8;

    border-radius: 9px;

    background: #ffffff;

    display: flex;

    gap: 4px;

    overflow-x: auto;
  }

  .orders-filters button {
    min-width: 80px;

    padding: 9px 13px;

    border: 0;

    border-radius: 6px;

    background: transparent;

    color: #667085;

    font-size: 9px;

    font-weight: 600;

    cursor: pointer;

    white-space: nowrap;
  }

  .orders-filters button:hover {
    background: #f2f8f7;
  }

  .orders-filters button.active {
    background: #159f9f;

    color: #ffffff;
  }

  /* ========================================
     ORDER CARD
  ======================================== */

  .orders-list {
    display: flex;

    flex-direction: column;

    gap: 15px;
  }

  .order-card {
    border: 1px solid #e0e8e7;

    border-radius: 12px;

    background: #ffffff;

    overflow: hidden;
  }

  .order-top {
    padding: 17px 20px;

    border-bottom: 1px solid #edf1f1;

    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .order-number {
    display: flex;
    align-items: center;

    gap: 10px;
  }

  .order-number-icon {
    width: 35px;
    height: 35px;

    border-radius: 8px;

    background: #e9f8f6;

    color: #159f9f;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 12px;
  }

  .order-number span {
    display: block;

    color: #98a2b3;

    font-size: 8px;
  }

  .order-number h2 {
    margin: 3px 0 0;

    color: #344054;

    font-size: 12px;
  }

  /* ========================================
     STATUS
  ======================================== */

  .order-status {
    padding: 6px 10px;

    border-radius: 20px;

    display: flex;
    align-items: center;

    gap: 5px;

    font-size: 8px;

    font-weight: 700;
  }

  .status-pending {
    background: #fff7e8;

    color: #b26a00;
  }

  .status-confirmed {
    background: #eaf8f7;

    color: #168d88;
  }

  .status-preparing {
    background: #eef4ff;

    color: #4169a8;
  }

  .status-completed {
    background: #eaf8ee;

    color: #2e8b57;
  }

  .status-cancelled {
    background: #fff0ef;

    color: #d92d20;
  }

  /* ========================================
     SUMMARY
  ======================================== */

  .order-summary-grid {
    padding: 16px 20px;

    display: grid;

    grid-template-columns:
      repeat(3, 1fr) 140px;

    gap: 10px;
  }

  .order-summary-box {
    min-height: 62px;

    padding: 10px 12px;

    border: 1px solid #edf1f1;

    border-radius: 8px;

    display: flex;
    align-items: center;

    gap: 9px;
  }

  .order-summary-box > svg {
    color: #159f9f;

    font-size: 13px;
  }

  .order-summary-box span {
    display: block;

    color: #98a2b3;

    font-size: 7px;
  }

  .order-summary-box strong {
    display: block;

    margin-top: 3px;

    color: #344054;

    font-size: 9px;
  }

  .order-summary-box small {
    display: block;

    margin-top: 2px;

    color: #98a2b3;

    font-size: 7px;
  }

  .order-summary-box.total {
    background: #f3fbfa;

    border-color: #d4eeeb;

    display: flex;

    flex-direction: column;

    align-items: flex-end;

    justify-content: center;
  }

  .order-summary-box.total strong {
    color: #159f9f;

    font-size: 17px;
  }

  /* ========================================
     PRODUCT PREVIEW
  ======================================== */

  .order-products-preview {
    padding: 0 20px 16px;

    display: flex;
    align-items: center;

    gap: 12px;

    flex-wrap: wrap;
  }

  .order-preview-product {
    display: flex;
    align-items: center;

    gap: 7px;
  }

  .order-preview-image {
    width: 38px;
    height: 38px;

    border-radius: 7px;

    background: #f3f7f6;

    color: #9fb7b4;

    display: flex;
    align-items: center;
    justify-content: center;

    position: relative;

    overflow: visible;
  }

  .order-preview-image img {
    width: 100%;
    height: 100%;

    border-radius: 7px;

    object-fit: cover;
  }

  .order-preview-image span {
    width: 15px;
    height: 15px;

    position: absolute;

    top: -5px;
    right: -5px;

    border-radius: 50%;

    background: #159f9f;

    color: #ffffff;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 6px;

    font-weight: 700;
  }

  .order-preview-product strong {
    display: block;

    max-width: 100px;

    color: #344054;

    font-size: 8px;

    overflow: hidden;

    text-overflow: ellipsis;

    white-space: nowrap;
  }

  .order-preview-product > div:last-child span {
    display: block;

    margin-top: 3px;

    color: #98a2b3;

    font-size: 7px;
  }

  .order-more-products {
    padding: 7px 9px;

    border-radius: 6px;

    background: #f4f7f7;

    color: #667085;

    font-size: 8px;
  }

  /* ========================================
     DETAILS BUTTON
  ======================================== */

  .order-details-button {
    width: 100%;

    padding: 12px 20px;

    border: 0;

    border-top: 1px solid #edf1f1;

    background: #fbfcfc;

    color: #667085;

    display: flex;
    align-items: center;
    justify-content: space-between;

    font-size: 9px;

    font-weight: 700;

    cursor: pointer;
  }

  .order-details-button:hover {
    background: #f2f9f8;

    color: #159f9f;
  }

  /* ========================================
     EXPANDED
  ======================================== */

  .order-expanded {
    padding: 20px;

    border-top: 1px solid #edf1f1;

    background: #fcfdfd;
  }

  .order-detail-section {
    margin-bottom: 18px;

    padding: 15px;

    border: 1px solid #e5eceb;

    border-radius: 9px;

    background: #ffffff;
  }

  .order-detail-section h3 {
    margin: 0 0 13px;

    color: #344054;

    font-size: 11px;
  }

  .order-items {
    display: flex;

    flex-direction: column;
  }

  .order-item-row {
    padding: 10px 0;

    border-bottom: 1px solid #edf1f1;

    display: grid;

    grid-template-columns: 48px 1fr auto;

    gap: 10px;

    align-items: center;
  }

  .order-item-row:last-child {
    border-bottom: 0;
  }

  .order-item-image {
    width: 48px;
    height: 48px;

    border-radius: 7px;

    background: #f3f7f6;

    color: #9fb7b4;

    display: flex;
    align-items: center;
    justify-content: center;

    overflow: hidden;
  }

  .order-item-image img {
    width: 100%;
    height: 100%;

    object-fit: cover;
  }

  .order-item-info strong {
    display: block;

    color: #344054;

    font-size: 9px;
  }

  .order-item-info span {
    display: block;

    margin-top: 3px;

    color: #98a2b3;

    font-size: 7px;
  }

  .order-item-info small {
    display: block;

    margin-top: 5px;

    color: #667085;

    font-size: 8px;
  }

  .order-item-row > b {
    color: #344054;

    font-size: 10px;
  }

  /* ========================================
     INFO
  ======================================== */

  .order-details-columns {
    display: grid;

    grid-template-columns: 1fr 1fr;

    gap: 12px;
  }

  .order-info-line {
    padding: 8px 0;

    border-bottom: 1px solid #edf1f1;

    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    gap: 15px;

    font-size: 8px;
  }

  .order-info-line:last-child {
    border-bottom: 0;
  }

  .order-info-line strong {
    color: #667085;

    display: flex;
    align-items: center;

    gap: 5px;
  }

  .order-info-line strong svg {
    color: #159f9f;
  }

  .order-info-line span {
    color: #344054;

    text-align: right;
  }

  .order-notes {
    padding: 11px;

    border-radius: 6px;

    background: #f7faf9;

    color: #667085;

    font-size: 8px;

    line-height: 1.6;
  }

  /* ========================================
     TOTAL
  ======================================== */

  .order-total-section {
    width: min(330px, 100%);

    margin-left: auto;

    padding: 15px;

    border: 1px solid #dfe8e7;

    border-radius: 9px;

    background: #ffffff;
  }

  .order-total-section > div {
    padding: 7px 0;

    display: flex;
    align-items: center;
    justify-content: space-between;

    color: #667085;

    font-size: 9px;
  }

  .order-total-section strong {
    color: #344054;
  }

  .order-total-section .order-final-total {
    margin-top: 5px;

    padding-top: 12px;

    border-top: 1px solid #e5eceb;

    color: #344054;

    font-weight: 700;
  }

  .order-final-total strong {
    color: #159f9f;

    font-size: 16px;
  }

  /* ========================================
     EMPTY
  ======================================== */

  .orders-empty-wrapper {
    min-height: calc(100vh - 70px);

    padding: 30px;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  .orders-empty-card,
  .orders-no-results {
    width: min(440px, 100%);

    padding: 40px;

    border: 1px solid #e0e8e7;

    border-radius: 13px;

    background: #ffffff;

    text-align: center;
  }

  .orders-empty-icon {
    width: 70px;
    height: 70px;

    margin: auto auto 18px;

    border-radius: 50%;

    background: #eaf8f7;

    color: #159f9f;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 26px;
  }

  .orders-empty-card h1,
  .orders-no-results h2 {
    margin: 0;

    color: #344054;

    font-size: 20px;
  }

  .orders-empty-card p,
  .orders-no-results p {
    margin: 8px 0 20px;

    color: #98a2b3;

    font-size: 9px;

    line-height: 1.6;
  }

  .orders-primary-button {
    min-width: 150px;

    min-height: 41px;

    padding: 0 15px;

    border: 0;

    border-radius: 7px;

    background: #159f9f;

    color: #ffffff;

    display: inline-flex;
    align-items: center;
    justify-content: center;

    gap: 7px;

    font-size: 9px;

    font-weight: 700;

    cursor: pointer;
  }

  .orders-primary-button:hover {
    background: #118887;
  }

  .orders-no-results {
    width: 100%;

    margin-top: 10px;
  }

  .orders-no-results > svg {
    margin-bottom: 12px;

    color: #b5c7c5;

    font-size: 35px;
  }

  /* ========================================
     RESPONSIVE
  ======================================== */

  @media (max-width: 850px) {
    .order-summary-grid {
      grid-template-columns: 1fr 1fr;
    }

    .order-details-columns {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 550px) {
    .orders-title {
      align-items: flex-start;

      gap: 15px;
    }

    .orders-count {
      min-width: auto;
    }

    .order-summary-grid {
      grid-template-columns: 1fr;
    }

    .order-top {
      align-items: flex-start;

      gap: 10px;
    }

    .order-status {
      font-size: 7px;
    }
  }
`;

export default Orders;