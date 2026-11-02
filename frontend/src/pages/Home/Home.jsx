import { useState, useCallback } from "react";
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
  const [portfolios, setPortfolios] = useState(() => getPortfolios());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all' | 'active' | 'inactive'
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  const loadPortfolios = useCallback(() => {
    const list = getPortfolios();
    setPortfolios(list);
  }, []);

  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification((curr) => (curr === message ? null : curr));
    }, 3500);
  };

  const handleToggleActive = (id) => {
    const updated = setActivePortfolio(id);
    setPortfolios(updated);
    const item = updated.find((p) => p.id === id);
    showToast(
      `"${item?.title}" is now ${item?.isActive ? "active" : "inactive"}.`
    );
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

  const activeCount = portfolios.filter((p) => p.isActive).length;
  const inactiveCount = portfolios.filter((p) => !p.isActive).length;

  const filteredPortfolios = portfolios.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterType === "active") return p.isActive;
    if (filterType === "inactive") return !p.isActive;
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
        {/* Portfolios Management Hub */}
        <section className={styles.hubSection} aria-label="Manage All Portfolios">
          <div className={styles.hubHeaderBanner}>
            <div>
              <h1 className={styles.hubMainTitle}>Your Portfolios</h1>
              <p className={styles.hubSubtitle}>
                Manage your personalized portfolio links, toggle active status, and preview your builds.
              </p>
            </div>
            <button
              type="button"
              className={styles.createBtn}
              onClick={() => setIsCreateOpen(true)}
            >
              + Create Portfolio
            </button>
          </div>

          <div className={styles.hubToolbar}>
            <div className={styles.toolbarLeft}>
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
                  Active ({activeCount})
                </button>
                <button
                  type="button"
                  className={`${styles.filterPill} ${
                    filterType === "inactive" ? styles.filterPillActive : ""
                  }`}
                  onClick={() => setFilterType("inactive")}
                >
                  Inactive ({inactiveCount})
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
            </div>
          </div>

          {/* Grid of Portfolio Cards */}
          {filteredPortfolios.length > 0 ? (
            <div className={styles.portfolioGrid}>
              {filteredPortfolios.map((item) => (
                <PortfolioCard
                  key={item.id}
                  portfolio={item}
                  onSetActive={handleToggleActive}
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
