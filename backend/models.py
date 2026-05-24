from pydantic import BaseModel


class TradeRequest(BaseModel):
    symbol: str
    quantity: int