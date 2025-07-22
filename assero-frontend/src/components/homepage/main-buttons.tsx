'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaPlus, FaExchangeAlt, FaListAlt } from 'react-icons/fa';

const MainButtons = () => {
  const buttons = [
    {
      href: '/create-asset',
      label: 'create Asset',
      icon: <FaPlus className="text-4xl" />,
      description: 'add a new asset to the blockchain'
    },
    {
      href: '/transfer-asset',
      label: 'transfer Asset',
      icon: <FaExchangeAlt className="text-4xl" />,
      description: 'transfer ownership of your assets'
    },
    {
      href: '/view-asset',
      label: 'view Assets',
      icon: <FaListAlt className="text-4xl" />,
      description: 'see all your registered assets'
    }
  ];

  return (
    <div className="min-h-screen bg-[#17F538] p-6 md:pt-10 md:pb-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {buttons.map((button, index) => (
          <motion.div
            key={button.href}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href={button.href}>
              <div className="relative h-[400px] bg-white border-4 border-black rounded-2xl p-8 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-black transition-all duration-300">
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2,
                    delay: index * 0.3 
                  }}
                  className="mb-6 text-black group-hover:text-white transition-colors"
                >
                  {button.icon}
                </motion.div>
                <h2 className="text-4xl font-bold mb-4 text-black group-hover:text-white transition-colors">
                  {button.label}
                </h2>
                <p className="text-lg text-gray-600 group-hover:text-white transition-colors">
                  {button.description}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MainButtons;