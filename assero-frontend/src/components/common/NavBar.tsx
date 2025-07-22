'use client';
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const NavBar = () => {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex justify-between items-center p-4 pr-24 space-x-4 md:space-x-6 text-black font-medium"
    >
      <Link href="/">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-2xl md:text-3xl font-bold ml-2"
        >
          assero
        </motion.div>
      </Link>

      <div className="flex space-x-4 md:space-x-6">
        {[
          { label: "home", href: "/" },
          { label: "view assets", href: "/view-asset" },
          { label: "create asset", href: "/create-asset" },
          { label: "transfer asset", href: "/transfer-asset" },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            whileHover={{ scale: 1.1 }}
            className="text-sm md:text-base hover:underline"
          >
            <Link href={item.href}>{item.label}</Link>
          </motion.div>
        ))}
      </div>
    </motion.nav>
  );
};

export default NavBar;