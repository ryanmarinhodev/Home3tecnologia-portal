import { Lightbulb, Thermometer, Shield, Music, Wifi, Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AnimatedSection from "@/components/AnimatedSection";
import { motion } from "framer-motion";

const timelineServices = [
  {
    period: "Manhã",
    time: "06:00 — 12:00",
    items: [
      {
        icon: Thermometer,
        title: "Climatização Inteligente",
        desc: "O sistema ajusta a temperatura automaticamente ao amanhecer, criando o ambiente perfeito para seu despertar. Sensores monitoram cada cômodo individualmente.",
        features: ["Controle por zona", "Integração com previsão do tempo", "Economia energética de até 40%"],
      },
      {
        icon: Lightbulb,
        title: "Persianas Automatizadas",
        desc: "As persianas se abrem gradualmente acompanhando a luz natural, eliminando o despertar abrupto. Cenários matinais pré-programados.",
        features: ["Sensores de luminosidade", "Agendamento por horário", "Controle remoto"],
      },
    ],
  },
  {
    period: "Tarde",
    time: "12:00 — 18:00",
    items: [
      {
        icon: Music,
        title: "Áudio Multiroom",
        desc: "Som ambiente distribuído pela casa, controlado por voz ou app. Caixas de som embutidas na arquitetura, completamente invisíveis.",
        features: ["Streaming integrado", "Zonas independentes", "Qualidade Hi-Fi"],
      },
      {
        icon: Wifi,
        title: "Infraestrutura de Rede",
        desc: "Conectividade robusta em cada canto. Wi-Fi mesh de alta performance que suporta dezenas de dispositivos simultaneamente.",
        features: ["Wi-Fi 6E mesh", "Cabeamento Cat6a", "Redundância total"],
      },
    ],
  },
  {
    period: "Noite",
    time: "18:00 — 06:00",
    items: [
      {
        icon: Lightbulb,
        title: "Iluminação Cênica",
        desc: "Cenários de iluminação que transformam o ambiente. Do jantar ao cinema, cada momento com a luz perfeita, sem interruptores visíveis.",
        features: ["Cenários personalizados", "Controle por voz", "Dimmerização suave"],
      },
      {
        icon: Shield,
        title: "Segurança 24h",
        desc: "Câmeras discretas, sensores de presença e alarme integrado. Monitoramento em tempo real no seu smartphone, com alertas inteligentes.",
        features: ["Câmeras com IA", "Fechaduras biométricas", "Monitoramento remoto"],
      },
    ],
  },
];

const Servicos = () => {
  return (
    <main className="pt-20">
      {/* Header */}
      <AnimatedSection className="py-20 md:py-28">
        <div className="container">
          <p className="font-display text-xs uppercase tracking-[0.3em] text-primary mb-4">Serviços</p>
          <h1 className="font-display text-4xl md:text-6xl font-light text-foreground max-w-3xl leading-tight">
            Um dia na sua casa{" "}
            <span className="font-semibold">inteligente</span>
          </h1>
          <p className="font-body text-muted-foreground mt-6 max-w-xl text-lg">
            Conheça como nossas soluções trabalham juntas para transformar cada momento do seu dia.
          </p>
        </div>
      </AnimatedSection>

      {/* Timeline */}
      {timelineServices.map((block, blockIdx) => (
        <AnimatedSection
          key={block.period}
          className={`py-20 md:py-28 ${blockIdx % 2 === 1 ? "bg-card" : ""}`}
        >
          <div className="container">
            <div className="flex items-baseline gap-4 mb-16">
              <h2 className="font-display text-5xl md:text-7xl font-light text-foreground">{block.period}</h2>
              <span className="font-body text-sm text-muted-foreground">{block.time}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {block.items.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.15 }}
                >
                  <item.icon size={32} className="text-primary mb-6" strokeWidth={1.5} />
                  <h3 className="font-display text-2xl font-medium text-foreground mb-4">{item.title}</h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">{item.desc}</p>
                  <ul className="space-y-2">
                    {item.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ArrowRight size={14} className="text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      ))}

      {/* Integration */}
      <AnimatedSection className="py-20 md:py-28">
        <div className="container">
          <div className="bg-foreground rounded-lg p-12 md:p-20 text-center">
            <Zap size={40} className="text-primary mx-auto mb-6" strokeWidth={1.5} />
            <h2 className="font-display text-3xl md:text-4xl font-light text-card mb-4">
              Integração <span className="font-semibold">Total</span>
            </h2>
            <p className="font-body text-card/60 max-w-lg mx-auto mb-8">
              Todos os sistemas conversam entre si. Uma única plataforma para controlar iluminação, climatização, segurança, áudio e mais.
            </p>
            <Link to="/contato">
              <Button variant="brass" size="xl">Solicitar Projeto</Button>
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </main>
  );
};

export default Servicos;
