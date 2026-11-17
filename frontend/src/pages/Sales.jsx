import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getClinicOptions } from "../data/clinicOptionsApi";

import {
  FaCashRegister,
  FaSearch,
  FaEye,
  FaTimes,
  FaUser,
  FaDollarSign,
  FaShoppingBag,
  FaReceipt,
  FaClock,
  FaMoneyBillWave,
  FaCreditCard,
  FaTruck,
  FaStore,
  FaPaw,
  FaFileExport,
} from "react-icons/fa";

const money = (value) => Number(value ?? 0).toFixed(2);

function normalizeSale(sale) {
  if (
    !sale ||
    !Number.isSafeInteger(sale.id) ||
    sale.id <= 0 ||
    !Array.isArray(sale.items)
  ) {
    throw new Error("The server returned invalid sales data.");
  }

  return {
    ...sale,
    owner: sale.customerName || "Walk-in Customer",
    date: sale.createdAt,
    received: sale.totalPaid,
    items: sale.items.map((item) => ({
      ...item,
      name: item.productName || "Product",
      category: item.categoryName || "",
      price: item.unitPrice,
    })),
  };
}

async function loadSales(signal) {
  const response = await fetch("/api/sales", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    const problem = await response.json().catch(() => null);

    const errors = problem?.errors
      ? Object.values(problem.errors)
          .flat()
          .filter((value) => typeof value === "string")
          .join(" ")
      : "";

    const fallback =
      response.status === 401
        ? "Please sign in again."
        : response.status === 403
          ? "You do not have permission to view sales."
          : response.status === 404
            ? "The sales API was not found."
            : "Unable to load sales.";

    throw new Error(
      errors || problem?.detail || problem?.title || fallback
    );
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("The server returned invalid sales data.");
  }

  return data
    .map(normalizeSale)
    .sort(
      (a, b) =>
        new Date(b.date).getTime() -
          new Date(a.date).getTime() ||
        b.id - a.id
    );
}

