import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Plane, 
  Hotel, 
  Car, 
  LayoutDashboard, 
  ClipboardList,
  Settings,
  LogOut,
  Menu,
  ChevronDown,
  User,
  ShieldCheck
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import logo from '@/assets/logo-lvt.png';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const baseNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/booking/flights', label: 'Passagens', icon: Plane },
  { href: '/booking/hotels', label: 'Hotéis', icon: Hotel },
  { href: '/booking/cars', label: 'Carros', icon: Car },
  { href: '/my-bookings', label: 'Minhas Reservas', icon: ClipboardList },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isManagerOrAdmin, setIsManagerOrAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      supabase.rpc('is_manager_or_admin').then(({ data }) => {
        setIsManagerOrAdmin(!!data);
      });
    }
  }, [user]);

  const navItems = [
    ...baseNavItems,
    ...(isManagerOrAdmin ? [{ href: '/approvals', label: 'Aprovações', icon: ShieldCheck }] : []),
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow border-r bg-card px-4 py-6">
          <div className="flex items-center gap-2 px-4 mb-8">
            <img src={logo} alt="LVT" className="h-10" />
          </div>
          
          <nav className="flex-1 space-y-1">
            <NavLinks />
          </nav>

          <div className="mt-auto pt-4 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-3 px-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium truncate">{user?.email}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center gap-4 border-b bg-card px-4 py-3">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex flex-col h-full px-4 py-6">
              <div className="flex items-center gap-2 px-4 mb-8">
                <img src={logo} alt="LVT" className="h-10" />
              </div>
              
              <nav className="flex-1 space-y-1">
                <NavLinks />
              </nav>

              <div className="mt-auto pt-4 border-t">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-5 w-5" />
                  Sair
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <img src={logo} alt="LVT" className="h-8" />
      </header>

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
