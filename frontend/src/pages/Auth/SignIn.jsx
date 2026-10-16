import styles from "./Auth.module.css";
import { Link } from "react-router-dom";
function SignIn() {
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
          <form>
            <div className={styles.formField}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                required
              />
            </div>
            <div className={styles.formField}>
              <label htmlFor="password"> Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                required
              />
            </div>
            <Link className={styles.forgotPassword} to="/forgot-password">
              Forgot Password?
            </Link>
            <button type="submit">Sign In</button>
          </form>
        </div>
      </section>
    </main>
  );
}
export default SignIn;
