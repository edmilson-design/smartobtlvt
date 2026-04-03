import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Booking } from '@/types/booking';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Plane, Hotel, Car, Calendar, DollarSign, MapPin, User,
  CheckCircle, XCircle, Loader2, ShieldCheck, Building, FolderKanban,
  Clock, CreditCard, CheckCircle2, CircleDot
} from 'lucide-react';

interface ApprovalBooking extends Booking {
  employee_name?: string;
  employee_email?: string;
  approval_step_id?: string;
  step_order?: number;
}

interface ApprovalStep {
  id: string;
  step_order: number;
  approver_id: string;
  status: string;
  decided_at?: string;
  comments?: string;
  approver_name?: string;
}

export default function Approvals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pendingBookings, setPendingBookings] = useState<ApprovalBooking[]>([]);
  const [historyBookings, setHistoryBookings] = useState<ApprovalBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<ApprovalBooking | null>(null);
  const [approvalSteps, setApprovalSteps] = useState<ApprovalStep[]>([]);
  const [comments, setComments] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectBooking, setRejectBooking] = useState<ApprovalBooking | null>(null);
  const [isManagerOrAdmin, setIsManagerOrAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      checkRole();
      loadBookings();
    }
  }, [user]);

  const checkRole = async () => {
    const { data } = await supabase.rpc('is_manager_or_admin');
    setIsManagerOrAdmin(!!data);
  };

  const loadBookings = async () => {
    if (!user) return;
    setLoading(true);

    // Load pending bookings where current user is the next approver
    const { data: pendingSteps } = await supabase
      .from('approval_steps')
      .select('*')
      .eq('approver_id', user.id)
      .eq('status', 'pending');

    if (pendingSteps && pendingSteps.length > 0) {
      const bookingIds = pendingSteps.map((s: any) => s.booking_id);
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .in('id', bookingIds)
        .eq('status', 'pending');

      if (bookings) {
        // Get employee profiles
        const userIds = [...new Set(bookings.map((b: any) => b.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);

        const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
        const stepMap = new Map(pendingSteps.map((s: any) => [s.booking_id, s]));

        const enriched = bookings.map((b: any) => {
          const profile = profileMap.get(b.user_id);
          const step = stepMap.get(b.id);
          return {
            ...b,
            employee_name: profile?.full_name || 'Funcionário',
            employee_email: profile?.email || '',
            approval_step_id: step?.id,
            step_order: step?.step_order,
          } as ApprovalBooking;
        });
        setPendingBookings(enriched);
      }
    } else {
      setPendingBookings([]);
    }

    // Also load bookings via manager relationship (without approval_steps)
    const { data: directBookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('status', 'pending')
      .eq('requires_approval', true);

    if (directBookings && directBookings.length > 0) {
      // Filter to those where user is manager
      const userIds = [...new Set(directBookings.map((b: any) => b.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, manager_id')
        .in('id', userIds);

      const managedUsers = (profiles || []).filter((p: any) => p.manager_id === user.id);
      const managedIds = new Set(managedUsers.map((p: any) => p.id));
      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

      const existingIds = new Set(pendingBookings.map(b => b.id));
      const additionalBookings = directBookings
        .filter((b: any) => managedIds.has(b.user_id) && !existingIds.has(b.id))
        .map((b: any) => {
          const profile = profileMap.get(b.user_id);
          return {
            ...b,
            employee_name: profile?.full_name || 'Funcionário',
            employee_email: profile?.email || '',
          } as ApprovalBooking;
        });

      if (additionalBookings.length > 0) {
        setPendingBookings(prev => [...prev, ...additionalBookings]);
      }
    }

    // Load history (decided steps)
    const { data: decidedSteps } = await supabase
      .from('approval_steps')
      .select('*')
      .eq('approver_id', user.id)
      .in('status', ['approved', 'rejected'])
      .order('decided_at', { ascending: false })
      .limit(20);

    if (decidedSteps && decidedSteps.length > 0) {
      const bookingIds = decidedSteps.map((s: any) => s.booking_id);
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .in('id', bookingIds);

      if (bookings) {
        const userIds = [...new Set(bookings.map((b: any) => b.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);

        const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
        const stepMap = new Map(decidedSteps.map((s: any) => [s.booking_id, s]));

        setHistoryBookings(bookings.map((b: any) => {
          const profile = profileMap.get(b.user_id);
          const step = stepMap.get(b.id);
          return {
            ...b,
            employee_name: profile?.full_name,
            employee_email: profile?.email,
            step_order: step?.step_order,
          } as ApprovalBooking;
        }));
      }
    }

    setLoading(false);
  };

  const loadApprovalSteps = async (bookingId: string) => {
    const { data } = await supabase
      .from('approval_steps')
      .select('*')
      .eq('booking_id', bookingId)
      .order('step_order', { ascending: true });

    if (data && data.length > 0) {
      const approverIds = data.map((s: any) => s.approver_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', approverIds);

      const nameMap = new Map((profiles || []).map((p: any) => [p.id, p.full_name]));
      setApprovalSteps(data.map((s: any) => ({
        ...s,
        approver_name: nameMap.get(s.approver_id) || 'Aprovador',
      })));
    } else {
      setApprovalSteps([]);
    }
  };

  const handleApprove = async (booking: ApprovalBooking) => {
    setProcessing(booking.id);

    if (booking.approval_step_id) {
      const { error } = await supabase
        .from('approval_steps')
        .update({ status: 'approved', comments: comments || null })
        .eq('id', booking.approval_step_id);

      if (error) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível aprovar. Tente novamente.' });
        setProcessing(null);
        return;
      }
    } else {
      // Direct approval without approval_steps
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'approved',
          approved_by: user!.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', booking.id);

      if (error) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível aprovar. Tente novamente.' });
        setProcessing(null);
        return;
      }
    }

    toast({ title: 'Reserva aprovada', description: `Reserva de ${booking.employee_name} foi aprovada.` });
    setComments('');
    setSelectedBooking(null);
    setProcessing(null);
    loadBookings();
  };

  const handleReject = async () => {
    if (!rejectBooking) return;
    setProcessing(rejectBooking.id);

    if (rejectBooking.approval_step_id) {
      const { error } = await supabase
        .from('approval_steps')
        .update({ status: 'rejected', comments: comments || 'Rejeitado pelo gestor' })
        .eq('id', rejectBooking.approval_step_id);

      if (error) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível rejeitar. Tente novamente.' });
        setProcessing(null);
        return;
      }
    } else {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'rejected',
          rejection_reason: comments || 'Rejeitado pelo gestor',
        })
        .eq('id', rejectBooking.id);

      if (error) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível rejeitar. Tente novamente.' });
        setProcessing(null);
        return;
      }
    }

    toast({ title: 'Reserva rejeitada', description: `Reserva de ${rejectBooking.employee_name} foi rejeitada.` });
    setComments('');
    setShowRejectDialog(false);
    setRejectBooking(null);
    setSelectedBooking(null);
    setProcessing(null);
    loadBookings();
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

  const getBookingDescription = (b: ApprovalBooking) => {
    if (b.booking_type === 'flight') return `${b.airline || ''} ${b.flight_number || ''} • ${b.origin} → ${b.destination}`;
    if (b.booking_type === 'hotel') return `${b.hotel_name || ''} • ${b.destination}`;
    return `${b.car_company || ''} ${b.car_category || ''} • ${b.pickup_location || b.destination}`;
  };

  if (!isManagerOrAdmin && !loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <ShieldCheck className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground">Esta página é exclusiva para gestores e administradores.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-6 w-6" />
            Aprovações
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as solicitações de viagem dos seus subordinados
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Pending Section */}
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                Pendentes ({pendingBookings.length})
              </h2>

              {pendingBookings.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-500/50 mb-3" />
                    <p className="text-muted-foreground">Nenhuma reserva pendente de aprovação</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {pendingBookings.map((booking) => (
                    <Card key={booking.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          {/* Type & Employee */}
                          <div className="flex items-center gap-3 p-4 md:w-56 bg-yellow-50 dark:bg-yellow-950/20">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              {getBookingIcon(booking.booking_type)}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{getBookingTypeLabel(booking.booking_type)}</p>
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                                Pendente
                              </Badge>
                            </div>
                          </div>

                          {/* Details */}
                          <div className="flex-1 p-4 cursor-pointer" onClick={() => {
                            setSelectedBooking(booking);
                            loadApprovalSteps(booking.id);
                          }}>
                            <div className="flex items-center gap-2 mb-1">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{booking.employee_name}</span>
                              <span className="text-xs text-muted-foreground">({booking.employee_email})</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{getBookingDescription(booking)}</p>
                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {new Date(booking.start_date).toLocaleDateString('pt-BR')}
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3.5 w-3.5" />
                                {booking.currency} {booking.total_cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                              {booking.cost_center && (
                                <div className="flex items-center gap-1">
                                  <Building className="h-3.5 w-3.5" />
                                  {booking.cost_center}
                                </div>
                              )}
                              {booking.project && (
                                <div className="flex items-center gap-1">
                                  <FolderKanban className="h-3.5 w-3.5" />
                                  {booking.project}
                                </div>
                              )}
                            </div>
                            {booking.step_order && (
                              <p className="text-xs text-muted-foreground mt-1">Etapa {booking.step_order} do fluxo de aprovação</p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 p-4 border-t md:border-t-0 md:border-l">
                            <Button
                              size="sm"
                              className="gap-1"
                              disabled={processing === booking.id}
                              onClick={() => handleApprove(booking)}
                            >
                              {processing === booking.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="gap-1"
                              disabled={processing === booking.id}
                              onClick={() => {
                                setRejectBooking(booking);
                                setShowRejectDialog(true);
                              }}
                            >
                              <XCircle className="h-4 w-4" />
                              Rejeitar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* History Section */}
            {historyBookings.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                  Histórico de Decisões
                </h2>
                <div className="space-y-2">
                  {historyBookings.map((booking) => (
                    <Card key={booking.id} className="overflow-hidden opacity-80">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              {getBookingIcon(booking.booking_type)}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{booking.employee_name}</p>
                              <p className="text-xs text-muted-foreground">{getBookingDescription(booking)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className={
                              booking.status === 'approved' || booking.status === 'confirmed'
                                ? 'bg-green-100 text-green-800 border-green-200'
                                : 'bg-red-100 text-red-800 border-red-200'
                            }>
                              {booking.status === 'approved' || booking.status === 'confirmed' ? 'Aprovado' : 'Rejeitado'}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {booking.currency} {booking.total_cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Detail Dialog */}
        <Dialog open={!!selectedBooking} onOpenChange={(open) => { if (!open) setSelectedBooking(null); }}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedBooking && getBookingIcon(selectedBooking.booking_type)}
                {selectedBooking && getBookingTypeLabel(selectedBooking.booking_type)}
              </DialogTitle>
              <DialogDescription>
                Solicitado por {selectedBooking?.employee_name}
              </DialogDescription>
            </DialogHeader>

            {selectedBooking && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase">Detalhes</h4>
                  <div className="text-sm space-y-1">
                    {selectedBooking.booking_type === 'flight' && (
                      <>
                        <p><span className="text-muted-foreground">Voo:</span> {selectedBooking.airline} {selectedBooking.flight_number}</p>
                        <p><span className="text-muted-foreground">Rota:</span> {selectedBooking.origin} → {selectedBooking.destination}</p>
                        <p><span className="text-muted-foreground">Classe:</span> {selectedBooking.cabin_class}</p>
                      </>
                    )}
                    {selectedBooking.booking_type === 'hotel' && (
                      <>
                        <p><span className="text-muted-foreground">Hotel:</span> {selectedBooking.hotel_name}</p>
                        <p><span className="text-muted-foreground">Local:</span> {selectedBooking.destination}</p>
                        <p><span className="text-muted-foreground">Tipo:</span> {selectedBooking.room_type}</p>
                      </>
                    )}
                    {selectedBooking.booking_type === 'car_rental' && (
                      <>
                        <p><span className="text-muted-foreground">Locadora:</span> {selectedBooking.car_company}</p>
                        <p><span className="text-muted-foreground">Categoria:</span> {selectedBooking.car_category}</p>
                        <p><span className="text-muted-foreground">Retirada:</span> {selectedBooking.pickup_location}</p>
                      </>
                    )}
                    <p><span className="text-muted-foreground">Data:</span> {new Date(selectedBooking.start_date).toLocaleDateString('pt-BR')}{selectedBooking.end_date ? ` - ${new Date(selectedBooking.end_date).toLocaleDateString('pt-BR')}` : ''}</p>
                    <p><span className="text-muted-foreground">Valor:</span> {selectedBooking.currency} {selectedBooking.total_cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>

                {(selectedBooking.cost_center || selectedBooking.project) && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase">Informações Corporativas</h4>
                    <div className="text-sm space-y-1">
                      {selectedBooking.cost_center && <p><span className="text-muted-foreground">Centro de Custos:</span> {selectedBooking.cost_center}</p>}
                      {selectedBooking.project && <p><span className="text-muted-foreground">Projeto:</span> {selectedBooking.project}</p>}
                    </div>
                  </div>
                )}

                {/* Approval Steps */}
                {approvalSteps.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase">Fluxo de Aprovação</h4>
                    <div className="space-y-2">
                      {approvalSteps.map((step) => (
                        <div key={step.id} className="flex items-center gap-3 text-sm">
                          {step.status === 'approved' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                          ) : step.status === 'rejected' ? (
                            <XCircle className="h-4 w-4 text-destructive shrink-0" />
                          ) : (
                            <CircleDot className="h-4 w-4 text-muted-foreground shrink-0" />
                          )}
                          <span>Etapa {step.step_order}: {step.approver_name}</span>
                          <Badge variant="outline" className="text-xs ml-auto">
                            {step.status === 'approved' ? 'Aprovado' : step.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Passenger Info */}
                {selectedBooking.passenger_first_name && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase">Passageiro</h4>
                    <p className="text-sm">{selectedBooking.passenger_first_name} {selectedBooking.passenger_last_name}</p>
                  </div>
                )}

                {/* Action buttons */}
                {selectedBooking.status === 'pending' && (
                  <div className="flex items-center gap-2 pt-2">
                    <Textarea
                      placeholder="Comentário (opcional)"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      rows={2}
                    />
                  </div>
                )}
                {selectedBooking.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 gap-1"
                      disabled={processing === selectedBooking.id}
                      onClick={() => handleApprove(selectedBooking)}
                    >
                      {processing === selectedBooking.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                      Aprovar
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1 gap-1"
                      disabled={processing === selectedBooking.id}
                      onClick={() => {
                        setRejectBooking(selectedBooking);
                        setShowRejectDialog(true);
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                      Rejeitar
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Confirmation Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Rejeitar Reserva</DialogTitle>
              <DialogDescription>
                Informe o motivo da rejeição da reserva de {rejectBooking?.employee_name}.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="Motivo da rejeição..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { setShowRejectDialog(false); setComments(''); }}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!comments.trim() || processing === rejectBooking?.id}
              >
                {processing === rejectBooking?.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Confirmar Rejeição
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}