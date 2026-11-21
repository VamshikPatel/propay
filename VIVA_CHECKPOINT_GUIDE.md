# ProPay — 3:30 PM Checkpoint Submission & Viva Defense Guide
**Real-Time Banking Fraud & Cognitive Quishing Defense Agent**  
**Design Direction:** WeBank Modern Fintech Header (Line-art illustrations, lime accents, doodle squiggle underline) × shadcn/ui Minimal Controls  
**Checkpoint Date & Time:** 21st November 2026, 3:30 PM

---

## 1. 60-Second Opening Pitch to the Panel / Guide

> *"Good afternoon Sir/Madam. Our project is **ProPay**, an enterprise Real-Time Banking Fraud & Quishing Defense Agent.
>
> Traditional fraud detection systems focus on historical database thresholds, leaving banks completely vulnerable to emerging zero-day digital fraud: specifically **Quishing (tampered physical QR stickers on point-of-sale terminals)** and **unsolicited smishing links** distributed via SMS and messaging channels.
>
> ProPay introduces a **Dual-Speed Architecture** across **3 Threat Sectors** and a **5-Agent Swarm**:
> 1. Our synchronous inline fast-path clears legitimate payments in **under 38 milliseconds** using lightweight rule engines and LightGBM models.
> 2. Ambiguous anomalies and deceptive payloads are dispatched **asynchronously to a private, on-premise Ollama LLM cluster (Llama 3)**.
>
> Crucially, **Ollama is strictly scoped to where it excels**: semantic phishing text analysis, QR merchant-vs-payee mismatch heuristics, plain-English forensic case dossiers, and automated security email alert synthesis—guaranteeing 100% banking data sovereignty without slowing down sub-second transaction throughput.
>
> Our user interface incorporates **Juspay-style payment aggregation flows**, demonstrating the end-to-end payment lifecycle through Kafka streaming partitions, fast-path scoring, switch clearing, and contextual email dispatch."*

---

## 2. Live Demonstration Flow for the Checkpoint

Open `frontend/index.html` in Chrome/Edge or run `server.py` (`http://localhost:5055`):

1. **Showcase the WeBank Modern Fintech & shadcn Design**:
   - Point out the clean ivory/white canvas, high-impact headline *"Intercept, verify, protect your cash with a single agent"*, and the purple hand-drawn doodle squiggle underline.
   - Point out the custom vector illustrations: POS terminal with electric lime fill on the left, and laptop with AI shield and alert envelopes on the right.
   - Demonstrate the **shadcn-style Theme Toggle Switch** in the top navigation bar with animated sun/moon indicators.
2. **Demonstrate Preset 1 (Clean Bank Wire / Clearance QR)**:
   - Click `PRESET 1` $\rightarrow$ Click `Run Threat Pipeline ➔`.
   - **Show the Evaluator:**
     - **Juspay Checkout Sheet**: Displays `HDFC Bank Treasury`, ₹50,000, verified institutional rail.
     - **9-Stage Lifecycle Pipeline**: `PAYMENT_INITIATED` $\rightarrow$ `KAFKA_INGESTED` $\rightarrow$ `GATEWAY_ROUTED` $\rightarrow$ `RISK_SCORED (PASS)` $\rightarrow$ `OLLAMA_BYPASSED (Wire Speed)` $\rightarrow$ `BANK_SWITCH_CLEARED` $\rightarrow$ `ENFORCEMENT (ALLOW)` $\rightarrow$ `EMAIL_DISPATCHED` $\rightarrow$ `SETTLEMENT_COMPLETE`.
     - Fast-path SLA: **$16.2\text{ms}$** (sub-38ms achieved).
