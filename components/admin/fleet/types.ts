/** Serializable shapes shared by the fleet server pages and client components. */

export type FleetAvailability = "rented" | "maintenance" | "available";

export type FleetRow = {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number | null;
  plateNumber: string | null;
  category: string;
  transmission: string;
  fuelType: string;
  seats: number;
  doors: number;
  dailyPrice: number;
  status: string;
  locationId: string | null;
  locationName: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  availability: FleetAvailability;
  bookingsCount: number;
  maintenancesCount: number;
  createdAt: string;
};

export type FleetLocationOption = {
  id: string;
  name: string;
  city: string | null;
};

export type CarFormImage = {
  url: string;
  alt: string;
};

export type CarFormCar = {
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
  dailyPrice: number;
  weeklyPrice: number | null;
  monthlyPrice: number | null;
  deposit: number;
  description: string | null;
  plateNumber: string | null;
  vin: string | null;
  airConditioning: boolean;
  mileage: number | null;
  features: string[];
  locationId: string | null;
  locationName: string | null;
  status: string;
  images: CarFormImage[];
};

export type FleetBookingRow = {
  id: string;
  publicRef: string;
  customerName: string;
  pickupAt: string;
  returnAt: string;
  status: string;
  totalPrice: number;
};

export type FleetMaintenanceRow = {
  id: string;
  type: string;
  startAt: string;
  endAt: string;
  cost: number;
  status: string;
  provider: string | null;
};

export type FleetBookingWindow = {
  id: string;
  publicRef: string;
  pickupAt: string;
  returnAt: string;
  status: string;
};

export type FleetMaintenanceWindow = {
  id: string;
  type: string;
  startAt: string;
  endAt: string;
  status: string;
  provider: string | null;
};

export type FleetRevenue = {
  completedRevenue: number;
  paymentsReceived: number;
  completedCount: number;
};
