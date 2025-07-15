import { React, run } from "uebersicht";

// --- Configuration ---
const WALLPAPERS_PATH = "~/wallpapers";

// --- SVG Icons ---
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

// --- Übersicht Widget Configuration ---
export const command = `ls -1 ${WALLPAPERS_PATH}`;
export const refreshFrequency = false;

// --- Main Widget Component ---
export const render = ({ output, error }) => {
  if (error) {
    return (
      <div style={styles.error}>
        <strong>Widget Error!</strong>
        <br />
        <br />
        Could not read wallpapers from: {WALLPAPERS_PATH}.<br />
        Please make sure this folder exists and isn't empty.
        <br />
        <br />
        Details: {String(error)}
      </div>
    );
  }
  return <App initialWallpapers={output} />;
};

// --- New Component for Lazy Loading Images ---
const LazyImage = ({
  imageName,
  homeDir,
  isSelected,
  isCurrent,
  onClick,
  onDoubleClick,
}) => {
  const [imageData, setImageData] = React.useState(null);
  const ref = React.useRef();

  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        observer.unobserve(entry.target);
        const imagePath = `${homeDir}/wallpapers/${imageName}`;
        const fileExtension = imageName.split(".").pop().toLowerCase();
        const mimeType = `image/${
          fileExtension === "jpg" ? "jpeg" : fileExtension
        }`;

        // FIXED: Added the -i flag for the base64 command
        run(`base64 -i "${imagePath}"`)
          .then((base64Data) => {
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
  }, [imageName, homeDir]);

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

// --- React App Component ---
const App = ({ initialWallpapers }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [wallpapers, setWallpapers] = React.useState([]);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [currentWallpaperName, setCurrentWallpaperName] = React.useState("");
  const [homeDir, setHomeDir] = React.useState("");
  const [backgroundB64, setBackgroundB64] = React.useState("");

  const loadBackground = React.useCallback((posixPath) => {
    const fileExtension = posixPath.split(".").pop().toLowerCase();
    const mimeType = `image/${
      fileExtension === "jpg" ? "jpeg" : fileExtension
    }`;
    // FIXED: Added the -i flag for the base64 command
    run(`base64 -i "${posixPath}"`)
      .then((base64Data) => {
        setBackgroundB64(`data:${mimeType};base64,${base64Data}`);
      })
      .catch(console.error);
  }, []);

  const setMacWallpaper = React.useCallback(
    (imageName) => {
      if (!homeDir) return;
      const fullImagePath = `${homeDir}/wallpapers/${imageName}`;
      const script = `osascript -e 'tell application "System Events" to tell every desktop to set picture to (POSIX file "${fullImagePath}")'`;

      run(script)
        .then(() => {
          setCurrentWallpaperName(imageName);
          loadBackground(fullImagePath);
          setIsOpen(false);
        })
        .catch((err) => console.error("Failed to set wallpaper:", err));
    },
    [homeDir, loadBackground]
  );

  const handleToggleClick = React.useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }, []);

  const handleKeyDown = React.useCallback(
    (e) => {
      if (e.metaKey && e.altKey && e.key === "p") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }
      if (!isOpen) return;

      const gridCols = 4;
      e.preventDefault();
      switch (e.key) {
        case "ArrowUp":
          setSelectedIndex((prev) => {
            const newIndex = Math.max(0, prev - gridCols);
            const el = document.getElementById(
              `wallpaper-${wallpapers[newIndex]}`
            );
            if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
            return newIndex;
          });
          break;
        case "ArrowDown":
          setSelectedIndex((prev) => {
            const newIndex = Math.min(wallpapers.length - 1, prev + gridCols);
            const el = document.getElementById(
              `wallpaper-${wallpapers[newIndex]}`
            );
            if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
            return newIndex;
          });
          break;
        case "ArrowLeft":
          setSelectedIndex((prev) => {
            const newIndex = Math.max(0, prev - 1);
            const el = document.getElementById(
              `wallpaper-${wallpapers[newIndex]}`
            );
            if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
            return newIndex;
          });
          break;
        case "ArrowRight":
          setSelectedIndex((prev) => {
            const newIndex = Math.min(wallpapers.length - 1, prev + 1);
            const el = document.getElementById(
              `wallpaper-${wallpapers[newIndex]}`
            );
            if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
            return newIndex;
          });
          break;
        case "Enter":
          if (wallpapers[selectedIndex]) {
            setMacWallpaper(wallpapers[selectedIndex]);
          }
          break;
        case "Escape":
          setIsOpen(false);
          break;
        default:
          break;
      }
    },
    [isOpen, wallpapers, selectedIndex, setMacWallpaper]
  );

  React.useEffect(() => {
    const wallpaperList = initialWallpapers
      .split("\n")
      .filter((file) => file && /\.(jpg|jpeg|png|heic|webp)$/i.test(file));
    setWallpapers(wallpaperList);

    run("echo $HOME").then((result) => setHomeDir(result.trim()));

    run(
      `osascript -e 'tell application "System Events" to tell every desktop to get picture'`
    ).then((path) => {
      const cleanPath = path.trim();
      setCurrentWallpaperName(cleanPath.split("/").pop());
      loadBackground(cleanPath);
    });
  }, [initialWallpapers, loadBackground]);

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const backgroundStyle = {
    ...styles.background,
    backgroundImage: backgroundB64 ? `url(${backgroundB64})` : "none",
  };

  return (
    <>
      <div
        onClick={handleToggleClick}
        style={styles.toggleButton}
        title="Open Wallpaper Selector (Cmd+Option+P)"
      >
        🖼️
      </div>
      {isOpen && (
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
                      homeDir={homeDir}
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
      )}
    </>
  );
};

// --- Styles ---
export const className = `bottom: 0; left: 0; right: 0; top: 0; font-family: 'Inter', sans-serif;`;
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
  },
  background: {
    position: "absolute",
    inset: 0,
    backgroundSize: "cover",
    backgroundPosition: "center",
    transition: "all 1s ease-in-out",
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
    backdropFilter: "blur(16px)",
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
  },
  toggleButton: {
    position: "fixed",
    top: "10px",
    right: "10px",
    width: "40px",
    height: "40px",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "20px",
    zIndex: 1000,
    transition: "all 0.2s ease-in-out",
  },
};
