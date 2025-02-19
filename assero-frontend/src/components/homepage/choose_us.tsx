'use client';
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaPlus } from "react-icons/fa";

const WhyChooseUs = () => {
  const [expanded, setExpanded] = useState(Array(4).fill(false));

  const toggleExpand = (index: number) => {
    const newExpanded = [...expanded];
    newExpanded[index] = !newExpanded[index];
    setExpanded(newExpanded);
  };

  const points = [
    {
      title: "made by the vighnesh palande",
      description: "you have no reason to doubt him. he's a super nice guy" 
    },
    {
      title: "i want marks",
      description: "i worked har for this. please give me marks." 
    },
    {
      title: "blockchain is good",
      description: "blockchain technology provides transparency, immutability, and security, making asset management efficient and trustworthy."
    },
    {
      title: "super futuristic",
      description: "this ahead of the curve, leveraging cutting-edge technology to build solutions for the future."
    }
  ];

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
    <div className="min-h-screen bg-[#17F538] text-black p-4 md:p-6">
      <motion.h2 
        initial="hidden"
        whileInView="visible"
        variants={slideInLeft}
        className="text-[2.5rem] md:text-[3.5rem] lg:text-[4.5rem] font-bold mb-4 md:mb-6"
      >
        why choose us?
      </motion.h2>
      
      <ul className="space-y-4">
        {points.map((point, index) => (
          <motion.li
            key={index}
            initial="hidden"
            whileInView="visible"
            variants={slideInLeft}
            viewport={{ once: true }}
            className="border-b border-black pb-4 text-[1.5rem] md:text-[2.25rem] lg:text-[3.15rem]"
          >
            <motion.div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleExpand(index)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="pr-4">{point.title}</span>
              <motion.div
                animate={{ rotate: expanded[index] ? 45 : 0 }}
                transition={{ duration: 0.3 }}
                className="flex-shrink-0"
              >
                <FaPlus className="text-base md:text-lg" />
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ 
                height: expanded[index] ? "auto" : 0,
                opacity: expanded[index] ? 1 : 0
              }}
              transition={{ duration: 0.3 }}
            >
              {expanded[index] && (
                <p className="mt-2 text-base md:text-lg lg:text-[1.5rem] text-gray-800">{point.description}</p>
              )}
            </motion.div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

export default WhyChooseUs;