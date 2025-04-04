import { useCallback, memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { signInWithGoogle } from "@/lib/supabase/auth";

interface SignInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
}

export const SignInModal = memo(({ open, onOpenChange, isLoading }: SignInModalProps) => {
  const handleSignIn = useCallback(async () => {
    try {
      await signInWithGoogle();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? `Failed to sign in: ${error.message}` : "Failed to sign in with Google");
    }
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign In Required</DialogTitle>
          <DialogDescription>You need to sign in to create a quiz. Please sign in with Google to continue.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSignIn} disabled={isLoading}>
            Sign In with Google
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
SignInModal.displayName = "SignInModal";