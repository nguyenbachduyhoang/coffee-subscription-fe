import React from 'react';
import { motion } from 'framer-motion';
import { Coffee, MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-espresso text-latte">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center space-x-2 mb-4">
              <Coffee className="h-8 w-8" />
              <span className="text-xl font-bold font-poppins">CafeDaily</span>
            </div>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Mang đến trải nghiệm cà phê tuyệt vời mỗi ngày với dịch vụ subscription 
              chất lượng cao và tiện lợi nhất.
            </p>
            <p className="text-sm text-gray-400">
              Chất lượng là ưu tiên hàng đầu của chúng tôi.
            </p>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-bold mb-4 font-poppins">Liên Hệ</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-beige" />
                <span className="text-gray-300 text-sm">
                  123 Đường Nguyễn Huệ, Quận 1, TP.HCM
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-beige" />
                <span className="text-gray-300 text-sm">0901 234 567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-beige" />
                <span className="text-gray-300 text-sm">info@cafedaily.vn</span>
              </div>
            </div>
          </motion.div>

          {/* Social Media */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-bold mb-4 font-poppins">Kết Nối</h3>
            <div className="flex space-x-4">
              <motion.a
                href="#"
                className="w-10 h-10 bg-latte bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors duration-200"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Facebook className="h-5 w-5" />
              </motion.a>
              <motion.a
                href="#"
                className="w-10 h-10 bg-latte bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors duration-200"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Instagram className="h-5 w-5" />
              </motion.a>
              <motion.a
                href="#"
                className="w-10 h-10 bg-latte bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors duration-200"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Twitter className="h-5 w-5" />
              </motion.a>
            </div>
            <div className="mt-6">
              <h4 className="font-semibold mb-2">Giờ hoạt động</h4>
              <p className="text-gray-300 text-sm">
                Thứ 2 - Chủ nhật<br />
                6:00 AM - 10:00 PM
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="border-t border-gray-600 mt-8 pt-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-400 text-sm">
            © 2025 CafeDaily – All rights reserved. Made with ❤️ in Vietnam.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}