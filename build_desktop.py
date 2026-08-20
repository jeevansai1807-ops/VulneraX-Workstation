"""
VulneraX Desktop Build Script
==============================
Builds the VulneraX desktop application into a standalone distributable
using PyInstaller.

Usage:
    python build_desktop.py          # Build frontend + package with PyInstaller
    python build_desktop.py --skip-frontend   # Skip npm build, just run PyInstaller
    python build_desktop.py --onefile         # Build as a single .exe file

Prerequisites:
    - Node.js and npm (for frontend build)
    - Python venv with requirements_desktop.txt installed
    - PyInstaller: pip install pyinstaller
"""

import os
import sys
import shutil
import subprocess
import argparse


PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(PROJECT_ROOT, "frontend")
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")
DIST_DIR = os.path.join(PROJECT_ROOT, "dist")


def run(cmd, cwd=None, check=True):
    """Run a shell command and stream output."""
    print(f"\n{'='*60}")
    print(f"  Running: {cmd}")
    print(f"  CWD:     {cwd or os.getcwd()}")
    print(f"{'='*60}\n")
    result = subprocess.run(cmd, shell=True, cwd=cwd)
    if check and result.returncode != 0:
        print(f"\n[ERROR] Command failed with exit code {result.returncode}")
        sys.exit(1)
    return result


def build_frontend():
    """Build the React frontend with Vite."""
    print("\n[+] Building frontend...")
    
    # Check for node_modules
    if not os.path.isdir(os.path.join(FRONTEND_DIR, "node_modules")):
        print("  Installing npm dependencies...")
        run("npm install", cwd=FRONTEND_DIR)
    
    run("npm run build", cwd=FRONTEND_DIR)
    
    dist_index = os.path.join(FRONTEND_DIR, "dist", "index.html")
    if os.path.isfile(dist_index):
        print("  [OK] Frontend built successfully.")
    else:
        print("  [ERROR] Frontend build failed — index.html not found.")
        sys.exit(1)


def build_pyinstaller(onefile=False):
    """Package the desktop app with PyInstaller."""
    print("\n[+] Packaging with PyInstaller...")
    
    # Check PyInstaller is available
    try:
        import PyInstaller
        print(f"  PyInstaller version: {PyInstaller.__version__}")
    except ImportError:
        print("  [ERROR] PyInstaller not installed. Run: pip install pyinstaller")
        sys.exit(1)
    
    # Build the PyInstaller command
    spec_file = os.path.join(PROJECT_ROOT, "vulnerax.spec")
    
    if os.path.isfile(spec_file):
        # Use existing spec file
        cmd = f'"{sys.executable}" -m PyInstaller "{spec_file}" --noconfirm'
    else:
        # Generate from scratch
        cmd_parts = [
            f'"{sys.executable}"',
            "-m",
            "PyInstaller",
            f'"{os.path.join(PROJECT_ROOT, "main_desktop.py")}"',
            '--name "VulneraX"',
            "--noconfirm",
            "--windowed",  # No console window
            f'--add-data "{os.path.join(FRONTEND_DIR, "dist")}{os.pathsep}frontend/dist"',
            f'--add-data "{BACKEND_DIR}{os.pathsep}backend"',
            f'--add-data "{os.path.join(PROJECT_ROOT, "reports")}{os.pathsep}reports"',
            # Hidden imports that PyInstaller may miss
            "--hidden-import=uvicorn.logging",
            "--hidden-import=uvicorn.loops",
            "--hidden-import=uvicorn.loops.auto",
            "--hidden-import=uvicorn.protocols",
            "--hidden-import=uvicorn.protocols.http",
            "--hidden-import=uvicorn.protocols.http.auto",
            "--hidden-import=uvicorn.protocols.websockets",
            "--hidden-import=uvicorn.protocols.websockets.auto",
            "--hidden-import=uvicorn.lifespan",
            "--hidden-import=uvicorn.lifespan.on",
            "--hidden-import=aiosqlite",
            "--hidden-import=sqlalchemy.dialects.sqlite",
            "--hidden-import=engineio.async_drivers.aiohttp",
            "--hidden-import=webview",
            f'--distpath "{DIST_DIR}"',
            f'--workpath "{os.path.join(PROJECT_ROOT, "build", "pyinstaller")}"',
            f'--specpath "{PROJECT_ROOT}"',
        ]
        
        if onefile:
            cmd_parts.append("--onefile")
        else:
            cmd_parts.append("--onedir")
        
        # Add icon if it exists
        icon_path = os.path.join(FRONTEND_DIR, "public", "favicon.svg")
        if os.path.isfile(icon_path):
            # SVG can't be used as ico directly; skip if no .ico available
            ico_path = os.path.join(PROJECT_ROOT, "assets", "vulnerax.ico")
            if os.path.isfile(ico_path):
                cmd_parts.append(f'--icon "{ico_path}"')
        
        cmd = " ".join(cmd_parts)
    
    run(cmd, cwd=PROJECT_ROOT)
    print("  [OK] PyInstaller build complete.")
    print(f"  [+] Output: {DIST_DIR}")


def main():
    parser = argparse.ArgumentParser(description="Build VulneraX Desktop Application")
    parser.add_argument(
        "--skip-frontend",
        action="store_true",
        help="Skip the frontend npm build step",
    )
    parser.add_argument(
        "--onefile",
        action="store_true",
        help="Build as a single .exe file (slower startup, easier distribution)",
    )
    parser.add_argument(
        "--no-package",
        action="store_true",
        help="Only build the frontend, don't run PyInstaller",
    )
    args = parser.parse_args()

    print("=" * 60)
    print("      VulneraX Desktop Build System           ")
    print("=" * 60)

    # Step 1: Build frontend
    if not args.skip_frontend:
        build_frontend()
    else:
        print("\n>> Skipping frontend build.")
        if not os.path.isfile(os.path.join(FRONTEND_DIR, "dist", "index.html")):
            print("  ! Warning: frontend/dist/index.html not found!")

    # Step 2: Package with PyInstaller
    if not args.no_package:
        build_pyinstaller(onefile=args.onefile)
    else:
        print("\n>> Skipping PyInstaller packaging.")

    print("\n" + "="*60)
    print("  [OK] Build complete!")
    if not args.no_package:
        print(f"  [+] Distributable: {DIST_DIR}/VulneraX/")
        print(f"  [+] Run: {DIST_DIR}/VulneraX/VulneraX.exe")
    print("="*60)


if __name__ == "__main__":
    main()
