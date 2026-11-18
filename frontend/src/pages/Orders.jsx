import { useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  useOutletContext,
} from "react-router-dom";

import { getCustomerOrder } from "../api/storeOrdersApi";
import { getPublicStoreSettings } from "../api/storeSettingsApi";

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

const DEFAULT_COLORS = {
  primaryColor: "#159f9f",
  secondaryColor: "#118887",
  lightColor: "#eaf8f7",
  borderColor: "#dfe8e7",
  backgroundColor: "#ffffff",
  textColor: "#344054",
  buttonColor: "#159f9f",
  buttonTextColor: "#ffffff",
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

  return {
    name:
      typeof data?.storeName === "string"
        ? data.storeName
        : "",
    logo:
      typeof data?.storeBanner === "string"
        ? data.storeBanner
        : "",
    colors,
  };
}

function readOrderReferences(key, clinicId) {
  const saved = localStorage.getItem(key);

  if (saved === null) return [];

  const parsed = JSON.parse(saved);

  if (!Array.isArray(parsed)) {
    throw new Error(
      "Your saved order tracking details could not be read."
    );
  }

  const references = new Map();

  for (const reference of parsed) {
    const id = Number(reference?.id);

    if (
      Number(reference?.clinicId) !== Number(clinicId) ||
      !Number.isSafeInteger(id) ||
      id <= 0 ||
      typeof reference?.trackingToken !== "string" ||
      !/^[a-fA-F0-9]{64}$/.test(reference.trackingToken)
    ) {
      throw new Error(
        "Some saved order tracking details are invalid."
      );
    }

    references.set(id, {
      id,
      trackingToken: reference.trackingToken,
    });
  }

  return [...references.values()];
}

function normalizeOrder(data) {
  if (
    !data ||
    !Number.isSafeInteger(Number(data.id)) ||
    Number(data.id) <= 0 ||
    !Array.isArray(data.items)
  ) {
    throw new Error(
      "The server returned invalid order information."
    );
  }

  return {
    ...data,
    id: Number(data.id),
    date: data.date ?? data.createdAt ?? "",
    status:
      typeof data.status === "string" && data.status.trim()
        ? data.status.trim()
        : "Pending",
    customer: {
      fullName:
        data.customerName ?? data.customer?.fullName ?? "",
      phone:
        data.customerPhone ?? data.customer?.phone ?? "",
    },
    items: data.items.map((item, index) => ({
      ...item,
      id: item.id ?? item.productId ?? index,
      name: item.productName ?? item.name ?? "",
      category: item.categoryName ?? item.category ?? "",
      image: item.image ?? "",
      price:
        item.unitPrice ?? item.price ?? item.sellingPrice ?? 0,
      quantity: Number(item.quantity) || 0,
    })),
  };
}

