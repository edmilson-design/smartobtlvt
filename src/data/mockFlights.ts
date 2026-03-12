import { Flight } from '@/types/booking';
import { brazilianAirports, searchAirports } from './brazilianAirports';

const airlines = [
  { name: 'LATAM', logo: '🔴' },
  { name: 'GOL', logo: '🟠' },
  { name: 'Azul', logo: '🔵' },
  { name: 'Avianca', logo: '🔴' },
];

const cabinClasses = ['Econômica', 'Executiva', 'Primeira Classe'];

function generateFlightNumber(airline: string): string {
  const prefix = airline.substring(0, 2).toUpperCase();
  const number = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${number}`;
}

function formatTime(hours: number, minutes: number): string {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function calculateDuration(depHours: number, depMinutes: number, durationMinutes: number): string {
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  return `${hours}h ${minutes}min`;
}

function calculateArrivalTime(depHours: number, depMinutes: number, durationMinutes: number): string {
  const totalMinutes = depHours * 60 + depMinutes + durationMinutes;
  const arrHours = Math.floor(totalMinutes / 60) % 24;
  const arrMinutes = totalMinutes % 60;
  return formatTime(arrHours, arrMinutes);
}

export function generateMockFlights(origin: string, destination: string, date: string): Flight[] {
  const originAirport = brazilianAirports.find(a => a.code === origin || a.city.toLowerCase() === origin.toLowerCase());
  const destAirport = brazilianAirports.find(a => a.code === destination || a.city.toLowerCase() === destination.toLowerCase());

  if (!originAirport || !destAirport) {
    return [];
  }

  const flights: Flight[] = [];
  const numFlights = 6 + Math.floor(Math.random() * 5);

  for (let i = 0; i < numFlights; i++) {
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const cabinClass = cabinClasses[Math.floor(Math.random() * 2)]; // Mostly economy
    const depHours = 5 + Math.floor(Math.random() * 18);
    const depMinutes = Math.floor(Math.random() * 4) * 15;
    const durationMinutes = 60 + Math.floor(Math.random() * 180);
    const stops = Math.random() > 0.7 ? 1 : 0;
    
    const basePrice = cabinClass === 'Econômica' ? 350 : cabinClass === 'Executiva' ? 1200 : 3500;
    const priceVariation = Math.floor(Math.random() * 500) - 100;
    const price = basePrice + priceVariation + (stops === 0 ? 150 : 0);

    flights.push({
      id: `flight-${i}-${Date.now()}`,
      airline: airline.name,
      airlineLogo: airline.logo,
      flightNumber: generateFlightNumber(airline.name),
      origin: originAirport.code,
      originCity: originAirport.city,
      destination: destAirport.code,
      destinationCity: destAirport.city,
      departureTime: formatTime(depHours, depMinutes),
      arrivalTime: calculateArrivalTime(depHours, depMinutes, durationMinutes + (stops * 45)),
      duration: calculateDuration(depHours, depMinutes, durationMinutes + (stops * 45)),
      cabinClass,
      price,
      stops,
    });
  }

  return flights.sort((a, b) => a.price - b.price);
}

export function getAirportSuggestions(query: string): typeof airports {
  const normalizedQuery = query.toLowerCase();
  return airports.filter(
    a => a.code.toLowerCase().includes(normalizedQuery) || 
         a.city.toLowerCase().includes(normalizedQuery)
  );
}
