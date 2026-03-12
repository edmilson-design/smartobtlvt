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
import { generateMockHotels, getCitySuggestions } from '@/data/mockHotels';
import { Hotel as HotelType } from '@/types/booking';
import { Hotel, Search, Star, MapPin, Wifi, Coffee, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import PassengerFormDialog, { PassengerData } from '@/components/booking/PassengerFormDialog';

const HOTEL_POLICY_LIMIT = 510; // R$ por diária

export default function HotelBooking() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [city, setCity] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('1');
  
  const [hotels, setHotels] = useState<HotelType[]>([]);
  const [searching, setSearching] = useState(false);
  const [booking, setBooking] = useState<string | null>(null);

  const [passengerDialogOpen, setPassengerDialogOpen] = useState(false);
  const [pendingHotel, setPendingHotel] = useState<HotelType | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);

  const handleCityChange = (value: string) => {
    setCity(value);
    if (value.length >= 2) {
      setCitySuggestions(getCitySuggestions(value));
    } else {
      setCitySuggestions([]);
    }
  };

  const handleSearch = () => {
    if (!city || !checkIn || !checkOut) {
      toast({
        variant: 'destructive',
        title: 'Campos obrigatórios',
        description: 'Preencha cidade, check-in e check-out',
      });
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      toast({
        variant: 'destructive',
        title: 'Datas inválidas',
        description: 'A data de check-out deve ser posterior ao check-in',
      });
      return;
    }

    setSearching(true);
    
    setTimeout(() => {
      const results = generateMockHotels(city, checkIn, checkOut);
      setHotels(results);
      setSearching(false);

      if (results.length === 0) {
        toast({
          title: 'Nenhum hotel encontrado',
          description: 'Tente alterar a cidade ou as datas',
        });
      }
    }, 1500);
  };

  const handleRequestBookHotel = (hotel: HotelType) => {
    setPendingHotel(hotel);
    setPassengerDialogOpen(true);
  };

  const handleConfirmBooking = async (passenger: PassengerData) => {
    if (!user || !pendingHotel) return;
    const hotel = pendingHotel;

    setBookingLoading(true);
    setBooking(hotel.id);

    const { data: profile } = await supabase
      .from('profiles')
      .select('approval_limit')
      .eq('id', user.id)
      .maybeSingle();

    const approvalLimit = profile?.approval_limit || 1000;
    const requiresApproval = hotel.totalPrice > approvalLimit;

    const { error } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        booking_type: 'hotel',
        status: requiresApproval ? 'pending' : 'confirmed',
        destination: hotel.city,
        start_date: checkIn,
        end_date: checkOut,
        total_cost: hotel.totalPrice,
        currency: 'BRL',
        hotel_name: hotel.name,
        room_type: hotel.roomType,
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
    setPendingHotel(null);

    if (error) {
      console.error('Booking error:', error.message);
      toast({
        variant: 'destructive',
        title: 'Erro ao reservar',
        description: 'Ocorreu um erro ao processar sua reserva. Tente novamente.',
      });
    } else {
      toast({
        title: requiresApproval ? 'Reserva enviada para aprovação' : 'Hotel reservado com sucesso!',
        description: requiresApproval 
          ? `Valor acima de R$ ${approvalLimit.toLocaleString('pt-BR')} requer aprovação do gestor`
          : 'Você receberá a confirmação por email',
      });
      navigate('/my-bookings');
    }
  };

  const renderStars = (stars: number) => {
    return Array.from({ length: stars }).map((_, i) => (
      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
    ));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Hotel className="h-6 w-6" />
            Buscar Hotéis
          </h1>
          <p className="text-muted-foreground mt-1">
            Encontre a melhor hospedagem para sua viagem
          </p>
        </div>

        {/* Search Form */}
        <Card>
          <CardHeader>
            <CardTitle>Pesquisar Hotéis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-2 relative">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  placeholder="Ex: São Paulo"
                  value={city}
                  onChange={(e) => handleCityChange(e.target.value)}
                />
                {citySuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg">
                    {citySuggestions.map((c) => (
                      <button
                        key={c}
                        className="w-full px-3 py-2 text-left hover:bg-secondary text-sm"
                        onClick={() => {
                          setCity(c);
                          setCitySuggestions([]);
                        }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkIn">Check-in</Label>
                <Input
                  id="checkIn"
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkOut">Check-out</Label>
                <Input
                  id="checkOut"
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn || new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guests">Hóspedes</Label>
                <Input
                  id="guests"
                  type="number"
                  min="1"
                  max="4"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
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
          </CardContent>
        </Card>

        {/* Results */}
        {hotels.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{hotels.length} hotéis encontrados</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {hotels.map((hotel) => (
                <Card key={hotel.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video relative">
                    <img
                      src={hotel.image}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-card/90">
                        {hotel.rating} ★
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold line-clamp-1">{hotel.name}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          {renderStars(hotel.stars)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                      <MapPin className="h-3 w-3" />
                      {hotel.location}
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {hotel.amenities.slice(0, 3).map((amenity) => (
                        <Badge key={amenity} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {hotel.amenities.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{hotel.amenities.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{hotel.roomType}</p>
                        <p className="text-xs text-muted-foreground">
                          R$ {hotel.pricePerNight.toLocaleString('pt-BR')} / noite
                        </p>
                        {hotel.pricePerNight <= HOTEL_POLICY_LIMIT ? (
                          <Badge variant="outline" className="mt-1 text-xs border-green-500 text-green-600 bg-green-50 dark:bg-green-950/30">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Dentro da política
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="mt-1 text-xs border-orange-500 text-orange-600 bg-orange-50 dark:bg-orange-950/30">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Fora da política
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          R$ {hotel.totalPrice.toLocaleString('pt-BR')}
                        </p>
                        <p className="text-xs text-muted-foreground">total</p>
                      </div>
                    </div>

                    <Button 
                      className="w-full mt-4" 
                      onClick={() => handleRequestBookHotel(hotel)}
                      disabled={booking === hotel.id}
                    >
                      {booking === hotel.id ? (
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

        <PassengerFormDialog
          open={passengerDialogOpen}
          onClose={() => { setPassengerDialogOpen(false); setPendingHotel(null); }}
          onConfirm={handleConfirmBooking}
          loading={bookingLoading}
          title="Dados do Hóspede"
        />
      </div>
    </DashboardLayout>
  );
}
