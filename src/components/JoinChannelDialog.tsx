import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter } from
"@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export const JoinChannelDialog = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Show popup on every page load/refresh with a small delay
    const timer = setTimeout(() => setOpen(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setOpen(false);
  };

  const handleJoin = () => {
    window.open("https://eduforfree.vercel.app/", "_blank");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-xl">GET FREE STUDY RESOURCES</DialogTitle>
          <DialogDescription className="text-center">
            Education is,was,will be freed completely!
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col items-center justify-center gap-[5px] flex sm:flex-row">
          <Button
            onClick={handleJoin}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">

            
            Let's Go!
          </Button>
          <Button
            variant="ghost"
            onClick={handleDismiss}
            className="w-full text-muted-foreground text-center">

            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);

};
