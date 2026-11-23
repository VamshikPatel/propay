# ProPay: Real-Time Banking Fraud & Dual-Speed Quishing Defense Engine

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Architecture: Dual--Speed](https://img.shields.io/badge/Architecture-Dual--Speed%20Pipeline-A3E635.svg)]()
[![Clearance SLA: <30ms](https://img.shields.io/badge/Sync%20SLA-%3C30ms-brightgreen.svg)]()

**ProPay** is a production-grade, dual-speed payment risk engine engineered to detect zero-day digital banking attacks—specifically **Physical QR Code Tampering (Quishing)** and **Deceptive Smishing Links**—before funds clear modern instant payment rails (UPI, FedNow).

Designed with fintech engineering principles (inspired by PayPal, Slice, and Stripe risk infrastructure), ProPay strictly decouples **sub-30ms synchronous deterministic clearance** from **asynchronous on-premise LLM cognitive reasoning** and **cryptographically chained audit logging**.

---

## 1. The Core Engineering Problem

In modern instant payment networks (such as India's **UPI** or the US **FedNow** rail), transactions settle in real time with an end-to-end SLA target of **< 50 milliseconds**.

Traditional banking risk architectures fail in two distinct ways:
1. **Legacy Batch Analysis:** Processing fraud signals hours or days after settlement is useless against irreversible instant transfers.
2. **The Inline LLM Bottleneck:** Placing modern Large Language Models (LLMs) in the critical clearance path introduces **1,000ms – 2,000ms of latency**, causing network timeouts, dropped transactions, and complete throughput collapse.
3. **Physical QR Code Tampering (Quishing):** Attackers physically paste replacement QR stickers over legitimate merchant stands. The customer scans what appears to be a legitimate merchant, but the underlying payment routes to an attacker's personal VPA. Traditional network firewalls cannot inspect the physical QR payload.

---

## 2. The Dual-Speed Architectural Solution

ProPay resolves the latency-versus-accuracy dilemma through a decoupled **Dual-Speed Pipeline**:

```
                         INCOMING TRANSACTION INTENT
                       (UPI QR Code / Deep-Link URI)
                                     │
                                     ▼
                ┌──────────────────────────────────────────┐
                │   Stage 1: Synchronous Fast-Path Gate    │
                │   • NPCI Intent URI Normalizer           │
                │   • Payee Authority Mismatch Heuristic   │
                │   • In-Memory Sliding-Window Velocity    │
                │   • Whitelist & Sanctions Check          │
                └────────────────────┬─────────────────────┘
                                     │
                        Clearance SLA: < 30ms
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
              [Risk <= 0.20]                    [Risk >= 0.70]
                    │                                 │
                    ▼                                 ▼
         ALLOW & INSTANT CLEAR               INTERCEPT & FREEZE
        (Zero Customer Friction)           (Dynamic Mobile Warning)
                    │                                 │
                    └────────────────┬────────────────┘
                                     │
                       Asynchronous Event Decoupling
                                     │
                                     ▼
                ┌──────────────────────────────────────────┐
                │   Stage 2: Asynchronous Forensic Worker  │
                │   • Local Ollama (Llama 3 / Mistral)     │
                │   • Deceptive Linguistic Analysis        │
                │   • Plain-English Forensic Dossier       │
                │   • Real-Time SMTP TLS Alert Dispatch    │
                └────────────────────┬─────────────────────┘
                                     │
                                     ▼
                ┌──────────────────────────────────────────┐
                │   Stage 3: Cryptographic Audit Ledger    │
                │   • Append-Only JSONL Event Stream       │
                │   • SHA-256 Chained Hash Verification    │
                │   • Tamper-Evident Incident History      │
                └──────────────────────────────────────────┘
```

---

## 3. Core Modules & Technical Implementation

### Module 1: NPCI Intent URI Normalizer & Edge Parser
- Conforms strictly to the **NPCI UPI Intent Specification**.
- Parses URI parameters: `pa` (Payee VPA), `pn` (Payee Name), `am` (Amount), `mc` (Merchant Category Code), `cu` (Currency).
- Detects and resolves shortened redirect links (`bit.ly`, `tinyurl.com`) and flags high-risk TLDs (`.xyz`, `.top`, `.click`).

### Module 2: Payee Authority vs. Settlement Mismatch (Anti-Quishing)
- Analyzes discrepancies between the merchant claim in `pn` and the settlement handle in `pa`.
- **Attack Signature:** A QR sticker display claiming *"HDFC Official Merchant"* but routing settlement to `scammer_wallet@paytm` or an unverified personal handle.
- Evaluated in **< 0.1ms** using deterministic lookup tables.

### Module 3: In-Memory Sliding-Window Velocity Rate Limiter
- Implements a sliding-window timestamp counter per user/VPA/IP using Python in-memory storage.
- Automatically flags velocity anomalies (e.g., **> 3 transactions within a 60-second window**), preventing automated bot drainage in $O(1)$ time without database overhead.

### Module 4: Asynchronous Cognitive LLM (Ollama Llama 3)
- Strictly isolated from the sub-30ms wire clearance path.
- Triggered only for flagged anomalies to evaluate deceptive social engineering context.
- Generates structured, plain-English case dossiers for security operations and bank fraud analysts.
- **Data Sovereignty:** Hosted on-premises with zero banking customer data leaving the local VPC.

### Module 5: Tamper-Evident SHA-256 Chained Ledger
- Appends every transaction verdict to `backend/audit_ledger.jsonl`.
- Each entry contains a cryptographic `record_hash` computed over the record's payload concatenated with the `prev_hash` of the preceding record.
- Provides a mathematical integrity verification function (`verify_ledger_integrity()`) that instantly detects if any historical audit entry has been modified or deleted.

---

## 4. Quick Start (Zero Setup Required)

### Option A: Instant Browser Demo (Offline-Ready)
Simply open `index.html` in any browser (Chrome, Edge, Brave, Firefox). All presets, telemetry traces, and UI components are fully interactive offline.

### Option B: Local Python Server
1. Clone the repository:
   ```bash
   git clone https://github.com/VamshikPatel/propay.git
   cd propay
   ```
2. Start the server:
   ```bash
   python server.py
   ```
   *(Or double-click `run_propay.bat` on Windows)*.
3. Access the dashboard at **`http://localhost:5055`**.

---

## 5. API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/simulate` | `POST` | Executes the dual-speed risk pipeline on a given UPI intent or URL. |
| `/api/health` | `GET` | Returns system diagnostics, active SLA targets, and ledger status. |
| `/api/ledger/status` | `GET` | Returns cryptographic audit trail statistics and latest SHA-256 hash. |
| `/api/ledger/verify` | `GET` | Mathematically verifies the entire SHA-256 hash chain from genesis. |
| `/api/email/config` | `GET / POST` | Retrieves or saves outbound SMTP TLS alert credentials. |
| `/api/email/test` | `POST` | Dispatches a live test security alert to the specified inbox. |

---

## 6. Tech Stack & Engineering Standards

- **Backend:** Python 3.10+, Flask, Standard Library (`urllib.parse`, `hashlib`, `collections`, `time`)
- **Memory Store:** In-memory sliding-window velocity tracker
- **AI & Forensics:** Local Ollama (Llama 3 / Mistral) REST client
- **Cryptographic Audit:** SHA-256 Hash Chaining
- **Alerting:** Python `smtplib` over TLS
- **Frontend:** Vanilla JavaScript (ES6+), Modern HTML5, Responsive CSS (Dodo Payments design system)
