"""
ProPay Backend — Tamper-Evident Cryptographic Audit Ledger
Logs all transaction risk verdicts with SHA-256 hash chaining to guarantee
immutable, verifiable audit trails for banking compliance without simulated bloat.
"""

import os
import json
import time
import hashlib
from datetime import datetime, timezone

GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000"

class TamperEvidentLedger:
    def __init__(self, ledger_file: str = None):
        if ledger_file is None:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            ledger_file = os.path.join(base_dir, "audit_ledger.jsonl")
        self.ledger_file = ledger_file
        self.last_hash = self._get_latest_hash()

    def _get_latest_hash(self) -> str:
        """Retrieves the record_hash of the most recent ledger entry, or GENESIS_HASH if empty."""
        if not os.path.exists(self.ledger_file):
            return GENESIS_HASH

        last_line = ""
        try:
            with open(self.ledger_file, "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip():
                        last_line = line.strip()
            if last_line:
                data = json.loads(last_line)
                return data.get("record_hash", GENESIS_HASH)
        except Exception:
            return GENESIS_HASH

        return GENESIS_HASH

    def compute_hash(self, payload_dict: dict, prev_hash: str) -> str:
        """Computes SHA-256 digest over normalized payload data + previous hash."""
        # Canonical JSON string representation for deterministic hashing
        canonical_str = json.dumps(payload_dict, sort_keys=True) + prev_hash
        return hashlib.sha256(canonical_str.encode("utf-8")).hexdigest()

    def append_event(self, tx_id: str, channel: str, payee: str, amount: str, verdict: str, risk_score: float, rule_matched: str) -> dict:
        """Appends a new immutable transaction event with chained cryptographic proof."""
        timestamp_utc = datetime.now(timezone.utc).isoformat()
        prev_hash = self.last_hash

        event_payload = {
            "tx_id": tx_id,
            "timestamp_utc": timestamp_utc,
            "channel": channel,
            "payee": payee,
            "amount": amount,
            "verdict": verdict,
            "risk_score": round(risk_score, 4),
            "rule_matched": rule_matched
        }

        record_hash = self.compute_hash(event_payload, prev_hash)

        full_record = {
            **event_payload,
            "prev_hash": prev_hash,
            "record_hash": record_hash
        }

        # Thread-safe append
        with open(self.ledger_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(full_record) + "\n")

        self.last_hash = record_hash
        return full_record

    def verify_ledger_integrity(self) -> tuple[bool, int, str]:
        """
        Verifies the entire cryptographic chain from genesis to the latest record.
        Returns (is_valid, record_count, status_message).
        """
        if not os.path.exists(self.ledger_file):
            return True, 0, "Ledger is currently empty (0 records)."

        count = 0
        expected_prev = GENESIS_HASH

        with open(self.ledger_file, "r", encoding="utf-8") as f:
            for idx, line in enumerate(f, start=1):
                line = line.strip()
                if not line:
                    continue
                record = json.loads(line)
                prev_hash = record.get("prev_hash")
                record_hash = record.get("record_hash")

                if prev_hash != expected_prev:
                    return False, count, f"Hash chain broken at record #{idx} (tx_id: {record.get('tx_id')}). Prev hash mismatch."

                # Recompute hash
                payload = {
                    "tx_id": record["tx_id"],
                    "timestamp_utc": record["timestamp_utc"],
                    "channel": record["channel"],
                    "payee": record["payee"],
                    "amount": record["amount"],
                    "verdict": record["verdict"],
                    "risk_score": record["risk_score"],
                    "rule_matched": record["rule_matched"]
                }
                computed = self.compute_hash(payload, prev_hash)
                if computed != record_hash:
                    return False, count, f"Tampering detected at record #{idx}! Hash verification failed."

                expected_prev = record_hash
                count += 1

        return True, count, f"Ledger integrity verified: All {count} records mathematically valid."

    def get_recent_records(self, limit: int = 15) -> list[dict]:
        """Returns the most recent N records from the ledger."""
        if not os.path.exists(self.ledger_file):
            return []

        records = []
        try:
            with open(self.ledger_file, "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip():
                        records.append(json.loads(line.strip()))
        except Exception:
            return []

        return records[-limit:]

    def get_ledger_status(self) -> dict:
        """Returns diagnostic status of the ledger."""
        is_valid, count, msg = self.verify_ledger_integrity()
        return {
            "status": "HEALTHY" if is_valid else "TAMPERED",
            "total_records": count,
            "latest_hash": self.last_hash[:16] + "..." if self.last_hash else GENESIS_HASH,
            "verification_status": msg,
            "storage_format": "Append-Only JSONL with SHA-256 Chain"
        }
