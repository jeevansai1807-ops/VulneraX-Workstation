import ssl
import socket
import datetime
from urllib.parse import urlparse
import requests

# Critical defensive HTTP response headers to audit
SECURITY_HEADERS = {
    "Strict-Transport-Security": {
        "severity": "High",
        "description": "Enforces HTTPS connections and protects against MITM downgrade attacks."
    },
    "Content-Security-Policy": {
        "severity": "High",
        "description": "Restricts resources the browser is allowed to load, mitigating XSS and data injection."
    },
    "X-Frame-Options": {
        "severity": "Medium",
        "description": "Prevents clickjacking by controlling whether the site can be framed."
    },
    "X-Content-Type-Options": {
        "severity": "Low",
        "description": "Prevents MIME-sniffing vulnerabilities by enforcing declared content types."
    },
    "Referrer-Policy": {
        "severity": "Low",
        "description": "Controls how much referrer information is included with requests."
    },
    "Permissions-Policy": {
        "severity": "Low",
        "description": "Controls browser features and APIs (camera, microphone, geolocation)."
    }
}


def audit_security_headers(target_url: str) -> dict:
    """Inspects HTTP response headers for missing defensive flags and information disclosure."""
    findings = []
    headers_present = {}

    try:
        response = requests.get(target_url, timeout=10, allow_redirects=True, verify=True)
        resp_headers = response.headers

        # Check for missing defensive headers
        for header, meta in SECURITY_HEADERS.items():
            if header in resp_headers:
                headers_present[header] = resp_headers[header]
            else:
                findings.append({
                    "type": "Missing Header",
                    "item": header,
                    "severity": meta["severity"],
                    "description": meta["description"]
                })

        # Check for server information disclosure
        disclosure_headers = ["Server", "X-Powered-By", "X-AspNet-Version"]
        for header in disclosure_headers:
            if header in resp_headers:
                findings.append({
                    "type": "Information Disclosure",
                    "item": f"{header}: {resp_headers[header]}",
                    "severity": "Low",
                    "description": "Reveals underlying backend technology stack details."
                })

        return {
            "status": "success",
            "url": response.url,
            "status_code": response.status_code,
            "headers_present": headers_present,
            "vulnerabilities": findings
        }

    except requests.RequestException as e:
        return {"status": "error", "error": str(e), "vulnerabilities": []}


def audit_cookies(target_url: str) -> list[dict]:
    """Audits session and tracking cookies for Secure, HttpOnly, and SameSite flags."""
    findings = []
    try:
        response = requests.get(target_url, timeout=10, verify=True)
        for cookie in response.cookies:
            cookie_issues = []
            if not cookie.secure:
                cookie_issues.append("Missing 'Secure' flag (transmitted in plaintext over HTTP)")
            if not cookie.has_nonstandard_attr('HttpOnly') and not cookie._rest.get('HttpOnly'):
                cookie_issues.append("Missing 'HttpOnly' flag (accessible via client-side JavaScript)")
            
            samesite = cookie._rest.get('SameSite', None)
            if not samesite:
                cookie_issues.append("Missing 'SameSite' attribute (susceptible to CSRF)")

            if cookie_issues:
                findings.append({
                    "cookie_name": cookie.name,
                    "domain": cookie.domain,
                    "issues": cookie_issues,
                    "severity": "Medium"
                })
        return findings
    except Exception as e:
        return [{"error": str(e)}]


def audit_ssl_certificate(hostname: str, port: int = 443) -> dict:
    """Extracts and verifies the target host's SSL/TLS certificate metadata and expiration."""
    if "://" in hostname:
        hostname = urlparse(hostname).netloc.split(":")[0]

    context = ssl.create_default_context()
    try:
        with socket.create_connection((hostname, port), timeout=8) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
                
                expire_date_str = cert['notAfter']
                expire_date = datetime.datetime.strptime(expire_date_str, "%b %d %H:%M:%S %Y %Z")
                days_left = (expire_date - datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)).days

                return {
                    "status": "valid",
                    "subject": dict(x[0] for x in cert['subject']),
                    "issuer": dict(x[0] for x in cert['issuer']),
                    "version": ssock.version(),
                    "expires_on": expire_date.strftime("%Y-%m-%d"),
                    "days_remaining": days_left,
                    "is_expired": days_left <= 0
                }
    except ssl.SSLCertVerificationError as e:
        return {"status": "untrusted_or_invalid", "error": str(e), "days_remaining": 0}
    except Exception as e:
        return {"status": "connection_failed", "error": str(e)}


def run_web_audit(target_url: str) -> dict:
    """Master orchestrator function: executes all audits and aggregates findings."""
    if not target_url.startswith("http://") and not target_url.startswith("https://"):
        target_url = f"https://{target_url}"
    
    parsed = urlparse(target_url)
    host = parsed.netloc.split(":")[0]

    header_results = audit_security_headers(target_url)
    cookie_results = audit_cookies(target_url)
    ssl_results = audit_ssl_certificate(host)

    return {
        "target": target_url,
        "host": host,
        "ssl_analysis": ssl_results,
        "header_audit": header_results,
        "cookie_audit": cookie_results
    }


if __name__ == "__main__":
    import pprint
    test_target = "https://example.com"
    print(f"[*] Running test audit on: {test_target}...")
    results = run_web_audit(test_target)
    pprint.pprint(results)
