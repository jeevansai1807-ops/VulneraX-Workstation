import asyncio
from playwright.async_api import async_playwright
from urllib.parse import urlparse

async def crawl_spa(target_url: str, headers: dict = None, cookies: dict = None) -> dict:
    discovered_endpoints = set()
    discovered_urls = set()
    
    async with async_playwright() as p:
        try:
            browser = await p.chromium.launch(headless=True)
            
            # Setup context with any provided headers/cookies
            context_options = {"ignore_https_errors": True}
            if headers:
                context_options["extra_http_headers"] = headers
                
            context = await browser.new_context(**context_options)
            
            if cookies:
                # Convert dict cookies to playwright format
                parsed = urlparse(target_url)
                domain = parsed.netloc
                playwright_cookies = [
                    {"name": k, "value": v, "domain": domain, "path": "/"}
                    for k, v in cookies.items()
                ]
                await context.add_cookies(playwright_cookies)
                
            page = await context.new_page()

            # Event listener: Intercept every network request the page makes
            def handle_request(request):
                # Ignore common static assets
                skip_exts = ('.jpg', '.jpeg', '.png', '.gif', '.svg', '.css', 
                             '.pdf', '.zip', '.tar', '.gz', '.mp4', '.mp3', '.ico', '.woff', '.woff2', '.ttf')
                
                url = request.url.lower()
                if not any(url.endswith(ext) for ext in skip_exts):
                    # If it's a fetch/xhr or document request, save it
                    if request.resource_type in ["fetch", "xhr", "document", "script"]:
                        discovered_endpoints.add(request.url)
                        if request.resource_type == "document" or "?" in request.url:
                            discovered_urls.add(request.url)

            page.on("request", handle_request)

            try:
                # Wait until the network is mostly idle, ensuring React/Angular has loaded
                await page.goto(target_url, wait_until="networkidle", timeout=15000)
                
                # Try to interact with the page to trigger more requests
                # E.g., click random buttons or links
                try:
                    await page.evaluate('''() => {
                        const buttons = document.querySelectorAll('button, a');
                        if(buttons.length > 0) {
                            // Don't actually navigate away
                            for(let i=0; i < Math.min(5, buttons.length); i++) {
                                if(buttons[i].tagName === 'BUTTON') {
                                    buttons[i].click();
                                }
                            }
                        }
                    }''')
                    await asyncio.sleep(2) # wait for resulting requests
                except Exception:
                    pass
                
            except Exception as e:
                print(f"Crawling error during page navigation: {e}")
            finally:
                await browser.close()
                
        except Exception as e:
            print(f"Playwright setup error: {e}")
            
    # Also attempt standard HTML crawling to find forms
    forms = []
    try:
        from scanner.crawler import crawl as standard_crawl
        standard_results = await standard_crawl(target_url, max_depth=1, headers=headers, cookies=cookies)
        forms = standard_results.get("forms", [])
    except Exception:
        pass
            
    params = [url for url in discovered_endpoints if "?" in url]
            
    return {
        "urls": list(discovered_urls.union(discovered_endpoints)),
        "forms": forms,
        "params": params
    }
