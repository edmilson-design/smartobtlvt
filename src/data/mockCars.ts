import { CarRental } from '@/types/booking';

const rentalCompanies = [
  { name: 'Localiza', logo: '🚗' },
  { name: 'Movida', logo: '🚙' },
  { name: 'Unidas', logo: '🚘' },
  { name: 'Hertz', logo: '🏎️' },
  { name: 'Avis', logo: '🚕' },
];

const carCategories = [
  {
    category: 'Econômico',
    models: ['Fiat Mobi', 'VW Gol', 'Renault Kwid', 'Hyundai HB20'],
    passengers: 4,
    bags: 2,
    basePrice: 90,
  },
  {
    category: 'Compacto',
    models: ['VW Polo', 'Chevrolet Onix', 'Fiat Argo', 'Hyundai HB20S'],
    passengers: 5,
    bags: 3,
    basePrice: 120,
  },
  {
    category: 'Intermediário',
    models: ['Toyota Corolla', 'Honda Civic', 'VW Jetta', 'Chevrolet Cruze'],
    passengers: 5,
    bags: 4,
    basePrice: 180,
  },
  {
    category: 'SUV Compacto',
    models: ['Jeep Renegade', 'Hyundai Creta', 'VW T-Cross', 'Fiat Pulse'],
    passengers: 5,
    bags: 3,
    basePrice: 200,
  },
  {
    category: 'SUV',
    models: ['Jeep Compass', 'Toyota RAV4', 'VW Tiguan', 'Chevrolet Tracker'],
    passengers: 5,
    bags: 5,
    basePrice: 280,
  },
  {
    category: 'Premium',
    models: ['BMW 320i', 'Mercedes C200', 'Audi A4', 'Volvo S60'],
    passengers: 5,
    bags: 4,
    basePrice: 450,
  },
];

function getCarImage(category: string): string {
  const images: Record<string, string> = {
    'Econômico': 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400',
    'Compacto': 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400',
    'Intermediário': 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=400',
    'SUV Compacto': 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400',
    'SUV': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400',
    'Premium': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400',
  };
  return images[category] || images['Compacto'];
}

export function generateMockCars(
  pickupLocation: string,
  dropoffLocation: string,
  pickupDate: string,
  dropoffDate: string
): CarRental[] {
  const pickupDateObj = new Date(pickupDate);
  const dropoffDateObj = new Date(dropoffDate);
  const days = Math.max(1, Math.ceil((dropoffDateObj.getTime() - pickupDateObj.getTime()) / (1000 * 60 * 60 * 24)));

  const cars: CarRental[] = [];

  carCategories.forEach((cat, catIndex) => {
    const numCars = 2 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < numCars; i++) {
      const company = rentalCompanies[Math.floor(Math.random() * rentalCompanies.length)];
      const model = cat.models[Math.floor(Math.random() * cat.models.length)];
      const transmission = Math.random() > 0.3 ? 'Automático' : 'Manual';
      const priceVariation = Math.floor(Math.random() * 40) - 20;
      const pricePerDay = cat.basePrice + priceVariation;

      cars.push({
        id: `car-${catIndex}-${i}-${Date.now()}`,
        company: company.name,
        companyLogo: company.logo,
        category: cat.category,
        model,
        image: getCarImage(cat.category),
        transmission,
        passengers: cat.passengers,
        bags: cat.bags,
        airConditioning: true,
        pricePerDay,
        totalPrice: pricePerDay * days,
        pickupLocation,
        dropoffLocation,
      });
    }
  });

  return cars.sort((a, b) => a.totalPrice - b.totalPrice);
}

export function getLocationSuggestions(query: string): string[] {
  const locations = [
    'Aeroporto de Guarulhos (GRU)',
    'Aeroporto de Congonhas (CGH)',
    'Aeroporto Santos Dumont (SDU)',
    'Aeroporto do Galeão (GIG)',
    'Aeroporto de Brasília (BSB)',
    'Aeroporto de Salvador (SSA)',
    'Aeroporto de Confins (CNF)',
    'Aeroporto Salgado Filho (POA)',
    'Centro - São Paulo',
    'Centro - Rio de Janeiro',
    'Centro - Brasília',
    'Centro - Salvador',
  ];

  const normalizedQuery = query.toLowerCase();
  return locations.filter(loc => loc.toLowerCase().includes(normalizedQuery));
}
