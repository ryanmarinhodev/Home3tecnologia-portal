import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronRight,
  File,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Folder,
  Home,
  LogOut,
  RefreshCw,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { adminApi, ClientWithDetails, DriveFile, DriveFolder } from "@/lib/api";
import Seo from "@/components/Seo";

function getFileIcon(mimeType: string) {
  if (mimeType.includes("image")) return FileImage;
  if (mimeType.includes("video")) return FileVideo;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return FileSpreadsheet;
  if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("text")) {
    return FileText;
  }
  return File;
}

const AdminProjects = () => {
  const { user, logout, isLoading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [clients, setClients] = useState<ClientWithDetails[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientWithDetails | null>(null);
  const [searchClient, setSearchClient] = useState("");

  const [files, setFiles] = useState<DriveFile[]>([]);
  const [subfolders, setSubfolders] = useState<DriveFolder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<DriveFolder | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<DriveFolder[]>([]);

  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/login");
    }
  }, [authLoading, isAdmin, navigate, user]);

  const loadClients = async () => {
    setIsLoadingClients(true);
    try {
      const data = await adminApi.getClients();
      setClients(data);

      if (data.length > 0) {
        const firstActive = data.find((item) => item.status === "ACTIVE") || data[0];
        setSelectedClient(firstActive);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar clientes";
      setError(message);
    } finally {
      setIsLoadingClients(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      loadClients();
    }
  }, [user, isAdmin]);

  const loadClientRoot = async (client: ClientWithDetails) => {
    setIsLoadingFiles(true);
    setError(null);

    try {
      const data = await adminApi.getClientFiles(client.id);
      setFiles(data.files);
      setSubfolders(data.subfolders);
      setCurrentFolder(data.folder);
      setBreadcrumbs([]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar pasta do cliente";
      setError(message);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const loadClientFolder = async (folder: DriveFolder, nextBreadcrumbs: DriveFolder[]) => {
    if (!selectedClient) return;

    setIsLoadingFiles(true);
    setError(null);

    try {
      const data = await adminApi.getClientFolder(selectedClient.id, folder.id);
      setFiles(data.files);
      setSubfolders(data.subfolders);
      setCurrentFolder(data.folder);
      setBreadcrumbs(nextBreadcrumbs);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar subpasta";
      setError(message);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (!selectedClient) return;
    loadClientRoot(selectedClient);
  }, [selectedClient?.id]);

  const navigateToFolder = (folder: DriveFolder) => {
    if (!currentFolder) return;
    const nextBreadcrumbs = [...breadcrumbs, currentFolder];
    void loadClientFolder(folder, nextBreadcrumbs);
  };

  const navigateBackToRoot = () => {
    if (!selectedClient) return;
    void loadClientRoot(selectedClient);
  };

  const navigateToBreadcrumb = (targetIndex: number) => {
    const targetFolder = breadcrumbs[targetIndex];
    if (!targetFolder) return;

    const nextBreadcrumbs = breadcrumbs.slice(0, targetIndex);
    void loadClientFolder(targetFolder, nextBreadcrumbs);
  };

  const handleClientSelect = (client: ClientWithDetails) => {
    setSelectedClient(client);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const q = searchClient.toLowerCase();
      return (
        client.name.toLowerCase().includes(q) ||
        client.email.toLowerCase().includes(q) ||
        (client.client?.companyName || "").toLowerCase().includes(q)
      );
    });
  }, [clients, searchClient]);

  if (authLoading) {
    return (
      <main className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-background via-background to-muted/30">
      <Seo
        title="Projetos dos Clientes | Admin Home3"
        description="Navegador interno de projetos para equipe administrativa Home3."
        path="/admin/projetos"
        noindex
      />

      <div className="container max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="space-y-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">Sessão de Projetos</h1>
              <p className="text-muted-foreground mt-1">
                Navegue pelas pastas dos clientes para apresentações internas
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => navigate("/admin")} className="w-full sm:w-auto">
                Voltar ao Admin
              </Button>
              <Button variant="outline" onClick={handleLogout} className="gap-2 w-full sm:w-auto">
                <LogOut size={16} />
                Sair
              </Button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="border-b border-border/50 space-y-3">
                <div>
                  <CardTitle className="text-base">Clientes</CardTitle>
                  <CardDescription>Selecione para abrir os projetos</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Buscar cliente"
                    value={searchClient}
                    onChange={(e) => setSearchClient(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingClients ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="max-h-[40vh] lg:max-h-[64vh] overflow-auto divide-y divide-border/50">
                    {filteredClients.map((client) => (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => handleClientSelect(client)}
                        className={`w-full text-left p-3 transition-colors hover:bg-muted/40 ${
                          selectedClient?.id === client.id ? "bg-primary/10" : ""
                        }`}
                      >
                        <p className="font-medium text-sm text-foreground truncate">{client.name}</p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{client.email}</p>
                        {client.client?.companyName && (
                          <p className="text-xs text-muted-foreground truncate">{client.client.companyName}</p>
                        )}
                      </button>
                    ))}
                    {filteredClients.length === 0 && (
                      <p className="p-4 text-sm text-muted-foreground text-center">Nenhum cliente encontrado</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-lg">
              <CardHeader className="border-b border-border/50">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-xl">{selectedClient?.name || "Projetos"}</CardTitle>
                    <CardDescription>
                      {selectedClient?.client?.googleDriveFolderName || selectedClient?.email || "Selecione um cliente"}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => selectedClient && loadClientRoot(selectedClient)}
                    disabled={isLoadingFiles || !selectedClient}
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoadingFiles ? "animate-spin" : ""}`} />
                  </Button>
                </div>

                {currentFolder && (
                  <div className="flex flex-wrap items-center gap-1 mt-4 text-sm">
                    <button
                      type="button"
                      onClick={navigateBackToRoot}
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <Home size={14} />
                      Inicio
                    </button>
                    {breadcrumbs.map((folder, index) => (
                      <span key={folder.id} className="flex items-center gap-1">
                        <ChevronRight size={14} className="text-muted-foreground" />
                        <button
                          type="button"
                          onClick={() => navigateToBreadcrumb(index)}
                          className="text-primary hover:underline"
                        >
                          {folder.name}
                        </button>
                      </span>
                    ))}
                    <ChevronRight size={14} className="text-muted-foreground" />
                    <span className="font-medium text-foreground">{currentFolder.name}</span>
                  </div>
                )}
              </CardHeader>

              <CardContent className="p-4 md:p-6 space-y-6">
                {error && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                {isLoadingFiles && (
                  <div className="flex items-center justify-center py-10">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}

                {!isLoadingFiles && !error && (
                  <>
                    <section>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-foreground">Pastas</h3>
                        <Badge variant="outline">{subfolders.length}</Badge>
                      </div>
                      {subfolders.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhuma subpasta nesta visualizacao.</p>
                      ) : (
                        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                          {subfolders.map((folder) => (
                            <button
                              key={folder.id}
                              type="button"
                              onClick={() => navigateToFolder(folder)}
                              className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3 text-left transition hover:border-primary/40 hover:bg-primary/5"
                            >
                              <div className="rounded-lg bg-primary/10 p-2">
                                <Folder className="h-4 w-4 text-primary" />
                              </div>
                              <span className="text-sm font-medium text-foreground truncate">{folder.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </section>

                    <section>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-foreground">Arquivos</h3>
                        <Badge variant="outline">{files.length}</Badge>
                      </div>

                      {files.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhum arquivo nesta pasta.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {files.map((file) => {
                            const FileIcon = getFileIcon(file.mimeType);
                            return (
                              <button
                                key={file.id}
                                type="button"
                                onClick={() => file.webViewLink && window.open(file.webViewLink, "_blank")}
                                className="w-full rounded-xl border border-border/50 bg-card px-3 py-3 text-left transition hover:border-primary/40 hover:bg-primary/5"
                              >
                                <div className="flex items-start gap-3 min-w-0">
                                  <FileIcon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                                  <p className="text-sm text-foreground flex-1 min-w-0 whitespace-normal break-words md:whitespace-nowrap md:truncate">
                                    {file.name}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </section>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default AdminProjects;
