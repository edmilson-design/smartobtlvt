import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Network, User } from 'lucide-react';

interface Node { id: string; full_name: string; manager_id: string | null; roles: string[]; }

export default function HierarchyTree({ users }: { users: Node[] }) {
  const ids = new Set(users.map((u) => u.id));
  const children = new Map<string, Node[]>();
  users.forEach((u) => {
    if (u.manager_id && ids.has(u.manager_id)) {
      children.set(u.manager_id, [...(children.get(u.manager_id) || []), u]);
    }
  });
  const roots = users.filter((u) => !u.manager_id || !ids.has(u.manager_id));

  const render = (n: Node, depth: number, seen: Set<string>): JSX.Element | null => {
    if (seen.has(n.id)) return null;
    const next = new Set(seen).add(n.id);
    const kids = children.get(n.id) || [];
    return (
      <div key={n.id}>
        <div className="flex items-center gap-2 py-1.5" style={{ paddingLeft: depth * 24 }}>
          {depth > 0 && <span className="text-muted-foreground">└</span>}
          <User className="h-4 w-4 text-primary" />
          <span className="font-medium">{n.full_name}</span>
          {kids.length > 0 && <Badge variant="outline">{kids.length} subordinado{kids.length > 1 ? 's' : ''}</Badge>}
          {n.roles.includes('admin') && <Badge variant="secondary">Admin</Badge>}
          {n.roles.includes('manager') && <Badge variant="secondary">Gestor</Badge>}
        </div>
        {kids.map((k) => render(k, depth + 1, next))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg"><Network className="h-5 w-5" />Hierarquia</CardTitle>
        <CardDescription>Estrutura de gestores e subordinados. Edite o gestor de cada pessoa na tabela abaixo.</CardDescription>
      </CardHeader>
      <CardContent>{roots.map((r) => render(r, 0, new Set()))}</CardContent>
    </Card>
  );
}
