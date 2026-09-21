import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { registerUser } from "../api/authApi.js";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    if (formData.password !== formData.confirmPassword) {
      Swal.fire(
        "Password Error",
        "Passwords do not match.",
        "error"
      );
      return;
    }

    try {
      setLoading(true);

      const registerData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      };

      console.log("Register data:", registerData);

      const data = await registerUser(registerData);

      console.log("Register response:", data);

      Swal.fire({
        title: "Registration Successful",
        text: "Your account has been created.",
        icon: "success",
        confirmButtonText: "Go to Login",
      }).then(() => {
        navigate("/login");
      });

    } catch (error) {
      console.error("Registration error:", error);
      console.error("Response:", error.response);
      console.error("Response data:", error.response?.data);

      Swal.fire(
        "Registration Failed",
        error.response?.data?.message ||
          error.message ||
          "Unable to create account.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register">
      <h1>INVOICEFLOW</h1>

      <form className="section-1" onSubmit={handleSubmit}>
        <h2>Create Account</h2>

        <div>
          <label htmlFor="name">Name</label>

          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            required
          />

          <label htmlFor="email">Email</label>

          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />

          <label htmlFor="password">Password</label>

          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />

          <label htmlFor="confirmPassword">
            Confirm Password
          </label>

          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Register"}
        </button>

        <p>
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;