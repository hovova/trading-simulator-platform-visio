import sqlite3
from pathlib import Path

DATABASE_PATH = Path(__file__).parent / "trading.db"


def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def add_column_if_missing(cursor, table_name: str, column_name: str, column_definition: str):
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = cursor.fetchall()

    existing_columns = [column["name"] for column in columns]

    if column_name not in existing_columns:
        cursor.execute(
            f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_definition}"
        )


def initialise_database():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS account (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            cash REAL NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS holdings (
            symbol TEXT PRIMARY KEY,
            quantity INTEGER NOT NULL,
            average_price REAL NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS trades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            trade_type TEXT NOT NULL,
            symbol TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            total REAL NOT NULL,
            timestamp TEXT NOT NULL
        )
    """)

    add_column_if_missing(
        cursor,
        "trades",
        "realised_pnl",
        "REAL DEFAULT 0"
    )

    cursor.execute("SELECT cash FROM account WHERE id = 1")
    account = cursor.fetchone()

    if account is None:
        cursor.execute(
            "INSERT INTO account (id, cash) VALUES (1, ?)",
            (100000.00,)
        )

    connection.commit()
    connection.close()