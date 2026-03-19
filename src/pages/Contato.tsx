import { useState } from "react";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AnimatedSection from "@/components/AnimatedSection";
import { toast } from "sonner";

const Contato = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <main className="pt-20">
      <AnimatedSection className="py-20 md:py-28">
        <div className="container">
          <p className="font-display text-2xl uppercase tracking-[0.3em] text-primary mb-8">Contato</p>
          <h1 className="font-display text-4xl md:text-30xl font-light text-foreground max-w-3xl leading-tight">
            Vamos conversar sobre{" "}
            <span className="font-semibold">seu projeto</span>
          </h1>
        </div>
      </AnimatedSection>

      <div className="container pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="font-body text-sm text-foreground mb-2 block">Nome *</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Seu nome completo"
                  className="bg-card border-border font-body"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="font-body text-sm text-foreground mb-2 block">E-mail *</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="seu@email.com"
                  className="bg-card border-border font-body"
                  maxLength={255}
                />
              </div>
              <div>
                <label className="font-body text-sm text-foreground mb-2 block">Telefone</label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="(xx) xxxx-xxxx"
                  className="bg-card border-border font-body"
                  maxLength={20}
                />
              </div>
              <div>
                <label className="font-body text-sm text-foreground mb-2 block">Mensagem *</label>
                <Textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Conte-nos sobre seu projeto, seus objetivos e expectativas..."
                  className="bg-card border-border font-body min-h-[150px]"
                  maxLength={1000}
                />
              </div>
              <Button type="submit" variant="brass" size="xl" className="w-full">
                Enviar Mensagem
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-10">
            <div>
              <h3 className="font-display text-xl font-medium text-foreground mb-6">Informações</h3>
              <div className="space-y-6">
                {[
                  { icon: MapPin, label: "Endereço", value: "Rua Silvino chaves, Nº 360, João Pessoa, PB — Brasil" },
                  { icon: Phone, label: "Telefone", value: "(83)3142-1219" },
                  { icon: Mail, label: "E-mail", value: "home3tecnologia@gmail.com" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <item.icon size={20} className="text-primary mt-0.5" strokeWidth={1.5} />
                    <div>
                      <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1">{item.label}</p>
                      <p className="font-body text-foreground">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp CTA */}
            <div className="bg-accent rounded-lg p-8">
              <MessageCircle size={28} className="text-accent-foreground mb-4" strokeWidth={1.5} />
              <h3 className="font-display text-lg font-medium text-accent-foreground mb-2">
                Prefere WhatsApp?
              </h3>
              <p className="font-body text-sm text-accent-foreground/70 mb-6">
                Converse diretamente com nossa equipe pelo WhatsApp para um atendimento mais rápido.
              </p>
              <a
                href="https://wa.me/558331421219?text=Ol%C3%A1%2C%20gostaria%20de%20saber%20mais%20sobre%20os%20servi%C3%A7os%20da%20Home3Tecnologia."
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="brass" size="lg" className="w-full">
                  Abrir WhatsApp
                </Button>
              </a>
            </div>

            {/* Social */}
            <div>
              <h3 className="font-display text-sm font-medium text-foreground mb-4 uppercase tracking-wider">Redes Sociais</h3>
              <div className="flex gap-4">
                {["Instagram"].map((social) => (
                  <a
                    key={social}
                    href="https://www.instagram.com/home3tecnologia/"
                    target="_blank"
                    className="font-body text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {social}
                  </a>
                  
                ))}
                {[ "YouTube"].map((youtube) => (
                  <a
                    key={youtube}
                    href="https://www.youtube.com/@home3tecnologia470"
                    target="_blank"
                    className="font-body text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {youtube}
                  </a>
                  
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Contato;
