import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, RefreshCw, AlertCircle, Wifi, WifiOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { Package } from '../types';
import { getAllPlans, checkPlansApiHealth } from '../utils/planApi';

interface PackagesProps {
  onSelectPackage: (pkg: Package) => void;
}

export function Packages({ onSelectPackage }: PackagesProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const maxRetries = 3;
  const packagesPerPage = 2;

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch plans from API
  const fetchPlans = useCallback(async (isRetry = false) => {
    try {
      setLoading(true);
      setError('');

      // Check API health first
      const isApiHealthy = await checkPlansApiHealth();
      if (!isApiHealthy && !isRetry) {
        throw new Error('API_UNAVAILABLE');
      }

      const data = await getAllPlans();
      
      if (data && data.length > 0) {
        setPackages(data);
        setRetryCount(0); // Reset retry count on success
      } else {
        // No fallback data, just show empty state
        setPackages([]);
        setError('Không có gói dịch vụ nào từ server');
      }
      
    } catch (err: unknown) {
      console.error('Error fetching plans:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      // Handle different error types - no fallback data
      if (errorMessage === 'API_UNAVAILABLE') {
        setError('API không khả dụng');
        setPackages([]);
      } else if (!isOnline) {
        setError('Không có kết nối internet');
        setPackages([]);
      } else if (retryCount < maxRetries) {
        setError(`Lỗi tải dữ liệu, đang thử lại... (${retryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchPlans(true);
        }, 2000);
        return;
      } else {
        setError('Không thể tải gói dịch vụ từ server');
        setPackages([]);
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount, isOnline, maxRetries]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Manual retry function
  const handleRetry = () => {
    setRetryCount(0);
    fetchPlans();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Format duration unit based on durationDays
  const formatDurationUnit = (durationDays?: number) => {
    if (!durationDays) return 'gói';
    
    if (durationDays === 1) return 'ngày';
    if (durationDays <= 7) return `${durationDays} ngày`;
    if (durationDays <= 30) return `${durationDays} ngày`;
    if (durationDays === 30) return 'tháng';
    if (durationDays > 30) return `${durationDays} ngày`;
    
    return 'gói';
  };

  // Pagination functions
  const totalPages = Math.ceil(packages.length / packagesPerPage);
  const startIndex = currentPage * packagesPerPage;
  const endIndex = startIndex + packagesPerPage;
  const currentPackages = packages.slice(startIndex, endIndex);
  
  // Check if any package is popular
  const hasPopularPackage = packages.some(pkg => pkg.popular);

  const goToNextPage = () => {
    setCurrentPage(prev => (prev + 1) % totalPages);
  };

  const goToPrevPage = () => {
    setCurrentPage(prev => (prev - 1 + totalPages) % totalPages);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <section id="packages" className="py-20 bg-gradient-to-br from-latte via-white to-beige-50">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-block mb-4"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="px-4 py-2 bg-beige/20 text-espresso rounded-full text-sm font-medium border border-beige/30">
              ☕ Gói Subscription Premium
            </span>
          </motion.div>
          
          <h2 className="text-5xl md:text-6xl font-bold text-espresso mb-6 font-poppins leading-tight">
            Chọn Gói 
            <span className="block text-transparent bg-gradient-to-r from-espresso via-beige-700 to-espresso bg-clip-text">
              Phù Hợp
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Trải nghiệm cà phê đỉnh cao mỗi ngày với các gói dịch vụ được thiết kế 
            <br className="hidden md:block" />
            riêng cho phong cách sống của bạn
          </p>
          
          {/* Decorative elements */}
          <div className="flex justify-center items-center mt-8 space-x-4">
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-beige to-transparent"></div>
            <div className="w-2 h-2 bg-beige rounded-full"></div>
            <div className="w-8 h-px bg-gradient-to-r from-transparent via-espresso/30 to-transparent"></div>
            <div className="w-1 h-1 bg-espresso/40 rounded-full"></div>
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-beige to-transparent"></div>
          </div>
        </motion.div>

        {/* Status Banners */}
        <div className="max-w-4xl mx-auto mb-12">
          {/* Connection Status Banner */}
          {!isOnline && (
            <motion.div
              className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 text-amber-800 rounded-lg shadow-sm flex items-center space-x-3"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex-shrink-0">
                <WifiOff className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Chế độ offline</p>
                <p className="text-sm text-amber-700">Hiển thị dữ liệu đã lưu. Kết nối internet để cập nhật mới nhất.</p>
              </div>
            </motion.div>
          )}

          {/* Error Banner */}
          {error && (
            <motion.div
              className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 text-blue-800 rounded-lg shadow-sm flex items-center space-x-3"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex-shrink-0">
                <Wifi className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Thông báo hệ thống</p>
                <p className="text-sm text-blue-700">{error}</p>
              </div>
            </motion.div>
          )}
        </div>

        {loading ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative inline-block">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-beige/30 border-t-espresso mx-auto mb-8"></div>
              <div className="absolute inset-0 rounded-full border-2 border-transparent animate-pulse bg-gradient-to-r from-espresso/5 to-beige/5"></div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-espresso font-poppins">Đang tải gói dịch vụ</h3>
              <p className="text-gray-600 text-lg">Chúng tôi đang chuẩn bị những gói tuyệt vời nhất cho bạn...</p>
              
              {retryCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-espresso/5 rounded-full text-espresso border border-espresso/10"
                >
                  <div className="animate-spin w-4 h-4 border-2 border-espresso/30 border-t-espresso rounded-full"></div>
                  <span className="text-sm font-medium">Thử lại lần thứ {retryCount}...</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : packages.length === 0 ? (
          <motion.div
            className="text-center py-16 max-w-2xl mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <AlertCircle className="h-12 w-12 text-gray-400" />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-transparent via-gray-100/50 to-transparent rounded-full blur-xl"></div>
            </div>
            
            <div className="space-y-4 mb-8">
              <h3 className="text-2xl font-bold text-espresso font-poppins">Không có gói dịch vụ</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Hiện tại chúng tôi đang cập nhật các gói dịch vụ mới.
                <br />
                Vui lòng thử lại sau ít phút.
              </p>
            </div>
            
            <motion.button
              onClick={handleRetry}
              className="group relative inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-espresso to-espresso/90 text-white rounded-full hover:from-espresso/90 hover:to-espresso transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
              <span>Thử lại ngay</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.button>
          </motion.div>
        ) : (
          <div className="relative">
            {/* Background decorations */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-20 left-10 w-32 h-32 bg-beige/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-20 right-10 w-40 h-40 bg-espresso/5 rounded-full blur-3xl"></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto items-stretch">
              {currentPackages.map((pkg: Package, index: number) => (
                <motion.div
                  key={pkg.id}
                  className={`group relative overflow-hidden ${
                    pkg.popular && hasPopularPackage
                      ? 'md:scale-105 z-10' 
                      : 'hover:scale-102'
                  }`}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.7, 
                    delay: (index % packagesPerPage) * 0.2,
                    type: "spring",
                    stiffness: 100
                  }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                >
                  {/* Card Container */}
                  <div className={`relative bg-white rounded-3xl shadow-xl overflow-hidden border-2 transition-all duration-500 h-full flex flex-col ${
                    pkg.popular && hasPopularPackage
                      ? 'border-beige shadow-beige/20 shadow-2xl' 
                      : 'border-gray-100 hover:border-beige/50 hover:shadow-2xl'
                  }`}>
                    
                    {/* Popular Badge */}
                    {pkg.popular && (
                      <div className="absolute top-6 right-6 z-20">
                        <motion.div
                          className="bg-gradient-to-r from-beige to-beige/90 text-espresso px-4 py-2 rounded-full text-sm font-bold flex items-center space-x-2 shadow-lg"
                          initial={{ scale: 0, rotate: -180 }}
                          whileInView={{ scale: 1, rotate: 0 }}
                          transition={{ duration: 0.6, delay: (index % packagesPerPage) * 0.2 + 0.3 }}
                        >
                          <Star className="h-4 w-4 fill-current" />
                          <span>Phổ biến nhất</span>
                        </motion.div>
                      </div>
                    )}

                    {/* Image Section */}
                    <div className="relative h-56 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
                      <motion.img 
                        src={pkg.image} 
                        alt={pkg.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        whileHover={{ scale: 1.1 }}
                      />
                      
                      {/* Price overlay */}
                      <div className="absolute bottom-4 left-4 z-20">
                        <motion.div
                          className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: (index % packagesPerPage) * 0.2 + 0.5 }}
                        >
                          <div className="text-2xl font-bold text-espresso">
                            {formatPrice(pkg.price)}
                          </div>
                          <div className="text-xs text-gray-500 -mt-1">
                            / {formatDurationUnit(pkg.durationDays)}
                          </div>
                        </motion.div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-8 flex-1 flex flex-col">
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-espresso mb-3 font-poppins group-hover:text-beige-800 transition-colors">
                          {pkg.name}
                        </h3>
                        <p className="text-gray-600 leading-relaxed text-base">
                          {pkg.description}
                        </p>
                      </div>

                      {/* Features List */}
                      <div className="mb-8 flex-1">
                        <h4 className="text-sm font-semibold text-espresso/70 uppercase tracking-wide mb-4 flex items-center">
                          <div className="w-2 h-2 bg-beige rounded-full mr-2"></div>
                          Những gì bạn nhận được
                        </h4>
                        <ul className="space-y-3">
                          {pkg.features.map((feature: string, idx: number) => (
                            <motion.li 
                              key={idx} 
                              className="flex items-center space-x-3 group/item"
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.4, delay: (index % packagesPerPage) * 0.1 + idx * 0.1 }}
                            >
                              <div className="flex-shrink-0">
                                <div className="w-5 h-5 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
                                  <Check className="h-3 w-3 text-white stroke-2" />
                                </div>
                              </div>
                              <span className="text-gray-700 group-hover/item:text-gray-900 transition-colors font-medium">
                                {feature}
                              </span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>

                      {/* CTA Button */}
                      <motion.button
                        onClick={() => onSelectPackage(pkg)}
                        className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 relative overflow-hidden group/btn ${
                          pkg.popular && hasPopularPackage
                            ? 'bg-gradient-to-r from-espresso via-espresso/90 to-espresso text-white shadow-lg hover:shadow-xl'
                            : 'bg-gradient-to-r from-gray-50 to-gray-100 text-espresso border-2 border-espresso/10 hover:from-espresso hover:to-espresso/90 hover:text-white hover:border-espresso'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="relative z-10">Đăng ký ngay</span>
                        
                        {/* Button shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
                        
                        {/* Button background animation */}
                        <div className="absolute inset-0 bg-gradient-to-r from-beige/0 via-beige/10 to-beige/0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                      </motion.button>
                    </div>
                  </div>

                  {/* Card glow effect */}
                  {pkg.popular && hasPopularPackage && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-beige/20 via-espresso/10 to-beige/20 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Pagination Controls */}
            {packages.length > packagesPerPage && (
              <motion.div 
                className="flex justify-center items-center space-x-6 mt-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {/* Previous Button */}
                <motion.button
                  onClick={goToPrevPage}
                  className="group flex items-center space-x-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-full hover:border-espresso hover:bg-espresso hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.05, x: -5 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={totalPages <= 1}
                >
                  <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
                  <span className="font-medium">Trước</span>
                </motion.button>

                {/* Page Indicators */}
                <div className="flex items-center space-x-3">
                  {Array.from({ length: totalPages }, (_, index) => (
                    <motion.button
                      key={index}
                      onClick={() => goToPage(index)}
                      className={`w-12 h-12 rounded-full font-bold text-sm transition-all duration-300 ${
                        currentPage === index
                          ? 'bg-gradient-to-r from-espresso to-espresso/90 text-white shadow-lg scale-110'
                          : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-espresso hover:text-espresso hover:scale-105'
                      }`}
                      whileHover={{ scale: currentPage === index ? 1.1 : 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {index + 1}
                    </motion.button>
                  ))}
                </div>

                {/* Next Button */}
                <motion.button
                  onClick={goToNextPage}
                  className="group flex items-center space-x-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-full hover:border-espresso hover:bg-espresso hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.05, x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={totalPages <= 1}
                >
                  <span className="font-medium">Tiếp</span>
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </motion.button>
              </motion.div>
            )}

            {/* Package Counter */}
            {packages.length > packagesPerPage && (
              <motion.div 
                className="text-center mt-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <p className="text-gray-500 text-sm">
                  Hiển thị {startIndex + 1}-{Math.min(endIndex, packages.length)} của {packages.length} gói dịch vụ
                </p>
              </motion.div>
            )}
          </div>
        )}
        
        
        {/* Bottom decoration */}
        <motion.div 
          className="text-center mt-16 pt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="flex justify-center items-center space-x-4 mb-6">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-beige to-transparent"></div>
            <div className="w-2 h-2 bg-beige rounded-full"></div>
            <div className="w-1 h-1 bg-espresso/40 rounded-full"></div>
            <div className="w-2 h-2 bg-beige rounded-full"></div>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-beige to-transparent"></div>
          </div>
          
          <p className="text-gray-500 text-sm">
            ✨ Tất cả gói dịch vụ đều có thể hủy bất cứ lúc nào • Không ràng buộc dài hạn
          </p>
        </motion.div>
      </div>
    </section>
  );
}
