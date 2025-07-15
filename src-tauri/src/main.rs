// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::process::Command;
use home::home_dir;

// A Command to get the user's home directory
#[tauri::command]
fn get_home_dir() -> Result<String, String> {
    match home_dir() {
        Some(path) => Ok(path.to_string_lossy().to_string()),
        None => Err("Could not determine home directory.".into()),
    }
}

// A Command to list all valid wallpaper files
#[tauri::command]
fn list_wallpapers() -> Result<Vec<String>, String> {
    let home = home_dir().ok_or("Could not find home directory")?;
    let wallpaper_dir = home.join("wallpapers");

    if !wallpaper_dir.exists() {
        return Err(format!("Wallpaper directory not found at: {:?}", wallpaper_dir));
    }

    let mut wallpapers = Vec::new();
    for entry in fs::read_dir(wallpaper_dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if let Some(ext) = path.extension().and_then(|s| s.to_str()) {
            match ext.to_lowercase().as_str() {
                "jpg" | "jpeg" | "png" | "heic" | "webp" => {
                    if let Some(file_name) = path.file_name().and_then(|s| s.to_str()) {
                        wallpapers.push(file_name.to_string());
                    }
                }
                _ => {} // Ignore other files
            }
        }
    }
    Ok(wallpapers)
}

// A Command to read a file and return its Base64 representation
#[tauri::command]
fn get_wallpaper_base64(name: String) -> Result<String, String> {
    let home = home_dir().ok_or("Could not find home directory")?;
    let path = home.join("wallpapers").join(name);
    let data = fs::read(&path).map_err(|e| e.to_string())?;
    Ok(base64::encode(&data))
}

// A Command to get the current wallpaper path
#[tauri::command]
fn get_current_wallpaper() -> Result<String, String> {
    let output = Command::new("osascript")
        .arg("-e")
        .arg("tell application \"System Events\" to tell every desktop to get picture")
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
}

// A Command to set the desktop wallpaper
#[tauri::command]
fn set_wallpaper(name: String) -> Result<(), String> {
    let home = home_dir().ok_or("Could not find home directory")?;
    let full_path = home.join("wallpapers").join(name);
    let script = format!(
        "tell application \"System Events\" to tell every desktop to set picture to (POSIX file \"{}\")",
        full_path.to_string_lossy()
    );

    let output = Command::new("osascript")
        .arg("-e")
        .arg(&script)
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }
    
    Ok(())
}


fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_home_dir,
            list_wallpapers,
            get_wallpaper_base64,
            get_current_wallpaper,
            set_wallpaper
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}