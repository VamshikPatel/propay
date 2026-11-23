# ProPay — Viva & Technical Interview Defense Guide
**Dual-Speed Banking Fraud & Quishing Defense Engine**  
**Calibrated for:** On-Campus (Skyhigh Security, Epicor, Product Companies) & Off-Campus (Slice, Uber, Razorpay, PhonePe) Interviews.

---

## 1. The 60-Second Elevator Pitch (Memorize This)

> *"Good afternoon Sir/Madam / Hi [Interviewer Name]. My project is **ProPay**, an enterprise real-time fraud defense engine specifically targeting modern zero-day payment attacks: **Physical QR Code Tampering (Quishing)** and **Deceptive Phishing Links** on instant payment rails like UPI.
>
> In modern payment networks, transactions settle in **under 50 milliseconds**. You cannot run a heavy AI model inline on every transaction because LLMs take 1 to 2 seconds, which would crash transaction throughput.
>
> To solve this, I architected a **Dual-Speed Pipeline** in Python:
> 1. **Synchronous Fast-Path Gatekeeper (<30ms):** Implements NPCI UPI Intent URI parsing, merchant-vs-settlement authority mismatch heuristics, and an in-memory sliding-window velocity rate limiter.
> 2. **Asynchronous Cognitive Worker:** When a transaction is flagged suspicious, a local Ollama LLM (Llama 3) executes in the background to analyze the deceptive context, generate a plain-English forensic dossier, and dispatch an automated SMTP email alert.
>
> Every transaction verdict is cryptographically sealed into an append-only ledger using **SHA-256 chained hashing**, guaranteeing tamper-evident audit trails."*

---

## 2. The 5 Questions Every Interviewer Will Ask (and Your Winning Answers)

### Q1: "Why did you separate the Fast-Path from the LLM instead of running AI on every transaction?"
- **The Senior SWE Answer:**
  > *"Because of the **latency SLA trade-off**. On instant payment rails like UPI or FedNow, the network clearance SLA is strictly sub-50ms. LLM inference introduces a 1–2 second latency bottleneck. Placing an LLM inline on thousands of transactions per second would cause massive timeouts and customer churn. 
  > 
  > In our dual-speed architecture, 95%+ of legitimate transactions clear in **under 30 milliseconds** via deterministic heuristics. The LLM is invoked strictly asynchronously as a background worker on the 5% of flagged anomalies to provide human-readable explainability and automated security alerts."*

---

### Q2: "How does your Quishing detection work under the hood?"
- **The Senior SWE Answer:**
  > *"A UPI QR code conforms to the NPCI Intent specification: `upi://pay?pa=...&pn=...&am=...`. 
  > 
  > In a physical Quishing attack, scammers paste a malicious QR sticker over a shopkeeper's genuine QR stand. The display name on the sticker says 'Starbucks Coffee' or 'HDFC Official Merchant' (`pn`), but the underlying payee address (`pa`) routes funds to an unauthorized personal handle like `scammer_wallet@paytm`.
  > 
  > Our engine parses the URI using Python's `urllib.parse`, extracts `pn` and `pa`, and cross-references them against institutional settlement domains. If a trusted corporate authority is claimed in `pn` but resolves to an unverified consumer VPA in `pa`, our heuristic flags an **Authority Mismatch** in under 0.1ms."*

---

### Q3: "How did you implement the velocity rate limiter without slowing down the database?"
- **The Senior SWE Answer:**
  > *"I implemented an **In-Memory Sliding-Window Rate Limiter**. For each user or VPA, we maintain an in-memory list of Unix timestamps of their recent transactions. 
  > 
  > When a new transaction arrives, we prune timestamps older than our 60-second window and append the current timestamp. If the count exceeds our threshold (e.g., >3 transactions in 60 seconds), we flag a `VELOCITY_ANOMALY`. 
  > 
  > This provides $O(1)$ amortized time complexity with zero database disk I/O, preventing automated account draining in sub-millisecond time."*

---

