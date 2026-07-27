/**
 * usePayment — Official Razorpay Checkout Hook
 * ================================================
 * - Launches the official Razorpay Checkout Modal when configured with real Razorpay Keys.
 * - Gracefully handles test/sandbox mode when using placeholder keys or offline backend,
 *   preventing "401 (Unauthorized)" network failures on api.razorpay.com.
 * - On payment success -> Verifies signature -> Grants Premium -> Redirects to /payment-success.
 */
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import paymentService, { loadRazorpaySDK } from '../services/paymentService';
import { tokenStorage } from '../services/api';

const RAZORPAY_KEY_ID =
  import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder';

export const PLANS = {
  student_premium: {
    planName: 'Student Premium',
    amount: 1499,
    currency: 'INR',
    description: 'Unlimited AI Mock Interviews + ATS + Certificates',
    durationLabel: '1 Year Access',
  },
};

export const usePayment = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState('idle'); // idle | loading | checkout | verifying | success | failed
  const [error, setError] = useState(null);
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockOrderInfo, setMockOrderInfo] = useState(null);

  const handleConfirmMockPayment = useCallback(
    async (mockDetails = {}) => {
      setShowMockModal(false);
      setStatus('verifying');
      const verifyToastId = toast.loading('Verifying payment & activating Premium…');

      const plan = mockOrderInfo?.plan || PLANS.student_premium;
      const order = mockOrderInfo?.order || {};

      try {
        const verification = await paymentService.verifyPayment({
          orderId: mockDetails.orderId || order.order_id || `order_mock_${Date.now()}`,
          paymentId: mockDetails.paymentId || `pay_mock_${Date.now()}`,
          signature: mockDetails.signature || 'sig_mock_verified',
          planName: plan.planName,
          amount: plan.amount,
          user,
        });

        // Update user state to Premium
        const updatedUser = {
          ...user,
          is_premium: true,
          membership_type: 'premium',
          current_plan: plan.planName,
        };
        setUser(updatedUser);
        tokenStorage.set({ user: updatedUser, access: tokenStorage.access });

        toast.success('🎉 Welcome to SkillTrack AI Premium!', {
          id: verifyToastId,
          duration: 3000,
        });
        setStatus('success');

        // Redirect to Payment Success page
        navigate('/payment-success', {
          replace: true,
          state: {
            transactionId: verification.transaction_id || mockDetails.paymentId || `pay_${Date.now()}`,
            paymentId: mockDetails.paymentId || `pay_${Date.now()}`,
            orderId: mockDetails.orderId || order.order_id || `order_${Date.now()}`,
            amount: plan.amount,
            planName: plan.planName,
            invoiceNumber: verification.invoice_number || null,
          },
        });
      } catch (verifyErr) {
        toast.error(verifyErr.message || 'Payment verification failed.', {
          id: verifyToastId,
        });
        setStatus('failed');
        setError(verifyErr.message || 'Signature verification error');
        navigate('/payment-failed', {
          replace: true,
          state: { reason: verifyErr.message || 'Signature mismatch' },
        });
      }
    },
    [mockOrderInfo, user, setUser, navigate]
  );

  const handleCloseMockModal = useCallback(() => {
    setShowMockModal(false);
    setStatus('idle');
    toast('Payment cancelled by candidate.', { icon: 'ℹ️' });
  }, []);

  const initiatePayment = useCallback(
    async (planKey = 'student_premium') => {
      // ── Guard: Login Check ─────────────────────────────────────────────
      if (!user) {
        toast.error('Please sign in to upgrade to Premium.');
        navigate('/login');
        return;
      }

      const plan = PLANS[planKey];
      if (!plan) {
        toast.error('Invalid plan selected.');
        return;
      }

      setStatus('loading');
      setError(null);
      const toastId = toast.loading('Initializing Payment Gateway…');

      try {
        // ── 1. Create Order via Backend API ────────────────────────────
        const order = await paymentService.createOrder({
          planName: plan.planName,
          amount: plan.amount,
          currency: plan.currency,
        });

        toast.dismiss(toastId);

        const keyId = order.key_id || RAZORPAY_KEY_ID;
        const isMockOrder = Boolean(order.is_mock) || (order.order_id && order.order_id.startsWith('order_mock_'));
        const isPlaceholderKey = !keyId || keyId.toLowerCase().includes('placeholder');

        // ── 2. Handle Dev/Sandbox Test Mode (Placeholder Keys) ────────
        if (isPlaceholderKey || isMockOrder) {
          console.info('Razorpay test mode active — launching sandbox test payment dialog.');
          setMockOrderInfo({ order, plan, user });
          setShowMockModal(true);
          setStatus('checkout');
          return;
        }

        // ── 3. Load Real Razorpay SDK for Live / Production Keys ─────
        const sdkLoaded = await loadRazorpaySDK();
        if (!sdkLoaded) {
          throw new Error('Could not load Razorpay SDK. Check your internet connection.');
        }

        // Build official Razorpay Options
        const options = {
          key: keyId,
          amount: order.amount || plan.amount * 100, // Amount in paise
          currency: order.currency || plan.currency,
          name: 'SkillTrack AI',
          description: plan.description,
          image: '/logo.png',

          prefill: {
            name: user.name || user.full_name || 'Student Candidate',
            email: user.email || 'student@example.com',
            contact: user.phone || user.mobile || '9999999999',
          },

          notes: {
            platform: 'SkillTrack AI',
            plan: plan.planName,
            user_id: user.id || '',
          },

          theme: {
            color: '#6366f1',
            hide_topbar: false,
          },

          handler: async (razorpayResponse) => {
            setStatus('verifying');
            const verifyToastId = toast.loading('Verifying payment & activating Premium…');

            try {
              const verification = await paymentService.verifyPayment({
                orderId: razorpayResponse.razorpay_order_id || order.order_id,
                paymentId: razorpayResponse.razorpay_payment_id || `pay_${Date.now()}`,
                signature: razorpayResponse.razorpay_signature || 'sig_demo',
                planName: plan.planName,
                amount: plan.amount,
                user,
              });

              const updatedUser = {
                ...user,
                is_premium: true,
                membership_type: 'premium',
                current_plan: plan.planName,
              };
              setUser(updatedUser);
              tokenStorage.set({ user: updatedUser, access: tokenStorage.access });

              toast.success('🎉 Welcome to SkillTrack AI Premium!', {
                id: verifyToastId,
                duration: 3000,
              });
              setStatus('success');

              navigate('/payment-success', {
                replace: true,
                state: {
                  transactionId: verification.transaction_id || razorpayResponse.razorpay_payment_id,
                  paymentId: razorpayResponse.razorpay_payment_id || `pay_${Date.now()}`,
                  orderId: razorpayResponse.razorpay_order_id || order.order_id,
                  amount: plan.amount,
                  planName: plan.planName,
                  invoiceNumber: verification.invoice_number || null,
                },
              });
            } catch (verifyErr) {
              toast.error(verifyErr.message || 'Payment verification failed.', {
                id: verifyToastId,
              });
              setStatus('failed');
              setError(verifyErr.message || 'Signature verification error');
              navigate('/payment-failed', {
                replace: true,
                state: { reason: verifyErr.message || 'Signature mismatch' },
              });
            }
          },

          modal: {
            ondismiss: () => {
              setStatus('idle');
              toast('Payment cancelled by candidate.', { icon: 'ℹ️' });
            },
            backdropclose: false,
            escape: true,
            animation: true,
          },
        };

        if (order.order_id && !isMockOrder) {
          options.order_id = order.order_id;
        }

        setStatus('checkout');
        const rzp = new window.Razorpay(options);

        rzp.on('payment.failed', (failedResponse) => {
          const reason =
            failedResponse.error?.description ||
            failedResponse.error?.reason ||
            'Transaction declined by gateway';

          console.warn('Razorpay payment.failed event:', failedResponse.error);
          toast.error(`Payment failed: ${reason}`);
          setStatus('failed');
          setError(reason);
          navigate('/payment-failed', {
            replace: true,
            state: { reason },
          });
        });

        rzp.open();
      } catch (err) {
        toast.dismiss(toastId);
        console.error('Razorpay initialization error:', err);
        toast.error(err.message || 'Could not open Razorpay checkout modal.');
        setStatus('failed');
        setError(err.message || 'Unknown error');
      }
    },
    [user, navigate, setUser]
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setShowMockModal(false);
  }, []);

  return {
    initiatePayment,
    reset,
    status,
    error,
    isLoading: status === 'loading' || status === 'verifying',
    isCheckout: status === 'checkout',
    isSuccess: status === 'success',
    isFailed: status === 'failed',
    showMockModal,
    mockOrderInfo,
    handleConfirmMockPayment,
    handleCloseMockModal,
  };
};

export default usePayment;
