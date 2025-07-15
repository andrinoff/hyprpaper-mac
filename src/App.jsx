import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api";
import { appWindow } from "@tauri-apps/api/window";
import "./App.css";

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

// --- Lazy Loading Image Component ---
const LazyImage = ({
  imageName,
  isSelected,
  isCurrent,
  onClick,
  onDoubleClick,
}) => {
  const [imageData, setImageData] = useState(null);
  const ref = React.useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        observer.unobserve(entry.target);
        const fileExtension = imageName.split(".").pop().toLowerCase();
        const mimeType = `image/${
          fileExtension === "jpg" ? "jpeg" : fileExtension
        }`;

        invoke("get_wallpaper_base64", { name: imageName })
          .then((base64) => setImageData(`data:${mimeType};base64,${base64}`))
          .catch((err) => console.error(`Failed to load ${imageName}:`, err));
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [imageName]);

  return (
    <div
      ref={ref}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={`grid-item ${isSelected ? "selected" : ""}`}
    >
      {imageData && <img src={imageData} alt={imageName} />}
      <div className="image-overlay" />
      {isCurrent && (
        <div className="check-icon">
          <CheckCircleIcon />
        </div>
      )}
    </div>
  );
};

// --- Main App Component ---
function App() {
  const [wallpapers, setWallpapers] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentWallpaperName, setCurrentWallpaperName] = useState("");
  const [error, setError] = useState(null);

  const setMacWallpaper = useCallback(async (imageName) => {
    try {
      await invoke("set_wallpaper", { name: imageName });
      setCurrentWallpaperName(imageName);
      await appWindow.hide();
    } catch (err) {
      console.error("Failed to set wallpaper:", err);
      setError(String(err));
    }
  }, []);

  useEffect(() => {
    // Fetch initial data when the component mounts
    const loadData = async () => {
      try {
        const [files, currentPath] = await Promise.all([
          invoke("list_wallpapers"),
          invoke("get_current_wallpaper"),
        ]);
        setWallpapers(files);
        setCurrentWallpaperName(currentPath.split("/").pop());
      } catch (err) {
        console.error("Error loading initial data:", err);
        setError(String(err));
      }
    };
    loadData();

    // Listen for the window becoming visible to focus it
    const unlisten = appWindow.onFocusChanged(({ payload: focused }) => {
      if (focused) {
        // This is a good place to re-fetch data if needed
      }
    });

    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      e.preventDefault();
      const gridCols = 4;
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
          appWindow.hide();
          break;
        default:
          break;
      }
    },
    [wallpapers, selectedIndex, setMacWallpaper]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (error) {
    return (
      <div className="error-container">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="modal">
        <header>
          <h1>Select a Wallpaper</h1>
          <p>Use Arrows to Navigate, Enter to Select, Esc to Close</p>
        </header>
        <main className="grid-container">
          <div className="grid">
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
  );
}

export default App;
