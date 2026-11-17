import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getAuditLogs } from "../api/auditLogApi";

import {
  FaSearch,
  FaTimes,
} from "react-icons/fa";

function AuditLog() {
  const context = useOutletContext();

  const scopeKey =
    `${context?.user?.id ?? ""}:${context?.user?.clinicId ?? ""}`;

  const [auditData, setAuditData] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const auditLogs =
    auditData?.scopeKey === scopeKey
      ? auditData.records
      : [];

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All");

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let disposed = false;
    let controller;

    setAuditData(null);
    setLoadError("");
    setCurrentPage(1);

    const load = async () => {
      controller?.abort();
      controller = new AbortController();

      const signal = controller.signal;

      setIsLoading(true);

      try {
        const records = await getAuditLogs({ signal });

        if (disposed || signal.aborted) return;

        setAuditData({
          scopeKey,
          records,
        });

        setLoadError("");
      } catch (error) {
        if (!disposed && !signal.aborted) {
          setAuditData(null);
          setLoadError(
            error.message ||
              "Unable to load audit log records."
          );
        }
      } finally {
        if (!disposed && !signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    const visible = () => {
      if (document.visibilityState === "visible") {
        void load();
      }
    };

    void load();

    window.addEventListener("focus", load);
    window.addEventListener("auditLogUpdated", load);

    document.addEventListener(
      "visibilitychange",
      visible
    );

    return () => {
      disposed = true;
      controller?.abort();

      window.removeEventListener("focus", load);
      window.removeEventListener("auditLogUpdated", load);

      document.removeEventListener(
        "visibilitychange",
        visible
      );
    };
  }, [scopeKey]);

  const formatDate = (date) => {
    if (!date) return "-";

    const [year, month, day] = date.split("-");

    return `${day}/${month}/${year}`;
  };

  const filteredLogs = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return auditLogs.filter((log) => {
      const matchesSearch =
        searchText === "" ||
        log.user.toLowerCase().includes(searchText) ||
        log.date.toLowerCase().includes(searchText) ||
        log.time.toLowerCase().includes(searchText) ||
        log.action.toLowerCase().includes(searchText) ||
        log.record.toLowerCase().includes(searchText);

      const matchesAction =
        actionFilter === "All" ||
        log.action === actionFilter;

      return matchesSearch && matchesAction;
    });
  }, [auditLogs, search, actionFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredLogs.length / rowsPerPage)
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, actionFilter, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * rowsPerPage;

  const paginatedLogs = filteredLogs.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const clearFilters = () => {
    setSearch("");
    setActionFilter("All");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    search.trim() !== "" || actionFilter !== "All";

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

  const activePageStyle = {
    ...paginationButtonStyle,
    border: "1px solid #159f9f",
    backgroundColor: "#159f9f",
    color: "#ffffff",
    fontSize: "13px",
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main audit-page">
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

        <div className="audit-page-header">
          <div className="audit-title">
            <h1>Audit Log</h1>
            <p>View system activity and record changes</p>
          </div>
        </div>

        <div className="audit-filter-row">
          <div className="audit-search-box">
            <FaSearch className="audit-search-icon" />

            <input
              type="text"
              placeholder="Search audit log..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
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
            onChange={(event) =>
              setActionFilter(event.target.value)
            }
          >
            <option value="All">All Actions</option>
            <option value="Created">Created</option>
            <option value="Updated">Updated</option>
            <option value="Deactivated">Deactivated</option>
          </select>
        </div>

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
                          className={getActionClass(log.action)}
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
                      {loadError ||
                        (isLoading
                          ? "Loading audit log..."
                          : "No audit log records found")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="audit-pagination">
          <div className="audit-rows">
            <span>Rows per page:</span>

            <select
              value={rowsPerPage}
              onChange={(event) =>
                setRowsPerPage(Number(event.target.value))
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
                opacity: currentPage === 1 ? 0.45 : 1,
                cursor:
                  currentPage === 1
                    ? "not-allowed"
                    : "pointer",
              }}
              aria-label="Previous page"
            >
              &lt;
            </button>

            <button
              type="button"
              style={{
                ...activePageStyle,
                cursor: "default",
              }}
              aria-current="page"
              aria-label={`Page ${currentPage}`}
            >
              {currentPage}
            </button>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((previous) =>
                  Math.min(previous + 1, totalPages)
                )
              }
              style={{
                ...paginationButtonStyle,
                opacity:
                  currentPage === totalPages ? 0.45 : 1,
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