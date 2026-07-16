"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AdminPanelClient } from "@/components/admin/AdminPanelClient";

export default function AdminPanelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => {
        if (r.status === 401) {
          router.push("/admin");
        } else {
          setAuthorized(true);
        }
      })
      .catch(() => router.push("/admin"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070B12]">
        <Loader2 size={28} className="text-ice-300 animate-spin" />
      </div>
    );
  }

  if (!authorized) return null;

  return <AdminPanelClient />;
}
