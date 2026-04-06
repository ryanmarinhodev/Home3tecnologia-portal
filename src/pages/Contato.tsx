import { useState } from "react";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AnimatedSection from "@/components/AnimatedSection";
import Seo from "@/components/Seo";
import { toast } from "sonner";
import contatoBackgroundImage from "../assets/frente-home3.jpg";

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
    <main
      className="pt-20 min-h-screen bg-cover bg-no-repeat bg-[50%_14%] sm:bg-[50%_18%] md:bg-[50%_24%] md:bg-fixed"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(9, 16, 26, 0.56) 0%, rgba(9, 16, 26, 0.26) 38%, rgba(9, 16, 26, 0.08) 72%, rgba(9, 16, 26, 0) 100%), url(${contatoBackgroundImage})`,
      }}
    >
      <Seo
        title="Contato Home3 | Automação Residencial em João Pessoa"
        description="Solicite um orçamento de automação residencial em João Pessoa. Fale com a Home3 sobre iluminação, segurança, climatização e integração completa da sua casa."
        path="/contato"
      />

      <AnimatedSection className="py-16 sm:py-20 md:py-28">
        <div className="container min-h-[70vh] sm:min-h-[64vh] md:min-h-[56vh] flex flex-col justify-end pb-10 md:pb-14">
          <p className="font-display text-2xl uppercase tracking-[0.3em] text-primary mb-8 drop-shadow-md">Contato</p>
          <h1 className="font-display text-4xl md:text-30xl font-light text-white max-w-3xl leading-tight drop-shadow-md">
            Vamos conversar sobre{" "}
            <span className="font-semibold">seu projeto</span>
          </h1>
          <p className="font-body text-white/85 mt-6 max-w-2xl text-base md:text-lg drop-shadow-md">
            Fachada da Home3 Tecnologia na Rua Silvino Chaves, 360. Use esta referência para chegar com facilidade.
          </p>
        </div>
      </AnimatedSection>

      <section className="mt-14 sm:mt-12 md:mt-16 bg-background/88 backdrop-blur-sm border-t border-white/20">
        <div className="container py-14 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12">
            {/* Form - Left Side */}
            <div className="rounded-2xl border border-border/70 bg-card p-6 md:p-8 shadow-[0_18px_40px_rgba(0,0,0,0.14)] h-fit">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="font-body text-sm text-foreground mb-2 block">Nome *</label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Seu nome completo"
                    className="bg-background border-border font-body"
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
                    className="bg-background border-border font-body"
                    maxLength={255}
                  />
                </div>
                <div>
                  <label className="font-body text-sm text-foreground mb-2 block">Telefone</label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="(xx) xxxx-xxxx"
                    className="bg-background border-border font-body"
                    maxLength={20}
                  />
                </div>
                <div>
                  <label className="font-body text-sm text-foreground mb-2 block">Mensagem *</label>
                  <Textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Conte-nos sobre seu projeto, seus objetivos e expectativas..."
                    className="bg-background border-border font-body min-h-[150px]"
                    maxLength={1000}
                  />
                </div>
                <Button type="submit" variant="brass" size="xl" className="w-full">
                  Enviar Mensagem
                </Button>
              </form>
            </div>

            {/* Location & Map Panel - Right Side */}
            <div className="space-y-6 flex flex-col">
              {/* Google Maps Embed - Larger */}
              <div className="rounded-2xl overflow-hidden border border-border/70 shadow-[0_18px_40px_rgba(0,0,0,0.12)] h-96 md:h-full min-h-[500px]">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3959.4622394127055!2d-34.8636805!3d-7.1397196!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7ace8364ae11111%3A0x1234567890abc!2sRua%20Silvino%20Chaves%2C%20360%20-%20Jo%C3%A3o%20Pessoa%2C%20PB!5e0!3m2!1spt-BR!2sbr!4v1234567890"
                ></iframe>
              </div>

              {/* Info Card - Compact */}
              <div className="space-y-4 rounded-2xl border border-border/70 bg-card p-6 md:p-8 shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
                <h3 className="font-display text-lg font-medium text-foreground">Informações</h3>
                <div className="space-y-4">
                  {[
                    { icon: MapPin, label: "Endereço", value: "Rua Silvino Chaves, Nº 360" },
                    { icon: Phone, label: "Telefone", value: "(83) 3142-1219" },
                    { icon: Mail, label: "E-mail", value: "home3tecnologia@gmail.com" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-3">
                      <item.icon size={18} className="text-primary mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                      <div>
                        <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-0.5">{item.label}</p>
                        <p className="font-body text-sm text-foreground">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-border/40">
                  <a
                    href="https://www.google.com/maps/search/Rua+Silvino+Chaves,+360,+Jo%C3%A3o+Pessoa,+PB/@-7.1397196,-34.8636805,17z"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full gap-2 text-xs border-primary/30 hover:border-primary">
                      <MapPin size={16} />
                      <span className="hidden sm:inline">Localização</span>
                      <span className="sm:hidden">Maps</span>
                    </Button>
                  </a>
                  <a
                    href="https://wa.me/558331421219?text=Olá, gostaria de saber mais sobre os serviços da Home3 Tecnologia."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="brass" size="sm" className="w-full gap-2 text-xs">
                      <MessageCircle size={16} />
                      WhatsApp
                    </Button>
                  </a>
                </div>

                {/* Social Links */}
                <div className="border-t border-border/40 pt-3">
                  <h3 className="font-display text-xs font-medium text-foreground mb-2 uppercase tracking-wider">Redes</h3>
                  <div className="flex gap-2">
                    {[
                      { name: "Instagram", url: "https://www.instagram.com/home3tecnologia/" },
                      { name: "YouTube", url: "https://www.youtube.com/@home3tecnologia470" },
                    ].map((social) => (
                      <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-body text-xs px-2.5 py-1.5 rounded-md bg-background/50 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
                      >
                        {social.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contato;
