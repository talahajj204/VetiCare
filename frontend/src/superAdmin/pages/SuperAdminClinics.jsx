
import { useCallback, useEffect, useMemo, useState } from "react";
import SuperAdminSidebar from "../components/SuperAdminSidebar";
import {
  FaBuilding,
  FaMagnifyingGlass,
  FaArrowRotateRight,
  FaTriangleExclamation,
  FaServer,
  FaCircleInfo,
} from "react-icons/fa6";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || ""
).replace(/\/$/, "");

const CLINICS_URL = `${API_BASE_URL}/api/super-admin/clinics`;

const styles = `
  .sa-clinics-page,
  .sa-clinics-page * {
    box-sizing: border-box;
  }

  .sa-clinics-page {
    display: flex !important;
    flex-direction: row !important;
    align-items: stretch;
    width: 100% !important;
    min-height: 100vh;
    margin: 0 !important;
    padding: 0 !important;
    background: #f5f8fa;
  }

  .sa-clinics-main {
    flex: 1 1 0% !important;
    min-width: 0 !important;
    width: auto !important;
    padding: 32px !important;
  }

  .sa-clinics-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 28px;
  }

  .sa-clinics-heading {
    flex: 1 1 auto;
    min-width: 0;
  }

  .sa-clinics-eyebrow {
    margin: 0 0 8px;
    color: #348b87;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .sa-clinics-heading h1 {
    margin: 0 0 8px;
    color: #183b42;
    font-size: clamp(23px, 2.4vw, 30px);
    line-height: 1.3;
  }

  .sa-clinics-heading p {
    margin: 0;
    color: #7b8992;
    font-size: 14px;
    line-height: 1.6;
  }

  .sa-clinics-page .sa-clinics-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    flex: 0 0 auto;
    width: auto !important;
    min-width: max-content;
    min-height: 42px;
    padding: 10px 17px !important;
    border: none;
    border-radius: 10px;
    background: #49aaa6;
    color: white;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  }

  .sa-clinics-page .sa-clinics-button:hover {
    background: #348b87;
  }

  .sa-clinics-page .sa-clinics-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .sa-clinics-card {
    width: 100%;
    min-width: 0;
    padding: 24px;
    border-radius: 15px;
    background: white;
    box-shadow: 0 3px 14px rgba(0, 0, 0, 0.04);
  }

  .sa-clinics-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 22px;
  }

  .sa-clinics-search {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1 1 260px;
    max-width: 400px;
    min-width: 0;
    min-height: 44px;
    padding: 0 14px;
    border: 1px solid #e0e9eb;
    border-radius: 10px;
    background: #fafcfc;
    color: #829096;
  }

  .sa-clinics-search input {
    flex: 1;
    min-width: 0;
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    color: #183b42;
    font-size: 14px;
  }

  .sa-clinics-select {
    min-height: 44px;
    min-width: 155px;
    padding: 0 12px;
    border: 1px solid #e0e9eb;
    border-radius: 10px;
    background: #fafcfc;
    color: #344b52;
    font-size: 14px;
    cursor: pointer;
  }

  .sa-clinics-section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
    margin-bottom: 20px;
  }

  .sa-clinics-section-title h2 {
    margin: 0;
    color: #183b42;
    font-size: 19px;
  }

  .sa-clinics-count {
    color: #7b8992;
    font-size: 13px;
    white-space: nowrap;
  }

  .sa-clinics-table-wrapper {
    width: 100%;
    overflow-x: auto;
  }

  .sa-clinics-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }

  .sa-clinics-table th,
  .sa-clinics-table td {
    padding: 16px 14px;
    border-bottom: 1px solid #edf1f3;
    font-size: 14px;
    text-align: left;
  }

  .sa-clinics-table th {
    color: #7b8992;
    font-weight: 600;
    white-space: nowrap;
  }

  .sa-clinics-table td {
    color: #344b52;
  }

  .sa-clinics-table tbody tr:hover {
    background: #f8fbfb;
  }

  .sa-clinics-name {
    color: #183b42;
    font-weight: 700;
  }

  .sa-clinics-status {
    display: inline-flex;
    align-items: center;
    padding: 7px 12px;
    border-radius: 20px;
    background: #f1f2f4;
    color: #687782;
    font-size: 12px;
    font-weight: 600;
    text-transform: capitalize;
    white-space: nowrap;
  }

  .sa-clinics-status.active,
  .sa-clinics-status.approved {
    background: #e4f8ee;
    color: #16825d;
  }

  .sa-clinics-status.pending {
    background: #fff2d9;
    color: #b87b16;
  }

  .sa-clinics-status.inactive,
  .sa-clinics-status.suspended,
  .sa-clinics-status.rejected {
    background: #fdeaea;
    color: #bb4d4d;
  }

  .sa-clinics-feedback {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    min-height: 280px;
    padding: 30px 18px;
    text-align: center;
    color: #7b8992;
  }

  .sa-clinics-feedback > svg {
    font-size: 31px;
    color: #49aaa6;
  }

  .sa-clinics-feedback > svg.sa-clinics-error {
    color: #d45b5b;
  }

  .sa-clinics-feedback h2,
  .sa-clinics-feedback h3 {
    margin: 0;
    color: #183b42;
    font-size: 19px;
  }

  .sa-clinics-feedback p {
    margin: 0;
    max-width: 500px;
    font-size: 14px;
    line-height: 1.7;
    overflow-wrap: anywhere;
  }

  .sa-clinics-spinner {
    width: 34px;
    height: 34px;
    border: 3px solid #e8f7f6;
    border-top-color: #49aaa6;
    border-radius: 50%;
    animation: sa-clinics-spin 0.8s linear infinite;
  }

  @keyframes sa-clinics-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 768px) {
    .sa-clinics-page {
      display: block !important;
    }

    .sa-clinics-main {
      width: 100% !important;
      padding: 84px 18px 28px !important;
    }

    .sa-clinics-header {
      align-items: flex-start;
      flex-direction: column;
      gap: 16px;
    }

    .sa-clinics-card {
      padding: 18px;
    }

    .sa-clinics-search {
      max-width: none;
      flex-basis: 100%;
    }

    .sa-clinics-select {
      width: 100%;
    }
  }

  @media (max-width: 480px) {
    .sa-clinics-main {
      padding: 84px 14px 24px !important;
    }

    .sa-clinics-card {
      padding: 15px;
    }

    .sa-clinics-section-title {
      align-items: flex-start;
      flex-direction: column;
    }
  }
`;

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function displayValue(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return String(value);
}

