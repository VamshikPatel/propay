"""
ProPay Backend — Kafka Streaming Simulator
Simulates realistic Apache Kafka partition topology for fraud-ingress-topic
"""

import time
import random
import hashlib

class KafkaStreamSimulator:
    def __init__(self, topic="fraud-ingress-topic", num_partitions=12):
        self.topic = topic
        self.num_partitions = num_partitions
        self.consumer_group = "propay-risk-mesh-cg"
        self.partition_offsets = {i: random.randint(400000, 800000) for i in range(num_partitions)}
        self.start_time = time.time()

    def get_partition_for_key(self, key: str) -> int:
        h = int(hashlib.md5(key.encode()).hexdigest(), 16)
        return h % self.num_partitions

    def produce_event(self, tx_id: str, channel: str, payee: str, amount: str) -> dict:
        partition = self.get_partition_for_key(tx_id)
        self.partition_offsets[partition] += 1
        return {
            "topic": self.topic,
            "partition": partition,
            "offset": self.partition_offsets[partition],
            "key": tx_id,
            "timestamp_ms": int(time.time() * 1000),
            "headers": {
                "X-ProPay-Channel": channel,
                "X-ProPay-Region": random.choice(["ap-south-1", "us-east-1", "eu-west-1"]),
                "X-ProPay-Priority": "HIGH" if "scam" in payee or "bit.ly" in payee else "NORMAL"
            },
            "value": {
                "tx_id": tx_id,
                "channel": channel,
                "payee": payee,
                "amount": amount
            }
        }

    def get_cluster_status(self) -> dict:
        total_offset = sum(self.partition_offsets.values())
        uptime = time.time() - self.start_time
        return {
            "cluster_id": "propay-kafka-prod-01",
            "topic": self.topic,
            "num_partitions": self.num_partitions,
            "replication_factor": 3,
            "consumer_group": self.consumer_group,
            "total_offset": total_offset,
            "partitions": [
                {
                    "id": i,
                    "offset": self.partition_offsets[i],
                    "lag": random.randint(0, 12),
                    "leader_broker": f"broker-{(i % 3) + 1}.propay.internal"
                }
                for i in range(self.num_partitions)
            ],
            "throughput": {
                "messages_per_sec": random.randint(48000, 52000),
                "bytes_per_sec_mb": round(random.uniform(18.5, 24.2), 1),
                "avg_latency_ms": round(random.uniform(0.8, 2.1), 2)
            },
            "uptime_sec": round(uptime, 1),
            "status": "HEALTHY"
        }
