import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FlightSearchRequest {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  cabinClass?: string;
}

interface FlightOffer {
  id: string;
  airline: string;
  airlineLogo: string;
  flightNumber: string;
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  cabinClass: string;
  price: number;
  currency: string;
  stops: number;
  segments?: FlightSegment[];
}

interface FlightSegment {
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime: string;
  flightNumber: string;
  airline: string;
  duration: string;
}

// Airline logos mapping
const airlineLogos: Record<string, string> = {
  'LA': '🔴', // LATAM
  'G3': '🟠', // GOL
  'AD': '🔵', // Azul
  'AV': '🔴', // Avianca
  'AA': '🔵', // American
  'UA': '🔵', // United
  'DL': '🔴', // Delta
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const REXTUR_API_KEY = Deno.env.get('REXTUR_API_KEY');
    const REXTUR_API_SECRET = Deno.env.get('REXTUR_API_SECRET');

    if (!REXTUR_API_KEY) {
      throw new Error('REXTUR_API_KEY is not configured');
    }

    if (!REXTUR_API_SECRET) {
      throw new Error('REXTUR_API_SECRET is not configured');
    }

    const body: FlightSearchRequest = await req.json();
    const { origin, destination, departureDate, returnDate, adults = 1, cabinClass = 'ECONOMY' } = body;

    if (!origin || !destination || !departureDate) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: origin, destination, departureDate' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Searching flights: ${origin} -> ${destination} on ${departureDate}`);

    // ============================================================
    // REXTUR ADVANCE API INTEGRATION
    // ============================================================
    // NOTE: Replace the URL and request format below with the actual
    // RexturAdvance API documentation. This is a generic structure.
    // ============================================================
    
    const REXTUR_API_URL = 'https://api.rexturadvance.com.br'; // Replace with actual URL
    
    // Build authentication - adjust based on RexturAdvance auth method
    const authToken = btoa(`${REXTUR_API_KEY}:${REXTUR_API_SECRET}`);
    
    // Build search request - adjust based on RexturAdvance API format
    const searchPayload = {
      // Adjust these fields based on RexturAdvance API documentation
      origem: origin,
      destino: destination,
      dataIda: departureDate,
      dataVolta: returnDate || null,
      adultos: adults,
      classe: cabinClass === 'ECONOMY' ? 'Y' : cabinClass === 'BUSINESS' ? 'C' : 'F',
    };

    const response = await fetch(`${REXTUR_API_URL}/v1/flights/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(searchPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`RexturAdvance API error [${response.status}]:`, errorText);
      throw new Error(`RexturAdvance API error: ${response.status}`);
    }

    const rexturData = await response.json();
    
    // ============================================================
    // TRANSFORM RESPONSE
    // ============================================================
    // Adjust this transformation based on the actual RexturAdvance
    // API response format
    // ============================================================
    
    const flights: FlightOffer[] = transformRexturResponse(rexturData, origin, destination);

    return new Response(
      JSON.stringify({ 
        success: true, 
        flights,
        source: 'rexturadvance',
        searchedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Flight search error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        flights: [],
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ============================================================
// TRANSFORM FUNCTION
// ============================================================
// This function needs to be adjusted based on the actual
// RexturAdvance API response structure
// ============================================================
function transformRexturResponse(
  data: any, 
  origin: string, 
  destination: string
): FlightOffer[] {
  // Example transformation - adjust based on actual API response
  // Assuming RexturAdvance returns something like:
  // { voos: [{ cia, numero, partida, chegada, preco, ... }] }
  
  if (!data || !data.voos || !Array.isArray(data.voos)) {
    console.warn('Unexpected RexturAdvance response format:', data);
    return [];
  }

  return data.voos.map((voo: any, index: number) => {
    const airlineCode = voo.cia || voo.companhia || 'XX';
    
    return {
      id: `rextur-${index}-${Date.now()}`,
      airline: voo.nomeCompanhia || getAirlineName(airlineCode),
      airlineLogo: airlineLogos[airlineCode] || '✈️',
      flightNumber: `${airlineCode}${voo.numero || voo.voo || '000'}`,
      origin: voo.origem || origin,
      originCity: voo.cidadeOrigem || origin,
      destination: voo.destino || destination,
      destinationCity: voo.cidadeDestino || destination,
      departureTime: formatTime(voo.partida || voo.horarioPartida),
      arrivalTime: formatTime(voo.chegada || voo.horarioChegada),
      duration: voo.duracao || calculateDuration(voo.partida, voo.chegada),
      cabinClass: voo.classe || 'Econômica',
      price: parseFloat(voo.preco || voo.valor || voo.tarifa || '0'),
      currency: 'BRL',
      stops: voo.paradas || voo.escalas || 0,
      segments: voo.trechos?.map((trecho: any) => ({
        departure: trecho.origem,
        arrival: trecho.destino,
        departureTime: formatTime(trecho.partida),
        arrivalTime: formatTime(trecho.chegada),
        flightNumber: `${trecho.cia}${trecho.numero}`,
        airline: getAirlineName(trecho.cia),
        duration: trecho.duracao,
      })),
    };
  });
}

function getAirlineName(code: string): string {
  const airlines: Record<string, string> = {
    'LA': 'LATAM',
    'G3': 'GOL',
    'AD': 'Azul',
    'AV': 'Avianca',
    'AA': 'American Airlines',
    'UA': 'United',
    'DL': 'Delta',
  };
  return airlines[code] || code;
}

function formatTime(time: string | undefined): string {
  if (!time) return '00:00';
  // Handle different time formats
  if (time.includes('T')) {
    return time.split('T')[1]?.substring(0, 5) || '00:00';
  }
  if (time.includes(':')) {
    return time.substring(0, 5);
  }
  return time;
}

function calculateDuration(departure: string | undefined, arrival: string | undefined): string {
  if (!departure || !arrival) return '0h 0min';
  
  try {
    const dep = new Date(departure);
    const arr = new Date(arrival);
    const diffMs = arr.getTime() - dep.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}min`;
  } catch {
    return '0h 0min';
  }
}
