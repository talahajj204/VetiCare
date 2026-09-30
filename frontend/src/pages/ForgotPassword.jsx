// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";

// function ForgotPassword() {
//   const [email, setEmail] = useState("");

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     console.log("Reset password for:", email);
//   };

//   return (
//     <div className="login-page">
//       <div className="login-container">

//         <div className="login-header">
//           <h1>Forgot Password?</h1>
//           <p>
//             Enter your email address and we'll help you reset your password.
//           </p>
//         </div>

//         <form onSubmit={handleSubmit}>

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

//           <button type="submit">
//             Send Reset Link
//           </button>

//           <div className="back-to-login">
//             <Link to="/">
//               Back to Login
//             </Link>
//           </div>

//         </form>

//       </div>
//     </div>
//   );
// }

// export default ForgotPassword;

import { useState } from "react";
import { Link } from "react-router-dom";
import loginBg from "../assets/images.png";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Backend later
    console.log("Reset password email:", email);

    alert("Password reset link will be sent to your email.");
  };

  return (
    <div
      className="login-page"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <div className="login-container">

        <div className="login-header">
          <h1>🐾 Forgot Password?</h1>

          <p>
            Enter your email address to reset your password
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit">
            Send Reset Link
          </button>

        </form>

        <div className="back-to-login">
          <Link to="/">
            ← Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
}

export default ForgotPassword;