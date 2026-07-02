"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import api from "@/lib/axios";
import toast from "react-hot-toast";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  passwordConfirm: z.string()
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Passwords do not match",
  path: ["passwordConfirm"],
});

export default function Signup() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema)
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await api.post("/users/signup", data);
      toast.success("Account created successfully!");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-display font-bold text-center text-foreground mb-2">Create an Account</h2>
      <p className="text-center text-[#64748B] mb-8">Join ResumeAI and land more offers</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input 
            id="name" 
            type="text" 
            placeholder="e.g. John Doe" 
            className="bg-[#F8FAFC] border-[#E2E8F0] focus-visible:ring-primary h-12"
            {...register("name")} 
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="e.g. you@example.com" 
            className="bg-[#F8FAFC] border-[#E2E8F0] focus-visible:ring-primary h-12"
            {...register("email")} 
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            type="password" 
            placeholder="••••••••" 
            className="bg-[#F8FAFC] border-[#E2E8F0] focus-visible:ring-primary h-12"
            {...register("password")} 
          />
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="passwordConfirm">Confirm Password</Label>
          <Input 
            id="passwordConfirm" 
            type="password" 
            placeholder="••••••••" 
            className="bg-[#F8FAFC] border-[#E2E8F0] focus-visible:ring-primary h-12"
            {...register("passwordConfirm")} 
          />
          {errors.passwordConfirm && <p className="text-sm text-destructive">{errors.passwordConfirm.message}</p>}
        </div>

        <Button type="submit" variant="premium" className="w-full h-12 text-md mt-6 shadow-md" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-[#64748B]">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
