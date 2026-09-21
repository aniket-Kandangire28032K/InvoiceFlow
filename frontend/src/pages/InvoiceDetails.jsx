import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { getInvoiceById, updateInvoice } from "../api/invoiceApi.js";

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);

const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        const data = await getInvoiceById(id);
        setInvoice(data.invoice);
      } catch (error) {
        Swal.fire(
          "Error",
          error.response?.data?.message || "Could not load invoice.",
          "error"
        );
        navigate("/invoices");
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [id, navigate]);

  const handleStatusChange = async (event) => {
    const status = event.target.value;

    try {
      setUpdatingStatus(true);

      const data = await updateInvoice(id, { status });
      setInvoice(data.invoice);

      Swal.fire("Updated", "Invoice status updated.", "success");
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Could not update status.",
        "error"
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) return <p className="page-loading">Loading invoice...</p>;
  if (!invoice) return null;

  const client = invoice.clientId;

  return (
    <section className="invoice-details">
      <header className="invoice-details__header">
        <div>
          <Link className="back-link" to="/invoices">
            ← Back to invoices
          </Link>
          <h1>{invoice.invoiceNumber}</h1>
          <p>Created on {new Date(invoice.issueDate).toLocaleDateString("en-IN")}</p>
        </div>

        <div className="invoice-details__actions">
          <select
            value={invoice.status}
            onChange={handleStatusChange}
            disabled={updatingStatus}
          >
            <option value="Draft">Draft</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
          </select>
          <Link className="secondary-button" to={`/invoices/${invoice._id}/edit`}>
  Edit Invoice
</Link>
          <button
            className="primary-button"
            onClick={() => window.print()}
          >
            Print Invoice
          </button>
        </div>
      </header>

      <article className="invoice-paper">
        <div className="invoice-paper__top">
          <div>
            <h2>INVOICEFLOW</h2>
            <p>Invoice: {invoice.invoiceNumber}</p>
          </div>

          <span className={`status status--${invoice.status.toLowerCase()}`}>
            {invoice.status}
          </span>
        </div>

        <div className="invoice-addresses">
          <div>
            <span>Billed To</span>
            <h3>{client?.companyName || client?.name}</h3>
            {client?.companyName && <p>{client.name}</p>}
            <p>{client?.email}</p>
            <p>{client?.phone}</p>
            <p>{client?.billingAddress}</p>
            {client?.gstNumber && <p>GST: {client.gstNumber}</p>}
          </div>

          <div>
            <span>Invoice Details</span>
            <p><strong>Issue Date:</strong> {new Date(invoice.issueDate).toLocaleDateString("en-IN")}</p>
            <p><strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString("en-IN")}</p>
          </div>
        </div>

        <div className="invoice-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.description}</td>
                  <td>{item.quantity}</td>
                  <td>{formatCurrency(item.rate)}</td>
                  <td>{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="invoice-summary">
          <p><span>Subtotal</span><strong>{formatCurrency(invoice.subtotal)}</strong></p>
          <p><span>Tax ({invoice.taxPercentage}%)</span><strong>{formatCurrency(invoice.taxAmount)}</strong></p>
          <p><span>Discount</span><strong>- {formatCurrency(invoice.discount)}</strong></p>
          <p className="invoice-summary__total">
            <span>Grand Total</span>
            <strong>{formatCurrency(invoice.grandTotal)}</strong>
          </p>
        </div>
      </article>
    </section>
  );
};

export default InvoiceDetails;