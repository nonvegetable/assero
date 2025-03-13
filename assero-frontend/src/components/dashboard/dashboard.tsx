"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const Dashboard = () => {

  return (
    <div className="min-h-screen bg-[#17F538] text-black overflow-hidden">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex justify-end p-4 space-x-4 md:space-x-6 text-black font-medium"
      >
        {[
          { label: "home", href: "/" },
          { label: "view assets", href: "/view-asset" },
          { label: "create assets", href: "/create-asset" },
          { label: "transfer assets", href: "/transfer-asset" },
          { label: "logout", href: "/logout" }, // handle logout later
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
      </motion.nav>

      {/* Main Dashboard Content */}
      <div className="flex flex-col items-start justify-start h-[calc(100vh-64px)] px-4 md:px-12 py-8">
        <motion.h1
          initial={{ x: -1000 }}
          animate={{ x: 0 }}
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 100,
            duration: 1,
          }}
          className="text-[2.5rem] md:text-[4.5rem] lg:text-[5rem] font-bold text-left leading-tight mb-6"
        >
          welcome back, <br />
            asset master
        </motion.h1>

        <p className="text-lg md:text-xl mb-8">what would you like to do today?</p>

        <div className="flex flex-wrap gap-6">
          <Link href="/view-asset">
            <button className="bg-black text-white px-6 py-3 rounded-lg hover:opacity-80 transition">
              view assets
            </button>
          </Link>
          <Link href="/create-asset">
            <button className="bg-black text-white px-6 py-3 rounded-lg hover:opacity-80 transition">
              create assets
            </button>
          </Link>
          <Link href="/transfer-asset">
            <button className="bg-black text-white px-6 py-3 rounded-lg hover:opacity-80 transition">
              transfer assets
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
