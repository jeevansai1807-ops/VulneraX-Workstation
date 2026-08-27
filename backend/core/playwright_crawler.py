from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

def crawl_dynamic_target(target_url: str) -> dict:
    """Uses a headless browser to render JS and extract DOM elements like links and forms."""
    
    if not target_url.startswith("http://") and not target_url.startswith("https://"):
        target_url = f"https://{target_url}"
        
    base_domain = urlparse(target_url).netloc
    discovered_links = set()
    discovered_forms = []
    
    try:
        with sync_playwright() as p:
            # Launch headless browser (Firefox or Chromium)
            browser = p.firefox.launch(headless=True)
            page = browser.new_page()
            
            print(f"[*] Loading {target_url} and waiting for JavaScript to render...")
            # networkidle ensures SPAs and dynamic frameworks finish loading
            page.goto(target_url, wait_until="networkidle", timeout=15000)
            
            # Extract the fully rendered DOM
            html_content = page.content()
            browser.close()
            
            # Parse the DOM with BeautifulSoup
            soup = BeautifulSoup(html_content, "html.parser")
            
            # 1. Extract and normalize all Links
            for a_tag in soup.find_all("a", href=True):
                href = a_tag["href"]
                # Convert relative links (/about) to absolute (https://example.com/about)
                full_url = urljoin(target_url, href)
                
                # Only keep links that belong to the target domain to avoid crawling the whole internet
                if urlparse(full_url).netloc == base_domain:
                    discovered_links.add(full_url)
            
            # 2. Extract Forms and Input fields
            for form in soup.find_all("form"):
                form_details = {
                    "action": form.get("action", "unknown_action"),
                    "method": form.get("method", "get").upper(),
                    "inputs": []
                }
                
                for input_tag in form.find_all(["input", "textarea"]):
                    input_name = input_tag.get("name") or input_tag.get("id") or "unnamed_input"
                    input_type = input_tag.get("type", "text")
                    form_details["inputs"].append({"name": input_name, "type": input_type})
                
                discovered_forms.append(form_details)
                
            return {
                "status": "success",
                "target": target_url,
                "pages_discovered": list(discovered_links),
                "forms_discovered": discovered_forms,
                "total_links": len(discovered_links),
                "total_forms": len(discovered_forms)
            }
            
    except PlaywrightTimeoutError:
        return {"status": "error", "error": "Browser timed out waiting for page to load."}
    except Exception as e:
        return {"status": "error", "error": str(e)}

if __name__ == "__main__":
    import pprint
    # Testing against a site known to have forms and links
    test_target = "https://quotes.toscrape.com/login"
    print(f"[*] Booting headless crawler for: {test_target}...")
    results = crawl_dynamic_target(test_target)
    pprint.pprint(results)
