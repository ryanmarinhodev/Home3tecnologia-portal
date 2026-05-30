import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import logo from "./LOGOHOME3TECNOLOGIA.png";

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
  const isContatoPage = location.pathname === "/contato";

  useEffect(() => {
    const handleScroll = () => {
      const isPastHero = window.scrollY > window.innerHeight * 0.7;
      setScrolledPastHero(isPastHero);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const shouldHaveBg = (!isHomePage && !isContatoPage) || ((isHomePage || isContatoPage) && scrolledPastHero);
  const hasHeaderBg = shouldHaveBg || mobileOpen;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      hasHeaderBg 
        ? "bg-background/95 backdrop-blur-xl border-b border-primary/10 shadow-lg" 
        : "bg-transparent backdrop-blur-sm border-b border-transparent"
    }`}>
      <div className="container flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="font-display text-xl md:text-2xl font-semibold tracking-tight text-foreground transition-all duration-300">
          <img
            src={logo}
            alt="Home3 Logo"
            className={`block h-8 md:h-8 w-auto max-w-[165px] md:max-w-[220px] object-contain transition-all duration-300 ${hasHeaderBg ? "drop-shadow-none" : "drop-shadow-lg"}`}
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`font-body text-sm tracking-wide transition-all duration-300 ${
                location.pathname === item.path
                  ? "text-primary font-medium"
                  : hasHeaderBg 
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
            <Button variant={hasHeaderBg ? "outline" : "outlineBrass"} size="sm" className={`ml-2 gap-2 ${!hasHeaderBg ? "border-card/30 text-card hover:bg-card/10" : ""}`}>
              <User size={16} />
              Área do Cliente
            </Button>
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button
          type="button"
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          aria-controls="mobile-navigation"
          aria-expanded={mobileOpen}
          className={`lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors duration-300 ${
            hasHeaderBg ? "text-foreground hover:text-primary" : "text-card hover:text-primary"
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
            id="mobile-navigation"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden overflow-hidden border-b border-primary/10 bg-background/95 backdrop-blur-xl shadow-lg transition-colors duration-300"
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
                      : "text-foreground/70 hover:text-foreground"
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
                <Button variant="outline" size="default" className="w-full mt-2 gap-2">
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
