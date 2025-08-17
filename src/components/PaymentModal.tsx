import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Smartphone, Check } from 'lucide-react';
import { Package, PaymentData, PurchaseHistory } from '../types';
import { useAuth } from '../context/AuthContext';
import { storageUtils } from '../utils/localStorage';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage: Package | null;
}

export function PaymentModal({ isOpen, onClose, selectedPackage }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'vnpay'>('card');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { user } = useAuth();

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

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPackage) return;

    setLoading(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const purchase: PurchaseHistory = {
      id: Date.now().toString(),
      userId: user.id,
      packageId: selectedPackage.id,
      packageName: selectedPackage.name,
      price: selectedPackage.price,
      purchaseDate: new Date().toISOString(),
      paymentMethod
    };

    storageUtils.addPurchase(purchase);

    setLoading(false);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      onClose();
      setCardData({ cardHolder: '', cardNumber: '', expiry: '', cvv: '' });
    }, 3000);
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
          onClick={onClose}
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
            ) : (
              <>
                {/* Close Button */}
                <motion.button
                  onClick={onClose}
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
                  <h3 className="text-lg font-semibold text-espresso mb-4 font-poppins">
                    Chọn phương thức thanh toán
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-6">
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
                      <Smartphone className="h-6 w-6 mx-auto mb-2 text-espresso" />
                      <span className="font-medium text-espresso">VNPay</span>
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                          <div className="w-32 h-32 bg-white mx-auto mb-4 rounded-lg flex items-center justify-center">
                            <div className="text-xs text-center">
                              <div>QR Code</div>
                              <div>VNPay</div>
                            </div>
                          </div>
                          <p className="text-espresso font-semibold">
                            Quét mã QR để thanh toán
                          </p>
                          <p className="text-gray-600 text-sm mt-2">
                            Số tiền: {formatPrice(selectedPackage.price)}
                          </p>
                        </div>

                        <motion.button
                          onClick={handlePayment}
                          disabled={loading}
                          className="w-full bg-espresso text-white py-3 rounded-full font-semibold hover:bg-opacity-90 transition-all duration-300 disabled:opacity-50"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {loading ? 'Đang xử lý...' : 'Xác nhận đã thanh toán'}
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