"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCheck, Loader2 } from "lucide-react";

export function MarkAllReadButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleMarkAll = async () => {
    setLoading(true);
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleMarkAll} disabled={loading} variant="outline" size="sm">
      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCheck className="w-4 h-4 mr-1" />}
      Mark all read
    </Button>
  );
}

export function MarkReadButton({ id }: { id: string }) {
  const router = useRouter();

  const handleMark = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  };

  return (
    <button onClick={handleMark} className="text-xs text-blue-600 hover:underline">
      Mark read
    </button>
  );
}
