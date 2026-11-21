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
        "ollama_ready": True,
        "kafka_cluster": orchestrator.kafka_sim.get_cluster_status()["status"]
    })

@app.route("/api/ollama/status", methods=["GET"])
def ollama_status():
    live = orchestrator.ollama_agent.is_ollama_live()
    return jsonify({
        "on_prem_live": live,
        "host": orchestrator.ollama_agent.ollama_url,
        "model": orchestrator.ollama_agent.model,
        "api_key_configured": bool(orchestrator.ollama_agent.api_key),
        "scoped_scope": ["semantic_phishing", "qr_vpa_mismatch", "forensic_dossier", "email_synthesis"]
    })

@app.route("/api/kafka/status", methods=["GET"])
def kafka_status():
    return jsonify(orchestrator.kafka_sim.get_cluster_status())

@app.route("/api/simulate", methods=["POST"])
def simulate():
    data = request.get_json(force=True, silent=True) or {}
    payload = data.get("payload", "").strip()
    recipient_email = (data.get("recipient_email") or data.get("email") or "").strip()
    if not payload:
        payload = "upi://pay?pa=scammer_wallet@paytm&pn=HDFC%20Official%20Merchant&am=3500"

    result = orchestrator.process_transaction(payload, recipient_email=recipient_email or None)
    return jsonify(result)

@app.route("/api/email/config", methods=["GET", "POST"])
def email_config():
    if request.method == "POST":
        data = request.get_json(force=True, silent=True) or {}
        save_res = orchestrator.email_agent.save_smtp_config(data)
        return jsonify(save_res)
    return jsonify(orchestrator.email_agent.get_safe_smtp_config())

@app.route("/api/email/test", methods=["POST"])
def test_email():
    data = request.get_json(force=True, silent=True) or {}
    recipient = (data.get("recipient") or data.get("email") or "").strip()
    # If custom config passed in test request, save it first
    if data.get("host") and data.get("user"):
        orchestrator.email_agent.save_smtp_config(data)
    res = orchestrator.email_agent.test_smtp_connection(recipient=recipient)
    return jsonify(res)

@app.route("/api/email/send", methods=["POST"])
def send_email_api():
    data = request.get_json(force=True, silent=True) or {}
    recipient = (data.get("recipient") or data.get("email") or "").strip()
    if not recipient:
        return jsonify({"success": False, "error": "Recipient email address is required"}), 400

    subject = data.get("subject", "ProPay Payment Authorization Alert")
    html_body = data.get("html_body", "<p>ProPay Real-Time Payment Notification</p>")
    text_body = data.get("text_body", "ProPay Real-Time Payment Notification")

    res = orchestrator.email_agent.send_smtp(recipient, subject, html_body, text_body)
    return jsonify(res)

@app.route("/api/email/history", methods=["GET"])
def email_history():
    log_path = orchestrator.email_agent.log_file
    items = []
    if os.path.exists(log_path):
        try:
            with open(log_path, "r", encoding="utf-8") as f:
                lines = f.readlines()
                for line in lines[-20:]:  # last 20
                    if line.strip():
                        import json
                        items.append(json.loads(line.strip()))
        except Exception:
            pass
    return jsonify({"total": len(items), "recent_dispatches": list(reversed(items))})

def start_server():
    port = 5055
    url = f"http://localhost:{port}"
    print("=" * 70)
    print("  PROPAY STUDIO SERVER ONLINE")
    print(f"  URL: {url}")
    print("  Engine: 5-Agent Multi-Agent Swarm with On-Premise Ollama")
    print("  Kafka: Simulated 12-partition fraud-ingress-topic")
    print("=" * 70)
    webbrowser.open(url)
    app.run(host="0.0.0.0", port=port, debug=False)

if __name__ == "__main__":
    start_server()
