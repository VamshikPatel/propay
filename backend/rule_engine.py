"""
ProPay Backend — Sub-30ms Synchronous Deterministic Rule & Velocity Engine
Evaluates NPCI UPI Intent specifications, authority-vs-settlement mismatches,
and in-memory sliding-window velocity thresholds before payment clearance.
"""

import time
from collections import defaultdict
from urllib.parse import urlparse, parse_qs

class RuleEngine:
    def __init__(self):
        # Institutional verified settlement VPAs (exact or domain match)
        self.whitelist_vpa = [
            "hdfc.corporate@hdfcbank",
            "vvce.accounts@icici",
            "amazon.pay@axisbank",
            "jpmorgan.corp@fednow",
            "starbucks.in@hdfc",
            "apple.store@chase"
        ]

        # Explicit known fraudulent identifiers
        self.blacklist_indicators = [
            "scammer", "scam_", "fraud", "attacker", "phish", "fake-refund", "fake_qr", "tampered", "prize-winner"
        ]

        # Suspicious domain extensions often used in disposable phishing campaigns
        self.high_risk_tlds = [".xyz", ".top", ".tk", ".click", ".live", ".work", ".link", ".buzz"]

        # Known URL shortener services that hide landing destinations
        self.shorteners = ["bit.ly", "tinyurl.com", "t.co", "is.gd", "buff.ly", "ow.ly"]

        # Recognized institutional entities prone to brand impersonation
        self.trusted_institutions = [
            "hdfc", "icici", "sbi", "axis", "amazon", "apple", "google",
            "electricity", "telecom", "treasury", "government", "income-tax", "utility"
        ]

        # Sliding-window velocity storage: entity_id -> list of float timestamps
        self.velocity_store = defaultdict(list)

    def parse_upi_intent(self, raw_uri: str) -> dict:
        """
        Parses raw UPI QR string compliant with NPCI UPI Intent Specification.
        Parameters: pa (Payee VPA), pn (Payee Name), am (Amount), mc (Merchant Code), cu (Currency)
        """
        if not raw_uri.startswith("upi://pay"):
            return {
                "is_upi": False,
                "pa": "",
                "pn": "",
                "am": "",
                "mc": "",
                "cu": "INR"
            }

        parsed = urlparse(raw_uri)
        query = parse_qs(parsed.query)

        return {
            "is_upi": True,
            "pa": query.get("pa", [""])[0].strip().lower(),
            "pn": query.get("pn", [""])[0].strip(),
            "am": query.get("am", [""])[0].strip(),
            "mc": query.get("mc", [""])[0].strip(),
            "cu": query.get("cu", ["INR"])[0].strip().upper()
        }

    def check_authority_mismatch(self, pn: str, pa: str) -> tuple[bool, str]:
        """
        Anti-Quishing Heuristic:
        Detects if Payee Name (pn) claims to be a trusted corporate/bank entity
        while Payee Address (pa) routes funds to an unauthorized personal consumer VPA.
        """
        pn_lower = pn.lower()
        pa_lower = pa.lower()

        # Check if payee name claims institutional authority
        claimed_institution = None
        for inst in self.trusted_institutions:
            if inst in pn_lower:
                claimed_institution = inst
                break

        if not claimed_institution:
            return False, "No institutional claim detected"

        # Check if settlement VPA is officially whitelisted for that institution
        is_verified = any(w in pa_lower for w in self.whitelist_vpa)
        if is_verified:
            return False, f"Verified institutional VPA: {pa}"

        # If claiming an institution but settling on personal consumer VPAs like @paytm, @ybl, etc.
        personal_providers = ["@paytm", "@upi", "@ybl", "@okhdfcbank", "@okaxis", "@ibl", "@axl"]
        settles_on_personal = any(pa_lower.endswith(prov) or prov in pa_lower for prov in personal_providers)

        if settles_on_personal or "scammer" in pa_lower:
            return True, f"Authority spoofing detected: Claims '{pn}' but settles to unverified handle '{pa}'"

        return False, "Settlement route passed basic verification"

    def check_velocity(self, entity_id: str, window_seconds: int = 60, max_limit: int = 3) -> tuple[bool, int]:
        """
        In-Memory Sliding-Window Velocity Rate Limiter.
        Maintains timestamps of recent attempts. Prunes attempts older than window_seconds.
        Returns (is_anomaly, count_in_window).
        """
        now = time.time()
        timestamps = self.velocity_store[entity_id]

        # Prune records outside the sliding window
        valid_timestamps = [t for t in timestamps if (now - t) <= window_seconds]
        valid_timestamps.append(now)
        self.velocity_store[entity_id] = valid_timestamps

        count = len(valid_timestamps)
        is_anomaly = count > max_limit
        return is_anomaly, count

    def evaluate(self, payload_data: dict, entity_id: str = "default_session") -> dict:
        """
        Executes synchronous fast-path risk assessment under 30 milliseconds.
        Returns deterministic verdict, calculated risk score, matched rule, and real latency.
        """
        t_start = time.perf_counter()

        raw = payload_data.get("raw", "").strip()
        pa = payload_data.get("pa", "").lower()
        pn = payload_data.get("pn", "")
        resolved_url = payload_data.get("resolved_url", "")

        # 1. Evaluate Whitelist Match
        is_whitelisted = any(w in pa for w in self.whitelist_vpa)

        # 2. Evaluate Blacklist Keywords
        is_blacklisted = any(b in pa or b in raw.lower() for b in self.blacklist_indicators)

        # 3. Evaluate Quishing Authority-vs-Settlement Mismatch
        authority_mismatch, mismatch_reason = self.check_authority_mismatch(pn, pa)

        # 4. Evaluate Link / Shortener Indicators
        is_shortener = any(s in raw for s in self.shorteners)
        is_risky_tld = any(tld in resolved_url.lower() or tld in raw.lower() for tld in self.high_risk_tlds)

        # 5. Evaluate Sliding-Window Velocity Rate Limiter (threshold: >3 txns in 60s)
        velocity_exceeded, velocity_count = self.check_velocity(entity_id, window_seconds=60, max_limit=3)

        # Real elapsed measurement
        elapsed_ms = round((time.perf_counter() - t_start) * 1000, 3)

        # --- Decision Tree ---
        # Case A: Explicit Whitelist & Safe Route
        if is_whitelisted and not is_risky_tld and not is_blacklisted:
            return {
                "inline_verdict": "ALLOW",
                "risk_score": 0.02,
                "rule_matched": "INSTITUTIONAL_SETTLEMENT_WHITELIST",
                "authority_mismatch": False,
                "velocity_exceeded": velocity_exceeded,
                "velocity_count": velocity_count,
                "latency_ms": elapsed_ms,
                "requires_ollama": False,
                "summary": f"Verified institutional payee cleared ({pa}). Sub-30ms wire clearance authorized."
            }

        # Case B: Severe High-Confidence Fraud (Quishing Mismatch or Blacklist)
        if authority_mismatch or is_blacklisted:
            rule = "PAYEE_AUTHORITY_MISMATCH_QUISHING" if authority_mismatch else "KNOWN_FRAUD_IDENTIFIER_MATCH"
            return {
                "inline_verdict": "BLOCK_FRAUD",
                "risk_score": 0.96,
                "rule_matched": rule,
                "authority_mismatch": authority_mismatch,
                "velocity_exceeded": velocity_exceeded,
                "velocity_count": velocity_count,
                "latency_ms": elapsed_ms,
                "requires_ollama": True,
                "summary": mismatch_reason if authority_mismatch else f"Matched known blacklist pattern in payee '{pa}'."
            }

        # Case C: Deceptive Domain / Shortener / Phishing Link
        if is_risky_tld or is_shortener:
            return {
                "inline_verdict": "FLAG_SUSPICIOUS",
                "risk_score": 0.88,
                "rule_matched": "UNVERIFIED_REDIRECT_OR_SUSPICIOUS_TLD",
                "authority_mismatch": False,
                "velocity_exceeded": velocity_exceeded,
                "velocity_count": velocity_count,
                "latency_ms": elapsed_ms,
                "requires_ollama": True,
                "summary": f"Detected obscured destination ({'URL Shortener' if is_shortener else 'High-Risk TLD'}). Requires cognitive review."
            }

        # Case D: Velocity Anomaly
        if velocity_exceeded:
            return {
                "inline_verdict": "FLAG_SUSPICIOUS",
                "risk_score": 0.75,
                "rule_matched": "VELOCITY_THRESHOLD_EXCEEDED",
                "authority_mismatch": False,
                "velocity_exceeded": True,
                "velocity_count": velocity_count,
                "latency_ms": elapsed_ms,
                "requires_ollama": True,
                "summary": f"Sliding-window velocity threshold exceeded ({velocity_count} txns in 60s). Step-up challenge required."
            }

        # Case E: Standard Clean Retail Payment
        return {
            "inline_verdict": "ALLOW",
            "risk_score": 0.12,
            "rule_matched": "STANDARD_PAYMENT_RULES_CLEARED",
            "authority_mismatch": False,
            "velocity_exceeded": False,
            "velocity_count": velocity_count,
            "latency_ms": elapsed_ms,
            "requires_ollama": False,
            "summary": "Standard retail transaction passed all deterministic boundary checks."
        }
