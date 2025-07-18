# floatpane

<p align="center">
  <img src="https://raw.githubusercontent.com/floatpane/floatpane/master/assets/icon.svg" alt="floatpane Logo" width="128">
</p>

<h3 align="center">A lightweight, floating wallpaper selector for macOS.</h3>

<p align="center">
  <img src="https://img.shields.io/github/v/release/floatpane/floatpane?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/github/license/floatpane/floatpane?style=for-the-badge" alt="License">
</p>

---

**floatpane** is a minimal utility for macOS that lets you quickly browse and set your desktop wallpaper. It's designed to be invoked with a global keyboard shortcut and floats above all other windows, making it compatible with tiling window managers like **Aerospace** and **yabai**.

## 🎬 Demo

![floatpane Demo](https://raw.githubusercontent.com/floatpane/floatpane/master/assets/floatpane-preview.gif)

## ✨ Features

- **⚡ Summon:** Bring up the wallpaper grid from anywhere with `Cmd+Shift+P`.
- **🖼️ Floating Window:** Floats on top of all other applications for easy access.
- **🧩 Tiling WM Friendly:** Integrates smoothly with Aerospace, yabai, and Amethyst.
- **⌨️ Keyboard Navigation:** Use arrow keys to browse, `Enter` to apply, and `Esc` to dismiss.
- **🚀 Lazy Loading:** Thumbnails load as you scroll for a fast, responsive experience.
- **✅ Current Wallpaper Indicator:** Your active wallpaper is always highlighted.
- **🎨 Themes:** Customize the look and feel with multiple built-in themes.

## 📋 Requirements

- macOS
- [Node.js](https://nodejs.org/) and npm
- A `~/wallpapers` directory containing your images.
- [GitHub CLI](https://cli.github.com/) (only for publishing releases).

## 🚀 Installation

### Homebrew (Recommended)

```bash
brew tap floatpane/floatpane
brew install floatpane
# Fix for macOS Gatekeeper
xattr -cr /Applications/floatpane.app
```

### For Developers

1.  **Clone the repository:**

    ```sh
    git clone https://github.com/floatpane/floatpane.git
    cd floatpane
    ```

2.  **Install dependencies:**

    ```sh
    npm install
    ```

3.  **Run in development mode:**

    You'll need two terminal windows for this.

    - In **Terminal 1**, start the webpack watcher:
      ```sh
      npm run watch
      ```
    - In **Terminal 2**, start the Electron app:
      ```sh
      npm start
      ```

## 🎨 Available Themes

Floatpane includes a variety of themes to match your style. You can change the theme in the settings (`Cmd+,`).

- Aura
- Ayu Dark
- Cobalt2
- Dracula
- Gruvbox Dark
- Material Theme
- Monokai
- Night Owl
- Nord
- One Dark Pro
- Panda Syntax
- Solarized Dark
- Synthwave '84
- Tokyo Night Blue

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
