import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Edit3, History, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storageUtils } from '../utils/localStorage';
import { packages } from '../data/packages';

export function Profile() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const purchaseHistory = user ? storageUtils.getPurchaseHistory(user.id) : [];

  const handleSave = () => {
    updateProfile(editData);
    setIsEditing(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-latte flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-espresso mb-4">
            Vui lòng đăng nhập để xem profile
          </h2>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-latte py-20 pt-32">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Profile Header */}
          <div className="bg-espresso p-8">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-latte rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-espresso" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white font-poppins">
                  {user.name}
                </h1>
                <p className="text-latte">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            {/* Personal Information */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-espresso font-poppins">
                  Thông Tin Cá Nhân
                </h2>
                <motion.button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-2 text-espresso hover:text-beige transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Edit3 className="h-4 w-4" />
                  <span>{isEditing ? 'Hủy' : 'Chỉnh sửa'}</span>
                </motion.button>
              </div>

              {isEditing ? (
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige focus:border-transparent"
                    />
                  </div>
                  <motion.button
                    onClick={handleSave}
                    className="bg-espresso text-white px-6 py-2 rounded-full hover:bg-opacity-90 transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Lưu thay đổi
                  </motion.button>
                </motion.div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Họ và tên
                    </label>
                    <div className="text-espresso font-semibold">{user.name}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Email
                    </label>
                    <div className="text-espresso font-semibold">{user.email}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Số điện thoại
                    </label>
                    <div className="text-espresso font-semibold">{user.phone}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Purchase History */}
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <History className="h-5 w-5 text-espresso" />
                <h2 className="text-xl font-bold text-espresso font-poppins">
                  Lịch Sử Mua Gói
                </h2>
              </div>

              {purchaseHistory.length > 0 ? (
                <div className="space-y-4">
                  {purchaseHistory.map((purchase) => (
                    <motion.div
                      key={purchase.id}
                      className="bg-latte p-6 rounded-lg border border-beige"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-espresso">
                            {purchase.packageName}
                          </h3>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(purchase.purchaseDate)}</span>
                            </div>
                            <span className="capitalize">
                              {purchase.paymentMethod === 'card' ? 'Thẻ ngân hàng' : 'VNPay'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-espresso">
                            {formatPrice(purchase.price)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Chưa có lịch sử mua gói nào</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}