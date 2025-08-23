import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, QrCode, Copy, CheckCircle } from 'lucide-react';
import { getSubscriptionPaymentInfo, SubscriptionPaymentInfoResponse, orderSubscription, OrderSubscriptionResponse } from '../utils/subscriptionsAPI';

interface SubscriptionPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionId: string | null;
  planId?: number | null;
}

export function SubscriptionPaymentModal({ isOpen, onClose, subscriptionId, planId = null }: SubscriptionPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<SubscriptionPaymentInfoResponse | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!isOpen || !subscriptionId) return;
      setLoading(true);
      setError('');
      try {
        // Try server endpoint to fetch existing payment info first
        const info = await getSubscriptionPaymentInfo(subscriptionId);
        setPaymentInfo(info);
      } catch (e) {
        // Fallback: if API not available, create a fresh QR by ordering the plan again
        if (planId != null) {
          try {
            const order: OrderSubscriptionResponse = await orderSubscription(Number(planId));
            const mapped: SubscriptionPaymentInfoResponse = {
              success: true,
              message: order.message || 'Đã tạo QR mới cho gói của bạn',
              qrUrl: order.qrUrl,
              bankAccount: order.bankAccount,
              bankName: order.bankName,
              accountHolder: order.accountHolder,
              transferContent: order.transferContent,
              amount: order.amount
            };
            setPaymentInfo(mapped);
          } catch (e2) {
            const msg2 = e2 instanceof Error ? e2.message : 'Không thể tạo QR thanh toán.';
            setError(msg2);
          }
        } else {
          const msg = e instanceof Error ? e.message : 'Không thể tải thông tin thanh toán.';
          setError(msg);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, subscriptionId, planId]);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // noop
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const handleClose = () => {
    onClose();
    setPaymentInfo(null);
    setError('');
    setCopied(null);
  };

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
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="h-6 w-6" />
            </motion.button>

            <div className="bg-espresso p-6">
              <h2 className="text-2xl font-bold text-white font-poppins">Thanh toán lại</h2>
              {subscriptionId && (
                <p className="text-latte mt-1 text-sm">Mã subscription: {subscriptionId}</p>
              )}
            </div>

            <div className="p-6">
              {loading && <div className="text-center">Đang tải thông tin thanh toán...</div>}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              {!loading && !error && paymentInfo && (
                <div className="text-center">
                  <QrCode className="h-12 w-12 text-espresso mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-espresso mb-2 font-poppins">Quét mã QR để thanh toán</h3>

                  <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <img
                      src={paymentInfo.qrUrl}
                      alt="QR Code thanh toán"
                      className="w-64 h-64 mx-auto mb-4 border-2 border-gray-200 rounded-lg"
                    />

                    <div className="text-left space-y-3">
                      <div className="flex justify-between items-center p-3 bg-white rounded border">
                        <div>
                          <span className="text-sm text-gray-600">Ngân hàng:</span>
                          <p className="font-semibold text-espresso">{paymentInfo.bankName}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-white rounded border">
                        <div className="flex-1">
                          <span className="text-sm text-gray-600">Số tài khoản:</span>
                          <p className="font-semibold text-espresso">{paymentInfo.bankAccount}</p>
                        </div>
                        <motion.button
                          onClick={() => copyToClipboard(paymentInfo.bankAccount, 'account')}
                          className="ml-2 p-2 text-gray-500 hover:text-espresso transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {copied === 'account' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </motion.button>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-white rounded border">
                        <div className="flex-1">
                          <span className="text-sm text-gray-600">Nội dung chuyển khoản:</span>
                          <p className="font-semibold text-red-600">{paymentInfo.transferContent}</p>
                        </div>
                        <motion.button
                          onClick={() => copyToClipboard(paymentInfo.transferContent, 'content')}
                          className="ml-2 p-2 text-gray-500 hover:text-espresso transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {copied === 'content' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </motion.button>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-espresso text-white rounded">
                        <div className="flex-1">
                          <span className="text-sm text-latte">Số tiền:</span>
                          <p className="font-bold text-xl">{formatPrice(paymentInfo.amount)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Lưu ý:</strong> Vui lòng chuyển khoản đúng số tiền và nội dung để đơn hàng được xử lý tự động.
                    </p>
                  </div>
                </div>
              )}

              {!loading && !error && !paymentInfo && (
                <div className="text-center text-gray-600">Không có thông tin thanh toán để hiển thị.</div>
              )}

              <div className="text-center mt-4">
                <motion.button
                  onClick={handleClose}
                  className="bg-espresso text-white py-3 px-8 rounded-full font-semibold hover:bg-opacity-90 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Đóng
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


