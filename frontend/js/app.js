/**
 * PROPAY Frontend Engine — Multi-Agent Orchestration & Email Alert Swarm
 * WeBank Modern Fintech Design System × shadcn/ui Theme Engine
 * Juspay-Style Payment Aggregation Lifecycle Pipeline
 */

class ProPayApp {
  constructor() {
    this.simState = {
      activePreset: 'quishing',
      payload: 'upi://pay?pa=scammer_wallet@paytm&pn=HDFC%20Official%20Merchant&am=3500',
      resultType: 'quishing',
      isAnalyzing: false,
      activeEmailTab: 'customer',
      emailData: null,
      lastApiData: null
    };

    this.txCounter = 8402;
    this.init();
  }

  init() {
    this.initTheme();
    this.renderTelemetry();
    this.startFeedTicker();
    this.bindEvents();
    this.checkBackendHealth();
  }

  initTheme() {
    const savedTheme = localStorage.getItem('propay-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const navLabel = document.getElementById('theme-nav-label');
    const toggle = document.getElementById('shadcn-theme-toggle');
    if (navLabel) navLabel.textContent = savedTheme === 'light' ? 'Dark' : 'Light';
    if (toggle) toggle.setAttribute('aria-checked', savedTheme === 'dark');
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('propay-theme', next);

    const navLabel = document.getElementById('theme-nav-label');
    const toggle = document.getElementById('shadcn-theme-toggle');
    if (navLabel) navLabel.textContent = next === 'light' ? 'Dark' : 'Light';
    if (toggle) toggle.setAttribute('aria-checked', next === 'dark');

    this.showToast(`Switched to ${next === 'dark' ? 'Dark Cyber' : 'Light WeBank'} Theme`);
  }

  bindEvents() {
    // Escape key closes modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop.active').forEach(m => m.classList.remove('active'));
      }
    });

    // Click outside modal dialog closes it
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
      });
    });

    // Enter key triggers analysis
    const heroInput = document.getElementById('hero-quick-input');
    if (heroInput) {
      heroInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.quickAnalyzeFromHero();
      });
    }

    const simInput = document.getElementById('sim-input');
    if (simInput) {
      simInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.executeSimulation();
      });
    }
  }

  async checkBackendHealth() {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        console.log('ProPay Flask Backend Connected on Port 5055 | Kafka:', data.kafka_cluster);
      }
    } catch (e) {
      console.log('Running in Standalone Client Mode (Offline Zero-Setup)');
    }
  }

  scrollTo(sectionId) {
    const el = document.getElementById(`section-${sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  resetView() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.showToast('ProPay view reset to top.');
  }

  quickAnalyzeFromHero() {
    const heroInput = document.getElementById('hero-quick-input');
    const simInput = document.getElementById('sim-input');
    if (heroInput && simInput) {
      simInput.value = heroInput.value.trim();
    }
    this.scrollTo('simulator');
    this.executeSimulation();
  }

  loadPreset(presetType) {
    this.simState.activePreset = presetType;
    this.simState.resultType = presetType;

    const input = document.getElementById('sim-input');
    const heroInput = document.getElementById('hero-quick-input');
    const tabs = document.querySelectorAll('.preset-tab');

    tabs.forEach(t => t.classList.remove('active'));
    const targetTab = document.getElementById(`btn-p-${presetType}`);
    if (targetTab) targetTab.classList.add('active');

    if (presetType === 'clean') {
      this.simState.payload = 'upi://pay?pa=hdfc.corporate@hdfcbank&pn=HDFC%20Bank%20Treasury&am=50000';
    } else if (presetType === 'quishing') {
      this.simState.payload = 'upi://pay?pa=scammer_wallet@paytm&pn=HDFC%20Official%20Merchant&am=3500';
    } else if (presetType === 'smishing') {
      this.simState.payload = 'https://bit.ly/bank-urgent-security-refund';
    }

    if (input) input.value = this.simState.payload;
    if (heroInput) heroInput.value = this.simState.payload;

    this.renderTelemetry();
    this.showToast(`Loaded Preset: ${presetType.toUpperCase()}`);
  }

  async executeSimulation() {
    const input = document.getElementById('sim-input');
    const btn = document.getElementById('btn-run-sim');
    const val = input ? input.value.trim() : '';

    if (!val) {
      this.showToast('Please enter a valid payload or URL to inspect.');
      return;
    }

    this.simState.payload = val;
    this.simState.isAnalyzing = true;

    if (btn) {
      btn.innerHTML = '<span>Multi-Agent Swarm Orchestrating...</span>';
      btn.style.opacity = '0.75';
    }

    const container = document.getElementById('telemetry-output');
    if (container) {
      container.innerHTML = `
        <div style="padding: 32px; text-align: center; color: var(--accent-primary); font-family: var(--font-mono);">
          <div style="font-size: 24px; margin-bottom: 12px; animation: pulse 1s infinite;">●</div>
          <div style="font-weight: 700; letter-spacing: 0.05em;">ORCHESTRATING 5 AUTONOMOUS AGENTS // DISPATCHING OLLAMA REASONING...</div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">Zero Cloud PII · Sub-38ms Fast-Path · Automated Email Synthesizer Active · Kafka Partitioned Stream</div>
        </div>
      `;
    }

    // Try calling backend REST API
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: val })
      });
      if (res.ok) {
        const apiData = await res.json();
        this.simState.lastApiData = apiData;
        this.simState.emailData = apiData.email_sector_4 || null;
        this.renderApiTelemetry(apiData);
        this.simState.isAnalyzing = false;
        if (btn) {
          btn.innerHTML = '<span>Run Threat Pipeline ➔</span>';
          btn.style.opacity = '1';
        }
        this.showToast('Multi-Agent mesh executed. Email alerts synthesized.');
        return;
      }
    } catch (e) {
      // Fallback to client-side pipeline
    }

    // Client-side fallback simulation
    setTimeout(() => {
      if (val.includes('scammer') || val.includes('paytm') || val.includes('quishing')) {
        this.simState.resultType = 'quishing';
      } else if (val.includes('bit.ly') || val.includes('refund') || val.includes('urgent') || val.includes('smishing')) {
        this.simState.resultType = 'smishing';
      } else {
        this.simState.resultType = 'clean';
      }

      this.simState.isAnalyzing = false;
      if (btn) {
        btn.innerHTML = '<span>Run Threat Pipeline ➔</span>';
        btn.style.opacity = '1';
      }

      this.renderTelemetry();
      this.showToast('Multi-Agent analysis completed. Telemetry updated.');
    }, 450);
  }

  generateFallbackEmailData(type) {
    const txId = `TX-SEC-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString().replace('T', ' ').substr(0, 19) + ' UTC';

    if (type === 'clean') {
      return {
        agent_id: 'AGENT-05-EMAIL-DISPATCHER',
        status: 'SENT',
        dispatch_ms: 12.4,
        customer_email: {
          recipient: 'corp.treasury@enterprise-client.com',
          sender: 'ProPay Security & Clearance <alerts@security.propay.bank>',
          subject: `Payment Cleared: ₹50,000 to HDFC Bank Treasury (${txId})`,
          headline: 'Transaction Finalized & Cleared via FedNow Rail',
          severity: 'SAFE',
          badge_color: '#10B981',
          body_intro: 'Your institutional payment instruction of ₹50,000 has been verified and cleared in 18.0ms through the Drools fast-path engine.',
          discrepancy_note: 'Settlement Rail: FedNow / ISO-20022 Verified\nPayee VPA: hdfc.corporate@hdfcbank\nDrools Whitelist Check: 100% Pass',
          action_required: 'This transaction is finalized. Zero further action required.',
          cta_label: 'Download Settlement Invoice',
          tx_id: txId,
          timestamp: now,
          worm_hash: `SHA256-${Math.random().toString(16).substr(2, 12).toUpperCase()}`
        },
        soc_email: {
          recipient: 'soc-fraud-ops@propay.bank',
          sender: 'ProPay Multi-Agent Mesh <orchestrator@agent.propay.bank>',
          subject: `[CLEAN TRANSACTION] Payment Cleared: ₹50,000 (${txId})`,
          tx_id: txId,
          timestamp: now,
          threat_type: 'CLEAN_PAYMENT',
          inline_rule: 'INSTITUTIONAL_WHITELIST_MATCH',
          ollama_dossier: 'Bypassed to preserve sub-38ms wire speed.',
          sar_status: 'NOT REQUIRED (CLEAN)',
          dispatch_status: 'DISPATCHED_SMTP_TLS'
        }
      };
    } else if (type === 'quishing') {
      return {
        agent_id: 'AGENT-05-EMAIL-DISPATCHER',
        status: 'SENT',
        dispatch_ms: 16.2,
        customer_email: {
          recipient: 'victim.user@corp-client.com',
          sender: 'ProPay Security Defense <alerts@security.propay.bank>',
          subject: `URGENT: Payment Attempt Blocked - Tampered QR Detected (${txId})`,
          headline: 'Unauthorized Payment Intercepted at Edge',
          severity: 'CRITICAL',
          badge_color: '#EF4444',
          body_intro: 'Our multi-agent defense system intercepted a payment attempt of ₹3,500 because physical QR sticker tampering was detected at the terminal.',
          discrepancy_note: 'Claimed Merchant: HDFC Official Merchant\nActual Payee Wallet: scammer_wallet@paytm (Unverified External Wallet)\nAttack Signature: Point-of-sale physical sticker overlay attack.',
          action_required: 'No funds have been debited from your bank account. Your account remains completely secure.',
          cta_label: 'Review Incident Dossier & Confirm Identity',
          tx_id: txId,
          timestamp: now,
          worm_hash: `SHA256-${Math.random().toString(16).substr(2, 12).toUpperCase()}`
        },
        soc_email: {
          recipient: 'soc-fraud-ops@propay.bank',
          sender: 'ProPay Multi-Agent Mesh <orchestrator@agent.propay.bank>',
          subject: `[CRITICAL SOC ESCALATION] Quishing Intercept on Terminal POS-481 (${txId})`,
          tx_id: txId,
          timestamp: now,
          threat_type: 'PHYSICAL_QUISHING_ATTACK',
          inline_rule: 'PAYEE_AUTHORITY_MISMATCH',
          ollama_dossier: 'CRITICAL QUISHING THREAT: Display metadata claims HDFC Official Merchant, but underlying settlement resolves to scammer_wallet@paytm.',
          sar_status: 'AUTO-FILED (FINCEN SAR READY)',
          dispatch_status: 'DISPATCHED_SMTP_TLS'
        }
      };
    } else {
      return {
        agent_id: 'AGENT-05-EMAIL-DISPATCHER',
        status: 'SENT',
        dispatch_ms: 14.8,
        customer_email: {
          recipient: 'targeted.employee@corp-client.com',
          sender: 'ProPay Security Defense <alerts@security.propay.bank>',
          subject: `SECURITY ALERT: Deceptive Link Intercepted (${txId})`,
          headline: 'Deceptive Phishing Link Quarantined',
          severity: 'HIGH',
          badge_color: '#F59E0B',
          body_intro: 'A deceptive link (bit.ly/bank-urgent-security-refund) attempting reverse-collect credential harvesting was blocked by the ProPay API perimeter.',
          discrepancy_note: 'Resolved URL: http://hdfc-security-refund.xyz/auth\nDomain Registration: < 24 hours old\nLinguistic Intent: False urgency credential trap.',
          action_required: 'Never approve unexpected UPI reverse collect requests or enter PINs on external URLs.',
          cta_label: 'View Domain Quarantine Report',
          tx_id: txId,
          timestamp: now,
          worm_hash: `SHA256-${Math.random().toString(16).substr(2, 12).toUpperCase()}`
        },
        soc_email: {
          recipient: 'soc-fraud-ops@propay.bank',
          sender: 'ProPay Multi-Agent Mesh <orchestrator@agent.propay.bank>',
          subject: `[HIGH SOC ESCALATION] Reverse-Collect Phishing Neutralized (${txId})`,
          tx_id: txId,
          timestamp: now,
          threat_type: 'UNSOLICITED_SMISHING_LINK',
          inline_rule: 'DOMAIN_AGE_SUSPICIOUS',
          ollama_dossier: 'Linguistic analysis confirmed social engineering credential harvester pretending to offer bank security refund.',
          sar_status: 'AUTO-FILED (FINCEN SAR READY)',
          dispatch_status: 'DISPATCHED_SMTP_TLS'
        }
      };
    }
  }

  buildJuspaySheetHTML(orderData) {
    const isSafe = orderData.isSafe;
    return `
      <div class="juspay-sheet-card">
        <div class="juspay-sheet-header">
          <div class="juspay-brand">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;">
              <rect x="2" y="5" width="20" height="14" rx="2"/>
              <line x1="2" y1="10" x2="22" y2="10"/>
            </svg>
            <span>PROPAY HYPERSWITCH // PAYMENT AGGREGATION INTENT</span>
          </div>
          <div class="juspay-amount-pill">
            ${orderData.amount ? '₹' + orderData.amount : 'N/A'}
          </div>
        </div>

        <div class="juspay-sheet-body">
          <div class="juspay-info-item">
            <span class="juspay-label">Order Identifier</span>
            <span class="juspay-value">${orderData.orderId}</span>
          </div>
          <div class="juspay-info-item">
            <span class="juspay-label">Claimed Merchant</span>
            <span class="juspay-value">${orderData.merchantName || 'Direct Intent'}</span>
          </div>
          <div class="juspay-info-item">
            <span class="juspay-label">Target Settlement VPA / URI</span>
            <span class="juspay-value ${isSafe ? 'safe' : 'danger'}"><code>${orderData.payee}</code></span>
          </div>
          <div class="juspay-info-item">
            <span class="juspay-label">Ingress Channel</span>
            <span class="juspay-value">${orderData.channel}</span>
          </div>
          <div class="juspay-info-item">
            <span class="juspay-label">Payee Verification</span>
            <span class="juspay-value ${isSafe ? 'safe' : 'danger'}">
              ${isSafe ? '✓ Institutional Rail Match' : 'MISMATCH: Physical QR Sticker Tampering'}
            </span>
          </div>
          <div class="juspay-info-item">
            <span class="juspay-label">Aggregator Verdict</span>
            <span class="juspay-value ${isSafe ? 'safe' : 'danger'}">
              ${isSafe ? 'CLEARED & SETTLED (<38ms)' : 'INTERCEPTED & FROZEN AT EDGE'}
            </span>
          </div>
        </div>
      </div>
    `;
  }

  buildPaymentPipelineHTML(stages) {
    if (!stages || !stages.length) return '';

    const stageCards = stages.map((s, idx) => {
      let cardClass = 'stage-pass';
      let badgeClass = 'ok';

      if (s.status === 'FLAGGED') {
        cardClass = 'stage-held';
        badgeClass = 'flagged';
      } else if (s.status === 'THREAT' || s.status === 'FROZEN' || s.status === 'INTERCEPT_AND_BLOCK' || s.status === 'FREEZE_AND_WARN' || s.status === 'HELD') {
        cardClass = 'stage-threat';
        badgeClass = 'threat';
      } else if (s.channel === 'OLLAMA_ON_PREM') {
        cardClass = 'stage-purple';
        badgeClass = 'purple';
      }

      return `
        <div class="flow-stage-card ${cardClass}">
          <div class="stage-top-row">
            <span class="stage-name">${idx + 1}. ${s.stage}</span>
            <span class="stage-status-badge ${badgeClass}">${s.status}</span>
          </div>
          <div class="stage-details">${s.details}</div>
          <div class="stage-footer-row">
            <span>${s.channel}</span>
            <span>${typeof s.latency_ms === 'number' ? s.latency_ms.toFixed(1) + 'ms' : s.latency_ms}</span>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="payment-pipeline-wrap">
        <div class="pipeline-header">
          <div class="pipeline-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;color:var(--accent-primary);">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <span>Juspay-Style Payment Lifecycle Pipeline (End-to-End Orchestration)</span>
          </div>
          <div class="badge-pill lime">9 REAL-TIME STAGES</div>
        </div>
        <div class="pipeline-grid">
          ${stageCards}
        </div>
      </div>
    `;
  }

  renderApiTelemetry(data) {
    const container = document.getElementById('telemetry-output');
    if (!container) return;

    const edge = data.edge_sector_1 || {};
    const inline = data.inline_fast_path || {};
    const ollama = data.ollama_sector_2 || {};
    const action = data.action_sector_3 || {};
    const email = data.email_sector_4 || this.generateFallbackEmailData(action.is_fraud ? (edge.threat_type || 'quishing') : 'clean');
    this.simState.emailData = email;

    const isSafe = !action.is_fraud;
    const orderData = {
      orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      merchantName: edge.pn || (isSafe ? 'HDFC Bank Treasury' : 'HDFC Official Merchant'),
      payee: edge.pa || edge.resolved_url || edge.raw,
      amount: edge.am || (isSafe ? '50,000' : '3,500'),
      channel: edge.threat_type ? edge.threat_type.toUpperCase() : 'UPI_QR',
      isSafe: isSafe
    };

    const juspaySheetHTML = this.buildJuspaySheetHTML(orderData);
    const pipelineHTML = this.buildPaymentPipelineHTML(data.payment_flow_stages);

    container.innerHTML = `
      ${juspaySheetHTML}
      ${pipelineHTML}

      <div class="telemetry-step-card">
        <span class="step-tag red">AGENT 01 [INGRESS]</span>
        <span>Extracted: <code>${edge.pa || edge.resolved_url || edge.raw}</code> | Name: <code>${edge.pn || 'N/A'}</code></span>
        <span class="step-tag lime" style="font-size: 11px;">${edge.edge_latency_ms || 2.1}ms</span>
      </div>
      <div class="telemetry-step-card">
        <span class="step-tag indigo">AGENT 02 [FAST-PATH]</span>
        <span>Drools Verdict: <code>${inline.rule_matched}</code> | Tabular Risk Score: <code>${inline.risk_score}</code></span>
        <span class="step-tag indigo" style="font-size: 11px;">${inline.latency_ms}ms</span>
      </div>
      <div class="telemetry-step-card">
        <span class="step-tag purple">AGENT 03 [OLLAMA]</span>
        <span>Cognitive Agent: <code>${ollama.ollama_active ? 'Live Ollama Model (' + ollama.model + ')' : 'On-Prem Autonomous Synthesis'}</code></span>
        <span class="step-tag purple" style="font-size: 11px;">${ollama.latency_sec}s (Async)</span>
      </div>
      <div class="telemetry-step-card">
        <span class="step-tag ${isSafe ? 'green' : 'red'}">AGENT 04 [ENFORCE]</span>
        <span>Enforcement: <code>${action.verdict}</code></span>
        <span class="step-tag ${isSafe ? 'green' : 'red'}" style="font-size: 11px;">${isSafe ? 'CLEARED' : 'INTERCEPTED'}</span>
      </div>
      <div class="telemetry-step-card" style="border-left: 3px solid #84CC16; padding-left: 12px;">
        <span class="step-tag lime">AGENT 05 [EMAIL ALERT]</span>
        <span>Contextual Dispatch: <code>${email.customer_email.subject}</code></span>
        <button class="btn-email-alert-trigger" style="padding: 4px 12px; font-size: 11px;" onclick="window.proPayApp.openModal('modal-email-alert')">
          View Generated Email ↗
        </button>
      </div>

      <div class="dossier-card">
        <div class="dossier-title-bar">
          <span class="step-tag purple">OLLAMA FORENSIC CASE DOSSIER (ON-PREM PRIVATE REASONING)</span>
          <span class="step-tag ${isSafe ? 'green' : 'red'}">CONFIDENCE: ${(ollama.confidence * 100).toFixed(1)}%</span>
        </div>
        <div class="dossier-text-body">${ollama.forensic_dossier}</div>
      </div>

      <div class="verdict-banner-card ${isSafe ? 'safe' : 'danger'}">
        <span>${isSafe ? 'TRANSACTION AUTHORIZED: Institutional settlement rail verified.' : 'THREAT INTERCEPTED: Malicious payload neutralized at edge. Transfer frozen.'}</span>
        <span class="badge-pill ${isSafe ? 'lime' : 'danger'}">${isSafe ? 'TOTAL SLA: ' + inline.latency_ms + 'ms' : 'FinCEN SAR Auto-Drafted'}</span>
      </div>
    `;
  }

  renderTelemetry() {
    const container = document.getElementById('telemetry-output');
    if (!container) return;

    const type = this.simState.resultType;
    const email = this.generateFallbackEmailData(type);
    this.simState.emailData = email;

    const isSafe = type === 'clean';
    const orderData = {
      orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      merchantName: type === 'clean' ? 'HDFC Bank Treasury' : (type === 'quishing' ? 'HDFC Official Merchant' : 'Urgent Security Desk'),
      payee: type === 'clean' ? 'hdfc.corporate@hdfcbank' : (type === 'quishing' ? 'scammer_wallet@paytm' : 'http://hdfc-security-refund.xyz/auth'),
      amount: type === 'clean' ? '50,000' : (type === 'quishing' ? '3,500' : '9,999'),
      channel: type === 'clean' ? 'FEDNOW_WIRE' : (type === 'quishing' ? 'UPI_QR_INTENT' : 'SMS_DEEP_LINK'),
      isSafe: isSafe
    };

    const fallbackStages = [
      {
        stage: "PAYMENT_INITIATED",
        status: "OK",
        latency_ms: 0.3,
        details: `Customer intent received: ${orderData.merchantName} | Amount: ₹${orderData.amount}`,
        channel: orderData.channel
      },
      {
        stage: "KAFKA_INGESTED",
        status: "OK",
        latency_ms: 1.2,
        details: "Topic: fraud-ingress-topic | Partition: 4 | Offset: 582103",
        channel: "KAFKA_CLUSTER"
      },
      {
        stage: "GATEWAY_ROUTED",
        status: "OK",
        latency_ms: 2.1,
        details: `Decoded via Envoy WASM Edge. Payee=${orderData.payee}`,
        channel: "ENVOY_PROXY"
      },
      {
        stage: "RISK_SCORED",
        status: isSafe ? "PASS" : "FLAGGED",
        latency_ms: isSafe ? 16.2 : 22.4,
        details: isSafe ? "Drools: INSTITUTIONAL_WHITELIST_MATCH (Score: 0.01)" : "Drools: PAYEE_AUTHORITY_MISMATCH (Score: 0.98)",
        channel: "DROOLS_LIGHTGBM"
      },
      {
        stage: isSafe ? "OLLAMA_BYPASSED" : "OLLAMA_ANALYZED",
        status: isSafe ? "CLEAN" : "THREAT",
        latency_ms: isSafe ? 0.0 : 1240.0,
        details: isSafe ? "Bypassed for wire speed (<38ms)" : "Llama 3: Quishing sticker overlay signature detected (99.4%)",
        channel: "OLLAMA_ON_PREM"
      },
      {
        stage: isSafe ? "BANK_SWITCH_CLEARED" : "BANK_SWITCH_HELD",
        status: isSafe ? "CLEARED" : "HELD",
        latency_ms: 1.1,
        details: isSafe ? "Settlement switch: FedNow verified" : "Settlement: FROZEN -- Payee VPA quarantined",
        channel: "SETTLEMENT_SWITCH"
      },
      {
        stage: "ENFORCEMENT_ACTION",
        status: isSafe ? "ALLOW" : "FREEZE_AND_WARN",
        latency_ms: 1.2,
        details: isSafe ? "Zero customer friction. Funds released." : "Dynamic in-app glass warning injected on mobile glass",
        channel: "POLICY_ARBITER"
      },
      {
        stage: "EMAIL_DISPATCHED",
        status: "SENT",
        latency_ms: 14.8,
        details: `Dispatched to: ${email.customer_email.recipient}`,
        channel: "SMTP_TLS"
      },
      {
        stage: isSafe ? "SETTLEMENT_COMPLETE" : "TRANSACTION_FROZEN",
        status: isSafe ? "SETTLED" : "FROZEN",
        latency_ms: 0.5,
        details: isSafe ? "Institutional rail settlement completed. WORM audit sealed." : "FinCEN SAR auto-drafted. Zero customer debit.",
        channel: "LEDGER_WORM"
      }
    ];

    const juspaySheetHTML = this.buildJuspaySheetHTML(orderData);
    const pipelineHTML = this.buildPaymentPipelineHTML(fallbackStages);

    if (type === 'clean') {
      container.innerHTML = `
        ${juspaySheetHTML}
        ${pipelineHTML}

        <div class="telemetry-step-card">
          <span class="step-tag red">AGENT 01 [INGRESS]</span>
          <span>QR URI Decoded: <code>pa=hdfc.corporate@hdfcbank</code> | Display Name: <code>HDFC Bank Treasury</code></span>
          <span class="step-tag lime" style="font-size: 11px;">1.8ms</span>
        </div>
        <div class="telemetry-step-card">
          <span class="step-tag indigo">AGENT 02 [FAST-PATH]</span>
          <span>Drools Institutional Whitelist: <code>MATCHED</code> | Tabular Risk Score: <code>0.01 (Safe)</code></span>
          <span class="step-tag indigo" style="font-size: 11px;">16.2ms</span>
        </div>
        <div class="telemetry-step-card">
          <span class="step-tag purple">AGENT 03 [OLLAMA]</span>
          <span>LLM Cognitive Reasoning: <code>BYPASSED (Trusted Payee in Whitelist -- sub-38ms wire speed preserved)</code></span>
          <span class="step-tag slate" style="font-size: 11px;">0.0ms</span>
        </div>
        <div class="telemetry-step-card">
          <span class="step-tag green">AGENT 04 [ENFORCE]</span>
          <span>Policy Arbiter Decision: <code>ALLOW TRANSACTION</code> (Zero customer friction / funds cleared)</span>
          <span class="step-tag green" style="font-size: 11px;">CLEARED</span>
        </div>
        <div class="telemetry-step-card" style="border-left: 3px solid #84CC16; padding-left: 12px;">
          <span class="step-tag lime">AGENT 05 [EMAIL ALERT]</span>
          <span>Confirmation Dispatched: <code>Payment Cleared: ₹50,000 to HDFC Bank Treasury</code></span>
          <button class="btn-email-alert-trigger" style="padding: 4px 12px; font-size: 11px;" onclick="window.proPayApp.openModal('modal-email-alert')">
            View Generated Email ↗
          </button>
        </div>

        <div class="verdict-banner-card safe">
          <span>TRANSACTION AUTHORIZED: Verified Tier-1 Institutional Settlement Rail. Zero threat detected.</span>
          <span class="badge-pill lime">TOTAL SLA: 18.0ms</span>
        </div>
      `;
      return;
    }

    if (type === 'quishing') {
      container.innerHTML = `
        ${juspaySheetHTML}
        ${pipelineHTML}

        <div class="telemetry-step-card">
          <span class="step-tag red">AGENT 01 [INGRESS]</span>
          <span>QR Intent Extracted: <code>pa=scammer_wallet@paytm</code> | Claimed Display Name: <code>HDFC Official Merchant</code></span>
          <span class="step-tag lime" style="font-size: 11px;">2.2ms</span>
        </div>
        <div class="telemetry-step-card">
          <span class="step-tag indigo">AGENT 02 [FAST-PATH]</span>
          <span>Drools Policy Flag: Claimed merchant authority <code>HDFC</code> diverges from settlement rail <code>@paytm</code>.</span>
          <span class="step-tag indigo" style="font-size: 11px;">22.4ms</span>
        </div>
        <div class="telemetry-step-card">
          <span class="step-tag purple">AGENT 03 [OLLAMA]</span>
          <span>Ollama On-Prem Cluster (Llama 3): Asynchronously executed Payee Mismatch Heuristics.</span>
          <span class="step-tag purple" style="font-size: 11px;">1.24s (Async)</span>
        </div>
        <div class="telemetry-step-card">
          <span class="step-tag red">AGENT 04 [ENFORCE]</span>
          <span>Adaptive Interception: <code>FREEZE TRANSACTION &amp; TRIGGER DYNAMIC IN-APP GLASS WARNING</code></span>
          <span class="step-tag red" style="font-size: 11px;">BLOCKED</span>
        </div>
        <div class="telemetry-step-card" style="border-left: 3px solid #84CC16; padding-left: 12px;">
          <span class="step-tag lime">AGENT 05 [EMAIL ALERT]</span>
          <span>Urgent Alert Dispatched: <code>Payment Attempt Blocked -- Tampered QR Detected</code></span>
          <button class="btn-email-alert-trigger" style="padding: 4px 12px; font-size: 11px;" onclick="window.proPayApp.openModal('modal-email-alert')">
            View Generated Email ↗
          </button>
        </div>

        <div class="dossier-card">
          <div class="dossier-title-bar">
            <span class="step-tag purple">OLLAMA FORENSIC CASE DOSSIER (ON-PREM PRIVATE REASONING)</span>
            <span class="step-tag red">CONFIDENCE: 99.4%</span>
          </div>
          <div class="dossier-text-body">CRITICAL QUISHING THREAT IDENTIFIED: Severe Payee Entity Discrepancy.
The QR display metadata explicitly claims 'HDFC Official Merchant', but the underlying settlement address resolves to an unverified individual wallet ('scammer_wallet@paytm') with 0 prior corporate history.

This signature strongly matches a physical QR sticker replacement attack on point-of-sale terminals.
RECOMMENDED ACTION: Freeze payment immediately. Trigger in-app warning on customer device. Dispatch alert to merchant fraud team.</div>
        </div>

        <div class="verdict-banner-card danger">
          <span>DYNAMIC IN-APP INTERCEPTION: Customer presented with warning overlay. Payment stopped at edge.</span>
          <span class="badge-pill danger">FinCEN SAR Auto-Drafted</span>
        </div>
      `;
      return;
    }

    if (type === 'smishing') {
      container.innerHTML = `
        ${juspaySheetHTML}
        ${pipelineHTML}

        <div class="telemetry-step-card">
          <span class="step-tag red">AGENT 01 [INGRESS]</span>
          <span>Short Link Unrolled: <code>bit.ly/bank-urgent-security-refund</code> ➔ Resolves to <code>http://hdfc-security-refund.xyz/auth</code></span>
          <span class="step-tag lime" style="font-size: 11px;">4.6ms</span>
        </div>
        <div class="telemetry-step-card">
          <span class="step-tag indigo">AGENT 02 [FAST-PATH]</span>
          <span>Drools Domain Age Rule: Domain registered &lt; 24 hours ago. Untrusted TLD (.xyz). Risk score: 0.96.</span>
          <span class="step-tag indigo" style="font-size: 11px;">29.8ms</span>
        </div>
        <div class="telemetry-step-card">
          <span class="step-tag purple">AGENT 03 [OLLAMA]</span>
          <span>Ollama On-Prem Cluster (Llama 3): Linguistic and Social Engineering Intent Analysis.</span>
          <span class="step-tag purple" style="font-size: 11px;">1.10s (Async)</span>
        </div>
        <div class="telemetry-step-card">
          <span class="step-tag red">AGENT 04 [ENFORCE]</span>
          <span>Adaptive Interception: <code>HARD REVERSE DOMAIN BLOCK &amp; REVERSE COLLECT REJECT</code></span>
          <span class="step-tag red" style="font-size: 11px;">INTERCEPTED</span>
        </div>
        <div class="telemetry-step-card" style="border-left: 3px solid #84CC16; padding-left: 12px;">
          <span class="step-tag lime">AGENT 05 [EMAIL ALERT]</span>
          <span>Security Alert Dispatched: <code>Deceptive Link Intercepted &amp; Quarantined</code></span>
          <button class="btn-email-alert-trigger" style="padding: 4px 12px; font-size: 11px;" onclick="window.proPayApp.openModal('modal-email-alert')">
            View Generated Email ↗
          </button>
        </div>

        <div class="dossier-card">
          <div class="dossier-title-bar">
            <span class="step-tag purple">OLLAMA FORENSIC CASE DOSSIER (ON-PREM PRIVATE REASONING)</span>
            <span class="step-tag red">CONFIDENCE: 98.7%</span>
          </div>
          <div class="dossier-text-body">SOCIAL ENGINEERING &amp; REVERSE-COLLECT TRAP DETECTED:
The unsolicited link incorporates deceptive urgency ('Urgent security refund') combined with a lookalike domain simulating bank infrastructure ('hdfc-security-refund.xyz').

Ollama semantic analysis classifies this payload as a phishing credential harvester designed to trick users into approving reverse UPI collect requests.
RECOMMENDED ACTION: Ingress URL blocked in perimeter API gateway. Dispatched to automated domain takedown service.</div>
        </div>

        <div class="verdict-banner-card danger">
          <span>UNSOLICITED LINK INTERCEPTED: Link quarantined. Zero customer credentials compromised.</span>
          <span class="badge-pill danger">Zero Cloud PII Leakage</span>
        </div>
      `;
      return;
    }
  }

  openEmailModal() {
    this.openModal('modal-email-alert');
    this.renderEmailModalContent();
  }

  switchEmailView(viewType) {
    this.simState.activeEmailTab = viewType;
    const btnCust = document.getElementById('btn-email-customer');
    const btnSoc = document.getElementById('btn-email-soc');
    if (btnCust && btnSoc) {
      btnCust.classList.toggle('active', viewType === 'customer');
      btnSoc.classList.toggle('active', viewType === 'soc');
    }
    this.renderEmailModalContent();
  }

  renderEmailModalContent() {
    const container = document.getElementById('email-client-container');
    if (!container) return;

    if (!this.simState.emailData) {
      this.simState.emailData = this.generateFallbackEmailData(this.simState.resultType);
    }

    const data = this.simState.emailData;
    const isCustomer = this.simState.activeEmailTab === 'customer';

    if (isCustomer) {
      const em = data.customer_email;
      container.innerHTML = `
        <div class="email-meta-header">
          <div class="email-meta-line"><strong>From:</strong> <span>${em.sender}</span></div>
          <div class="email-meta-line"><strong>To:</strong> <span>${em.recipient}</span></div>
          <div class="email-meta-line"><strong>Subject:</strong> <span style="font-weight:700;">${em.subject}</span></div>
          <div class="email-meta-line"><strong>Security:</strong> <span style="color:#10B981; font-family:var(--font-mono); font-size:11px;">✓ TLS 1.3 · SPF Pass · DKIM Verified · ${em.worm_hash}</span></div>
        </div>
        <div class="email-body-sheet">
          <div class="email-brand-title">
            <span style="font-weight:800; font-size:16px;">PROPAY BANKING SECURITY</span>
            <span class="email-badge-status" style="background:${em.badge_color}22; color:${em.badge_color}; border:1px solid ${em.badge_color};">
              ${em.severity} PRIORITY
            </span>
          </div>

          <h3 class="email-subject-headline">${em.headline}</h3>
          <p class="email-narrative-intro">${em.body_intro}</p>

          <div class="email-details-card">${em.discrepancy_note}</div>

          <p style="font-size:13px; font-weight:600; margin-bottom:18px; color:var(--text-main);">${em.action_required}</p>

          <div class="email-action-row">
            <button class="btn-email-action-primary" onclick="window.proPayApp.showToast('Security action registered in immutable audit log.')">${em.cta_label}</button>
            <button class="btn-email-action-secondary" onclick="window.proPayApp.showToast('Reported to Fraud Desk.')">Report False Alarm</button>
          </div>

          <div class="email-legal-footer">
            Transaction ID: <code>${em.tx_id}</code> | Timestamp: ${em.timestamp}<br/>
            This is an automated regulatory notification synthesized by ProPay Agent 05 (Ollama Mailer) under FinCEN WORM compliance requirements.
          </div>
        </div>
      `;
    } else {
      const soc = data.soc_email;
      container.innerHTML = `
        <div class="email-meta-header">
          <div class="email-meta-line"><strong>From:</strong> <span>${soc.sender}</span></div>
          <div class="email-meta-line"><strong>To:</strong> <span>${soc.recipient}</span></div>
          <div class="email-meta-line"><strong>Subject:</strong> <span style="font-weight:700; color:#EF4444;">${soc.subject}</span></div>
          <div class="email-meta-line"><strong>Routing:</strong> <span style="font-family:var(--font-mono); font-size:11px;">INTERNAL SOC ENCLAVE · WORM STORAGE ACTIVE</span></div>
        </div>
        <div class="email-body-sheet">
          <div class="email-brand-title">
            <span style="font-weight:800; font-size:16px;">BANK SOC INCIDENT ESCALATION TICKET</span>
            <span class="email-badge-status" style="background:#EF444422; color:#EF4444; border:1px solid #EF4444;">
              ${soc.sar_status}
            </span>
          </div>

          <div class="email-details-card" style="background:var(--bg-card); border-left:4px solid var(--accent-purple);">
INCIDENT METRICS &amp; MULTI-AGENT TELEMETRY:
• Incident Reference: ${soc.tx_id}
• Threat Classification: ${soc.threat_type}
• Fast-Path Trigger Rule: ${soc.inline_rule}
• Dispatch Protocol: ${soc.dispatch_status}
• FinCEN SAR Status: ${soc.sar_status}

OLLAMA COGNITIVE DOSSIER (Llama 3 On-Prem VPC):
${soc.ollama_dossier}
          </div>

          <div class="email-action-row">
            <button class="btn-email-action-primary" style="background:#EF4444;" onclick="window.proPayApp.showToast('Terminal blacklisted across all banking switches.')">Lock Terminal &amp; Freeze Payee VPA</button>
            <button class="btn-email-action-secondary" onclick="window.proPayApp.showToast('SAR filing transmitted to FinCEN gateway.')">Transmit FinCEN SAR Filing</button>
          </div>

          <div class="email-legal-footer">
            Immutable Audit Trail Hash: <code>WORM-SAR-${Math.random().toString(16).substr(2, 10).toUpperCase()}</code><br/>
            Escalated to Tier-2 Security Analyst Pool. SLA resolution target &lt; 2 minutes.
          </div>
        </div>
      `;
    }
  }

  startFeedTicker() {
    const tbody = document.getElementById('feed-tbody');
    if (!tbody) return;

    const initialFeed = [
      { id: 'TX-84021', channel: 'Mobile QR Scan', payee: 'amazon.pay@axisbank', sla: '19.4ms', ollama: 'Bypassed (Safe)', email: 'DISPATCHED', action: 'ALLOW', safe: true },
      { id: 'TX-84022', channel: 'FedNow Wire', payee: 'jpmorgan.corp@fednow', sla: '24.1ms', ollama: 'Bypassed (Safe)', email: 'DISPATCHED', action: 'ALLOW', safe: true },
      { id: 'TX-84023', channel: 'POS Terminal QR', payee: 'tampered_qr4@paytm', sla: '38.2ms', ollama: 'Ollama Flaggable', email: 'ALERT SENT', action: 'BLOCK & WARN', safe: false },
      { id: 'TX-84024', channel: 'SMS Link Ingress', payee: 'bit.ly/kyc-urgent-update', sla: '31.5ms', ollama: 'Ollama Intercept', email: 'ALERT SENT', action: 'INTERCEPTED', safe: false },
      { id: 'TX-84025', channel: 'Card Rails (SWIFT)', payee: 'apple.store@chase', sla: '17.8ms', ollama: 'Bypassed (Safe)', email: 'DISPATCHED', action: 'ALLOW', safe: true }
    ];

    tbody.innerHTML = initialFeed.map(r => this.buildFeedRowHTML(r)).join('');

    // Stream new rows every 3.5 seconds
    setInterval(() => {
      this.txCounter++;
      const isRisk = Math.random() < 0.25;
      const channels = ['Mobile QR Scan', 'POS Terminal QR', 'SMS Link Ingress', 'FedNow Wire', 'Card Rails'];
      const payeesSafe = ['starbucks.in@hdfc', 'uber.payments@icici', 'netflix.sub@citi', 'grocery.pos@sbi'];
      const payeesRisk = ['scam_reward@paytm', 'bit.ly/cashback-claim-99', 'fake_qr_pump@upi'];

      const channel = channels[Math.floor(Math.random() * channels.length)];
      const payee = isRisk ? payeesRisk[Math.floor(Math.random() * payeesRisk.length)] : payeesSafe[Math.floor(Math.random() * payeesSafe.length)];
      const sla = `${(15 + Math.random() * 20).toFixed(1)}ms`;
      const ollama = isRisk ? 'Ollama Flagged' : 'Bypassed (Safe)';
      const action = isRisk ? 'BLOCK & WARN' : 'ALLOW';
      const email = isRisk ? 'ALERT SENT' : 'DISPATCHED';

      const row = {
        id: `TX-${this.txCounter}`,
        channel,
        payee,
        sla,
        ollama,
        email,
        action,
        safe: !isRisk
      };

      const tr = document.createElement('tr');
      tr.innerHTML = this.buildFeedRowHTML(row, false);

      if (tbody.firstChild) {
        tbody.insertBefore(tr, tbody.firstChild);
      } else {
        tbody.appendChild(tr);
      }

      if (tbody.children.length > 8) {
        tbody.removeChild(tbody.lastChild);
      }
    }, 3500);
  }

  buildFeedRowHTML(row, wrapTr = true) {
    const inner = `
      <td style="font-weight: 700; color: var(--text-main);">${row.id}</td>
      <td>${row.channel}</td>
      <td><code>${row.payee}</code></td>
      <td style="font-weight: 600; color: var(--accent-primary);">${row.sla}</td>
      <td style="color: ${row.safe ? 'var(--text-muted)' : 'var(--accent-purple)'}; font-weight: 600;">${row.ollama}</td>
      <td><span class="badge-pill ${row.safe ? 'lime' : 'danger'}" style="cursor:pointer;" onclick="window.proPayApp.openModal('modal-email-alert')">${row.email}</span></td>
      <td>
        <span class="badge-pill ${row.safe ? 'safe' : 'danger'}">
          ${row.action}
        </span>
      </td>
    `;
    return wrapTr ? `<tr>${inner}</tr>` : inner;
  }

  openModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add('active');
    if (id === 'modal-email-alert') {
      this.renderEmailModalContent();
    }
  }

  closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove('active');
  }

  showToast(text) {
    const shelf = document.getElementById('toast-shelf');
    if (!shelf) return;

    const toast = document.createElement('div');
    toast.className = 'toast-item';
    toast.textContent = text;

    shelf.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'all 200ms ease';
      setTimeout(() => toast.remove(), 250);
    }, 2600);
  }
}

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.proPayApp = new ProPayApp();
});
