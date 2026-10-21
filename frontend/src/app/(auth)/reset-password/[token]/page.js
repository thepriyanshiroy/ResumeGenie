"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import api from "@/lib/axios";
import toast from "react-hot-toast";

const resetSchema = z.object({
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(64, "Password must not exceed 64 characters"),
  passwordConfirm: z
    .string({ required_error: "Please confirm your password" })
    .min(1, "Please confirm your password")
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Passwords do not match",
  path: ["passwordConfirm"],
});

export default function ResetPassword() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetSchema),
    mode: "onBlur"
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await api.patch(`/users/resetPassword/${token}`, {
        password: data.password,
        passwordConfirm: data.passwordConfirm
      });
      
      localStorage.setItem("token", response.data.token);
      
      toast.success("Password reset successfully!");
      setIsSuccess(true);
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired token");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-4">
        <div className="mb-6 mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold mb-2 text-foreground font-display">Success!</h3>
        <p className="text-[#64748B] mb-6">Your password has been successfully reset. Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-display font-bold text-center text-foreground mb-2">Set New Password</h2>
      <p className="text-center text-[#64748B] mb-8">
        Please enter your new password below.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="password">New Password *</Label>
          <Input 
            id="password" 
            type="password" 
            placeholder="At least 8 characters" 
            className={`bg-[#F8FAFC] h-12 ${
              errors.password ? "border-red-500 focus-visible:ring-red-400" : "border-[#E2E8F0] focus-visible:ring-primary"
            }`}
            {...register("password")} 
          />
          {errors.password && <p className="text-xs sm:text-sm text-red-600">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="passwordConfirm">Confirm New Password *</Label>
          <Input 
            id="passwordConfirm" 
            type="password" 
            placeholder="Re-enter password" 
            className={`bg-[#F8FAFC] h-12 ${
              errors.passwordConfirm ? "border-red-500 focus-visible:ring-red-400" : "border-[#E2E8F0] focus-visible:ring-primary"
            }`}
            {...register("passwordConfirm")} 
          />
          {errors.passwordConfirm && <p className="text-xs sm:text-sm text-red-600">{errors.passwordConfirm.message}</p>}
        </div>

        <Button type="submit" variant="premium" className="w-full min-h-12 text-md mt-6 shadow-md" disabled={isLoading}>
          {isLoading ? "Saving..." : "Reset Password"}
        </Button>
      </form>
    </div>
  );
}
