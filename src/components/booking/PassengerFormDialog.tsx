import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export interface PassengerData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cpf: string;
  costCenter: string;
  project: string;
}

interface PassengerFormDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: PassengerData) => void;
  loading: boolean;
  title?: string;
}

function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function validateCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  return remainder === parseInt(digits[10]);
}

export default function PassengerFormDialog({ open, onClose, onConfirm, loading, title = 'Dados do Passageiro' }: PassengerFormDialogProps) {
  const [data, setData] = useState<PassengerData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cpf: '',
    costCenter: '',
    project: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof PassengerData, string>>>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!data.firstName.trim()) newErrors.firstName = 'Nome é obrigatório';
    if (!data.lastName.trim()) newErrors.lastName = 'Sobrenome é obrigatório';
    if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) newErrors.email = 'E-mail inválido';
    if (data.phone.replace(/\D/g, '').length < 10) newErrors.phone = 'Telefone inválido';
    if (!validateCPF(data.cpf)) newErrors.cpf = 'CPF inválido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onConfirm(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Preencha os dados do passageiro para finalizar a reserva</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pax-first">Nome</Label>
              <Input
                id="pax-first"
                placeholder="João"
                value={data.firstName}
                onChange={(e) => setData(d => ({ ...d, firstName: e.target.value }))}
                maxLength={50}
              />
              {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pax-last">Sobrenome</Label>
              <Input
                id="pax-last"
                placeholder="Silva"
                value={data.lastName}
                onChange={(e) => setData(d => ({ ...d, lastName: e.target.value }))}
                maxLength={50}
              />
              {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pax-email">E-mail</Label>
            <Input
              id="pax-email"
              type="email"
              placeholder="joao@empresa.com"
              value={data.email}
              onChange={(e) => setData(d => ({ ...d, email: e.target.value }))}
              maxLength={100}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pax-phone">Telefone</Label>
              <Input
                id="pax-phone"
                placeholder="(11) 99999-9999"
                value={data.phone}
                onChange={(e) => setData(d => ({ ...d, phone: formatPhone(e.target.value) }))}
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pax-cpf">CPF</Label>
              <Input
                id="pax-cpf"
                placeholder="000.000.000-00"
                value={data.cpf}
                onChange={(e) => setData(d => ({ ...d, cpf: formatCPF(e.target.value) }))}
              />
              {errors.cpf && <p className="text-xs text-destructive">{errors.cpf}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Confirmar Reserva
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
