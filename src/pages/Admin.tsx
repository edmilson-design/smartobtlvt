import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users, Shield, Loader2, Pencil, Search, UserCog,
} from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  department: string | null;
  cost_center: string | null;
  company_name: string | null;
  approval_limit: number | null;
  manager_id: string | null;
  manager_name?: string;
  roles: string[];
}

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [formManagerId, setFormManagerId] = useState<string>('');
  const [formDepartment, setFormDepartment] = useState('');
  const [formCostCenter, setFormCostCenter] = useState('');
  const [formApprovalLimit, setFormApprovalLimit] = useState('');
  const [formRole, setFormRole] = useState<string>('employee');

  useEffect(() => {
    if (user) {
      checkAdmin();
    }
  }, [user]);

  const checkAdmin = async () => {
    const { data } = await supabase.rpc('is_admin');
    setIsAdmin(!!data);
    if (data) loadUsers();
    else setLoading(false);
  };

  const loadUsers = async () => {
    setLoading(true);

    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name');

    const { data: roles } = await supabase
      .from('user_roles')
      .select('*');

    if (profiles) {
      const roleMap = new Map<string, string[]>();
      (roles || []).forEach((r: any) => {
        const existing = roleMap.get(r.user_id) || [];
        existing.push(r.role);
        roleMap.set(r.user_id, existing);
      });

      const profileMap = new Map(profiles.map((p: any) => [p.id, p.full_name]));

      setUsers(profiles.map((p: any) => ({
        ...p,
        manager_name: p.manager_id ? profileMap.get(p.manager_id) || '—' : null,
        roles: roleMap.get(p.id) || ['employee'],
      })));
    }

    setLoading(false);
  };

  const openEdit = (u: UserProfile) => {
    setEditUser(u);
    setFormManagerId(u.manager_id || '');
    setFormDepartment(u.department || '');
    setFormCostCenter(u.cost_center || '');
    setFormApprovalLimit(String(u.approval_limit ?? 1000));
    setFormRole(u.roles.includes('admin') ? 'admin' : u.roles.includes('manager') ? 'manager' : 'employee');
  };

  const handleSave = async () => {
    if (!editUser) return;
    setSaving(true);

    // Update profile (admin RLS allows full access)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        manager_id: formManagerId || null,
        department: formDepartment || null,
        cost_center: formCostCenter || null,
        approval_limit: Number(formApprovalLimit) || 1000,
      })
      .eq('id', editUser.id);

    if (profileError) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar o perfil.' });
      setSaving(false);
      return;
    }

    // Update role: delete existing roles and insert new one
    await supabase.from('user_roles').delete().eq('user_id', editUser.id);
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({ user_id: editUser.id, role: formRole as any });

    if (roleError) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar o papel.' });
      setSaving(false);
      return;
    }

    toast({ title: 'Salvo', description: `Perfil de ${editUser.full_name} atualizado com sucesso.` });
    setSaving(false);
    setEditUser(null);
    loadUsers();
  };

  const filteredUsers = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadge = (roles: string[]) => {
    if (roles.includes('admin')) return <Badge className="bg-red-100 text-red-800 border-red-200">Admin</Badge>;
    if (roles.includes('manager')) return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Gestor</Badge>;
    return <Badge variant="secondary">Funcionário</Badge>;
  };

  if (!isAdmin && !loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <Shield className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground">Esta página é exclusiva para administradores.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <UserCog className="h-6 w-6" />
            Administração de Usuários
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie hierarquia, papéis e limites de aprovação
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5" />
                  Usuários ({filteredUsers.length})
                </CardTitle>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou e-mail..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Papel</TableHead>
                      <TableHead>Gestor</TableHead>
                      <TableHead>Departamento</TableHead>
                      <TableHead className="text-right">Limite</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.full_name}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                        <TableCell>{getRoleBadge(u.roles)}</TableCell>
                        <TableCell className="text-sm">{u.manager_name || '—'}</TableCell>
                        <TableCell className="text-sm">{u.department || '—'}</TableCell>
                        <TableCell className="text-right text-sm">
                          R$ {(u.approval_limit ?? 1000).toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(u)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>{editUser?.full_name} — {editUser?.email}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Papel</Label>
              <Select value={formRole} onValueChange={setFormRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Funcionário</SelectItem>
                  <SelectItem value="manager">Gestor</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Gestor (superior direto)</Label>
              <Select value={formManagerId} onValueChange={setFormManagerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um gestor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {users
                    .filter(u => u.id !== editUser?.id)
                    .map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Departamento</Label>
              <Input value={formDepartment} onChange={(e) => setFormDepartment(e.target.value)} placeholder="Ex: Financeiro" />
            </div>

            <div className="space-y-2">
              <Label>Centro de Custos</Label>
              <Input value={formCostCenter} onChange={(e) => setFormCostCenter(e.target.value)} placeholder="Ex: CC-001" />
            </div>

            <div className="space-y-2">
              <Label>Limite de Aprovação (R$)</Label>
              <Input type="number" value={formApprovalLimit} onChange={(e) => setFormApprovalLimit(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
