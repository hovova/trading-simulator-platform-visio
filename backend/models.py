from pydantic import BaseModel, Field


class TradeRequest(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=10)
    quantity: int = Field(..., gt=0)