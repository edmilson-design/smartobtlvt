import { Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import logoLvt from "@/assets/logo-lvt.png";

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={logoLvt} alt="LVT Viagens" className="h-10 w-auto brightness-0 invert" />
            </Link>
            <p className="text-background/70 mb-4">
              Sua parceira em viagens corporativas. Tecnologia e atendimento personalizado 
              para simplificar a gestão de viagens da sua empresa.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-background/70">
              <li><a href="#servicos" className="hover:text-background transition-colors">Serviços</a></li>
              <li><a href="#beneficios" className="hover:text-background transition-colors">Benefícios</a></li>
              <li><a href="#depoimentos" className="hover:text-background transition-colors">Depoimentos</a></li>
              <li><a href="#contato" className="hover:text-background transition-colors">Contato</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <ul className="space-y-3 text-background/70">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>contato@travelcorp.com.br</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>(11) 3000-0000</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1" />
                <span>São Paulo, SP - Brasil</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8 text-center text-background/50 text-sm">
          <p>© {new Date().getFullYear()} TravelCorp. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
