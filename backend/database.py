"""SQLite database layer for JudgeAI — action_plans + audit_log tables."""

import sqlite3
import json
from datetime import datetime, timezone
from pathlib import Path
from contextlib import contextmanager

DB_PATH = Path(__file__).parent / "judgeai.db"


def get_connection() -> sqlite3.Connection:
    """Return a connection with row_factory set for dict-like access."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


@contextmanager
def get_db():
    """Context manager that yields a connection and auto-commits/closes."""
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db():
    """Create tables if they don't exist."""
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS action_plans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                case_number TEXT NOT NULL,
                date TEXT NOT NULL,
                petitioner TEXT NOT NULL,
                respondent TEXT NOT NULL,
                directions TEXT NOT NULL,
                deadline TEXT NOT NULL,
                department TEXT NOT NULL,
                reviewer_name TEXT NOT NULL,
                approved_at TEXT NOT NULL
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS audit_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                case_number TEXT NOT NULL,
                field_name TEXT NOT NULL,
                ai_value TEXT NOT NULL,
                human_value TEXT NOT NULL,
                changed INTEGER NOT NULL DEFAULT 0,
                reviewer_name TEXT NOT NULL,
                approved_at TEXT NOT NULL
            )
        """)


# ---------------------------------------------------------------------------
# CRUD helpers
# ---------------------------------------------------------------------------

def insert_action_plan(
    case_number: str,
    date: str,
    petitioner: str,
    respondent: str,
    directions: list[str],
    deadline: str,
    department: str,
    reviewer_name: str,
) -> int:
    """Insert a human-approved action plan. Returns the new row id."""
    now = datetime.now(timezone.utc).isoformat()
    with get_db() as conn:
        cursor = conn.execute(
            """
            INSERT INTO action_plans
                (case_number, date, petitioner, respondent,
                 directions, deadline, department, reviewer_name, approved_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                case_number,
                date,
                petitioner,
                respondent,
                json.dumps(directions),
                deadline,
                department,
                reviewer_name,
                now,
            ),
        )
        return cursor.lastrowid


def insert_audit_log(
    case_number: str,
    reviewer_name: str,
    ai_values: dict,
    human_values: dict,
):
    """Record per-field AI vs human comparison for audit."""
    now = datetime.now(timezone.utc).isoformat()
    fields = ["case_number", "date", "petitioner", "respondent",
              "directions", "deadline", "department"]
    with get_db() as conn:
        for field in fields:
            ai_val = ai_values.get(field, "")
            human_val = human_values.get(field, "")
            # Normalise lists to JSON strings for comparison
            if isinstance(ai_val, list):
                ai_val = json.dumps(ai_val)
            if isinstance(human_val, list):
                human_val = json.dumps(human_val)
            changed = 1 if str(ai_val) != str(human_val) else 0
            conn.execute(
                """
                INSERT INTO audit_log
                    (case_number, field_name, ai_value, human_value,
                     changed, reviewer_name, approved_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (case_number, field, str(ai_val), str(human_val),
                 changed, reviewer_name, now),
            )


def get_all_action_plans() -> list[dict]:
    """Return all action plans sorted by deadline ascending."""
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM action_plans ORDER BY deadline ASC"
        ).fetchall()
        results = []
        for row in rows:
            d = dict(row)
            # Parse directions back to a list
            try:
                d["directions"] = json.loads(d["directions"])
            except (json.JSONDecodeError, TypeError):
                d["directions"] = [d["directions"]]
            results.append(d)
        return results


def get_audit_log(case_number: str) -> list[dict]:
    """Return audit entries for a specific case number."""
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM audit_log WHERE case_number = ? ORDER BY id ASC",
            (case_number,),
        ).fetchall()
        return [dict(row) for row in rows]
