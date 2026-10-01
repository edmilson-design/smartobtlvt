import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShieldCheck } from 'lucide-react';

interface Stat { manager_id: string; manager_name: string; approved: number; rejected: number; pending: number; }

export default function ManagerStatsCard() {
  const [stats, setStats] = useState<Stat[] | null>(null);

  useEffect(() => {
    (supabase.rpc as any)('get_manager_approval_stats').then(({ data }: { data: Stat[] | null }) => setStats(data || []));
  }, []);

  if (!stats || stats.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" />Aprovações por gestor</CardTitle>
        <CardDescription>Total de solicitações aprovadas e rejeitadas por cada gestor</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Gestor</TableHead>
              <TableHead className="text-right">Aprovadas</TableHead>
              <TableHead className="text-right">Rejeitadas</TableHead>
              <TableHead className="text-right">Pendentes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.map((s) => (
              <TableRow key={s.manager_id}>
                <TableCell className="font-medium">{s.manager_name}</TableCell>
                <TableCell className="text-right font-semibold text-primary">{s.approved}</TableCell>
                <TableCell className="text-right font-semibold text-destructive">{s.rejected}</TableCell>
                <TableCell className="text-right text-muted-foreground">{s.pending}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
