import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const demoCars = [
  {
    brand: "BMW",
    model: "M4",
    year: 2024,
    category: "Sport",
    transmission: "Automatique",
    fuelType: "Essence",
    seats: 4,
    doors: 2,
    dailyPrice: 2500,
    description: "BMW M4 Competition - Performance exceptionnelle, design agressif et confort luxueux.",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1974&auto=format&fit=crop"
  },
  {
    brand: "Mercedes",
    model: "AMG GT",
    year: 2024,
    category: "Sport",
    transmission: "Automatique",
    fuelType: "Essence",
    seats: 2,
    doors: 2,
    dailyPrice: 3200,
    description: "Mercedes-AMG GT - Supercar allemande alliant luxe et performances extrêmes.",
    image: "https://images.unsplash.com/photo-1616455579100-2ceaa4eb2d37?q=80&w=1974&auto=format&fit=crop"
  },
  {
    brand: "Porsche",
    model: "911 Carrera",
    year: 2024,
    category: "Sport",
    transmission: "Automatique",
    fuelType: "Essence",
    seats: 4,
    doors: 2,
    dailyPrice: 2900,
    description: "Porsche 911 Carrera - L'icône intemporelle, équilibre parfait entre sport et confort.",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1920&auto=format&fit=crop"
  },
  {
    brand: "Audi",
    model: "RS6",
    year: 2024,
    category: "Berline",
    transmission: "Automatique",
    fuelType: "Essence",
    seats: 5,
    doors: 5,
    dailyPrice: 2200,
    description: "Audi RS6 Avant - Break surpuissant alliant praticité et performances.",
    image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=1974&auto=format&fit=crop"
  },
  {
    brand: "Range Rover",
    model: "Sport",
    year: 2024,
    category: "SUV",
    transmission: "Automatique",
    fuelType: "Diesel",
    seats: 5,
    doors: 5,
    dailyPrice: 2100,
    description: "Range Rover Sport - Luxe britannique, tout-terrain raffiné et confort exceptionnel.",
    image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=2071&auto=format&fit=crop"
  },
  {
    brand: "Lamborghini",
    model: "Huracán",
    year: 2024,
    category: "Supercar",
    transmission: "Automatique",
    fuelType: "Essence",
    seats: 2,
    doors: 2,
    dailyPrice: 8500,
    description: "Lamborghini Huracán - L'expérience ultime, bruit envoûtant et performances époustouflantes.",
    image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=1974&auto=format&fit=crop"
  }
];

export async function POST() {
  try {
    for (const carData of demoCars) {
      const slug = slugify(`${carData.brand} ${carData.model}`);
      const exists = await prisma.car.findUnique({ where: { slug } });
      if (exists) continue;

      const car = await prisma.car.create({
        data: {
          slug,
          brand: carData.brand,
          model: carData.model,
          name: `${carData.brand} ${carData.model}`,
          year: carData.year,
          category: carData.category,
          transmission: carData.transmission,
          fuelType: carData.fuelType,
          seats: carData.seats,
          doors: carData.doors,
          dailyPrice: carData.dailyPrice,
          description: carData.description,
          status: "PUBLISHED",
        },
      });

      await prisma.carImage.create({
        data: {
          carId: car.id,
          url: carData.image,
          alt: `${carData.brand} ${carData.model}`,
          sortOrder: 0,
          isPrimary: true,
        },
      });
    }

    return NextResponse.json({ success: true, message: "Données de démonstration ajoutées" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
