import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { getAirportSuggestions } from '@/data/mockFlights';
import { X } from 'lucide-react';

export interface FlightLeg {
  id: string;
  origin: string;
  destination: string;
  date: string;
}

interface FlightLegFormProps {
  leg: FlightLeg;
  index: number;
  totalLegs: number;
  showRemove: boolean;
  onUpdate: (id: string, field: keyof Omit<FlightLeg, 'id'>, value: string) => void;
  onRemove: (id: string) => void;
  minDate?: string;
}

export default function FlightLegForm({ leg, index, totalLegs, showRemove, onUpdate, onRemove, minDate }: FlightLegFormProps) {
  const [originSuggestions, setOriginSuggestions] = useState<Array<{ code: string; city: string }>>([]);
  const [destSuggestions, setDestSuggestions] = useState<Array<{ code: string; city: string }>>([]);

  const handleOriginChange = (value: string) => {
    onUpdate(leg.id, 'origin', value);
    setOriginSuggestions(value.length >= 2 ? getAirportSuggestions(value) : []);
  };

  const handleDestChange = (value: string) => {
    onUpdate(leg.id, 'destination', value);
    setDestSuggestions(value.length >= 2 ? getAirportSuggestions(value) : []);
  };

  return (
    <div className="relative">
      {totalLegs > 1 && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">Trecho {index + 1}</span>
          {showRemove && (
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onRemove(leg.id)}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2 relative">
          <Label>Origem</Label>
          <Input
            placeholder="Ex: GRU ou São Paulo"
            value={leg.origin}
            onChange={(e) => handleOriginChange(e.target.value)}
          />
          {originSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg">
              {originSuggestions.map((s) => (
                <button
                  key={s.code}
                  className="w-full px-3 py-2 text-left hover:bg-secondary text-sm"
                  onClick={() => {
                    onUpdate(leg.id, 'origin', s.code);
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
          <Label>Destino</Label>
          <Input
            placeholder="Ex: GIG ou Rio de Janeiro"
            value={leg.destination}
            onChange={(e) => handleDestChange(e.target.value)}
          />
          {destSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg">
              {destSuggestions.map((s) => (
                <button
                  key={s.code}
                  className="w-full px-3 py-2 text-left hover:bg-secondary text-sm"
                  onClick={() => {
                    onUpdate(leg.id, 'destination', s.code);
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
          <Label>Data</Label>
          <Input
            type="date"
            value={leg.date}
            onChange={(e) => onUpdate(leg.id, 'date', e.target.value)}
            min={minDate || new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>
    </div>
  );
}
