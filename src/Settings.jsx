import React, { useState, useEffect } from "react";

export const Settings = ({
  isVisible,
  onClose,
  themes,
  currentTheme,
  onThemeChange,
  styles,
}) => {
  // State for form data, initialized from props.
  const [settings, setSettings] = useState({
    theme: currentTheme.name || "",
    openCommand: "",
  });

  // Effect to fetch the latest saved settings when the modal opens.
  useEffect(() => {
    if (isVisible) {
      window.api.getSettings().then((loadedSettings) => {
        // Ensure the component's state is in sync with fetched data
        setSettings(loadedSettings);
        // Ensure the parent's theme is in sync with fetched theme settings
        const loadedTheme = themes.find((t) => t.name === loadedSettings.theme);
        if (loadedTheme) {
          onThemeChange(loadedTheme);
        }
      });
    }
  }, [isVisible, themes, onThemeChange]);

  // Save settings and close the entire application window.
  const handleSave = () => {
    window.api.saveSettings(settings);
    window.api.hideWindow(); // As per original, closes the entire UI.
  };

  // Revert any unsaved changes and close only the settings modal.
  const handleCancel = () => {
    // Revert the live theme preview to what it was when the modal opened.
    onThemeChange(currentTheme);
    onClose(); // Call the parent's close handler.
  };

  // Update state for any input field change.
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: value,
    }));
  };

  // Handle theme selection, updating local state and the live preview.
  const handleThemeChange = (e) => {
    const newThemeName = e.target.value;
    const newTheme = themes.find((t) => t.name === newThemeName);

    setSettings({ ...settings, theme: newThemeName });

    if (newTheme) {
      onThemeChange(newTheme); // Update live preview.
    }
  };

  // Render nothing if not visible.
  if (!isVisible) return null;

  return (
    // The overlay that covers the page. Clicking it cancels any changes.
    <div style={styles.settingsOverlay} onClick={handleCancel}>
      {/* The modal dialog. Clicks inside are stopped from closing the modal. */}
      <div
        style={styles.settingsModal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <header style={styles.settingsHeader}>
          <h2 id="settings-title" style={styles.settingsTitle}>
            Settings
          </h2>
          <button
            style={styles.closeButton}
            onClick={handleCancel}
            aria-label="Close settings"
          >
            ×
          </button>
        </header>

        <main style={styles.settingsContent}>
          {/* Theme Selector */}
          <div style={styles.settingRow}>
            <label htmlFor="theme-select" style={styles.label}>
              Theme:
            </label>
            <select
              id="theme-select"
              style={styles.select}
              value={settings.theme}
              onChange={handleThemeChange}
            >
              {themes.map((theme) => (
                <option key={theme.name} value={theme.name}>
                  {theme.name}
                </option>
              ))}
            </select>
          </div>

          {/* Open Command Input */}
          <div style={styles.settingRow}>
            <label htmlFor="open-command-input" style={styles.label}>
              Open Command:
            </label>
            <input
              id="open-command-input"
              style={styles.input}
              type="text"
              name="openCommand" // Name attribute for the handler
              value={settings.openCommand}
              onChange={handleInputChange}
            />
          </div>
        </main>

        {/* Action buttons footer */}
        <footer style={styles.settingsFooter}>
          <button style={styles.cancelButton} onClick={handleCancel}>
            Cancel
          </button>
          <button style={styles.saveButton} onClick={handleSave}>
            Save & Close
          </button>
        </footer>
      </div>
    </div>
  );
};
