"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "@/context/AuthContext";

interface JwtPayload {
  id: string;
  role: string;
  name?: string;
  email?: string;
  profile_picture?: string;
  exp?: number;
}

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    console.log(token)
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      // Decode the token properly
      const payload: JwtPayload = jwtDecode(token);
      console.log(payload)

      const userData = {
        id: payload.id,
        role: payload.role,
        name: payload.name || "",
        email: payload.email || "",
        profile_picture: payload.profile_picture || "",
      };

      // Store token and user details in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      // Redirect based on role
      router.push(payload.role === "admin" ? "/admin/dashboard" : "/appointments");
    } catch (error) {
      console.error("Error decoding token:", error);
      router.push("/login");
    }
  }, [router, searchParams, setUser]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
