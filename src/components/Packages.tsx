import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import { packages } from '../data/packages';
import { Package } from '../types';

interface PackagesProps {
  onSelectPackage: (pkg: Package) => void;
}

export function Packages({ onSelectPackage }: PackagesProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <section id="packages" className="py-20 bg-latte">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-espresso mb-4 font-poppins">
            Chọn Gói Phù Hợp
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Lựa chọn gói dịch vụ phù hợp với nhu cầu của bạn. Tất cả đều đảm bảo chất lượng cao nhất.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              className={`relative bg-white rounded-2xl shadow-xl overflow-hidden ${
                pkg.popular ? 'ring-4 ring-beige transform scale-105' : ''
              }`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              {pkg.popular && (
                <div className="absolute top-4 right-4 bg-beige text-espresso px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                  <Star className="h-4 w-4" />
                  <span>Phổ biến</span>
                </div>
              )}

              <div className="h-48 overflow-hidden">
                <img 
                  src={pkg.image} 
                  alt={pkg.name}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                />
              </div>

              <div className="p-8">
                <h3 className="text-2xl font-bold text-espresso mb-2 font-poppins">
                  {pkg.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {pkg.description}
                </p>

                <div className="mb-6">
                  <div className="text-3xl font-bold text-espresso mb-1">
                    {formatPrice(pkg.price)}
                  </div>
                  <div className="text-sm text-gray-500">mỗi tháng</div>
                </div>

                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <motion.button
                  onClick={() => onSelectPackage(pkg)}
                  className="w-full bg-espresso text-white py-3 rounded-full font-semibold hover:bg-opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Đăng ký ngay
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}