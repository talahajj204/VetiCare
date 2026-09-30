// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import loginBg from "../assets/images.png";

// function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   // للتنقل بين الصفحات
//   const navigate = useNavigate();

//   const handleLogin = (e) => {
//     e.preventDefault();

//     // مؤقتاً Frontend فقط
//     console.log("Email:", email);
//     console.log("Password:", password);

//     // بعد الضغط على Login يذهب إلى Dashboard
//     navigate("/dashboard");
//   };

//   return (
//     <div
//       className="login-page"
//       style={{ backgroundImage: `url(${loginBg})` }}
//     >
//       <div className="login-container">

//         <div className="login-header">
//           <h1>🐾 Vet Clinic</h1>
//           <p>Veterinary Clinic Management System</p>
//         </div>

//         <form onSubmit={handleLogin}>

//           {/* Email */}
//           <div className="form-group">
//             <label>Email</label>

//             <input
//               type="email"
//               placeholder="Enter your email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>


//           {/* Password */}
//           <div className="form-group">
//             <label>Password</label>

//             <input
//               type="password"
//               placeholder="Enter your password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>


//           {/* Remember Me + Forgot Password */}
//           <div className="login-options">

//             <label className="remember-me">
//               <input type="checkbox" />
//               <span>Remember me</span>
//             </label>

//             <Link to="/forgot-password">
//               Forgot Password?
//             </Link>

//           </div>


//           {/* Login Button */}
//           <button type="submit">
//             Login
//           </button>

//         </form>

//       </div>
//     </div>
//   );
// }

// export default Login;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaPaw, FaCalendarCheck, FaNotesMedical, FaEye, FaEyeSlash } from "react-icons/fa";
import loginBg from "../assets/images.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    console.log("Email:", email);
    console.log("Password:", password);

    // Backend later
    navigate("/dashboard");
  };

  return (
    <div
      className="login-page"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
     
      <div className="login-background-overlay" />

      <div className="login-split-container">

       

        <section className="login-info-side">

          <div className="login-brand">
            <div className="login-brand-icon">
              <FaPaw />
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