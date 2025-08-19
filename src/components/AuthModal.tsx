import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [needVerify, setNeedVerify] = useState(false);
  const [verifyToken, setVerifyToken] = useState('');
  const { login, register, verifyAccount, loginWithGoogle } = useAuth();
  // Đăng nhập Google
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const success = await loginWithGoogle();
    if (success) {
      onClose();
    } else {
      setError('Đăng nhập Google thất bại');
    }
    setLoading(false);
  };

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    const success = await login(loginData.email, loginData.password);
    
    if (success) {
      onClose();
      setLoginData({ email: '', password: '' });
    } else {
      setError('Email hoặc mật khẩu không đúng');
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    const success = await register(registerData);
    if (success) {
      // Chuyển sang bước nhập mã xác thực
      setNeedVerify(true);
      setSuccessMsg('Đã gửi mã xác thực tới email. Vui lòng kiểm tra hộp thư và nhập mã.');
    } else {
      setError('Email đã tồn tại hoặc thiếu thông tin');
    }
    setLoading(false);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    const success = await verifyAccount(verifyToken.trim());
    if (success) {
      setSuccessMsg('Xác thực thành công! Vui lòng đăng nhập.');
      setNeedVerify(false);
      setIsLogin(true);
      setVerifyToken('');
      setRegisterData({ name: '', email: '', phone: '', password: '', address: '' });
    } else {
      setError('Mã xác thực không đúng hoặc đã hết hạn');
    }
    setLoading(false);
  };

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
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <motion.button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="h-6 w-6" />
            </motion.button>

            {/* Header */}
            <div className="bg-espresso p-6 text-center">
              <h2 className="text-2xl font-bold text-white font-poppins">
                {isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
              </h2>
              <p className="text-latte mt-2">
                {isLogin ? 'Chào mừng bạn trở lại!' : 'Tạo tài khoản mới'}
              </p>
            </div>

            {/* Form */}
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
              {successMsg && (
                <motion.div
                  className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  {successMsg}
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                {isLogin ? (
                  <motion.form
                    key="login"
                    onSubmit={handleLogin}
                    className="space-y-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        placeholder="Email"
                        value={loginData.email}
                        onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        placeholder="Mật khẩu"
                        value={loginData.password}
                        onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                    <motion.button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-espresso text-white py-3 rounded-full font-semibold hover:bg-opacity-90 transition-all duration-300 disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </motion.button>
                    {/* Google Login Button */}
                    <motion.button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 mt-2 bg-white border border-gray-300 text-gray-700 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <svg width="20" height="20" viewBox="0 0 48 48" className="inline-block"><g><path fill="#4285F4" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.3-5.7 7-10.3 7-6.1 0-11-4.9-11-11s4.9-11 11-11c2.6 0 5 .9 6.9 2.6l6-6C36.1 7.6 30.4 5 24 5 12.9 5 4 13.9 4 25s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.2-.3-3.2z"/><path fill="#34A853" d="M6.3 14.7l6.6 4.8C14.5 16.1 18.8 13 24 13c2.6 0 5 .9 6.9 2.6l6-6C36.1 7.6 30.4 5 24 5c-7.2 0-13.4 4.1-16.7 9.7z"/><path fill="#FBBC05" d="M24 45c6.2 0 11.4-2 15.2-5.4l-7-5.7c-2 1.4-4.5 2.2-8.2 2.2-4.6 0-8.7-2.7-10.3-7H6.2v5.9C9.5 41 16.1 45 24 45z"/><path fill="#EA4335" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.1 3-3.5 5.2-6.3 6.5l7 5.7c-2.8 2.6-6.6 4.3-11 4.3-7.9 0-14.5-4-17.8-10.1l7-5.9c1.6 4.3 5.7 7 10.3 7 2.6 0 5-.9 6.9-2.6l6 6C36.1 40.4 30.4 43 24 43c-11 0-20-8.9-20-20s9-20 20-20c6.4 0 12.1 2.6 16.3 6.7l-6.6 5.2C29 13.9 24 13 24 13c-5.2 0-9.5 3.1-11.1 7.5l-7-5.9C4.5 13.9 12.9 5 24 5c6.4 0 12.1 2.6 16.3 6.7l-6.6 5.2C29 13.9 24 13 24 13c-5.2 0-9.5 3.1-11.1 7.5z"/></g></svg>
                      Đăng nhập với Google
                    </motion.button>
                  </motion.form>
                ) : needVerify ? (
                  <motion.form
                    key="verify"
                    onSubmit={handleVerify}
                    className="space-y-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Nhập mã xác thực từ email"
                        value={verifyToken}
                        onChange={(e) => setVerifyToken(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                    <motion.button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-espresso text-white py-3 rounded-full font-semibold hover:bg-opacity-90 transition-all duration-300 disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? 'Đang xác thực...' : 'Xác thực tài khoản'}
                    </motion.button>
                    <div className="text-center text-sm text-gray-500">
                      Chưa nhận được mã? Vui lòng kiểm tra thư rác hoặc thử lại đăng ký.
                    </div>
                  </motion.form>
                ) : (
                  <motion.form
                    key="register"
                    onSubmit={handleRegister}
                    className="space-y-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Họ và tên"
                        value={registerData.name}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        placeholder="Email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        placeholder="Số điện thoại"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        placeholder="Mật khẩu"
                        value={registerData.password}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Địa chỉ"
                        value={registerData.address}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                    <motion.button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-espresso text-white py-3 rounded-full font-semibold hover:bg-opacity-90 transition-all duration-300 disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Toggle Login/Register */}
              <div className="text-center mt-6">
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setNeedVerify(false);
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="text-espresso hover:text-beige transition-colors duration-200"
                >
                  {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}