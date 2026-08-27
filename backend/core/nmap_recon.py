import nmap
import socket
from urllib.parse import urlparse

def resolve_target(target: str) -> str:
    """Helper to convert a URL or domain into a raw IP address for Nmap."""
    if "://" in target:
        target = urlparse(target).netloc.split(":")[0]
    try:
        ip = socket.gethostbyname(target)
        return ip
    except socket.gaierror:
        return target

def run_port_scan(target: str, scan_type: str = "fast") -> dict:
    """
    Executes an Nmap port scan against the target to discover open ports and services.
    scan_type can be 'fast' (top 100 ports) or 'full' (all 65535 ports).
    """
    ip_target = resolve_target(target)
    nm = nmap.PortScanner()
    
    # Configure arguments based on scan type
    if scan_type == "full":
        # -p- scans all 65535 ports, -sV grabs service versions, -T4 speeds it up
        args = "-p- -sV -T4"
    else:
        # --top-ports 100 scans the most common 100 ports, -sV grabs versions
        args = "--top-ports 100 -sV -T4"

    try:
        print(f"[*] Starting Nmap ({scan_type}) scan on {ip_target}...")
        nm.scan(hosts=ip_target, arguments=args)
        
        # If the host is completely blocking ping, nmap might think it's down.
        if ip_target not in nm.all_hosts():
             # Retry with -Pn (treat host as online)
             print("[*] Host seems down. Retrying with -Pn (skipping ping)...")
             args += " -Pn"
             nm.scan(hosts=ip_target, arguments=args)

        if ip_target not in nm.all_hosts():
            return {"status": "error", "error": "Host appears down or is completely blocking scans."}

        host_data = nm[ip_target]
        open_ports = []

        # Parse TCP ports
        if 'tcp' in host_data:
            for port_num, port_info in host_data['tcp'].items():
                if port_info['state'] == 'open':
                    open_ports.append({
                        "port": port_num,
                        "protocol": "tcp",
                        "service": port_info.get("name", "unknown"),
                        "product": port_info.get("product", ""),
                        "version": port_info.get("version", ""),
                        "extrainfo": port_info.get("extrainfo", "")
                    })

        # Gather OS or general host info if available
        os_match = "Unknown"
        if 'osmatch' in host_data and len(host_data['osmatch']) > 0:
            os_match = host_data['osmatch'][0]['name']

        return {
            "status": "success",
            "target": target,
            "resolved_ip": ip_target,
            "state": host_data.state(),
            "os_guess": os_match,
            "total_open_ports": len(open_ports),
            "open_ports": open_ports
        }

    except nmap.PortScannerError as e:
        return {"status": "error", "error": f"Nmap error: {str(e)}"}
    except Exception as e:
        return {"status": "error", "error": str(e)}

if __name__ == "__main__":
    import pprint
    # Test against a safe public scanning target provided by Nmap
    test_target = "scanme.nmap.org"
    results = run_port_scan(test_target, scan_type="fast")
    pprint.pprint(results)
