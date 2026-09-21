import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <section className="not-found">
      <p>404</p>
      <h1>Page not found</h1>
      <span>The page you are looking for does not exist.</span>

      <Link className="primary-button" to="/dashboard">
        Go to Dashboard
      </Link>
    </section>
  );
};

export default NotFound;