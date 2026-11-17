import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function SubscriptionGuard({ user, children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const key = `${location.pathname}${location.search}`;
  const isSuperAdmin = user.roles.includes("SuperAdmin");

  const [retry, setRetry] = useState(0);
  const [state, setState] = useState({
    key: "",
    status: "checking",
  });

  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  useEffect(() => {
    if (isSuperAdmin) return;

    const controller = new AbortController();
    let inFlight = false;

    const check = async () => {
      if (inFlight || controller.signal.aborted) return;

      inFlight = true;

      try {
        const response = await fetch("/api/auth/subscription", {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        if (response.status === 401) {
          if (!controller.signal.aborted) {
            setState({
              key,
              status: "signed-out",
              message: "Please sign in again.",
            });
          }

          return;
        }

        const data = await response.json().catch(() => null);

        if (!response.ok || typeof data?.allowed !== "boolean") {
          throw new Error(
            "Unable to check your subscription. Please try again."
          );
        }

        if (!controller.signal.aborted) {
          setState({
            key,
            status: data.allowed ? "allowed" : "blocked",
            ...data,
          });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setState({
            key,
            status: "error",
            message: error.message,
          });
        }
      } finally {
        inFlight = false;
      }
    };

    check();

    const timer = setInterval(check, 60000);
    const onFocus = () => check();

    window.addEventListener("focus", onFocus);

    return () => {
      controller.abort();
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [key, isSuperAdmin, retry]);

  if (isSuperAdmin) return children;

  if (state.key !== key || state.status === "checking") {
    return <p role="status">Checking your subscription...</p>;
  }

  if (state.status === "allowed") return children;

  const signOut = async () => {
    if (signingOut) return;

    setSigningOut(true);
    setLogoutError("");

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok && response.status !== 401) {
        throw new Error("Unable to sign out. Please try again.");
      }

      navigate("/", { replace: true });
    } catch (error) {
      setLogoutError(error.message);
    } finally {
      setSigningOut(false);
    }
  };

  const title =
    state.status === "error"
      ? "Connection unavailable"
      : state.status === "signed-out"
        ? "Session expired"
        : state.code === "subscription_expired"
          ? "Subscription expired"
          : state.code === "subscription_not_started"
            ? "Subscription not started"
            : "Subscription required";

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "#f5f8fa",
      }}
    >
      <section
        role="alert"
        style={{
          width: "100%",
          maxWidth: 480,
          padding: 32,
          borderRadius: 16,
          background: "white",
          textAlign: "center",
          color: "#173944",
        }}
      >
        <h1 style={{ fontSize: 24 }}>{title}</h1>

        <p style={{ color: "#71838e", lineHeight: 1.7 }}>
          {state.message}
        </p>

        {state.endDate && (
          <p>Subscription end date: {state.endDate}</p>
        )}

        {logoutError && (
          <p style={{ color: "#bb4d4d" }}>{logoutError}</p>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 12,
            marginTop: 22,
          }}
        >
          <button
            type="button"
            disabled={signingOut}
            onClick={() => {
              setState({ key, status: "checking" });
              setRetry((value) => value + 1);
            }}
            style={{
              width: "auto",
              padding: "11px 18px",
              border: 0,
              borderRadius: 9,
              background: "#39aaa5",
              color: "white",
              cursor: "pointer",
            }}
          >
            Check again
          </button>

          <button
            type="button"
            disabled={signingOut}
            onClick={signOut}
            style={{
              width: "auto",
              padding: "11px 18px",
              border: 0,
              borderRadius: 9,
              background: "#edf1f3",
              color: "#344e5a",
              cursor: "pointer",
            }}
          >
            {signingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </section>
    </main>
  );
}
