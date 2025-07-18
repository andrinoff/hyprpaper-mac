# floatpane

<p align="center">
  <img src="assets/icon.svg" alt="floatpane Logo" width="128">
</p>

<h3 align="center">A lightweight, floating wallpaper selector for macOS.</h3>

<p align="center">
  <img src="https://img.shields.io/github/v/release/floatpane/floatpane?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/github/license/floatpane/floatpane?style=for-the-badge" alt="License">
</p>

---

**floatpane** is a minimal utility for macOS that lets you quickly browse and set your desktop wallpaper. It's designed to be invoked with a global keyboard shortcut and floats above all other windows, making it compatible with tiling window managers like **Aerospace** and **yabai**.

## 🎬 Demo

![floatpane Demo](assets/floatpane-preview.gif)

## ✨ Features

- **Summon** Summon the wallpaper grid from anywhere with `Cmd+Shift+P`.
- **Floating Window:** Designed to float on top of all other applications, ensuring it's always accessible.
- **Tiling WM Friendly:** Works seamlessly with **Aerospace**, **yabai**, and **Amethyst**.
- **⌨️ Keyboard Navigation:** Use arrow keys to navigate, `Enter` to select, and `Esc` to close.
- **️ Lazy Loading:** Thumbnails are loaded efficiently as you scroll for a fast, responsive experience.
- **🎨 Themes:** Customize the look and feel of floatpane with a variety of built-in themes.

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
