import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Carlos Mendes",
    role: "Diretor Financeiro",
    company: "TechCorp Brasil",
    content: "O assistente de IA revolucionou a forma como nossos colaboradores obtêm informações sobre viagens. Respostas instantâneas a qualquer hora.",
    rating: 5,
  },
  {
    name: "Ana Paula Silva",
    role: "Gerente de RH",
    company: "Indústrias Sigma",
    content: "Reduzimos em 30% os custos com viagens e o tempo gasto em aprovações diminuiu drasticamente com o portal corporativo.",
    rating: 5,
  },
  {
    name: "Roberto Almeida",
    role: "CEO",
    company: "Consultoria Nexus",
    content: "Atendimento excepcional e plataforma intuitiva. Nossa equipe viaja muito e nunca tivemos problemas desde que começamos a usar.",
    rating: 5,
  },
];

export const Testimonials = () => {
  return (
    <section id="depoimentos" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            O Que Nossos Clientes Dizem
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Empresas que confiam em nossa plataforma
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground mb-6">{testimonial.content}</p>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {testimonial.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role} • {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