### Q4: "How does your Tamper-Evident SHA-256 Ledger work?"
- **The Senior SWE Answer:**
  > *"It uses **Cryptographic Hash Chaining** (similar to a blockchain block-header or Git commit tree). 
  > 
  > Each transaction record is logged to an append-only JSONL file with two hashes:
  > 1. `prev_hash`: The SHA-256 digest of the immediately preceding record (or a 64-zero genesis hash for the first record).
  > 2. `record_hash`: Computed as `SHA256(canonical_json(payload) + prev_hash)`.
  > 
  > We also built an integrity verification function (`verify_ledger_integrity()`) that scans the file from beginning to end and recomputes the hashes. If an attacker or insider edits even a single character or amount in an old transaction, the entire subsequent hash chain breaks mathematically, exposing the tampering immediately."*

---

### Q5: "Why use local Ollama instead of an external API like OpenAI GPT-4?"
- **The Senior SWE Answer:**
  > *"In banking and payment systems, **data sovereignty and PCI-DSS compliance** are paramount. Sending customer account numbers, transaction amounts, and payee metadata to public third-party cloud APIs risks PII leakage. 
  > 
  > By running **Ollama (Llama 3)** locally on-premise, 100% of the cognitive reasoning stays inside the bank's secure perimeter, ensuring complete privacy with zero cloud data egress."*

---

## 3. Live Demonstration Cheat-Sheet

Open `frontend/index.html` or run `python server.py` (`http://localhost:5055`):

1. **Highlight the Clean Dodo Payments Aesthetic:**
   - Point out the calm pastel gradient canvas, the clean sans-serif typography, and the zero-clutter layout.
   - Show the **Live Telemetry HUD** and the quick scan search bar.

2. **Run Preset 1: Clean Bank Wire:**
   - Click `PRESET 1` $\rightarrow$ Click `Run Pipeline`.
   - Show that the transaction is recognized as an institutional settlement (`hdfc.corporate@hdfcbank`).
   - Fast-path latency: **< 1ms**, LLM is bypassed to preserve speed, transaction status: `ALLOW`.

3. **Run Preset 2: Quishing Attack (QR Sticker Replacement):**
   - Click `PRESET 2` $\rightarrow$ Click `Run Pipeline`.
   - Show the mismatch: Payee name claims `HDFC Official Merchant`, but settlement VPA routes to `scammer_wallet@paytm`.
   - Fast-path immediately flags `PAYEE_AUTHORITY_MISMATCH_QUISHING`.
   - Ollama LLM runs in the background and outputs the plain-English forensic case dossier.
   - Click `View Generated Email ↗` to show the personalized customer warning and bank SOC ticket.

4. **Run Preset 3: Unsolicited Smishing Link:**
   - Click `PRESET 3` $\rightarrow$ Click `Run Pipeline`.
   - Show the shortened `bit.ly` link being resolved to an untrusted `.xyz` domain, intercepted before credential harvesting.

5. **Demonstrate Ledger Integrity:**
   - Show that every transaction is appended with a `record_hash` and `prev_hash` to `backend/audit_ledger.jsonl`.

---

## 4. Quick Code Snippets (Know How to Write These on Paper)

### A. Sliding-Window Velocity Rate Limiter
```python
import time
from collections import defaultdict

velocity_store = defaultdict(list)

def check_velocity(user_id: str, window_sec: int = 60, max_limit: int = 3) -> bool:
    now = time.time()
    # 1. Prune timestamps older than window
    velocity_store[user_id] = [t for t in velocity_store[user_id] if (now - t) <= window_sec]
    # 2. Record current attempt
    velocity_store[user_id].append(now)
    # 3. Check limit
    return len(velocity_store[user_id]) > max_limit
```

### B. SHA-256 Hash Chaining
```python
import hashlib, json

def compute_record_hash(payload: dict, prev_hash: str) -> str:
    canonical_data = json.dumps(payload, sort_keys=True) + prev_hash
    return hashlib.sha256(canonical_data.encode('utf-8')).hexdigest()
```

### C. NPCI UPI Intent Parsing
```python
from urllib.parse import urlparse, parse_qs

def parse_upi_intent(raw_qr_uri: str) -> dict:
    parsed = urlparse(raw_qr_uri)
    params = parse_qs(parsed.query)
    return {
        "pa": params.get("pa", [""])[0].lower(),  # Payee VPA
        "pn": params.get("pn", [""])[0],          # Payee Merchant Name
        "am": params.get("am", [""])[0],          # Amount
    }
```
