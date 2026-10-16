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

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    console.log("Email:", email);

    // Backend later
    navigate("/dashboard");
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

            <form onSubmit={handleLogin}>
              {/* EMAIL */}
              <div className="login-field">
                <label>Email</label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>

                <Link to="/forgot-password">
                  Forgot Password?
                </Link>
              </div>

              {/* LOGIN */}
              <button
                type="submit"
                className="login-submit-button"
              >
                Sign in
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