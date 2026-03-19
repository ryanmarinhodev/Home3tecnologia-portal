import { Link } from "react-router-dom";
import logo from "./LogoHOME3.png"; // Substitua pelo caminho do seu logo


const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <h3 className="font-display text-2xl font-semibold mb-4">
              <img src={logo} alt="Home3 Logo" className="h-8 md:h-10" />
            </h3>
            <p className="font-body text-background/60 max-w-md text-sm leading-relaxed">
              Nossa Prioridade é realizar seu sonho!</p>
          </div>

          <div>
            <h4 className="font-display text-xs uppercase tracking-widest mb-6 text-background/40">Navegação</h4>
            <nav className="flex flex-col gap-3">
              {[
                { label: "Início", path: "/" },
                { label: "Serviços", path: "/servicos" },
                { label: "Projetos", path: "/projetos" },
                { label: "Sobre", path: "/sobre" },
                { label: "Contato", path: "/contato" },
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="text-sm text-background/60 hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="font-display text-xs uppercase tracking-widest mb-6 text-background/40">Contato</h4>
            <div className="flex flex-col gap-3 text-sm text-background/60">
              <a href="mailto:Home3tecnologia@gmail.com" className="hover:text-primary transition-colors">
                Home3tecnologia@gmail.com
              </a>
              <a href="https://wa.me/55833142-1219" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                (83) 3142-1219
              </a>
              <p>João Pessoa,PB</p>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-background/40">
            © {new Date().getFullYear()} Home3 Tecnologia. Todos os direitos reservados.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-background/40 hover:text-primary transition-colors">
              Política de Privacidade
            </a>
            <a href="#" className="text-xs text-background/40 hover:text-primary transition-colors">
              Termos de Uso
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
