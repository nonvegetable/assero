"use client";
import React, { useState } from "react";
import Link from "next/link";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const inputClass =
    "w-full border border-black rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-black";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Login Data:", formData);
    // Add login API logic here
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Green Strip */}
      <div className="absolute right-0 top-0 h-full w-16 bg-[#17F538]"></div>

      <div className="p-6 pr-20">
        <form
          onSubmit={handleSubmit}
          className="bg-white w-full max-w-3xl p-8 text-black"
        >
          <h1 className="text-[3.5rem] font-bold mb-6 text-black text-left">
            log in
          </h1>

          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-[1.5rem] font-medium mb-1 text-black"
            >
              email address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-[1.5rem] font-medium mb-1 text-black"
            >
              password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#17F538] text-black py-2 px-4 rounded-lg font-medium hover:opacity-80 transition duration-300 border-2 border-black"
          >
            log in
          </button>

          <div className="mt-4 text-left">
            <p className="text-black text-sm">
              new here? on't worry, we all start somewhere.{" "}
              <Link href="/signup" className="text-green-600 underline">
                create an account and join the chaos!
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
