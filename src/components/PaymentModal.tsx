import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, CreditCard, QrCode, Copy, CheckCircle } from 'lucide-react';
import { Package } from '../types';
import { useAuth } from '../context/AuthContext';
import { orderSubscription, OrderSubscriptionResponse, getUserSubscriptions } from '../utils/subscriptionsAPI';
// Removed localStorage purchase tracking; purchases are sourced from backend

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage: Package | null;
}

export function PaymentModal({ isOpen, onClose, selectedPackage }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'vnpay'>('vnpay');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [orderResult, setOrderResult] = useState<OrderSubscriptionResponse | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const { user } = useAuth();
  const [polling, setPolling] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [cardData, setCardData] = useState({
    cardHolder: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPackage) return;

    setLoading(true);
    setError('');

    try {
      // Call the API to order subscription
      const result = await orderSubscription(parseInt(selectedPackage.id));
      
      if (result.success) {
        setOrderResult(result);
        
        // Show QR code for payment
        if (paymentMethod === 'vnpay') {
          setShowQRCode(true);
          setPolling(true);
        } else {
          // For card payment, show success directly (mock)
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            onClose();
            resetForm();
          }, 3000);
        }

        // No local persistence: purchase history comes from backend
      } else {
        setError('Đặt subscription thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Payment error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi đặt subscription.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Poll backend to detect when the just-created subscription becomes Active
  useEffect(() => {
    const shouldStart = isOpen && showQRCode && !!orderResult?.data?.subscriptionId && polling;
    if (!shouldStart) return;

    const subscriptionId = String(orderResult!.data.subscriptionId);
    intervalRef.current = setInterval(async () => {
      try {
        const subs = await getUserSubscriptions();
        const sub = subs.find(s => String(s.subscriptionId) === subscriptionId);
        if (sub && sub.status.toLowerCase() === 'active') {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setPolling(false);
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            onClose();
            resetForm();
          }, 2500);
        }
      } catch {
        // ignore polling errors; will try again on next tick
      }
    }, 4000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isOpen, showQRCode, orderResult?.data?.subscriptionId, polling]);

  const resetForm = () => {
    setCardData({ cardHolder: '', cardNumber: '', expiry: '', cvv: '' });
    setError('');
    setShowQRCode(false);
    setOrderResult(null);
    setCopied(null);
    setPolling(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  if (!selectedPackage) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {showSuccess ? (
              <motion.div
                className="p-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Check className="h-10 w-10 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-espresso mb-4 font-poppins">
                  Thanh Toán Thành Công!
                </h3>
                <p className="text-gray-600 mb-4">
                  Cảm ơn bạn đã đăng ký gói <strong>{selectedPackage.name}</strong>. 
                  Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.
                </p>
                <p className="text-sm text-gray-500">
                  Cửa sổ này sẽ tự động đóng sau 3 giây...
                </p>
              </motion.div>
            ) : showQRCode && orderResult ? (
              <motion.div
                className="p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-center mb-6">
                  <motion.button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-10"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="h-6 w-6" />
                  </motion.button>
                  
                  <QrCode className="h-12 w-12 text-espresso mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-espresso mb-2 font-poppins">
                    Quét mã QR để thanh toán
                  </h3>
                  <p className="text-gray-600 mb-4">{orderResult.message}</p>
                  
                  <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <img 
                      src={orderResult.qrUrl} 
                      alt="QR Code thanh toán" 
                      className="w-64 h-64 mx-auto mb-4 border-2 border-gray-200 rounded-lg"
                    />
                    
                    <div className="text-left space-y-3">
                      <div className="flex justify-between items-center p-3 bg-white rounded border">
                        <div>
                          <span className="text-sm text-gray-600">Ngân hàng:</span>
                          <p className="font-semibold text-espresso">{orderResult.bankName}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-white rounded border">
                        <div className="flex-1">
                          <span className="text-sm text-gray-600">Số tài khoản:</span>
                          <p className="font-semibold text-espresso">{orderResult.bankAccount}</p>
                        </div>
                        <motion.button
                          onClick={() => copyToClipboard(orderResult.bankAccount, 'account')}
                          className="ml-2 p-2 text-gray-500 hover:text-espresso transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {copied === 'account' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </motion.button>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-white rounded border">
                        <div>
                          <span className="text-sm text-gray-600">Chủ tài khoản:</span>
                          <p className="font-semibold text-espresso">{orderResult.accountHolder}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-white rounded border">
                        <div className="flex-1">
                          <span className="text-sm text-gray-600">Nội dung chuyển khoản:</span>
                          <p className="font-semibold text-red-600">{orderResult.transferContent}</p>
                        </div>
                        <motion.button
                          onClick={() => copyToClipboard(orderResult.transferContent, 'content')}
                          className="ml-2 p-2 text-gray-500 hover:text-espresso transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {copied === 'content' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </motion.button>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-espresso text-white rounded">
                        <div className="flex-1">
                          <span className="text-sm text-latte">Số tiền:</span>
                          <p className="font-bold text-xl">{formatPrice(orderResult.amount)}</p>
                        </div>
                        <motion.button
                          onClick={() => copyToClipboard(orderResult.amount.toString(), 'amount')}
                          className="ml-2 p-2 text-latte hover:text-white transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {copied === 'amount' ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Lưu ý:</strong> Vui lòng chuyển khoản đúng số tiền và nội dung để đơn hàng được xử lý tự động.
                      Subscription của bạn sẽ được kích hoạt sau khi thanh toán thành công.
                    </p>
                  </div>
                  
                  <motion.button
                    onClick={handleClose}
                    className="bg-espresso text-white py-3 px-8 rounded-full font-semibold hover:bg-opacity-90 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Đóng
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <>
                {/* Close Button */}
                <motion.button
                  onClick={handleClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-10"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-6 w-6" />
                </motion.button>

                {/* Header */}
                <div className="bg-espresso p-6">
                  <h2 className="text-2xl font-bold text-white font-poppins">
                    Thanh Toán
                  </h2>
                  <p className="text-latte mt-2">
                    Gói: {selectedPackage.name} - {formatPrice(selectedPackage.price)}/tháng
                  </p>
                </div>

                {/* Payment Method Selection */}
                <div className="p-6">
                  {error && (
                    <motion.div
                      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      {error}
                    </motion.div>
                  )}

                  <h3 className="text-lg font-semibold text-espresso mb-4 font-poppins">
                    Chọn phương thức thanh toán
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <motion.button
                      onClick={() => setPaymentMethod('vnpay')}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        paymentMethod === 'vnpay'
                          ? 'border-espresso bg-latte'
                          : 'border-gray-300 hover:border-beige'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <QrCode className="h-6 w-6 mx-auto mb-2 text-espresso" />
                      <span className="font-medium text-espresso">QR Code</span>
                    </motion.button>

                    <motion.button
                      onClick={() => setPaymentMethod('card')}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        paymentMethod === 'card'
                          ? 'border-espresso bg-latte'
                          : 'border-gray-300 hover:border-beige'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <CreditCard className="h-6 w-6 mx-auto mb-2 text-espresso" />
                      <span className="font-medium text-espresso">Thẻ ngân hàng</span>
                    </motion.button>
                  </div>

                  {/* Payment Forms */}
                  <AnimatePresence mode="wait">
                    {paymentMethod === 'card' ? (
                      <motion.form
                        key="card"
                        onSubmit={handlePayment}
                        className="space-y-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <div>
                          <label className="block text-sm font-medium text-espresso mb-2">
                            Tên chủ thẻ
                          </label>
                          <input
                            type="text"
                            value={cardData.cardHolder}
                            onChange={(e) => setCardData(prev => ({ ...prev, cardHolder: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige focus:border-transparent"
                            placeholder="NGUYEN VAN A"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-espresso mb-2">
                            Số thẻ
                          </label>
                          <input
                            type="text"
                            value={cardData.cardNumber}
                            onChange={(e) => setCardData(prev => ({ ...prev, cardNumber: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige focus:border-transparent"
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-espresso mb-2">
                              Ngày hết hạn
                            </label>
                            <input
                              type="text"
                              value={cardData.expiry}
                              onChange={(e) => setCardData(prev => ({ ...prev, expiry: e.target.value }))}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige focus:border-transparent"
                              placeholder="MM/YY"
                              maxLength={5}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-espresso mb-2">
                              CVV
                            </label>
                            <input
                              type="text"
                              value={cardData.cvv}
                              onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value }))}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige focus:border-transparent"
                              placeholder="123"
                              maxLength={3}
                              required
                            />
                          </div>
                        </div>
                        <motion.button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-espresso text-white py-3 rounded-full font-semibold hover:bg-opacity-90 transition-all duration-300 disabled:opacity-50 mt-6"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {loading ? 'Đang xử lý...' : `Thanh toán ${formatPrice(selectedPackage.price)}`}
                        </motion.button>
                      </motion.form>
                    ) : (
                      <motion.div
                        key="vnpay"
                        className="text-center space-y-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        <div className="bg-latte p-6 rounded-lg">
                          <QrCode className="h-16 w-16 text-espresso mx-auto mb-4" />
                          <h4 className="text-lg font-semibold text-espresso mb-2">
                            Thanh toán bằng QR Code
                          </h4>
                          <p className="text-gray-600 text-sm">
                            Nhấn "Tạo QR Code" để tạo mã thanh toán và quét bằng ứng dụng ngân hàng của bạn
                          </p>
                        </div>

                        <motion.button
                          onClick={handlePayment}
                          disabled={loading}
                          className="w-full bg-espresso text-white py-3 rounded-full font-semibold hover:bg-opacity-90 transition-all duration-300 disabled:opacity-50"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {loading ? 'Đang tạo QR Code...' : `Tạo QR Code - ${formatPrice(selectedPackage.price)}`}
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}