3. **Demonstrate Preset 2 (Quishing Attack / Tampered QR Sticker)**:
   - Click `PRESET 2` $\rightarrow$ Click `Run Threat Pipeline ➔`.
   - **Show the Evaluator:** 
     - **Juspay Aggregator Sheet**: Shows claimed merchant `HDFC Official Merchant`, but underlying settlement is `scammer_wallet@paytm`.
     - **9-Stage Lifecycle**: `RISK_SCORED (FLAGGED)` $\rightarrow$ `OLLAMA_ANALYZED (THREAT)` $\rightarrow$ `BANK_SWITCH_HELD` $\rightarrow$ `ENFORCEMENT (FREEZE_AND_WARN)` $\rightarrow$ `EMAIL_DISPATCHED` $\rightarrow$ `TRANSACTION_FROZEN`.
     - **Ollama Forensic Dossier**:
       *"CRITICAL QUISHING THREAT IDENTIFIED: Severe Payee Entity Discrepancy. The QR display metadata explicitly claims 'HDFC Official Merchant', but the underlying settlement address resolves to an unverified individual wallet ('scammer_wallet@paytm'). Strongly indicates physical QR sticker replacement attack on point-of-sale terminals."*
4. **Demonstrate Preset 3 (Unsolicited Smishing Link)**:
   - Click `PRESET 3` $\rightarrow$ Click `Run Threat Pipeline ➔`.
   - Shortened `bit.ly` link is unrolled $\rightarrow$ resolves to lookalike domain `.xyz` $\rightarrow$ Ollama semantic analysis halts reverse-collect credential harvesting.
5. **Showcase Multi-Agent Swarm Orchestration & Automated Email Alerts**:
   - Highlight the 5 specialized autonomous agents with clean vector SVG glyphs (zero emojis):
     - `Agent 01: Ingress & Decoding Agent` (WASM Edge, <5ms)
     - `Agent 02: Fast-Path Rule Agent` (Drools + LightGBM, <38ms)
     - `Agent 03: Ollama Cognitive Agent` (Private Llama 3 On-Premise, ~1.2s Async)
     - `Agent 04: Adaptive Enforcement Agent` (Dynamic Glass Interception & Freeze)
     - `Agent 05: Ollama Email Alert Agent` (Contextual Customer Alerts & SOC Escalations)
   - Click `View Generated Email Alert ↗` to demonstrate the live synthesized banking email:
     - Customer View: Clear notification of payment block, claimed vs actual payee discrepancy, and "Not Me / Freeze Account" CTA.
     - Bank SOC View: Full incident report, Drools trigger rule, Ollama dossier, and FinCEN SAR filing.
6. **Showcase Kafka Streaming Ingress Ticker**:
   - Point to the live feed ticker showing 50,000 TPS simulated Kafka topic ingestion with 12 partitions, latency SLA, and instant email dispatch status.
7. **Open C4 Level 2 HLD Architecture Modal**:
   - Click `C4 HLD Architecture` in the top bar to walk the panel through the complete 6-tier architecture and the **Strict Ollama Boundary Table**.

---

## 3. Potential Tricky Evaluator Questions & Authoritative Answers

### Q1: "Why not use a Cloud LLM like OpenAI GPT-4 or Gemini for fraud analysis?"
- **Answer:** *"In banking risk infrastructure, customer PII, account numbers, and settlement metadata cannot leave the bank's secure VPC or data center due to **PCI-DSS, GDPR, and central bank data sovereignty mandates**. Hosting an on-premise **Ollama cluster** guarantees that 100% of reasoning occurs locally inside the bank's perimeter with zero external egress. Optional API keys are supported for private proxy enclaves."*

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
| **Tier 2: Streaming** | Apache Kafka + Flink + Redis | Sliding-window velocity (50k TPS, 12 Partitions) | $< 15\text{ms}$ |
| **Tier 3A: Inline Sync** | Drools + LightGBM (ONNX) | Deterministic Sanction & Tabular Scoring | $< 38\text{ms}$ |
| **Tier 3B: Async Agent** | **Ollama On-Premise (Llama 3)** | Semantic Phishing & QR Mismatch Reasoning | $< 1.4\text{s}$ (Async) |
| **Tier 4: Action** | Adaptive Interceptor | Dynamic Warning Glass & Freeze | Real-Time |
| **Tier 5: Alerts & Mailer**| Ollama Mailer + SMTP TLS | Customer Security Alert & SOC Ticket | $< 15\text{ms}$ |
| **Tier 6: Governance** | WORM S3 Storage | FinCEN SAR Auto-Filing & Non-repudiation | Immutable |
