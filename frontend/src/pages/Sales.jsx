import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";

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
  FaTag,
} from "react-icons/fa";


/* =========================================================
   STORAGE
========================================================= */

const SALES_STORAGE_KEY = "vetClinicPOSSales";


/* =========================================================
   LOAD SALES
========================================================= */

const loadSales = () => {
  try {
    const savedSales =
      localStorage.getItem(SALES_STORAGE_KEY);

    if (!savedSales) {
      return [];
    }

    const parsedSales =
      JSON.parse(savedSales);

    return Array.isArray(parsedSales)
      ? parsedSales
      : [];
  } catch (error) {
    console.error(
      "Error loading POS sales:",
      error
    );

    return [];
  }
};


/* =========================================================
   SALES
========================================================= */

function Sales() {

  const [sales, setSales] = useState(
    () => loadSales()
  );

  const [search, setSearch] =
    useState("");

  const [paymentFilter, setPaymentFilter] =
    useState("All");

  const [
    selectedSale,
    setSelectedSale,
  ] = useState(null);


  /* =======================================================
     AUTO REFRESH
  ======================================================= */

  useEffect(() => {

    const refreshSales = () => {
      setSales(loadSales());
    };


    window.addEventListener(
      "storage",
      refreshSales
    );


    window.addEventListener(
      "vetClinicPOSSalesUpdated",
      refreshSales
    );


    return () => {

      window.removeEventListener(
        "storage",
        refreshSales
      );

      window.removeEventListener(
        "vetClinicPOSSalesUpdated",
        refreshSales
      );

    };

  }, []);


  /* =======================================================
     HELPERS
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

    return parsedDate.toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  };


  const getItemsCount = (sale) => {

    if (!Array.isArray(sale.items)) {
      return 0;
    }

    return sale.items.reduce(
      (total, item) =>
        total +
        Number(
          item.quantity || 1
        ),
      0
    );

  };


  const getProductSummary = (sale) => {

    if (
      !Array.isArray(sale.items) ||
      sale.items.length === 0
    ) {
      return "-";
    }

    return sale.items
      .map(
        (item) =>
          `${item.quantity || 1}× ${
            item.name || "Product"
          }`
      )
      .join(", ");

  };


  const isToday = (date) => {

    if (!date) {
      return false;
    }

    const saleDate =
      new Date(date);

    if (
      Number.isNaN(
        saleDate.getTime()
      )
    ) {
      return false;
    }

    const today =
      new Date();

    return (
      saleDate.getDate() ===
        today.getDate() &&
      saleDate.getMonth() ===
        today.getMonth() &&
      saleDate.getFullYear() ===
        today.getFullYear()
    );

  };


  /* =======================================================
     FILTER
  ======================================================= */

  const filteredSales =
    useMemo(() => {

      const value =
        search
          .trim()
          .toLowerCase();


      return sales.filter(
        (sale) => {

          const id =
            String(
              sale.id || ""
            ).toLowerCase();


          const owner =
            String(
              sale.owner ||
                "Unknown Owner"
            ).toLowerCase();


          const products =
            getProductSummary(
              sale
            ).toLowerCase();


          const payment =
            String(
              sale.paymentMethod ||
                "Cash"
            );


          const matchesSearch =
            !value ||
            id.includes(value) ||
            owner.includes(value) ||
            products.includes(value);


          const matchesPayment =
            paymentFilter === "All" ||
            payment.toLowerCase() ===
              paymentFilter.toLowerCase();


          return (
            matchesSearch &&
            matchesPayment
          );

        }
      );

    }, [
      sales,
      search,
      paymentFilter,
    ]);


  /* =======================================================
     STATS
  ======================================================= */

  const totalSales =
    sales.length;


  const todaySales =
    sales.filter(
      (sale) =>
        isToday(sale.date)
    ).length;


  const totalRevenue =
    sales.reduce(
      (total, sale) =>
        total +
        Number(
          sale.total || 0
        ),
      0
    );


  const todayRevenue =
    sales
      .filter(
        (sale) =>
          isToday(sale.date)
      )
      .reduce(
        (total, sale) =>
          total +
          Number(
            sale.total || 0
          ),
        0
      );


  const cashSales =
    sales.filter(
      (sale) =>
        String(
          sale.paymentMethod ||
            "Cash"
        ).toLowerCase() ===
        "cash"
    ).length;


  const cardSales =
    sales.filter(
      (sale) =>
        String(
          sale.paymentMethod ||
            ""
        ).toLowerCase() ===
        "card"
    ).length;


  /* =======================================================
     EXPORT CSV
  ======================================================= */

  const exportSales = () => {

    if (
      filteredSales.length === 0
    ) {

      alert(
        "There are no sales to export."
      );

      return;

    }


    const escapeCSV = (value) => {

      const text =
        String(value ?? "");

      return `"${text.replace(
        /"/g,
        '""'
      )}"`;

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


    const rows =
      filteredSales.map(
        (sale) => [

          sale.id || "",

          sale.owner ||
            "Unknown Owner",

          getProductSummary(
            sale
          ),

          getItemsCount(
            sale
          ),

          Number(
            sale.subtotal || 0
          ).toFixed(2),

          Number(
            sale.discount || 0
          ).toFixed(2),

          Number(
            sale.total || 0
          ).toFixed(2),

          Number(
            sale.received || 0
          ).toFixed(2),

          Number(
            sale.change || 0
          ).toFixed(2),

          sale.paymentMethod ||
            "Cash",

          sale.hasDelivery
            ? "Delivery"
            : "No Delivery",

          formatDate(
            sale.date
          ),

          formatTime(
            sale.date
          ),

        ]
      );


    const csvContent =
      [headers, ...rows]
        .map(
          (row) =>
            row
              .map(escapeCSV)
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
      `vet-clinic-pos-sales-${today}.csv`;


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
     RETURN
  ======================================================= */

  return (

    <div className="sales-layout">

      <style>{`

        * {
          box-sizing: border-box;
        }


        .sales-layout {
          min-height: 100vh;
          background: #f8fafb;
        }


        /* ===============================================
           MAIN
        =============================================== */

        .sales-main {
          min-height: 100vh;

          margin-left: 280px;

          width: calc(
            100% - 280px
          );

          padding:
            28px 30px 50px;

          background: #f8fafb;
        }


        /* ===============================================
           HEADER
        =============================================== */

        .sales-header {
          margin-bottom: 22px;

          display: flex;

          align-items:
            flex-start;

          justify-content:
            space-between;

          gap: 20px;
        }


        .sales-header-left h1 {
          margin: 0;

          color: #263b4f;

          font-size: 27px;

          font-weight: 800;

          letter-spacing:
            -0.5px;
        }


        .sales-header-left p {
          margin:
            6px 0 0;

          color: #98a2b3;

          font-size: 11px;

          line-height: 1.6;
        }


        /* ===============================================
           EXPORT
        =============================================== */

        .sales-export {
          width: auto;

          min-width: 90px;

          height: 36px;

          padding:
            0 14px;

          border:
            1px solid #d9e8e7;

          border-radius: 8px;

          background: #ffffff;

          color: #11797b;

          display:
            inline-flex;

          align-items: center;

          justify-content:
            center;

          gap: 6px;

          font-size: 11px;

          font-weight: 700;

          cursor: pointer;

          white-space:
            nowrap;

          transition:
            0.2s ease;
        }


        .sales-export svg {
          font-size: 11px;
        }


        .sales-export:hover {
          background: #e8f7f7;

          border-color:
            #b9dddd;

          color: #0d696b;
        }


        /* ===============================================
           STATS
        =============================================== */

        .sales-stats {
          display: grid;

          grid-template-columns:
            repeat(
              5,
              minmax(0, 1fr)
            );

          gap: 10px;

          margin-bottom: 18px;
        }


        .sales-stat {
          min-height: 82px;

          padding:
            12px 13px;

          border:
            1px solid #e4eeee;

          border-radius: 11px;

          background: #ffffff;

          display: flex;

          align-items: center;

          gap: 10px;

          box-shadow:
            0 2px 7px
            rgba(
              16,
              24,
              40,
              0.025
            );
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

          justify-content:
            center;

          font-size: 13px;
        }


        .sales-stat.cash
          .sales-stat-icon {
          background: #edf8ef;

          color: #3c9a55;
        }


        .sales-stat.card
          .sales-stat-icon {
          background: #eef3ff;

          color: #5276c8;
        }


        .sales-stat.today
          .sales-stat-icon {
          background: #fff6e7;

          color: #d88b25;
        }


        .sales-stat.revenue
          .sales-stat-icon {
          background: #f2edff;

          color: #7d5bc4;
        }


        .sales-stat-info {
          min-width: 0;
        }


        .sales-stat-info span {
          display: block;

          margin-bottom: 4px;

          color: #98a2b3;

          font-size: 8px;

          font-weight: 750;

          text-transform:
            uppercase;

          letter-spacing:
            0.35px;
        }


        .sales-stat-info strong {
          display: block;

          overflow: hidden;

          color: #263b4f;

          font-size: 18px;

          font-weight: 800;

          white-space:
            nowrap;

          text-overflow:
            ellipsis;
        }


        /* ===============================================
           CARD
        =============================================== */

        .sales-card {
          overflow: hidden;

          border:
            1px solid #e4eeee;

          border-radius: 13px;

          background: #ffffff;

          box-shadow:
            0 3px 12px
            rgba(
              16,
              24,
              40,
              0.03
            );
        }


        /* ===============================================
           TOOLBAR
        =============================================== */

        .sales-toolbar {
          padding: 14px;

          border-bottom:
            1px solid #edf3f3;

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 12px;
        }


        .sales-search {
          width:
            min(460px, 100%);

          height: 38px;

          padding:
            0 12px;

          border:
            1px solid #dfe9e8;

          border-radius: 8px;

          background: #ffffff;

          display: flex;

          align-items: center;

          gap: 8px;
        }


        .sales-search svg {
          color: #159f9f;

          font-size: 11px;
        }


        .sales-search input {
          width: 100%;

          border: 0;

          outline: none;

          background:
            transparent;

          color: #344054;

          font-size: 10px;
        }


        .sales-search input::placeholder {
          color: #a6b0bd;
        }


        .sales-filter {
          min-width: 155px;

          height: 38px;

          padding:
            0 10px;

          border:
            1px solid #dfe9e8;

          border-radius: 8px;

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

        .sales-table-wrapper {
          width: 100%;

          overflow-x: auto;
        }


        .sales-table {
          width: 100%;

          min-width: 1120px;

          border-collapse:
            collapse;
        }


        .sales-table th {
          padding:
            11px 12px;

          border-bottom:
            1px solid #e9efef;

          background: #fafcfc;

          color: #7c8998;

          text-align: left;

          font-size: 8px;

          font-weight: 800;

          text-transform:
            uppercase;

          letter-spacing:
            0.35px;

          white-space:
            nowrap;
        }


        .sales-table td {
          padding:
            12px;

          border-bottom:
            1px solid #f0f4f4;

          color: #475467;

          font-size: 10px;

          vertical-align:
            middle;
        }


        .sales-table tbody tr {
          transition:
            0.15s ease;
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

          justify-content:
            center;

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

          white-space:
            nowrap;

          text-overflow:
            ellipsis;
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


        .sale-payment {
          width: fit-content;

          padding:
            5px 8px;

          border-radius: 20px;

          display: inline-flex;

          align-items: center;

          gap: 5px;

          font-size: 8px;

          font-weight: 750;
        }


        .sale-payment.cash {
          background: #edf8ef;

          color: #398a4f;
        }


        .sale-payment.card {
          background: #eef3ff;

          color: #5276c8;
        }


        .sale-payment.other {
          background: #f2f4f7;

          color: #667085;
        }


        .sale-delivery {
          width: fit-content;

          padding:
            5px 8px;

          border-radius: 20px;

          display: inline-flex;

          align-items: center;

          gap: 5px;

          background: #f2f4f7;

          color: #667085;

          font-size: 8px;

          font-weight: 700;
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

          border:
            1px solid #dce8e8;

          border-radius: 7px;

          background: #ffffff;

          color: #159f9f;

          display: flex;

          align-items: center;

          justify-content:
            center;

          cursor: pointer;

          transition:
            0.15s ease;
        }


        .sale-view:hover {
          border-color:
            #a9deda;

          background: #eff9f8;
        }


        /* ===============================================
           EMPTY
        =============================================== */

        .sales-empty {
          min-height: 350px;

          padding: 40px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content:
            center;

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

          justify-content:
            center;

          font-size: 23px;
        }


        .sales-empty h2 {
          margin: 0;

          color: #344054;

          font-size: 15px;
        }


        .sales-empty p {
          max-width: 370px;

          margin:
            7px 0 0;

          color: #98a2b3;

          font-size: 10px;

          line-height: 1.6;
        }


        /* ===============================================
           MODAL
        =============================================== */

        .sale-modal-overlay {
          position: fixed;

          inset: 0;

          z-index: 9999;

          padding: 25px;

          background:
            rgba(
              16,
              24,
              40,
              0.45
            );

          display: flex;

          align-items: center;

          justify-content:
            center;
        }


        .sale-modal {
          width:
            min(780px, 96vw);

          max-height: 90vh;

          overflow-y: auto;

          border-radius: 14px;

          background: #ffffff;

          box-shadow:
            0 25px 70px
            rgba(
              16,
              24,
              40,
              0.22
            );
        }


        .sale-modal-header {
          position: sticky;

          top: 0;

          z-index: 5;

          padding:
            16px 18px;

          border-bottom:
            1px solid #e9efef;

          background: #ffffff;

          display: flex;

          align-items: center;

          justify-content:
            space-between;

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

          justify-content:
            center;
        }


        .sale-modal-title span {
          display: block;

          color: #98a2b3;

          font-size: 8px;

          text-transform:
            uppercase;

          font-weight: 750;
        }


        .sale-modal-title h2 {
          margin:
            3px 0 0;

          color: #263b4f;

          font-size: 15px;
        }


        .sale-modal-close {
          width: 31px;

          min-width: 31px;

          height: 31px;

          padding: 0;

          border:
            1px solid #e1e9e8;

          border-radius: 8px;

          background: #ffffff;

          color: #667085;

          display: flex;

          align-items: center;

          justify-content:
            center;

          cursor: pointer;
        }


        .sale-modal-close:hover {
          background: #f7f9f9;
        }


        .sale-modal-body {
          padding: 18px;
        }


        .sale-modal-summary {
          display: grid;

          grid-template-columns:
            repeat(
              4,
              minmax(0, 1fr)
            );

          gap: 9px;

          margin-bottom: 18px;
        }


        .sale-summary-card {
          min-height: 74px;

          padding: 11px;

          border:
            1px solid #e4eeee;

          border-radius: 10px;

          background: #fafcfc;
        }


        .sale-summary-card span {
          display: block;

          color: #98a2b3;

          font-size: 8px;

          font-weight: 700;

          text-transform:
            uppercase;
        }


        .sale-summary-card strong {
          display: block;

          margin-top: 7px;

          color: #263b4f;

          font-size: 11px;

          line-height: 1.45;
        }


        .sale-detail-grid {
          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );

          gap: 12px;

          margin-bottom: 18px;
        }


        .sale-detail-card {
          padding: 15px;

          border:
            1px solid #e4eeee;

          border-radius: 11px;

          background: #ffffff;
        }


        .sale-detail-card h3 {
          margin:
            0 0 12px;

          color: #263b4f;

          font-size: 11px;

          display: flex;

          align-items: center;

          gap: 7px;
        }


        .sale-detail-card h3 svg {
          color: #159f9f;
        }


        .sale-info-row {
          padding: 7px 0;

          border-bottom:
            1px solid #f0f4f4;

          display: flex;

          justify-content:
            space-between;

          gap: 15px;
        }


        .sale-info-row:last-child {
          border-bottom: 0;
        }


        .sale-info-row span {
          color: #98a2b3;

          font-size: 9px;
        }


        .sale-info-row strong {
          color: #475467;

          font-size: 9px;

          text-align: right;
        }


        .sale-items-card {
          margin-bottom: 18px;

          padding: 15px;

          border:
            1px solid #e4eeee;

          border-radius: 11px;

          background: #ffffff;
        }


        .sale-items-card h3 {
          margin:
            0 0 12px;

          color: #263b4f;

          font-size: 11px;

          display: flex;

          align-items: center;

          gap: 7px;
        }


        .sale-items-card h3 svg {
          color: #159f9f;
        }


        .sale-modal-item {
          padding: 10px 0;

          border-bottom:
            1px solid #edf3f3;

          display: grid;

          grid-template-columns:
            48px
            minmax(0, 1fr)
            auto
            auto;

          align-items: center;

          gap: 11px;
        }


        .sale-modal-item:last-child {
          border-bottom: 0;
        }


        .sale-item-image {
          width: 44px;

          height: 44px;

          border-radius: 8px;

          overflow: hidden;

          background: #eff9f8;

          color: #159f9f;

          display: flex;

          align-items: center;

          justify-content:
            center;
        }


        .sale-item-image img {
          width: 100%;

          height: 100%;

          object-fit: cover;
        }


        .sale-item-info strong {
          display: block;

          color: #344054;

          font-size: 10px;
        }


        .sale-item-info span {
          display: block;

          margin-top: 3px;

          color: #98a2b3;

          font-size: 8px;
        }


        .sale-item-quantity {
          color: #667085;

          font-size: 9px;

          white-space:
            nowrap;
        }


        .sale-item-total {
          min-width: 65px;

          color: #263b4f;

          text-align: right;

          font-size: 10px;

          font-weight: 800;
        }


        .sale-totals {
          width:
            min(360px, 100%);

          margin-left: auto;

          padding: 15px;

          border-radius: 11px;

          background: #f7fbfb;
        }


        .sale-total-row {
          padding: 6px 0;

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 15px;

          color: #667085;

          font-size: 9px;
        }


        .sale-total-row strong {
          color: #475467;
        }


        .sale-total-row.final {
          margin-top: 6px;

          padding-top: 11px;

          border-top:
            1px solid #dce8e8;

          color: #263b4f;

          font-size: 13px;

          font-weight: 800;
        }


        .sale-total-row.final strong {
          color: #159f9f;

          font-size: 14px;
        }
        /* ===============================================
        RESPONSIVE
     =============================================== */

     @media (max-width: 1350px) {
       .sales-stats {
         grid-template-columns:
           repeat(5, minmax(0, 1fr));
       }
     }


     @media (max-width: 1150px) {
       .sales-stats {
         grid-template-columns:
           repeat(3, minmax(0, 1fr));
       }

       .sale-modal-summary {
         grid-template-columns:
           repeat(2, minmax(0, 1fr));
       }
     }


     @media (max-width: 1000px) {
       .sales-main {
         margin-left: 0;
         width: 100%;
         padding: 22px 18px 40px;
       }

       .sales-stats {
         grid-template-columns:
           repeat(2, minmax(0, 1fr));
       }
     }


     @media (max-width: 700px) {
       .sales-main {
         padding: 18px 12px 35px;
       }

       .sales-header {
         align-items: flex-start;
       }

       .sales-header-left h1 {
         font-size: 23px;
       }

       .sales-export {
         min-width: 82px;
         height: 34px;
         padding: 0 11px;
         font-size: 10px;
       }

       .sales-stats {
         grid-template-columns: 1fr;
       }

       .sales-toolbar {
         flex-direction: column;
         align-items: stretch;
       }

       .sales-search {
         width: 100%;
       }

       .sales-filter {
         width: 100%;
       }

       .sale-detail-grid {
         grid-template-columns: 1fr;
       }

       .sale-modal-summary {
         grid-template-columns: 1fr 1fr;
       }

       .sale-modal-overlay {
         padding: 10px;
       }

       .sale-modal-body {
         padding: 13px;
       }

       .sale-modal-item {
         grid-template-columns:
           42px minmax(0, 1fr) auto;
       }

       .sale-item-total {
         grid-column: 2 / -1;
         text-align: left;
       }
     }


     @media (max-width: 430px) {
       .sale-modal-summary {
         grid-template-columns: 1fr;
       }
     }

   `}</style>


   <Sidebar />


   <main className="sales-main">

     {/* =============================================
         HEADER
     ============================================= */}

     <div className="sales-header">

       <div className="sales-header-left">

         <h1>Sales</h1>

         <p>
           View and manage all completed
           point of sale transactions.
         </p>

       </div>


       <button
         type="button"
         className="sales-export"
         onClick={exportSales}
       >
         <FaFileExport />

         <span>Export</span>
       </button>

     </div>


     {/* =============================================
         STATS
     ============================================= */}

     <div className="sales-stats">

       <div className="sales-stat">

         <div className="sales-stat-icon">
           <FaReceipt />
         </div>

         <div className="sales-stat-info">

           <span>Total Sales</span>

           <strong>
             {totalSales}
           </strong>

         </div>

       </div>


       <div className="sales-stat today">

         <div className="sales-stat-icon">
           <FaClock />
         </div>

         <div className="sales-stat-info">

           <span>Today's Sales</span>

           <strong>
             {todaySales}
           </strong>

         </div>

       </div>


       <div className="sales-stat revenue">

         <div className="sales-stat-icon">
           <FaDollarSign />
         </div>

         <div className="sales-stat-info">

           <span>Total Revenue</span>

           <strong>
             ${totalRevenue.toFixed(2)}
           </strong>

         </div>

       </div>


       <div className="sales-stat cash">

         <div className="sales-stat-icon">
           <FaMoneyBillWave />
         </div>

         <div className="sales-stat-info">

           <span>Cash Sales</span>

           <strong>
             {cashSales}
           </strong>

         </div>

       </div>


       <div className="sales-stat card">

         <div className="sales-stat-icon">
           <FaCreditCard />
         </div>

         <div className="sales-stat-info">

           <span>Card Sales</span>

           <strong>
             {cardSales}
           </strong>

         </div>

       </div>

     </div>


     {/* =============================================
         SALES CARD
     ============================================= */}

     <div className="sales-card">

       <div className="sales-toolbar">

         <div className="sales-search">

           <FaSearch />

           <input
             type="text"
             placeholder="Search by sale ID, owner or product..."
             value={search}
             onChange={(event) =>
               setSearch(
                 event.target.value
               )
             }
           />

         </div>


         <select
           className="sales-filter"
           value={paymentFilter}
           onChange={(event) =>
             setPaymentFilter(
               event.target.value
             )
           }
         >
           <option value="All">
             All Payments
           </option>

           <option value="Cash">
             Cash
           </option>

           <option value="Card">
             Card
           </option>

         </select>

       </div>


       {/* ===========================================
           EMPTY
       =========================================== */}

       {filteredSales.length === 0 ? (

         <div className="sales-empty">

           <div className="sales-empty-icon">
             <FaCashRegister />
           </div>

           <h2>
             No POS sales yet
           </h2>

           <p>
             Completed transactions from
             the POS will automatically
             appear here.
           </p>

         </div>

       ) : (

         /* =========================================
            TABLE
         ========================================= */

         <div className="sales-table-wrapper">

           <table className="sales-table">

             <thead>

               <tr>

                 <th>
                   Sale ID
                 </th>

                 <th>
                   Owner
                 </th>

                 <th>
                   Order Details
                 </th>

                 <th>
                   Items
                 </th>

                 <th>
                   Discount
                 </th>

                 <th>
                   Total
                 </th>

                 <th>
                   Payment
                 </th>

                 <th>
                   Delivery
                 </th>

                 <th>
                   Date
                 </th>

                 <th>
                   Action
                 </th>

               </tr>

             </thead>


             <tbody>

               {filteredSales.map(
                 (sale) => {

                   const payment =
                     String(
                       sale.paymentMethod ||
                         "Cash"
                     ).toLowerCase();


                   const paymentClass =
                     payment === "cash"
                       ? "cash"
                       : payment === "card"
                       ? "card"
                       : "other";


                   return (

                     <tr key={sale.id}>

                       {/* SALE ID */}

                       <td>

                         <span className="sale-id">
                           {sale.id}
                         </span>

                       </td>


                       {/* OWNER */}

                       <td>

                         <div className="sale-owner">

                           <div className="sale-owner-avatar">
                             <FaUser />
                           </div>


                           <div>

                             <strong>
                               {sale.owner ||
                                 "Unknown Owner"}
                             </strong>

                             <span>
                               POS Customer
                             </span>

                           </div>

                         </div>

                       </td>


                       {/* PRODUCTS */}

                       <td>

                         <div
                           className="sale-products"
                           title={
                             getProductSummary(
                               sale
                             )
                           }
                         >
                           {getProductSummary(
                             sale
                           )}
                         </div>

                       </td>


                       {/* ITEM COUNT */}

                       <td>

                         <strong>
                           {getItemsCount(
                             sale
                           )}
                         </strong>

                       </td>


                       {/* DISCOUNT */}

                       <td>

                         <span className="sale-discount">

                           {Number(
                             sale.discount ||
                               0
                           ) > 0
                             ? `-$${Number(
                                 sale.discount
                               ).toFixed(
                                 2
                               )}`
                             : "$0.00"}

                         </span>

                       </td>


                       {/* TOTAL */}

                       <td>

                         <span className="sale-total">

                           $
                           {Number(
                             sale.total || 0
                           ).toFixed(2)}

                         </span>

                       </td>


                       {/* PAYMENT */}

                       <td>

                         <span
                           className={`sale-payment ${paymentClass}`}
                         >

                           {paymentClass ===
                           "cash" ? (
                             <FaMoneyBillWave />
                           ) : paymentClass ===
                             "card" ? (
                             <FaCreditCard />
                           ) : (
                             <FaDollarSign />
                           )}


                           {sale.paymentMethod ||
                             "Cash"}

                         </span>

                       </td>


                       {/* DELIVERY */}

                       <td>

                         <span
                           className={`sale-delivery ${
                             sale.hasDelivery
                               ? "yes"
                               : ""
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


                       {/* DATE */}

                       <td>

                         <div className="sale-date">

                           <strong>
                             {formatDate(
                               sale.date
                             )}
                           </strong>

                           <span>
                             {formatTime(
                               sale.date
                             )}
                           </span>

                         </div>

                       </td>


                       {/* ACTION */}

                       <td>

                         <button
                           type="button"
                           className="sale-view"
                           title="View sale"
                           onClick={() =>
                             setSelectedSale(
                               sale
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

     </div>


     {/* =============================================
         SALE DETAILS MODAL
     ============================================= */}

     {selectedSale && (

       <div
         className="sale-modal-overlay"
         onMouseDown={(event) => {

           if (
             event.target ===
             event.currentTarget
           ) {
             setSelectedSale(
               null
             );
           }

         }}
       >

         <div className="sale-modal">


           {/* =======================================
               MODAL HEADER
           ======================================= */}

           <div className="sale-modal-header">

             <div className="sale-modal-title">

               <div className="sale-modal-title-icon">
                 <FaReceipt />
               </div>


               <div>

                 <span>
                   POS Sale
                 </span>

                 <h2>
                   {selectedSale.id}
                 </h2>

               </div>

             </div>


             <button
               type="button"
               className="sale-modal-close"
               onClick={() =>
                 setSelectedSale(
                   null
                 )
               }
             >
               <FaTimes />
             </button>

           </div>


           {/* =======================================
               BODY
           ======================================= */}

           <div className="sale-modal-body">


             {/* SUMMARY */}

             <div className="sale-modal-summary">

               <div className="sale-summary-card">

                 <span>
                   Total
                 </span>

                 <strong>
                   $
                   {Number(
                     selectedSale.total ||
                       0
                   ).toFixed(2)}
                 </strong>

               </div>


               <div className="sale-summary-card">

                 <span>
                   Items
                 </span>

                 <strong>
                   {getItemsCount(
                     selectedSale
                   )}
                 </strong>

               </div>


               <div className="sale-summary-card">

                 <span>
                   Payment
                 </span>

                 <strong>
                   {selectedSale.paymentMethod ||
                     "Cash"}
                 </strong>

               </div>


               <div className="sale-summary-card">

                 <span>
                   Date
                 </span>

                 <strong>
                   {formatDate(
                     selectedSale.date
                   )}

                   <br />

                   {formatTime(
                     selectedSale.date
                   )}
                 </strong>

               </div>

             </div>


             {/* =====================================
                 INFORMATION
             ===================================== */}

             <div className="sale-detail-grid">


               {/* CUSTOMER */}

               <div className="sale-detail-card">

                 <h3>
                   <FaUser />
                   Customer Details
                 </h3>


                 <div className="sale-info-row">

                   <span>
                     Owner
                   </span>

                   <strong>
                     {selectedSale.owner ||
                       "Unknown Owner"}
                   </strong>

                 </div>


                 <div className="sale-info-row">

                   <span>
                     Sale ID
                   </span>

                   <strong>
                     {selectedSale.id}
                   </strong>

                 </div>


                 <div className="sale-info-row">

                   <span>
                     Total Items
                   </span>

                   <strong>
                     {getItemsCount(
                       selectedSale
                     )}
                   </strong>

                 </div>

               </div>


               {/* PAYMENT */}

               <div className="sale-detail-card">

                 <h3>
                   <FaCreditCard />
                   Payment Details
                 </h3>


                 <div className="sale-info-row">

                   <span>
                     Payment Method
                   </span>

                   <strong>
                     {selectedSale.paymentMethod ||
                       "Cash"}
                   </strong>

                 </div>


                 <div className="sale-info-row">

                   <span>
                     Amount Received
                   </span>

                   <strong>
                     $
                     {Number(
                       selectedSale.received ||
                         0
                     ).toFixed(2)}
                   </strong>

                 </div>


                 <div className="sale-info-row">

                   <span>
                     Change
                   </span>

                   <strong>
                     $
                     {Number(
                       selectedSale.change ||
                         0
                     ).toFixed(2)}
                   </strong>

                 </div>


                 <div className="sale-info-row">

                   <span>
                     Delivery
                   </span>

                   <strong>
                     {selectedSale.hasDelivery
                       ? "Yes"
                       : "No"}
                   </strong>

                 </div>

               </div>

             </div>


             {/* =====================================
                 ITEMS
             ===================================== */}

             <div className="sale-items-card">

               <h3>
                 <FaShoppingBag />
                 Products
               </h3>


               {Array.isArray(
                 selectedSale.items
               ) &&
               selectedSale.items.length >
                 0 ? (

                 selectedSale.items.map(
                   (item, index) => (

                     <div
                       className="sale-modal-item"
                       key={
                         item.id ||
                         `${item.name}-${index}`
                       }
                     >

                       <div className="sale-item-image">

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


                       <div className="sale-item-info">

                         <strong>
                           {item.name ||
                             "Product"}
                         </strong>

                         <span>
                           {item.category ||
                             "No category"}
                         </span>

                       </div>


                       <div className="sale-item-quantity">

                         {item.quantity ||
                           1}
                         × $
                         {Number(
                           item.price ||
                             0
                         ).toFixed(2)}

                       </div>


                       <div className="sale-item-total">

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
                         ).toFixed(2)}

                       </div>

                     </div>

                   )
                 )

               ) : (

                 <div
                   style={{
                     padding:
                       "15px 0",
                     color:
                       "#98a2b3",
                     fontSize:
                       "9px",
                   }}
                 >
                   No products found.
                 </div>

               )}

             </div>


             {/* =====================================
                 TOTALS
             ===================================== */}

             <div className="sale-totals">

               <div className="sale-total-row">

                 <span>
                   Subtotal
                 </span>

                 <strong>
                   $
                   {Number(
                     selectedSale.subtotal ||
                       0
                   ).toFixed(2)}
                 </strong>

               </div>


               <div className="sale-total-row">

                 <span>
                   Discount
                 </span>

                 <strong>
                   -$
                   {Number(
                     selectedSale.discount ||
                       0
                   ).toFixed(2)}
                 </strong>

               </div>


               <div className="sale-total-row final">

                 <span>
                   Total
                 </span>

                 <strong>
                   $
                   {Number(
                     selectedSale.total ||
                       0
                   ).toFixed(2)}
                 </strong>

               </div>


               <div className="sale-total-row">

                 <span>
                   Received
                 </span>

                 <strong>
                   $
                   {Number(
                     selectedSale.received ||
                       0
                   ).toFixed(2)}
                 </strong>

               </div>


               <div className="sale-total-row">

                 <span>
                   Change
                 </span>

                 <strong>
                   $
                   {Number(
                     selectedSale.change ||
                       0
                   ).toFixed(2)}
                 </strong>

               </div>

             </div>

           </div>

         </div>

       </div>

     )}

   </main>

 </div>

);

}

export default Sales;