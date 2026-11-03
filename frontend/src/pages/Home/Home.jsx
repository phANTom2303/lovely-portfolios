import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import PortfolioCard from "../../components/dashboard/PortfolioCard";
import CreatePortfolioModal from "../../components/dashboard/CreatePortfolioModal";
import { useAuth } from "../../context/authContext";
import {
  fetchPortfolios,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
} from "../../api/portfolioApi";
import { getErrorMessage } from "../../utils/getErrorMessage";
import styles from "./Home.module.css";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

const STATUS_LABELS = {
  draft: "moved to drafts",
  published: "published",
  archived: "archived",
};

// Newest first
function sortPortfolios(list) {
  return [...list].sort((a, b) => b.portfolio_id - a.portfolio_id);
}

export default function Home() {
  const { user } = useAuth();
  const [portfolios, setPortfolios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const [busyId, setBusyId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all' | 'draft' | 'published' | 'archived'
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Re-runs whenever reloadToken is bumped (retry, or after a new portfolio is generated)
  useEffect(() => {
    let isMounted = true;
    fetchPortfolios()
      .then((list) => {
        if (!isMounted) return;
        setPortfolios(sortPortfolios(Array.isArray(list) ? list : []));
        setLoadError("");
      })
      .catch((err) => {
        if (isMounted) setLoadError(getErrorMessage(err, "Failed to load your portfolios."));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [reloadToken]);

  const showToast = (message, isError = false) => {
    const next = { message, isError };
    setNotification(next);
    setTimeout(() => {
      setNotification((curr) => (curr === next ? null : curr));
    }, 3500);
  };

  const replacePortfolio = (updated) => {
    setPortfolios((prev) =>
      prev.map((p) => (p.portfolio_id === updated.portfolio_id ? updated : p))
    );
  };

  const handleChangeStatus = async (id, status) => {
    setBusyId(id);
    try {
      const updated = await updatePortfolio({ portfolio_id: id, status });
      replacePortfolio(updated);
      showToast(`"${updated.portfolio_name}" ${STATUS_LABELS[status]}.`);
    } catch (err) {
      showToast(getErrorMessage(err, "Failed to update portfolio status."), true);
    } finally {
      setBusyId(null);
    }
  };

  const handleCreated = (result) => {
    setReloadToken((t) => t + 1);
    showToast(
      `Portfolio #${result?.portfolio_id} generated as a draft. Review it before publishing.`
    );
  };

  const handleDuplicate = async (id) => {
    const original = portfolios.find((p) => p.portfolio_id === id);
    if (!original) return;
    setBusyId(id);
    try {
      const duplicated = await createPortfolio({
        portfolio_name: `Copy of ${original.portfolio_name}`,
        profile_data: original.profile_data,
      });
      setPortfolios((prev) => sortPortfolios([duplicated, ...prev]));
      showToast(`Duplicated into "${duplicated.portfolio_name}"`);
    } catch (err) {
      showToast(getErrorMessage(err, "Failed to duplicate portfolio."), true);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    setBusyId(id);
    try {
      await deletePortfolio(id);
      setPortfolios((prev) => prev.filter((p) => p.portfolio_id !== id));
      showToast("Portfolio removed successfully.");
    } catch (err) {
      showToast(getErrorMessage(err, "Failed to delete portfolio."), true);
    } finally {
      setBusyId(null);
    }
  };

  const countFor = (status) =>
    status === "all"
      ? portfolios.length
      : portfolios.filter((p) => p.status === status).length;

  const filteredPortfolios = portfolios.filter((p) => {
    const matchesSearch = (p.portfolio_name || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterType === "all") return true;
    return p.status === filterType;
  });

  const renderGridArea = () => {
    if (isLoading) {
      return (
        <div className={styles.emptyState} role="status">
          <p className={styles.emptyText}>Loading your portfolios…</p>
        </div>
      );
    }

    if (loadError) {
      return (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>{loadError}</p>
          <button
            type="button"
            className={styles.resetFilterBtn}
            onClick={() => {
              setIsLoading(true);
              setReloadToken((t) => t + 1);
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    if (filteredPortfolios.length > 0) {
      return (
        <div className={styles.portfolioGrid}>
          {filteredPortfolios.map((item) => (
            <PortfolioCard
              key={item.portfolio_id}
              portfolio={item}
              isBusy={busyId === item.portfolio_id}
              onChangeStatus={handleChangeStatus}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      );
    }

    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyText}>
          {searchQuery
            ? `No portfolios matching "${searchQuery}"`
            : portfolios.length === 0
              ? "You don't have any portfolios yet."
              : "No portfolios available in this view."}
        </p>
        {searchQuery ? (
          <button
            type="button"
            className={styles.resetFilterBtn}
            onClick={() => setSearchQuery("")}
          >
            Clear Search
          </button>
        ) : (
          <button
            type="button"
            className={styles.createBtn}
            onClick={() => setIsCreateOpen(true)}
          >
            + Create Your First Portfolio
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={styles.homeLayout}>
      <Header />

      {notification && (
        <div className={styles.toastBanner} role="status">
          <span>{notification.isError ? "⚠" : "✓"} {notification.message}</span>
        </div>
      )}

      <main className={styles.mainContainer}>
        {/* Portfolios Management Hub */}
        <section className={styles.hubSection} aria-label="Manage All Portfolios">
          <div className={styles.hubHeaderBanner}>
            <div>
              <h1 className={styles.hubMainTitle}>
                Welcome{user?.name ? `, ${user.name}` : ""}.
              </h1>
              <p className={styles.hubSubtitle}>
                Your portfolio workspace is ready. Generate portfolios tailored to a job description, review drafts, and publish them to share.
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
              <Link to="/profile" className={styles.copyLiveBtn} style={{ textDecoration: "none" }}>
                Edit Profile
              </Link>
              <button
                type="button"
                className={styles.createBtn}
                onClick={() => setIsCreateOpen(true)}
              >
                + Create Portfolio
              </button>
            </div>
          </div>

          <div className={styles.hubToolbar}>
            <div className={styles.toolbarLeft}>
              <div className={styles.filterPills}>
                {STATUS_FILTERS.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    className={`${styles.filterPill} ${
                      filterType === filter.value ? styles.filterPillActive : ""
                    }`}
                    onClick={() => setFilterType(filter.value)}
                  >
                    {filter.label} ({countFor(filter.value)})
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.toolbarRight}>
              <div className={styles.searchBox}>
                <input
                  type="text"
                  placeholder="Search portfolios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                  aria-label="Search portfolios"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className={styles.clearSearch}
                    onClick={() => setSearchQuery("")}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Grid of Portfolio Cards */}
          {renderGridArea()}
        </section>
      </main>

      <Footer />

      <CreatePortfolioModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
