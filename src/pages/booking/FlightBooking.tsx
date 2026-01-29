import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { generateMockFlights, getAirportSuggestions } from '@/data/mockFlights';
import { Flight } from '@/types/booking';
import { Plane, Search, Clock, ArrowRight, Loader2 } from 'lucide-react';

export default function FlightBooking() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [cabinClass, setCabinClass] = useState('Econômica');
  const [passengers, setPassengers] = useState('1');
  
  const [flights, setFlights] = useState<Flight[]>([]);
  const [searching, setSearching] = useState(false);
  const [booking, setBooking] = useState<string | null>(null);

  const [originSuggestions, setOriginSuggestions] = useState<Array<{code: string, city: string}>>([]);
  const [destSuggestions, setDestSuggestions] = useState<Array<{code: string, city: string}>>([]);

  const handleOriginChange = (value: string) => {
    setOrigin(value);
    if (value.length >= 2) {
      setOriginSuggestions(getAirportSuggestions(value));
    } else {
      setOriginSuggestions([]);
    }
  };

  const handleDestinationChange = (value: string) => {
    setDestination(value);
    if (value.length >= 2) {
      setDestSuggestions(getAirportSuggestions(value));
    } else {
      setDestSuggestions([]);
    }
  };

  const handleSearch = async () => {
    if (!origin || !destination || !departureDate) {
      toast({
        variant: 'destructive',
        title: 'Campos obrigatórios',
        description: 'Preencha origem, destino e data de partida',
      });
      return;
    }

    setSearching(true);
    
    try {
      // Try real API first
      const { data, error } = await supabase.functions.invoke('search-flights', {
        body: {
          origin,
          destination,
          departureDate,
          adults: parseInt(passengers),
          cabinClass: cabinClass === 'Econômica' ? 'ECONOMY' : cabinClass === 'Executiva' ? 'BUSINESS' : 'ALL',
        },
      });

      if (error) throw error;

      if (data?.success && data?.flights?.length > 0) {
        // Use real API results
        const filtered = cabinClass === 'Todas' 
          ? data.flights 
          : data.flights.filter((f: Flight) => f.cabinClass === cabinClass);
        
        setFlights(filtered);
        
        toast({
          title: 'Resultados reais',
          description: `${filtered.length} voos encontrados via RexturAdvance`,
        });
      } else {
        // Fallback to mock data
        console.warn('Falling back to mock data:', data?.error);
        const results = generateMockFlights(origin, destination, departureDate);
        const filtered = cabinClass === 'Todas' 
          ? results 
          : results.filter(f => f.cabinClass === cabinClass);
        
        setFlights(filtered);
        
        if (filtered.length === 0) {
          toast({
            title: 'Nenhum voo encontrado',
            description: 'Tente alterar os filtros de busca',
          });
        }
      }
    } catch (err) {
      console.error('Search error:', err);
      // Fallback to mock data on error
      const results = generateMockFlights(origin, destination, departureDate);
      const filtered = cabinClass === 'Todas' 
        ? results 
        : results.filter(f => f.cabinClass === cabinClass);
      
      setFlights(filtered);
    } finally {
      setSearching(false);
    }
  };

  const handleBookFlight = async (flight: Flight) => {
    if (!user) return;

    setBooking(flight.id);

    // Get user's approval limit
    const { data: profile } = await supabase
      .from('profiles')
      .select('approval_limit')
      .eq('id', user.id)
      .maybeSingle();

    const approvalLimit = profile?.approval_limit || 1000;
    const requiresApproval = flight.price > approvalLimit;

    const { error } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        booking_type: 'flight',
        status: requiresApproval ? 'pending' : 'confirmed',
        origin: flight.origin,
        destination: flight.destination,
        start_date: departureDate,
        total_cost: flight.price,
        currency: 'BRL',
        airline: flight.airline,
        flight_number: flight.flightNumber,
        departure_time: flight.departureTime,
        arrival_time: flight.arrivalTime,
        cabin_class: flight.cabinClass,
        requires_approval: requiresApproval,
        confirmation_code: requiresApproval ? null : `LVT${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      });

    setBooking(null);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao reservar',
        description: error.message,
      });
    } else {
      toast({
        title: requiresApproval ? 'Reserva enviada para aprovação' : 'Voo reservado com sucesso!',
        description: requiresApproval 
          ? `Valor acima de R$ ${approvalLimit.toLocaleString('pt-BR')} requer aprovação do gestor`
          : 'Você receberá a confirmação por email',
      });
      navigate('/my-bookings');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Plane className="h-6 w-6" />
            Buscar Passagens Aéreas
          </h1>
          <p className="text-muted-foreground mt-1">
            Encontre os melhores voos para sua viagem corporativa
          </p>
        </div>

        {/* Search Form */}
        <Card>
          <CardHeader>
            <CardTitle>Pesquisar Voos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-2 relative">
                <Label htmlFor="origin">Origem</Label>
                <Input
                  id="origin"
                  placeholder="Ex: GRU ou São Paulo"
                  value={origin}
                  onChange={(e) => handleOriginChange(e.target.value)}
                />
                {originSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg">
                    {originSuggestions.map((s) => (
                      <button
                        key={s.code}
                        className="w-full px-3 py-2 text-left hover:bg-secondary text-sm"
                        onClick={() => {
                          setOrigin(s.code);
                          setOriginSuggestions([]);
                        }}
                      >
                        {s.code} - {s.city}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="destination">Destino</Label>
                <Input
                  id="destination"
                  placeholder="Ex: GIG ou Rio de Janeiro"
                  value={destination}
                  onChange={(e) => handleDestinationChange(e.target.value)}
                />
                {destSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg">
                    {destSuggestions.map((s) => (
                      <button
                        key={s.code}
                        className="w-full px-3 py-2 text-left hover:bg-secondary text-sm"
                        onClick={() => {
                          setDestination(s.code);
                          setDestSuggestions([]);
                        }}
                      >
                        {s.code} - {s.city}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Data de Partida</Label>
                <Input
                  id="date"
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="class">Classe</Label>
                <Select value={cabinClass} onValueChange={setCabinClass}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todas">Todas</SelectItem>
                    <SelectItem value="Econômica">Econômica</SelectItem>
                    <SelectItem value="Executiva">Executiva</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button className="w-full" onClick={handleSearch} disabled={searching}>
                  {searching ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Buscar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {flights.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Voos Disponíveis</CardTitle>
              <CardDescription>{flights.length} opções encontradas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {flights.map((flight) => (
                <div
                  key={flight.id}
                  className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg hover:border-primary transition-colors"
                >
                  <div className="flex items-center gap-4 mb-4 lg:mb-0">
                    <div className="text-3xl">{flight.airlineLogo}</div>
                    <div>
                      <p className="font-medium">{flight.airline}</p>
                      <p className="text-sm text-muted-foreground">{flight.flightNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 mb-4 lg:mb-0">
                    <div className="text-center">
                      <p className="text-xl font-bold">{flight.departureTime}</p>
                      <p className="text-sm text-muted-foreground">{flight.origin}</p>
                    </div>

                    <div className="flex flex-col items-center">
                      <p className="text-xs text-muted-foreground">{flight.duration}</p>
                      <div className="flex items-center gap-1">
                        <div className="h-px w-12 bg-border" />
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <div className="h-px w-12 bg-border" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {flight.stops === 0 ? 'Direto' : `${flight.stops} parada(s)`}
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-xl font-bold">{flight.arrivalTime}</p>
                      <p className="text-sm text-muted-foreground">{flight.destination}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:flex-col lg:items-end gap-2">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{flight.cabinClass}</p>
                      <p className="text-2xl font-bold text-primary">
                        R$ {flight.price.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <Button 
                      onClick={() => handleBookFlight(flight)}
                      disabled={booking === flight.id}
                    >
                      {booking === flight.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Reservar
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
