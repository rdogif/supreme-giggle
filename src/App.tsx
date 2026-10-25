import { useEffect, useMemo, useRef, useState } from "react";
import { MotionConfig, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUpRight,
  AudioLines,
  Bookmark,
  Check,
  ChevronRight,
  Code2,
  Command,
  Compass,
  Flame,
  Gamepad2,
  Globe2,
  GraduationCap,
  Grid2X2,
  Heart,
  Menu,
  Moon,
  Palette,
  Search,
  ShieldCheck,
  Shuffle,
  SlidersHorizontal,
  Smile,
  Sparkles,
  Sun,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import {
  categories,
  filterResources,
  initialFilters,
  readFavorites,
  resources,
  type Resource,
} from "./lib/directory";

const icons: Record<string, LucideIcon> = {
  All: Compass,
  Coding: Code2,
  School: GraduationCap,
  Creative: Palette,
  Tools: Wrench,
  Media: AudioLines,
  Fun: Smile,
  Games: Gamepad2,
  Privacy: ShieldCheck,
  AI: Sparkles,
};
const colors: Record<string, string> = {
  Coding: "violet",
  School: "blue",
  Creative: "pink",
  Tools: "amber",
  Media: "pink",
  Fun: "green",
  Games: "amber",
  Privacy: "green",
  AI: "violet",
};
function initialTheme() {
  try {
    return (
      localStorage.getItem("rishaanHubTheme") === "dark" ||
      (!localStorage.getItem("rishaanHubTheme") &&
        matchMedia("(prefers-color-scheme: dark)").matches)
    );
  } catch {
    return false;
  }
}
function App() {
  const [filters, setFilters] = useState(initialFilters);
  const [favorites, setFavorites] = useState(readFavorites);
  const [dark, setDark] = useState(initialTheme);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();
  const visible = useMemo(
    () => filterResources(filters, favorites),
    [filters, favorites],
  );
  const activeCount = [filters.trending, filters.free, filters.noLogin].filter(
    Boolean,
  ).length;
  const reset = () => {
    setFilters(initialFilters);
    setMenuOpen(false);
  };
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
    try {
      localStorage.setItem("rishaanHubTheme", dark ? "dark" : "light");
    } catch {
      /* Storage may be disabled. */
    }
  }, [dark]);
  useEffect(() => {
    try {
      localStorage.setItem("rishaanHubFavorites", JSON.stringify(favorites));
    } catch {
      setNotice(
        "Browser storage is unavailable. Favorites will last for this visit.",
      );
    }
  }, [favorites]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const typing =
        e.target instanceof HTMLElement &&
        (e.target.matches("input,textarea,select") ||
          e.target.isContentEditable);
      if (
        (e.key === "/" && !typing) ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") {
        setFilters(initialFilters);
        setMenuOpen(false);
        if (menuOpen) menuRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [menuOpen]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(timer);
  }, [notice]);
  const toggleFavorite = (name: string) =>
    setFavorites((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  const browse = () =>
    document
      .getElementById("directory")
      ?.scrollIntoView({ behavior: reduceMotion ? "instant" : "smooth" });
  const random = () => {
    const pool = visible.length ? visible : resources;
    window.open(
      pool[Math.floor(Math.random() * pool.length)].url,
      "_blank",
      "noopener,noreferrer",
    );
  };
  const exportFavorites = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          resources.filter((r) => favorites.includes(r.name)),
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "rishaan-hub-favorites.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Your favorites have been exported.");
  };
  function card(r: Resource) {
    const saved = favorites.includes(r.name);
    const Icon = icons[r.category] || Globe2;
    return (
      <SpotlightCard
        key={r.name}
        className="resource-card"
        spotlightColor={
          dark ? "rgba(159,132,255,.09)" : "rgba(116,86,232,.055)"
        }
      >
        <article aria-label={r.name}>
          <div className="card-top">
            <div className={`resource-icon ${colors[r.category]}`}>
              <Icon size={23} strokeWidth={1.7} />
            </div>
            <span className={`category-label ${colors[r.category]}`}>
              {r.category}
            </span>
            <button
              className={`save-button ${saved ? "saved" : ""}`}
              aria-label={`${saved ? "Remove" : "Save"} ${r.name}${saved ? " from favorites" : " to favorites"}`}
              aria-pressed={saved}
              onClick={() => toggleFavorite(r.name)}
            >
              <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
            </button>
          </div>
          <a
            className="resource-link"
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h3>{r.name}</h3>
            <ArrowUpRight size={18} />
          </a>
          <p className="description">{r.description}</p>
          <div className="tags">
            {r.tags.slice(0, 3).map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <div className="card-footer">
            <span>
              <span className="rating-star">★</span> {r.rating.toFixed(1)}
              <span className="divider-dot">·</span>
              {r.popular} saves
            </span>
            <span className="free-status">
              {r.free ? (
                <>
                  <span />
                  Free
                </>
              ) : (
                "Paid"
              )}
            </span>
          </div>
        </article>
      </SpotlightCard>
    );
  }
  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#directory">
        Skip to resources
      </a>
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <Command size={23} />
          </span>
          <span>
            rishaan<span className="brand-dot">.</span>
            <small>INTERNET HUB</small>
          </span>
        </div>
        <div className="topbar-divider" />
        <span className="topbar-note">Good finds. One place.</span>
        <div className="topbar-actions">
          <span className="local-note">
            <span />
            Your corner of the internet
          </span>
          <button
            className="icon-button"
            aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
            onClick={() => setDark(!dark)}
          >
            {dark ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <button
            className="icon-button mobile-menu"
            ref={menuRef}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="sidebar"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </header>
      {menuOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside id="sidebar" className={`sidebar ${menuOpen ? "is-open" : ""}`}>
        <div className="side-label">YOUR EXPLORER</div>
        <button
          className={`nav-item ${!filters.favorites && filters.category === "All" ? "active" : ""}`}
          onClick={() => {
            setFilters((f) => ({ ...f, category: "All", favorites: false }));
            setMenuOpen(false);
          }}
        >
          <Compass size={18} />
          Discover<span className="nav-count">264</span>
        </button>
        <button
          className={`nav-item ${filters.favorites ? "active" : ""}`}
          onClick={() => {
            setFilters((f) => ({ ...f, favorites: !f.favorites }));
            setMenuOpen(false);
          }}
        >
          <Bookmark size={18} />
          My favorites<span className="nav-count">{favorites.length}</span>
        </button>
        <div className="side-rule" />
        <div className="side-label">
          BROWSE CATEGORIES<span>09</span>
        </div>
        <nav aria-label="Resource categories">
          {categories
            .filter((c) => c !== "All")
            .map((c) => {
              const Icon = icons[c] || Globe2;
              return (
                <button
                  key={c}
                  className={`nav-item ${filters.category === c ? "active" : ""}`}
                  aria-pressed={filters.category === c}
                  onClick={() => {
                    setFilters((f) => ({ ...f, category: c }));
                    setMenuOpen(false);
                  }}
                >
                  <Icon size={18} />
                  {c}
                  <span className="nav-count">
                    {resources.filter((r) => r.category === c).length}
                  </span>
                </button>
              );
            })}
        </nav>
        <div className="sidebar-bottom">
          <div className="collection-tip">
            <span className="tip-icon">
              <Sparkles size={17} />
            </span>
            <strong>
              A little less searching.
              <br />A lot more discovering.
            </strong>
            <p>Your next favorite website is in here somewhere.</p>
            <button onClick={random}>
              Surprise me <ArrowUpRight size={15} />
            </button>
          </div>
          <button className="export-button" onClick={exportFavorites}>
            <ArrowDownToLine size={16} />
            Export favorites
            <ArrowUpRight size={14} />
          </button>
          <div className="sidebar-credit">
            Curated by Rishaan <Heart size={12} />
          </div>
        </div>
      </aside>
      <main>
        <div className="breadcrumb">
          <span>YOUR INTERNET, ORGANIZED</span>
          <span className="edition">
            THE GOOD STUFF, BOOKMARKED <span>↗</span>
          </span>
        </div>
        <section className="hero">
          <motion.div
            className="hero-copy"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="eyebrow">
              <span />
              <span>A handpicked corner of the web</span>
            </div>
            <h1>
              The internet is big.
              <br />
              <span>Find your good stuff.</span>
            </h1>
            <p>
              264 useful, creative, and wonderfully unexpected websites.
              <br className="desktop-break" /> Less endless scrolling. More
              “where has this been?”
            </p>
            <div className="hero-actions">
              <MagneticButton
                strength={reduceMotion ? 0 : 0.15}
                className="hero-primary"
                onClick={browse}
              >
                Start exploring <ArrowDown size={16} />
              </MagneticButton>
              <MagneticButton
                strength={reduceMotion ? 0 : 0.15}
                variant="ghost"
                glow={false}
                className="hero-random"
                onClick={random}
              >
                <Shuffle size={17} />
                Surprise me
              </MagneticButton>
            </div>
            <div className="hero-stats">
              <span>
                <strong>264</strong> curated resources
              </span>
              <i />
              <span>
                <strong>9</strong> categories
              </span>
              <i />
              <span>
                <span className="tiny-dot" />
                Always worth a click
              </span>
            </div>
          </motion.div>
          <div className="hero-art" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="orbit orbit-three" />
            <span className="orbit-dot dot-one" />
            <span className="orbit-dot dot-two" />
            <div className="art-center">
              <Globe2 size={55} strokeWidth={1} />
              <span>GO EXPLORE</span>
            </div>
            <div className="floating-tile tile-code">
              <Code2 size={29} />
            </div>
            <div className="floating-tile tile-creative">
              <Palette size={29} />
            </div>
            <div className="floating-tile tile-school">
              <GraduationCap size={29} />
            </div>
            <div className="floating-tile tile-spark">
              <Sparkles size={27} />
            </div>
            <div className="art-caption">
              <span /> A whole world of possibility.
            </div>
          </div>
        </section>
        <section id="directory" className="directory">
          <div className="directory-title">
            <div>
              <h2>
                {filters.q
                  ? "Search discoveries"
                  : filters.category === "All"
                    ? filters.favorites
                      ? "Your favorites"
                      : "Explore the collection"
                    : filters.category}
                <span className="result-count" aria-live="polite">
                  {visible.length}
                </span>
              </h2>
              <p>
                {filters.favorites
                  ? "The good stuff you’ve saved for later."
                  : "A useful tool, a new rabbit hole, your next big idea. It’s all here."}
              </p>
            </div>
            <button className="reset-button" onClick={reset}>
              Reset filters <span>↺</span>
            </button>
          </div>
          <div className="search-box">
            <Search size={20} />
            <input
              ref={searchRef}
              value={filters.q}
              onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
              aria-label="Search resources"
              placeholder="Find your next favorite website..."
            />
            <span className="search-hint">Search anything</span>
            {filters.q ? (
              <button
                className="clear-search"
                aria-label="Clear search"
                onClick={() => setFilters((f) => ({ ...f, q: "" }))}
              >
                <X size={17} />
              </button>
            ) : (
              <kbd>/</kbd>
            )}
          </div>
          <div className="filter-row">
            <AnimatedTabs
              className="collection-tabs"
              tabsContainerClassName="collection-tabs-bar"
              tabs={[
                {
                  id: "all",
                  label: "All resources",
                  icon: <Grid2X2 size={15} />,
                },
                {
                  id: "favorites",
                  label: "Favorites",
                  icon: <Bookmark size={15} />,
                },
              ]}
              activeTab={filters.favorites ? "favorites" : "all"}
              onChange={(id) =>
                setFilters((f) => ({ ...f, favorites: id === "favorites" }))
              }
              renderContent={false}
            />
            <div className="filter-separator" />
            <div className="filter-chips">
              {(
                [
                  { key: "trending", label: "Trending", Icon: Flame },
                  { key: "free", label: "Free", Icon: Check },
                  { key: "noLogin", label: "No login", Icon: ShieldCheck },
                ] as const
              ).map(({ key, label, Icon }) => (
                <button
                  key={key}
                  className={`filter-chip ${filters[key] ? "selected" : ""}`}
                  aria-pressed={filters[key]}
                  onClick={() => setFilters((f) => ({ ...f, [key]: !f[key] }))}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>
            <label className="sort-label">
              <SlidersHorizontal size={15} />
              <span className="sr-only">Sort resources</span>
              <select
                aria-label="Sort resources"
                value={filters.sort}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, sort: e.target.value }))
                }
              >
                <option value="popular">Most popular</option>
                <option value="rating">Highest rated</option>
                <option value="newest">Recently added</option>
                <option value="az">A–Z</option>
              </select>
            </label>
          </div>
          <div className="results-meta">
            <span>
              {filters.q ? (
                <>
                  Results for <strong>“{filters.q}”</strong>
                </>
              ) : (
                <>A little bit of everything. A lot worth discovering.</>
              )}
            </span>
            <span>
              {visible.length} resources{" "}
              {activeCount > 0 ? `· ${activeCount} filters` : ""}
            </span>
          </div>
          {visible.length ? (
            <div className="resource-grid">{visible.map(card)}</div>
          ) : (
            <div className="empty-state">
              <Search size={32} />
              <h3>
                {filters.favorites
                  ? "Your next favorite is waiting."
                  : "No discoveries this time."}
              </h3>
              <p>
                {filters.favorites
                  ? "Save a resource with the bookmark button, or try clearing your filters."
                  : "Try another search or clear a filter to see more resources."}
              </p>
              <MagneticButton className="hero-primary" onClick={reset}>
                Explore all resources <ChevronRight size={16} />
              </MagneticButton>
            </div>
          )}
        </section>
        <footer>
          <span>
            <span className="footer-mark">✳</span> A better little corner of the
            internet.
          </span>
          <span>
            Made by Rishaan <span className="divider-dot">·</span> Favorites
            stay on this device
          </span>
        </footer>
      </main>
      {notice && (
        <div role="status" className="toast">
          <Check size={17} />
          {notice}
          <button
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </MotionConfig>
  );
}
export default App;
