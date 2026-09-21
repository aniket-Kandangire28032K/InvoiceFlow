import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { loginUser } from "../api/authApi.js";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);

      const data = await loginUser(formData);

      const token = data.token || data.accessToken;

      if (!token) {
        throw new Error("Login token was not returned.");
      }

      localStorage.setItem("token", token);

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      navigate("/dashboard");
    } catch (error) {
      Swal.fire(
        "Login Failed",
        error.response?.data?.message || "Invalid email or password.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="login">
      <h1>INVOICEFLOW</h1>
      <form className="section-1" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <div>
          <label htmlFor="">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />

          <label htmlFor="">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        <p>
          {" "}
          Not Registered Yet? <Link to="/register">Create Account</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
