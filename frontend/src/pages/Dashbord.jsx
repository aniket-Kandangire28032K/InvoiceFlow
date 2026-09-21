import { useEffect, useState } from "react";
import { getDashboard } from "../api/dashboardApi.js";
import Loading from "../components/Loading.jsx";

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const Dashbord = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await getDashboard();
        setDashboard(data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) return <Loading/>;
  if (error) return <p>{error}</p>;

  const { statistics, recentInvoices } = dashboard;

  return (
    <section className="dashboard">
      <header>
        <h1>Dashboard</h1>
        <p>Track your invoice activity and payments.</p>
      </header>

      <div className="dashboard__stats">
        <article className="stat-card">
          <span>Total Invoices</span>
          <h2>{statistics.totalInvoices}</h2>
        </article>

        <article className="stat-card">
          <span>Total Billed</span>
          <h2>{formatCurrency(statistics.totalBilled)}</h2>
        </article>

        <article className="stat-card">
          <span>Total Paid</span>
          <h2>{formatCurrency(statistics.totalPaid)}</h2>
        </article>

        <article className="stat-card">
          <span>Outstanding</span>
          <h2>{formatCurrency(statistics.outstanding)}</h2>
        </article>
      </div>

      <section className="recent-invoices">
        <h2>Recent Invoices</h2>

        {recentInvoices.length === 0 ? (
          <p>No invoices yet.</p>
        ) : (
          <div className="invoice-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Invoice No.</th>
                  <th>Client</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {recentInvoices.map((invoice) => (
                  <tr key={invoice._id}>
                    <td data-label="Invoice No.">{invoice.invoiceNumber}</td>

                    <td data-label="Client">
                      {invoice.clientId?.companyName ||
                        invoice.clientId?.name ||
                        "Unknown client"}
                    </td>

                    <td data-label="Due Date">
                      {new Date(invoice.dueDate).toLocaleDateString("en-IN")}
                    </td>

                    <td data-label="Amount">
                      {formatCurrency(invoice.grandTotal)}
                    </td>

                    <td data-label="Status">
                      <span
                        className={`status status--${invoice.status.toLowerCase()}`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
};

export default Dashbord;
