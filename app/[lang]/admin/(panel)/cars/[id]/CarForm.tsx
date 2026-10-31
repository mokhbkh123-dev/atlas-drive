"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getDict, type Locale } from "@/i18n";

/** Shape of a car passed to the form (Prisma Car with a serialized price). */
type CarFormCar = {
  id: string;
  brand: string;
  model: string;
  name: string;
  year: number | null;
  category: string;
  transmission: string;
  fuelType: string;
  seats: number;
  doors: number;
  dailyPrice: number | string;
  description: string | null;
  status: string;
};

export default function CarForm({ lang, car }: { lang: Locale; car?: CarFormCar }) {
  const router = useRouter();
  const dict = getDict(lang);
  const [formData, setFormData] = useState({
    brand: car?.brand || "",
    model: car?.model || "",
    name: car?.name || "",
    year: car?.year || "",
    category: car?.category || "",
    transmission: car?.transmission || "",
    fuelType: car?.fuelType || "",
    seats: car?.seats || "",
    doors: car?.doors || "",
    dailyPrice: car?.dailyPrice || "",
    description: car?.description || "",
    status: car?.status || "DRAFT",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = car ? `/api/admin/cars/${car.id}` : "/api/admin/cars";
      const method = car ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        const message = data.code
          ? dict.apiErrors[data.code as keyof typeof dict.apiErrors] ?? data.error
          : data.error;
        throw new Error(message || dict.apiErrors.GENERIC_ERROR);
      }

      router.push(`/${lang}/admin/cars`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.common.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 shadow sm:rounded-lg">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">{dict.admin.carForm.brand}</label>
          <input
            type="text"
            required
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{dict.admin.carForm.model}</label>
          <input
            type="text"
            required
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">{dict.admin.carForm.displayName}</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder={dict.admin.carForm.namePlaceholder}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">{dict.admin.carForm.year}</label>
          <input
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{dict.admin.carForm.category}</label>
          <input
            type="text"
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">{dict.admin.carForm.transmission}</label>
          <select
            required
            value={formData.transmission}
            onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">{dict.admin.carForm.select}</option>
            <option value="Manuelle">{dict.enums.transmission.Manuelle}</option>
            <option value="Automatique">{dict.enums.transmission.Automatique}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{dict.admin.carForm.fuel}</label>
          <select
            required
            value={formData.fuelType}
            onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">{dict.admin.carForm.select}</option>
            <option value="Essence">{dict.enums.fuel.Essence}</option>
            <option value="Diesel">{dict.enums.fuel.Diesel}</option>
            <option value="Hybride">{dict.enums.fuel.Hybride}</option>
            <option value="Électrique">{dict.enums.fuel["Électrique"]}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{dict.admin.carForm.seats}</label>
          <input
            type="number"
            required
            value={formData.seats}
            onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">{dict.admin.carForm.doors}</label>
          <input
            type="number"
            required
            value={formData.doors}
            onChange={(e) => setFormData({ ...formData, doors: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{dict.admin.carForm.dailyPrice}</label>
          <input
            type="number"
            step="0.01"
            required
            value={formData.dailyPrice}
            onChange={(e) => setFormData({ ...formData, dailyPrice: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">{dict.admin.carForm.statusLabel}</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="DRAFT">{dict.enums.carStatus.DRAFT}</option>
          <option value="PUBLISHED">{dict.enums.carStatus.PUBLISHED}</option>
          <option value="ARCHIVED">{dict.enums.carStatus.ARCHIVED}</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">{dict.admin.carForm.description}</label>
        <textarea
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push(`/${lang}/admin/cars`)}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          {dict.admin.carForm.cancel}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? dict.admin.carForm.saving : car ? dict.admin.carForm.update : dict.admin.carForm.create}
        </button>
      </div>
    </form>
  );
}
