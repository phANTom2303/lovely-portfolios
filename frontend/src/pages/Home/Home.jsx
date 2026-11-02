import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import PortfolioCard from "../../components/dashboard/PortfolioCard";
import CreatePortfolioModal from "../../components/dashboard/CreatePortfolioModal";
import {
  getPortfolios,
  setActivePortfolio,
  createPortfolio,
  duplicatePortfolio,
  deletePortfolio,
} from "../../services/portfolioStorage";
import styles from "./Home.module.css";

export default function Home() {
  const [portfolios, setPortfolios] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all' | 'active' | 'alternate'
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeCopied, setActiveCopied] = useState(false);

  useEffect(() => {
    loadPortfolios();
  }, []);

  const loadPortfolios = () => {
    const list = getPortfolios();
    setPortfolios(list);
  };

  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification((curr) => (curr === message ? null : curr));
    }, 3500);
  };

  const handleSetActive = (id) => {
    const updated = setActivePortfolio(id);
    setPortfolios(updated);
    const activeItem = updated.find((p) => p.id === id);
    showToast(`"${activeItem?.title}" is now your active live portfolio.`);
  };

  const handleCreate = (data) => {
    const created = createPortfolio(data);
    loadPortfolios();
    showToast(`Created new portfolio: "${created.title}"`);
  };

  const handleDuplicate = (id) => {
    const duplicated = duplicatePortfolio(id);
    loadPortfolios();
    if (duplicated) {
      showToast(`Duplicated into "${duplicated.title}"`);
    }
  };

  const handleDelete = (id) => {
    try {
      const remaining = deletePortfolio(id);
      setPortfolios(remaining);
      showToast("Portfolio removed successfully.");
    } catch (err) {
      alert(err.message || "Failed to delete portfolio");
    }
  };

  const activePortfolio = portfolios.find((p) => p.isActive) || portfolios[0];

  const handleCopyActiveLink = async () => {
    if (!activePortfolio) return;
    const url = `${window.location.origin}/portfolio/${activePortfolio.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setActiveCopied(true);
      setTimeout(() => setActiveCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const filteredPortfolios = portfolios.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description &&
        p.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterType === "active") return p.isActive;
    if (filterType === "alternate") return !p.isActive;
    return true;
  });

  return (
    <div className={styles.homeLayout}>
      <Header />

      {notification && (
        <div className={styles.toastBanner} role="status">
          <span>✓ {notification}</span>
        </div>
      )}

      <main className={styles.mainContainer}>
        {/* Spotlight Hero Section: Active Portfolio */}
        {activePortfolio && (
          <section className={styles.spotlightSection} aria-label="Active Portfolio Spotlight">
            <div className={styles.spotlightContent}>
              <div className={styles.spotlightHeader}>
                <span className={styles.spotlightBadge}>
                  <span className={styles.spotlightDot} /> Active Live Portfolio
                </span>
                <span className={styles.spotlightSlug}>
                  {window.location.host}/portfolio/{activePortfolio.slug}
                </span>
              </div>

              <h1 className={styles.spotlightTitle}>{activePortfolio.title}</h1>
              {activePortfolio.description && (
                <p className={styles.spotlightDesc}>
                  {activePortfolio.description}
                </p>
              )}

              <div className={styles.spotlightControls}>
                <Link
                  to={`/portfolio/${activePortfolio.slug}`}
                  className={styles.viewLiveBtn}
                >
                  View Live Portfolio ↗
                </Link>

                <button
                  type="button"
                  className={`${styles.copyLiveBtn} ${
                    activeCopied ? styles.copyLiveSuccess : ""
                  }`}
                  onClick={handleCopyActiveLink}
                >
                  {activeCopied ? "Copied to Clipboard! ✓" : "Copy Live Link"}
                </button>

                <Link to="/profile" className={styles.editContentBtn}>
                  Edit Profile & Content
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Portfolios Management Hub */}
        <section className={styles.hubSection} aria-label="Manage All Portfolios">
          <div className={styles.hubToolbar}>
            <div className={styles.toolbarLeft}>
              <h2 className={styles.hubTitle}>
                All Portfolios{" "}
                <span className={styles.portfolioCount}>
                  {portfolios.length}
                </span>
              </h2>
              <div className={styles.filterPills}>
                <button
                  type="button"
                  className={`${styles.filterPill} ${
                    filterType === "all" ? styles.filterPillActive : ""
                  }`}
                  onClick={() => setFilterType("all")}
                >
                  All ({portfolios.length})
                </button>
                <button
                  type="button"
                  className={`${styles.filterPill} ${
                    filterType === "active" ? styles.filterPillActive : ""
                  }`}
                  onClick={() => setFilterType("active")}
                >
                  Active (1)
                </button>
                <button
                  type="button"
                  className={`${styles.filterPill} ${
                    filterType === "alternate" ? styles.filterPillActive : ""
                  }`}
                  onClick={() => setFilterType("alternate")}
                >
                  Alternates ({Math.max(0, portfolios.length - 1)})
                </button>
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

              <button
                type="button"
                className={styles.createBtn}
                onClick={() => setIsCreateOpen(true)}
              >
                + Create Portfolio
              </button>
            </div>
          </div>

          {/* Grid of Portfolio Cards */}
          {filteredPortfolios.length > 0 ? (
            <div className={styles.portfolioGrid}>
              {filteredPortfolios.map((item) => (
                <PortfolioCard
                  key={item.id}
                  portfolio={item}
                  onSetActive={handleSetActive}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>
                {searchQuery
                  ? `No portfolios matching "${searchQuery}"`
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
          )}
        </section>
      </main>

      <Footer />

      <CreatePortfolioModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreate}
        portfolios={portfolios}
      />
    </div>
  );
}
