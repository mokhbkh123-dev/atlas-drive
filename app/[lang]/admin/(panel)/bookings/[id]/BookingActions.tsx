"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getDict, type Locale } from "@/i18n";

export default function BookingActions({ lang, bookingId, status }: { lang: Locale; bookingId: string; status: string }) {
  const router = useRouter();
  const dict = getDict(lang);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateStatus = async (newStatus: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        setError(
          data.code
            ? dict.apiErrors[data.code as keyof typeof dict.apiErrors] ?? data.error
            : data.error || dict.apiErrors.GENERIC_ERROR
        );
      }
    } catch (error) {
      console.error(error);
      setError(dict.apiErrors.GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">{dict.admin.actions.title}</h3>
        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        <div className="mt-5 flex gap-3">
          {status === "PENDING" && (
            <>
              <button
                onClick={() => updateStatus("CONFIRMED")}
                disabled={loading}
                className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:opacity-50"
              >
                {dict.admin.actions.confirm}
              </button>
              <button
                onClick={() => updateStatus("REJECTED")}
                disabled={loading}
                className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50"
              >
                {dict.admin.actions.reject}
              </button>
            </>
          )}
          {status === "CONFIRMED" && (
            <button
              onClick={() => updateStatus("IN_PROGRESS")}
              disabled={loading}
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
            >
              {dict.admin.actions.start}
            </button>
          )}
          {status === "IN_PROGRESS" && (
            <button
              onClick={() => updateStatus("COMPLETED")}
              disabled={loading}
              className="inline-flex items-center rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 disabled:opacity-50"
            >
              {dict.admin.actions.complete}
            </button>
          )}
          {(status === "PENDING" || status === "CONFIRMED") && (
            <button
              onClick={() => updateStatus("CANCELLED")}
              disabled={loading}
              className="inline-flex items-center rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 disabled:opacity-50"
            >
              {dict.admin.actions.cancel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
