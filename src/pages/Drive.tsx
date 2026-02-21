import { useState, useEffect } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { useDriveConnection, useDriveFiles, DriveFile } from "@/hooks/useDriveConnection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  HardDrive,
  Folder,
  File,
  FileText,
  Image,
  Video,
  Presentation,
  Search,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Link2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const FILE_TYPE_FILTERS = [
  { value: "all", label: "All Files" },
  { value: "folder", label: "Folders" },
  { value: "pdf", label: "PDF" },
  { value: "document", label: "Documents" },
  { value: "presentation", label: "Presentations" },
  { value: "image", label: "Images" },
  { value: "video", label: "Videos" },
];

function getFileIcon(mimeType: string) {
  if (mimeType === "application/vnd.google-apps.folder") {
    return <Folder className="h-5 w-5 text-yellow-500" />;
  }
  if (mimeType.includes("pdf")) {
    return <FileText className="h-5 w-5 text-red-500" />;
  }
  if (mimeType.includes("image")) {
    return <Image className="h-5 w-5 text-blue-500" />;
  }
  if (mimeType.includes("video")) {
    return <Video className="h-5 w-5 text-purple-500" />;
  }
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) {
    return <Presentation className="h-5 w-5 text-orange-500" />;
  }
  if (mimeType.includes("document") || mimeType.includes("word")) {
    return <FileText className="h-5 w-5 text-blue-600" />;
  }
  return <File className="h-5 w-5 text-muted-foreground" />;
}

