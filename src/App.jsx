import React, { useState, useEffect, useCallback, useRef } from "react";
import { createRoot } from "react-dom/client";

// --- Icon Components ---
const FolderIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
  </svg>
);

const GithubIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

// --- Settings Menu Component ---
const SettingsMenu = ({ isVisible, onClose, gridCols, setGridCols }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isVisible) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div style={styles.settingsOverlay} onClick={onClose}>
      <div style={styles.settingsModal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.settingsHeader}>
          <h2 style={styles.settingsTitle}>Settings</h2>
          <button style={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        <div style={styles.settingsContent}>
          <div style={styles.settingRow}>
            <label htmlFor="gridCols" style={styles.sliderLabel}>
              Grid Columns: {gridCols}
            </label>
            <input
              id="gridCols"
              type="range"
              min="2"
              max="10"
              value={gridCols}
              onChange={(e) => setGridCols(parseInt(e.target.value, 10))}
              style={styles.slider}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Lazy Loading Image Component ---
const LazyImage = ({
  imageName,
  isSelected,
  onClick,
  onDoubleClick,
  gridCols,
}) => {
  const [imageData, setImageData] = useState(null);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        observer.unobserve(entry.target);
        window.api
          .getThumbnail(imageName)
          .then((base64Data) => {
            const fileExtension = imageName.split(".").pop().toLowerCase();
            const mimeType = `image/${
              fileExtension === "jpg" ? "jpeg" : fileExtension
            }`;
            setImageData(`data:${mimeType};base64,${base64Data}`);
          })
          .catch((err) =>
            console.error(`Failed to load thumbnail for ${imageName}:`, err)
          );
      }
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [imageName]);

  const itemStyle = {
    ...styles.gridItem,
    flexBasis: `calc(${100 / gridCols}% - 1.25rem)`,
    maxWidth: `calc(${100 / gridCols}% - 1.25rem)`,
    ...(isSelected ? styles.gridItemSelected : {}),
    backgroundColor: imageData ? "transparent" : "rgb(17, 24, 39)",
  };

  return (
    <div
      ref={ref}
      id={`wallpaper-${imageName}`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      style={itemStyle}
    >
      {imageData && (
        <img src={imageData} alt={imageName} style={styles.image} />
      )}
      <div style={styles.imageOverlay} />
    </div>
  );
};

