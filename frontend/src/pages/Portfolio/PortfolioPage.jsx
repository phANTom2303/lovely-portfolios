import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Portfolio from "./Portfolio";
import { fetchPortfolio, fetchPublicPortfolio } from "../../api/portfolioApi";
import { getErrorMessage } from "../../utils/getErrorMessage";
import portfolioStyles from "./Portfolio.module.css";
import styles from "./PortfolioPage.module.css";

const STATUS_LABELS = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

/**
 * Fetches a portfolio and hands it to the <Portfolio /> renderer.
 *  - mode="public":  published portfolios only, no auth (GET /api/portfolio/public/:id)
 *  - mode="preview": any portfolio of the signed-in user (GET /api/portfolio?portfolio_id=)
 */
export default function PortfolioPage({ mode = "public" }) {
  const { portfolioId } = useParams();
  const requestKey = `${mode}:${portfolioId}`;
  const [state, setState] = useState({ requestKey: null, portfolio: null, error: "" });
  const isLoading = state.requestKey !== requestKey;

  useEffect(() => {
    let isMounted = true;
    const fetcher = mode === "preview" ? fetchPortfolio : fetchPublicPortfolio;

    fetcher(portfolioId)
      .then((portfolio) => {
        if (isMounted) setState({ requestKey, portfolio: portfolio || null, error: "" });
      })
      .catch((err) => {
        if (!isMounted) return;
        const status = err?.response?.status;
        // 400 (malformed id) and 404 both render the standard not-found card
        const error =
          status === 404 || status === 400
            ? ""
            : getErrorMessage(err, "Failed to load this portfolio.");
        setState({ requestKey, portfolio: null, error });
      });

    return () => {
      isMounted = false;
    };
  }, [mode, portfolioId, requestKey]);

  if (isLoading || state.error) {
    return (
      <div className={portfolioStyles.notFoundPage}>
        <div className={portfolioStyles.notFoundCard} role={state.error ? "alert" : "status"}>
          {state.error ? (
            <>
              <h2 className={portfolioStyles.notFoundTitle}>Something went wrong</h2>
              <p className={portfolioStyles.notFoundDesc}>{state.error}</p>
              <button
                type="button"
                className={`${portfolioStyles.notFoundAction} ${styles.retryBtn}`}
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </>
          ) : (
            <>
              <span className={styles.spinner} aria-hidden="true" />
              <p className={portfolioStyles.notFoundDesc}>Loading portfolio…</p>
            </>
          )}
        </div>
      </div>
    );
  }

  const { portfolio } = state;
  const overrideData = portfolio?.profile_data
    ? { document: portfolio.profile_data, theme: portfolio.profile_data.theme }
    : null;

  return (
    <>
      {mode === "preview" && portfolio && (
        <div className={styles.previewBanner} role="note">
          <span className={styles.previewLabel}>Preview</span>
          <span className={styles.previewStatus}>
            {STATUS_LABELS[portfolio.status] || portfolio.status}
            {portfolio.status !== "published" && " · only visible to you"}
          </span>
          <Link to={`/portfolio/${portfolio.portfolio_id}/edit`} className={styles.previewLink}>
            Back to editor
          </Link>
        </div>
      )}
      <Portfolio overrideData={overrideData} />
    </>
  );
}
