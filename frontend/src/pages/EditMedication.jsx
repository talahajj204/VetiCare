import Sidebar from "../components/Sidebar";
import { Link, useNavigate } from "react-router-dom";

function EditMedication() {

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Backend later
    alert("Medication updated!");

    navigate("/medications");
  };

  return (
    <div className="dashboard-layout">

      <Sidebar />

      <main className="dashboard-main">

        <div className="page-header">

          <div>
            <h1>Edit Medication</h1>
            <p>Update medication information</p>
          </div>

          <Link
            to="/medications"
            className="back-button"
          >
            ← Back
          </Link>

        </div>


        <div className="owner-form-container">

          <form
            className="owner-form"
            onSubmit={handleSubmit}
          >

            {/* Medication Name + Dosage */}

            <div className="form-row">

              <div className="form-field">

                <label>Medication Name</label>

                <input
                  type="text"
                  defaultValue="Amoxicillin"
                  required
                />

              </div>


              <div className="form-field">

                <label>Dosage</label>

                <input
                  type="text"
                  defaultValue="250 mg"
                  required
                />

              </div>

            </div>


            {/* Form + Quantity */}

            <div className="form-row">

              <div className="form-field">

                <label>Form</label>

                <select
                  defaultValue="capsule"
                  required
                >
                  <option value="tablet">
                    Tablet
                  </option>

                  <option value="capsule">
                    Capsule
                  </option>

                  <option value="liquid">
                    Liquid
                  </option>

                  <option value="injection">
                    Injection
                  </option>

                  <option value="cream">
                    Cream
                  </option>

                  <option value="other">
                    Other
                  </option>
                </select>

              </div>


              <div className="form-field">

                <label>Quantity</label>

                <input
                  type="number"
                  defaultValue="40"
                  min="0"
                  required
                />

              </div>

            </div>


            {/* Notes */}

            <div className="form-field">

              <label>Notes</label>

              <textarea
                rows="4"
                defaultValue="Store in a cool and dry place"
              />

            </div>


            {/* Buttons */}

            <div className="form-actions">

              <Link
                to="/medications"
                className="cancel-button"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="save-button"
              >
                Update Medication
              </button>

            </div>

          </form>

        </div>

      </main>

    </div>
  );
}

export default EditMedication;