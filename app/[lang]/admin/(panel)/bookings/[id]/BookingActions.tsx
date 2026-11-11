"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getDict, type Locale } from "@/i18n";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui";

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
    <Card>
      <CardHeader>
        <CardTitle>{dict.admin.actions.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-admin-danger/30 bg-admin-danger/10 px-4 py-3 text-sm text-admin-danger"
          >
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          {status === "PENDING" && (
            <>
              <Button variant="primary" size="sm" onClick={() => updateStatus("CONFIRMED")} disabled={loading}>
                {dict.admin.actions.confirm}
              </Button>
              <Button variant="danger" size="sm" onClick={() => updateStatus("REJECTED")} disabled={loading}>
                {dict.admin.actions.reject}
              </Button>
            </>
          )}
          {status === "CONFIRMED" && (
            <Button variant="secondary" size="sm" onClick={() => updateStatus("IN_PROGRESS")} disabled={loading}>
              {dict.admin.actions.start}
            </Button>
          )}
          {status === "IN_PROGRESS" && (
            <Button variant="secondary" size="sm" onClick={() => updateStatus("COMPLETED")} disabled={loading}>
              {dict.admin.actions.complete}
            </Button>
          )}
          {(status === "PENDING" || status === "CONFIRMED") && (
            <Button variant="ghost" size="sm" onClick={() => updateStatus("CANCELLED")} disabled={loading}>
              {dict.admin.actions.cancel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
