import { Flight } from '@/types/booking';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

const FLIGHT_POLICY_LIMIT = 750;

interface FlightResultCardProps {
  flight: Flight;
  isBooking: boolean;
  legLabel?: string;
  onBook: (flight: Flight) => void;
}

export default function FlightResultCard({ flight, isBooking, legLabel, onBook }: FlightResultCardProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg hover:border-primary transition-colors">
      <div className="flex items-center gap-4 mb-4 lg:mb-0">
        <div className="text-3xl">{flight.airlineLogo}</div>
        <div>
          <p className="font-medium">{flight.airline}</p>
          <p className="text-sm text-muted-foreground">{flight.flightNumber}</p>
          {legLabel && (
            <Badge variant="secondary" className="text-xs mt-1">{legLabel}</Badge>
          )}
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
          {flight.price <= FLIGHT_POLICY_LIMIT ? (
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
        <Button
          onClick={() => onBook(flight)}
          disabled={isBooking}
        >
          {isBooking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Reservar
        </Button>
      </div>
    </div>
  );
}
