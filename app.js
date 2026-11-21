/**
 * PROPAY — Pirate Wires × pleasecallmechamp.com × Motion.dev Engine
 * Real-Time Banking Fraud & Cognitive Quishing Defense Agent
 */

class ProPayApp {
  constructor() {
    this.simState = {
      activePreset: 'quishing',
      payload: 'upi://pay?pa=scammer_wallet@paytm&pn=HDFC%20Official%20Merchant&am=3500',
      resultType: 'quishing',
      isAnalyzing: false
    };

    this.txCounter = 8402;
    this.init();
  }

  init() {
    this.renderTelemetry();
    this.startFeedTicker();
    this.bindEvents();
  }

  bindEvents() {
    // Escape key closes modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop.active').forEach(m => m.classList.remove('active'));
      }
    });

    // Click outside modal box closes it
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
      });
    });
  }

  scrollTo(sectionId) {
    const el = document.getElementById(`section-${sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  resetView() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.showToast('ProPay Dispatch reset to masthead origin.');
  }

  loadPreset(presetType) {
    this.simState.activePreset = presetType;
    this.simState.resultType = presetType;

    const input = document.getElementById('sim-input');
    const pills = document.querySelectorAll('.preset-pill');

    pills.forEach(p => p.classList.remove('active'));
    const targetPill = document.getElementById(`btn-p-${presetType}`);
    if (targetPill) targetPill.classList.add('active');

    if (presetType === 'clean') {
      this.simState.payload = 'upi://pay?pa=hdfc.corporate@hdfcbank&pn=HDFC%20Bank%20Treasury&am=50000';
    } else if (presetType === 'quishing') {
      this.simState.payload = 'upi://pay?pa=scammer_wallet@paytm&pn=HDFC%20Official%20Merchant&am=3500';
    } else if (presetType === 'smishing') {
      this.simState.payload = 'https://bit.ly/bank-urgent-security-refund';
    }

    if (input) input.value = this.simState.payload;
    this.renderTelemetry();
    this.showToast(`Loaded Preset: ${presetType.toUpperCase()}`);
  }

  executeSimulation() {
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
      btn.innerHTML = '<span>⚡ QUERYING OLLAMA CLUSTER...</span>';
      btn.style.opacity = '0.75';
    }

    const container = document.getElementById('telemetry-output');
    if (container) {
      container.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--accent-volt); font-family: var(--font-mono);">
          <div class="volt-pulse" style="font-size: 22px; margin-bottom: 8px;">●</div>
          <div>DISPATCHING THROUGH 3 SECTORS // INFERENCING ON-PREMISE OLLAMA CLUSTER...</div>
        </div>
      `;
    }

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
        btn.innerHTML = '<span>RUN THREAT PIPELINE ➔</span>';
        btn.style.opacity = '1';
      }

      this.renderTelemetry();
      this.showToast('Threat analysis completed. Telemetry updated.');
    }, 450);
  }

  renderTelemetry() {
    const container = document.getElementById('telemetry-output');
    if (!container) return;

    const type = this.simState.resultType;

    if (type === 'clean') {
      container.innerHTML = `
        <div class="trace-step-row">
          <span class="mono-label" style="color: #F87171;">SECTOR 1 [EDGE]</span>
          <span>QR URI Decoded: <code>pa=hdfc.corporate@hdfcbank</code> | Display Name: <code>HDFC Bank Treasury</code></span>
          <span class="mono-label" style="color: var(--accent-volt);">1.8ms</span>
        </div>
        <div class="trace-step-row">
          <span class="mono-label" style="color: var(--accent-volt);">INLINE SYNC</span>
          <span>Drools Institutional Whitelist: <code>MATCHED</code> | LightGBM Tabular Risk Score: <code>0.01 (Safe)</code></span>
          <span class="mono-label" style="color: var(--accent-volt);">16.2ms</span>
        </div>
        <div class="trace-step-row">
          <span class="mono-label" style="color: #C084FC;">SECTOR 2 [OLLAMA]</span>
          <span>LLM Cognitive Reasoning: <code>BYPASSED (Trusted Payee in Whitelist — sub-38ms wire speed preserved)</code></span>
          <span class="mono-label" style="color: var(--text-slate);">0.0ms</span>
        </div>
        <div class="trace-step-row">
          <span class="mono-label" style="color: var(--state-approved);">SECTOR 3 [ACTION]</span>
          <span>Policy Arbiter Decision: <code>ALLOW TRANSACTION</code> (Zero customer friction / funds cleared)</span>
          <span class="mono-label" style="color: var(--state-approved);">CLEARED</span>
        </div>

        <div class="alert-banner safe">
          <span>✓ TRANSACTION AUTHORIZED: Verified Tier-1 Institutional Settlement Rail. Zero threat detected.</span>
          <span class="badge-pill volt">TOTAL SLA: 18.0ms</span>
        </div>
      `;
      return;
    }

    if (type === 'quishing') {
      container.innerHTML = `
        <div class="trace-step-row">
          <span class="mono-label" style="color: #F87171;">SECTOR 1 [EDGE]</span>
          <span>QR Intent Extracted: <code>pa=scammer_wallet@paytm</code> | Claimed Display Name: <code>HDFC Official Merchant</code></span>
          <span class="mono-label" style="color: var(--accent-volt);">2.2ms</span>
        </div>
        <div class="trace-step-row">
          <span class="mono-label" style="color: var(--accent-volt);">INLINE SYNC</span>
          <span>Drools Policy Flag: Claimed merchant authority <code>HDFC</code> diverges from settlement rail <code>@paytm</code>.</span>
          <span class="mono-label" style="color: var(--accent-volt);">22.4ms</span>
        </div>
        <div class="trace-step-row">
          <span class="mono-label" style="color: #C084FC;">SECTOR 2 [OLLAMA]</span>
          <span>Ollama On-Prem Cluster (Llama 3): Asynchronously executed Payee Mismatch Heuristics.</span>
          <span class="mono-label" style="color: #C084FC;">1.24s (Async)</span>
        </div>
        <div class="trace-step-row">
          <span class="mono-label" style="color: #F87171;">SECTOR 3 [ACTION]</span>
          <span>Adaptive Interception: <code>FREEZE TRANSACTION &amp; TRIGGER DYNAMIC IN-APP GLASS WARNING</code></span>
          <span class="mono-label" style="color: #F87171;">BLOCKED</span>
        </div>

        <!-- Ollama Forensic Case Dossier -->
        <div class="dossier-box">
          <div class="dossier-header">
            <span class="mono-label" style="color: #C084FC;">🦙 OLLAMA FORENSIC CASE DOSSIER (ON-PREM PRIVATE REASONING)</span>
            <span class="mono-label" style="color: #F87171;">CONFIDENCE: 99.4%</span>
          </div>
          <div class="dossier-body">🚨 CRITICAL QUISHING THREAT IDENTIFIED: Severe Payee Entity Discrepancy.
The QR display metadata explicitly claims 'HDFC Official Merchant', but the underlying settlement address resolves to an unverified individual wallet ('scammer_wallet@paytm') with 0 prior corporate history.

This signature strongly matches a physical QR sticker replacement attack on point-of-sale terminals.
RECOMMENDED ACTION: Freeze payment immediately. Trigger in-app warning on customer device. Dispatch alert to merchant fraud team.</div>
        </div>

        <div class="alert-banner danger">
          <span>⚠️ DYNAMIC IN-APP INTERCEPTION: Customer presented with warning overlay. Payment stopped at edge.</span>
          <span class="badge-pill" style="border-color: #F87171; color: #F87171;">FinCEN SAR Auto-Drafted</span>
        </div>
      `;
      return;
    }

    if (type === 'smishing') {
      container.innerHTML = `
        <div class="trace-step-row">
          <span class="mono-label" style="color: #F87171;">SECTOR 1 [EDGE]</span>
          <span>Short Link Unrolled: <code>bit.ly/bank-urgent-security-refund</code> ➔ Resolves to <code>http://hdfc-security-refund.xyz/auth</code></span>
          <span class="mono-label" style="color: var(--accent-volt);">4.6ms</span>
        </div>
        <div class="trace-step-row">
          <span class="mono-label" style="color: var(--accent-volt);">INLINE SYNC</span>
          <span>Drools Domain Age Rule: Domain registered &lt; 24 hours ago. Untrusted TLD (.xyz). Risk score: 0.96.</span>
          <span class="mono-label" style="color: var(--accent-volt);">29.8ms</span>
        </div>
        <div class="trace-step-row">
          <span class="mono-label" style="color: #C084FC;">SECTOR 2 [OLLAMA]</span>
          <span>Ollama On-Prem Cluster (Llama 3): Linguistic and Social Engineering Intent Analysis.</span>
          <span class="mono-label" style="color: #C084FC;">1.10s (Async)</span>
        </div>
        <div class="trace-step-row">
          <span class="mono-label" style="color: #F87171;">SECTOR 3 [ACTION]</span>
          <span>Adaptive Interception: <code>HARD REVERSE DOMAIN BLOCK &amp; REVERSE COLLECT REJECT</code></span>
          <span class="mono-label" style="color: #F87171;">INTERCEPTED</span>
        </div>

        <!-- Ollama Forensic Case Dossier -->
        <div class="dossier-box">
          <div class="dossier-header">
            <span class="mono-label" style="color: #C084FC;">🦙 OLLAMA FORENSIC CASE DOSSIER (ON-PREM PRIVATE REASONING)</span>
            <span class="mono-label" style="color: #F87171;">CONFIDENCE: 98.7%</span>
          </div>
          <div class="dossier-body">🚨 SOCIAL ENGINEERING &amp; REVERSE-COLLECT TRAP DETECTED:
The unsolicited link incorporates deceptive urgency ('Urgent security refund') combined with a lookalike domain simulating bank infrastructure ('hdfc-security-refund.xyz').

Ollama semantic analysis classifies this payload as a phishing credential harvester designed to trick users into approving reverse UPI collect requests.
RECOMMENDED ACTION: Ingress URL blocked in perimeter API gateway. Dispatched to automated domain takedown service.</div>
        </div>

        <div class="alert-banner danger">
          <span>🛑 UNSOLICITED LINK INTERCEPTED: Link quarantined. Zero customer credentials compromised.</span>
          <span class="badge-pill" style="border-color: #F87171; color: #F87171;">Zero Cloud PII Leakage</span>
        </div>
      `;
      return;
    }
  }

  startFeedTicker() {
    const tbody = document.getElementById('feed-tbody');
    if (!tbody) return;

    const initialFeed = [
      { id: 'TX-84021', channel: 'Mobile QR Scan', payee: 'amazon.pay@axisbank', sla: '19.4ms', ollama: 'Bypassed (Safe)', action: 'ALLOW', safe: true },
      { id: 'TX-84022', channel: 'FedNow Wire', payee: 'jpmorgan.corp@fednow', sla: '24.1ms', ollama: 'Bypassed (Safe)', action: 'ALLOW', safe: true },
      { id: 'TX-84023', channel: 'POS Terminal QR', payee: 'tampered_qr4@paytm', sla: '38.2ms', ollama: 'Ollama Flaggable', action: 'BLOCK & WARN', safe: false },
      { id: 'TX-84024', channel: 'SMS Link Ingress', payee: 'bit.ly/kyc-urgent-update', sla: '31.5ms', ollama: 'Ollama Intercept', action: 'INTERCEPTED', safe: false },
      { id: 'TX-84025', channel: 'Card Rails (SWIFT)', payee: 'apple.store@chase', sla: '17.8ms', ollama: 'Bypassed (Safe)', action: 'ALLOW', safe: true }
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

      const row = {
        id: `TX-${this.txCounter}`,
        channel,
        payee,
        sla,
        ollama,
        action,
        safe: !isRisk
      };

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 700; color: var(--accent-volt);">${row.id}</td>
        <td>${row.channel}</td>
        <td><code>${row.payee}</code></td>
        <td style="color: var(--accent-volt);">${row.sla}</td>
        <td style="color: ${row.safe ? 'var(--text-slate)' : '#C084FC'};">${row.ollama}</td>
        <td>
          <span class="badge-pill ${row.safe ? 'volt' : ''}" style="${row.safe ? '' : 'border-color: #F87171; color: #F87171;'}">
            ${row.action}
          </span>
        </td>
      `;

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

  buildFeedRowHTML(row) {
    return `
      <tr>
        <td style="font-weight: 700; color: var(--accent-volt);">${row.id}</td>
        <td>${row.channel}</td>
        <td><code>${row.payee}</code></td>
        <td style="color: var(--accent-volt);">${row.sla}</td>
        <td style="color: ${row.safe ? 'var(--text-slate)' : '#C084FC'};">${row.ollama}</td>
        <td>
          <span class="badge-pill ${row.safe ? 'volt' : ''}" style="${row.safe ? '' : 'border-color: #F87171; color: #F87171;'}">
            ${row.action}
          </span>
        </td>
      </tr>
    `;
  }

  openModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add('active');
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
