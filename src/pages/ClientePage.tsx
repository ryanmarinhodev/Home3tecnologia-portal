import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  Folder,
  Download,
  ExternalLink,
  ChevronRight,
  Home,
  LogOut,
  RefreshCw,
  FileImage,
  FileVideo,
  FileSpreadsheet,
  File,
  Images,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { filesApi, DriveFile, DriveFolder } from "@/lib/api";

// Helper para formatar tamanho de arquivo
function formatFileSize(bytes?: string): string {
  if (!bytes) return "";
  const size = parseInt(bytes, 10);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

// Helper para formatar data
function formatDate(dateString?: string): string {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Ícone baseado no tipo de arquivo
function getFileIcon(mimeType: string) {
  if (mimeType.includes("folder")) return Folder;
  if (mimeType.includes("image")) return FileImage;
  if (mimeType.includes("video")) return FileVideo;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return FileSpreadsheet;
  if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("text"))
    return FileText;
  return File;
}

function isImageFile(file: DriveFile) {
  return file.mimeType.startsWith("image/");
}

function canPreviewInline(file: DriveFile) {
  return isImageFile(file) && !file.mimeType.includes("heif") && !file.mimeType.includes("heic");
}

function getOptimizedThumbnailUrl(file: DriveFile, size = 1400) {
  if (!file.thumbnailLink) {
    return undefined;
  }

  if (!file.thumbnailLink.includes("googleusercontent.com")) {
    return file.thumbnailLink;
  }

  if (file.thumbnailLink.includes("=")) {
    return file.thumbnailLink.replace(/=s\d+/, `=s${size}`);
  }

  return `${file.thumbnailLink}=s${size}`;
}

const ClientePage = () => {
  const { user, client, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [files, setFiles] = useState<DriveFile[]>([]);
  const [subfolders, setSubfolders] = useState<DriveFolder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<DriveFolder | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<DriveFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<DriveFile | null>(null);

  // Redirecionar se não autenticado ou se for admin
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
    if (user?.role === "ADMIN") {
      navigate("/admin");
    }
  }, [user, authLoading, navigate]);

  // Carregar arquivos
  const loadFiles = async (folderId?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = folderId
        ? await filesApi.listFolder(folderId)
        : await filesApi.list();

      setFiles(data.files);
      setSubfolders(data.subfolders);
      
      if (!folderId) {
        // Pasta raiz
        setCurrentFolder(data.folder);
        setBreadcrumbs([]);
      } else {
        setCurrentFolder(data.folder);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar arquivos";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar arquivos iniciais
  useEffect(() => {
    if (user && user.role === "CLIENT") {
      loadFiles();
    }
  }, [user]);

  // Navegar para subpasta
  const navigateToFolder = (folder: DriveFolder) => {
    setBreadcrumbs((prev) => [...prev, currentFolder!]);
    loadFiles(folder.id);
  };

  // Voltar para pasta anterior
  const navigateBack = (index?: number) => {
    if (index === undefined) {
      // Voltar para raiz
      setBreadcrumbs([]);
      loadFiles();
    } else {
      // Voltar para pasta específica do breadcrumb
      const targetFolder = breadcrumbs[index];
      setBreadcrumbs((prev) => prev.slice(0, index));
      if (index === 0) {
        loadFiles();
      } else {
        loadFiles(targetFolder.id);
      }
    }
  };

  // Abrir arquivo
  const openFile = (file: DriveFile) => {
    if (file.webViewLink) {
      window.open(file.webViewLink, "_blank");
    }
  };

  // Download de arquivo
  const downloadFile = async (file: DriveFile) => {
    const token = localStorage.getItem("auth_token");
    const url = filesApi.getDownloadUrl(file.id);

    // Fazer download via fetch para incluir token
    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Erro ao baixar arquivo");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Erro ao baixar:", err);
    }
  };

  // Handler de logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const imageFiles = files.filter(isImageFile);
  const otherFiles = files.filter((file) => !isImageFile(file));
  const featuredImage = imageFiles.find(canPreviewInline) || imageFiles[0] || null;

  if (authLoading) {
    return (
      <main className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header do Dashboard */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">
                Olá, {user?.name?.split(" ")[0]}!
              </h1>
              <p className="text-muted-foreground mt-1">
                {client?.companyName || "Bem-vindo ao seu portal de arquivos"}
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut size={16} />
              Sair
            </Button>
          </div>

          {/* Card principal */}
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Seus Arquivos</CardTitle>
                  <CardDescription>
                    {client?.googleDriveFolderName || "Pasta do projeto"}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => loadFiles(currentFolder?.id)}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
              </div>

              {/* Breadcrumbs */}
              {breadcrumbs.length > 0 && (
                <div className="flex items-center gap-1 mt-4 text-sm">
                  <button
                    onClick={() => navigateBack()}
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <Home size={14} />
                    Início
                  </button>
                  {breadcrumbs.map((folder, index) => (
                    <span key={folder.id} className="flex items-center gap-1">
                      <ChevronRight size={14} className="text-muted-foreground" />
                      <button
                        onClick={() => navigateBack(index + 1)}
                        className="text-primary hover:underline"
                      >
                        {folder.name}
                      </button>
                    </span>
                  ))}
                  <ChevronRight size={14} className="text-muted-foreground" />
                  <span className="text-foreground font-medium">{currentFolder?.name}</span>
                </div>
              )}
            </CardHeader>

            <CardContent className="p-6">
              {/* Estado de erro */}
              {error && (
                <div className="text-center py-8">
                  <p className="text-destructive mb-4">{error}</p>
                  <Button variant="outline" onClick={() => loadFiles()}>
                    Tentar novamente
                  </Button>
                </div>
              )}

              {/* Estado de loading */}
              {isLoading && !error && (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}

              {/* Lista de arquivos */}
              {!isLoading && !error && (
                <div className="space-y-6">
                  <section className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
                    <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-primary/10 via-background to-background p-6">
                      <div className="relative z-10 flex h-full flex-col justify-between gap-6">
                        <div className="space-y-4">
                          <Badge variant="outline" className="w-fit border-primary/20 bg-primary/10 text-primary">
                            Portal do cliente
                          </Badge>
                          <div className="space-y-2">
                            <h2 className="max-w-xl text-2xl font-semibold tracking-tight text-foreground">
                              Seu projeto centralizado dentro do portal
                            </h2>
                            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                              Consulte imagens, navegue por pastas e baixe entregas sem sair da Home3. O Google Drive
                              continua como apoio, não como experiência principal.
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm">
                          <div className="rounded-2xl border border-border/50 bg-background/80 px-4 py-3 backdrop-blur">
                            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Imagens</p>
                            <p className="mt-1 text-2xl font-semibold text-foreground">{imageFiles.length}</p>
                          </div>
                          <div className="rounded-2xl border border-border/50 bg-background/80 px-4 py-3 backdrop-blur">
                            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Arquivos</p>
                            <p className="mt-1 text-2xl font-semibold text-foreground">{otherFiles.length}</p>
                          </div>
                          <div className="rounded-2xl border border-border/50 bg-background/80 px-4 py-3 backdrop-blur">
                            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Pastas</p>
                            <p className="mt-1 text-2xl font-semibold text-foreground">{subfolders.length}</p>
                          </div>
                        </div>
                      </div>
                      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-border/50 bg-card shadow-sm">
                      <div className="border-b border-border/50 px-5 py-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Destaque visual</p>
                        <h3 className="mt-2 text-lg font-semibold text-foreground">
                          {featuredImage ? featuredImage.name : "Adicione imagens para visualizar aqui"}
                        </h3>
                      </div>
                      <div className="bg-muted/60">
                        {featuredImage?.thumbnailLink ? (
                          <button
                            type="button"
                            className="block w-full"
                            onClick={() => (canPreviewInline(featuredImage) ? setSelectedImage(featuredImage) : openFile(featuredImage))}
                          >
                            <div className="flex aspect-[4/3] items-center justify-center bg-[radial-gradient(circle_at_top,_hsl(var(--background)),_hsl(var(--muted)))] p-3">
                              <img
                                src={getOptimizedThumbnailUrl(featuredImage, 1800)}
                                alt={featuredImage.name}
                                className="h-full w-full rounded-2xl object-contain"
                                loading="eager"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          </button>
                        ) : (
                          <div className="flex aspect-[4/3] items-center justify-center">
                            <FileImage className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-3 px-5 py-4 text-sm text-muted-foreground">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{client?.googleDriveFolderName || currentFolder?.name || "Projeto"}</p>
                          <p>{featuredImage?.modifiedTime ? `Atualizado em ${formatDate(featuredImage.modifiedTime)}` : "Sem imagem destacada"}</p>
                        </div>
                        {featuredImage && (
                          <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => (canPreviewInline(featuredImage) ? setSelectedImage(featuredImage) : openFile(featuredImage))}
                          >
                            <Eye className="h-4 w-4" />
                            Visualizar
                          </Button>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Subpastas */}
                  {subfolders.length > 0 && (
                    <section className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Pastas do projeto
                          </h2>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Navegue pelas áreas separadas deste cliente sem sair do portal.
                          </p>
                        </div>
                        <Badge variant="secondary">{subfolders.length} pasta(s)</Badge>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        {subfolders.map((folder) => (
                          <motion.div
                            key={folder.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-4 rounded-2xl border border-border/50 bg-card p-4 transition-colors hover:bg-muted/50 cursor-pointer group"
                            onClick={() => navigateToFolder(folder)}
                          >
                            <div className="rounded-2xl bg-primary/10 p-3">
                              <Folder className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="truncate font-medium text-foreground">{folder.name}</p>
                              <p className="text-sm text-muted-foreground">Abrir pasta</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                          </motion.div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Galeria de imagens */}
                  {imageFiles.length > 0 && (
                    <section className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Images className="h-5 w-5 text-primary" />
                          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Galeria
                          </h2>
                        </div>
                        <Badge variant="secondary">{imageFiles.length} imagem(ns)</Badge>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {imageFiles.map((file) => {
                          const showInlinePreview = canPreviewInline(file);

                          return (
                            <motion.article
                              key={file.id}
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm"
                            >
                              <button
                                type="button"
                                className="block w-full text-left"
                                onClick={() => (showInlinePreview ? setSelectedImage(file) : openFile(file))}
                              >
                                <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(244,244,245,0.95))] p-3">
                                  {file.thumbnailLink ? (
                                    <img
                                      src={getOptimizedThumbnailUrl(file, 1200)}
                                      alt={file.name}
                                      className="h-full w-full rounded-xl object-contain"
                                      loading="lazy"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border/70 bg-background/70">
                                      <FileImage className="h-10 w-10 text-muted-foreground" />
                                    </div>
                                  )}
                                  {!showInlinePreview && (
                                    <div className="absolute right-5 top-5 rounded-full bg-black/75 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white">
                                      Externo
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-2 p-4">
                                  <p className="truncate font-medium text-foreground">{file.name}</p>
                                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                    {showInlinePreview ? "Preview interno" : "Abertura externa recomendada"}
                                  </p>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    {file.size && <span>{formatFileSize(file.size)}</span>}
                                    {file.modifiedTime && (
                                      <>
                                        {file.size && <span>•</span>}
                                        <span>{formatDate(file.modifiedTime)}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </button>
                              <div className="flex items-center justify-end gap-2 border-t border-border/50 px-4 py-3">
                                {file.webViewLink && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openFile(file)}
                                    className="gap-2"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                    Drive
                                  </Button>
                                )}
                                <Button
                                  variant={showInlinePreview ? "default" : "ghost"}
                                  size="sm"
                                  onClick={() => (showInlinePreview ? setSelectedImage(file) : downloadFile(file))}
                                  className="gap-2"
                                >
                                  {showInlinePreview ? <Eye className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                                  {showInlinePreview ? "Ver no portal" : "Baixar"}
                                </Button>
                                {showInlinePreview && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => downloadFile(file)}
                                    className="gap-2"
                                  >
                                    <Download className="h-4 w-4" />
                                    Baixar
                                  </Button>
                                )}
                              </div>
                            </motion.article>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  {/* Arquivos */}
                  {otherFiles.length > 0 && (
                    <section className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Arquivos e documentos
                          </h2>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Documentos, PDFs, planilhas e outros materiais complementares.
                          </p>
                        </div>
                        <Badge variant="secondary">{otherFiles.length} arquivo(s)</Badge>
                      </div>
                      {otherFiles.map((file) => {
                        const FileIcon = getFileIcon(file.mimeType);
                        const isGoogleDoc = file.mimeType.includes("google-apps");

                        return (
                          <motion.div
                            key={file.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-4 rounded-2xl border border-border/50 bg-card p-4 transition-colors hover:bg-muted/50"
                          >
                            <div className="rounded-2xl bg-muted p-3">
                              <FileIcon className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">{file.name}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {file.size && <span>{formatFileSize(file.size)}</span>}
                                {file.modifiedTime && (
                                  <>
                                    {file.size && <span>•</span>}
                                    <span>{formatDate(file.modifiedTime)}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {file.webViewLink && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openFile(file)}
                                  className="gap-2"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  Abrir
                                </Button>
                              )}
                              {!isGoogleDoc && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => downloadFile(file)}
                                  className="gap-2"
                                >
                                  <Download className="h-4 w-4" />
                                  Baixar
                                </Button>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </section>
                  )}

                  {/* Vazio */}
                  {files.length === 0 && subfolders.length === 0 && (
                    <div className="text-center py-12">
                      <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Esta pasta está vazia</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
            <DialogContent className="max-w-4xl border-border/60 bg-background/95 p-0 backdrop-blur">
              {selectedImage && (
                <>
                  <DialogHeader className="px-6 pt-6">
                    <DialogTitle className="pr-8">{selectedImage.name}</DialogTitle>
                    <DialogDescription>
                      {selectedImage.modifiedTime
                        ? `Atualizado em ${formatDate(selectedImage.modifiedTime)}`
                        : "Visualização da imagem"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="px-6 pb-6">
                    <div className="overflow-hidden rounded-2xl border border-border/50 bg-[radial-gradient(circle_at_top,_hsl(var(--background)),_hsl(var(--muted)))] p-3">
                      {selectedImage.thumbnailLink ? (
                        <img
                          src={getOptimizedThumbnailUrl(selectedImage, 1800)}
                          alt={selectedImage.name}
                          className="max-h-[72vh] w-full rounded-xl object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="flex min-h-[360px] items-center justify-center">
                          <FileImage className="h-14 w-14 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        {selectedImage.size && <span>{formatFileSize(selectedImage.size)}</span>}
                        {selectedImage.size && selectedImage.modifiedTime && <span>•</span>}
                        {selectedImage.modifiedTime && <span>{formatDate(selectedImage.modifiedTime)}</span>}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedImage.webViewLink && (
                          <Button variant="outline" onClick={() => openFile(selectedImage)} className="gap-2">
                            <ExternalLink className="h-4 w-4" />
                            Abrir no Drive
                          </Button>
                        )}
                        <Button onClick={() => downloadFile(selectedImage)} className="gap-2">
                          <Download className="h-4 w-4" />
                          Baixar arquivo
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    </main>
  );
};

export default ClientePage;