// --- Main React App Component ---
const App = () => {
  const [wallpapers, setWallpapers] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentWallpaperName, setCurrentWallpaperName] = useState("");
  const [error, setError] = useState(null);
  const [isSettingsVisible, setSettingsVisible] = useState(false);
  const [gridCols, setGridCols] = useState(4);
  const [version, setVersion] = useState("");

  const appState = useRef({ wallpapers, selectedIndex, gridCols });
  useEffect(() => {
    appState.current = { wallpapers, selectedIndex, gridCols };
  }, [wallpapers, selectedIndex, gridCols]);

  const setMacWallpaper = useCallback((imageName) => {
    if (!imageName) return;
    window.api
      .setWallpaper(imageName)
      .then(() => {
        setCurrentWallpaperName(imageName);
        window.api.hideWindow();
      })
      .catch((err) => console.error("Failed to set wallpaper:", err));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.metaKey && e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setSettingsVisible((prev) => !prev);
        return;
      }

      if (isSettingsVisible) return;

      const { wallpapers, selectedIndex, gridCols } = appState.current;
      e.preventDefault();

      switch (e.key) {
        case "ArrowUp":
          setSelectedIndex((prev) => Math.max(0, prev - gridCols));
          break;
        case "ArrowDown":
          setSelectedIndex((prev) =>
            Math.min(wallpapers.length - 1, prev + gridCols)
          );
          break;
        case "ArrowLeft":
          setSelectedIndex((prev) => Math.max(0, prev - 1));
          break;
        case "ArrowRight":
          setSelectedIndex((prev) => Math.min(wallpapers.length - 1, prev + 1));
          break;
        case "Enter":
          if (wallpapers[selectedIndex]) {
            setMacWallpaper(wallpapers[selectedIndex]);
          }
          break;
        case "Escape":
          window.api.hideWindow();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setMacWallpaper, isSettingsVisible]);

  useEffect(() => {
    if (wallpapers.length > 0 && wallpapers[selectedIndex]) {
      const el = document.getElementById(
        `wallpaper-${wallpapers[selectedIndex]}`
      );
      if (el) {
        el.scrollIntoView({ behavior: "auto", block: "nearest" });
      }
    }
  }, [selectedIndex, wallpapers]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const [wallpaperList, currentPath, appVersion] = await Promise.all([
          window.api.getWallpapers(),
          window.api.getCurrentWallpaper(),
          window.api.getAppVersion(),
        ]);

        setVersion(appVersion);

        if (wallpaperList.length === 0) {
          throw new Error(`No wallpapers found in ~/wallpapers`);
        }
        setWallpapers(wallpaperList);

        const currentName = currentPath.trim().split("/").pop();
        setCurrentWallpaperName(currentName);

        const initialIndex = wallpaperList.findIndex((w) => w === currentName);
        if (initialIndex !== -1) {
          setSelectedIndex(initialIndex);
        }
      } catch (err) {
        console.error("Initialization error:", err);
        setError(err.message);
      }
    };

    initializeApp();
  }, []);

  if (error) {
    return (
      <div style={styles.error}>
        <strong>Widget Error!</strong>
        <br />
        <br />
        {error}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <SettingsMenu
        isVisible={isSettingsVisible}
        onClose={() => setSettingsVisible(false)}
        gridCols={gridCols}
        setGridCols={setGridCols}
      />
      <div style={styles.modalContainer}>
        <div style={styles.modal}>
          <main style={styles.gridContainer}>
            <div style={styles.grid}>
              {wallpapers.map((wallpaper, index) => (
                <LazyImage
                  key={wallpaper}
                  imageName={wallpaper}
                  isSelected={selectedIndex === index}
                  onClick={() => setSelectedIndex(index)}
                  onDoubleClick={() => setMacWallpaper(wallpaper)}
                  gridCols={gridCols}
                />
              ))}
            </div>
          </main>
          <footer style={styles.footer}>
            <div style={styles.footerLeft}>
              {version && <span style={styles.version}>v{version}</span>}
            </div>
            <div style={styles.footerRight}>
              <button
                onClick={() => {
                  window.api.openWallpapersFolder();
                  window.api.hideWindow();
                }}
                style={styles.iconButton}
                title="Open Wallpapers Folder"
              >
                <FolderIcon />
              </button>
              {/* **FIXED**: This now correctly opens the link in the default browser before closing the window */}
              <a
                href="https://github.com/andrinoff/floatplane"
                onClick={(e) => {
                  e.preventDefault();
                  window.api.openExternalLink(
                    "https://github.com/andrinoff/floatplane"
                  );
                  window.api.hideWindow();
                }}
                style={styles.iconButton}
                title="GitHub Repository"
              >
                <GithubIcon />
              </a>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

// --- Styles Object ---
const styles = {
  error: {
    color: "#ff5575",
    backgroundColor: "rgba(20, 0, 5, 0.8)",
    padding: "20px",
    margin: "20px",
    borderRadius: "8px",
    textAlign: "center",
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontFamily: "monospace",
    border: "1px solid #ff5575",
    boxShadow: "0 0 20px rgba(255, 85, 117, 0.5)",
    textShadow: "0 0 5px rgba(255, 85, 117, 0.7)",
  },
  container: {
    position: "fixed",
    inset: 0,
    fontFamily: "'Menlo', 'Consolas', 'Courier New', monospace",
    zIndex: 999,
  },
  modalContainer: {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    backdropFilter: "blur(16px) saturate(180%)",
  },
  modal: {
    width: "100%",
    maxWidth: "56rem",
    height: "20vh",
    backgroundColor: "rgba(10, 15, 25, 0.7)",
    border: "1px solid rgba(0, 246, 255, 0.2)",
    borderRadius: "1rem",
    boxShadow: "0 0 40px rgba(0, 0, 0, 0.5), 0 0 25px rgba(0, 246, 255, 0.2)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  gridContainer: {
    flexGrow: 1,
    padding: "1rem",
    overflowY: "auto",
  },
  grid: {
    display: "flex",
    flexWrap: "nowrap",
    gap: "1.25rem",
    alignItems: "center",
    padding: "0.5rem",
    height: "100%",
    overflowX: "auto",
    scrollbarWidth: "none",
  },
  gridItem: {
    position: "relative",
    aspectRatio: "16 / 9",
    borderRadius: "0.5rem",
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
    transform: "scale(1)",
    border: "2px solid transparent",
    flexShrink: 0,
    boxShadow: "inset 0 0 10px rgba(0,0,0,0.5)",
  },
  gridItemSelected: {
    transform: "scale(1.08)",
    borderColor: "rgb(0, 246, 255)",
    boxShadow:
      "0 0 15px rgba(0, 246, 255, 0.6), 0 0 5px rgba(0, 246, 255, 1), inset 0 0 10px rgba(0, 246, 255, 0.3)",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  imageOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle, rgba(0,0,0,0) 50%, rgba(0,0,0,0.5) 100%)",
    transition: "all 0.3s ease-in-out",
  },
  settingsOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  settingsModal: {
    background: "rgba(10, 15, 25, 0.95)",
    padding: "1.5rem",
    borderRadius: "1rem",
    border: "1px solid rgba(0, 246, 255, 0.3)",
    boxShadow: "0 0 30px rgba(0, 246, 255, 0.3)",
    width: "100%",
    maxWidth: "400px",
    color: "#e2e8f0",
  },
  settingsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(0, 246, 255, 0.2)",
    paddingBottom: "1rem",
    marginBottom: "1rem",
  },
  settingsTitle: {
    margin: 0,
    fontSize: "1.25rem",
    color: "white",
    textShadow: "0 0 5px rgba(0, 246, 255, 0.7)",
  },
  closeButton: {
    background: "transparent",
    border: "none",
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: "1.75rem",
    lineHeight: 1,
    cursor: "pointer",
    transition: "color 0.2s ease",
  },
  settingsContent: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  settingRow: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  sliderLabel: {
    color: "#94a3b8",
    fontSize: "0.875rem",
  },
  slider: {
    width: "100%",
  },
  footer: {
    flexShrink: 0,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.5rem 1.25rem",
    borderTop: "1px solid rgba(0, 246, 255, 0.2)",
    backgroundColor: "rgba(10, 15, 25, 0.5)",
  },
  footerLeft: {
    /* (empty for now) */
  },
  footerRight: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  iconButton: {
    background: "transparent",
    border: "none",
    color: "rgba(255, 255, 255, 0.6)",
    cursor: "pointer",
    padding: "0.25rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    transition: "color 0.2s ease, background-color 0.2s ease",
  },
  version: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: "0.75rem",
    fontVariantNumeric: "tabular-nums",
  },
};

// --- Render the App to the DOM ---
const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
