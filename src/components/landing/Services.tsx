import { Plane, Building2, Car, Calendar, Globe, Headphones } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const services = [
  {
    icon: Plane,
    title: "Passagens Aéreas",
    description: "Melhores tarifas e rotas otimizadas para viagens nacionais e internacionais.",
  },
  {
    icon: Building2,
    title: "Hospedagem",
    description: "Hotéis selecionados com tarifas corporativas exclusivas em todo o mundo.",
  },
  {
    icon: Car,
    title: "Transfer e Aluguel",
    description: "Transfers executivos e aluguel de veículos com motorista ou sem.",
  },
  {
    icon: Calendar,
    title: "Eventos Corporativos",
    description: "Organização completa de eventos, congressos e feiras empresariais.",
  },
  {
    icon: Globe,
    title: "Viagens Internacionais",
    description: "Assessoria para vistos, documentação e requisitos de entrada.",
  },
  {
    icon: Headphones,
    title: "Assistente IA 24/7",
    description: "Tire dúvidas sobre sua viagem a qualquer momento com nossa IA inteligente.",
  },
];

export const Services = () => {
  return (
    <section id="servicos" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Nossos Serviços
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Soluções completas para todas as necessidades de viagem da sua empresa
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((service) => (
            <Card key={service.title} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{service.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
