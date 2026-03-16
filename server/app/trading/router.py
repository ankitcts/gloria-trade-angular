from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from app.auth.dependencies import get_current_user
from app.models.order import Order, OrderSide, OrderStatus, OrderType, OrderValidity
from app.models.security import Security
from app.models.user import User

router = APIRouter()


class CreateOrderRequest(BaseModel):
    security_id: str
    portfolio_id: str
    side: OrderSide
    order_type: OrderType
    quantity: float
    limit_price: Optional[float] = None
    stop_price: Optional[float] = None
    validity: OrderValidity = OrderValidity.DAY


@router.get("")
async def list_orders(
    current_user: Annotated[User, Depends(get_current_user)],
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    order_status: Optional[str] = None,
):
    filters = [Order.user_id == str(current_user.id)]
    if order_status:
        filters.append(Order.status == order_status)

    total = await Order.find(*filters).count()
    orders = await Order.find(*filters).sort(-Order.created_at).skip((page - 1) * page_size).limit(page_size).to_list()

    return {
        "items": [
            {
                "id": str(o.id),
                "security_id": o.security_id,
                "symbol": o.symbol,
                "security_name": o.security_name,
                "order_type": o.order_type.value,
                "side": o.side.value,
                "quantity": o.quantity,
                "filled_quantity": o.filled_quantity,
                "limit_price": o.limit_price,
                "avg_fill_price": o.avg_fill_price,
                "status": o.status.value,
                "validity": o.validity.value,
                "total_amount": o.total_amount,
                "currency": o.currency,
                "placed_at": o.placed_at.isoformat(),
                "created_at": o.created_at.isoformat(),
            }
            for o in orders
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_order(
    data: CreateOrderRequest,
    current_user: Annotated[User, Depends(get_current_user)],
):
    security = await Security.get(data.security_id)
    if not security:
        raise HTTPException(status_code=404, detail="Security not found")

    order = Order(
        user_id=str(current_user.id),
        portfolio_id=data.portfolio_id,
        security_id=data.security_id,
        symbol=security.symbol,
        exchange_code=security.primary_exchange_code,
        security_name=security.name,
        order_type=data.order_type,
        side=data.side,
        quantity=data.quantity,
        limit_price=data.limit_price,
        stop_price=data.stop_price,
        validity=data.validity,
        status=OrderStatus.PENDING,
        currency=security.currency,
    )
    await order.insert()

    return {"id": str(order.id), "status": order.status.value, "symbol": order.symbol}


@router.post("/{order_id}/cancel")
async def cancel_order(
    order_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
):
    order = await Order.get(order_id)
    if not order or order.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status not in [OrderStatus.PENDING, OrderStatus.OPEN]:
        raise HTTPException(status_code=400, detail="Order cannot be cancelled")

    from datetime import datetime, timezone
    order.status = OrderStatus.CANCELLED
    order.cancelled_at = datetime.now(timezone.utc)
    order.updated_at = datetime.now(timezone.utc)
    await order.save()

    return {"id": str(order.id), "status": order.status.value}
