'use client';
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import NavBar from "../common/NavBar";

const Home = () => {
  return (
    <div className="min-h-screen bg-[#17F538] text-black overflow-hidden">
      {/* <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex justify-end p-4 space-x-4 md:space-x-6 text-black font-medium"
      >
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
      </motion.nav> */}
      <NavBar />

      <div className="flex items-center justify-center h-[calc(100vh-64px)] px-4 md:px-6">
        <motion.h1
          initial={{ x: -1000 }}
          animate={{ x: 0 }}
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 100,
            duration: 1,
          }}
          className="text-[2.5rem] md:text-[4.5rem] lg:text-[6.75rem] font-bold text-left leading-tight"
        >
          blockchain asset <br /> 
          management made simple
        </motion.h1>
      </div>
    </div>
  );
};

export default Home;
