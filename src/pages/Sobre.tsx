import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AnimatedSection from "@/components/AnimatedSection";
import { motion } from "framer-motion";
import { Eye, Target, Heart } from "lucide-react";

const values = [
  {
    icon: Eye,
    title: "Visão",
    desc: "Ser referência no mercado residencial e corporativo, sendo reconhecida com uma empresa de inovação e eficiência tecnológica.",
  },
  {
    icon: Target,
    title: "Missão",
    desc: "Trazer conforto, praticidade e segurança para ambientes familiares e corporativos com soluções contemporâneas em tecnologia.",
  },
  {
    icon: Heart,
    title: "Valores",
    desc: "Paixão pelo trabalho, respeito total as pessoas e excelência em tudo que fazemos e espírito inovador.",
  },
];

const Sobre = () => {
  return (
    <main className="pt-20">
      <AnimatedSection className="py-20 md:py-28">
        <div className="container">
          <p className="font-display text-xs uppercase tracking-[0.3em] text-primary mb-4">Sobre Nós</p>
          <h1 className="font-display text-4xl md:text-6xl font-light text-foreground max-w-3xl leading-tight">
            A arte de tornar a tecnologia{" "}
            <span className="font-semibold">invisível</span>
          </h1>
        </div>
      </AnimatedSection>

      {/* Story */}
      <AnimatedSection className="pb-24 md:pb-32">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground mb-8">Nossa História</h2>
              <div className="space-y-6 font-body text-muted-foreground leading-relaxed">
                <p>
                  A Home3 Tecnologia nasceu com o propósito de transformar a forma como as pessoas vivem e interagem com a tecnologia.
                </p>
                <p>
                 Com um olhar inovador e estratégico, a empresa foi criada a partir da visão de que a tecnologia deve ser simples, acessível e, acima de tudo, melhorar a qualidade de vida das pessoas. Assim surgiu uma equipe comprometida em unir tecnologia, conforto, segurança e bem-estar em cada projeto desenvolvido.
                </p>
                <p>
                  Desde o início, a Home3 se posiciona de forma plural e sem fronteiras, levando soluções inteligentes para diversos segmentos. Atuamos com automação, redes, áudio, vídeo, segurança e controle de acesso, sempre buscando otimizar processos e facilitar o uso da tecnologia no dia a dia.
                </p>
                <p>Acreditamos que o futuro já chegou. Por isso, trabalhamos diariamente para colocar tecnologia avançada a serviço das pessoas, criando ambientes mais inteligentes, eficientes e conectados.
                  </p>
                  <p>Home3 Tecnologia</p> 
                  <p>Nossa prioridade é realizar o seu sonho.</p>
              </div>
            </div>

            <div className="bg-foreground rounded-lg p-10 md:p-14">
              <p className="font-display text-xs uppercase tracking-[0.3em] text-primary mb-8">Expertise</p>
              <div className="space-y-8">
                {[
                  { label: "Automação Residencial", years: "7+ anos" },
                  { label: "Projetos de Iluminação", years: "200+ projetos" },
                  { label: "Áudio & Home Theater", years: "Dolby Atmos" },
                  { label: "Infraestrutura de Rede", years: "Ubiquiti Academy Certification" },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="flex items-center justify-between border-b border-card/10 pb-4"
                  >
                    <span className="font-body text-sm text-card/80">{item.label}</span>
                    <span className="font-display text-sm text-primary">{item.years}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Mission / Vision / Values */}
      <AnimatedSection className="py-24 bg-muted">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {values.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="text-center"
              >
                <item.icon size={32} className="text-primary mx-auto mb-6" strokeWidth={1.5} />
                <h3 className="font-display text-xl font-medium text-foreground mb-4">{item.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* CTA */}
      <AnimatedSection className="py-24 md:py-32">
        <div className="container text-center">
          <h2 className="font-display text-60xl md:text-6xl font-light text-foreground mb-6">
            <p className="text-primary"> Nossa Prioridade é realizar seu sonho.</p>
            <p> </p>
            Vamos construir algo <span className="font-semibold">extraordinário</span>
          </h2>
          <Link to="/contato">
            <Button variant="brass" size="xl">Entre em Contato</Button>
          </Link>
        </div>
      </AnimatedSection>
    </main>
  );
};

export default Sobre;
