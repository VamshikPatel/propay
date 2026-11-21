# ProPay — 3:30 PM Checkpoint Submission & Viva Defense Guide
**Real-Time Banking Fraud & Cognitive Quishing Defense Agent**  
**Design Direction:** WeBank Modern Fintech Header (Line-art illustrations, lime accents, doodle squiggle underline)  
**Checkpoint Date & Time:** 21st November 2026, 3:30 PM

---

## 1. 60-Second Opening Pitch to the Panel / Guide

> *"Good afternoon Sir/Madam. Our project is **ProPay**, an enterprise Real-Time Banking Fraud & Quishing Defense Agent.
>
> Traditional fraud detection systems focus on historical database thresholds, leaving banks completely vulnerable to emerging zero-day digital fraud: specifically **Quishing (tampered physical QR stickers on point-of-sale terminals)** and **unsolicited smishing links** distributed via SMS and messaging channels.
>
> ProPay introduces a **Dual-Speed Architecture** across **3 Threat Sectors**:
> 1. Our synchronous inline fast-path clears legitimate payments in **under 38 milliseconds** using lightweight rule engines and LightGBM models.
> 2. Ambiguous anomalies and deceptive payloads are dispatched **asynchronously to a private, on-premise Ollama LLM cluster (Llama 3)**.
>
> Crucially, **Ollama is strictly scoped to where it excels**: semantic phishing text analysis, QR merchant-vs-payee mismatch heuristics, and generating human-readable forensic case dossiers—guaranteeing 100% banking data sovereignty without slowing down sub-second transaction throughput.
>
> Our user interface adopts modern fintech aesthetics inspired by **WeBank**, featuring crisp high-contrast cards, hand-drawn vector line-art with electric lime accents, a playful purple doodle squiggle underline, and a dual-speed telemetry simulator."*

---

## 2. Live Demonstration Flow for the 3:30 PM Checkpoint

Open `frontend/index.html` in Chrome/Edge or run `server.py` (`http://localhost:5055`):

1. **Showcase the WeBank Modern Fintech Design**:
   - Point out the clean ivory/white canvas, high-impact headline *"Intercept, verify, protect your cash with a single agent"*, and the purple hand-drawn doodle squiggle underline.
   - Point out the custom hand-drawn vector illustrations: POS terminal with electric lime fill on the left, and laptop with AI shield and flying alert envelopes on the right.
   - Point out the pill-shaped payload input bar with instant CTA *"Analyze Threat"*.
2. **Demonstrate Preset 1 (Clean Bank Wire / Clearance QR)**:
   - Click `PRESET 1` $\rightarrow$ Click `Run Threat Pipeline ➔`.
   - **Show the Evaluator:** Evaluated in **$18.0\text{ms}$**. Drools institutional whitelist matched. Ollama is **bypassed** to keep wire speed instant. `ALLOW TRANSACTION`.
3. **Demonstrate Preset 2 (Quishing Attack / Tampered QR Sticker)**:
   - Click `PRESET 2` $\rightarrow$ Click `Run Threat Pipeline ➔`.
   - **Show the Evaluator:** 
     - Sector 1 extracts the payload: Display name claims `HDFC Official Merchant`, but payee settlement VPA is `scammer_wallet@paytm`.
     - Sector 2 (Ollama on-prem) detects the entity discrepancy in $1.24\text{s}$ async and generates the **Forensic Case Dossier**:
       *"🚨 CRITICAL QUISHING THREAT IDENTIFIED: Severe Payee Entity Discrepancy. The QR display metadata explicitly claims 'HDFC Official Merchant', but the underlying settlement address resolves to an unverified individual wallet ('scammer_wallet@paytm'). Strongly indicates physical QR sticker replacement attack on campus/POS terminals."*
     - Sector 3 triggers: `⚠️ DYNAMIC IN-APP INTERCEPTION: Transfer Frozen & FinCEN SAR Auto-Drafted`.
4. **Demonstrate Preset 3 (Unsolicited Smishing Link)**:
   - Click `PRESET 3` $\rightarrow$ Click `Run Threat Pipeline ➔`.
   - **Show the Evaluator:** Shortened `bit.ly` link is unrolled $\rightarrow$ resolves to lookalike domain `.xyz` $\rightarrow$ Ollama detects social engineering urgency and halts reverse collect-request trap.
5. **Open C4 Level 2 HLD Architecture Modal**:
   - Click `C4 HLD Architecture` in the top bar to walk the panel through the complete 6-tier architecture and the **Strict Ollama Boundary Table**.

---

## 3. Potential Tricky Evaluator Questions & Authoritative Answers

### Q1: "Why not use a Cloud LLM like OpenAI GPT-4 or Gemini for fraud analysis?"
- **Answer:** *"In banking risk infrastructure, customer PII, account numbers, and settlement metadata cannot leave the bank's secure VPC or data center due to **PCI-DSS, GDPR, and central bank data sovereignty mandates**. Hosting an on-premise **Ollama cluster** guarantees that 100% of reasoning occurs locally inside the bank's perimeter with zero external egress."*

### Q2: "Isn't an LLM too slow to evaluate banking transactions in real-time?"
- **Answer:** *"Yes, which is exactly why our architecture enforces the **Strict Ollama Boundary**. Ollama is **never** placed in the synchronous inline path. Wire payments are cleared in **under 38 milliseconds** using Drools deterministic rules and LightGBM models. Ollama is strictly triggered **asynchronously** for flagged anomalies, semantic link inspection, and pre-compiling analyst evidence dossiers."*

### Q3: "How does ProPay stop Quishing (QR Phishing) specifically?"
- **Answer:** *"Quishing occurs when fraudsters paste a fake paper QR sticker over a verified merchant's stand. When scanned, the QR display text might say 'HDFC Official Merchant', but the underlying URI routes to a private personal UPI handle (`attacker@paytm`). Sector 1 extracts both strings at the edge; Sector 2 (Ollama) compares the claimed entity against the payee settlement history, immediately catching the discrepancy before funds transfer."*

### Q4: "What happens after fraud is caught? Does it just block?"
- **Answer:** *"ProPay uses a **Friction-Adaptive Response**: for trusted transactions it is frictionless; for medium ambiguity it challenges the user with biometric step-up auth; for confirmed Quishing/Phishing, it freezes the transaction, warns the user with a dynamic glass overlay, and automatically drafts an audit-ready Suspicious Activity Report (SAR) for regulatory compliance."*

---

## 4. Architectural Summary

| Layer | Technology | Function | SLA |
| :--- | :--- | :--- | :--- |
| **Tier 1: Ingestion** | Envoy Edge + WebAssembly | QR Intent & Short-URL Unroller | $< 5\text{ms}$ |
| **Tier 2: Streaming** | Apache Kafka + Flink + Redis | Sliding-window velocity (50k TPS) | $< 15\text{ms}$ |
| **Tier 3A: Inline Sync** | Drools + LightGBM (ONNX) | Deterministic Sanction & Tabular Scoring | $< 38\text{ms}$ |
| **Tier 3B: Async Agent** | **Ollama On-Premise (Llama 3)** | Semantic Phishing & QR Mismatch Reasoning | $< 1.4\text{s}$ (Async) |
| **Tier 4: Action** | Adaptive Interceptor | Dynamic Warning Glass & Freeze | Real-Time |
| **Tier 5: HITL Workbench**| Next.js / WebSocket Console | Ollama Forensic Case Dossier View | $< 2\text{ mins}$ review |
| **Tier 6: Governance** | WORM S3 Storage | FinCEN SAR Auto-Filing & Non-repudiation | Immutable |
