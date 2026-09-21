import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  createClient,
  getClientById,
  updateClient,
} from "../api/customerApi.js";

const initialFormData = {
  name: "",
  companyName: "",
  email: "",
  phone: "",
  billingAddress: "",
  gstNumber: "",
};

const ClientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
  if (!isEditing) {
    return;
  }

  const loadClient = async () => {
    try {
      const data = await getClientById(id);

      setFormData({
        ...initialFormData,
        ...data.client,
      });
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Could not load client.",
        "error"
      );

      navigate("/clients");
    } finally {
      setLoading(false);
    }
  };

  loadClient();
}, [id, isEditing, navigate]);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      if (isEditing) {
        await updateClient(id, formData);
      } else {
        await createClient(formData);
      }

      await Swal.fire(
        "Success",
        `Client ${isEditing ? "updated" : "created"} successfully.`,
        "success",
      );

      navigate("/clients");
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Could not save client.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading client...</p>;

  return (
    <section className="client-form-page">
      <header className="page-header">
        <div>
          <h1>{isEditing ? "Edit Client" : "Add Client"}</h1>
          <p>Enter the client details used on invoices.</p>
        </div>
      </header>

      <form className="client-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Client Name *
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              maxLength={100}
              required
            />
          </label>

          <label>
            Company Name
            <input
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Acme Pvt. Ltd."
              maxLength={100}
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
            />
          </label>

          <label>
            Phone
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              maxLength={15}
            />
          </label>

          <label>
            GST Number
            <input
              name="gstNumber"
              value={formData.gstNumber}
              onChange={handleChange}
              placeholder="22AAAAA0000A1Z5"
              maxLength={15}
            />
          </label>

          <label className="form-grid__full">
            Billing Address
            <textarea
              name="billingAddress"
              value={formData.billingAddress}
              onChange={handleChange}
              placeholder="Enter billing address"
              rows="4"
              maxLength={250}
            />
          </label>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/clients")}
          >
            Cancel
          </button>

          <button type="submit" className="primary-button" disabled={saving}>
            {saving ? "Saving..." : isEditing ? "Update Client" : "Save Client"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default ClientForm;
