from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query

from app.auth.dependencies import get_current_user
from app.models.notification import Notification
from app.models.user import User

router = APIRouter()


@router.get("")
async def list_notifications(
    current_user: Annotated[User, Depends(get_current_user)],
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=50),
):
    filters = [Notification.user_id == str(current_user.id)]
    total = await Notification.find(*filters).count()
    notifications = (
        await Notification.find(*filters)
        .sort(-Notification.created_at)
        .skip((page - 1) * page_size)
        .limit(page_size)
        .to_list()
    )

    return {
        "items": [
            {
                "id": str(n.id),
                "type": n.type.value,
                "title": n.title,
                "message": n.message,
                "data": n.data,
                "is_read": n.is_read,
                "created_at": n.created_at.isoformat(),
            }
            for n in notifications
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.post("/{notification_id}/read")
async def mark_read(
    notification_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
):
    notification = await Notification.get(notification_id)
    if not notification or notification.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.is_read = True
    await notification.save()
    return {"message": "Marked as read"}


@router.post("/read-all")
async def mark_all_read(
    current_user: Annotated[User, Depends(get_current_user)],
):
    notifications = await Notification.find(
        Notification.user_id == str(current_user.id),
        Notification.is_read == False,
    ).to_list()

    for n in notifications:
        n.is_read = True
        await n.save()

    return {"message": f"Marked {len(notifications)} notifications as read"}
