"use client";

import React from "react";
import Home from "../components/homepage/home";
import WeDo from "../components/homepage/we_do";
import ChooseUs from "../components/homepage/choose_us";
import Footer from "../components/homepage/footer";

const HomePage = () => {
  return (
    <div>
      <Home />
      <WeDo />
      <ChooseUs />
      <Footer />
    </div>
  );
};

export default HomePage;
