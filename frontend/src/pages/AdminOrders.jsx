import { useEffect, useMemo, useState } from "react";

import Sidebar from "../components/Sidebar";

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


/* =========================================================
   STORAGE
========================================================= */

const ORDERS_STORAGE_KEY = "vetClinicStoreOrders";


/* =========================================================
   STATUS OPTIONS
========================================================= */

const STATUS_OPTIONS = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];


/* =========================================================
   LOAD ORDERS
========================================================= */

const loadOrders = () => {
  try {
    const savedOrders = localStorage.getItem(
      ORDERS_STORAGE_KEY
    );

    if (!savedOrders) {
      return [];
    }

    const parsedOrders = JSON.parse(savedOrders);

    return Array.isArray(parsedOrders)
      ? parsedOrders
      : [];
  } catch (error) {
    console.error(
      "Could not load orders:",
      error
    );

    return [];
  }
};


/* =========================================================
   ADMIN ORDERS
========================================================= */

function AdminOrders() {
  const [orders, setOrders] = useState(
    () => loadOrders()
  );

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [
    selectedOrder,
    setSelectedOrder,
  ] = useState(null);


  /* =======================================================
     REFRESH ORDERS INTERNALLY
  ======================================================= */

  const refreshOrders = () => {
    setOrders(loadOrders());
  };


  /* =======================================================
     AUTO UPDATE ORDERS
  ======================================================= */

  useEffect(() => {
    const handleOrdersUpdated = () => {
      refreshOrders();
    };

    window.addEventListener(
      "storage",
      handleOrdersUpdated
    );

    window.addEventListener(
      "vetClinicOrdersUpdated",
      handleOrdersUpdated
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleOrdersUpdated
      );

      window.removeEventListener(
        "vetClinicOrdersUpdated",
        handleOrdersUpdated
      );
    };
  }, []);


  /* =======================================================
     SAVE ORDERS
  ======================================================= */

  const saveOrders = (
    updatedOrders
  ) => {
    setOrders(updatedOrders);

    localStorage.setItem(
      ORDERS_STORAGE_KEY,
      JSON.stringify(updatedOrders)
    );

    window.dispatchEvent(
      new Event(
        "vetClinicOrdersUpdated"
      )
    );
  };


  /* =======================================================
     UPDATE STATUS
  ======================================================= */

  const updateOrderStatus = (
    orderId,
    newStatus
  ) => {
    const updatedOrders =
      orders.map((order) => {
        if (
          order.id !== orderId
        ) {
          return order;
        }

        return {
          ...order,

          status: newStatus,

          statusUpdatedAt:
            new Date().toISOString(),
        };
      });

    saveOrders(updatedOrders);

    if (
      selectedOrder?.id ===
      orderId
    ) {
      setSelectedOrder(
        (current) => ({
          ...current,

          status: newStatus,

          statusUpdatedAt:
            new Date().toISOString(),
        })
      );
    }
  };


  /* =======================================================
     FORMAT DATE
  ======================================================= */

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "-";
    }

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

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "";
    }

    return parsedDate.toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };


  /* =======================================================
     FILTER
  ======================================================= */

  const filteredOrders =
    useMemo(() => {
      const searchValue =
        search
          .trim()
          .toLowerCase();

      return orders.filter(
        (order) => {
          const customerName =
            order.customer
              ?.fullName || "";

          const phone =
            order.customer
              ?.phone || "";

          const orderId =
            String(
              order.id || ""
            );

          const products =
            Array.isArray(
              order.items
            )
              ? order.items
                  .map(
                    (item) =>
                      item.name || ""
                  )
                  .join(" ")
              : "";

          const matchesSearch =
            !searchValue ||
            customerName
              .toLowerCase()
              .includes(
                searchValue
              ) ||
            phone
              .toLowerCase()
              .includes(
                searchValue
              ) ||
            orderId
              .toLowerCase()
              .includes(
                searchValue
              ) ||
            products
              .toLowerCase()
              .includes(
                searchValue
              );

          const matchesStatus =
            statusFilter ===
              "All" ||
            (order.status ||
              "Pending") ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      orders,
      search,
      statusFilter,
    ]);


  /* =======================================================
     STATISTICS
  ======================================================= */

  const totalOrders =
    orders.length;


  const pendingOrders =
    orders.filter(
      (order) =>
        (order.status ||
          "Pending") ===
        "Pending"
    ).length;


  const activeOrders =
    orders.filter(
      (order) =>
        [
          "Confirmed",
          "Preparing",
          "Out for Delivery",
        ].includes(
          order.status
        )
    ).length;


  const deliveredOrders =
    orders.filter(
      (order) =>
        [
          "Delivered",
          "Completed",
        ].includes(
          order.status
        )
    ).length;


  const totalRevenue =
    orders
      .filter(
        (order) =>
          order.status !==
          "Cancelled"
      )
      .reduce(
        (total, order) =>
          total +
          Number(
            order.total || 0
          ),
        0
      );


  /* =======================================================
     STATUS CLASS
  ======================================================= */

  const getStatusClass = (
    status
  ) => {
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


  /* =======================================================
     STATUS ICON
  ======================================================= */

  const getStatusIcon = (
    status
  ) => {
    switch (status) {
      case "Confirmed":
        return (
          <FaCheckCircle />
        );

      case "Preparing":
        return (
          <FaBoxOpen />
        );

      case "Out for Delivery":
        return (
          <FaTruck />
        );

      case "Delivered":
      case "Completed":
        return (
          <FaCheckCircle />
        );

      case "Cancelled":
        return (
          <FaBan />
        );

      default:
        return (
          <FaClock />
        );
    }
  };


  /* =======================================================
     ITEM COUNT
  ======================================================= */

  const getItemCount = (
    order
  ) => {
    if (
      !Array.isArray(
        order.items
      )
    ) {
      return 0;
    }

    return order.items.reduce(
      (total, item) =>
        total +
        Number(
          item.quantity || 0
        ),
      0
    );
  };


  /* =======================================================
     PRODUCT SUMMARY
  ======================================================= */

  const getProductSummary = (
    order
  ) => {
    if (
      !Array.isArray(
        order.items
      ) ||
      order.items.length === 0
    ) {
      return "-";
    }

    return order.items
      .map(
        (item) =>
          `${item.quantity || 1}× ${
            item.name || "Product"
          }`
      )
      .join(", ");
  };


  /* =======================================================
     EXPORT ORDERS
  ======================================================= */

  const exportOrders = () => {
    const ordersToExport =
      filteredOrders.length > 0
        ? filteredOrders
        : orders;

    if (
      ordersToExport.length === 0
    ) {
      alert(
        "There are no orders to export."
      );

      return;
    }

    const escapeCSV = (
      value
    ) => {
      const text =
        String(
          value ?? ""
        );

      return `"${text.replace(
        /"/g,
        '""'
      )}"`;
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


    const rows =
      ordersToExport.map(
        (order) => [
          order.id || "",

          order.customer
            ?.fullName || "",

          order.customer
            ?.phone || "",

          getProductSummary(
            order
          ),

          Number(
            order.subtotal || 0
          ).toFixed(2),

          Number(
            order.deliveryFee || 0
          ).toFixed(2),

          Number(
            order.total || 0
          ).toFixed(2),

          formatDate(
            order.date
          ),

          formatTime(
            order.date
          ),

          order.deliveryMethod ===
          "pickup"
            ? "Clinic Pickup"
            : "Home Delivery",

          order.address || "",

          order.addressDetails ||
            "",

          order.paymentMethod ===
          "cash"
            ? "Cash"
            : order.paymentMethod ||
              "",

          order.notes || "",

          order.status ||
            "Pending",
        ]
      );


    const csvContent = [
      headers,
      ...rows,
    ]
      .map(
        (row) =>
          row
            .map(
              escapeCSV
            )
            .join(",")
      )
      .join("\n");


    const blob =
      new Blob(
        [
          "\uFEFF" +
            csvContent,
        ],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        "a"
      );


    const today =
      new Date()
        .toISOString()
        .slice(0, 10);


    link.href = url;

    link.download =
      `vet-clinic-orders-${today}.csv`;


    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(
      url
    );
  };


  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="admin-orders-page">

      <style>{`

        * {
          box-sizing: border-box;
        }

        .admin-orders-page {
          min-height: 100vh;
          background: #f7fafb;
          color: #263b4f;
          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }


        /* ===============================================
           MAIN
        =============================================== */

        .admin-orders-main {
          margin-left: 280px;
          width: calc(100% - 280px);
          min-height: 100vh;
          padding: 28px 30px 50px;
        }


        /* ===============================================
           HEADER
        =============================================== */

        .admin-orders-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 20px;
        }

        .admin-orders-header-left h1 {
          margin: 0;
          color: #183b4d;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.7px;
        }

        .admin-orders-header-left p {
          margin: 6px 0 0;
          color: #7b8b98;
          font-size: 12px;
          line-height: 1.55;
        }


        /* ===============================================
           EXPORT BUTTON - SMALL
        =============================================== */

        .admin-orders-export {
          width: auto;
          min-width: 90px;
          height: 36px;
        
          padding: 0 14px;
        
          border: 1px solid #d9e8e7;
          border-radius: 8px;
        
          background: #ffffff;
          color: #11797b;
        
          display: inline-flex;
          align-items: center;
          justify-content: center;
        
          gap: 6px;
        
          font-size: 11px;
          font-weight: 700;
        
          cursor: pointer;
          white-space: nowrap;
        
          flex: 0 0 auto;
          align-self: flex-start;
        
          transition: 0.2s ease;
        }
        
        .admin-orders-export svg {
          font-size: 11px;
        }
        
        .admin-orders-export:hover {
          background: #e8f7f7;
          border-color: #b9dddd;
          color: #0d696b;
        }


        /* ===============================================
           STATISTICS
        =============================================== */

        .admin-orders-stats {
          display: grid;

          grid-template-columns:
            repeat(
              5,
              minmax(0, 1fr)
            );

          gap: 10px;

          margin-bottom: 18px;
        }

        .admin-order-stat {
          min-width: 0;
          min-height: 82px;

          padding: 12px 13px;

          border:
            1px solid #e3eeee;

          border-radius: 12px;

          background: #ffffff;

          box-shadow:
            0 3px 12px
            rgba(
              20,
              85,
              88,
              0.04
            );

          display: flex;
          align-items: center;

          gap: 10px;
        }

        .admin-order-stat-icon {
          width: 36px;
          height: 36px;
          min-width: 36px;

          border-radius: 9px;

          background: #e8f7f7;
          color: #1aa6a6;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          font-size: 14px;
        }

        .admin-order-stat.pending
        .admin-order-stat-icon {
          background: #fff7e6;
          color: #f59e0b;
        }

        .admin-order-stat.active
        .admin-order-stat-icon {
          background: #eef4ff;
          color: #4f72d8;
        }

        .admin-order-stat.delivered
        .admin-order-stat-icon {
          background: #eaf8ef;
          color: #2f9e5b;
        }

        .admin-order-stat.revenue
        .admin-order-stat-icon {
          background: #f1edff;
          color: #7557c8;
        }

        .admin-order-stat-info {
          min-width: 0;
          overflow: hidden;
        }

        .admin-order-stat-info span {
          display: block;

          color: #8a99a6;

          font-size: 8px;
          font-weight: 800;

          text-transform: uppercase;

          letter-spacing: 0.45px;

          white-space: nowrap;
        }

        .admin-order-stat-info strong {
          display: block;

          margin-top: 4px;

          color: #263b4f;

          font-size: 18px;
          font-weight: 800;

          line-height: 1.15;

          white-space: nowrap;

          overflow: hidden;

          text-overflow: ellipsis;
        }


        /* ===============================================
           CARD
        =============================================== */

        .admin-orders-card {
          border: 1px solid #e1ecec;

          border-radius: 14px;

          background: #ffffff;

          box-shadow:
            0 5px 20px
            rgba(
              18,
              76,
              80,
              0.05
            );

          overflow: hidden;
        }


        /* ===============================================
           TOOLBAR
        =============================================== */

        .admin-orders-toolbar {
          padding: 14px 16px;

          border-bottom:
            1px solid #edf3f3;

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 12px;
        }

        .admin-orders-search {
          width: 310px;
          height: 38px;

          position: relative;
        }

        .admin-orders-search svg {
          position: absolute;

          top: 50%;
          left: 13px;

          transform:
            translateY(-50%);

          color: #98a7b3;

          font-size: 11px;
        }

        .admin-orders-search input {
          width: 100%;
          height: 100%;

          padding:
            0 13px 0 36px;

          border:
            1px solid #dce8e8;

          border-radius: 9px;

          outline: none;

          background: #ffffff;

          color: #263b4f;

          font-size: 11px;

          transition:
            0.2s ease;
        }

        .admin-orders-search input:focus {
          border-color: #1aa6a6;

          box-shadow:
            0 0 0 3px
            rgba(
              26,
              166,
              166,
              0.09
            );
        }

        .admin-orders-filter {
          height: 38px;

          padding: 0 11px;

          border:
            1px solid #dce8e8;

          border-radius: 9px;

          outline: none;

          background: #ffffff;

          color: #475467;

          font-size: 10px;
          font-weight: 650;

          cursor: pointer;
        }


        /* ===============================================
           TABLE
        =============================================== */

        .admin-orders-table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .admin-orders-table {
          width: 100%;

          min-width: 1120px;

          border-collapse:
            collapse;
        }

        .admin-orders-table th {
          padding: 11px 12px;

          border-bottom:
            1px solid #e9f0f0;

          background: #f8fbfb;

          color: #7b8b98;

          text-align: left;

          font-size: 8px;
          font-weight: 800;

          text-transform:
            uppercase;

          letter-spacing: 0.5px;

          white-space: nowrap;
        }

        .admin-orders-table td {
          padding: 12px;

          border-bottom:
            1px solid #edf3f3;

          color: #475467;

          vertical-align:
            middle;

          font-size: 10px;
        }

        .admin-orders-table tbody tr {
          transition:
            background 0.18s ease;
        }

        .admin-orders-table tbody tr:hover {
          background: #fbfdfd;
        }

        .admin-orders-table tbody tr:last-child td {
          border-bottom: none;
        }


        /* ===============================================
           ORDER ID
        =============================================== */

        .admin-order-id {
          color: #11797b;

          font-size: 10px;
          font-weight: 800;

          white-space: nowrap;
        }


        /* ===============================================
           CUSTOMER
        =============================================== */

        .admin-order-customer {
          display: flex;

          align-items: center;

          gap: 8px;

          min-width: 145px;
        }

        .admin-order-customer-avatar {
          width: 31px;
          height: 31px;
          min-width: 31px;

          border-radius: 50%;

          background: #e8f7f7;
          color: #1aa6a6;

          display: flex;

          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          font-size: 11px;
        }

        .admin-order-customer strong {
          display: block;

          color: #263b4f;

          font-size: 10px;
          font-weight: 750;
        }

        .admin-order-customer span {
          display: block;

          margin-top: 2px;

          color: #98a2b3;

          font-size: 8px;
        }


        /* ===============================================
           PRODUCTS
        =============================================== */

        .admin-order-products {
          max-width: 220px;

          color: #667785;

          line-height: 1.45;

          display: -webkit-box;

          -webkit-line-clamp: 2;

          -webkit-box-orient:
            vertical;

          overflow: hidden;
        }


        /* ===============================================
           PRICE
        =============================================== */

        .admin-order-price {
          color: #263b4f;

          font-size: 11px;
          font-weight: 800;

          white-space: nowrap;
        }


        /* ===============================================
           DATE
        =============================================== */

        .admin-order-date strong {
          display: block;

          color: #475467;

          font-size: 9px;
        }

        .admin-order-date span {
          display: block;

          margin-top: 2px;

          color: #98a2b3;

          font-size: 8px;
        }


        /* ===============================================
           NOTE
        =============================================== */

        .admin-order-note {
          max-width: 150px;

          color: #7b8b98;

          line-height: 1.45;

          overflow: hidden;

          text-overflow:
            ellipsis;

          white-space: nowrap;
        }


        /* ===============================================
           STATUS
        =============================================== */

        .admin-order-status-select {
          min-width: 125px;

          height: 31px;

          padding: 0 7px;

          border:
            1px solid transparent;

          border-radius: 7px;

          outline: none;

          font-size: 8px;
          font-weight: 800;

          cursor: pointer;
        }

        .admin-order-status-select.pending {
          border-color: #f5dfad;
          background: #fff8e8;
          color: #b77900;
        }

        .admin-order-status-select.confirmed {
          border-color: #bfd4ff;
          background: #eef4ff;
          color: #3f65bd;
        }

        .admin-order-status-select.preparing {
          border-color: #d5c9ff;
          background: #f3efff;
          color: #7357c2;
        }

        .admin-order-status-select.delivery {
          border-color: #b9dfdd;
          background: #eaf8f7;
          color: #11797b;
        }

        .admin-order-status-select.delivered {
          border-color: #bee5cc;
          background: #eaf8ef;
          color: #2b8d50;
        }

        .admin-order-status-select.cancelled {
          border-color: #f4c6c6;
          background: #fff0f0;
          color: #c73d3d;
        }


        /* ===============================================
           ACTION
        =============================================== */

        .admin-order-view {
          width: 31px;
          height: 31px;

          border:
            1px solid #d9e8e7;

          border-radius: 7px;

          background: #ffffff;
          color: #1aa6a6;

          display: flex;

          align-items: center;
          justify-content: center;

          cursor: pointer;

          transition:
            0.18s ease;

          font-size: 11px;
        }

        .admin-order-view:hover {
          border-color: #1aa6a6;
          background: #e8f7f7;
        }


        /* ===============================================
           EMPTY
        =============================================== */

        .admin-orders-empty {
          min-height: 260px;

          padding: 30px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          text-align: center;
        }

        .admin-orders-empty-icon {
          width: 58px;
          height: 58px;

          margin-bottom: 13px;

          border-radius: 50%;

          background: #e8f7f7;
          color: #1aa6a6;

          display: flex;

          align-items: center;
          justify-content: center;

          font-size: 21px;
        }

        .admin-orders-empty h2 {
          margin: 0;

          color: #263b4f;

          font-size: 16px;
        }

        .admin-orders-empty p {
          margin: 6px 0 0;

          color: #8a99a6;

          font-size: 10px;
        }


        /* ===============================================
           MODAL
        =============================================== */

        .admin-order-modal-overlay {
          position: fixed;

          inset: 0;

          z-index: 5000;

          padding: 30px;

          background:
            rgba(
              20,
              37,
              48,
              0.55
            );

          backdrop-filter:
            blur(3px);

          display: flex;

          align-items: center;

          justify-content: center;
        }

        .admin-order-modal {
          width:
            min(
              920px,
              100%
            );

          max-height: 90vh;

          border-radius: 18px;

          background: #ffffff;

          box-shadow:
            0 24px 80px
            rgba(
              16,
              24,
              40,
              0.22
            );

          overflow-y: auto;
        }

        .admin-order-modal-header {
          padding: 20px 22px;

          border-bottom:
            1px solid #edf2f2;

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 15px;

          position: sticky;

          top: 0;

          z-index: 5;

          background: #ffffff;
        }

        .admin-order-modal-title {
          display: flex;

          align-items: center;

          gap: 12px;
        }

        .admin-order-modal-title-icon {
          width: 42px;
          height: 42px;

          border-radius: 11px;

          background: #e8f7f7;
          color: #1aa6a6;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 15px;
        }

        .admin-order-modal-title span {
          display: block;

          color: #98a2b3;

          font-size: 9px;
          font-weight: 750;

          text-transform:
            uppercase;
        }

        .admin-order-modal-title h2 {
          margin: 3px 0 0;

          color: #263b4f;

          font-size: 18px;
          font-weight: 800;
        }

        .admin-order-modal-close {
          width: 36px;
          height: 36px;

          border: none;

          border-radius: 50%;

          background: #f4f7f7;
          color: #667785;

          display: flex;

          align-items: center;

          justify-content: center;

          cursor: pointer;
        }

        .admin-order-modal-close:hover {
          background: #e8eeee;
          color: #263b4f;
        }

        .admin-order-modal-body {
          padding: 22px;
        }


        /* ===============================================
           MODAL TOP
        =============================================== */

        .admin-order-modal-top {
          display: grid;

          grid-template-columns:
            repeat(
              4,
              minmax(0, 1fr)
            );

          gap: 12px;

          margin-bottom: 20px;
        }

        .admin-order-modal-summary {
          min-height: 85px;

          padding: 14px;

          border:
            1px solid #e5eeee;

          border-radius: 12px;

          background: #fbfdfd;
        }

        .admin-order-modal-summary span {
          display: block;

          color: #98a2b3;

          font-size: 9px;
          font-weight: 700;

          text-transform:
            uppercase;
        }

        .admin-order-modal-summary strong {
          display: block;

          margin-top: 7px;

          color: #263b4f;

          font-size: 12px;

          line-height: 1.5;
        }


        /* ===============================================
           DETAIL GRID
        =============================================== */

        .admin-order-details-grid {
          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );

          gap: 16px;

          margin-bottom: 18px;
        }

        .admin-order-detail-card {
          padding: 18px;

          border:
            1px solid #e4eeee;

          border-radius: 13px;

          background: #ffffff;
        }

        .admin-order-detail-card h3 {
          margin: 0 0 15px;

          color: #263b4f;

          font-size: 12px;
          font-weight: 800;

          display: flex;

          align-items: center;

          gap: 8px;
        }

        .admin-order-detail-card h3 svg {
          color: #1aa6a6;
        }

        .admin-order-info-row {
          padding: 9px 0;

          border-bottom:
            1px solid #edf3f3;

          display: flex;

          justify-content:
            space-between;

          gap: 15px;
        }

        .admin-order-info-row:last-child {
          border-bottom: none;
        }

        .admin-order-info-row span {
          color: #98a2b3;

          font-size: 9px;
        }

        .admin-order-info-row strong {
          max-width: 65%;

          color: #475467;

          text-align: right;

          font-size: 10px;

          line-height: 1.5;

          word-break: break-word;
        }


        /* ===============================================
           P2 STARTS FROM ITEMS CSS
        =============================================== */
        /* ===============================================
        ITEMS
     =============================================== */

     .admin-order-items-card {
       margin-bottom: 18px;

       padding: 18px;

       border: 1px solid #e4eeee;

       border-radius: 13px;

       background: #ffffff;
     }

     .admin-order-items-card h3 {
       margin: 0 0 15px;

       color: #263b4f;

       font-size: 12px;
       font-weight: 800;

       display: flex;

       align-items: center;

       gap: 8px;
     }

     .admin-order-items-card h3 svg {
       color: #1aa6a6;
     }

     .admin-order-modal-item {
       padding: 11px 0;

       border-bottom:
         1px solid #edf3f3;

       display: grid;

       grid-template-columns:
         50px
         minmax(0, 1fr)
         auto
         auto;

       align-items: center;

       gap: 12px;
     }

     .admin-order-modal-item:last-child {
       border-bottom: none;
     }

     .admin-order-modal-item-image {
       width: 46px;
       height: 46px;

       border-radius: 9px;

       background: #eef8f7;
       color: #1aa6a6;

       display: flex;

       align-items: center;

       justify-content: center;

       overflow: hidden;
     }

     .admin-order-modal-item-image img {
       width: 100%;
       height: 100%;

       object-fit: cover;

       display: block;
     }

     .admin-order-modal-item-info {
       min-width: 0;
     }

     .admin-order-modal-item-info strong {
       display: block;

       color: #263b4f;

       font-size: 11px;

       font-weight: 750;
     }

     .admin-order-modal-item-info span {
       display: block;

       margin-top: 4px;

       color: #98a2b3;

       font-size: 9px;
     }

     .admin-order-modal-item-qty {
       color: #667785;

       font-size: 10px;

       white-space: nowrap;
     }

     .admin-order-modal-item-price {
       min-width: 70px;

       color: #263b4f;

       text-align: right;

       font-size: 11px;

       font-weight: 800;

       white-space: nowrap;
     }


     /* ===============================================
        NOTES
     =============================================== */

     .admin-order-note-card {
       margin-bottom: 18px;

       padding: 17px;

       border: 1px solid #e4eeee;

       border-radius: 13px;

       background: #fbfdfd;
     }

     .admin-order-note-card h3 {
       margin: 0 0 9px;

       color: #263b4f;

       font-size: 11px;

       font-weight: 800;

       display: flex;

       align-items: center;

       gap: 7px;
     }

     .admin-order-note-card h3 svg {
       color: #1aa6a6;
     }

     .admin-order-note-card p {
       margin: 0;

       color: #667785;

       font-size: 10px;

       line-height: 1.7;
     }


     /* ===============================================
        TOTALS
     =============================================== */

     .admin-order-totals {
       margin-left: auto;

       width: min(
         360px,
         100%
       );

       padding: 17px;

       border-radius: 13px;

       background: #f7fbfb;
     }

     .admin-order-total-row {
       padding: 7px 0;

       display: flex;

       justify-content:
         space-between;

       gap: 15px;

       color: #667785;

       font-size: 10px;
     }

     .admin-order-total-row strong {
       color: #475467;
     }

     .admin-order-total-row.final {
       margin-top: 7px;

       padding-top: 13px;

       border-top:
         1px solid #dce8e8;

       color: #263b4f;

       font-size: 14px;

       font-weight: 800;
     }

     .admin-order-total-row.final strong {
       color: #263b4f;
     }


     /* ===============================================
        MODAL STATUS
     =============================================== */

     .admin-order-modal-status {
       margin-top: 20px;

       padding-top: 18px;

       border-top:
         1px solid #edf3f3;

       display: flex;

       align-items: center;

       justify-content:
         space-between;

       gap: 15px;
     }

     .admin-order-modal-status div span {
       display: block;

       color: #98a2b3;

       font-size: 9px;

       text-transform: uppercase;

       font-weight: 750;
     }

     .admin-order-modal-status div strong {
       display: flex;

       align-items: center;

       gap: 7px;

       margin-top: 5px;

       color: #263b4f;

       font-size: 11px;
     }

     .admin-order-modal-status div strong svg {
       color: #1aa6a6;
     }

     .admin-order-modal-status select {
       min-width: 190px;

       height: 40px;

       padding: 0 10px;

       border:
         1px solid #dce8e8;

       border-radius: 9px;

       outline: none;

       background: #ffffff;

       color: #475467;

       font-size: 10px;

       font-weight: 700;

       cursor: pointer;
     }


     /* ===============================================
        RESPONSIVE
     =============================================== */

     @media (max-width: 1350px) {

       .admin-orders-stats {
         grid-template-columns:
           repeat(
             5,
             minmax(0, 1fr)
           );

         gap: 8px;
       }

       .admin-order-stat {
         min-height: 78px;

         padding: 10px 11px;

         gap: 8px;
       }

       .admin-order-stat-icon {
         width: 32px;
         height: 32px;
         min-width: 32px;

         font-size: 12px;
       }

       .admin-order-stat-info span {
         font-size: 7px;
       }

       .admin-order-stat-info strong {
         font-size: 16px;
       }

     }


     @media (max-width: 1150px) {

       .admin-orders-stats {
         grid-template-columns:
           repeat(
             3,
             minmax(0, 1fr)
           );
       }

     }


     @media (max-width: 1000px) {

       .admin-orders-main {
         margin-left: 0;

         width: 100%;

         padding:
           25px 20px 50px;
       }

       .admin-orders-stats {
         grid-template-columns:
           repeat(
             2,
             minmax(0, 1fr)
           );
       }

       .admin-order-modal-top {
         grid-template-columns:
           repeat(
             2,
             minmax(0, 1fr)
           );
       }

     }


     @media (max-width: 700px) {

       .admin-orders-main {
         padding:
           20px 14px 40px;
       }

       .admin-orders-header {
         flex-direction: column;

         margin-bottom: 16px;
       }

       .admin-orders-header-left h1 {
         font-size: 24px;
       }

       /* Export stays small on mobile too */

       .admin-orders-export {
         width: auto;
         min-width: 0;

         height: 27px;

         padding: 0 8px;

         border-radius: 6px;

         gap: 4px;

         font-size: 8px;

         flex: 0 0 auto;

         align-self: flex-start;
       }

       .admin-orders-export svg {
         width: 8px;
         height: 8px;

         font-size: 8px;
       }

       .admin-orders-stats {
         grid-template-columns: 1fr;

         gap: 8px;

         margin-bottom: 14px;
       }

       .admin-order-stat {
         min-height: 68px;

         padding: 9px 11px;
       }

       .admin-orders-toolbar {
         flex-direction: column;

         align-items: stretch;
       }

       .admin-orders-search {
         width: 100%;
       }

       .admin-orders-filter {
         width: 100%;
       }

       .admin-order-modal-overlay {
         padding: 12px;
       }

       .admin-order-modal-body {
         padding: 15px;
       }

       .admin-order-modal-top,
       .admin-order-details-grid {
         grid-template-columns: 1fr;
       }

       .admin-order-modal-item {
         grid-template-columns:
           45px
           minmax(0, 1fr)
           auto;
       }

       .admin-order-modal-item-price {
         grid-column:
           2 / -1;

         text-align: left;
       }

       .admin-order-modal-status {
         flex-direction: column;

         align-items: stretch;
       }

       .admin-order-modal-status select {
         width: 100%;
       }

     }

   `}</style>


   {/* ===============================================
       SIDEBAR
   ================================================ */}

   <Sidebar />


   {/* ===============================================
       MAIN
   ================================================ */}

   <main className="admin-orders-main">


     {/* =============================================
         HEADER
     ============================================== */}

     <div className="admin-orders-header">

       <div className="admin-orders-header-left">

         <h1>
           Orders
         </h1>

         <p>
           Manage and track all customer
           orders placed through the store.
         </p>

       </div>


       {/* SMALL EXPORT BUTTON */}

       <button
         type="button"
         className="admin-orders-export"
         onClick={exportOrders}
         title="Export orders"
       >
         <FaFileExport />

         <span>
           Export
         </span>
       </button>

     </div>


     {/* =============================================
         STATISTICS
     ============================================== */}

     <div className="admin-orders-stats">


       {/* TOTAL ORDERS */}

       <div className="admin-order-stat">

         <div className="admin-order-stat-icon">
           <FaReceipt />
         </div>

         <div className="admin-order-stat-info">

           <span>
             Total Orders
           </span>

           <strong>
             {totalOrders}
           </strong>

         </div>

       </div>


       {/* PENDING */}

       <div className="admin-order-stat pending">

         <div className="admin-order-stat-icon">
           <FaClock />
         </div>

         <div className="admin-order-stat-info">

           <span>
             Pending
           </span>

           <strong>
             {pendingOrders}
           </strong>

         </div>

       </div>


       {/* ACTIVE */}

       <div className="admin-order-stat active">

         <div className="admin-order-stat-icon">
           <FaTruck />
         </div>

         <div className="admin-order-stat-info">

           <span>
             Active
           </span>

           <strong>
             {activeOrders}
           </strong>

         </div>

       </div>


       {/* DELIVERED */}

       <div className="admin-order-stat delivered">

         <div className="admin-order-stat-icon">
           <FaCheckCircle />
         </div>

         <div className="admin-order-stat-info">

           <span>
             Delivered
           </span>

           <strong>
             {deliveredOrders}
           </strong>

         </div>

       </div>


       {/* ORDER VALUE */}

       <div className="admin-order-stat revenue">

         <div className="admin-order-stat-icon">
           <FaDollarSign />
         </div>

         <div className="admin-order-stat-info">

           <span>
             Order Value
           </span>

           <strong>
             $
             {totalRevenue.toFixed(
               2
             )}
           </strong>

         </div>

       </div>

     </div>


     {/* =============================================
         ORDERS CARD
     ============================================== */}

     <section className="admin-orders-card">


       {/* TOOLBAR */}

       <div className="admin-orders-toolbar">

         <div className="admin-orders-search">

           <FaSearch />

           <input
             type="text"
             placeholder="Search order, customer, phone or product..."
             value={search}
             onChange={(event) =>
               setSearch(
                 event.target.value
               )
             }
           />

         </div>


         <select
           className="admin-orders-filter"
           value={statusFilter}
           onChange={(event) =>
             setStatusFilter(
               event.target.value
             )
           }
         >

           <option value="All">
             All Statuses
           </option>

           {STATUS_OPTIONS.map(
             (status) => (

               <option
                 key={status}
                 value={status}
               >
                 {status}
               </option>

             )
           )}

         </select>

       </div>


       {/* EMPTY */}

       {filteredOrders.length === 0 ? (

         <div className="admin-orders-empty">

           <div className="admin-orders-empty-icon">
             <FaShoppingBag />
           </div>

           <h2>
             No orders found
           </h2>

           <p>
             Store orders will appear here
             automatically after customers
             place an order.
           </p>

         </div>

       ) : (

         /* TABLE */

         <div className="admin-orders-table-wrapper">

           <table className="admin-orders-table">

             <thead>

               <tr>

                 <th>
                   Order ID
                 </th>

                 <th>
                   Customer
                 </th>

                 <th>
                   Phone
                 </th>

                 <th>
                   Order Details
                 </th>

                 <th>
                   Total
                 </th>

                 <th>
                   Date
                 </th>

                 <th>
                   Note
                 </th>

                 <th>
                   Status
                 </th>

                 <th>
                   Action
                 </th>

               </tr>

             </thead>


             <tbody>

               {filteredOrders.map(
                 (order) => {

                   const status =
                     order.status ||
                     "Pending";

                   return (

                     <tr key={order.id}>


                       {/* ORDER ID */}

                       <td>

                         <span className="admin-order-id">
                           {order.id}
                         </span>

                       </td>


                       {/* CUSTOMER */}

                       <td>

                         <div className="admin-order-customer">

                           <div className="admin-order-customer-avatar">
                             <FaUser />
                           </div>

                           <div>

                             <strong>
                               {order
                                 .customer
                                 ?.fullName ||
                                 "-"}
                             </strong>

                             <span>

                               {getItemCount(
                                 order
                               )}{" "}

                               item

                               {getItemCount(
                                 order
                               ) !== 1
                                 ? "s"
                                 : ""}

                             </span>

                           </div>

                         </div>

                       </td>


                       {/* PHONE */}

                       <td>

                         {order
                           .customer
                           ?.phone ||
                           "-"}

                       </td>


                       {/* PRODUCTS */}

                       <td>

                         <div className="admin-order-products">

                           {getProductSummary(
                             order
                           )}

                         </div>

                       </td>


                       {/* TOTAL */}

                       <td>

                         <span className="admin-order-price">

                           $
                           {Number(
                             order.total ||
                               0
                           ).toFixed(
                             2
                           )}

                         </span>

                       </td>


                       {/* DATE */}

                       <td>

                         <div className="admin-order-date">

                           <strong>

                             {formatDate(
                               order.date
                             )}

                           </strong>

                           <span>

                             {formatTime(
                               order.date
                             )}

                           </span>

                         </div>

                       </td>


                       {/* NOTE */}

                       <td>

                         <div
                           className="admin-order-note"
                           title={
                             order.notes ||
                             ""
                           }
                         >

                           {order.notes ||
                             "-"}

                         </div>

                       </td>


                       {/* STATUS */}

                       <td>

                         <select
                           className={`admin-order-status-select ${getStatusClass(
                             status
                           )}`}
                           value={
                             status ===
                             "Completed"
                               ? "Delivered"
                               : status
                           }
                           onChange={(
                             event
                           ) =>
                             updateOrderStatus(
                               order.id,
                               event
                                 .target
                                 .value
                             )
                           }
                         >

                           {STATUS_OPTIONS.map(
                             (
                               option
                             ) => (

                               <option
                                 key={
                                   option
                                 }
                                 value={
                                   option
                                 }
                               >
                                 {option}
                               </option>

                             )
                           )}

                         </select>

                       </td>


                       {/* VIEW */}

                       <td>

                         <button
                           type="button"
                           className="admin-order-view"
                           title="View Order"
                           onClick={() =>
                             setSelectedOrder(
                               order
                             )
                           }
                         >
                           <FaEye />
                         </button>

                       </td>

                     </tr>

                   );
                 }
               )}

             </tbody>

           </table>

         </div>

       )}

     </section>

   </main>


   {/* ===============================================
       VIEW ORDER MODAL
   ================================================ */}

   {selectedOrder && (

     <div
       className="admin-order-modal-overlay"
       onClick={() =>
         setSelectedOrder(
           null
         )
       }
     >

       <div
         className="admin-order-modal"
         onClick={(event) =>
           event.stopPropagation()
         }
       >


         {/* MODAL HEADER */}

         <div className="admin-order-modal-header">

           <div className="admin-order-modal-title">

             <div className="admin-order-modal-title-icon">
               <FaReceipt />
             </div>

             <div>

               <span>
                 Order Details
               </span>

               <h2>
                 {selectedOrder.id}
               </h2>

             </div>

           </div>


           <button
             type="button"
             className="admin-order-modal-close"
             onClick={() =>
               setSelectedOrder(
                 null
               )
             }
           >
             <FaTimes />
           </button>

         </div>


         {/* MODAL BODY */}

         <div className="admin-order-modal-body">


           {/* SUMMARY */}

           <div className="admin-order-modal-top">


             <div className="admin-order-modal-summary">

               <span>
                 Order Date
               </span>

               <strong>

                 {formatDate(
                   selectedOrder.date
                 )}

                 <br />

                 {formatTime(
                   selectedOrder.date
                 )}

               </strong>

             </div>


             <div className="admin-order-modal-summary">

               <span>
                 Products
               </span>

               <strong>

                 {getItemCount(
                   selectedOrder
                 )}{" "}
                 Items

               </strong>

             </div>


             <div className="admin-order-modal-summary">

               <span>
                 Delivery
               </span>

               <strong>

                 {selectedOrder
                   .deliveryMethod ===
                 "pickup"
                   ? "Clinic Pickup"
                   : "Home Delivery"}

               </strong>

             </div>


             <div className="admin-order-modal-summary">

               <span>
                 Total
               </span>

               <strong>

                 $
                 {Number(
                   selectedOrder.total ||
                     0
                 ).toFixed(
                   2
                 )}

               </strong>

             </div>

           </div>


           {/* CUSTOMER + DELIVERY */}

           <div className="admin-order-details-grid">


             {/* CUSTOMER */}

             <div className="admin-order-detail-card">

               <h3>
                 <FaUser />

                 Customer Details
               </h3>


               <div className="admin-order-info-row">

                 <span>
                   Name
                 </span>

                 <strong>

                   {selectedOrder
                     .customer
                     ?.fullName ||
                     "-"}

                 </strong>

               </div>


               <div className="admin-order-info-row">

                 <span>
                   Phone
                 </span>

                 <strong>

                   {selectedOrder
                     .customer
                     ?.phone ||
                     "-"}

                 </strong>

               </div>

             </div>


             {/* DELIVERY */}

             <div className="admin-order-detail-card">

               <h3>

                 {selectedOrder
                   .deliveryMethod ===
                 "pickup" ? (
                   <FaStore />
                 ) : (
                   <FaTruck />
                 )}

                 Delivery Details

               </h3>


               <div className="admin-order-info-row">

                 <span>
                   Method
                 </span>

                 <strong>

                   {selectedOrder
                     .deliveryMethod ===
                   "pickup"
                     ? "Clinic Pickup"
                     : "Home Delivery"}

                 </strong>

               </div>


               <div className="admin-order-info-row">

                 <span>
                   Address
                 </span>

                 <strong>

                   {selectedOrder
                     .address ||
                     "-"}

                 </strong>

               </div>


               {selectedOrder
                 .addressDetails && (

                 <div className="admin-order-info-row">

                   <span>
                     Address Details
                   </span>

                   <strong>

                     {
                       selectedOrder
                         .addressDetails
                     }

                   </strong>

                 </div>

               )}


               <div className="admin-order-info-row">

                 <span>
                   Payment
                 </span>

                 <strong>

                   {selectedOrder
                     .paymentMethod ===
                   "cash"
                     ? "Cash"
                     : selectedOrder
                         .paymentMethod ||
                       "-"}

                 </strong>

               </div>

             </div>

           </div>


           {/* ORDER ITEMS */}

           <div className="admin-order-items-card">

             <h3>
               <FaShoppingBag />

               Order Items
             </h3>


             {Array.isArray(
               selectedOrder.items
             ) &&
             selectedOrder.items
               .length > 0 ? (

               selectedOrder.items.map(
                 (
                   item,
                   index
                 ) => (

                   <div
                     className="admin-order-modal-item"
                     key={
                       item.id ||
                       index
                     }
                   >


                     <div className="admin-order-modal-item-image">

                       {item.image ? (

                         <img
                           src={
                             item.image
                           }
                           alt={
                             item.name ||
                             "Product"
                           }
                         />

                       ) : (

                         <FaPaw />

                       )}

                     </div>


                     <div className="admin-order-modal-item-info">

                       <strong>

                         {item.name ||
                           "Product"}

                       </strong>

                       <span>

                         {item.category ||
                           "No category"}

                       </span>

                     </div>


                     <div className="admin-order-modal-item-qty">

                       {item.quantity ||
                         1}{" "}
                       × $

                       {Number(
                         item.price ||
                           0
                       ).toFixed(
                         2
                       )}

                     </div>


                     <div className="admin-order-modal-item-price">

                       $

                       {(
                         Number(
                           item.price ||
                             0
                         ) *
                         Number(
                           item.quantity ||
                             1
                         )
                       ).toFixed(
                         2
                       )}

                     </div>

                   </div>

                 )
               )

             ) : (

               <p>
                 No products found.
               </p>

             )}

           </div>


           {/* CUSTOMER NOTE */}

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


           {/* TOTALS */}

           <div className="admin-order-totals">


             <div className="admin-order-total-row">

               <span>
                 Subtotal
               </span>

               <strong>

                 $
                 {Number(
                   selectedOrder
                     .subtotal ||
                     0
                 ).toFixed(
                   2
                 )}

               </strong>

             </div>


             <div className="admin-order-total-row">

               <span>
                 Delivery
               </span>

               <strong>

                 {Number(
                   selectedOrder
                     .deliveryFee ||
                     0
                 ) === 0
                   ? "Free"
                   : `$${Number(
                       selectedOrder
                         .deliveryFee ||
                         0
                     ).toFixed(
                       2
                     )}`}

               </strong>

             </div>


             <div className="admin-order-total-row final">

               <span>
                 Total
               </span>

               <strong>

                 $
                 {Number(
                   selectedOrder.total ||
                     0
                 ).toFixed(
                   2
                 )}

               </strong>

             </div>

           </div>


           {/* STATUS */}

           <div className="admin-order-modal-status">

             <div>

               <span>
                 Current Status
               </span>

               <strong>

                 {getStatusIcon(
                   selectedOrder.status ||
                     "Pending"
                 )}

                 {selectedOrder.status ||
                   "Pending"}

               </strong>

             </div>


             <select
               value={
                 selectedOrder.status ===
                 "Completed"
                   ? "Delivered"
                   : selectedOrder.status ||
                     "Pending"
               }
               onChange={(event) =>
                 updateOrderStatus(
                   selectedOrder.id,
                   event.target.value
                 )
               }
             >

               {STATUS_OPTIONS.map(
                 (status) => (

                   <option
                     key={status}
                     value={status}
                   >
                     {status}
                   </option>

                 )
               )}

             </select>

           </div>

         </div>

       </div>

     </div>

   )}

 </div>
);
}


export default AdminOrders;