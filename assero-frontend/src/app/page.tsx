"use client";

import Home from "@/components/homepage/home";
import MainButtons from "@/components/homepage/main-buttons";
import WeDo from "@/components/homepage/we_do";
import ChooseUs from "@/components/homepage/choose_us";
import Footer from "@/components/homepage/footer";

export default function HomePage() {
  return (
    <div>
      <Home />
      <MainButtons />
      <WeDo />
      <ChooseUs />
      <Footer />
    </div>
  );
}
