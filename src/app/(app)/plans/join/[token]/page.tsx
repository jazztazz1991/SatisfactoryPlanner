"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Spinner } from "@/components/shared/Spinner";

export default function JoinPlanPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function join() {
      try {
        const res = await fetch(`/api/plans/join/${token}`, { method: "POST" });
        const data = await res.json();

        if (!res.ok) {
          setStatus("error");
          setMessage(data.error ?? "Failed to join plan");
          return;
        }

        setStatus("success");
        const planId = data.planId ?? data.id;
        if (planId) {
          setMessage("Joined! Redirecting to plan...");
          router.push(`/plans/${planId}`);
        } else {
          setMessage(data.message ?? "Joined successfully!");
          router.push("/dashboard");
        }
      } catch {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    }

    join();
  }, [token, router]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-white">
      {status === "loading" && (
        <>
          <Spinner label="Joining plan" />
          <p className="text-gray-400">Joining plan...</p>
        </>
      )}
      {status === "success" && (
        <p className="text-green-400">{message}</p>
      )}
      {status === "error" && (
        <div className="text-center">
          <p className="mb-4 text-red-400">{message}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
