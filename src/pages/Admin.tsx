import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  FolderOpen,
  Power,
  PowerOff,
  RefreshCw,
  LogOut,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { adminApi, ClientWithDetails, AdminStats } from "@/lib/api";

const Admin = () => {
  const { user, logout, isLoading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [clients, setClients] = useState<ClientWithDetails[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Modal de criar/editar cliente
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientWithDetails | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    companyName: "",
    googleDriveFolderId: "",
    googleDriveFolderName: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE" | "PENDING",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirecionar se não for admin
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/login");
    }
  }, [user, authLoading, isAdmin, navigate]);

  // Carregar dados
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [clientsData, statsData] = await Promise.all([
        adminApi.getClients(),
        adminApi.getStats(),
      ]);
      setClients(clientsData);
      setStats(statsData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      loadData();
    }
  }, [user, isAdmin]);

  // Filtrar clientes
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.client?.companyName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || client.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Abrir modal para criar cliente
  const openCreateModal = () => {
    setEditingClient(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      companyName: "",
      googleDriveFolderId: "",
      googleDriveFolderName: "",
      status: "ACTIVE",
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Abrir modal para editar cliente
  const openEditModal = (client: ClientWithDetails) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      password: "",
      phone: client.client?.phone || "",
      companyName: client.client?.companyName || "",
      googleDriveFolderId: client.client?.googleDriveFolderId || "",
      googleDriveFolderName: client.client?.googleDriveFolderName || "",
      status: client.status,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Salvar cliente
  const handleSave = async () => {
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (editingClient) {
        // Atualizar
        await adminApi.updateClient(editingClient.id, {
          name: formData.name,
          phone: formData.phone || undefined,
          companyName: formData.companyName || undefined,
          googleDriveFolderId: formData.googleDriveFolderId || undefined,
          googleDriveFolderName: formData.googleDriveFolderName || undefined,
          status: formData.status,
        });
      } else {
        // Criar
        if (!formData.password) {
          setFormError("Senha é obrigatória para novos clientes");
          setIsSubmitting(false);
          return;
        }
        await adminApi.createClient({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone || undefined,
          companyName: formData.companyName || undefined,
          googleDriveFolderId: formData.googleDriveFolderId,
          googleDriveFolderName: formData.googleDriveFolderName || undefined,
          status: formData.status,
        });
      }

      setIsModalOpen(false);
      loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao salvar";
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Alterar status
  const toggleStatus = async (client: ClientWithDetails) => {
    const newStatus = client.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await adminApi.updateClientStatus(client.id, newStatus);
      loadData();
    } catch (error) {
      console.error("Erro ao alterar status:", error);
    }
  };

  // Deletar cliente
  const deleteClient = async (client: ClientWithDetails) => {
    if (!confirm(`Tem certeza que deseja remover ${client.name}?`)) return;

    try {
      await adminApi.deleteClient(client.id);
      loadData();
    } catch (error) {
      console.error("Erro ao remover cliente:", error);
    }
  };

  // Handler de logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (authLoading) {
    return (
      <main className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">
                Painel Administrativo
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie os clientes e suas pastas do Google Drive
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="brass" onClick={openCreateModal} className="gap-2">
                <Plus size={16} />
                Novo Cliente
              </Button>
              <Button variant="outline" onClick={handleLogout} className="gap-2">
                <LogOut size={16} />
                Sair
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.totalClients}</p>
                      <p className="text-sm text-muted-foreground">Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.activeClients}</p>
                      <p className="text-sm text-muted-foreground">Ativos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-500/10">
                      <Clock className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.pendingClients}</p>
                      <p className="text-sm text-muted-foreground">Pendentes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <BarChart3 className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.recentAccessCount}</p>
                      <p className="text-sm text-muted-foreground">Acessos (7d)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Clients Card */}
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="border-b border-border/50">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Clientes</CardTitle>
                  <CardDescription>
                    {filteredClients.length} cliente(s) encontrado(s)
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar..."
                      className="pl-9 w-[200px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="ACTIVE">Ativos</SelectItem>
                      <SelectItem value="INACTIVE">Inativos</SelectItem>
                      <SelectItem value="PENDING">Pendentes</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={loadData}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum cliente encontrado</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground truncate">
                            {client.name}
                          </p>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              client.status === "ACTIVE"
                                ? "bg-green-500/10 text-green-600"
                                : client.status === "PENDING"
                                ? "bg-yellow-500/10 text-yellow-600"
                                : "bg-red-500/10 text-red-600"
                            }`}
                          >
                            {client.status === "ACTIVE"
                              ? "Ativo"
                              : client.status === "PENDING"
                              ? "Pendente"
                              : "Inativo"}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {client.email}
                          {client.client?.companyName && ` • ${client.client.companyName}`}
                        </p>
                        {client.client?.googleDriveFolderName && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <FolderOpen size={12} />
                            {client.client.googleDriveFolderName}
                          </p>
                        )}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditModal(client)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleStatus(client)}>
                            {client.status === "ACTIVE" ? (
                              <>
                                <PowerOff className="h-4 w-4 mr-2" />
                                Desativar
                              </>
                            ) : (
                              <>
                                <Power className="h-4 w-4 mr-2" />
                                Ativar
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => deleteClient(client)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Modal de Criar/Editar */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
            <DialogDescription>
              {editingClient
                ? "Atualize os dados do cliente"
                : "Preencha os dados para criar um novo cliente"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {formError && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {formError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
                disabled={!!editingClient}
              />
            </div>

            {!editingClient && (
              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "ACTIVE" | "INACTIVE" | "PENDING") =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Ativo</SelectItem>
                    <SelectItem value="INACTIVE">Inativo</SelectItem>
                    <SelectItem value="PENDING">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Empresa</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Nome da empresa (opcional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="googleDriveFolderId">ID da Pasta do Google Drive *</Label>
              <Input
                id="googleDriveFolderId"
                value={formData.googleDriveFolderId}
                onChange={(e) =>
                  setFormData({ ...formData, googleDriveFolderId: e.target.value })
                }
                placeholder="ID da pasta no Google Drive"
              />
              <p className="text-xs text-muted-foreground">
                Encontre o ID na URL da pasta: drive.google.com/drive/folders/[ID]
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="googleDriveFolderName">Nome da Pasta (exibição)</Label>
              <Input
                id="googleDriveFolderName"
                value={formData.googleDriveFolderName}
                onChange={(e) =>
                  setFormData({ ...formData, googleDriveFolderName: e.target.value })
                }
                placeholder="Ex: Projeto XYZ"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="brass" onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : editingClient ? (
                "Salvar"
              ) : (
                "Criar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Admin;
