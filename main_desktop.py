"""
VulneraX Desktop Application
=============================
Launches VulneraX as a native desktop application using PyWebView.

The FastAPI backend runs in-process on 127.0.0.1:8000, serving both the API
and the pre-built React SPA. PyWebView opens a native OS window pointing
to the local server.

Usage:
    python main_desktop.py
"""

import os
import sys
import time
import signal
import threading
import subprocess
import shutil
import logging
import ctypes

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="[VulneraX] %(levelname)s: %(message)s"
)
logger = logging.getLogger("vulnerax-desktop")

# ---------------------------------------------------------------------------
# Path resolution
# ---------------------------------------------------------------------------
# When running from source: PROJECT_ROOT is the directory containing this file
# When running from PyInstaller bundle: use sys._MEIPASS for bundled resources
if getattr(sys, "frozen", False):
    BUNDLE_DIR = sys._MEIPASS
    PROJECT_ROOT = os.path.dirname(sys.executable)
else:
    PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
    BUNDLE_DIR = PROJECT_ROOT

BACKEND_DIR = os.path.join(BUNDLE_DIR, "backend")
FRONTEND_DIST = os.path.join(BUNDLE_DIR, "frontend", "dist")

# ---------------------------------------------------------------------------
# Environment setup
# ---------------------------------------------------------------------------
os.environ["VULNERAX_DESKTOP"] = "1"

# Add backend to Python path so its imports resolve correctly
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# Force PyInstaller to bundle backend dependencies
try:
    import main
    import fastapi
except ImportError:
    pass


# ---------------------------------------------------------------------------
# Startup checks
# ---------------------------------------------------------------------------
def check_nmap():
    """Check if Nmap is available in PATH."""
    if shutil.which("nmap"):
        logger.info("Nmap found in PATH.")
        return True
    else:
        logger.warning(
            "Nmap not found in PATH. Port scanning will be unavailable. "
            "Install Nmap from https://nmap.org/download and add it to PATH."
        )
        return False


def check_frontend_build():
    """Verify the frontend dist exists."""
    index_path = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.isfile(index_path):
        logger.info(f"Frontend build found at: {FRONTEND_DIST}")
        return True
    else:
        logger.error(
            f"Frontend build not found at: {FRONTEND_DIST}\n"
            "Run 'cd frontend && npm run build' first."
        )
        return False


# ---------------------------------------------------------------------------
# Uvicorn server management
# ---------------------------------------------------------------------------
SERVER_HOST = "127.0.0.1"
SERVER_PORT = 8000
_uvicorn_server = None


def start_uvicorn():
    """Start the FastAPI/Uvicorn server in a background thread."""
    global _uvicorn_server
    import uvicorn

    # In windowed mode (console=False), sys.stdout and sys.stderr are None.
    # Uvicorn's logger tries to call .isatty() on them and crashes.
    if sys.stdout is None:
        class DummyStream:
            def write(self, _): pass
            def flush(self): pass
            def isatty(self): return False
        sys.stdout = DummyStream()
        sys.stderr = DummyStream()

    config = uvicorn.Config(
        "main:app",
        host=SERVER_HOST,
        port=SERVER_PORT,
        log_level="info",
        # Disable reload in desktop mode
        reload=False,
        # Allow graceful shutdown
        timeout_keep_alive=5,
        # Prevent colored logging which causes isatty() issues without a console
        use_colors=False,
    )
    _uvicorn_server = uvicorn.Server(config)

    thread = threading.Thread(target=_uvicorn_server.run, daemon=True)
    thread.start()
    logger.info(f"Uvicorn server starting on http://{SERVER_HOST}:{SERVER_PORT}")
    return thread


def wait_for_server(timeout=15):
    """Poll the server until it responds or timeout."""
    import urllib.request
    import urllib.error

    url = f"http://{SERVER_HOST}:{SERVER_PORT}/"
    start = time.time()
    while time.time() - start < timeout:
        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=2) as resp:
                if resp.status == 200:
                    logger.info("Server is ready.")
                    return True
        except (urllib.error.URLError, ConnectionError, OSError):
            pass
        time.sleep(0.3)
    logger.error(f"Server did not start within {timeout}s.")
    return False


def stop_uvicorn():
    """Signal Uvicorn to shut down gracefully."""
    global _uvicorn_server
    if _uvicorn_server:
        logger.info("Shutting down Uvicorn server...")
        _uvicorn_server.should_exit = True


