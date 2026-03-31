import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Seo from "@/components/Seo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <Seo
        title="Página não encontrada | Home3 Tecnologia"
        description="A página que você tentou acessar não foi encontrada. Volte para a Home3 Tecnologia e conheça nossas soluções em automação residencial."
        path={location.pathname}
        noindex
      />
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Ops! Página não encontrada.</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Voltar para a Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
