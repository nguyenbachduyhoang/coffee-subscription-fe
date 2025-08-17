import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Coffee } from 'lucide-react';

interface HeroProps {
  onShowPackages: () => void;
}

export function Hero({ onShowPackages }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/2889440/pexels-photo-2889440.jpeg?auto=compress&cs=tinysrgb&w=1920)',
        }}
      >
        <div className="absolute inset-0 bg-espresso bg-opacity-60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          className="mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Coffee className="h-16 w-16 text-latte mx-auto animate-bounce-gentle" />
        </motion.div>

        <motion.h1
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 font-poppins leading-tight"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Cà Phê Ngon
          <br />
          <span className="text-latte">Mỗi Ngày</span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Đăng ký subscription và thưởng thức cà phê chất lượng cao được giao tận nơi mỗi ngày. 
          Tiện lợi, tiết kiệm và luôn đảm bảo chất lượng.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <motion.button
            onClick={onShowPackages}
            className="bg-latte text-espresso px-8 py-4 rounded-full font-semibold text-lg flex items-center space-x-2 hover:bg-beige transition-all duration-300 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Xem Gói Dịch Vụ</span>
            <ArrowRight className="h-5 w-5" />
          </motion.button>

          <motion.button
            className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-espresso transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Tìm hiểu thêm
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-8 border-t border-white border-opacity-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-latte mb-2">10K+</div>
            <div className="text-gray-300">Khách hàng hài lòng</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-latte mb-2">50K+</div>
            <div className="text-gray-300">Ly cà phê đã phục vụ</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-latte mb-2">99%</div>
            <div className="text-gray-300">Tỷ lệ hài lòng</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}