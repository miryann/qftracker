"""
Returns a Firestore client, automatically routing to the emulator when
FIRESTORE_EMULATOR_HOST is set (local dev) or production otherwise.
"""

import os

from google.cloud import firestore

_client: firestore.Client | None = None


def get_firestore_client() -> firestore.Client:
    global _client
    if _client is None:
        project_id = os.getenv("FIRESTORE_PROJECT_ID", "qantas-tracker-dev")
        # google-cloud-firestore reads FIRESTORE_EMULATOR_HOST automatically
        _client = firestore.Client(project=project_id)
    return _client
