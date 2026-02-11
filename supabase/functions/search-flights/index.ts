import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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
}

// Travellink API (Wooba/BeFly) - Sandbox
const TRAVELLINK_BASE_URL = 'https://wooba-sandbox-api.travellink.com.br/wcfTravellinkJson/AereoNoSession.svc';

const airlineNames: Record<string, string> = {
  'LA': 'LATAM', 'JJ': 'LATAM', 'G3': 'GOL', 'AD': 'Azul',
  'AV': 'Avianca', 'AA': 'American Airlines', 'UA': 'United', 'DL': 'Delta',
};

const airlineLogos: Record<string, string> = {
  'LA': '🔴', 'JJ': '🔴', 'G3': '🟠', 'AD': '🔵',
  'AV': '🔴', 'AA': '🔵', 'UA': '🔵', 'DL': '🔴',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const API_LOGIN = Deno.env.get('REXTUR_API_KEY');
    const API_PASSWORD = Deno.env.get('REXTUR_API_SECRET');

    if (!API_LOGIN || !API_PASSWORD) {
      throw new Error('API credentials not configured');
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

    // Step 1: Authenticate with Travellink API
    const authPayload = {
      Login: API_LOGIN,
      Senha: API_PASSWORD,
    };

    console.log('Authenticating with Travellink API...');
    const authResponse = await fetch(`${TRAVELLINK_BASE_URL}/Autenticar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authPayload),
    });

    if (!authResponse.ok) {
      const errText = await authResponse.text();
      console.error(`Travellink auth error [${authResponse.status}]:`, errText);
      throw new Error(`Travellink auth failed: ${authResponse.status}`);
    }

    const authData = await authResponse.json();
    console.log('Auth response keys:', Object.keys(authData));

    // Extract token/session from auth response
    const token = authData?.Token || authData?.Sessao || authData?.SessionId || authData?.token;
    
    if (!token) {
      console.warn('Auth response (no token found):', JSON.stringify(authData).substring(0, 500));
      // Try without token - some endpoints may work with login/password directly
    }

    // Step 2: Search for flights (Disponibilidade)
    const classeMap: Record<string, string> = {
      'ECONOMY': 'Y', 'BUSINESS': 'C', 'FIRST': 'F', 'ALL': '',
    };

    // Format date from YYYY-MM-DD to DD/MM/YYYY (Brazilian format)
    const [year, month, day] = departureDate.split('-');
    const formattedDate = `${day}/${month}/${year}`;
    const formattedReturnDate = returnDate 
      ? (() => { const [y, m, d] = returnDate.split('-'); return `${d}/${m}/${y}`; })()
      : null;

    const searchPayload: Record<string, any> = {
      Login: API_LOGIN,
      Senha: API_PASSWORD,
      Origem: origin,
      Destino: destination,
      DataIda: formattedDate,
      Adultos: adults,
      Criancas: 0,
      Bebes: 0,
      Classe: classeMap[cabinClass] || 'Y',
      TipoBusca: 'OW', // One Way
    };

    if (formattedReturnDate) {
      searchPayload.DataVolta = formattedReturnDate;
      searchPayload.TipoBusca = 'RT'; // Round Trip
    }

    if (token) {
      searchPayload.Token = token;
    }

    console.log('Searching flights with payload:', JSON.stringify(searchPayload));

    const searchResponse = await fetch(`${TRAVELLINK_BASE_URL}/Disponibilidade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(searchPayload),
    });

    if (!searchResponse.ok) {
      const errText = await searchResponse.text();
      console.error(`Travellink search error [${searchResponse.status}]:`, errText);
      throw new Error(`Travellink search failed: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    console.log('Search response keys:', Object.keys(searchData));
    console.log('Search response preview:', JSON.stringify(searchData).substring(0, 1000));

    // Step 3: Transform results
    const flights = transformTravellinkResponse(searchData, origin, destination);

    return new Response(
      JSON.stringify({
        success: true,
        flights,
        source: 'travellink',
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

function transformTravellinkResponse(data: any, origin: string, destination: string): FlightOffer[] {
  // Try multiple possible response formats from Travellink
  const flights = data?.Voos || data?.voos || data?.Opcoes || data?.opcoes 
    || data?.Resultados || data?.resultados || data?.Disponibilidades || [];

  if (!Array.isArray(flights) || flights.length === 0) {
    console.warn('No flights array found. Response structure:', JSON.stringify(data).substring(0, 500));
    return [];
  }

  return flights.map((voo: any, index: number) => {
    const airlineCode = voo.Cia || voo.cia || voo.Companhia || voo.companhia || 'XX';
    const segments = voo.Trechos || voo.trechos || voo.Segmentos || voo.segmentos || [];
    const stops = segments.length > 1 ? segments.length - 1 : (voo.Paradas || voo.paradas || 0);

    return {
      id: `tl-${index}-${Date.now()}`,
      airline: voo.NomeCompanhia || voo.nomeCompanhia || airlineNames[airlineCode] || airlineCode,
      airlineLogo: airlineLogos[airlineCode] || '✈️',
      flightNumber: `${airlineCode}${voo.Numero || voo.numero || voo.Voo || voo.voo || '000'}`,
      origin: voo.Origem || voo.origem || origin,
      originCity: voo.CidadeOrigem || voo.cidadeOrigem || origin,
      destination: voo.Destino || voo.destino || destination,
      destinationCity: voo.CidadeDestino || voo.cidadeDestino || destination,
      departureTime: formatTime(voo.Partida || voo.partida || voo.HorarioPartida || voo.horarioPartida),
      arrivalTime: formatTime(voo.Chegada || voo.chegada || voo.HorarioChegada || voo.horarioChegada),
      duration: voo.Duracao || voo.duracao || calculateDuration(voo.Partida || voo.partida, voo.Chegada || voo.chegada),
      cabinClass: mapCabinClass(voo.Classe || voo.classe || 'Y'),
      price: parseFloat(voo.Preco || voo.preco || voo.Valor || voo.valor || voo.Tarifa || voo.tarifa || '0'),
      currency: 'BRL',
      stops,
    };
  });
}

function mapCabinClass(code: string): string {
  const map: Record<string, string> = { 'Y': 'Econômica', 'C': 'Executiva', 'F': 'Primeira Classe' };
  return map[code] || code;
}

function formatTime(time: string | undefined): string {
  if (!time) return '00:00';
  if (time.includes('T')) return time.split('T')[1]?.substring(0, 5) || '00:00';
  if (time.includes(':')) return time.substring(0, 5);
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
