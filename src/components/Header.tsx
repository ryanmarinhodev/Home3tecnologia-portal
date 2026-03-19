import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import logo from "./LogoHOME301.png"; // Substitua pelo caminho do seu logo

const navItems = [
  { label: "Início", path: "/" },
  { label: "Serviços", path: "/servicos" },
  { label: "Projetos", path: "/projetos" },
  { label: "Sobre", path: "/sobre" },
  { label: "Contato", path: "/contato" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      const isPastHero = window.scrollY > window.innerHeight * 0.7;
      setScrolledPastHero(isPastHero);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const shouldHaveBg = !isHomePage || (isHomePage && scrolledPastHero);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      shouldHaveBg 
        ? "bg-background/95 backdrop-blur-xl border-b border-primary/10 shadow-lg" 
        : "bg-transparent backdrop-blur-sm border-b border-transparent"
    }`}>
      <div className="container flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="font-display text-xl md:text-2xl font-semibold tracking-tight text-foreground transition-all duration-300">
          
<img src={logo} alt="Home3 Logo" className={`h-8 md:h-10 transition-all duration-300 ${shouldHaveBg ? "drop-shadow-none" : "drop-shadow-lg"}`} />

        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`font-body text-sm tracking-wide transition-all duration-300 ${
                location.pathname === item.path
                  ? "text-primary font-medium"
                  : shouldHaveBg 
                    ? "text-foreground/70 hover:text-foreground" 
                    : "text-card/70 hover:text-card"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link to="/contato">
            <Button variant="brass" size="sm">Solicitar Orçamento</Button>
          </Link>
          <Link to="/login">
            <Button variant={shouldHaveBg ? "outline" : "outlineBrass"} size="sm" className={`ml-2 gap-2 ${!shouldHaveBg ? "border-card/30 text-card hover:bg-card/10" : ""}`}>
              <User size={16} />
              Área do Cliente
            </Button>
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button
          className={`md:hidden transition-colors duration-300 ${
            shouldHaveBg ? "text-foreground hover:text-primary" : "text-card hover:text-primary"
          }`}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`md:hidden border-b transition-colors duration-300 ${
              shouldHaveBg 
                ? "bg-background/98 backdrop-blur-xl border-primary/10" 
                : "bg-background/50 backdrop-blur-lg border-card/10"
            }`}
          >
            <nav className="container flex flex-col gap-4 py-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`font-body text-base transition-colors duration-300 ${
                    location.pathname === item.path
                      ? "text-primary font-medium"
                      : shouldHaveBg
                        ? "text-foreground/70 hover:text-foreground"
                        : "text-card/70 hover:text-card"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link to="/contato" onClick={() => setMobileOpen(false)}>
                <Button variant="brass" size="default" className="w-full mt-2">
                  Solicitar Orçamento
                </Button>
              </Link>
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <Button variant={shouldHaveBg ? "outline" : "outlineBrass"} size="default" className={`w-full mt-2 gap-2 ${!shouldHaveBg ? "border-card/30 text-card hover:bg-card/10" : ""}`}>
                  <User size={16} />
                  Área do Cliente
                </Button>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
