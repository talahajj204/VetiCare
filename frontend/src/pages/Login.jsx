import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaPaw,
  FaCalendarCheck,
  FaNotesMedical,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import loginBg from "../assets/images.png";
import clinicLogo from "../assets/clinic-logo.png";
import { getHomePath } from "../auth/permissions";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          rememberMe,
        }),
      });

      if (!response.ok) {
        setError(
          response.status === 401
            ? "Unable to sign in. Check your credentials or try again later."
            : "Unable to sign in right now. Please try again."
        );
        return;
      }

      const user = await response.json();

      if (!Array.isArray(user?.roles)) {
        setError(
          "Unable to determine your account permissions."
        );
        return;
      }

      if (user.roles.includes("SuperAdmin")) {
        navigate("/super-admin/dashboard", {
          replace: true,
        });
        return;
      }

      if (
        user.roles.includes("ClinicAdmin") ||
        user.roles.includes("Staff")
      ) {
        navigate(getHomePath(user), { replace: true });
        return;
      }
      setError(
        "Your account does not have permission to access a dashboard."
      );
    } catch {
      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="login-page"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <div className="login-background-overlay" />

      <style>{`
        html body #root .login-page
        .login-brand > .login-brand-icon {
          width: 76px !important;
          min-width: 76px !important;
          height: 76px !important;
          flex: 0 0 76px !important;

          display: flex !important;
          align-items: center !important;
          justify-content: center !important;

          padding: 0 !important;
          overflow: hidden !important;
          background: #ffffff !important;
          border-radius: 14px !important;
        }

        html body #root .login-page
        .login-brand-icon > .login-clinic-logo {
          display: block !important;
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;

          margin: 0 !important;
          padding: 0 !important;
          object-fit: contain !important;
        }

        @media (max-width: 600px) {
          html body #root .login-page
          .login-brand > .login-brand-icon {
            width: 64px !important;
            min-width: 64px !important;
            height: 64px !important;
            flex-basis: 64px !important;
          }
        }
      `}</style>

      <div className="login-split-container">
        <section className="login-info-side">
          <div className="login-brand">
            <div className="login-brand-icon">
              <img
                src={clinicLogo}
                alt="VetiCare logo"
                className="login-clinic-logo"
              />
            </div>

            <h1>VetiCare </h1>
          </div>

          <h2>Better care starts here.</h2>

          <p className="login-description">
            A simple veterinary clinic management system
            designed to help you manage pets, owners,
            appointments, medical records, and daily clinic
            operations in one place.
          </p>

          <div className="login-features">
            <div className="login-feature">
              <div className="login-feature-icon">
                <FaCalendarCheck />
              </div>

              <p>
                Manage appointments and keep your clinic
                schedule organized.
              </p>
            </div>

            <div className="login-feature">
              <div className="login-feature-icon">
                <FaPaw />
              </div>

              <p>
                Keep pet and owner information easy to
                access and manage.
              </p>
            </div>

            <div className="login-feature">
              <div className="login-feature-icon">
                <FaNotesMedical />
              </div>

              <p>
                Track medical records, vaccinations,
                medications, and prescriptions.
              </p>
            </div>
          </div>

          <div className="login-left-footer">
            <strong>
              Everything your clinic needs, in one place.
            </strong>
          </div>
        </section>

        <section className="login-form-side">
          <div className="login-form-wrapper">
            <span className="login-small-title">
              CLINIC ADMINISTRATOR
            </span>

            <h2>Sign in</h2>

            <p className="login-form-description">
              Sign in with your clinic administrator account
              to manage appointments, patients, records,
              billing, and clinic settings.
            </p>

            <form
              onSubmit={handleLogin}
              aria-busy={isSubmitting}
            >
              {/* EMAIL */}
              <div className="login-field">
                <label>Email</label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>

              {/* PASSWORD */}
              <div className="login-field">
                <label>Password</label>

                <div className="login-password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}
                  </button>
                </div>
              </div>

              {/* OPTIONS */}
              <div className="login-options">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) =>
                      setRememberMe(e.target.checked)
                    }
                  />
                  <span>Remember me</span>
                </label>

                <Link to="/forgot-password">
                  Forgot Password?
                </Link>
              </div>

              {error && (
                <p
                  role="alert"
                  style={{
                    color: "#c0392b",
                    fontSize: "13px",
                    lineHeight: 1.5,
                    margin: "0 0 14px",
                  }}
                >
                  {error}
                </p>
              )}

              {/* LOGIN */}
              <button
                type="submit"
                className="login-submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="login-form-footer">
              <span>
                Secure access for authorized clinic staff only.
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;