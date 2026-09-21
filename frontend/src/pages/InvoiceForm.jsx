import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { getClients } from "../api/customerApi.js";
import {
  createInvoice,
  getInvoiceById,
  updateInvoice,
} from "../api/invoiceApi.js";

const today = new Date().toISOString().split("T")[0];

const InvoiceForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(isEditing);
  const [clients, setClients] = useState([]);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    clientId: "",
    issueDate: today,
    dueDate: "",
    taxPercentage: 0,
    discount: 0,
    status: "Draft",
    items: [{ description: "", quantity: 1, rate: 0 }],
  });

  useEffect(() => {
  const loadFormData = async () => {
    try {
      const clientsData = await getClients();
      setClients(clientsData.clients || []);

      if (isEditing) {
        const invoiceData = await getInvoiceById(id);
        const invoice = invoiceData.invoice;

        setFormData({
          clientId: invoice.clientId._id,
          issueDate: invoice.issueDate.split("T")[0],
          dueDate: invoice.dueDate.split("T")[0],
          taxPercentage: invoice.taxPercentage || 0,
          discount: invoice.discount || 0,
          status: invoice.status,
          items: invoice.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
          })),
        });
      }
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Could not load invoice data.",
        "error"
      );

      navigate("/invoices");
    } finally {
      setLoading(false);
    }
  };

  loadFormData();
}, [id, isEditing, navigate]);

  const subtotal = useMemo(
    () =>
      formData.items.reduce(
        (total, item) =>
          total + Number(item.quantity || 0) * Number(item.rate || 0),
        0,
      ),
    [formData.items],
  );

  const taxAmount = subtotal * (Number(formData.taxPercentage) / 100);
  const grandTotal = subtotal + taxAmount - Number(formData.discount || 0);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleItemChange = (index, event) => {
    const items = [...formData.items];
    items[index][event.target.name] = event.target.value;

    setFormData({ ...formData, items });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: "", quantity: 1, rate: 0 }],
    });
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) return;

    setFormData({
      ...formData,
      items: formData.items.filter((_, itemIndex) => itemIndex !== index),
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (grandTotal < 0) {
      Swal.fire(
        "Invalid invoice",
        "Discount cannot exceed the total.",
        "error",
      );
      return;
    }

    try {
      setSaving(true);

      const invoicePayload = {
        ...formData,
        taxPercentage: Number(formData.taxPercentage),
        discount: Number(formData.discount),
        items: formData.items.map((item) => ({
          description: item.description,
          quantity: Number(item.quantity),
          rate: Number(item.rate),
        })),
      };

      if (isEditing) {
        await updateInvoice(id, invoicePayload);
      } else {
        await createInvoice(invoicePayload);
      }

      await Swal.fire(
        "Success",
        `Invoice ${isEditing ? "updated" : "created"} successfully.`,
        "success",
      );
      navigate("/invoices");
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Could not create invoice.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };
  if (loading) return <p className="page-loading">Loading invoice...</p>;
  return (
    <section className="invoice-form-page">
      <header className="page-header">
        <div>
          <h1>{isEditing ? "Edit Invoice" : "Create Invoice"}</h1>

          <p>
            {isEditing
              ? "Update the invoice details below."
              : "Create an invoice for one of your clients."}
          </p>
        </div>
      </header>

      <form className="invoice-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Client *
            <select
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              required
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.companyName
                    ? `${client.name} — ${client.companyName}`
                    : client.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Status
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Draft">Draft</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </label>

          <label>
            Issue Date
            <input
              type="date"
              name="issueDate"
              value={formData.issueDate}
              onChange={handleChange}
            />
          </label>

          <label>
            Due Date *
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              min={formData.issueDate}
              required
            />
          </label>
        </div>

        <div className="invoice-items">
          <div className="invoice-items__header">
            <h2>Invoice Items</h2>
            <button
              type="button"
              className="secondary-button"
              onClick={addItem}
            >
              + Add Item
            </button>
          </div>
          <div className="invoice-item-labels">
            <span>Description</span>
            <span>Quantity</span>
            <span>Price / Rate</span>
            <span>Amount</span>
            <span>Action</span>
          </div>

          {formData.items.map((item, index) => (
            <div className="invoice-item-row" key={index}>
              <input
                name="description"
                value={item.description}
                onChange={(event) => handleItemChange(index, event)}
                placeholder="Item description"
                maxLength={150}
                required
              />

              <input
                type="number"
                name="quantity"
                value={item.quantity}
                onChange={(event) => handleItemChange(index, event)}
                placeholder="Qty"
                aria-label="Quantity"
                min="0.01"
                step="0.01"
                required
              />

              <input
                type="number"
                name="rate"
                value={item.rate}
                onChange={(event) => handleItemChange(index, event)}
                placeholder="Price"
                aria-label="Price per item"
                min="0"
                step="0.01"
                required
              />

              <strong>
                ₹
                {(Number(item.quantity || 0) * Number(item.rate || 0)).toFixed(
                  2,
                )}
              </strong>

              <button
                type="button"
                className="delete-button"
                onClick={() => removeItem(index)}
                disabled={formData.items.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="invoice-bottom">
          <div className="invoice-taxes">
            <label>
              Tax (%)
              <input
                type="number"
                name="taxPercentage"
                value={formData.taxPercentage}
                onChange={handleChange}
                min="0"
                max="100"
              />
            </label>

            <label>
              Discount (₹)
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                min="0"
              />
            </label>
          </div>

          <div className="invoice-totals">
            <p>
              <span>Subtotal</span> <strong>₹{subtotal.toFixed(2)}</strong>
            </p>
            <p>
              <span>Tax</span> <strong>₹{taxAmount.toFixed(2)}</strong>
            </p>
            <p className="invoice-totals__grand">
              <span>Total</span>
              <strong>₹{grandTotal.toFixed(2)}</strong>
            </p>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/invoices")}
          >
            Cancel
          </button>

          <button type="submit" className="primary-button" disabled={saving}>
            {saving
              ? "Saving..."
              : isEditing
                ? "Update Invoice"
                : "Create Invoice"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default InvoiceForm;
