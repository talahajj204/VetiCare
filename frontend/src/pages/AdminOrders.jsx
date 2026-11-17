import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useOutletContext } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getClinicOptions } from "../data/clinicOptionsApi";

import {
  FaBoxOpen,
  FaSearch,
  FaEye,
  FaTimes,
  FaUser,
  FaDollarSign,
  FaShoppingBag,
  FaStickyNote,
  FaTruck,
  FaStore,
  FaCheckCircle,
  FaClock,
  FaBan,
  FaReceipt,
  FaPaw,
  FaFileExport,
} from "react-icons/fa";

async function orderRequest(path = "", options = {}) {
  const response = await fetch(`/api/orders${path}`, {
    ...options,
    credentials: "include",
    cache: "no-store",
    headers: {
      ...(options.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message =
      response.status === 401
        ? "Please sign in to continue."
        : response.status === 403
          ? "You do not have permission to perform this action."
          : response.status === 404
            ? "Order not found."
            : "Unable to complete the order request.";

    const problem = await response.json().catch(() => null);

    const errors = problem?.errors
      ? Object.values(problem.errors)
          .flat()
          .filter((value) => typeof value === "string")
          .join(" ")
      : "";

    message =
      errors ||
      problem?.detail ||
      problem?.title ||
      message;

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return response.status === 204
    ? null
    : response.json();
}

function validateOrder(order) {
  if (
    !order ||
    !Number.isSafeInteger(order.id) ||
    order.id <= 0 ||
    !Array.isArray(order.items) ||
    typeof order.status !== "string"
  ) {
    throw new Error(
      "The server returned invalid order information."
    );
  }

  return order;
}

function AdminOrders() {
  const session = useOutletContext();
  const user = session?.user;

  const [orders, setOrders] = useState([]);
  const [STATUS_OPTIONS, setStatusOptions] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [statusesLoading, setStatusesLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [statusesError, setStatusesError] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const listControllerRef = useRef(null);
  const listVersionRef = useRef(0);
  const updatingRef = useRef(false);
  const mountedRef = useRef(false);

  const selectedOrder = useMemo(
    () =>
      orders.find((order) => order.id === selectedOrderId) ||
      null,
    [orders, selectedOrderId]
  );

  const setSelectedOrder = (order) => {
    setSelectedOrderId(order?.id ?? null);
  };

  const refreshOrders = useCallback(async () => {
    if (updatingRef.current || !mountedRef.current) return;

    listControllerRef.current?.abort();

    const controller = new AbortController();
    listControllerRef.current = controller;
    const version = ++listVersionRef.current;

    setLoading(true);

    try {
      const result = await orderRequest("", {
        signal: controller.signal,
      });

      if (
        !mountedRef.current ||
        controller.signal.aborted ||
        version !== listVersionRef.current
      ) {
        return;
      }

      if (!Array.isArray(result)) {
        throw new Error(
          "The server returned invalid order data."
        );
      }

      const validated = result.map(validateOrder);

      validated.sort(
        (a, b) =>
          (Date.parse(b.date) || 0) -
            (Date.parse(a.date) || 0) ||
          b.id - a.id
      );

      setOrders(validated);
      setOrdersError("");
    } catch (error) {
      if (
        mountedRef.current &&
        !controller.signal.aborted &&
        version === listVersionRef.current
      ) {
        setOrdersError(
          error.message || "Unable to load orders."
        );
      }
    } finally {
      if (
        mountedRef.current &&
        !controller.signal.aborted &&
        version === listVersionRef.current
      ) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      listControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    setOrders([]);
    setSelectedOrderId(null);
    setOrdersError("");
    setUpdateError("");
    setSearch("");
    setStatusFilter("All");

    refreshOrders();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshOrders();
      }
    };

    window.addEventListener(
      "vetClinicOrdersUpdated",
      refreshOrders
    );
    window.addEventListener("focus", refreshOrders);

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      listControllerRef.current?.abort();
      listVersionRef.current += 1;

      window.removeEventListener(
        "vetClinicOrdersUpdated",
        refreshOrders
      );
      window.removeEventListener("focus", refreshOrders);

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [user?.id, user?.clinicId, refreshOrders]);

  useEffect(() => {
    let controller = null;
    let disposed = false;

    setStatusOptions([]);
    setStatusesError("");

    const loadStatuses = async () => {
      controller?.abort();

      const currentController = new AbortController();
      controller = currentController;

      setStatusesLoading(true);

      try {
        const options = await getClinicOptions({
          listKey: "ordersSalesBilling",
          signal: currentController.signal,
        });

        if (
          disposed ||
          currentController.signal.aborted
        ) {
          return;
        }

        setStatusOptions([
          ...new Set(
            options
              .filter(
                (option) =>
                  option.isActive &&
                  typeof option.value === "string"
              )
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((option) => option.value.trim())
              .filter(Boolean)
          ),
        ]);

        setStatusesError("");
      } catch (error) {
        if (
          !disposed &&
          !currentController.signal.aborted
        ) {
          setStatusesError(
            error.message || "Unable to load order statuses."
          );
        }
      } finally {
        if (
          !disposed &&
          !currentController.signal.aborted
        ) {
          setStatusesLoading(false);
        }
      }
    };

    loadStatuses();

    window.addEventListener(
      "clinicOptionsUpdated",
      loadStatuses
    );
    window.addEventListener("focus", loadStatuses);

    return () => {
      disposed = true;
      controller?.abort();

      window.removeEventListener(
        "clinicOptionsUpdated",
        loadStatuses
      );
      window.removeEventListener("focus", loadStatuses);
    };
  }, [user?.id, user?.clinicId]);

  const getStatusOptions = (currentStatus) => {
    const current = currentStatus || "Pending";

    return STATUS_OPTIONS.includes(current)
      ? STATUS_OPTIONS
      : [current, ...STATUS_OPTIONS];
  };

  const filterStatuses = useMemo(
    () => [
      ...new Set([
        ...STATUS_OPTIONS,
        ...orders.map((order) => order.status || "Pending"),
      ]),
    ],
    [STATUS_OPTIONS, orders]
  );

  const updateOrderStatus = async (orderId, newStatus) => {
    if (updatingRef.current) return;

    const current = orders.find(
      (order) => order.id === orderId
    );

    if (!current || current.status === newStatus) return;

    if (!STATUS_OPTIONS.includes(newStatus)) {
      setUpdateError(
        "Choose an active status from Settings."
      );
      return;
    }

    updatingRef.current = true;
    setUpdatingOrderId(orderId);
    setUpdateError("");

    listControllerRef.current?.abort();
    listVersionRef.current += 1;
    setLoading(false);

    try {
      const result = validateOrder(
        await orderRequest(`/${orderId}/status`, {
          method: "PUT",
          body: JSON.stringify({ status: newStatus }),
        })
      );

      if (result.id !== orderId) {
        throw new Error(
          "The server returned unexpected order information."
        );
      }

      if (!mountedRef.current) return;

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId ? result : order
        )
      );

      window.dispatchEvent(
        new Event("vetClinicOrdersUpdated")
      );
      window.dispatchEvent(
        new Event("vetClinicProductsUpdated")
      );
    } catch (error) {
      if (mountedRef.current) {
        setUpdateError(
          error.message || "Unable to update the order status."
        );
      }
    } finally {
      updatingRef.current = false;

      if (mountedRef.current) {
        setUpdatingOrderId(null);
        refreshOrders();
      }
    }
  };

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

  const filteredOrders = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return orders.filter((order) => {
      const customerName = order.customer?.fullName || "";
      const phone = order.customer?.phone || "";
      const orderId = String(order.id || "");

      const products = order.items
        .map((item) => item.name || "")
        .join(" ");

      const matchesSearch =
        !searchValue ||
        customerName.toLowerCase().includes(searchValue) ||
        phone.toLowerCase().includes(searchValue) ||
        orderId.toLowerCase().includes(searchValue) ||
        products.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All" ||
        (order.status || "Pending") === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => (order.status || "Pending") === "Pending"
  ).length;

  const activeOrders = orders.filter((order) =>
    ["Confirmed", "Preparing", "Out for Delivery"].includes(
      order.status
    )
  ).length;

  const deliveredOrders = orders.filter((order) =>
    ["Delivered", "Completed"].includes(order.status)
  ).length;

  const totalRevenue = orders
    .filter((order) => order.status !== "Cancelled")
    .reduce(
      (total, order) => total + Number(order.total || 0),
      0
    );

  const getStatusClass = (status) => {
    switch (status) {
      case "Confirmed":
        return "confirmed";
      case "Preparing":
        return "preparing";
      case "Out for Delivery":
        return "delivery";
      case "Delivered":
      case "Completed":
        return "delivered";
      case "Cancelled":
        return "cancelled";
      default:
        return "pending";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Confirmed":
      case "Delivered":
      case "Completed":
        return <FaCheckCircle />;
      case "Preparing":
        return <FaBoxOpen />;
      case "Out for Delivery":
        return <FaTruck />;
      case "Cancelled":
        return <FaBan />;
      default:
        return <FaClock />;
    }
  };

  const getItemCount = (order) =>
    Array.isArray(order.items)
      ? order.items.reduce(
          (total, item) =>
            total + Number(item.quantity || 0),
          0
        )
      : 0;

  const getProductSummary = (order) => {
    if (!Array.isArray(order.items) || !order.items.length) {
      return "-";
    }

    return order.items
      .map(
        (item) =>
          `${item.quantity || 1}× ${item.name || "Product"}`
      )
      .join(", ");
  };

  const exportOrders = () => {
    const ordersToExport =
      filteredOrders.length > 0 ? filteredOrders : orders;

    if (!ordersToExport.length) {
      window.alert("There are no orders to export.");
      return;
    }

    const escapeCSV = (value) => {
      const text = String(value ?? "");
      return `"${text.replace(/"/g, '""')}"`;
    };

    const headers = [
      "Order ID",
      "Customer Name",
      "Phone",
      "Order Details",
      "Subtotal",
      "Delivery Fee",
      "Total",
      "Date",
      "Time",
      "Delivery Method",
      "Address",
      "Address Details",
      "Payment Method",
      "Note",
      "Status",
    ];

    const rows = ordersToExport.map((order) => [
      order.id || "",
      order.customer?.fullName || "",
      order.customer?.phone || "",
      getProductSummary(order),
      Number(order.subtotal || 0).toFixed(2),
      Number(order.deliveryFee || 0).toFixed(2),
      Number(order.total || 0).toFixed(2),
      formatDate(order.date),
      formatTime(order.date),
      order.deliveryMethod === "pickup"
        ? "Clinic Pickup"
        : "Home Delivery",
      order.address || "",
      order.addressDetails || "",
      order.paymentMethod === "cash"
        ? "Cash"
        : order.paymentMethod || "",
      order.notes || "",
      order.status || "Pending",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `vet-clinic-orders-${today}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };  return (
    <div className="dashboard-layout admin-orders-page">
      <style>{styles}</style>
      <Sidebar />

      <main className="dashboard-main admin-orders-main">
        <div className="admin-orders-header">
          <div className="admin-orders-header-left">
            <h1>Orders</h1>
            <p>
              Manage customer orders from your clinic store.
            </p>
          </div>

          <button
            type="button"
            className="admin-orders-export"
            onClick={exportOrders}
            disabled={loading && orders.length === 0}
          >
            <FaFileExport />
            Export
          </button>
        </div>

        {[
          ordersError,
          statusesError,
          updateError,
        ].filter(Boolean).map((message, index) => (
          <div
            key={`${index}-${message}`}
            className="admin-orders-feedback"
            role="alert"
          >
            {message}
          </div>
        ))}

        <div className="admin-orders-stats">
          {[
            {
              label: "Total Orders",
              value: totalOrders,
              icon: <FaShoppingBag />,
              type: "",
            },
            {
              label: "Pending",
              value: pendingOrders,
              icon: <FaClock />,
              type: "pending",
            },
            {
              label: "Active",
              value: activeOrders,
              icon: <FaTruck />,
              type: "active",
            },
            {
              label: "Delivered",
              value: deliveredOrders,
              icon: <FaCheckCircle />,
              type: "delivered",
            },
            {
              label: "Total Revenue",
              value: `$${totalRevenue.toFixed(2)}`,
              icon: <FaDollarSign />,
              type: "revenue",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`admin-order-stat ${stat.type}`}
            >
              <div className="admin-order-stat-icon">
                {stat.icon}
              </div>

              <div className="admin-order-stat-info">
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            </div>
          ))}
        </div>

        <section
          className="admin-orders-card"
          aria-busy={loading}
        >
          <div className="admin-orders-toolbar">
            <div className="admin-orders-search">
              <FaSearch />

              <input
                type="text"
                placeholder="Search orders..."
                aria-label="Search orders"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <select
              className="admin-orders-filter"
              aria-label="Filter orders by status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="All">All Statuses</option>

              {statusFilter !== "All" &&
                !filterStatuses.includes(statusFilter) && (
                  <option value={statusFilter}>
                    {statusFilter}
                  </option>
                )}

              {filterStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {loading && orders.length === 0 ? (
            <div className="admin-orders-empty" role="status">
              <div className="admin-orders-empty-icon">
                <FaShoppingBag />
              </div>
              <h2>Loading orders...</h2>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="admin-orders-empty">
              <div className="admin-orders-empty-icon">
                <FaShoppingBag />
              </div>

              <h2>
                {ordersError && orders.length === 0
                  ? "Unable to load orders"
                  : "No orders found"}
              </h2>

              <p>
                {ordersError && orders.length === 0
                  ? ordersError
                  : orders.length === 0
                    ? "Store orders will appear here automatically after customers place an order."
                    : "Try another search or status."}
              </p>
            </div>
          ) : (
            <div className="admin-orders-table-wrapper">
              <table className="admin-orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Order Details</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Note</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => {
                    const status = order.status || "Pending";

                    return (
                      <tr key={order.id}>
                        <td>
                          <span className="admin-order-id">
                            {order.id}
                          </span>
                        </td>

                        <td>
                          <div className="admin-order-customer">
                            <div className="admin-order-customer-avatar">
                              <FaUser />
                            </div>

                            <div>
                              <strong>
                                {order.customer?.fullName || "-"}
                              </strong>
                              <span>
                                {getItemCount(order)} item
                                {getItemCount(order) !== 1
                                  ? "s"
                                  : ""}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>{order.customer?.phone || "-"}</td>

                        <td>
                          <div className="admin-order-products">
                            {getProductSummary(order)}
                          </div>
                        </td>

                        <td>
                          <span className="admin-order-price">
                            ${Number(order.total || 0).toFixed(2)}
                          </span>
                        </td>

                        <td>
                          <div className="admin-order-date">
                            <strong>
                              {formatDate(order.date)}
                            </strong>
                            <span>
                              {formatTime(order.date)}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div
                            className="admin-order-note"
                            title={order.notes || ""}
                          >
                            {order.notes || "-"}
                          </div>
                        </td>

                        <td>
                          <select
                            className={`admin-order-status-select ${getStatusClass(
                              status
                            )}`}
                            value={status}
                            aria-label={`Status for order ${order.id}`}
                            disabled={
                              updatingOrderId !== null ||
                              statusesLoading ||
                              Boolean(statusesError) ||
                              STATUS_OPTIONS.length === 0
                            }
                            onChange={(event) =>
                              updateOrderStatus(
                                order.id,
                                event.target.value
                              )
                            }
                          >
                            {getStatusOptions(status).map(
                              (option) => (
                                <option
                                  key={option}
                                  value={option}
                                  disabled={
                                    !STATUS_OPTIONS.includes(option)
                                  }
                                >
                                  {option}
                                </option>
                              )
                            )}
                          </select>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="admin-order-view"
                            title="View Order"
                            aria-label={`View order ${order.id}`}
                            onClick={() =>
                              setSelectedOrder(order)
                            }
                          >
                            <FaEye />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {selectedOrder && (
        <div
          className="admin-order-modal-overlay"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="admin-order-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-order-modal-heading"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-order-modal-header">
              <div className="admin-order-modal-title">
                <div className="admin-order-modal-title-icon">
                  <FaReceipt />
                </div>

                <div>
                  <span>Order Details</span>
                  <h2 id="admin-order-modal-heading">
                    {selectedOrder.id}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                className="admin-order-modal-close"
                onClick={() => setSelectedOrder(null)}
                aria-label="Close order details"
              >
                <FaTimes />
              </button>
            </div>

            <div className="admin-order-modal-body">
              {updateError && (
                <div
                  className="admin-orders-feedback"
                  role="alert"
                >
                  {updateError}
                </div>
              )}

              <div className="admin-order-modal-top">
                <div className="admin-order-modal-summary">
                  <span>Order Date</span>
                  <strong>
                    {formatDate(selectedOrder.date)}
                    <br />
                    {formatTime(selectedOrder.date)}
                  </strong>
                </div>

                <div className="admin-order-modal-summary">
                  <span>Products</span>
                  <strong>
                    {getItemCount(selectedOrder)} Items
                  </strong>
                </div>

                <div className="admin-order-modal-summary">
                  <span>Delivery</span>
                  <strong>
                    {selectedOrder.deliveryMethod === "pickup"
                      ? "Clinic Pickup"
                      : "Home Delivery"}
                  </strong>
                </div>

                <div className="admin-order-modal-summary">
                  <span>Total</span>
                  <strong>
                    ${Number(selectedOrder.total || 0).toFixed(2)}
                  </strong>
                </div>
              </div>

              <div className="admin-order-details-grid">
                <div className="admin-order-detail-card">
                  <h3>
                    <FaUser />
                    Customer Details
                  </h3>

                  <div className="admin-order-info-row">
                    <span>Name</span>
                    <strong>
                      {selectedOrder.customer?.fullName || "-"}
                    </strong>
                  </div>

                  <div className="admin-order-info-row">
                    <span>Phone</span>
                    <strong>
                      {selectedOrder.customer?.phone || "-"}
                    </strong>
                  </div>
                </div>

                <div className="admin-order-detail-card">
                  <h3>
                    {selectedOrder.deliveryMethod === "pickup" ? (
                      <FaStore />
                    ) : (
                      <FaTruck />
                    )}
                    Delivery Details
                  </h3>

                  <div className="admin-order-info-row">
                    <span>Method</span>
                    <strong>
                      {selectedOrder.deliveryMethod === "pickup"
                        ? "Clinic Pickup"
                        : "Home Delivery"}
                    </strong>
                  </div>

                  <div className="admin-order-info-row">
                    <span>Address</span>
                    <strong>
                      {selectedOrder.address || "-"}
                    </strong>
                  </div>

                  {selectedOrder.addressDetails && (
                    <div className="admin-order-info-row">
                      <span>Address Details</span>
                      <strong>
                        {selectedOrder.addressDetails}
                      </strong>
                    </div>
                  )}

                  <div className="admin-order-info-row">
                    <span>Payment</span>
                    <strong>
                      {selectedOrder.paymentMethod === "cash"
                        ? "Cash"
                        : selectedOrder.paymentMethod || "-"}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="admin-order-items-card">
                <h3>
                  <FaShoppingBag />
                  Order Items
                </h3>

                {selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item, index) => (
                    <div
                      className="admin-order-modal-item"
                      key={item.id || index}
                    >
                      <div className="admin-order-modal-item-image">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name || "Product"}
                          />
                        ) : (
                          <FaPaw />
                        )}
                      </div>

                      <div className="admin-order-modal-item-info">
                        <strong>
                          {item.name || "Product"}
                        </strong>
                        <span>
                          {item.category || "No category"}
                        </span>
                      </div>

                      <div className="admin-order-modal-item-qty">
                        {item.quantity || 1} × $
                        {Number(item.price || 0).toFixed(2)}
                      </div>

                      <div className="admin-order-modal-item-price">
                        $
                        {(
                          Number(item.price || 0) *
                          Number(item.quantity || 1)
                        ).toFixed(2)}
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No products found.</p>
                )}
              </div>

              <div className="admin-order-note-card">
                <h3>
                  <FaStickyNote />
                  Customer Note
                </h3>

                <p>
                  {selectedOrder.notes ||
                    "No note provided by the customer."}
                </p>
              </div>

              <div className="admin-order-totals">
                <div className="admin-order-total-row">
                  <span>Subtotal</span>
                  <strong>
                    $
                    {Number(
                      selectedOrder.subtotal || 0
                    ).toFixed(2)}
                  </strong>
                </div>

                <div className="admin-order-total-row">
                  <span>Delivery</span>
                  <strong>
                    {Number(selectedOrder.deliveryFee || 0) === 0
                      ? "Free"
                      : `$${Number(
                          selectedOrder.deliveryFee || 0
                        ).toFixed(2)}`}
                  </strong>
                </div>

                <div className="admin-order-total-row final">
                  <span>Total</span>
                  <strong>
                    ${Number(selectedOrder.total || 0).toFixed(2)}
                  </strong>
                </div>
              </div>

              <div className="admin-order-modal-status">
                <div>
                  <span>Current Status</span>
                  <strong>
                    {getStatusIcon(
                      selectedOrder.status || "Pending"
                    )}
                    {selectedOrder.status || "Pending"}
                  </strong>
                </div>

                <select
                  value={selectedOrder.status || "Pending"}
                  aria-label="Update order status"
                  disabled={
                    updatingOrderId !== null ||
                    statusesLoading ||
                    Boolean(statusesError) ||
                    STATUS_OPTIONS.length === 0
                  }
                  onChange={(event) =>
                    updateOrderStatus(
                      selectedOrder.id,
                      event.target.value
                    )
                  }
                >
                  {getStatusOptions(
                    selectedOrder.status
                  ).map((status) => (
                    <option
                      key={status}
                      value={status}
                      disabled={
                        !STATUS_OPTIONS.includes(status)
                      }
                    >
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = `
.admin-orders-page,.admin-orders-page *{box-sizing:border-box}
.admin-orders-page{min-height:100vh;background:#f7fafb;color:#263b4f;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
.admin-orders-main{min-width:0;min-height:100vh;padding:28px 30px 50px}
.admin-orders-header{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:20px}
.admin-orders-header-left h1{margin:0;color:#183b4d;font-size:28px;font-weight:800;letter-spacing:-.7px}
.admin-orders-header-left p{margin:6px 0 0;color:#7b8b98;font-size:12px;line-height:1.55}
.admin-orders-export{width:auto;min-width:90px;height:36px;padding:0 14px;border:1px solid #d9e8e7;border-radius:8px;background:#fff;color:#11797b;display:inline-flex;align-items:center;justify-content:center;gap:6px;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;flex:0 0 auto;align-self:flex-start;transition:.2s ease}
.admin-orders-export svg{font-size:11px}
.admin-orders-export:hover{background:#e8f7f7;border-color:#b9dddd;color:#0d696b}
.admin-orders-export:disabled{opacity:.5;cursor:not-allowed}
.admin-orders-stats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin-bottom:18px}
.admin-order-stat{min-width:0;min-height:82px;padding:12px 13px;border:1px solid #e3eeee;border-radius:12px;background:#fff;box-shadow:0 3px 12px rgba(20,85,88,.04);display:flex;align-items:center;gap:10px}
.admin-order-stat-icon{width:36px;height:36px;min-width:36px;border-radius:9px;background:#e8f7f7;color:#1aa6a6;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:14px}
.admin-order-stat.pending .admin-order-stat-icon{background:#fff7e6;color:#f59e0b}
.admin-order-stat.active .admin-order-stat-icon{background:#eef4ff;color:#4f72d8}
.admin-order-stat.delivered .admin-order-stat-icon{background:#eaf8ef;color:#2f9e5b}
.admin-order-stat.revenue .admin-order-stat-icon{background:#f1edff;color:#7557c8}
.admin-order-stat-info{min-width:0;overflow:hidden}
.admin-order-stat-info span{display:block;color:#8a99a6;font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:.45px;white-space:nowrap}
.admin-order-stat-info strong{display:block;margin-top:4px;color:#263b4f;font-size:18px;font-weight:800;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.admin-orders-card{border:1px solid #e1ecec;border-radius:14px;background:#fff;box-shadow:0 5px 20px rgba(18,76,80,.05);overflow:hidden}
.admin-orders-toolbar{padding:14px 16px;border-bottom:1px solid #edf3f3;display:flex;align-items:center;justify-content:space-between;gap:12px}
.admin-orders-search{width:310px;height:38px;position:relative}
.admin-orders-search svg{position:absolute;top:50%;left:13px;transform:translateY(-50%);color:#98a7b3;font-size:11px}
.admin-orders-search input{width:100%;height:100%;padding:0 13px 0 36px;border:1px solid #dce8e8;border-radius:9px;outline:none;background:#fff;color:#263b4f;font-size:11px;transition:.2s ease}
.admin-orders-search input:focus{border-color:#1aa6a6;box-shadow:0 0 0 3px rgba(26,166,166,.09)}
.admin-orders-filter{height:38px;padding:0 11px;border:1px solid #dce8e8;border-radius:9px;outline:none;background:#fff;color:#475467;font-size:10px;font-weight:650;cursor:pointer}
.admin-orders-table-wrapper{width:100%;overflow-x:auto}
.admin-orders-table{width:100%;min-width:1120px;border-collapse:collapse}
.admin-orders-table th{padding:11px 12px;border-bottom:1px solid #e9f0f0;background:#f8fbfb;color:#7b8b98;text-align:left;font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;white-space:nowrap}
.admin-orders-table td{padding:12px;border-bottom:1px solid #edf3f3;color:#475467;vertical-align:middle;font-size:10px}
.admin-orders-table tbody tr{transition:background .18s ease}
.admin-orders-table tbody tr:hover{background:#fbfdfd}
.admin-orders-table tbody tr:last-child td{border-bottom:none}
.admin-order-id{color:#11797b;font-size:10px;font-weight:800;white-space:nowrap}
.admin-order-customer{display:flex;align-items:center;gap:8px;min-width:145px}
.admin-order-customer-avatar{width:31px;height:31px;min-width:31px;border-radius:50%;background:#e8f7f7;color:#1aa6a6;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:11px}
.admin-order-customer strong{display:block;color:#263b4f;font-size:10px;font-weight:750}
.admin-order-customer span{display:block;margin-top:2px;color:#98a2b3;font-size:8px}
.admin-order-products{max-width:220px;color:#667785;line-height:1.45;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.admin-order-price{color:#263b4f;font-size:11px;font-weight:800;white-space:nowrap}
.admin-order-date strong{display:block;color:#475467;font-size:9px}
.admin-order-date span{display:block;margin-top:2px;color:#98a2b3;font-size:8px}
.admin-order-note{max-width:150px;color:#7b8b98;line-height:1.45;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.admin-order-status-select{min-width:125px;height:31px;padding:0 7px;border:1px solid transparent;border-radius:7px;outline:none;font-size:8px;font-weight:800;cursor:pointer}
.admin-order-status-select.pending{border-color:#f5dfad;background:#fff8e8;color:#b77900}
.admin-order-status-select.confirmed{border-color:#bfd4ff;background:#eef4ff;color:#3f65bd}
.admin-order-status-select.preparing{border-color:#d5c9ff;background:#f3efff;color:#7357c2}
.admin-order-status-select.delivery{border-color:#b9dfdd;background:#eaf8f7;color:#11797b}
.admin-order-status-select.delivered{border-color:#bee5cc;background:#eaf8ef;color:#2b8d50}
.admin-order-status-select.cancelled{border-color:#f4c6c6;background:#fff0f0;color:#c73d3d}
.admin-order-status-select:disabled,.admin-order-modal-status select:disabled{opacity:.6;cursor:not-allowed}
.admin-order-view{width:31px;height:31px;border:1px solid #d9e8e7;border-radius:7px;background:#fff;color:#1aa6a6;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.18s ease;font-size:11px}
.admin-order-view:hover{border-color:#1aa6a6;background:#e8f7f7}
.admin-orders-empty{min-height:260px;padding:30px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.admin-orders-empty-icon{width:58px;height:58px;margin-bottom:13px;border-radius:50%;background:#e8f7f7;color:#1aa6a6;display:flex;align-items:center;justify-content:center;font-size:21px}
.admin-orders-empty h2{margin:0;color:#263b4f;font-size:16px}
.admin-orders-empty p{margin:6px 0 0;color:#8a99a6;font-size:10px;line-height:1.6}
.admin-order-modal-overlay{position:fixed;inset:0;z-index:5000;padding:30px;background:rgba(20,37,48,.55);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center}
.admin-order-modal{width:min(920px,100%);max-height:90vh;border-radius:18px;background:#fff;box-shadow:0 24px 80px rgba(16,24,40,.22);overflow-y:auto}
.admin-order-modal-header{padding:20px 22px;border-bottom:1px solid #edf2f2;display:flex;align-items:center;justify-content:space-between;gap:15px;position:sticky;top:0;z-index:5;background:#fff}
.admin-order-modal-title{display:flex;align-items:center;gap:12px}
.admin-order-modal-title-icon{width:42px;height:42px;border-radius:11px;background:#e8f7f7;color:#1aa6a6;display:flex;align-items:center;justify-content:center;font-size:15px}
.admin-order-modal-title span{display:block;color:#98a2b3;font-size:9px;font-weight:750;text-transform:uppercase}
.admin-order-modal-title h2{margin:3px 0 0;color:#263b4f;font-size:18px;font-weight:800}
.admin-order-modal-close{width:36px;height:36px;border:none;border-radius:50%;background:#f4f7f7;color:#667785;display:flex;align-items:center;justify-content:center;cursor:pointer}
.admin-order-modal-close:hover{background:#e8eeee;color:#263b4f}
.admin-order-modal-body{padding:22px}
.admin-order-modal-top{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:20px}
.admin-order-modal-summary{min-height:85px;padding:14px;border:1px solid #e5eeee;border-radius:12px;background:#fbfdfd}
.admin-order-modal-summary span{display:block;color:#98a2b3;font-size:9px;font-weight:700;text-transform:uppercase}
.admin-order-modal-summary strong{display:block;margin-top:7px;color:#263b4f;font-size:12px;line-height:1.5}
.admin-order-details-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-bottom:18px}
.admin-order-detail-card{padding:18px;border:1px solid #e4eeee;border-radius:13px;background:#fff}
.admin-order-detail-card h3{margin:0 0 15px;color:#263b4f;font-size:12px;font-weight:800;display:flex;align-items:center;gap:8px}
.admin-order-detail-card h3 svg{color:#1aa6a6}
.admin-order-info-row{padding:9px 0;border-bottom:1px solid #edf3f3;display:flex;justify-content:space-between;gap:15px}
.admin-order-info-row:last-child{border-bottom:none}
.admin-order-info-row span{color:#98a2b3;font-size:9px}
.admin-order-info-row strong{max-width:65%;color:#475467;text-align:right;font-size:10px;line-height:1.5;word-break:break-word}
.admin-order-items-card{margin-bottom:18px;padding:18px;border:1px solid #e4eeee;border-radius:13px;background:#fff}
.admin-order-items-card h3{margin:0 0 15px;color:#263b4f;font-size:12px;font-weight:800;display:flex;align-items:center;gap:8px}
.admin-order-items-card h3 svg{color:#1aa6a6}
.admin-order-modal-item{padding:11px 0;border-bottom:1px solid #edf3f3;display:grid;grid-template-columns:50px minmax(0,1fr) auto auto;align-items:center;gap:12px}
.admin-order-modal-item:last-child{border-bottom:none}
.admin-order-modal-item-image{width:46px;height:46px;border-radius:9px;background:#eef8f7;color:#1aa6a6;display:flex;align-items:center;justify-content:center;overflow:hidden}
.admin-order-modal-item-image img{width:100%;height:100%;object-fit:cover;display:block}
.admin-order-modal-item-info{min-width:0}
.admin-order-modal-item-info strong{display:block;color:#263b4f;font-size:11px;font-weight:750;overflow-wrap:anywhere}
.admin-order-modal-item-info span{display:block;margin-top:4px;color:#98a2b3;font-size:9px}
.admin-order-modal-item-qty{color:#667785;font-size:10px;white-space:nowrap}
.admin-order-modal-item-price{min-width:70px;color:#263b4f;text-align:right;font-size:11px;font-weight:800;white-space:nowrap}
.admin-order-note-card{margin-bottom:18px;padding:17px;border:1px solid #e4eeee;border-radius:13px;background:#fbfdfd}
.admin-order-note-card h3{margin:0 0 9px;color:#263b4f;font-size:11px;font-weight:800;display:flex;align-items:center;gap:7px}
.admin-order-note-card h3 svg{color:#1aa6a6}
.admin-order-note-card p{margin:0;color:#667785;font-size:10px;line-height:1.7;white-space:pre-line;overflow-wrap:anywhere}
.admin-order-totals{margin-left:auto;width:min(360px,100%);padding:17px;border-radius:13px;background:#f7fbfb}
.admin-order-total-row{padding:7px 0;display:flex;justify-content:space-between;gap:15px;color:#667785;font-size:10px}
.admin-order-total-row strong{color:#475467}
.admin-order-total-row.final{margin-top:7px;padding-top:13px;border-top:1px solid #dce8e8;color:#263b4f;font-size:14px;font-weight:800}
.admin-order-total-row.final strong{color:#263b4f}
.admin-order-modal-status{margin-top:20px;padding-top:18px;border-top:1px solid #edf3f3;display:flex;align-items:center;justify-content:space-between;gap:15px}
.admin-order-modal-status div span{display:block;color:#98a2b3;font-size:9px;text-transform:uppercase;font-weight:750}
.admin-order-modal-status div strong{display:flex;align-items:center;gap:7px;margin-top:5px;color:#263b4f;font-size:11px}
.admin-order-modal-status div strong svg{color:#1aa6a6}
.admin-order-modal-status select{min-width:190px;height:40px;padding:0 10px;border:1px solid #dce8e8;border-radius:9px;outline:none;background:#fff;color:#475467;font-size:10px;font-weight:700;cursor:pointer}
.admin-orders-feedback{margin:0 0 16px;padding:12px 15px;border:1px solid #f0cccc;border-radius:9px;background:#fff1f0;color:#b42318;font-size:12px;line-height:1.6;overflow-wrap:anywhere}

@media(max-width:1350px){
  .admin-orders-stats{grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}
  .admin-order-stat{min-height:78px;padding:10px 11px;gap:8px}
  .admin-order-stat-icon{width:32px;height:32px;min-width:32px;font-size:12px}
  .admin-order-stat-info span{font-size:7px}
  .admin-order-stat-info strong{font-size:16px}
}
@media(max-width:1150px){
  .admin-orders-stats{grid-template-columns:repeat(3,minmax(0,1fr))}
}
@media(max-width:1000px){
  .admin-orders-main{padding:25px 20px 50px}
  .admin-orders-stats{grid-template-columns:repeat(2,minmax(0,1fr))}
  .admin-order-modal-top{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media(max-width:700px){
  .admin-orders-main{padding:65px 14px 40px}
  .admin-orders-header{flex-direction:column;margin-bottom:16px}
  .admin-orders-header-left h1{font-size:24px}
  .admin-orders-export{width:auto;min-width:0;height:27px;padding:0 8px;border-radius:6px;gap:4px;font-size:8px;flex:0 0 auto;align-self:flex-start}
  .admin-orders-export svg{width:8px;height:8px;font-size:8px}
  .admin-orders-stats{grid-template-columns:1fr;gap:8px;margin-bottom:14px}
  .admin-order-stat{min-height:68px;padding:9px 11px}
  .admin-orders-toolbar{flex-direction:column;align-items:stretch}
  .admin-orders-search{width:100%}
  .admin-orders-filter{width:100%}
  .admin-order-modal-overlay{padding:12px}
  .admin-order-modal-body{padding:15px}
  .admin-order-modal-top,.admin-order-details-grid{grid-template-columns:1fr}
  .admin-order-modal-item{grid-template-columns:45px minmax(0,1fr) auto}
  .admin-order-modal-item-price{grid-column:2/-1;text-align:left}
  .admin-order-modal-status{flex-direction:column;align-items:stretch}
  .admin-order-modal-status select{width:100%}
}
`;

export default AdminOrders;