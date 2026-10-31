"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Dictionary } from "@/i18n";
import { Button, ConfirmDialog } from "@/components/admin/ui";
import { useToast } from "@/components/admin/ui/toast";
import { fleetError } from "./helpers";

export function CarDetailActions({
  lang,
  dict,
  carId,
  status,
}: {
  lang: string;
  dict: Dictionary;
  carId: string;
  status: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isArchived = status === "ARCHIVED";

  async function updateStatus(nextStatus: "ARCHIVED" | "DRAFT") {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/cars/${carId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast(fleetError(dict, data.code, data.error), "error");
        return;
      }
      toast(
        isArchived
          ? dict.fleet.toasts.unarchived
          : dict.fleet.toasts.archived,
        "success"
      );
      router.refresh();
    } catch {
      toast(dict.fleet.errors.GENERIC, "error");
    } finally {
      setLoading(false);
      setArchiveOpen(false);
    }
  }

  async function deleteCar() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/cars/${carId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast(fleetError(dict, data.code, data.error), "error");
        return;
      }
      toast(dict.fleet.toasts.deleted, "success");
      router.push(`/${lang}/admin/cars`);
      router.refresh();
    } catch {
      toast(dict.fleet.errors.GENERIC, "error");
    } finally {
      setLoading(false);
      setDeleteOpen(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="secondary"
        onClick={() => {
          const el = document.getElementById("edit");
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }}
      >
        {dict.fleet.detail.edit}
      </Button>
      {isArchived ? (
        <Button variant="secondary" onClick={() => updateStatus("DRAFT")} disabled={loading}>
          {dict.fleet.detail.unarchive}
        </Button>
      ) : (
        <Button variant="secondary" onClick={() => setArchiveOpen(true)} disabled={loading}>
          {dict.fleet.detail.archive}
        </Button>
      )}
      <Button variant="danger" onClick={() => setDeleteOpen(true)} disabled={loading}>
        {dict.fleet.detail.delete}
      </Button>

      <ConfirmDialog
        open={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        title={dict.fleet.detail.archiveTitle}
        description={dict.fleet.detail.archiveDescription}
        confirmLabel={dict.fleet.detail.archive}
        cancelLabel={dict.fleet.form.cancel}
        destructive={false}
        onConfirm={() => updateStatus("ARCHIVED")}
        loading={loading}
      />
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={dict.fleet.detail.deleteTitle}
        description={dict.fleet.detail.deleteDescription}
        confirmLabel={dict.fleet.detail.delete}
        cancelLabel={dict.fleet.form.cancel}
        destructive
        onConfirm={deleteCar}
        loading={loading}
      />
    </div>
  );
}
