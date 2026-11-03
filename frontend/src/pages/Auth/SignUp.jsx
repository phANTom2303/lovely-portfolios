import styles from "./Auth.module.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/authContext";
import { getErrorMessage } from "../../utils/getErrorMessage";
function getPasswordStrength(password) {
  if (!password) return "";

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*]/.test(password)) score++;
  if (score <= 2) return "weak";
  if (score <= 4) return "medium";
  return "strong";
}
function validatePassword(password) {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password))
    return "Password must contain an uppercase letter.";
  if (!/[a-z]/.test(password))
    return "Password must contain a lowercase letter.";
  if (!/[0-9]/.test(password)) return "Password must contain a number.";
  if (!/[!@#$%^&*]/.test(password))
    return "Password must contain a special character.";

  return "";
}
function SignUp() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_no: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordStrength = getPasswordStrength(formData.password);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setServerError("");

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  }
  function validateForm() {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }
    if (formData.phone_no.length > 15) {
      newErrors.phone_no = "Phone number must be 15 characters or fewer.";
    }
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }
  async function handleSubmit(event) {
    event.preventDefault();

    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    setIsSubmitting(true);
    setServerError("");
    try {
      await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone_no: formData.phone_no,
      });
      navigate("/home", { replace: true });
    } catch (requestError) {
      setServerError(getErrorMessage(requestError, "Unable to create your account."));
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
          <h2>Create your account</h2>
          <p className={styles.signupPrompt}>
            Already a user? <Link to="/signin">Sign In</Link>
          </p>
          <form onSubmit={handleSubmit} noValidate>
            {/* Name */}
            <div className={styles.formField}>
              <label htmlFor="name"> Name</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {errors.name && (
                <span className={styles.error}>{errors.name}</span>
              )}
            </div>
            {/* Email */}
            <div className={styles.formField}>
              <label htmlFor="email"> Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && (
                <span className={styles.error}>{errors.email}</span>
              )}
            </div>
            <div className={styles.formField}>
              <label htmlFor="phone_no">Phone (optional)</label>
              <input
                id="phone_no"
                name="phone_no"
                type="tel"
                maxLength={15}
                placeholder="Enter your phone number"
                value={formData.phone_no}
                onChange={handleChange}
              />
              {errors.phone_no && (
                <span className={styles.error}>{errors.phone_no}</span>
              )}
            </div>
            {/* Password */}
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
              <div className={styles.passwordMeta}>
                <span className={styles.passwordHint}>
                  8+ characters, uppercase, lowercase, number and special
                  character.
                </span>
                {passwordStrength && (
                  <span
                    className={`${styles.passwordStrength} ${
                      styles[passwordStrength.toLowerCase()]
                    }`}
                  >
                    {passwordStrength}
                  </span>
                )}
              </div>
              {errors.password && (
                <span className={styles.error}>{errors.password}</span>
              )}
            </div>
            {/* Confirm Password */}
            <div className={styles.formField}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              {formData.confirmPassword ? (
                formData.password === formData.confirmPassword ? (
                  <span className={styles.passwordMatch}>Passwords match.</span>
                ) : (
                  <span className={styles.error}>Passwords do not match.</span>
                )
              ) : (
                errors.confirmPassword && (
                  <span className={styles.error}>{errors.confirmPassword}</span>
                )
              )}
            </div>
            {serverError && <span className={styles.error}>{serverError}</span>}
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing Up..." : "Sign Up"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
export default SignUp;
