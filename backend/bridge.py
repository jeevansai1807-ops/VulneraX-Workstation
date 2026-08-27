from backend.core.web_audit import run_web_audit
from backend.core.playwright_crawler import crawl_dynamic_target
from backend.core.nmap_recon import run_port_scan
from backend.ai.threat_engine import generate_threat_model

class VulneraXBridge:
    def __init__(self):
        # We can store a reference to the main window here later to push live UI updates
        self.window = None

    def set_window(self, window):
        self.window = window

    def execute_full_scan(self, target_url: str) -> dict:
        """
        The master function called by the React frontend.
        It runs all scanners, aggregates the data, and returns the AI threat report.
        """
        print(f"\n[BRIDGE] Frontend requested full scan for: {target_url}")
        
        try:
            # 1. Run Network Reconnaissance
            print("[BRIDGE] Step 1/3: Running Nmap Port Scan...")
            nmap_results = run_port_scan(target_url, scan_type="fast")
            
            # 2. Run Web & Server Audits
            print("[BRIDGE] Step 2/3: Running Web & Header Audits...")
            web_results = run_web_audit(target_url)
            
            # 3. Run DOM Crawler
            print("[BRIDGE] Step 3/3: Crawling Dynamic DOM Elements...")
            crawl_results = crawl_dynamic_target(target_url)
            
            # 4. Aggregate all raw telemetry
            aggregated_telemetry = {
                "target": target_url,
                "network_layer": nmap_results,
                "http_layer": web_results,
                "application_layer": crawl_results
            }
            
            # 5. Generate AI Threat Model
            print("[BRIDGE] Synthesizing Threat Report with AI Engine...")
            ai_report = generate_threat_model(aggregated_telemetry)
            
            print("[BRIDGE] Scan complete. Returning data to UI.")
            
            # Return payload to Javascript
            return {
                "status": "success",
                "target": target_url,
                "ai_report": ai_report,
                "raw_telemetry": aggregated_telemetry
            }
            
        except Exception as e:
            print(f"[BRIDGE] Fatal error during scan: {str(e)}")
            return {
                "status": "error",
                "error_message": str(e)
            }

if __name__ == "__main__":
    import pprint
    # Test the entire pipeline from top to bottom
    bridge = VulneraXBridge()
    # We will use scanme.nmap.org so it doesn't take too long to crawl
    test_target = "scanme.nmap.org"
    
    print("=== STARTING FULL PIPELINE TEST ===")
    final_output = bridge.execute_full_scan(test_target)
    
    print("\n=== FINAL OUTPUT SENT TO FRONTEND ===")
    pprint.pprint(final_output)
