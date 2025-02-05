"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/store/auth-context";
import { Input } from "@/components/ui/input";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [teamName, setTeamName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await signUp(email, password, name, teamName);
      router.push("/scenarios");
    } catch (error: any) {
      setError(error.message || "Failed to create account");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="bg-[#1A1F2E] border-gray-700 text-white placeholder:text-gray-500"
          placeholder="Full name"
        />
        <Input
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          required
          className="bg-[#1A1F2E] border-gray-700 text-white placeholder:text-gray-500"
          placeholder="Team name"
        />
      </div>

      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="bg-[#1A1F2E] border-gray-700 text-white placeholder:text-gray-500"
        placeholder="Email"
      />

      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="bg-[#1A1F2E] border-gray-700 text-white placeholder:text-gray-500"
        placeholder="Enter your password"
      />

      <Input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        className="bg-[#1A1F2E] border-gray-700 text-white placeholder:text-gray-500"
        placeholder="Confirm password"
      />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="terms"
          required
          className="w-4 h-4 rounded border-gray-700 bg-[#1A1F2E]"
        />
        <label htmlFor="terms" className="text-sm text-gray-400">
          I agree to the Terms & Conditions
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 font-medium"
      >
        {loading ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
