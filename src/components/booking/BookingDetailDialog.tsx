import { useRef } from 'react';
import { Booking } from '@/types/booking';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Plane, Hotel, Car, Calendar, DollarSign, MapPin, User, Phone, Mail, CreditCard, Clock, Printer } from 'lucide-react';

interface BookingDetailDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BookingDetailDialog({ booking, open, onOpenChange }: BookingDetailDialogProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  if (!booking) return null;

  const handlePrint = () => {
    const content = contentRef.current;
    if (!content) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const typeLabel = booking.booking_type === 'flight' ? 'Passagem Aérea' : booking.booking_type === 'hotel' ? 'Hospedagem' : 'Aluguel de Carro';
    printWindow.document.write(`
      <html><head><title>Reserva - ${typeLabel}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; max-width: 600px; margin: 0 auto; }
        h1 { font-size: 20px; margin-bottom: 4px; }
        h2 { font-size: 14px; text-transform: uppercase; color: #888; margin: 24px 0 8px; letter-spacing: 0.5px; }
        .badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
        .row { display: flex; gap: 12px; padding: 6px 0; border-bottom: 1px solid #f0f0f0; }
        .row-label { font-size: 12px; color: #888; }
        .row-value { font-size: 14px; font-weight: 500; }
        hr { border: none; border-top: 1px solid #e0e0e0; margin: 8px 0; }
        @media print { body { padding: 20px; } }
      </style></head><body>
    `);
    printWindow.document.write(content.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
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

  const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value?: string | null }) => {
    if (!value) return null;
    return (
      <div className="flex items-start gap-3 py-2">
        <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-medium">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                {getBookingIcon(booking.booking_type)}
              </div>
              <div>
                <DialogTitle>{getBookingTypeLabel(booking.booking_type)}</DialogTitle>
                <div className="mt-1">{getStatusBadge(booking.status)}</div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
          </div>
        </DialogHeader>

        <div ref={contentRef}>
          {/* Booking Details */}
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Detalhes da Reserva</h3>
            <Separator />

            {booking.booking_type === 'flight' && (
              <>
                <InfoRow icon={Plane} label="Companhia / Voo" value={`${booking.airline || ''} ${booking.flight_number || ''}`.trim() || undefined} />
                <InfoRow icon={MapPin} label="Origem → Destino" value={`${booking.origin || ''} → ${booking.destination}`} />
                <InfoRow icon={Clock} label="Horário de Partida" value={booking.departure_time || undefined} />
                <InfoRow icon={Clock} label="Horário de Chegada" value={booking.arrival_time || undefined} />
                <InfoRow icon={Plane} label="Classe" value={booking.cabin_class || undefined} />
              </>
            )}

            {booking.booking_type === 'hotel' && (
              <>
                <InfoRow icon={Hotel} label="Hotel" value={booking.hotel_name || undefined} />
                <InfoRow icon={MapPin} label="Localização" value={booking.destination} />
                <InfoRow icon={Hotel} label="Tipo de Quarto" value={booking.room_type || undefined} />
              </>
            )}

            {booking.booking_type === 'car_rental' && (
              <>
                <InfoRow icon={Car} label="Locadora" value={booking.car_company || undefined} />
                <InfoRow icon={Car} label="Categoria" value={booking.car_category || undefined} />
                <InfoRow icon={MapPin} label="Retirada" value={booking.pickup_location || undefined} />
                <InfoRow icon={MapPin} label="Devolução" value={booking.dropoff_location || undefined} />
              </>
            )}

            <InfoRow
              icon={Calendar}
              label="Período"
              value={`${new Date(booking.start_date).toLocaleDateString('pt-BR')}${booking.end_date ? ` - ${new Date(booking.end_date).toLocaleDateString('pt-BR')}` : ''}`}
            />
            <InfoRow
              icon={DollarSign}
              label="Valor Total"
              value={`${booking.currency} ${booking.total_cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            />
            <InfoRow icon={CreditCard} label="Código de Confirmação" value={booking.confirmation_code || undefined} />
          </div>

          {/* Passenger Info */}
          {(booking.passenger_first_name || booking.passenger_email || booking.passenger_cpf || booking.passenger_phone) && (
            <div className="space-y-1 mt-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {booking.booking_type === 'flight' ? 'Dados do Passageiro' : booking.booking_type === 'hotel' ? 'Dados do Hóspede' : 'Dados do Locatário'}
              </h3>
              <Separator />
              <InfoRow
                icon={User}
                label="Nome Completo"
                value={`${booking.passenger_first_name || ''} ${booking.passenger_last_name || ''}`.trim() || undefined}
              />
              <InfoRow icon={Mail} label="E-mail" value={booking.passenger_email || undefined} />
              <InfoRow icon={Phone} label="Telefone" value={booking.passenger_phone || undefined} />
              <InfoRow icon={CreditCard} label="CPF" value={booking.passenger_cpf || undefined} />
            </div>
          )}

          {/* Notes */}
          {booking.notes && (
            <div className="space-y-1 mt-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Observações</h3>
              <Separator />
              <p className="text-sm py-2">{booking.notes}</p>
            </div>
          )}

          {booking.rejection_reason && (
            <div className="space-y-1 mt-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide text-destructive">Motivo da Rejeição</h3>
              <Separator />
              <p className="text-sm py-2 text-destructive">{booking.rejection_reason}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
        )}
      </DialogContent>
    </Dialog>
  );
}
