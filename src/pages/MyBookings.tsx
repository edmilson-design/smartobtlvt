import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Booking } from '@/types/booking';
import { ClipboardList, Plane, Hotel, Car, Trash2, Loader2, Calendar, MapPin, DollarSign } from 'lucide-react';
import BookingDetailDialog from '@/components/booking/BookingDetailDialog';

export default function MyBookings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    loadBookings();
  }, [user]);

  const loadBookings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setBookings(data as unknown as Booking[]);
    }
    setLoading(false);
  };

  const handleDelete = async (bookingId: string) => {
    setDeleting(bookingId);

    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao cancelar',
        description: 'Ocorreu um erro ao cancelar a reserva. Tente novamente.',
      });
    } else {
      toast({
        title: 'Reserva cancelada',
        description: 'A reserva foi removida com sucesso',
      });
      setBookings(bookings.filter(b => b.id !== bookingId));
    }
    setDeleting(null);
  };

  const getBookingIcon = (type: string) => {
    switch (type) {
      case 'flight': return <Plane className="h-5 w-5" />;
      case 'hotel': return <Hotel className="h-5 w-5" />;
      case 'car_rental': return <Car className="h-5 w-5" />;
      default: return <Plane className="h-5 w-5" />;
    }
  };

  const getBookingTypeLabel = (type: string) => {
    switch (type) {
      case 'flight': return 'Passagem Aérea';
      case 'hotel': return 'Hospedagem';
      case 'car_rental': return 'Aluguel de Carro';
      default: return type;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    const labels: Record<string, string> = {
      pending: 'Pendente de Aprovação',
      approved: 'Aprovado',
      rejected: 'Rejeitado',
      confirmed: 'Confirmado',
      cancelled: 'Cancelado',
    };
    return (
      <Badge variant="outline" className={styles[status] || styles.pending}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getBookingDetails = (booking: Booking) => {
    switch (booking.booking_type) {
      case 'flight':
        return (
          <>
            <p className="font-medium">{booking.airline} {booking.flight_number}</p>
            <p className="text-sm text-muted-foreground">
              {booking.origin} → {booking.destination}
            </p>
            {booking.departure_time && (
              <p className="text-sm text-muted-foreground">
                Partida: {booking.departure_time} • {booking.cabin_class}
              </p>
            )}
          </>
        );
      case 'hotel':
        return (
          <>
            <p className="font-medium">{booking.hotel_name}</p>
            <p className="text-sm text-muted-foreground">{booking.destination}</p>
            {booking.room_type && (
              <p className="text-sm text-muted-foreground">{booking.room_type}</p>
            )}
          </>
        );
      case 'car_rental':
        return (
          <>
            <p className="font-medium">{booking.car_company}</p>
            <p className="text-sm text-muted-foreground">{booking.car_category}</p>
            <p className="text-sm text-muted-foreground">
              {booking.pickup_location}
            </p>
          </>
        );
      default:
        return <p className="font-medium">{booking.destination}</p>;
    }
  };

  const filteredBookings = (status: string[]) => 
    bookings.filter(b => status.includes(b.status));

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <Card key={booking.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedBooking(booking)}>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Icon and Type */}
          <div className="flex items-center gap-3 p-4 md:w-48 bg-secondary/30">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              {getBookingIcon(booking.booking_type)}
            </div>
            <div>
              <p className="font-medium text-sm">{getBookingTypeLabel(booking.booking_type)}</p>
              {getStatusBadge(booking.status)}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 p-4">
            {getBookingDetails(booking)}
            
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(booking.start_date).toLocaleDateString('pt-BR')}
                {booking.end_date && ` - ${new Date(booking.end_date).toLocaleDateString('pt-BR')}`}
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {booking.currency} {booking.total_cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {booking.confirmation_code && (
              <p className="mt-2 text-sm">
                <span className="text-muted-foreground">Código: </span>
                <span className="font-mono font-medium">{booking.confirmation_code}</span>
              </p>
            )}

            {booking.requires_approval && booking.status === 'pending' && (
              <p className="mt-2 text-sm text-yellow-600">
                ⏳ Aguardando aprovação do gestor
              </p>
            )}

            {booking.rejection_reason && (
              <p className="mt-2 text-sm text-red-600">
                Motivo: {booking.rejection_reason}
              </p>
            )}
          </div>

          {/* Actions */}
          {booking.status === 'pending' && (
            <div className="p-4 flex items-center">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                    {deleting === booking.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancelar reserva?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. A reserva será permanentemente removida.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Voltar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(booking.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Cancelar Reserva
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="h-6 w-6" />
            Minhas Reservas
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe todas as suas solicitações de viagem
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ClipboardList className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma reserva encontrada</h3>
              <p className="text-muted-foreground text-center mb-4">
                Você ainda não fez nenhuma reserva de viagem
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => window.location.href = '/booking/flights'}>
                  <Plane className="h-4 w-4 mr-2" />
                  Buscar Voos
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/booking/hotels'}>
                  <Hotel className="h-4 w-4 mr-2" />
                  Buscar Hotéis
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Todas ({bookings.length})</TabsTrigger>
              <TabsTrigger value="pending">
                Pendentes ({filteredBookings(['pending']).length})
              </TabsTrigger>
              <TabsTrigger value="confirmed">
                Confirmadas ({filteredBookings(['confirmed', 'approved']).length})
              </TabsTrigger>
              <TabsTrigger value="history">
                Histórico ({filteredBookings(['rejected', 'cancelled']).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-4">
              {bookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4 mt-4">
              {filteredBookings(['pending']).map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </TabsContent>

            <TabsContent value="confirmed" className="space-y-4 mt-4">
              {filteredBookings(['confirmed', 'approved']).map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </TabsContent>

            <TabsContent value="history" className="space-y-4 mt-4">
              {filteredBookings(['rejected', 'cancelled']).map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </TabsContent>
          </Tabs>
        )}

        <BookingDetailDialog
          booking={selectedBooking}
          open={!!selectedBooking}
          onOpenChange={(open) => { if (!open) setSelectedBooking(null); }}
        />
      </div>
    </DashboardLayout>
  );
}
