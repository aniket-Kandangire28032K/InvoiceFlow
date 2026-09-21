import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const logout = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Logout",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      <button
        className="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        ☰
      </button>

      {isOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}

      <aside className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar__brand">
          <span>IF</span>
          <h2>InvoiceFlow</h2>
        </div>

        <nav className="sidebar__nav">
          <NavLink to="/dashboard" onClick={closeSidebar}>
            <span>▦</span> Dashboard
          </NavLink>

          <NavLink to="/clients" onClick={closeSidebar}>
            <span>♙</span> Clients
          </NavLink>

          <NavLink to="/invoices" onClick={closeSidebar}>
            <span>▤</span> Invoices
          </NavLink>
        </nav>

        <button className="sidebar__logout" onClick={logout}>
          <span>↪</span> Logout
        </button>
      </aside>
    </>
  );
};

export default Navbar;