import React, { useState, useEffect, useCallback, useRef } from "react";
import { createRoot } from "react-dom/client";

// --- SVG Icon Component ---
const CheckCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

// --- Lazy Loading Image Component ---
const LazyImage = ({
  imageName,
  isSelected,
  isCurrent,
  onClick,
  onDoubleClick,
}) => {
  const [imageData, setImageData] = useState(null);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        observer.unobserve(entry.target);
        window.api
          .getImageAsBase64(imageName)
          .then((base64Data) => {
            const fileExtension = imageName.split(".").pop().toLowerCase();
            const mimeType = `image/${
              fileExtension === "jpg" ? "jpeg" : fileExtension
            }`;
            setImageData(`data:${mimeType};base64,${base64Data}`);
          })
          .catch((err) => console.error(`Failed to load ${imageName}:`, err));
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
    ...(isSelected ? styles.gridItemSelected : {}),
    backgroundColor: imageData ? "transparent" : "rgb(51, 65, 85)",
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
      {isCurrent && (
        <div style={styles.checkIcon}>
          <CheckCircleIcon />
        </div>
      )}
    </div>
  );
};

// --- Main React App Component ---
const App = () => {
  const [wallpapers, setWallpapers] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentWallpaperName, setCurrentWallpaperName] = useState("");
  const [backgroundB64, setBackgroundB64] = useState("");
  const [error, setError] = useState(null);

  // Use a ref to store the latest state for the event handler.
  // This prevents the event handler from becoming stale.
  const appState = useRef({ wallpapers, selectedIndex });
  useEffect(() => {
    appState.current = { wallpapers, selectedIndex };
  }, [wallpapers, selectedIndex]);

  // Memoized function to set the macOS wallpaper via IPC
  const setMacWallpaper = useCallback((imageName) => {
    if (!imageName) return;
    window.api
      .setWallpaper(imageName)
      .then((newPath) => {
        setCurrentWallpaperName(imageName);
        // Load the new background
        window.api.getImageAsBase64(newPath).then((base64Data) => {
          const fileExtension = newPath.split(".").pop().toLowerCase();
          const mimeType = `image/${
            fileExtension === "jpg" ? "jpeg" : fileExtension
          }`;
          setBackgroundB64(`data:${mimeType};base64,${base64Data}`);
        });
        window.api.hideWindow();
      })
      .catch((err) => console.error("Failed to set wallpaper:", err));
  }, []);

  // Effect to handle keyboard navigation.
  // This now runs only once and uses the ref to access current state.
  useEffect(() => {
    const handleKeyDown = (e) => {
      const { wallpapers, selectedIndex } = appState.current;
      const gridCols = 4;
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
  }, [setMacWallpaper]); // Dependency on setMacWallpaper is stable due to useCallback

  // Effect to scroll the selected item into view smoothly
  useEffect(() => {
    if (wallpapers.length > 0 && wallpapers[selectedIndex]) {
      const el = document.getElementById(
        `wallpaper-${wallpapers[selectedIndex]}`
      );
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [selectedIndex, wallpapers]);

  // Initialization effect, runs only ONCE on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const [wallpaperList, currentPath] = await Promise.all([
          window.api.getWallpapers(),
          window.api.getCurrentWallpaper(),
        ]);

        if (wallpaperList.length === 0) {
          throw new Error(`No wallpapers found in ~/wallpapers`);
        }
        setWallpapers(wallpaperList);

        const currentName = currentPath.trim().split("/").pop();
        setCurrentWallpaperName(currentName);

        // Load the initial background image
        window.api.getImageAsBase64(currentPath.trim()).then((base64Data) => {
          const fileExtension = currentPath.split(".").pop().toLowerCase();
          const mimeType = `image/${
            fileExtension === "jpg" ? "jpeg" : fileExtension
          }`;
          setBackgroundB64(`data:${mimeType};base64,${base64Data}`);
        });

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
  }, []); // <-- Empty dependency array ensures this runs only once

  const backgroundStyle = {
    ...styles.background,
    backgroundImage: backgroundB64 ? `url(${backgroundB64})` : "none",
  };

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
      <div id="background-div" style={backgroundStyle} />
      <div style={styles.backdrop} />
      <div style={styles.modalContainer}>
        <div style={styles.modal}>
          <header style={styles.header}>
            <h1 style={styles.title}>Select a Wallpaper</h1>
            <p style={styles.subtitle}>
              Use Arrows to Navigate, Enter to Select, Esc to Close
            </p>
          </header>
          <main style={styles.gridContainer}>
            <div style={styles.grid}>
              {wallpapers.map((wallpaper, index) => (
                <LazyImage
                  key={wallpaper}
                  imageName={wallpaper}
                  isSelected={selectedIndex === index}
                  isCurrent={currentWallpaperName === wallpaper}
                  onClick={() => setSelectedIndex(index)}
                  onDoubleClick={() => setMacWallpaper(wallpaper)}
                />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

// --- Styles Object ---
const styles = {
  error: {
    color: "white",
    backgroundColor: "rgba(200, 50, 50, 0.8)",
    padding: "20px",
    margin: "20px",
    borderRadius: "10px",
    textAlign: "center",
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontFamily: "monospace",
    border: "2px solid white",
  },
  container: {
    position: "fixed",
    inset: 0,
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    zIndex: 999,
    borderRadius: "1rem",
    overflow: "hidden",
  },
  background: {
    position: "absolute",
    inset: 0,
    backgroundSize: "cover",
    backgroundPosition: "center",
    transition: "background-image 0.5s ease-in-out",
    transform: "scale(1.1)",
  },
  backdrop: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    backdropFilter: "blur(24px)",
  },
  modalContainer: {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    width: "100%",
    maxWidth: "56rem",
    height: "70vh",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgb(51, 65, 85)",
    borderRadius: "1rem",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    flexShrink: 0,
    padding: "1rem",
    borderBottom: "1px solid rgb(51, 65, 85)",
    textAlign: "center",
  },
  title: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    color: "rgb(226, 232, 240)",
    margin: 0,
  },
  subtitle: {
    fontSize: "0.875rem",
    color: "rgb(148, 163, 184)",
    margin: "0.25rem 0 0 0",
  },
  gridContainer: { flexGrow: 1, padding: "1.5rem", overflowY: "auto" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1.5rem",
  },
  gridItem: {
    position: "relative",
    aspectRatio: "16 / 9",
    borderRadius: "0.5rem",
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
    transform: "scale(1)",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "rgb(51, 65, 85)",
  },
  gridItemSelected: {
    boxShadow: "0 0 0 4px #3b82f6",
    borderColor: "#3b82f6",
    transform: "scale(1.05)",
  },
  image: { width: "100%", height: "100%", objectFit: "cover" },
  imageOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    transition: "all 0.2s ease-in-out",
  },
  checkIcon: {
    position: "absolute",
    top: "0.5rem",
    right: "0.5rem",
    backgroundColor: "#22c55e",
    borderRadius: "9999px",
    padding: "0.25rem",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

// --- Render the App to the DOM ---
const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