# ---------------------------------------------------------------------------
# PyWebView JS ↔ Python bridge
# ---------------------------------------------------------------------------
class DesktopAPI:
    """
    Exposed to JavaScript via `window.pywebview.api`.
    Provides desktop-native capabilities to the React frontend.
    """

    def __init__(self, window_ref):
        self._window = window_ref

    def get_app_info(self):
        """Return application metadata."""
        import platform
        return {
            "app_name": "VulneraX",
            "version": "1.0.0",
            "platform": platform.system(),
            "platform_version": platform.version(),
            "python_version": platform.python_version(),
            "nmap_available": shutil.which("nmap") is not None,
        }

    def save_file_dialog(self, filename="report", file_types="All files (*.*)"):
        """
        Open a native 'Save As' dialog and return the selected path.
        Returns None if the user cancels.
        """
        if self._window:
            result = self._window.create_file_dialog(
                dialog_type=2,  # SAVE_DIALOG
                save_filename=filename,
                file_types=(file_types,),
            )
            return result if result else None
        return None

    def open_file_dialog(self, file_types="All files (*.*)"):
        """
        Open a native 'Open File' dialog and return the selected path.
        Returns None if the user cancels.
        """
        if self._window:
            result = self._window.create_file_dialog(
                dialog_type=0,  # OPEN_DIALOG
                file_types=(file_types,),
            )
            return result[0] if result else None
        return None

    def open_folder_dialog(self):
        """Open a native folder picker and return the selected path."""
        if self._window:
            result = self._window.create_file_dialog(
                dialog_type=3,  # FOLDER_DIALOG
            )
            return result[0] if result else None
        return None

    def minimize_window(self):
        """Minimize the application window."""
        if self._window:
            self._window.minimize()

    def toggle_fullscreen(self):
        """Toggle fullscreen mode."""
        if self._window:
            self._window.toggle_fullscreen()

    def quit_app(self):
        """Quit the desktop application."""
        stop_uvicorn()
        if self._window:
            self._window.destroy()

    def get_desktop_mode(self):
        """Return True — lets frontend detect it's running in desktop mode."""
        return True


# ---------------------------------------------------------------------------
# Window lifecycle
# ---------------------------------------------------------------------------
_webview_window = None


def on_window_closed():
    """Callback when the PyWebView window is closed."""
    logger.info("Window closed. Shutting down...")
    stop_uvicorn()


def on_window_loaded():
    """Callback when the webview DOM is ready."""
    logger.info("Window loaded successfully.")


# ---------------------------------------------------------------------------
# Single Instance Lock
# ---------------------------------------------------------------------------
def acquire_single_instance_mutex():
    """Ensure only one instance of VulneraX runs on Windows."""
    ERROR_ALREADY_EXISTS = 183
    mutex_name = "VulneraX_Global_SingleInstance_Mutex"
    
    # Create the named mutex
    mutex = ctypes.windll.kernel32.CreateMutexW(None, False, mutex_name)
    last_error = ctypes.windll.kernel32.GetLastError()
    
    # If the mutex already existed, another instance is running
    if last_error == ERROR_ALREADY_EXISTS:
        return None
        
    return mutex


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------
def main():
    global _webview_window

    logger.info("=" * 50)
    logger.info("  VulneraX Desktop Application")
    logger.info("=" * 50)

    # Prevent multiple instances
    _mutex = acquire_single_instance_mutex()
    if not _mutex:
        logger.error("Another instance of VulneraX is already running. Exiting.")
        sys.exit(0)

    # Pre-flight checks
    check_nmap()
    if not check_frontend_build():
        logger.error("Cannot start without frontend build. Exiting.")
        sys.exit(1)

    # Change working directory to backend/ so that backend module imports work
    original_cwd = os.getcwd()
    os.chdir(BACKEND_DIR)

    # Start the embedded Uvicorn server
    server_thread = start_uvicorn()

    # Wait for server to become responsive
    if not wait_for_server(timeout=20):
        logger.error("Backend server failed to start. Exiting.")
        sys.exit(1)

    # Import webview after server is confirmed running
    import webview

    # Create the desktop window
    _webview_window = webview.create_window(
        title="VulneraX",
        url=f"http://{SERVER_HOST}:{SERVER_PORT}/",
        width=1400,
        height=900,
        min_size=(1024, 700),
        resizable=True,
        text_select=True,
        zoomable=True,
    )

    # Attach the Python ↔ JS bridge
    api = DesktopAPI(_webview_window)
    _webview_window.expose(api.get_app_info)
    _webview_window.expose(api.save_file_dialog)
    _webview_window.expose(api.open_file_dialog)
    _webview_window.expose(api.open_folder_dialog)
    _webview_window.expose(api.minimize_window)
    _webview_window.expose(api.toggle_fullscreen)
    _webview_window.expose(api.quit_app)
    _webview_window.expose(api.get_desktop_mode)

    # Register lifecycle events
    _webview_window.events.closed += on_window_closed
    _webview_window.events.loaded += on_window_loaded

    # Start the webview event loop (blocks until window is closed)
    logger.info("Opening VulneraX desktop window...")
    webview.start(
        debug=os.getenv("VULNERAX_DEBUG", "0") == "1",
    )

    # Cleanup
    stop_uvicorn()
    os.chdir(original_cwd)
    logger.info("VulneraX Desktop has exited.")


if __name__ == "__main__":
    main()
