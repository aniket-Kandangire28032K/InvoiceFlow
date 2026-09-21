import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { getClients } from "../api/customerApi.js";
import { deleteInvoice, getInvoices } from "../api/invoiceApi.js";
import Loading from "../components/Loading.jsx";

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);

const initialFilters = {
  search: "",
  status: "",
  clientId: "",
  startDate: "",
  endDate: "",
};

const Invoices = () => {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);

  const loadInvoices = async (activeFilters = initialFilters) => {
    try {
      setLoading(true);

      const cleanFilters = Object.fromEntries(
        Object.entries(activeFilters).filter(([, value]) => value !== ""),
      );

      const data = await getInvoices(cleanFilters);
      setInvoices(data.invoices || []);
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Could not load invoices.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const clientsData = await getClients();
        setClients(clientsData.clients || []);
      } catch (error) {
        Swal.fire("Error", "Could not load clients.", "error");
      }

      loadInvoices();
    };

    loadInitialData();
  }, []);

  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value,
    });
  };

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    loadInvoices(filters);
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    loadInvoices(initialFilters);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete invoice?",
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteInvoice(id);

      setInvoices((currentInvoices) =>
        currentInvoices.filter((invoice) => invoice._id !== id),
      );

      Swal.fire("Deleted", "Invoice deleted successfully.", "success");
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Could not delete invoice.",
        "error",
      );
    }
  };

  if(loading) return <Loading/>
  return (
    <section className="invoices-page">
      <header className="page-header">
        <div>
          <h1>Invoices</h1>
          <p>Create, search, and manage all invoices.</p>
        </div>

        <Link className="primary-button" to="/invoices/new">
          + Create Invoice
        </Link>
      </header>

      <form className="invoice-filters" onSubmit={handleFilterSubmit}>
        <input
          type="search"
          name="search"
          placeholder="Search invoice number"
          value={filters.search}
          onChange={handleFilterChange}
        />

        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
        >
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Paid">Paid</option>
          <option value="Overdue">Overdue</option>
        </select>

        <select
          name="clientId"
          value={filters.clientId}
          onChange={handleFilterChange}
        >
          <option value="">All Clients</option>

          {clients.map((client) => (
            <option key={client._id} value={client._id}>
              {client.companyName
                ? `${client.name} — ${client.companyName}`
                : client.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          name="startDate"
          title="Issue date from"
          value={filters.startDate}
          onChange={handleFilterChange}
        />

        <input
          type="date"
          name="endDate"
          title="Issue date to"
          value={filters.endDate}
          onChange={handleFilterChange}
          min={filters.startDate}
        />

        <button type="submit" className="primary-button">
          Search
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={clearFilters}
        >
          Clear
        </button>
      </form>

      {loading ? (
        <Loading/>
      ) : invoices.length === 0 ? (
        <div className="empty-state">
          <h2>No invoices found</h2>
          <p>Try changing the filters or create a new invoice.</p>

          <Link className="primary-button" to="/invoices/new">
            Create Invoice
          </Link>
        </div>
      ) : (
        <div className="invoice-table-wrapper invoices-table">
          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Client</th>
                <th>Due Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice._id}>
                  <td data-label="Invoice">{invoice.invoiceNumber}</td>

                  <td data-label="Client">
                    {invoice.clientId?.companyName ||
                      invoice.clientId?.name ||
                      "Unknown client"}
                  </td>

                  <td data-label="Due Date">
                    {new Date(invoice.dueDate).toLocaleDateString("en-IN")}
                  </td>

                  <td data-label="Total">
                    {formatCurrency(invoice.grandTotal)}
                  </td>

                  <td data-label="Status">
                    <span
                      className={`status status--${invoice.status.toLowerCase()}`}
                    >
                      {invoice.status}
                    </span>
                  </td>

                  <td data-label="Actions" className="table-actions">
                    <button
                      className="secondary-button"
                      onClick={() => navigate(`/invoices/${invoice._id}`)}
                    >
                      View
                    </button>

                    <button
                      className="secondary-button"
                      onClick={() => navigate(`/invoices/${invoice._id}/edit`)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() => handleDelete(invoice._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default Invoices;
