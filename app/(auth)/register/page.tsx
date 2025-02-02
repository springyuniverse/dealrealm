"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/store/auth-context";
import RegisterForm from "./register-form";
import Link from "next/link";

export default function RegisterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/scenarios");
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-[#0A0F1C] flex">
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1C]/80 to-[#0A0F1C]" />
        <div className="relative z-10 p-12 h-full flex flex-col">
          <div>
            <div className="text-white text-3xl font-bold">
              DealRealm
            </div>
            <div className="text-gray-400 text-sm">
              by NorthKraft
            </div>
          </div>
          <div className="flex-1 flex items-center">
            <div>
              <h1 className="text-5xl font-bold text-white mb-6">
                Mastering Sales,<br />
                Creating Success
              </h1>
              <p className="text-gray-300 text-xl">
                Practice your pitch with AI-powered CEO interactions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Create an account
            </h2>
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="text-blue-400 hover:text-blue-300"
              >
                Sign in
              </Link>
            </p>
          </div>

          <RegisterForm />

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#0A0F1C] text-gray-400">
                  Or register with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button 
                onClick={() => {}} 
                className="px-4 py-2 border border-gray-700 rounded-lg text-white hover:bg-gray-800"
              >
                Google
              </button>
              <button 
                onClick={() => {}} 
                className="px-4 py-2 border border-gray-700 rounded-lg text-white hover:bg-gray-800"
              >
                Apple
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
