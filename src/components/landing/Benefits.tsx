import { CheckCircle2, Bot, Shield, Clock, TrendingDown, Users } from "lucide-react";

const benefits = [
  {
    icon: Bot,
    title: "Assistente IA Inteligente",
    description: "Pergunte sobre horários de voo, check-in, bagagem e muito mais. Respostas instantâneas 24 horas.",
  },
  {
    icon: TrendingDown,
    title: "Redução de Custos",
    description: "Tarifas negociadas e relatórios que ajudam a otimizar os gastos com viagens.",
  },
  {
    icon: Clock,
    title: "Economia de Tempo",
    description: "Portal self-service para consultas e aprovações automatizadas por gestores.",
  },
  {
    icon: Shield,
    title: "Segurança e Compliance",
    description: "Políticas de viagem integradas e controle total sobre as reservas.",
  },
  {
    icon: Users,
    title: "Portal Corporativo",
    description: "Área exclusiva para sua empresa com histórico completo de viagens.",
  },
  {
    icon: CheckCircle2,
    title: "Integração Total",
    description: "Dados sincronizados automaticamente de companhias aéreas e hotéis.",
  },
];

export const Benefits = () => {
  return (
    <section id="beneficios" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Por Que Escolher Nossa Plataforma?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tecnologia de ponta combinada com atendimento especializado
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <benefit.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