function formatDate(value) {
  const date = value ? new Date(value) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value) {
  const date = value ? new Date(value) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isToday(value) {
  const date = value ? new Date(value) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return false;
  }

  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function getItemsCount(sale) {
  return sale.items.reduce(
    (total, item) => total + Number(item.quantity ?? 0),
    0
  );
}

function getProductSummary(sale) {
  if (!sale.items.length) return "-";

  return sale.items
    .map((item) => `${item.quantity}× ${item.name}`)
    .join(", ");
}

function paymentType(value) {
  const method = String(value || "").trim().toLowerCase();

  return method === "cash"
    ? "cash"
    : method === "card"
      ? "card"
      : "other";
}

function Sales() {
  const context = useOutletContext();
  const user = context?.user;

  const userId = user?.id;
  const clinicId = user?.clinicId;

  const scopeKey = `${userId ?? ""}:${clinicId ?? ""}`;

  const [salesState, setSalesState] = useState({
    scopeKey,
    data: [],
  });

  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [paymentMethods, setPaymentMethods] = useState([]);

  const [selectedSaleId, setSelectedSaleId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [salesError, setSalesError] = useState("");
  const [optionsError, setOptionsError] = useState("");

  const sales =
    salesState.scopeKey === scopeKey
      ? salesState.data
      : [];

  const selectedSale =
    sales.find((sale) => sale.id === selectedSaleId) || null;

  useEffect(() => {
    let controller;
    let disposed = false;

    setSalesState({ scopeKey, data: [] });
    setSelectedSaleId(null);
    setSearch("");
    setPaymentFilter("All");
    setSalesError("");

    const refreshSales = async () => {
      controller?.abort();
      controller = new AbortController();

      const signal = controller.signal;

      setLoading(true);

      try {
        const data = await loadSales(signal);

        if (disposed || signal.aborted) return;

        setSalesState({ scopeKey, data });
        setSalesError("");

        setSelectedSaleId((current) =>
          data.some((sale) => sale.id === current)
            ? current
            : null
        );
      } catch (error) {
        if (disposed || signal.aborted) return;

        setSalesError(
          error.message || "Unable to load sales."
        );
      } finally {
        if (!disposed && !signal.aborted) {
          setLoading(false);
        }
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshSales();
      }
    };

    refreshSales();

    window.addEventListener("focus", refreshSales);
    window.addEventListener(
      "vetClinicPOSSalesUpdated",
      refreshSales
    );
    window.addEventListener("salesUpdated", refreshSales);

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      disposed = true;
      controller?.abort();

      window.removeEventListener("focus", refreshSales);
      window.removeEventListener(
        "vetClinicPOSSalesUpdated",
        refreshSales
      );
      window.removeEventListener(
        "salesUpdated",
        refreshSales
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [scopeKey]);

  useEffect(() => {
    let controller;
    let disposed = false;

    setPaymentMethods([]);
    setOptionsError("");

    const loadPaymentMethods = async () => {
      controller?.abort();
      controller = new AbortController();

      const signal = controller.signal;

      try {
        const options = await getClinicOptions({
          listKey: "pos.paymentMethods",
          signal,
        });

        if (disposed || signal.aborted) return;

        setPaymentMethods(
          [
            ...new Set(
              options
                .filter((option) => option.isActive)
                .sort(
                  (a, b) =>
                    a.sortOrder - b.sortOrder
                )
                .map((option) =>
                  String(option.value || "").trim()
                )
                .filter(Boolean)
            ),
          ]
        );

        setOptionsError("");
      } catch (error) {
        if (disposed || signal.aborted) return;

        setOptionsError(
          error.message ||
            "Unable to load payment filter options."
        );
      }
    };

    loadPaymentMethods();

    window.addEventListener("focus", loadPaymentMethods);
    window.addEventListener(
      "clinicOptionsUpdated",
      loadPaymentMethods
    );

    return () => {
      disposed = true;
      controller?.abort();

      window.removeEventListener(
        "focus",
        loadPaymentMethods
      );
      window.removeEventListener(
        "clinicOptionsUpdated",
        loadPaymentMethods
      );
    };
  }, [scopeKey]);

  useEffect(() => {
    if (selectedSaleId === null) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedSaleId(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [selectedSaleId]);

  const paymentFilterOptions = useMemo(() => {
    const unique = new Map();

    for (const value of [
      ...paymentMethods,
      ...sales.map((sale) => sale.paymentMethod),
    ]) {
      const label = String(value || "").trim();

      if (label) {
        unique.set(label.toLowerCase(), label);
      }
    }

    return [...unique.values()];
  }, [paymentMethods, sales]);

  const filteredSales = useMemo(() => {
    const value = search.trim().toLowerCase();

    return sales.filter((sale) => {
      const matchesSearch =
        !value ||
        String(sale.id).includes(value) ||
        sale.owner.toLowerCase().includes(value) ||
        getProductSummary(sale)
          .toLowerCase()
          .includes(value);

      const matchesPayment =
        paymentFilter === "All" ||
        String(sale.paymentMethod || "")
          .trim()
          .toLowerCase() ===
          paymentFilter.trim().toLowerCase();

      return matchesSearch && matchesPayment;
    });
  }, [sales, search, paymentFilter]);

  const totalSales = sales.length;

  const todaySales = sales.filter((sale) =>
    isToday(sale.date)
  ).length;

  const totalRevenue = sales.reduce(
    (total, sale) => total + Number(sale.total ?? 0),
    0
  );

  const cashSales = sales.filter(
    (sale) => paymentType(sale.paymentMethod) === "cash"
  ).length;

  const cardSales = sales.filter(
    (sale) => paymentType(sale.paymentMethod) === "card"
  ).length;

  const exportSales = () => {
    if (!filteredSales.length) {
      window.alert("There are no sales to export.");
      return;
    }

    const escapeCSV = (value) => {
      let text = String(value ?? "");

      // Prevent spreadsheet programs from treating text
      // supplied by a customer as a formula.
      if (/^[\s]*[=+\-@]/.test(text)) {
        text = `'${text}`;
      }

      return `"${text.replace(/"/g, '""')}"`;
    };

    const headers = [
      "Sale ID",
      "Owner",
      "Products",
      "Items",
      "Subtotal",
      "Discount",
      "Total",
      "Received",
      "Change",
      "Payment Method",
      "Delivery",
      "Date",
      "Time",
    ];

    const rows = filteredSales.map((sale) => [
      sale.id,
      sale.owner,
      getProductSummary(sale),
      getItemsCount(sale),
      money(sale.subtotal),
      money(sale.discount),
      money(sale.total),
      money(sale.received),
      money(sale.change),
      sale.paymentMethod,
      sale.hasDelivery ? "Delivery" : "No Delivery",
      formatDate(sale.date),
      formatTime(sale.date),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download =
      `vet-clinic-pos-sales-` +
      `${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="dashboard-layout sales-layout">
      <Sidebar />

      <main className="dashboard-main sales-main">
        <div className="sales-header">
          <div className="sales-header-left">
            <h1>Sales</h1>
            <p>
              View and manage all completed point of sale
              transactions.
            </p>
          </div>

          <button
            type="button"
            className="sales-export"
            onClick={exportSales}
            disabled={loading || !filteredSales.length}
          >
            <FaFileExport />
            <span>Export</span>
          </button>
        </div>

        {salesError && (
          <div className="sales-error" role="alert">
            {salesError}
          </div>
        )}

        {optionsError && (
          <div className="sales-warning" role="status">
            Payment filter options: {optionsError}
          </div>
        )}

        <div className="sales-stats">
          {[
            {
              label: "Total Sales",
              value: totalSales,
              icon: <FaReceipt />,
              className: "",
            },
            {
              label: "Today's Sales",
              value: todaySales,
              icon: <FaClock />,
              className: "today",
            },
            {
              label: "Total Revenue",
              value: `$${money(totalRevenue)}`,
              icon: <FaDollarSign />,
              className: "revenue",
            },
            {
              label: "Cash Sales",
              value: cashSales,
              icon: <FaMoneyBillWave />,
              className: "cash",
            },
            {
              label: "Card Sales",
              value: cardSales,
              icon: <FaCreditCard />,
              className: "card",
            },
          ].map((stat) => (
            <div
              className={`sales-stat ${stat.className}`}
              key={stat.label}
            >
              <div className="sales-stat-icon">
                {stat.icon}
              </div>

              <div className="sales-stat-info">
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            </div>
          ))}
        </div>

        <div className="sales-card" aria-busy={loading}>
          <div className="sales-toolbar">
            <div className="sales-search">
              <FaSearch />

              <input
                type="search"
                aria-label="Search sales"
                placeholder="Search by sale ID, owner or product..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <select
              className="sales-filter"
              aria-label="Filter by payment method"
              value={paymentFilter}
              onChange={(event) =>
                setPaymentFilter(event.target.value)
              }
            >
              <option value="All">All Payments</option>

              {paymentFilterOptions.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>

          {loading && (
            <div className="sales-loading" role="status">
              Loading sales...
            </div>
          )}

          {!loading && filteredSales.length === 0 ? (
            <div className="sales-empty">
              <div className="sales-empty-icon">
                <FaCashRegister />
              </div>

              <h2>
                {salesError
                  ? "Unable to load sales"
                  : sales.length
                    ? "No matching sales"
                    : "No POS sales yet"}
              </h2>

              <p>
                {salesError
                  ? "Check the message above and refresh the page to retry."
                  : sales.length
                    ? "Try another search or payment filter."
                    : "Completed transactions from the POS will automatically appear here."}
              </p>
            </div>
          ) : filteredSales.length > 0 ? (
            <div className="sales-table-wrapper">
              <table className="sales-table">
                <thead>
                  <tr>
                    <th>Sale ID</th>
                    <th>Owner</th>
                    <th>Order Details</th>
                    <th>Items</th>
                    <th>Discount</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Delivery</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredSales.map((sale) => {
                    const type = paymentType(
                      sale.paymentMethod
                    );

                    return (
                      <tr key={sale.id}>
                        <td>
                          <span className="sale-id">
                            {sale.id}
                          </span>
                        </td>

                        <td>
                          <div className="sale-owner">
                            <div className="sale-owner-avatar">
                              <FaUser />
                            </div>

                            <div>
                              <strong>{sale.owner}</strong>
                              <span>POS Customer</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div
                            className="sale-products"
                            title={getProductSummary(sale)}
                          >
                            {getProductSummary(sale)}
                          </div>
                        </td>

                        <td>
                          <strong>
                            {getItemsCount(sale)}
                          </strong>
                        </td>

                        <td>
                          <span className="sale-discount">
                            {Number(sale.discount) > 0
                              ? `-$${money(sale.discount)}`
                              : "$0.00"}
                          </span>
                        </td>

                        <td>
                          <span className="sale-total">
                            ${money(sale.total)}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`sale-payment ${type}`}
                          >
                            {type === "cash" ? (
                              <FaMoneyBillWave />
                            ) : type === "card" ? (
                              <FaCreditCard />
                            ) : (
                              <FaDollarSign />
                            )}

                            {sale.paymentMethod || "-"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`sale-delivery ${
                              sale.hasDelivery ? "yes" : ""
                            }`}
                          >
                            {sale.hasDelivery ? (
                              <>
                                <FaTruck />
                                Delivery
                              </>
                            ) : (
                              <>
                                <FaStore />
                                In Clinic
                              </>
                            )}
                          </span>
                        </td>

                        <td>
                          <div className="sale-date">
                            <strong>
                              {formatDate(sale.date)}
                            </strong>
                            <span>
                              {formatTime(sale.date)}
                            </span>
                          </div>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="sale-view"
                            title="View sale"
                            aria-label={`View sale ${sale.id}`}
                            onClick={() =>
                              setSelectedSaleId(sale.id)
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
          ) : null}
        </div>

        {selectedSale && (
          <div
            className="sale-modal-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedSaleId(null);
              }
            }}
          >
            <div
              className="sale-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="sale-modal-heading"
            >
              <div className="sale-modal-header">
                <div className="sale-modal-title">
                  <div className="sale-modal-title-icon">
                    <FaReceipt />
                  </div>

                  <div>
                    <span>POS Sale</span>
                    <h2 id="sale-modal-heading">
                      {selectedSale.id}
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  className="sale-modal-close"
                  aria-label="Close sale details"
                  autoFocus
                  onClick={() => setSelectedSaleId(null)}
                >
                  <FaTimes />
                </button>
              </div>

              <div className="sale-modal-body">
                <div className="sale-modal-summary">
                  <div className="sale-summary-card">
                    <span>Total</span>
                    <strong>
                      ${money(selectedSale.total)}
                    </strong>
                  </div>

                  <div className="sale-summary-card">
                    <span>Items</span>
                    <strong>
                      {getItemsCount(selectedSale)}
                    </strong>
                  </div>

                  <div className="sale-summary-card">
                    <span>Payment</span>
                    <strong>
                      {selectedSale.paymentMethod || "-"}
                    </strong>
                  </div>

                  <div className="sale-summary-card">
                    <span>Date</span>
                    <strong>
                      {formatDate(selectedSale.date)}
                      <br />
                      {formatTime(selectedSale.date)}
                    </strong>
                  </div>
                </div>

                <div className="sale-detail-grid">
                  <div className="sale-detail-card">
                    <h3>
                      <FaUser />
                      Customer Details
                    </h3>

                    <div className="sale-info-row">
                      <span>Owner</span>
                      <strong>{selectedSale.owner}</strong>
                    </div>

                    <div className="sale-info-row">
                      <span>Sale ID</span>
                      <strong>{selectedSale.id}</strong>
                    </div>

                    <div className="sale-info-row">
                      <span>Total Items</span>
                      <strong>
                        {getItemsCount(selectedSale)}
                      </strong>
                    </div>
                  </div>

                  <div className="sale-detail-card">
                    <h3>
                      <FaCreditCard />
                      Payment Details
                    </h3>

                    <div className="sale-info-row">
                      <span>Payment Method</span>
                      <strong>
                        {selectedSale.paymentMethod || "-"}
                      </strong>
                    </div>

                    <div className="sale-info-row">
                      <span>Amount Received</span>
                      <strong>
                        ${money(selectedSale.received)}
                      </strong>
                    </div>

                    <div className="sale-info-row">
                      <span>Change</span>
                      <strong>
                        ${money(selectedSale.change)}
                      </strong>
                    </div>

                    <div className="sale-info-row">
                      <span>Delivery</span>
                      <strong>
                        {selectedSale.hasDelivery
                          ? "Yes"
                          : "No"}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="sale-items-card">
                  <h3>
                    <FaShoppingBag />
                    Products
                  </h3>

                  {selectedSale.items.length ? (
                    selectedSale.items.map((item, index) => (
                      <div
                        className="sale-modal-item"
                        key={item.id || `${item.productId}-${index}`}
                      >
                        <div className="sale-item-image">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                            />
                          ) : (
                            <FaPaw />
                          )}
                        </div>

                        <div className="sale-item-info">
                          <strong>{item.name}</strong>
                          <span>
                            {item.category || "No category"}
                          </span>
                        </div>

                        <div className="sale-item-quantity">
                          {item.quantity} × $
                          {money(item.price)}
                        </div>

                        <div className="sale-item-total">
                          $
                          {money(
                            item.total ??
                              Number(item.price) *
                                Number(item.quantity)
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="sale-no-products">
                      No products found.
                    </p>
                  )}
                </div>

                <div className="sale-totals">
                  <div className="sale-total-row">
                    <span>Subtotal</span>
                    <strong>
                      ${money(selectedSale.subtotal)}
                    </strong>
                  </div>

                  <div className="sale-total-row">
                    <span>Discount</span>
                    <strong>
                      -${money(selectedSale.discount)}
                    </strong>
                  </div>

                  <div className="sale-total-row final">
                    <span>Total</span>
                    <strong>
                      ${money(selectedSale.total)}
                    </strong>
                  </div>

                  <div className="sale-total-row">
                    <span>Received</span>
                    <strong>
                      ${money(selectedSale.received)}
                    </strong>
                  </div>

                  <div className="sale-total-row">
                    <span>Change</span>
                    <strong>
                      ${money(selectedSale.change)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .sales-layout,
        .sales-layout * {
          box-sizing: border-box;
        }

        .sales-layout {
          min-height: 100vh;
          background: #f8fafb;
        }

        .sales-layout > .sales-main {
          min-width: 0;
          min-height: 100vh;
          padding: 28px 30px 50px;
          background: #f8fafb;
        }

        .sales-header {
          margin-bottom: 22px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .sales-header-left h1 {
          margin: 0;
          color: #263b4f;
          font-size: 27px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .sales-header-left p {
          margin: 6px 0 0;
          color: #98a2b3;
          font-size: 11px;
          line-height: 1.6;
        }

        .sales-export {
          width: auto;
          min-width: 90px;
          height: 36px;
          padding: 0 14px;
          border: 1px solid #d9e8e7;
          border-radius: 8px;
          background: #fff;
          color: #11797b;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: 0.2s ease;
        }

        .sales-export svg { font-size: 11px; }

        .sales-export:hover:not(:disabled) {
          background: #e8f7f7;
          border-color: #b9dddd;
          color: #0d696b;
        }

        .sales-export:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .sales-error,
        .sales-warning {
          margin-bottom: 16px;
          padding: 12px 14px;
          border-radius: 8px;
          font-size: 12px;
          line-height: 1.6;
          overflow-wrap: anywhere;
        }

        .sales-error {
          border: 1px solid #fecdca;
          background: #fef3f2;
          color: #b42318;
        }

        .sales-warning {
          border: 1px solid #fedf89;
          background: #fffaeb;
          color: #93370d;
        }

        .sales-loading {
          padding: 14px;
          color: #11797b;
          font-size: 12px;
        }

        .sales-stats {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 18px;
        }

        .sales-stat {
          min-height: 82px;
          padding: 12px 13px;
          border: 1px solid #e4eeee;
          border-radius: 11px;
          background: #fff;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 2px 7px rgba(16,24,40,0.025);
        }

        .sales-stat-icon {
          width: 36px;
          height: 36px;
          min-width: 36px;
          border-radius: 9px;
          background: #eaf8f7;
          color: #159f9f;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
        }

        .sales-stat.cash .sales-stat-icon {
          background: #edf8ef;
          color: #3c9a55;
        }

        .sales-stat.card .sales-stat-icon {
          background: #eef3ff;
          color: #5276c8;
        }

        .sales-stat.today .sales-stat-icon {
          background: #fff6e7;
          color: #d88b25;
        }

        .sales-stat.revenue .sales-stat-icon {
          background: #f2edff;
          color: #7d5bc4;
        }

        .sales-stat-info { min-width: 0; }

        .sales-stat-info span {
          display: block;
          margin-bottom: 4px;
          color: #98a2b3;
          font-size: 8px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.35px;
        }

        .sales-stat-info strong {
          display: block;
          overflow: hidden;
          color: #263b4f;
          font-size: 18px;
          font-weight: 800;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .sales-card {
          overflow: hidden;
          border: 1px solid #e4eeee;
          border-radius: 13px;
          background: #fff;
          box-shadow: 0 3px 12px rgba(16,24,40,0.03);
        }

        .sales-toolbar {
          padding: 14px;
          border-bottom: 1px solid #edf3f3;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .sales-search {
          width: min(460px, 100%);
          height: 38px;
          padding: 0 12px;
          border: 1px solid #dfe9e8;
          border-radius: 8px;
          background: #fff;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sales-search svg {
          flex-shrink: 0;
          color: #159f9f;
          font-size: 11px;
        }

        .sales-search input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: none;
          background: transparent;
          color: #344054;
          font-size: 10px;
        }

        .sales-search input::placeholder {
          color: #a6b0bd;
        }

        .sales-filter {
          min-width: 155px;
          height: 38px;
          padding: 0 10px;
          border: 1px solid #dfe9e8;
          border-radius: 8px;
          outline: none;
          background: #fff;
          color: #475467;
          font-size: 10px;
          font-weight: 650;
          cursor: pointer;
        }

        .sales-table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .sales-table {
          width: 100%;
          min-width: 1120px;
          border-collapse: collapse;
        }

        .sales-table th {
          padding: 11px 12px;
          border-bottom: 1px solid #e9efef;
          background: #fafcfc;
          color: #7c8998;
          text-align: left;
          font-size: 8px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.35px;
          white-space: nowrap;
        }

        .sales-table td {
          padding: 12px;
          border-bottom: 1px solid #f0f4f4;
          color: #475467;
          font-size: 10px;
          vertical-align: middle;
        }

        .sales-table tbody tr {
          transition: 0.15s ease;
        }

        .sales-table tbody tr:hover {
          background: #fbfdfd;
        }

        .sales-table tbody tr:last-child td {
          border-bottom: 0;
        }

        .sale-id {
          color: #11797b;
          font-size: 9px;
          font-weight: 800;
        }

        .sale-owner {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sale-owner-avatar {
          width: 31px;
          height: 31px;
          min-width: 31px;
          border-radius: 50%;
          background: #eaf8f7;
          color: #159f9f;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
        }

        .sale-owner strong {
          display: block;
          color: #344054;
          font-size: 10px;
          font-weight: 750;
        }

        .sale-owner span {
          display: block;
          margin-top: 2px;
          color: #98a2b3;
          font-size: 8px;
        }

        .sale-products {
          max-width: 260px;
          overflow: hidden;
          color: #667085;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .sale-total {
          color: #263b4f;
          font-size: 11px;
          font-weight: 800;
        }

        .sale-discount {
          color: #d88b25;
          font-size: 10px;
          font-weight: 700;
        }

        .sale-date strong {
          display: block;
          color: #475467;
          font-size: 9px;
        }

        .sale-date span {
          display: block;
          margin-top: 2px;
          color: #98a2b3;
          font-size: 8px;
        }

        .sale-payment,
        .sale-delivery {
          width: fit-content;
          padding: 5px 8px;
          border-radius: 20px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 8px;
          font-weight: 750;
          white-space: nowrap;
        }

        .sale-payment.cash {
          background: #edf8ef;
          color: #398a4f;
        }

        .sale-payment.card {
          background: #eef3ff;
          color: #5276c8;
        }

        .sale-payment.other,
        .sale-delivery {
          background: #f2f4f7;
          color: #667085;
        }

        .sale-delivery.yes {
          background: #fff6e7;
          color: #c17a1c;
        }

        .sale-view {
          width: 30px;
          min-width: 30px;
          height: 30px;
          padding: 0;
          border: 1px solid #dce8e8;
          border-radius: 7px;
          background: #fff;
          color: #159f9f;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: 0.15s ease;
        }

        .sale-view:hover {
          border-color: #a9deda;
          background: #eff9f8;
        }

        .sales-empty {
          min-height: 350px;
          padding: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .sales-empty-icon {
          width: 65px;
          height: 65px;
          margin-bottom: 14px;
          border-radius: 50%;
          background: #eff9f8;
          color: #159f9f;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 23px;
        }

        .sales-empty h2 {
          margin: 0;
          color: #344054;
          font-size: 15px;
        }

        .sales-empty p {
          max-width: 370px;
          margin: 7px 0 0;
          color: #98a2b3;
          font-size: 10px;
          line-height: 1.6;
        }

        .sale-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          padding: 25px;
          background: rgba(16,24,40,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sale-modal {
          width: min(780px, 96vw);
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 14px;
          background: #fff;
          box-shadow: 0 25px 70px rgba(16,24,40,0.22);
        }

        .sale-modal-header {
          position: sticky;
          top: 0;
          z-index: 5;
          padding: 16px 18px;
          border-bottom: 1px solid #e9efef;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .sale-modal-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sale-modal-title-icon {
          width: 38px;
          height: 38px;
          border-radius: 9px;
          background: #eaf8f7;
          color: #159f9f;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sale-modal-title span {
          display: block;
          color: #98a2b3;
          font-size: 8px;
          text-transform: uppercase;
          font-weight: 750;
        }

        .sale-modal-title h2 {
          margin: 3px 0 0;
          color: #263b4f;
          font-size: 15px;
        }

        .sale-modal-close {
          width: 31px;
          min-width: 31px;
          height: 31px;
          padding: 0;
          border: 1px solid #e4eeee;
          border-radius: 8px;
          background: #fff;
          color: #667085;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .sale-modal-close:hover {
          background: #f2f4f7;
        }

        .sale-modal-body { padding: 18px; }

        .sale-modal-summary {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 16px;
        }

        .sale-summary-card {
          min-width: 0;
          padding: 12px;
          border: 1px solid #e4eeee;
          border-radius: 9px;
          background: #f9fcfc;
        }

        .sale-summary-card span {
          display: block;
          margin-bottom: 6px;
          color: #98a2b3;
          font-size: 8px;
          font-weight: 750;
          text-transform: uppercase;
        }

        .sale-summary-card strong {
          color: #263b4f;
          font-size: 12px;
          line-height: 1.6;
          overflow-wrap: anywhere;
        }

        .sale-detail-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }

        .sale-detail-card,
        .sale-items-card {
          min-width: 0;
          padding: 14px;
          border: 1px solid #e4eeee;
          border-radius: 10px;
          background: #fff;
        }

        .sale-detail-card h3,
        .sale-items-card h3 {
          margin: 0 0 12px;
          color: #344054;
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
        }

        .sale-detail-card h3 svg,
        .sale-items-card h3 svg {
          color: #159f9f;
        }

        .sale-info-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
          padding: 7px 0;
          font-size: 9px;
        }

        .sale-info-row span { color: #98a2b3; }

        .sale-info-row strong {
          color: #475467;
          text-align: right;
          overflow-wrap: anywhere;
        }

        .sale-items-card { margin-bottom: 16px; }

        .sale-modal-item {
          display: grid;
          grid-template-columns: 42px minmax(0, 1fr) auto auto;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #edf3f3;
        }

        .sale-modal-item:last-child { border-bottom: 0; }

        .sale-item-image {
          width: 42px;
          height: 42px;
          overflow: hidden;
          border-radius: 8px;
          background: #eaf8f7;
          color: #159f9f;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sale-item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .sale-item-info { min-width: 0; }

        .sale-item-info strong {
          display: block;
          color: #344054;
          font-size: 10px;
          overflow-wrap: anywhere;
        }

        .sale-item-info span {
          display: block;
          margin-top: 4px;
          color: #98a2b3;
          font-size: 8px;
          overflow-wrap: anywhere;
        }

        .sale-item-quantity {
          color: #667085;
          font-size: 9px;
          white-space: nowrap;
        }

        .sale-item-total {
          color: #263b4f;
          font-size: 10px;
          font-weight: 800;
          text-align: right;
        }

        .sale-no-products {
          padding: 15px 0;
          color: #98a2b3;
          font-size: 9px;
        }

        .sale-totals {
          margin-left: auto;
          width: min(320px, 100%);
          padding: 14px;
          border: 1px solid #e4eeee;
          border-radius: 10px;
          background: #f9fcfc;
        }

        .sale-total-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 7px 0;
          color: #667085;
          font-size: 10px;
        }

        .sale-total-row strong { color: #344054; }

        .sale-total-row.final {
          margin: 5px 0;
          padding: 12px 0;
          border-top: 1px solid #dcebea;
          border-bottom: 1px solid #dcebea;
          color: #11797b;
          font-size: 14px;
          font-weight: 800;
        }

        .sale-total-row.final strong { color: #11797b; }

        @media (max-width: 1150px) {
          .sales-stats {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .sale-modal-summary {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 1000px) {
          .sales-layout > .sales-main {
            padding: 65px 18px 40px;
          }

          .sales-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
          .sales-layout > .sales-main {
            padding: 65px 12px 35px;
          }

          .sales-header-left h1 { font-size: 23px; }

          .sales-export {
            min-width: 82px;
            height: 34px;
            padding: 0 11px;
            font-size: 10px;
          }

          .sales-stats { grid-template-columns: 1fr; }

          .sales-toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .sales-search,
          .sales-filter { width: 100%; }

          .sale-detail-grid { grid-template-columns: 1fr; }

          .sale-modal-overlay { padding: 10px; }
          .sale-modal-body { padding: 13px; }

          .sale-modal-item {
            grid-template-columns: 42px minmax(0, 1fr) auto;
          }

          .sale-item-total {
            grid-column: 2 / -1;
            text-align: left;
          }
        }

        @media (max-width: 430px) {
          .sale-modal-summary { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

export default Sales;