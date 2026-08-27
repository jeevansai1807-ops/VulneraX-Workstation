from pydantic import BaseModel, Field
from typing import List

class VulnerabilityFinding(BaseModel):
    title: str = Field(description="A short, concise name for the vulnerability (e.g., 'Outdated Apache Version').")
    severity: str = Field(description="Must be 'Critical', 'High', 'Medium', or 'Low'.")
    description: str = Field(description="A brief explanation of why this is a security risk.")
    remediation: str = Field(description="Actionable steps the developer must take to fix it.")

class AttackNode(BaseModel):
    step_number: int = Field(description="The order in the attack path (1, 2, 3, etc.).")
    action: str = Field(description="What the attacker does (e.g., 'Attacker scans port 80').")
    target_component: str = Field(description="The specific asset being attacked (e.g., 'Apache 2.4.7').")
    technique: str = Field(description="The security concept or MITRE ATT&CK technique used.")

class ThreatReport(BaseModel):
    risk_score: int = Field(description="A calculated security score from 0 (terrible) to 100 (perfectly secure).")
    executive_summary: str = Field(description="A 2-3 sentence overview of the target's security posture.")
    key_vulnerabilities: List[VulnerabilityFinding] = Field(description="A prioritized list of the top security issues found.")
    predicted_attack_path: List[AttackNode] = Field(description="A hypothetical step-by-step chain showing how an attacker might exploit the findings.")
