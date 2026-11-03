import styles from "./Auth.module.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/authContext";
import { getErrorMessage } from "../../utils/getErrorMessage";
function SignIn() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(formData);
      const destination = location.state?.from?.pathname || "/home";
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to sign in. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.authPage}>
      <section className={styles.authCard}>
        <div className={styles.authBrand}>
          <h1>Lovely Portfolio</h1>
          <p>
            Your work deserves
            <br />a better introduction.
          </p>
        </div>
        <div className={styles.authForm}>
          <h2>Sign in to your account</h2>
          <p className={styles.signupPrompt}>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.formField}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formField}>
              <label htmlFor="password"> Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <Link className={styles.forgotPassword} to="/forgot-password">
              Forgot Password?
            </Link>
            {error && <span className={styles.error}>{error}</span>}
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
export default SignIn;
