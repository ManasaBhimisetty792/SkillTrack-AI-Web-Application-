from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.payment import (
    CreateOrderRequest,
    CreateOrderResponse,
    VerifyPaymentRequest,
    VerifyPaymentResponse,
    MembershipStatusResponse
)
from app.services.razorpay_service import razorpay_service
from app.services.payment_service import payment_service
from app.services.subscription_service import subscription_service
from app.services.membership_service import membership_service
from app.middleware.auth_middleware import get_current_user
from app.models.user import User

router = APIRouter(prefix="", tags=["Payments & Subscriptions"])


@router.post("/payments/create-order", response_model=CreateOrderResponse)
def create_order(req: CreateOrderRequest, current_user: User = Depends(get_current_user)):
    """Create a new Razorpay Order for Student Premium Upgrade."""
    order = razorpay_service.create_order(amount=req.amount, currency=req.currency, receipt=f"rcpt_{current_user.id[:8]}")
    return {
        "order_id": order["id"],
        "amount": order["amount"],
        "currency": order["currency"],
        "key_id": razorpay_service.key_id or "rzp_test_placeholder",
        "is_mock": order.get("is_mock", False)
    }


@router.post("/payments/verify", response_model=VerifyPaymentResponse)
def verify_payment(req: VerifyPaymentRequest, current_user: User = Depends(get_current_user)):
    """Verify Razorpay payment signature, store transaction in Supabase, and grant Premium access."""
    is_valid = razorpay_service.verify_signature(
        order_id=req.order_id,
        payment_id=req.payment_id,
        signature=req.signature
    )

    if not is_valid:
        # Record failed payment attempt
        payment_service.record_payment(
            user_id=current_user.id,
            order_id=req.order_id,
            payment_id=req.payment_id,
            signature=req.signature,
            amount=req.amount,
            plan_name=req.plan_name,
            status="failed"
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment signature verification failed."
        )

    # Signature valid — store successful transaction & activate Premium
    payment_rec = payment_service.record_payment(
        user_id=current_user.id,
        order_id=req.order_id,
        payment_id=req.payment_id,
        signature=req.signature,
        amount=req.amount,
        plan_name=req.plan_name,
        status="success"
    )

    return {
        "success": True,
        "message": "Payment verified and Premium status activated!",
        "user_id": current_user.id,
        "payment_id": req.payment_id,
        "membership_type": "premium",
        "is_premium": True,
        "transaction_id": payment_rec["id"]
    }


@router.get("/payments/history")
def get_payment_history(current_user: User = Depends(get_current_user)):
    """Retrieve full payment history for authenticated student."""
    return payment_service.get_payment_history(user_id=current_user.id)


@router.get("/subscription/current")
def get_current_subscription(current_user: User = Depends(get_current_user)):
    """Get active student subscription status."""
    return subscription_service.get_current_subscription(user_id=current_user.id)


@router.get("/subscription/history")
def get_subscription_history(current_user: User = Depends(get_current_user)):
    """Get complete subscription history for candidate."""
    return subscription_service.get_subscription_history(user_id=current_user.id)


@router.post("/subscription/cancel")
def cancel_subscription(current_user: User = Depends(get_current_user)):
    """Cancel active subscription."""
    return subscription_service.cancel_subscription(user_id=current_user.id)


@router.get("/membership/status", response_model=MembershipStatusResponse)
def get_membership_status(current_user: User = Depends(get_current_user)):
    """Get current dynamic membership status from Supabase."""
    return membership_service.get_membership_status(user_id=current_user.id)
