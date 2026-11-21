"""
ProPay Backend — Flask API Server & Static Frontend Host
Port: 5055
"""

import os
import sys
import webbrowser
from flask import Flask, jsonify, request, send_from_directory
from backend.orchestrator import RiskOrchestrator

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

app = Flask(__name__, static_folder=FRONTEND_DIR)
orchestrator = RiskOrchestrator()

@app.route("/")
def index():
    return send_from_directory(FRONTEND_DIR, "index.html")

@app.route("/<path:path>")
def static_proxy(path):
    return send_from_directory(FRONTEND_DIR, path)

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "service": "ProPay Risk & Quishing Engine",
        "port": 5055,
        "inline_sla_target_ms": 38.0,
        "ollama_ready": True
    })

@app.route("/api/ollama/status", methods=["GET"])
def ollama_status():
    live = orchestrator.ollama_agent.is_ollama_live()
    return jsonify({
        "on_prem_live": live,
        "host": orchestrator.ollama_agent.ollama_url,
        "model": orchestrator.ollama_agent.model,
        "scoped_scope": ["semantic_phishing", "qr_vpa_mismatch", "forensic_dossier"]
    })

@app.route("/api/simulate", methods=["POST"])
def simulate():
    data = request.get_json(force=True, silent=True) or {}
    payload = data.get("payload", "").strip()
    if not payload:
        payload = "upi://pay?pa=scammer_wallet@paytm&pn=HDFC%20Official%20Merchant&am=3500"

    result = orchestrator.process_transaction(payload)
    return jsonify(result)

def start_server():
    port = 5055
    url = f"http://localhost:{port}"
    print("=" * 70)
    print("  ⚡ PROPAY STUDIO SERVER ONLINE")
    print(f"  URL: {url}")
    print("  Design: Pirate Wires × pleasecallmechamp.com × Motion.dev")
    print("  Engine: 3-Sector Risk Orchestrator with On-Premise Ollama Agent")
    print("=" * 70)
    webbrowser.open(url)
    app.run(host="0.0.0.0", port=port, debug=False)

if __name__ == "__main__":
    start_server()
