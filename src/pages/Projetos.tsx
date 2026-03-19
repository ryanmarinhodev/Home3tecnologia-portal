import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import AnimatedSection from "@/components/AnimatedSection";
import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import project3 from "@/assets/project-3.jpg";

const projects = [
  {
    image: project1,
    title: "Residência Jardins",
    location: "São Paulo, SP",
    scope: "Automação completa · Iluminação · Áudio · Segurança",
    description: "Projeto de automação total para residência de 450m², integrando iluminação cênica, áudio multiroom e sistema de segurança com IA.",
  },
  {
    image: project2,
    title: "Apartamento Vila Nova",
    location: "São Paulo, SP",
    scope: "Climatização · Persianas · Iluminação",
    description: "Transformação de um apartamento de alto padrão com automação de climatização inteligente e controle de persianas por cenários.",
  },
  {
    image: project3,
    title: "Home Theater Alphaville",
    location: "Barueri, SP",
    scope: "Áudio & Vídeo · Acústica · Iluminação",
    description: "Sala de cinema residencial com tratamento acústico profissional, projeção 4K e sistema de áudio Dolby Atmos 7.2.4.",
  },
];

const Projetos = () => {
  return (
    <main className="pt-20">
      <AnimatedSection className="py-20 md:py-28">
        <div className="container">
          <p className="font-display text-xs uppercase tracking-[0.3em] text-primary mb-4">Portfólio</p>
          <h1 className="font-display text-4xl md:text-6xl font-light text-foreground max-w-3xl leading-tight">
            Projetos que{" "}
            <span className="font-semibold">inspiram</span>
          </h1>
          <p className="font-body text-muted-foreground mt-6 max-w-xl text-lg">
            Cada projeto é único. Conheça algumas das residências que transformamos com tecnologia invisível.
          </p>
        </div>
      </AnimatedSection>

      {/* Projects */}
      <div className="container pb-24">
        <div className="space-y-24">
          {projects.map((project, i) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                i % 2 === 1 ? "lg:direction-rtl" : ""
              }`}
            >
              <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                <div className="overflow-hidden rounded-lg">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
              <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                <p className="font-body text-xs uppercase tracking-[0.2em] text-primary mb-3">{project.location}</p>
                <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground mb-4">{project.title}</h2>
                <p className="font-body text-sm text-muted-foreground mb-4 uppercase tracking-wider">{project.scope}</p>
                <p className="font-body text-muted-foreground leading-relaxed">{project.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <AnimatedSection className="py-24 bg-muted">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-light text-foreground mb-6">
            Quer um projeto <span className="font-semibold">assim?</span>
          </h2>
          <p className="font-body text-muted-foreground mb-8 max-w-md mx-auto">
            Cada residência é um projeto exclusivo. Conte-nos sobre a sua.
          </p>
          <Link to="/contato">
            <Button variant="brass" size="xl">Iniciar Meu Projeto</Button>
          </Link>
        </div>
      </AnimatedSection>
    </main>
  );
};

export default Projetos;
