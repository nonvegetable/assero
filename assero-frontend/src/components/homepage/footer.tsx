'use client';
import React from "react";
import { motion } from "framer-motion";

const Footer = () => {
  const slideInLeft = {
    hidden: { x: -1000, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100,
        duration: 1
      }
    }
  };

  return (
    <footer className="bg-black text-white p-4 md:p-6">
      <motion.div 
        initial="hidden"
        whileInView="visible"
        variants={slideInLeft}
        className="max-w-7xl mx-auto text-center"
      >
        <motion.p 
          whileHover={{ scale: 1.1 }}
          className="text-xs md:text-sm"
        >
          &copy; {new Date().getFullYear()} Vighnesh Palande
        </motion.p>
        <motion.p className="text-xs md:text-sm mt-2">
          Crafted with{" "}
          <motion.span
            animate={{ 
              scale: [1, 1.2, 1],
            }}
            transition={{ 
              repeat: Infinity,
              duration: 1.5
            }}
          >
            ❤️
          </motion.span>
          {" "}using Blockchain technology.
        </motion.p>
      </motion.div>
    </footer>
  );
};

export default Footer;