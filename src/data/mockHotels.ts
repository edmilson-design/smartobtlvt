import { Hotel } from '@/types/booking';

const hotelChains = [
  { name: 'Marriott', prefix: 'Marriott' },
  { name: 'Hilton', prefix: 'Hilton' },
  { name: 'Ibis', prefix: 'Ibis' },
  { name: 'Novotel', prefix: 'Novotel' },
  { name: 'Sheraton', prefix: 'Sheraton' },
  { name: 'Holiday Inn', prefix: 'Holiday Inn' },
  { name: 'Mercure', prefix: 'Mercure' },
  { name: 'Radisson', prefix: 'Radisson' },
];

const roomTypes = [
  'Standard',
  'Superior',
  'Deluxe',
  'Suite Executiva',
  'Suite Master',
];

const amenities = [
  'Wi-Fi grátis',
  'Café da manhã',
  'Ar condicionado',
  'Piscina',
  'Academia',
  'Restaurante',
  'Estacionamento',
  'Spa',
  'Bar',
  'Serviço de quarto',
];

const neighborhoods: Record<string, string[]> = {
  'São Paulo': ['Jardins', 'Paulista', 'Faria Lima', 'Pinheiros', 'Itaim Bibi'],
  'Rio de Janeiro': ['Copacabana', 'Ipanema', 'Leblon', 'Centro', 'Barra da Tijuca'],
  'Brasília': ['Asa Sul', 'Asa Norte', 'Lago Sul', 'Setor Hoteleiro'],
  'Salvador': ['Pelourinho', 'Barra', 'Rio Vermelho', 'Ondina'],
  'Belo Horizonte': ['Savassi', 'Lourdes', 'Funcionários', 'Centro'],
  'Porto Alegre': ['Moinhos de Vento', 'Centro Histórico', 'Bela Vista'],
  'Recife': ['Boa Viagem', 'Recife Antigo', 'Pina'],
  'Fortaleza': ['Meireles', 'Aldeota', 'Praia de Iracema'],
  'Curitiba': ['Batel', 'Centro', 'Água Verde'],
  'Florianópolis': ['Centro', 'Jurerê', 'Lagoa da Conceição'],
};

function getRandomAmenities(): string[] {
  const count = 4 + Math.floor(Math.random() * 4);
  const shuffled = [...amenities].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function getHotelImage(stars: number): string {
  const images = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
  ];
  return images[Math.floor(Math.random() * images.length)];
}

export function generateMockHotels(city: string, checkIn: string, checkOut: string): Hotel[] {
  const normalizedCity = Object.keys(neighborhoods).find(
    c => c.toLowerCase() === city.toLowerCase()
  );

  if (!normalizedCity) {
    return [];
  }

  const cityNeighborhoods = neighborhoods[normalizedCity];
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.max(1, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));

  const hotels: Hotel[] = [];
  const numHotels = 8 + Math.floor(Math.random() * 5);

  for (let i = 0; i < numHotels; i++) {
    const chain = hotelChains[Math.floor(Math.random() * hotelChains.length)];
    const neighborhood = cityNeighborhoods[Math.floor(Math.random() * cityNeighborhoods.length)];
    const stars = 3 + Math.floor(Math.random() * 3);
    const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
    const rating = 3.5 + Math.random() * 1.4;

    const basePricePerNight = stars === 3 ? 180 : stars === 4 ? 350 : 650;
    const roomMultiplier = roomType === 'Standard' ? 1 : roomType === 'Superior' ? 1.3 : roomType === 'Deluxe' ? 1.6 : roomType === 'Suite Executiva' ? 2.2 : 3;
    const pricePerNight = Math.round(basePricePerNight * roomMultiplier + (Math.random() * 100 - 50));

    hotels.push({
      id: `hotel-${i}-${Date.now()}`,
      name: `${chain.prefix} ${normalizedCity} ${neighborhood}`,
      image: getHotelImage(stars),
      location: `${neighborhood}, ${normalizedCity}`,
      city: normalizedCity,
      rating: Math.round(rating * 10) / 10,
      stars,
      roomType,
      amenities: getRandomAmenities(),
      pricePerNight,
      totalPrice: pricePerNight * nights,
    });
  }

  return hotels.sort((a, b) => a.totalPrice - b.totalPrice);
}

export function getCitySuggestions(query: string): string[] {
  const normalizedQuery = query.toLowerCase();
  return Object.keys(neighborhoods).filter(
    city => city.toLowerCase().includes(normalizedQuery)
  );
}
