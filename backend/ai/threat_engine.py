import os
import json
from google import genai
from google.genai import types
from backend.ai.schemas import ThreatReport

def generate_threat_model(scan_data: dict) -> dict:
    """
    Takes aggregated raw scan data and uses Gemini to generate a structured threat report.
    """
    # Look for the API key in the environment variables
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return {"error": "GEMINI_API_KEY environment variable is not set."}

    try:
        # Initialize the GenAI client
        client = genai.Client(api_key=api_key)
        
        # Prepare the data by converting the Python dictionary to a JSON string
        raw_data_string = json.dumps(scan_data, indent=2)
        
        # Construct the system instruction and prompt
        prompt = f"""
        You are VulneraX, an elite, AI-powered cybersecurity penetration tester and threat modeler.
        I am going to provide you with raw reconnaissance telemetry gathered from automated scanners (Nmap, web crawlers, HTTP audits).
        
        Your job is to:
        1. Analyze the data for misconfigurations, outdated software, and exposed attack surfaces.
        2. Calculate a realistic risk score (0-100, where 100 is perfectly secure).
        3. Identify the key vulnerabilities.
        4. Predict a realistic attack path showing how a hacker might chain these issues together to compromise the system.
        
        Here is the raw scan data:
        {raw_data_string}
        """

        print("[*] Sending telemetry to Gemini AI for threat analysis...")
        
        # Call the Gemini model and enforce our structured output schema
        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ThreatReport,
                temperature=0.2, # Low temperature keeps the AI analytical and precise
            ),
        )
        
        # Parse the JSON string response back into a Python dictionary
        return json.loads(response.text)

    except Exception as e:
        return {"error": f"AI generation failed: {str(e)}"}

if __name__ == "__main__":
    import pprint
    
    # Mock data to test the engine without running a full scan
    mock_scan_data = {
        "target": "example.com",
        "nmap_results": {
            "open_ports": [
                {"port": 80, "service": "http", "version": "Apache 2.2.14"}, 
                {"port": 22, "service": "ssh", "version": "OpenSSH 5.3p1"}
            ]
        },
        "web_audit_results": {
            "vulnerabilities": [
                {"type": "Missing Header", "item": "Strict-Transport-Security", "severity": "High"}
            ]
        }
    }
    
    # Run the test
    results = generate_threat_model(mock_scan_data)
    pprint.pprint(results)
