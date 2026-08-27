import webview
from backend.bridge import VulneraXBridge

def start_desktop_app():
    print("[SYSTEM] Initializing VulneraX Engine...")
    
    # 1. Create an instance of our backend API bridge
    api = VulneraXBridge()
    
    # 2. Configure the desktop window
    # Make sure this URL matches your React dev server (usually localhost:5173 for Vite)
    ui_url = "http://localhost:5173"
    
    print(f"[SYSTEM] Creating PyWebView window targeting {ui_url}...")
    window = webview.create_window(
        title="VulneraX - AI Security Assessment Platform",
        url=ui_url,
        js_api=api,
        width=1400,
        height=900,
        background_color="#0B0F17" # Deep dark anti-gravity theme background
    )
    
    # 3. Give the API class a reference to the window
    api.set_window(window)
    
    # 4. Launch the application (debug=True allows Inspect Element)
    print("[SYSTEM] Launching Application GUI...")
    webview.start(debug=True)

if __name__ == "__main__":
    start_desktop_app()
