import { Link } from "react-router-dom";
import { HardDrive, Link2, Loader2, CheckCircle2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDriveConnection } from "@/hooks/useDriveConnection";
import { toast } from "sonner";
import { format } from "date-fns";

export const IntegrationsSection = () => {
  const { connection, loading, connecting, connect, disconnect } = useDriveConnection();

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

  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <Link2 className="h-4 w-4 text-blue-400" />
          </div>
          Integrations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Google Drive */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <HardDrive className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">Google Drive</p>
                {loading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : connection?.connected ? (
                  <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-500 border-green-500/30">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                ) : null}
              </div>
              {connection?.connected ? (
                <p className="text-xs text-muted-foreground">
                  {connection.email}
                  {connection.connectedAt && (
                    <> · Connected {format(new Date(connection.connectedAt), "MMM d, yyyy")}</>
                  )}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Browse and attach files from your Drive
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {connection?.connected ? (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/drive">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDisconnect}
                  className="text-destructive hover:text-destructive"
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={handleConnect}
                disabled={connecting || loading}
              >
                {connecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect"
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
