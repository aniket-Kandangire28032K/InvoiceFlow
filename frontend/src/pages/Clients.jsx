import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { deleteClient, getClients } from "../api/customerApi.js";
import Loading from "../components/Loading.jsx";

const Clients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadClients = async (searchValue = "") => {
    try {
      setLoading(true);
      const data = await getClients(searchValue);
      setClients(data.clients || []);
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Could not load clients.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearch(value);
    loadClients(value);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete client?",
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteClient(id);
      setClients((currentClients) =>
        currentClients.filter((client) => client._id !== id)
      );
      Swal.fire("Deleted", "Client deleted successfully.", "success");
    } catch (error) {
      Swal.fire(
        "Unable to delete",
        error.response?.data?.message || "Could not delete this client.",
        "error"
      );
    }
  };
  if(loading) return <Loading/>
  return (
    <section className="clients-page">
      <header className="page-header">
        <div>
          <h1>Clients</h1>
          <p>Manage the people and businesses you invoice.</p>
        </div>

        <Link className="primary-button" to="/clients/new">
          + Add Client
        </Link>
      </header>

      <div className="clients-toolbar">
        <input
          type="search"
          placeholder="Search by name, company, or email"
          value={search}
          onChange={handleSearch}
        />
      </div>

      {loading ? (
        <Loading/>
      ) : clients.length === 0 ? (
        <div className="empty-state">
          <h2>No clients found</h2>
          <p>Add your first client to start creating invoices.</p>
          <Link className="primary-button" to="/clients/new">
            Add Client
          </Link>
        </div>
      ) : (
        <div className="clients-grid">
          {clients.map((client) => (
            <article className="client-card" key={client._id}>
              <div className="client-card__avatar">
                {client.name.charAt(0).toUpperCase()}
              </div>

              <div className="client-card__details">
                <h2>{client.name}</h2>
                <p>{client.companyName || "Individual client"}</p>
                <p>{client.email || "No email added"}</p>
                <p>{client.phone || "No phone added"}</p>
              </div>

              <div className="client-card__actions">
                <button
                  className="secondary-button"
                  onClick={() => navigate(`/clients/${client._id}/edit`)}
                >
                  Edit
                </button>

                <button
                  className="delete-button"
                  onClick={() => handleDelete(client._id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default Clients;