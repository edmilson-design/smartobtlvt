import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { generateMockCars, getLocationSuggestions } from '@/data/mockCars';
import { CarRental } from '@/types/booking';
import { Car, Search, Users, Briefcase, Snowflake, Loader2 } from 'lucide-react';
import PassengerFormDialog, { PassengerData } from '@/components/booking/PassengerFormDialog';

export default function CarBooking() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [sameDropoff, setSameDropoff] = useState(true);
  const [pickupDate, setPickupDate] = useState('');
  const [dropoffDate, setDropoffDate] = useState('');
  
  const [cars, setCars] = useState<CarRental[]>([]);
  const [searching, setSearching] = useState(false);
  const [booking, setBooking] = useState<string | null>(null);

  const [passengerDialogOpen, setPassengerDialogOpen] = useState(false);
  const [pendingCar, setPendingCar] = useState<CarRental | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [pickupSuggestions, setPickupSuggestions] = useState<string[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<string[]>([]);

  const handlePickupChange = (value: string) => {
    setPickupLocation(value);
    if (sameDropoff) {
      setDropoffLocation(value);
    }
    if (value.length >= 2) {
      setPickupSuggestions(getLocationSuggestions(value));
    } else {
      setPickupSuggestions([]);
    }
  };

  const handleDropoffChange = (value: string) => {
    setDropoffLocation(value);
    if (value.length >= 2) {
      setDropoffSuggestions(getLocationSuggestions(value));
    } else {
      setDropoffSuggestions([]);
    }
  };

  const handleSearch = () => {
    if (!pickupLocation || !pickupDate || !dropoffDate) {
      toast({
        variant: 'destructive',
        title: 'Campos obrigatórios',
        description: 'Preencha local de retirada e datas',
      });
      return;
    }

    if (new Date(dropoffDate) <= new Date(pickupDate)) {
      toast({
        variant: 'destructive',
        title: 'Datas inválidas',
        description: 'A data de devolução deve ser posterior à retirada',
      });
      return;
    }

    setSearching(true);
    
    setTimeout(() => {
      const results = generateMockCars(
        pickupLocation, 
        sameDropoff ? pickupLocation : dropoffLocation, 
        pickupDate, 
        dropoffDate
      );
      setCars(results);
      setSearching(false);

      if (results.length === 0) {
        toast({
          title: 'Nenhum carro encontrado',
          description: 'Tente alterar o local ou as datas',
        });
      }
    }, 1500);
  };

  const handleRequestBookCar = (car: CarRental) => {
    setPendingCar(car);
    setPassengerDialogOpen(true);
  };

  const handleConfirmBooking = async (passenger: PassengerData) => {
    if (!user || !pendingCar) return;
    const car = pendingCar;

    setBookingLoading(true);
    setBooking(car.id);

    const { data: profile } = await supabase
      .from('profiles')
      .select('approval_limit')
      .eq('id', user.id)
      .maybeSingle();

    const approvalLimit = profile?.approval_limit || 1000;
    const requiresApproval = car.totalPrice > approvalLimit;

    const { error } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        booking_type: 'car_rental',
        status: requiresApproval ? 'pending' : 'confirmed',
        destination: car.pickupLocation,
        start_date: pickupDate,
        end_date: dropoffDate,
        total_cost: car.totalPrice,
        currency: 'BRL',
        car_company: car.company,
        car_category: car.category,
        pickup_location: car.pickupLocation,
        dropoff_location: car.dropoffLocation,
        requires_approval: requiresApproval,
        confirmation_code: requiresApproval ? null : `LVT${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        passenger_first_name: passenger.firstName,
        passenger_last_name: passenger.lastName,
        passenger_email: passenger.email,
        passenger_phone: passenger.phone,
        passenger_cpf: passenger.cpf,
      });

    setBookingLoading(false);
    setBooking(null);
    setPassengerDialogOpen(false);
    setPendingCar(null);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao reservar',
        description: error.message,
      });
    } else {
      toast({
        title: requiresApproval ? 'Reserva enviada para aprovação' : 'Carro reservado com sucesso!',
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
            <Car className="h-6 w-6" />
            Alugar Carro
          </h1>
          <p className="text-muted-foreground mt-1">
            Encontre o veículo ideal para sua viagem
          </p>
        </div>

        {/* Search Form */}
        <Card>
          <CardHeader>
            <CardTitle>Pesquisar Veículos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sameDropoff"
                  checked={sameDropoff}
                  onChange={(e) => {
                    setSameDropoff(e.target.checked);
                    if (e.target.checked) {
                      setDropoffLocation(pickupLocation);
                    }
                  }}
                  className="rounded"
                />
                <Label htmlFor="sameDropoff">Devolver no mesmo local</Label>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <div className="space-y-2 relative">
                  <Label htmlFor="pickup">Local de Retirada</Label>
                  <Input
                    id="pickup"
                    placeholder="Ex: Aeroporto de Guarulhos"
                    value={pickupLocation}
                    onChange={(e) => handlePickupChange(e.target.value)}
                  />
                  {pickupSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg max-h-48 overflow-auto">
                      {pickupSuggestions.map((loc) => (
                        <button
                          key={loc}
                          className="w-full px-3 py-2 text-left hover:bg-secondary text-sm"
                          onClick={() => {
                            setPickupLocation(loc);
                            if (sameDropoff) setDropoffLocation(loc);
                            setPickupSuggestions([]);
                          }}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {!sameDropoff && (
                  <div className="space-y-2 relative">
                    <Label htmlFor="dropoff">Local de Devolução</Label>
                    <Input
                      id="dropoff"
                      placeholder="Ex: Centro - São Paulo"
                      value={dropoffLocation}
                      onChange={(e) => handleDropoffChange(e.target.value)}
                    />
                    {dropoffSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg max-h-48 overflow-auto">
                        {dropoffSuggestions.map((loc) => (
                          <button
                            key={loc}
                            className="w-full px-3 py-2 text-left hover:bg-secondary text-sm"
                            onClick={() => {
                              setDropoffLocation(loc);
                              setDropoffSuggestions([]);
                            }}
                          >
                            {loc}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="pickupDate">Retirada</Label>
                  <Input
                    id="pickupDate"
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dropoffDate">Devolução</Label>
                  <Input
                    id="dropoffDate"
                    type="date"
                    value={dropoffDate}
                    onChange={(e) => setDropoffDate(e.target.value)}
                    min={pickupDate || new Date().toISOString().split('T')[0]}
                  />
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
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {cars.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{cars.length} veículos encontrados</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cars.map((car) => (
                <Card key={car.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video relative bg-gradient-to-br from-secondary to-muted">
                    <img
                      src={car.image}
                      alt={car.model}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge>{car.category}</Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{car.model}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          {car.companyLogo} {car.company}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {car.passengers}
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {car.bags}
                      </div>
                      {car.airConditioning && (
                        <div className="flex items-center gap-1">
                          <Snowflake className="h-4 w-4" />
                          A/C
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      <Badge variant="outline" className="text-xs">
                        {car.transmission}
                      </Badge>
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          R$ {car.pricePerDay.toLocaleString('pt-BR')} / dia
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          R$ {car.totalPrice.toLocaleString('pt-BR')}
                        </p>
                        <p className="text-xs text-muted-foreground">total</p>
                      </div>
                    </div>

                    <Button 
                      className="w-full mt-4" 
                      onClick={() => handleBookCar(car)}
                      disabled={booking === car.id}
                    >
                      {booking === car.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Reservar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
