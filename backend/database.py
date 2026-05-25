import sqlite3
from pathlib import Path

DATABASE_PATH = Path(__file__).parent / "trading.db"


def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


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

    cursor.execute("SELECT cash FROM account WHERE id = 1")
    account = cursor.fetchone()

    if account is None:
        cursor.execute(
            "INSERT INTO account (id, cash) VALUES (1, ?)",
            (100000.00,)
        )

    connection.commit()
    connection.close()