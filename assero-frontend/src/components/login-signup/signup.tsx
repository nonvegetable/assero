"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/utils/firebase";
import toast from "react-hot-toast";

const Signup = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const inputClass =
    "w-full border border-black rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-black";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create user in Firebase
      await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Show success message
      toast.success("Account created successfully! Please log in.");

      // Redirect to login page
      router.push("/login");
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
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
            sign up
          </h1>

          <div className="mb-6">
            <label
              htmlFor="name"
              className="block text-[1.5rem] font-medium mb-1 text-black"
            >
              full name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

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
            disabled={loading}
          >
            {loading ? "Signing up..." : "sign up"}
          </button>

          <div className="mt-4 text-left">
            <p className="text-black text-sm">
              Already in the club? Great!{" "}
              <Link href="/login" className="text-green-600 underline">
                Head over to the login page and get back to work!
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
