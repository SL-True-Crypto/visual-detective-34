# Desktop App Setup Guide

## Package.json Scripts එකට add කරන්න:

```json
{
  "main": "electron/main.js",
  "scripts": {
    "electron": "electron .",
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:8080 && electron .\"",
    "electron:pack": "npm run build && electron-builder --dir",
    "electron:dist": "npm run build && electron-builder",
    "build:electron": "ELECTRON=true npm run build"
  }
}
```

## Commands:

### Development Mode:
```bash
npm run electron:dev
```

### Production Build:
```bash
# Windows .exe සඳහා:
npm run electron:dist

# Portable version සඳහා:
npm run electron:pack
```

## Build කරන Files:
- **Windows**: `.exe` installer සහ portable version
- **Mac**: `.dmg` file
- **Linux**: `.AppImage` සහ `.deb` files

## Features:
✅ Native file system access  
✅ Desktop shortcuts  
✅ Auto-updater ready  
✅ System tray integration ready  
✅ Cross-platform support  

## File Locations:
- Built files: `dist-electron/` folder එකේ
- Executable: `dist-electron/` folder එකේ platform අනුව