import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { generateMockFlights } from '@/data/mockFlights';
import { Flight } from '@/types/booking';
import { Plane, Search, Loader2, Plus } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FlightLegForm, { FlightLeg } from '@/components/booking/FlightLegForm';
import FlightResultCard from '@/components/booking/FlightResultCard';

type TripType = 'oneway' | 'roundtrip' | 'multicity';

const createLeg = (overrides?: Partial<FlightLeg>): FlightLeg => ({
  id: crypto.randomUUID(),
  origin: '',
  destination: '',
  date: '',
  ...overrides,
});

export default function FlightBooking() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [tripType, setTripType] = useState<TripType>('oneway');
  const [legs, setLegs] = useState<FlightLeg[]>([createLeg()]);
  const [cabinClass, setCabinClass] = useState('Econômica');
  const [passengers, setPassengers] = useState('1');

  // Results per leg index
  const [resultsByLeg, setResultsByLeg] = useState<Record<number, Flight[]>>({});
  const [searching, setSearching] = useState(false);
  const [booking, setBooking] = useState<string | null>(null);

  const handleTripTypeChange = (value: string) => {
    const type = value as TripType;
    setTripType(type);
    setResultsByLeg({});

    if (type === 'oneway') {
      setLegs([createLeg({ origin: legs[0]?.origin, destination: legs[0]?.destination, date: legs[0]?.date })]);
    } else if (type === 'roundtrip') {
      const first = legs[0] || createLeg();
      setLegs([
        createLeg({ origin: first.origin, destination: first.destination, date: first.date }),
        createLeg({ origin: first.destination, destination: first.origin }),
      ]);
    } else {
      if (legs.length < 2) {
        setLegs([...legs, createLeg()]);
      }
    }
  };

  const updateLeg = useCallback((id: string, field: keyof Omit<FlightLeg, 'id'>, value: string) => {
    setLegs(prev => {
      const updated = prev.map(l => l.id === id ? { ...l, [field]: value } : l);
      // For round-trip, sync return leg origin/destination
      if (prev.length === 2 && prev[0].id === id) {
        if (field === 'origin') updated[1] = { ...updated[1], destination: value };
        if (field === 'destination') updated[1] = { ...updated[1], origin: value };
      }
      return updated;
    });
  }, []);

  const addLeg = () => {
    if (legs.length >= 6) return;
    const lastLeg = legs[legs.length - 1];
    setLegs(prev => [...prev, createLeg({ origin: lastLeg?.destination || '' })]);
  };

  const removeLeg = (id: string) => {
    if (legs.length <= 2) return;
    setLegs(prev => prev.filter(l => l.id !== id));
  };

  const handleSearch = async () => {
    // Validate all legs
    for (let i = 0; i < legs.length; i++) {
      const leg = legs[i];
      if (!leg.origin || !leg.destination || !leg.date) {
        toast({
          variant: 'destructive',
          title: 'Campos obrigatórios',
          description: `Preencha todos os campos do trecho ${i + 1}`,
        });
        return;
      }
    }

    setSearching(true);
    const allResults: Record<number, Flight[]> = {};

    try {
      for (let i = 0; i < legs.length; i++) {
        const leg = legs[i];
        try {
          const { data, error } = await supabase.functions.invoke('search-flights', {
            body: {
              origin: leg.origin,
              destination: leg.destination,
              departureDate: leg.date,
              adults: parseInt(passengers),
              cabinClass: cabinClass === 'Econômica' ? 'ECONOMY' : cabinClass === 'Executiva' ? 'BUSINESS' : 'ALL',
            },
          });

          if (!error && data?.success && data?.flights?.length > 0) {
            const filtered = cabinClass === 'Todas'
              ? data.flights
              : data.flights.filter((f: Flight) => f.cabinClass === cabinClass);
            allResults[i] = filtered;
          } else {
            throw new Error('fallback');
          }
        } catch {
          const results = generateMockFlights(leg.origin, leg.destination, leg.date);
          const filtered = cabinClass === 'Todas'
            ? results
            : results.filter(f => f.cabinClass === cabinClass);
          allResults[i] = filtered;
        }
      }

      setResultsByLeg(allResults);

      const totalFlights = Object.values(allResults).reduce((sum, r) => sum + r.length, 0);
      if (totalFlights === 0) {
        toast({ title: 'Nenhum voo encontrado', description: 'Tente alterar os filtros de busca' });
      }
    } finally {
      setSearching(false);
    }
  };

  const handleBookFlight = async (flight: Flight, legIndex: number) => {
    if (!user) return;

    setBooking(flight.id);

    const { data: profile } = await supabase
      .from('profiles')
      .select('approval_limit')
      .eq('id', user.id)
      .maybeSingle();

    const approvalLimit = profile?.approval_limit || 1000;
    const requiresApproval = flight.price > approvalLimit;
    const leg = legs[legIndex];

    const { error } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        booking_type: 'flight',
        status: requiresApproval ? 'pending' : 'confirmed',
        origin: flight.origin,
        destination: flight.destination,
        start_date: leg.date,
        total_cost: flight.price,
        currency: 'BRL',
        airline: flight.airline,
        flight_number: flight.flightNumber,
        departure_time: flight.departureTime,
        arrival_time: flight.arrivalTime,
        cabin_class: flight.cabinClass,
        requires_approval: requiresApproval,
        confirmation_code: requiresApproval ? null : `LVT${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        notes: legs.length > 1 ? `Trecho ${legIndex + 1} de ${legs.length}` : null,
      });

    setBooking(null);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao reservar', description: error.message });
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

  const today = new Date().toISOString().split('T')[0];

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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>Pesquisar Voos</CardTitle>
              <Tabs value={tripType} onValueChange={handleTripTypeChange}>
                <TabsList>
                  <TabsTrigger value="oneway">Somente ida</TabsTrigger>
                  <TabsTrigger value="roundtrip">Ida e volta</TabsTrigger>
                  <TabsTrigger value="multicity">Múltiplos trechos</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {legs.map((leg, index) => (
              <FlightLegForm
                key={leg.id}
                leg={leg}
                index={index}
                totalLegs={legs.length}
                showRemove={tripType === 'multicity' && legs.length > 2}
                onUpdate={updateLeg}
                onRemove={removeLeg}
                minDate={index > 0 ? (legs[index - 1]?.date || today) : today}
              />
            ))}

            {tripType === 'multicity' && legs.length < 6 && (
              <Button variant="outline" size="sm" onClick={addLeg}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar trecho
              </Button>
            )}

            <div className="flex flex-col sm:flex-row gap-4 items-end pt-2 border-t">
              <div className="space-y-2 w-full sm:w-48">
                <Label>Classe</Label>
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

              <Button onClick={handleSearch} disabled={searching} className="w-full sm:w-auto">
                {searching ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Buscar {legs.length > 1 ? `${legs.length} trechos` : ''}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results per leg */}
        {Object.keys(resultsByLeg).length > 0 && (
          <>
            {Object.entries(resultsByLeg).map(([legIdx, flights]) => {
              const idx = parseInt(legIdx);
              const leg = legs[idx];
              return (
                <Card key={legIdx}>
                  <CardHeader>
                    <CardTitle>
                      {legs.length > 1 
                        ? `Trecho ${idx + 1}: ${leg?.origin} → ${leg?.destination}`
                        : 'Voos Disponíveis'
                      }
                    </CardTitle>
                    <CardDescription>{flights.length} opções encontradas</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {flights.map((flight) => (
                      <FlightResultCard
                        key={flight.id}
                        flight={flight}
                        isBooking={booking === flight.id}
                        onBook={(f) => handleBookFlight(f, idx)}
                      />
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
