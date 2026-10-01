import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";

function AddMedication() {

  const handleSubmit = (e) => {
    e.preventDefault();

    // Backend later
    console.log("Medication submitted");
  };

  return (
    <div className="dashboard-layout">

      <Sidebar />

      <main className="dashboard-main">

        {/* Header */}
        <div className="page-header">

          <div>
            <h1>Add Medication</h1>
            <p>Enter medication information</p>
          </div>

          <Link to="/medications" className="back-button">
            ← Back
          </Link>

        </div>


        {/* Form */}
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
                  placeholder="Enter medication name"
                  required
                />
              </div>

              <div className="form-field">
                <label>Dosage</label>

                <input
                  type="text"
                  placeholder="Example: 250 mg"
                  required
                />
              </div>

            </div>


            {/* Form + Quantity */}
            <div className="form-row">

              <div className="form-field">
                <label>Form</label>

                <select required>
                  <option value="">Select medication form</option>
                  <option value="tablet">Tablet</option>
                  <option value="capsule">Capsule</option>
                  <option value="liquid">Liquid</option>
                  <option value="injection">Injection</option>
                  <option value="cream">Cream</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-field">
                <label>Quantity</label>

                <input
                  type="number"
                  placeholder="Enter quantity"
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
                placeholder="Additional medication notes..."
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
                Save Medication
              </button>

            </div>

          </form>

        </div>

      </main>

    </div>
  );
}

export default AddMedication;