"use client";

import React from "react";
import Home from "../components/homepage/home";
import WeDo from "../components/homepage/we_do";
import ChooseUs from "../components/homepage/choose_us";
import Footer from "../components/homepage/footer";
import MainButtons from "@/components/homepage/main-buttons";

const HomePage = () => {
  return (
    <div>
      <Home />
      <MainButtons />
      <WeDo />
      <ChooseUs />
      <Footer />
    </div>
  );
};

export default HomePage;
