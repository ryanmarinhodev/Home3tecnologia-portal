import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Lightbulb, Thermometer, Shield, Music, Wifi, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedSection from "@/components/AnimatedSection";
import heroDay from "@/assets/hero-day.jpg";
import heroNight from "@/assets/hero-night.jpg";

const services = [
  { icon: Lightbulb, title: "Iluminação", desc: "Cenários personalizados que se adaptam ao seu ritmo" },
  { icon: Thermometer, title: "Climatização", desc: "Conforto térmico inteligente em cada ambiente" },
  { icon: Shield, title: "Segurança", desc: "Monitoramento discreto e proteção total" },
  { icon: Music, title: "Áudio & Vídeo", desc: "Experiência imersiva integrada à arquitetura" },
  { icon: Wifi, title: "Infraestrutura", desc: "Conectividade robusta e invisível" },
  { icon: Zap, title: "Automação", desc: "Controle total com um toque" },
];

const differentials = [
  { number: "200+", label: "Projetos entregues" },
  { number: "7+", label: "Anos de experiência" },
  { number: "100%", label: "Satisfação dos clientes" },

];

const Index = () => {
  const [sliderValue, setSliderValue] = useState(0);
  const nightOpacity = sliderValue / 100;

  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Day Image */}
        <img
          src={heroDay}
          alt="Sala de estar moderna com iluminação natural"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Night Image */}
        <img
          src={heroNight}
          alt="Sala de estar moderna com iluminação noturna"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          style={{ opacity: nightOpacity }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 hero-gradient-overlay" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end pb-24 md:pb-32">
          <div className="container">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="font-display text-4xl md:text-6xl lg:text-7xl font-light text-card max-w-3xl leading-tight"
            >
              Tecnologia que você{" "}
              <span className="font-semibold">sente</span>,{" "}
              não que você vê.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="font-body text-card/70 mt-6 max-w-lg text-base md:text-lg"
            >
              Automação residencial premium que se integra perfeitamente ao seu estilo de vida.
            </motion.p>

            {/* Slider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="mt-10 flex items-center gap-4 max-w-xs"
            >
              <Sun size={18} className="text-card/60" />
              <input
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={(e) => setSliderValue(Number(e.target.value))}
                className="w-full h-0.5 bg-card/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <Moon size={18} className="text-card/60" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9 }}
              className="mt-10 flex gap-4"
            >
              <Link to="/contato">
                <Button variant="hero" size="xl">Solicitar Orçamento</Button>
              </Link>
              <Link to="/projetos">
                <Button variant="outlineBrass" size="xl" className="border-card/30 text-card hover:bg-card/10 hover:text-card">
                  Ver Projetos
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <AnimatedSection className="py-24 md:py-32">
        <div className="container">
          <div className="max-w-2xl mb-16">
            <p className="font-display text-xs uppercase tracking-[0.3em] text-primary mb-4">Soluções</p>
            <h2 className="font-display text-3xl md:text-5xl font-light text-foreground leading-tight">
              Uma casa que responde<br />
              <span className="font-semibold">às suas necessidades</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group bg-card p-8 rounded-lg border border-border hover:border-primary/30 transition-all duration-500"
              >
                <service.icon size={28} className="text-primary mb-6" strokeWidth={1.5} />
                <h3 className="font-display text-lg font-medium text-foreground mb-2">{service.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/servicos">
              <Button variant="outlineBrass" size="lg">Conheça Todos os Serviços</Button>
            </Link>
          </div>
        </div>
      </AnimatedSection>

      {/* Differentials */}
      <AnimatedSection className="py-24 md:py-32 bg-foreground">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
            {differentials.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="text-center"
              >
                <p className="font-display text-4xl md:text-5xl font-light text-primary">{item.number}</p>
                <p className="font-body text-xs md:text-sm text-card/50 mt-2 uppercase tracking-wider">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* CTA */}
      <AnimatedSection className="py-24 md:py-32">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-5xl font-light text-foreground mb-6">
            Pronto para transformar<br />
            <span className="font-semibold">sua residência?</span>
          </h2>
          <p className="font-body text-muted-foreground max-w-lg mx-auto mb-10">
            Entre em contato e descubra como a tecnologia pode elevar o conforto, a segurança e a estética da sua casa.
          </p>
          <Link to="/contato">
            <Button variant="brass" size="xl">Fale Conosco</Button>
          </Link>
        </div>
      </AnimatedSection>
    </main>
  );
};

export default Index;
