"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AuthCallback() {
  const router = useRouter();
  const { checkAuth, setUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const userData = await checkAuth();
        if (!userData) {
          router.push("/login");
          return;
        }
        
        setUser(userData);
        router.push(userData.role === "admin" ? "/admin/dashboard" : "/appointments");
      } catch (error) {
        console.error("Error in auth callback:", error);
        router.push("/login");
      }
    };

    handleCallback();
  }, [router, checkAuth, setUser]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
