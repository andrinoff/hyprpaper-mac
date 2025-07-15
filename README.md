# Floatplane

<p align="center">
  <img src="https://raw.githubusercontent.com/andrinoff/floatplane/main/assets/icon.svg" alt="Floatplane Logo" width="128">
</p>

<h3 align="center">A lightweight, floating wallpaper selector for macOS.</h3>

<p align="center">
  <img src="https://img.shields.io/github/v/release/andrinoff/floatplane?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/github/license/andrinoff/floatplane?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/github/actions/workflow/status/andrinoff/floatplane/main.yml?style=for-the-badge" alt="Build Status">
</p>

---

Floatplane is a minimal utility for macOS that lets you quickly browse and set your desktop wallpaper. It's designed to be invoked with a global keyboard shortcut and floats above all other windows, making it compatible with tiling window managers like Aerospace and yabai.

## Demo

![Floatplane Demo](https://raw.githubusercontent.com/andrinoff/floatplane/main/assets/demo.gif)

## Features

- **Global Shortcut:** Summon the wallpaper grid from anywhere with `Cmd+Shift+P`.
- **Floating Window:** Designed to float on top of all other applications.
- **Tiling WM Friendly:** Works seamlessly with Aerospace, yabai, and Amethyst.
- **Keyboard Navigation:** Use arrow keys to navigate, `Enter` to select, and `Esc` to close.
- **Lazy Loading:** Thumbnails are loaded efficiently as you scroll for a fast, responsive experience.
- **Current Wallpaper Indicator:** Your active wallpaper is always marked with a check.

## Requirements

- macOS
- [Node.js](https://nodejs.org/) and npm
- A `~/wallpapers` directory containing your images.
- [GitHub CLI](https://cli.github.com/) (only for publishing releases).

## Installation & Usage (for Developers)

1.  **Clone the repository:**

    ```sh
    git clone [https://github.com/andrinoff/floatplane.git](https://github.com/andrinoff/floatplane.git)
    cd floatplane
    ```

2.  **Install dependencies:**

    ```sh
    npm install
    ```

3.  **Run in development mode:**
    You'll need two terminal windows for development.

    - In Terminal 1, start the webpack watcher to build the React app:
      ```sh
      npm run watch
      ```
    - In Terminal 2, start the Electron app:
      ```sh
      npm start
      ```

## Building & Releasing

A `Makefile` is included to automate the build and release process.

- **Create a local release:**
  This command bundles the app and creates a `.dmg` file in a new `release/` directory.

  ```sh
  make release
  ```

- **Publish to GitHub:**
  This command creates a local release, then creates a new git tag and a GitHub Release with the `.dmg` attached. (Requires `gh` CLI to be authenticated).

  ```sh
  make publish
  ```

- **Clean up build files:**
  Removes `node_modules`, `dist`, and `release` directories.
  ```sh
  make clean
  ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