function Orders() {
  const navigate = useNavigate();
  const { clinicId, storeBasePath } = useOutletContext();

  const referencesKey =
    `vetClinicStoreOrderReferences:${clinicId}`;

  const [settingsState, setSettingsState] = useState(() => ({
    clinicId: String(clinicId),
    data: normalizeSettings(),
  }));

  const [ordersState, setOrdersState] = useState(() => ({
    clinicId: String(clinicId),
    items: [],
  }));

  const [loading, setLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [filter, setFilter] = useState("All");
  const [expandedOrder, setExpandedOrder] = useState(null);

  const settings =
    settingsState.clinicId === String(clinicId)
      ? settingsState.data
      : normalizeSettings();

  const orders = useMemo(
    () =>
      ordersState.clinicId === String(clinicId)
        ? ordersState.items
        : [],
    [ordersState, clinicId]
  );

  const branding = {
    name: settings.name,
    logo: settings.logo,
  };

  const colors = settings.colors;

  const ordersTheme = {
    "--orders-primary": colors.primaryColor,
    "--orders-secondary": colors.secondaryColor,
    "--orders-light": colors.lightColor,
    "--orders-border": colors.borderColor,
    "--orders-background": colors.backgroundColor,
    "--orders-text": colors.textColor,
    "--orders-button": colors.buttonColor,
    "--orders-button-text": colors.buttonTextColor,
  };

  useEffect(() => {
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

    setOrdersState({
      clinicId: String(clinicId),
      items: [],
    });
    setOrdersError("");
    setFilter("All");
    setExpandedOrder(null);
    window.scrollTo(0, 0);

    const loadOrders = async () => {
      controller?.abort();

      const currentController = new AbortController();
      controller = currentController;

      setLoading(true);

      try {
        const references = readOrderReferences(
          referencesKey,
          clinicId
        );

        const results = await Promise.allSettled(
          references.map(async (reference) => {
            const result = await getCustomerOrder(
              clinicId,
              reference.id,
              reference.trackingToken,
              { signal: currentController.signal }
            );

            if (
              Number(result?.id) !== reference.id ||
              (result?.clinicId != null &&
                Number(result.clinicId) !== Number(clinicId))
            ) {
              throw new Error(
                "The server returned unexpected order information."
              );
            }

            return normalizeOrder(result);
          })
        );

        if (
          disposed ||
          currentController.signal.aborted
        ) {
          return;
        }

        const loaded = [];
        let failedCount = 0;
        let firstError = "";

        for (const result of results) {
          if (result.status === "fulfilled") {
            loaded.push(result.value);
          } else {
            failedCount += 1;

            if (!firstError) {
              firstError =
                result.reason?.message ||
                "Unable to load an order.";
            }
          }
        }

        loaded.sort((a, b) => {
          const aDate = Date.parse(a.date) || 0;
          const bDate = Date.parse(b.date) || 0;

          return bDate - aDate || b.id - a.id;
        });

        setOrdersState({
          clinicId: String(clinicId),
          items: loaded,
        });

        setOrdersError(
          failedCount
            ? `${failedCount} order${
                failedCount === 1 ? "" : "s"
              } could not be loaded. ${firstError}`
            : ""
        );
      } catch (exception) {
        if (
          disposed ||
          currentController.signal.aborted
        ) {
          return;
        }

        setOrdersError(
          exception.message ||
            "Unable to load your orders."
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

    const handleStorage = (event) => {
      if (
        event.key === null ||
        event.key === referencesKey
      ) {
        loadOrders();
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadOrders();
      }
    };

    loadOrders();

    window.addEventListener(
      "vetClinicOrdersUpdated",
      loadOrders
    );
    window.addEventListener("focus", loadOrders);
    window.addEventListener("storage", handleStorage);

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      disposed = true;
      controller?.abort();

      window.removeEventListener(
        "vetClinicOrdersUpdated",
        loadOrders
      );
      window.removeEventListener("focus", loadOrders);
      window.removeEventListener("storage", handleStorage);

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [clinicId, referencesKey]);

  const statusFilters = useMemo(() => {
    const statuses = new Set([
      "Pending",
      "Confirmed",
      "Preparing",
      "Completed",
      "Cancelled",
    ]);

    orders.forEach((order) => {
      if (order.status) statuses.add(order.status);
    });

    return ["All", ...statuses];
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (filter === "All") return orders;

    return orders.filter(
      (order) => order.status === filter
    );
  }, [orders, filter]);

  const formatDate = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "-";

    return parsed.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "";

    return parsed.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusClass = (status) => {
    switch (String(status).toLowerCase()) {
      case "confirmed":
        return "status-confirmed";
      case "preparing":
        return "status-preparing";
      case "completed":
        return "status-completed";
      case "cancelled":
        return "status-cancelled";
      default:
        return "status-pending";
    }
  };

  const getStatusIcon = (status) => {
    switch (String(status).toLowerCase()) {
      case "confirmed":
      case "completed":
        return <FaCheckCircle />;
      case "preparing":
      case "cancelled":
        return <FaBoxOpen />;
      default:
        return <FaClock />;
    }
  };  return (
    <div className="orders-page" style={ordersTheme}>
      <style>{styles}</style>

      <main className="orders-container">
        <button
          type="button"
          className="orders-back"
          onClick={() => navigate(storeBasePath)}
        >
          <FaArrowLeft />
          Back to Store
        </button>

        {settingsError && (
          <div className="orders-feedback" role="alert">
            {settingsError}
          </div>
        )}

        {ordersError && (
          <div className="orders-feedback" role="alert">
            {ordersError}
          </div>
        )}

        {loading && orders.length === 0 ? (
          <div className="orders-loading" role="status">
            Loading your orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="orders-empty-wrapper">
            <div className="orders-empty-card">
              <div className="orders-empty-icon">
                <FaBoxOpen />
              </div>

              <h1>
                {ordersError
                  ? "Unable to load orders"
                  : "No orders yet"}
              </h1>

              <p>
                {ordersError
                  ? "Your saved tracking details have been kept. Return to this page to try again."
                  : "No orders are saved for this clinic in this browser. Browse our store and find products for your pet."}
              </p>

              <button
                type="button"
                className="orders-primary-button"
                onClick={() => navigate(storeBasePath)}
              >
                <FaShoppingBag />
                Start Shopping
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="orders-title">
              <div>
                <h1>My Orders</h1>
                <p>Track and review your store purchases.</p>
              </div>

              <div className="orders-count">
                <FaBoxOpen />
                <div>
                  <strong>{orders.length}</strong>
                  <span>
                    {orders.length === 1 ? "Order" : "Orders"}
                  </span>
                </div>
              </div>
            </div>

            <div className="orders-filters">
              {statusFilters.map((status) => (
                <button
                  type="button"
                  key={status}
                  className={filter === status ? "active" : ""}
                  onClick={() => setFilter(status)}
                >
                  {status}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="orders-no-results">
                <FaBoxOpen />
                <h2>No {filter} orders</h2>
                <p>There are no orders with this status.</p>
              </div>
            ) : (
              <div className="orders-list">
                {filteredOrders.map((order) => {
                  const isExpanded =
                    expandedOrder === order.id;

                  const itemCount = order.items.reduce(
                    (total, item) =>
                      total + Number(item.quantity || 0),
                    0
                  );

                  return (
                    <article
                      className="order-card"
                      key={order.id}
                    >
                      <div className="order-top">
                        <div className="order-number">
                          <div className="order-number-icon">
                            <FaReceipt />
                          </div>

                          <div>
                            <span>Order</span>
                            <h2>#{order.id}</h2>
                          </div>
                        </div>

                        <div
                          className={`order-status ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {getStatusIcon(order.status)}
                          {order.status || "Pending"}
                        </div>
                      </div>

                      <div className="order-summary-grid">
                        <div className="order-summary-box">
                          <FaCalendarAlt />
                          <div>
                            <span>Order Date</span>
                            <strong>
                              {formatDate(order.date)}
                            </strong>
                            <small>
                              {formatTime(order.date)}
                            </small>
                          </div>
                        </div>

                        <div className="order-summary-box">
                          {order.deliveryMethod === "pickup" ? (
                            <FaStore />
                          ) : (
                            <FaTruck />
                          )}

                          <div>
                            <span>Delivery</span>
                            <strong>
                              {order.deliveryMethod === "pickup"
                                ? "Clinic Pickup"
                                : "Home Delivery"}
                            </strong>
                          </div>
                        </div>

                        <div className="order-summary-box">
                          <FaShoppingBag />
                          <div>
                            <span>Products</span>
                            <strong>
                              {itemCount}{" "}
                              {itemCount === 1 ? "Item" : "Items"}
                            </strong>
                          </div>
                        </div>

                        <div className="order-summary-box total">
                          <span>Total</span>
                          <strong>
                            ${Number(order.total || 0).toFixed(2)}
                          </strong>
                        </div>
                      </div>

                      <div className="order-products-preview">
                        {order.items.slice(0, 4).map((item) => (
                          <div
                            className="order-preview-product"
                            key={item.id}
                          >
                            <div className="order-preview-image">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                />
                              ) : (
                                <FaPaw />
                              )}

                              <span>{item.quantity}</span>
                            </div>

                            <div>
                              <strong>{item.name}</strong>
                              <span>
                                ${Number(item.price || 0).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}

                        {order.items.length > 4 && (
                          <div className="order-more-products">
                            +{order.items.length - 4} more
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        className="order-details-button"
                        aria-expanded={isExpanded}
                        onClick={() =>
                          setExpandedOrder(
                            isExpanded ? null : order.id
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

                      {isExpanded && (
                        <div className="order-expanded">
                          <div className="order-detail-section">
                            <h3>Order Items</h3>

                            <div className="order-items">
                              {order.items.map((item) => (
                                <div
                                  className="order-item-row"
                                  key={item.id}
                                >
                                  <div className="order-item-image">
                                    {item.image ? (
                                      <img
                                        src={item.image}
                                        alt={item.name}
                                      />
                                    ) : (
                                      <FaPaw />
                                    )}
                                  </div>

                                  <div className="order-item-info">
                                    <strong>{item.name}</strong>
                                    <span>{item.category}</span>
                                    <small>
                                      $
                                      {Number(
                                        item.price || 0
                                      ).toFixed(2)}{" "}
                                      × {item.quantity}
                                    </small>
                                  </div>

                                  <b>
                                    $
                                    {(
                                      Number(item.price || 0) *
                                      Number(item.quantity || 0)
                                    ).toFixed(2)}
                                  </b>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="order-details-columns">
                            <div className="order-detail-section">
                              <h3>Customer</h3>

                              <div className="order-info-line">
                                <strong>Name</strong>
                                <span>
                                  {order.customer?.fullName || "-"}
                                </span>
                              </div>

                              <div className="order-info-line">
                                <strong>
                                  <FaPhone />
                                  Phone
                                </strong>
                                <span>
                                  {order.customer?.phone || "-"}
                                </span>
                              </div>
                            </div>

                            <div className="order-detail-section">
                              <h3>Delivery</h3>

                              <div className="order-info-line">
                                <strong>Method</strong>
                                <span>
                                  {order.deliveryMethod === "pickup"
                                    ? "Clinic Pickup"
                                    : "Home Delivery"}
                                </span>
                              </div>

                              <div className="order-info-line">
                                <strong>
                                  <FaMapMarkerAlt />
                                  Address
                                </strong>
                                <span>{order.address || "-"}</span>
                              </div>

                              {order.addressDetails && (
                                <div className="order-info-line">
                                  <strong>Details</strong>
                                  <span>{order.addressDetails}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {order.notes && (
                            <div className="order-detail-section">
                              <h3>Order Notes</h3>
                              <div className="order-notes">
                                {order.notes}
                              </div>
                            </div>
                          )}

                          <div className="order-total-section">
                            <div>
                              <span>Subtotal</span>
                              <strong>
                                $
                                {Number(
                                  order.subtotal || 0
                                ).toFixed(2)}
                              </strong>
                            </div>

                            <div>
                              <span>Delivery</span>
                              <strong>
                                {Number(order.deliveryFee || 0) === 0
                                  ? "Free"
                                  : `$${Number(
                                      order.deliveryFee
                                    ).toFixed(2)}`}
                              </strong>
                            </div>

                            <div className="order-final-total">
                              <span>Total</span>
                              <strong>
                                $
                                {Number(order.total || 0).toFixed(2)}
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
          </>
        )}
      </main>
    </div>
  );
}

const styles = `
.orders-page,.orders-page *{box-sizing:border-box}
.orders-page{min-height:100vh;background:var(--orders-background);color:var(--orders-text);font-family:Arial,Helvetica,sans-serif}
.orders-header{height:70px;padding:0 5%;background:var(--orders-background);border-bottom:1px solid var(--orders-border);display:flex;align-items:center;justify-content:space-between;gap:15px;position:sticky;top:0;z-index:100}
.orders-logo{display:flex;align-items:center;gap:9px;color:var(--orders-primary);font-size:19px;font-weight:800;cursor:pointer;min-width:0}
.orders-logo>span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.orders-logo svg{color:var(--orders-primary);font-size:25px}
.orders-logo .orders-brand-image{display:block;width:29px;height:29px;object-fit:contain;flex-shrink:0}
.orders-logo b{color:var(--orders-primary)}
.orders-store-button{width:fit-content!important;min-width:0!important;max-width:max-content;flex:0 0 auto!important;align-self:center;justify-content:center;white-space:nowrap;height:38px;padding:0 14px;border:1px solid var(--orders-border);border-radius:7px;background:var(--orders-background);color:var(--orders-text);display:flex;align-items:center;gap:7px;font-size:10px;font-weight:700;cursor:pointer}
.orders-store-button:hover{width:fit-content!important;background:var(--orders-light);transform:none;color:var(--orders-primary);border-color:var(--orders-primary)}
.orders-container{width:min(1100px,92%);margin:auto;padding:28px 0 60px}
.orders-back{padding:0;margin-bottom:25px;border:0;background:transparent;color:#667085;display:flex;align-items:center;gap:8px;font-size:10px;font-weight:600;cursor:pointer}
.orders-back:hover{color:var(--orders-primary)}
.orders-title{margin-bottom:22px;display:flex;align-items:center;justify-content:space-between}
.orders-title h1{margin:0;color:var(--orders-text);font-size:28px}
.orders-title p{margin:6px 0 0;color:#98a2b3;font-size:10px}
.orders-count{min-width:110px;padding:11px 14px;border:1px solid var(--orders-border);border-radius:9px;background:var(--orders-background);display:flex;align-items:center;gap:10px}
.orders-count>svg{color:var(--orders-primary);font-size:18px}
.orders-count strong{display:block;color:var(--orders-text);font-size:13px}
.orders-count span{display:block;margin-top:2px;color:#98a2b3;font-size:8px}
.orders-filters{margin-bottom:20px;padding:5px;border:1px solid var(--orders-border);border-radius:9px;background:var(--orders-background);display:flex;gap:4px;overflow-x:auto}
.orders-filters button{min-width:80px;padding:9px 13px;border:0;border-radius:6px;background:transparent;color:var(--orders-text);font-size:9px;font-weight:600;cursor:pointer;white-space:nowrap}
.orders-filters button:hover{background:var(--orders-light)}
.orders-filters button.active{background:var(--orders-primary);color:var(--orders-button-text)}
.orders-list{display:flex;flex-direction:column;gap:15px}
.order-card{border:1px solid var(--orders-border);border-radius:12px;background:var(--orders-background);overflow:hidden}
.order-top{padding:17px 20px;border-bottom:1px solid var(--orders-border);display:flex;align-items:center;justify-content:space-between}
.order-number{display:flex;align-items:center;gap:10px}
.order-number-icon{width:35px;height:35px;border-radius:8px;background:var(--orders-light);color:var(--orders-primary);display:flex;align-items:center;justify-content:center;font-size:12px}
.order-number span{display:block;color:#98a2b3;font-size:8px}
.order-number h2{margin:3px 0 0;color:var(--orders-text);font-size:12px}
.order-status{padding:6px 10px;border-radius:20px;display:flex;align-items:center;gap:5px;font-size:8px;font-weight:700}
.status-pending{background:#fff7e8;color:#b26a00}
.status-confirmed{background:#eaf8f7;color:#168d88}
.status-preparing{background:#eef4ff;color:#4169a8}
.status-completed{background:#eaf8ee;color:#2e8b57}
.status-cancelled{background:#fff0ef;color:#d92d20}
.order-summary-grid{padding:16px 20px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr)) 140px;gap:10px}
.order-summary-box{min-height:62px;padding:10px 12px;border:1px solid var(--orders-border);border-radius:8px;display:flex;align-items:center;gap:9px;min-width:0}
.order-summary-box>svg{color:var(--orders-primary);font-size:13px;flex-shrink:0}
.order-summary-box span{display:block;color:#98a2b3;font-size:7px}
.order-summary-box strong{display:block;margin-top:3px;color:var(--orders-text);font-size:9px}
.order-summary-box small{display:block;margin-top:2px;color:#98a2b3;font-size:7px}
.order-summary-box.total{background:var(--orders-light);border-color:var(--orders-border);display:flex;flex-direction:column;align-items:flex-end;justify-content:center}
.order-summary-box.total strong{color:var(--orders-primary);font-size:17px}
.order-products-preview{padding:0 20px 16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.order-preview-product{display:flex;align-items:center;gap:7px}
.order-preview-image{width:38px;height:38px;border-radius:7px;background:var(--orders-light);color:var(--orders-primary);display:flex;align-items:center;justify-content:center;position:relative;overflow:visible;flex-shrink:0}
.order-preview-image img{width:100%;height:100%;border-radius:7px;object-fit:cover}
.order-preview-image span{width:15px;height:15px;position:absolute;top:-5px;right:-5px;border-radius:50%;background:var(--orders-primary);color:var(--orders-button-text);display:flex;align-items:center;justify-content:center;font-size:6px;font-weight:700}
.order-preview-product strong{display:block;max-width:100px;color:var(--orders-text);font-size:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.order-preview-product>div:last-child span{display:block;margin-top:3px;color:#98a2b3;font-size:7px}
.order-more-products{padding:7px 9px;border-radius:6px;background:var(--orders-light);color:var(--orders-secondary);font-size:8px}
.order-details-button{width:100%;padding:12px 20px;border:0;border-top:1px solid var(--orders-border);background:var(--orders-background);color:var(--orders-text);display:flex;align-items:center;justify-content:space-between;font-size:9px;font-weight:700;cursor:pointer}
.order-details-button:hover{background:var(--orders-light);color:var(--orders-primary)}
.order-expanded{padding:20px;border-top:1px solid var(--orders-border);background:var(--orders-background)}
.order-detail-section{margin-bottom:18px;padding:15px;border:1px solid var(--orders-border);border-radius:9px;background:var(--orders-background);min-width:0}
.order-detail-section h3{margin:0 0 13px;color:var(--orders-text);font-size:11px}
.order-items{display:flex;flex-direction:column}
.order-item-row{padding:10px 0;border-bottom:1px solid var(--orders-border);display:grid;grid-template-columns:48px minmax(0,1fr) auto;gap:10px;align-items:center}
.order-item-row:last-child{border-bottom:0}
.order-item-image{width:48px;height:48px;border-radius:7px;background:var(--orders-light);color:var(--orders-primary);display:flex;align-items:center;justify-content:center;overflow:hidden}
.order-item-image img{width:100%;height:100%;object-fit:cover}
.order-item-info{min-width:0}
.order-item-info strong{display:block;color:var(--orders-text);font-size:9px;overflow-wrap:anywhere}
.order-item-info span{display:block;margin-top:3px;color:#98a2b3;font-size:7px}
.order-item-info small{display:block;margin-top:5px;color:#667085;font-size:8px}
.order-item-row>b{color:var(--orders-text);font-size:10px}
.order-details-columns{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px}
.order-info-line{padding:8px 0;border-bottom:1px solid var(--orders-border);display:flex;align-items:flex-start;justify-content:space-between;gap:15px;font-size:8px}
.order-info-line:last-child{border-bottom:0}
.order-info-line strong{color:#667085;display:flex;align-items:center;gap:5px;flex-shrink:0}
.order-info-line strong svg{color:var(--orders-primary)}
.order-info-line span{color:var(--orders-text);text-align:right;overflow-wrap:anywhere;min-width:0}
.order-notes{padding:11px;border-radius:6px;background:var(--orders-light);color:var(--orders-text);font-size:8px;line-height:1.6;white-space:pre-line;overflow-wrap:anywhere}
.order-total-section{width:min(330px,100%);margin-left:auto;padding:15px;border:1px solid var(--orders-border);border-radius:9px;background:var(--orders-background)}
.order-total-section>div{padding:7px 0;display:flex;align-items:center;justify-content:space-between;color:#667085;font-size:9px}
.order-total-section strong{color:var(--orders-text)}
.order-total-section .order-final-total{margin-top:5px;padding-top:12px;border-top:1px solid var(--orders-border);color:var(--orders-text);font-weight:700}
.order-final-total strong{color:var(--orders-primary);font-size:16px}
.orders-empty-wrapper{min-height:calc(100vh - 160px);padding:30px 0;display:flex;align-items:center;justify-content:center}
.orders-empty-card,.orders-no-results{width:min(440px,100%);padding:40px;border:1px solid var(--orders-border);border-radius:13px;background:var(--orders-background);text-align:center}
.orders-empty-icon{width:70px;height:70px;margin:auto auto 18px;border-radius:50%;background:var(--orders-light);color:var(--orders-primary);display:flex;align-items:center;justify-content:center;font-size:26px}
.orders-empty-card h1,.orders-no-results h2{margin:0;color:var(--orders-text);font-size:20px}
.orders-empty-card p,.orders-no-results p{margin:8px 0 20px;color:#98a2b3;font-size:9px;line-height:1.6}
.orders-primary-button{min-width:150px;min-height:41px;padding:0 15px;border:0;border-radius:7px;background:var(--orders-button);color:var(--orders-button-text);display:inline-flex;align-items:center;justify-content:center;gap:7px;font-size:9px;font-weight:700;cursor:pointer}
.orders-primary-button:hover{background:var(--orders-secondary)}
.orders-no-results{width:100%;margin-top:10px}
.orders-no-results>svg{margin-bottom:12px;color:var(--orders-primary);font-size:35px}
.orders-loading{min-height:350px;display:flex;align-items:center;justify-content:center;color:var(--orders-text);font-size:13px}
.orders-feedback{margin-bottom:18px;padding:12px 15px;border:1px solid #f0cccc;border-radius:9px;background:#fff1f0;color:#b42318;font-size:12px;line-height:1.6;overflow-wrap:anywhere}

@media(max-width:850px){
  .order-summary-grid{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
  .order-details-columns{grid-template-columns:minmax(0,1fr)}
}

@media(max-width:550px){
  .orders-title{align-items:flex-start;gap:15px}
  .orders-count{min-width:auto}
  .order-summary-grid{grid-template-columns:minmax(0,1fr)}
  .order-top{align-items:flex-start;gap:10px}
  .order-status{font-size:7px}
}
`;

export default Orders;