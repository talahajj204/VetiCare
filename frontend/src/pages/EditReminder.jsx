import Sidebar from "../components/Sidebar";
import { Link, useNavigate } from "react-router-dom";

function EditReminder() {

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Backend later
    alert("Reminder updated!");

    navigate("/reminders");
  };

  return (
    <div className="dashboard-layout">

      <Sidebar />

      <main className="dashboard-main">

        <div className="page-header">

          <div>
            <h1>Edit Reminder</h1>
            <p>Update reminder information</p>
          </div>

          <Link
            to="/reminders"
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

            {/* Pet Name + Reminder Type */}

            <div className="form-row">

              <div className="form-field">
                <label>Pet Name</label>

                <input
                  type="text"
                  defaultValue="Max"
                  required
                />
              </div>

              <div className="form-field">
                <label>Reminder Type</label>

                <select
                  defaultValue="vaccination"
                  required
                >
                  <option value="vaccination">
                    Vaccination
                  </option>

                  <option value="checkup">
                    Checkup
                  </option>

                  <option value="medication">
                    Medication
                  </option>

                  <option value="appointment">
                    Appointment
                  </option>

                  <option value="other">
                    Other
                  </option>
                </select>
              </div>

            </div>

            {/* Due Date + Status */}

            <div className="form-row">

              <div className="form-field">
                <label>Due Date</label>

                <input
                  type="date"
                  defaultValue="2027-05-10"
                  required
                />
              </div>

              <div className="form-field">
                <label>Status</label>

                <select defaultValue="active">

                  <option value="active">
                    Active
                  </option>

                  <option value="due-soon">
                    Due Soon
                  </option>

                  <option value="completed">
                    Completed
                  </option>

                </select>
              </div>

            </div>

            {/* Message */}

            <div className="form-field">

              <label>Reminder Message</label>

              <textarea
                rows="4"
                defaultValue="Rabies vaccine due"
                required
              />

            </div>

            {/* Buttons */}

            <div className="form-actions">

              <Link
                to="/reminders"
                className="cancel-button"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="save-button"
              >
                Update Reminder
              </button>

            </div>

          </form>

        </div>

      </main>

    </div>
  );
}

export default EditReminder;