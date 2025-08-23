import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Package as PackageIcon, DollarSign, RefreshCw, AlertCircle, CheckCircle, XCircle, QrCode } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserSubscriptions, cancelSubscription } from '../utils/subscriptionsAPI';
import { SubscriptionPaymentModal } from './SubscriptionPaymentModal';

interface UserSubscription {
  subscriptionId: string;
  planId: number;
  planName: string;
  status: string;
  startDate: string;
  endDate: string;
  price: number;
  productName?: string;
  imageUrl?: string;
  remainingDays?: number | null;
}

export function Subscription() {
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const { user } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    }
  }, [user]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getUserSubscriptions();
      setSubscriptions(data);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải danh sách subscription.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      setCancellingId(subscriptionId);
      const success = await cancelSubscription(subscriptionId);
      
      if (success) {
        // Refresh the subscriptions list and remove from local fallback store if present
        setSubscriptions(prev => prev.filter(s => s.subscriptionId !== subscriptionId));
      }
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể hủy subscription.';
      setError(errorMessage);
    } finally {
      setCancellingId('');
    }
  };

  const handleRepay = (subscriptionId: string, planId: number) => {
    setSelectedSubscriptionId(subscriptionId);
    setSelectedPlanId(planId);
    setShowPaymentModal(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      case 'expired':
        return 'text-gray-600 bg-gray-100';
      case 'pendingpayment':
        return 'text-yellow-700 bg-yellow-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'Đang hoạt động';
      case 'cancelled':
        return 'Đã hủy';
      case 'expired':
        return 'Đã hết hạn';
      case 'pendingpayment':
        return 'Chờ thanh toán';
      default:
        return status;
    }
  };

  // Pagination derived values
  const totalPages = Math.max(1, Math.ceil(subscriptions.length / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentItems = subscriptions.slice(startIndex, endIndex);

  if (loading) {
    return (
      <section className="min-h-screen bg-latte py-20 pt-32">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-beige/30 border-t-espresso mx-auto mb-8"></div>
            <h3 className="text-2xl font-bold text-espresso font-poppins">Đang tải subscriptions</h3>
            <p className="text-gray-600 text-lg">Vui lòng chờ trong giây lát...</p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-latte py-20 pt-32">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-espresso mb-4 font-poppins">
            Subscription Của Tôi
          </h1>
          <p className="text-lg text-gray-700">
            Quản lý và theo dõi các gói subscription của bạn
          </p>
        </motion.div>

        {error && (
          <motion.div
            className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-8 flex items-center space-x-3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Có lỗi xảy ra</p>
              <p className="text-sm">{error}</p>
            </div>
            <motion.button
              onClick={fetchSubscriptions}
              className="ml-auto p-2 hover:bg-red-200 rounded-full transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="h-4 w-4" />
            </motion.button>
          </motion.div>
        )}

        <motion.div
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {subscriptions.length === 0 ? (
            <div className="text-center py-16 px-8">
              <PackageIcon className="h-16 w-16 mx-auto mb-6 text-gray-400" />
              <h3 className="text-2xl font-bold text-espresso mb-4 font-poppins">
                Chưa có subscription nào
              </h3>
              <p className="text-gray-600 mb-8">
                Bạn chưa có gói subscription nào. Hãy chọn một gói phù hợp để bắt đầu trải nghiệm dịch vụ của chúng tôi.
              </p>
              <motion.button
                onClick={() => window.location.hash = 'packages'}
                className="bg-espresso text-white px-8 py-3 rounded-full font-semibold hover:bg-opacity-90 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Xem gói dịch vụ
              </motion.button>
            </div>
          ) : (
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-espresso font-poppins">
                  Danh Sách Subscription
                </h2>
                <motion.button
                  onClick={fetchSubscriptions}
                  className="flex items-center space-x-2 text-espresso hover:text-beige transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Làm mới</span>
                </motion.button>
              </div>

              <div className="space-y-6">
                {currentItems.map((subscription, index) => (
                  <motion.div
                    key={subscription.subscriptionId}
                    className="bg-latte rounded-xl p-6 border border-beige hover:shadow-lg transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          {subscription.imageUrl && (
                            <img
                              src={subscription.imageUrl}
                              alt={subscription.productName || subscription.planName}
                              className="w-12 h-12 rounded-md object-cover border"
                            />
                          )}
                          <h3 className="text-xl font-bold text-espresso font-poppins">
                            {subscription.planName}
                          </h3>
                        </div>

                        {(subscription.productName || (subscription.remainingDays != null && subscription.remainingDays > 0)) && (
                          <div className="text-sm text-gray-600 mb-4">
                            {subscription.productName && (
                              <span>Sản phẩm: <span className="font-medium text-espresso">{subscription.productName}</span></span>
                            )}
                            {subscription.remainingDays != null && subscription.remainingDays > 0 && (
                              <span className={`ml-${subscription.productName ? '2' : '0'} text-espresso`}>Còn {subscription.remainingDays} ngày</span>
                            )}
                          </div>
                        )}

                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <div>
                              <div className="text-gray-500">Bắt đầu</div>
                              <div className="font-medium text-espresso">
                                {formatDate(subscription.startDate)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <div>
                              <div className="text-gray-500">Kết thúc</div>
                              <div className="font-medium text-espresso">
                                {formatDate(subscription.endDate)}
                              </div>
                            </div>
                          </div>

                          {subscription.price > 0 && (
                            <div className="flex items-center space-x-2">
                              <DollarSign className="h-4 w-4 text-gray-500" />
                              <div>
                                <div className="text-gray-500">Giá</div>
                                <div className="font-bold text-espresso text-lg">
                                  {formatPrice(subscription.price)}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col md:items-end gap-3 ml-4 w-full md:w-auto">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 self-end ${getStatusColor(subscription.status)}`}>
                          {getStatusIcon(subscription.status)}
                          <span>{getStatusText(subscription.status)}</span>
                        </span>

                        {subscription.status.toLowerCase() === 'pendingpayment' && (
                          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto">
                            <motion.button
                              onClick={() => handleRepay(subscription.subscriptionId, subscription.planId)}
                              className="px-4 py-2 bg-espresso text-white rounded-lg hover:bg-opacity-90 transition-colors duration-200 text-sm font-medium flex items-center justify-center gap-2 w-full md:w-auto"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <QrCode className="h-4 w-4" />
                              <span>Thanh toán lại</span>
                            </motion.button>
                            <motion.button
                              onClick={() => handleCancelSubscription(subscription.subscriptionId)}
                              disabled={cancellingId === subscription.subscriptionId}
                              className="px-4 py-2 bg-white text-red-600 border border-red-500 rounded-lg hover:bg-red-50 transition-colors duration-200 disabled:opacity-50 text-sm font-medium w-full md:w-auto"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {cancellingId === subscription.subscriptionId ? (
                                <div className="flex items-center space-x-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent"></div>
                                  <span>Đang hủy...</span>
                                </div>
                              ) : (
                                'Hủy đơn (Chờ thanh toán)'
                              )}
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="px-3 py-2 rounded-full border border-gray-300 text-espresso disabled:opacity-50"
                    disabled={safePage === 1}
                  >
                    Trước
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-full text-sm font-semibold transition-colors ${
                        page === safePage
                          ? 'bg-espresso text-white'
                          : 'bg-white border border-gray-300 text-espresso hover:border-espresso'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="px-3 py-2 rounded-full border border-gray-300 text-espresso disabled:opacity-50"
                    disabled={safePage === totalPages}
                  >
                    Tiếp
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
      <SubscriptionPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        subscriptionId={selectedSubscriptionId}
        planId={selectedPlanId}
      />
    </section>
  );
}
