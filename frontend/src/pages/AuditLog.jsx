import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";

import {
  FaSearch,
  FaTimes,
  FaClipboardList,
} from "react-icons/fa";

function AuditLog() {
  // =====================================================
  // AUDIT LOG DATA
  // =====================================================

  const [auditLogs] = useState([
    {
      id: 1,
      user: "Dr. Sarah Johnson",
      date: "2026-10-02",
      time: "09:42 AM",
      action: "Updated",
      record: "Medical Record - Max",
    },
    {
      id: 2,
      user: "Maya Haddad",
      date: "2026-10-02",
      time: "09:18 AM",
      action: "Created",
      record: "Appointment - Luna",
    },
    {
      id: 3,
      user: "Admin User",
      date: "2026-10-02",
      time: "08:55 AM",
      action: "Updated",
      record: "User - Maya Haddad",
    },
    {
      id: 4,
      user: "Dr. Sarah Johnson",
      date: "2026-10-01",
      time: "04:30 PM",
      action: "Created",
      record: "Prescription - Max",
    },
    {
      id: 5,
      user: "Maya Haddad",
      date: "2026-10-01",
      time: "03:45 PM",
      action: "Created",
      record: "Invoice - INV-003",
    },
    {
      id: 6,
      user: "Dr. Karim Nassar",
      date: "2026-10-01",
      time: "02:20 PM",
      action: "Updated",
      record: "Vaccination - Bella",
    },
    {
      id: 7,
      user: "Admin User",
      date: "2026-10-01",
      time: "11:10 AM",
      action: "Deactivated",
      record: "User - Dr. Karim Nassar",
    },
    {
      id: 8,
      user: "Maya Haddad",
      date: "2026-09-30",
      time: "05:15 PM",
      action: "Updated",
      record: "Owner - Tala El Hajj",
    },
    {
      id: 9,
      user: "Dr. Sarah Johnson",
      date: "2026-09-30",
      time: "01:35 PM",
      action: "Created",
      record: "Medication - Luna",
    },
    {
      id: 10,
      user: "Admin User",
      date: "2026-09-29",
      time: "10:05 AM",
      action: "Created",
      record: "User - Maya Haddad",
    },
  ]);

  // =====================================================
  // SEARCH + FILTER
  // =====================================================

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] =
    useState("All");

  // =====================================================
  // PAGINATION
  // =====================================================

  const [rowsPerPage, setRowsPerPage] =
    useState(5);

  const [currentPage, setCurrentPage] =
    useState(1);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "-";

    const [year, month, day] =
      date.split("-");

    return `${day}/${month}/${year}`;
  };

  // =====================================================
  // FILTERED LOGS
  // =====================================================

  const filteredLogs = useMemo(() => {
    const searchText =
      search.trim().toLowerCase();

    return auditLogs.filter((log) => {
      const matchesSearch =
        searchText === "" ||
        log.user
          .toLowerCase()
          .includes(searchText) ||
        log.date
          .toLowerCase()
          .includes(searchText) ||
        log.time
          .toLowerCase()
          .includes(searchText) ||
        log.action
          .toLowerCase()
          .includes(searchText) ||
        log.record
          .toLowerCase()
          .includes(searchText);

      const matchesAction =
        actionFilter === "All" ||
        log.action === actionFilter;

      return (
        matchesSearch &&
        matchesAction
      );
    });
  }, [
    auditLogs,
    search,
    actionFilter,
  ]);

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredLogs.length / rowsPerPage
    )
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    actionFilter,
    rowsPerPage,
  ]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [
    currentPage,
    totalPages,
  ]);

  const startIndex =
    (currentPage - 1) *
    rowsPerPage;

  const paginatedLogs =
    filteredLogs.slice(
      startIndex,
      startIndex + rowsPerPage
    );

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {
    setSearch("");
    setActionFilter("All");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    actionFilter !== "All";

  // =====================================================
  // ACTION CLASS
  // =====================================================

  const getActionClass = (action) => {
    if (action === "Created") {
      return "audit-action created";
    }

    if (action === "Updated") {
      return "audit-action updated";
    }

    if (action === "Deactivated") {
      return "audit-action deactivated";
    }

    return "audit-action default";
  };

  // =====================================================
  // PAGINATION STYLES
  // =====================================================

  const paginationButtonStyle = {
    width: "30px",
    minWidth: "30px",
    height: "30px",
    padding: "0",
    border: "1px solid #d9e1e7",
    borderRadius: "6px",
    backgroundColor: "#ffffff",
    color: "#667085",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: "600",
    lineHeight: "1",
    cursor: "pointer",
    boxShadow: "none",
  };

  const normalPageStyle = {
    ...paginationButtonStyle,
    fontSize: "13px",
  };

  const activePageStyle = {
    ...paginationButtonStyle,
    border: "1px solid #159f9f",
    backgroundColor: "#159f9f",
    color: "#ffffff",
    fontSize: "13px",
  };

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main audit-page">

        {/* ===============================================
            AUDIT LOG CSS
        =============================================== */}

        <style>{`
          .audit-page {
            min-width: 0;
          }

          .audit-page-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 22px;
          }

          .audit-title h1 {
            margin: 0;
            color: #344054;
            font-size: 27px;
            font-weight: 700;
          }

          .audit-title p {
            margin: 5px 0 0;
            color: #98a2b3;
            font-size: 13px;
          }

          .audit-view-only {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 8px 12px;
            border: 1px solid #dce8e7;
            border-radius: 6px;
            background: #f7fbfb;
            color: #667085;
            font-size: 11px;
            font-weight: 600;
            white-space: nowrap;
          }

          .audit-view-only svg {
            color: #159f9f;
          }

          .audit-filter-row {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 18px;
          }

          .audit-search-box {
            position: relative;
            flex: 1;
            max-width: 430px;
          }

          .audit-search-box input {
            width: 100%;
            height: 40px;
            padding: 0 38px;
            border: 1px solid #dfe7e7;
            border-radius: 7px;
            background: #ffffff;
            color: #344054;
            outline: none;
            box-sizing: border-box;
          }

          .audit-search-box input:focus {
            border-color: #159f9f;
          }

          .audit-search-icon {
            position: absolute;
            left: 13px;
            top: 50%;
            transform: translateY(-50%);
            color: #98a2b3;
            font-size: 13px;
          }

          .audit-clear-button {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            width: 25px !important;
            min-width: 25px !important;
            height: 25px !important;
            padding: 0 !important;
            border: none !important;
            background: transparent !important;
            color: #98a2b3 !important;
            display: flex !important;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          }

          .audit-filter-select {
            height: 40px;
            min-width: 165px;
            padding: 0 32px 0 11px;
            border: 1px solid #dfe7e7;
            border-radius: 7px;
            background: #ffffff;
            color: #475467;
            outline: none;
            cursor: pointer;
          }

          .audit-filter-select:focus {
            border-color: #159f9f;
          }

          .audit-table-container {
            overflow: hidden;
          }

          .audit-table-scroll {
            width: 100%;
            overflow-x: auto;
          }

          .audit-table {
            min-width: 800px;
          }

          .audit-table th,
          .audit-table td {
            white-space: nowrap;
          }

          .audit-user {
            color: #344054;
            font-weight: 600;
          }

          .audit-date-time {
            display: flex;
            flex-direction: column;
            gap: 3px;
          }

          .audit-date {
            color: #475467;
            font-size: 12px;
          }

          .audit-time {
            color: #98a2b3;
            font-size: 10px;
          }

          .audit-action {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 25px;
            padding: 4px 9px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
          }

          .audit-action.created {
            background: #e7f8f3;
            color: #16856f;
          }

          .audit-action.updated {
            background: #eef2ff;
            color: #4f46e5;
          }

          .audit-action.deactivated {
            background: #fff0ef;
            color: #d92d20;
          }

          .audit-action.default {
            background: #f2f4f7;
            color: #667085;
          }

          .audit-record {
            color: #475467;
          }

          .audit-record-box {
            display: inline-flex;
            align-items: center;
            padding: 6px 9px;
            border: 1px solid #e4ebea;
            border-radius: 6px;
            background: #fbfdfd;
            color: #475467;
            font-size: 11px;
          }

          .audit-empty {
            padding: 35px !important;
            color: #98a2b3;
            text-align: center;
          }

          .audit-pagination {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            margin-top: 16px;
          }

          .audit-rows {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #667085;
            font-size: 12px;
          }

          .audit-rows select {
            height: 31px;
            padding: 0 27px 0 8px;
            border: 1px solid #dfe7e7;
            border-radius: 6px;
            background: #ffffff;
            color: #475467;
            outline: none;
          }

          .audit-page-controls {
            display: flex;
            align-items: center;
            gap: 6px;
          }

          @media (max-width: 768px) {
            .audit-page-header {
              align-items: flex-start;
              flex-direction: column;
            }

            .audit-filter-row {
              align-items: stretch;
              flex-direction: column;
            }

            .audit-search-box {
              max-width: none;
            }

            .audit-filter-select {
              width: 100%;
            }

            .audit-pagination {
              align-items: flex-start;
              flex-direction: column;
            }
          }
        `}</style>

        {/* ===============================================
            HEADER
        =============================================== */}

        <div className="audit-page-header">
          <div className="audit-title">
            <h1>Audit Log</h1>

            <p>
              View system activity and record changes
            </p>
          </div>

          <div className="audit-view-only">
            <FaClipboardList />

            <span>View Only</span>
          </div>
        </div>

        {/* ===============================================
            SEARCH + FILTER
        =============================================== */}

        <div className="audit-filter-row">
          <div className="audit-search-box">
            <FaSearch className="audit-search-icon" />

            <input
              type="text"
              placeholder="Search audit log..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            {hasActiveFilters && (
              <button
                type="button"
                className="audit-clear-button"
                onClick={clearFilters}
                title="Clear filters"
                aria-label="Clear filters"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <select
            className="audit-filter-select"
            value={actionFilter}
            onChange={(e) =>
              setActionFilter(e.target.value)
            }
          >
            <option value="All">
              All Actions
            </option>

            <option value="Created">
              Created
            </option>

            <option value="Updated">
              Updated
            </option>

            <option value="Deactivated">
              Deactivated
            </option>
          </select>
        </div>

        {/* ===============================================
            TABLE
        =============================================== */}

        <div className="owners-table-container audit-table-container">
          <div className="audit-table-scroll">
            <table className="owners-table audit-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Date & Time</th>
                  <th>Action</th>
                  <th>Record Changed</th>
                </tr>
              </thead>

              <tbody>
                {paginatedLogs.length > 0 ? (
                  paginatedLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="audit-user">
                        {log.user}
                      </td>

                      <td>
                        <div className="audit-date-time">
                          <span className="audit-date">
                            {formatDate(log.date)}
                          </span>

                          <span className="audit-time">
                            {log.time}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={getActionClass(
                            log.action
                          )}
                        >
                          {log.action}
                        </span>
                      </td>

                      <td className="audit-record">
                        <span className="audit-record-box">
                          {log.record}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="audit-empty"
                    >
                      No audit log records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ===============================================
            PAGINATION
        =============================================== */}

        <div className="audit-pagination">
          <div className="audit-rows">
            <span>Rows per page:</span>

            <select
              value={rowsPerPage}
              onChange={(e) =>
                setRowsPerPage(
                  Number(e.target.value)
                )
              }
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>

          <div className="audit-page-controls">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((previous) =>
                  Math.max(previous - 1, 1)
                )
              }
              style={{
                ...paginationButtonStyle,
                opacity:
                  currentPage === 1
                    ? 0.45
                    : 1,
                cursor:
                  currentPage === 1
                    ? "not-allowed"
                    : "pointer",
              }}
              aria-label="Previous page"
            >
              &lt;
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => (
              <button
                type="button"
                key={page}
                onClick={() =>
                  setCurrentPage(page)
                }
                style={
                  currentPage === page
                    ? activePageStyle
                    : normalPageStyle
                }
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              disabled={
                currentPage === totalPages
              }
              onClick={() =>
                setCurrentPage((previous) =>
                  Math.min(
                    previous + 1,
                    totalPages
                  )
                )
              }
              style={{
                ...paginationButtonStyle,
                opacity:
                  currentPage === totalPages
                    ? 0.45
                    : 1,
                cursor:
                  currentPage === totalPages
                    ? "not-allowed"
                    : "pointer",
              }}
              aria-label="Next page"
            >
              &gt;
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AuditLog;