export default function SuperAdminClinics() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [apiMissing, setApiMissing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const refresh = useCallback(() => {
    setRefreshKey((previous) => previous + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadClinics() {
      setLoading(true);
      setError("");
      setApiMissing(false);

      try {
        const response = await fetch(CLINICS_URL, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
          signal: controller.signal,
        });

        if (response.status === 404) {
          setApiMissing(true);
          setClinics([]);
          return;
        }

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error(
              "Your session has expired. Please sign in again."
            );
          }

          if (response.status === 403) {
            throw new Error(
              "You do not have permission to view clinics."
            );
          }

          throw new Error(
            `Failed to load clinics (HTTP ${response.status}).`
          );
        }

        const result = await response.json();

        // Supports an array or an API response with a clinics array.
        const records = Array.isArray(result)
          ? result
          : Array.isArray(result?.clinics)
          ? result.clinics
          : Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result?.data?.clinics)
          ? result.data.clinics
          : null;

        if (!records) {
          throw new Error(
            "The clinics API returned an unexpected data format."
          );
        }

        if (!controller.signal.aborted) {
          setClinics(records);
        }
      } catch (err) {
        if (err.name === "AbortError") return;

        if (!controller.signal.aborted) {
          setError(err.message || "Unable to load clinics.");
          setClinics([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadClinics();

    return () => controller.abort();
  }, [refreshKey]);

  const availableStatuses = useMemo(() => {
    const statuses = clinics
      .map((clinic) => clinic?.status)
      .filter((status) => status !== null && status !== undefined)
      .map((status) => String(status).toLowerCase());

    return [...new Set(statuses)].sort();
  }, [clinics]);

  const filteredClinics = useMemo(() => {
    const query = search.trim().toLowerCase();

    return clinics.filter((clinic) => {
      const status = String(clinic?.status ?? "").toLowerCase();

      const matchesStatus =
        statusFilter === "all" || status === statusFilter;

      const searchableText = [
        clinic?.name,
        clinic?.email,
        clinic?.phone,
        clinic?.address,
        clinic?.city,
        clinic?.id,
      ]
        .filter((value) => value !== null && value !== undefined)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [clinics, search, statusFilter]);

  return (
    <>
      <style>{styles}</style>

      <div className="sa-clinics-page">
        <SuperAdminSidebar />

        <main className="sa-clinics-main">
          <header className="sa-clinics-header">
            <div className="sa-clinics-heading">
              <p className="sa-clinics-eyebrow">
                System Management
              </p>

              <h1>Clinics Management</h1>

              <p>
                View and search clinics registered in the system.
              </p>
            </div>

            <button
              type="button"
              className="sa-clinics-button"
              onClick={refresh}
              disabled={loading}
            >
              <FaArrowRotateRight />
              {loading ? "Loading..." : "Refresh"}
            </button>
          </header>

          <section className="sa-clinics-card">
            {loading ? (
              <div className="sa-clinics-feedback">
                <div className="sa-clinics-spinner" />
                <h2>Loading Clinics</h2>
                <p>Fetching clinic records from the server.</p>
              </div>
            ) : apiMissing ? (
              <div className="sa-clinics-feedback">
                <FaServer />
                <h2>Clinics API Not Connected</h2>
                <p>
                  The backend endpoint for clinics is not
                  available yet.
                </p>
                <p>{CLINICS_URL}</p>

                <button
                  type="button"
                  className="sa-clinics-button"
                  onClick={refresh}
                >
                  Check Again
                </button>
              </div>
            ) : error ? (
              <div className="sa-clinics-feedback">
                <FaTriangleExclamation
                  className="sa-clinics-error"
                />

                <h2>Unable to Load Clinics</h2>
                <p>{error}</p>

                <button
                  type="button"
                  className="sa-clinics-button"
                  onClick={refresh}
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                <div className="sa-clinics-section-title">
                  <h2>All Clinics</h2>
                  <span className="sa-clinics-count">
                    Showing {filteredClinics.length} of{" "}
                    {clinics.length} clinics
                  </span>
                </div>

                <div className="sa-clinics-toolbar">
                  <label className="sa-clinics-search">
                    <FaMagnifyingGlass />
                    <input
                      type="search"
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                      placeholder="Search clinics..."
                      aria-label="Search clinics"
                    />
                  </label>

                  <select
                    className="sa-clinics-select"
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(event.target.value)
                    }
                    aria-label="Filter by status"
                  >
                    <option value="all">All Statuses</option>

                    {availableStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() +
                          status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {filteredClinics.length === 0 ? (
                  <div className="sa-clinics-feedback">
                    {clinics.length === 0 ? (
                      <FaBuilding />
                    ) : (
                      <FaCircleInfo />
                    )}

                    <h3>
                      {clinics.length === 0
                        ? "No Clinics Yet"
                        : "No Matching Clinics"}
                    </h3>

                    <p>
                      {clinics.length === 0
                        ? "No clinic records were returned by the server."
                        : "Try changing your search or status filter."}
                    </p>
                  </div>
                ) : (
                  <div className="sa-clinics-table-wrapper">
                    <table className="sa-clinics-table">
                      <thead>
                        <tr>
                          <th>Clinic</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Location</th>
                          <th>Status</th>
                          <th>Registered</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredClinics.map((clinic, index) => {
                          const status = String(
                            clinic?.status ?? "unknown"
                          ).toLowerCase();

                          const statusClass = [
                            "active",
                            "approved",
                            "pending",
                            "inactive",
                            "suspended",
                            "rejected",
                          ].includes(status)
                            ? status
                            : "";

                          const location = [
                            clinic?.city,
                            clinic?.address,
                          ]
                            .filter(Boolean)
                            .join(", ");

                          return (
                            <tr key={clinic?.id ?? index}>
                              <td>
                                <span className="sa-clinics-name">
                                  {displayValue(clinic?.name)}
                                </span>
                              </td>

                              <td>
                                {displayValue(clinic?.email)}
                              </td>

                              <td>
                                {displayValue(clinic?.phone)}
                              </td>

                              <td>
                                {displayValue(location)}
                              </td>

                              <td>
                                <span
                                  className={`sa-clinics-status ${statusClass}`}
                                >
                                  {displayValue(clinic?.status)}
                                </span>
                              </td>

                              <td>
                                {formatDate(
                                  clinic?.createdAt ??
                                    clinic?.created_at
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </section>
        </main>
      </div>
    </>
  );
}
