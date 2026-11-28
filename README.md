# ProPay

**Real-time pre-PIN fraud & quishing shield for UPI and digital payments.**

ProPay inspects scanned QR intents and payment links in real time, catching fake QR sticker swaps and smishing URLs before funds leave the user's account.

---

## Architecture Overview

ProPay decouples synchronous sub-30ms clearance from asynchronous AI forensics:

- **Edge URI & Intent Parser (`backend/rule_engine.py`)** — Parses NPCI UPI parameters (`pa`, `pn`, `am`, `mc`) and unwraps shortened phishing URLs.
- **Payee Authority Heuristic (`backend/rule_engine.py`)** — Flags corporate/bank brand names masquerading on unverified consumer wallets (anti-quishing).
- **Sliding-Window Velocity Guard (`backend/rule_engine.py`)** — Tracks per-VPA bursts in memory (`O(1)`) to stop rapid account-draining attempts.
- **Async Forensic Worker (`backend/ollama_agent.py`)** — Runs local Ollama (Llama 3 / Mistral) strictly off the payment path to draft threat explanations with zero cloud PII exposure.
- **Tamper-Evident Audit Ledger (`backend/event_ledger.py`)** — Seals every decision in an append-only SHA-256 hash-chained ledger (`backend/audit_ledger.jsonl`).
- **SMTP Alert Dispatcher (`backend/email_agent.py`)** — Sends customer warnings and Bank SOC incident notifications over TLS.

---

## Quick Start

### Local Server
```bash
git clone https://github.com/VamshikPatel/propay.git
cd propay
python server.py
```
Open `http://localhost:5055` in your browser *(or run `run_propay.bat` on Windows)*.

### Static / Offline Demo
Open `frontend/index.html` directly in any modern browser to run interactive client-side scenarios.

---

## API Endpoints

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/simulate` | `POST` | Run the dual-speed risk check on a UPI URI or URL |
| `/api/health` | `GET` | Check backend health and ledger status |
| `/api/ledger/status` | `GET` | View audit trail metrics and latest SHA-256 hash |
| `/api/ledger/verify` | `GET` | Verify the full SHA-256 hash chain integrity |
| `/api/email/config` | `GET` / `POST` | Get or configure outbound SMTP settings |
| `/api/email/test` | `POST` | Send a live test security alert email |

---

## Stack

- **Backend:** Python 3.10+, Flask, `urllib.parse`, `hashlib`, `smtplib`
- **AI Forensics:** Local Ollama REST API (optional, falls back gracefully offline)
- **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3 (`frontend/`)
