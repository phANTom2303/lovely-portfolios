import styles from "./GeneratePortfolioTest.module.css";
import { useState } from "react";
import { useAuth } from "../../context/authContext";
import { generatePortfolio } from "../../api/portfolioApi";
import { getErrorMessage } from "../../utils/getErrorMessage";

function GeneratePortfolioTest() {
  const { user } = useAuth();
  const [jdText, setJdText] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!jdText.trim()) {
      setError("Job description cannot be empty.");
      return;
    }

    setError("");
    setStatus(null);
    setResult(null);
    setIsSubmitting(true);

    try {
      const data = await generatePortfolio(jdText);
      setResult(data);
    } catch (requestError) {
      setStatus(requestError?.response?.status ?? null);
      setError(getErrorMessage(requestError, "Unable to generate portfolio."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <h1>Generate Portfolio — Test</h1>
      <p className={styles.meta}>
        Signed in as <strong>{user?.name}</strong> ({user?.email})
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="jd_text">Job description</label>
        <textarea
          id="jd_text"
          rows={10}
          placeholder="Paste a job description..."
          value={jdText}
          onChange={(event) => setJdText(event.target.value)}
          disabled={isSubmitting}
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Generating..." : "POST /api/portfolio/generate"}
        </button>
      </form>

      {error && (
        <p className={styles.error}>
          {status && <strong>{status}: </strong>}
          {error}
        </p>
      )}

      {result && (
        <section className={styles.result}>
          <h2>Portfolio #{result.portfolio_id} created</h2>
          <pre>{JSON.stringify(result.portfolio_json, null, 2)}</pre>
        </section>
      )}
    </main>
  );
}

export default GeneratePortfolioTest;
