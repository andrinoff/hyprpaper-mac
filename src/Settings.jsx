import React, { useState, useEffect } from 'react';




export const Settings = ({ isVisible, onClose, themes, currentTheme, onThemeChange, styles }) => {
    const [settings, setSettings] = useState({ theme: '', openCommand: '' });

    useEffect(() => {
        if (isVisible) {
            window.api.getSettings().then(setSettings);
        }
    }, [isVisible]);

    const handleSave = () => {
        window.api.saveSettings(settings);
        window.api.hideWindow(); // Close the UI fully after saving settings
    };

    const handleThemeChange = (e) => {
        const newThemeName = e.target.value;
        const newTheme = themes.find(t => t.name === newThemeName);
        setSettings({ ...settings, theme: newThemeName });
        onThemeChange(newTheme);
    }

    if (!isVisible) return null;

    return (
        <div style={styles.settingsOverlay} onClick={onClose}>
            <div style={styles.settingsModal} onClick={(e) => e.stopPropagation()}>
                <div style={styles.settingsHeader}>
                    <h2 style={styles.settingsTitle}>Settings</h2>
                    <button style={styles.closeButton} onClick={onClose}>×</button>
                </div>
                <div style={styles.settingsContent}>
                    <div style={styles.settingRow}>
                        <label style={styles.label}>Theme:</label>
                        <select
                            style={styles.select}
                            value={settings.theme}
                            onChange={handleThemeChange}
                        >
                            {themes.map(theme => (
                                <option key={theme.name} value={theme.name}>{theme.name}</option>
                            ))}
                        </select>
                    </div>
                    <div style={styles.settingRow}>
                        <label style={styles.label}>Open Command:</label>
                        <input
                            style={styles.input}
                            type="text"
                            value={settings.openCommand}
                            onChange={(e) => setSettings({ ...settings, openCommand: e.target.value })}
                        />
                    </div>
                    <button style={styles.saveButton} onClick={handleSave}>Save</button>
                </div>
            </div>
        </div>
    );
};