function formatFileSize(bytes?: string) {
  if (!bytes) return "";
  const size = parseInt(bytes, 10);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

interface BreadcrumbItem {
  id: string;
  name: string;
}

export default function Drive() {
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const {
    connection,
    loading: connectionLoading,
    connecting,
    connect,
    disconnect,
    handleCallback,
  } = useDriveConnection();

  const [currentFolderId, setCurrentFolderId] = useState("root");
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ id: "root", name: "My Drive" }]);
  const [searchQuery, setSearchQuery] = useState("");
  const [fileTypeFilter, setFileTypeFilter] = useState("all");
  const [selectedFiles, setSelectedFiles] = useState<DriveFile[]>([]);
  const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);
  const [isSearchMode, setIsSearchMode] = useState(false);

  const { files, loading: filesLoading, error, hasMore, fetchFiles, search, loadMore } = useDriveFiles(currentFolderId);

  // Handle OAuth callback
  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      toast.error("Failed to connect to Google Drive");
      window.history.replaceState({}, "", "/drive");
      return;
    }

    if (code && state) {
      handleCallback(code, state)
        .then(() => {
          toast.success("Successfully connected to Google Drive!");
          window.history.replaceState({}, "", "/drive");
        })
        .catch(() => {
          toast.error("Failed to complete connection");
          window.history.replaceState({}, "", "/drive");
        });
    }
  }, [searchParams, handleCallback]);

  // Fetch files when folder changes
  useEffect(() => {
    if (connection?.connected && !isSearchMode) {
      fetchFiles({ mimeType: fileTypeFilter !== "all" ? fileTypeFilter : undefined });
    }
  }, [connection?.connected, currentFolderId, fileTypeFilter, fetchFiles, isSearchMode]);

  if (authLoading || connectionLoading) {
    return (
      <AppLayout title="Drive">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleConnect = async () => {
    try {
      await connect();
    } catch {
      toast.error("Failed to start connection");
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast.success("Disconnected from Google Drive");
    } catch {
      toast.error("Failed to disconnect");
    }
  };

  const handleFolderClick = (file: DriveFile) => {
    if (file.mimeType === "application/vnd.google-apps.folder") {
      setCurrentFolderId(file.id);
      setBreadcrumbs((prev) => [...prev, { id: file.id, name: file.name }]);
      setIsSearchMode(false);
      setSearchQuery("");
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentFolderId(newBreadcrumbs[newBreadcrumbs.length - 1].id);
    setIsSearchMode(false);
    setSearchQuery("");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchMode(true);
      search(searchQuery.trim(), fileTypeFilter !== "all" ? fileTypeFilter : undefined);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearchMode(false);
    fetchFiles({ mimeType: fileTypeFilter !== "all" ? fileTypeFilter : undefined });
  };

  const toggleFileSelection = (file: DriveFile) => {
    setSelectedFiles((prev) => {
      const isSelected = prev.some((f) => f.id === file.id);
      if (isSelected) {
        return prev.filter((f) => f.id !== file.id);
      }
      return [...prev, file];
    });
  };

  const handleSelectFiles = () => {
    if (selectedFiles.length === 0) {
      toast.error("No files selected");
      return;
    }

    const metadata = selectedFiles.map((file) => ({
      name: file.name,
      type: file.mimeType,
      size: file.size,
      driveFileId: file.id,
      thumbnail: file.thumbnailLink,
      downloadLink: file.webContentLink,
      viewLink: file.webViewLink,
    }));

    console.log("Selected files metadata:", metadata);
    toast.success(`Selected ${selectedFiles.length} file(s)`);
    
    // In a real implementation, you'd pass this to a callback or context
  };

  // Not connected view
  if (!connection?.connected) {
    return (
      <AppLayout title="Drive">
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
          <Card className="border-2 border-dashed">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <HardDrive className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Connect Google Drive</CardTitle>
              <CardDescription className="text-base">
                Connect your Google Drive to browse and select files for your study materials.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Read-only access to your files
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Browse and preview files
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Select files for study resources
                </li>
              </ul>
              <Button
                size="lg"
                onClick={handleConnect}
                disabled={connecting}
                className="mt-4"
              >
                {connecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4 mr-2" />
                    Connect Google Drive
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Drive">
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <HardDrive className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Google Drive</h1>
              <p className="text-sm text-muted-foreground">
                Connected as {connection.email}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleDisconnect} size="sm">
            Disconnect
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={!searchQuery.trim()}>
              Search
            </Button>
            {isSearchMode && (
              <Button type="button" variant="outline" onClick={handleClearSearch}>
                Clear
              </Button>
            )}
          </form>
          <Select value={fileTypeFilter} onValueChange={setFileTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              {FILE_TYPE_FILTERS.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Breadcrumbs */}
        {!isSearchMode && (
          <div className="flex items-center gap-1 mb-4 text-sm overflow-x-auto">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.id} className="flex items-center">
                {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />}
                <button
                  onClick={() => handleBreadcrumbClick(index)}
                  className={`hover:text-primary transition-colors ${
                    index === breadcrumbs.length - 1
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {crumb.name}
                </button>
              </div>
            ))}
          </div>
        )}

        {isSearchMode && (
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary">
              Search results for "{searchQuery}"
            </Badge>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5 mb-4">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* File List */}
        <Card>
          <CardContent className="p-0">
            {filesLoading && files.length === 0 ? (
              <div className="divide-y">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4">
                    <Skeleton className="h-10 w-10 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-48 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <File className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No files found</p>
              </div>
            ) : (
              <div className="divide-y">
                {files.map((file) => {
                  const isFolder = file.mimeType === "application/vnd.google-apps.folder";
                  const isSelected = selectedFiles.some((f) => f.id === file.id);

                  return (
                    <div
                      key={file.id}
                      className={`flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors ${
                        isSelected ? "bg-primary/5 border-l-2 border-primary" : ""
                      }`}
                    >
                      {/* Checkbox for non-folders */}
                      {!isFolder && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleFileSelection(file)}
                          className="h-4 w-4 rounded border-muted-foreground/50"
                        />
                      )}

                      {/* Thumbnail or Icon */}
                      <div
                        className={`w-10 h-10 rounded flex items-center justify-center bg-muted/50 ${
                          isFolder ? "cursor-pointer" : ""
                        }`}
                        onClick={() => isFolder && handleFolderClick(file)}
                      >
                        {file.thumbnailLink ? (
                          <img
                            src={file.thumbnailLink}
                            alt=""
                            className="w-10 h-10 rounded object-cover"
                          />
                        ) : (
                          getFileIcon(file.mimeType)
                        )}
                      </div>

                      {/* File Info */}
                      <div
                        className={`flex-1 min-w-0 ${isFolder ? "cursor-pointer" : ""}`}
                        onClick={() => isFolder && handleFolderClick(file)}
                      >
                        <p className="font-medium truncate">{file.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {file.size && <span>{formatFileSize(file.size)}</span>}
                          {file.modifiedTime && (
                            <span>
                              Modified {format(new Date(file.modifiedTime), "MMM d, yyyy")}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {!isFolder && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setPreviewFile(file)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {file.webViewLink && (
                          <Button variant="ghost" size="icon" asChild>
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Load More */}
            {hasMore && (
              <div className="p-4 text-center border-t">
                <Button variant="outline" onClick={loadMore} disabled={filesLoading}>
                  {filesLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Files Footer */}
        {selectedFiles.length > 0 && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-card border rounded-lg shadow-lg p-4 flex items-center gap-4 z-50">
            <span className="text-sm">
              {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""} selected
            </span>
            <Button size="sm" variant="outline" onClick={() => setSelectedFiles([])}>
              Clear
            </Button>
            <Button size="sm" onClick={handleSelectFiles}>
              Select Files
            </Button>
          </div>
        )}

        {/* Preview Dialog */}
        <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {previewFile && getFileIcon(previewFile.mimeType)}
                {previewFile?.name}
              </DialogTitle>
              <DialogDescription>
                {previewFile?.size && formatFileSize(previewFile.size)}
                {previewFile?.modifiedTime &&
                  ` • Modified ${format(new Date(previewFile.modifiedTime), "MMM d, yyyy")}`}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              {previewFile?.thumbnailLink ? (
                <img
                  src={previewFile.thumbnailLink.replace("=s220", "=s800")}
                  alt={previewFile.name}
                  className="w-full h-auto max-h-[60vh] object-contain rounded"
                />
              ) : (
                <div className="h-48 bg-muted/50 rounded flex items-center justify-center">
                  {previewFile && getFileIcon(previewFile.mimeType)}
                  <span className="ml-2 text-muted-foreground">Preview not available</span>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              {previewFile?.webViewLink && (
                <Button variant="outline" asChild>
                  <a
                    href={previewFile.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in Drive
                  </a>
                </Button>
              )}
              <Button onClick={() => previewFile && toggleFileSelection(previewFile)}>
                {selectedFiles.some((f) => f.id === previewFile?.id) ? "Deselect" : "Select"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </AppLayout>
  );
}
