"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import api from "@/lib/axios";
import toast from "react-hot-toast";

const forgotSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address (e.g. you@example.com)"),
});

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotSchema),
    mode: "onBlur"
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await api.post("/users/forgotPassword", {
        email: data.email.trim().toLowerCase()
      });
      setIsSent(true);
      toast.success("Password reset link sent to your email");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong. Please check your email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-display font-bold text-center text-foreground mb-2">Reset Password</h2>
      <p className="text-center text-[#64748B] mb-8">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>

      {!isSent ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="e.g. you@example.com" 
              className={`bg-[#F8FAFC] h-12 ${
                errors.email ? "border-red-500 focus-visible:ring-red-400" : "border-[#E2E8F0] focus-visible:ring-primary"
              }`}
              {...register("email")} 
            />
            {errors.email && <p className="text-xs sm:text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <Button type="submit" variant="premium" className="w-full min-h-12 text-md mt-4 shadow-md" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      ) : (
        <div className="text-center py-4">
          <div className="mb-6 mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2 text-foreground font-display">Check your email</h3>
          <p className="text-[#64748B] mb-6">We&apos;ve sent a password reset link to your email address.</p>
        </div>
      )}

      <div className="mt-8 text-center text-sm text-[#64748B]">
        <Link href="/login" className="text-primary font-medium hover:underline flex items-center justify-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to login
        </Link>
      </div>
    </div>
  );
}
