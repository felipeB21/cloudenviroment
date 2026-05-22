"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

type AuthProvider = "google" | "github";

export function SignIn() {
  const handleSignIn = async (provider: AuthProvider) => {
    try {
      await authClient.signIn.social({
        provider: provider,

        callbackURL: "/",
      });
    } catch (error) {
      console.error("Error al iniciar sesión con:", provider, error);
    }
  };
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button size={"lg"} className="w-30">
            Sign In
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="flex flex-col items-center justify-center gap-2">
              <DialogTitle>Sign in</DialogTitle>
              <DialogDescription className="text-center mb-2">
                Continie with one of the following providers to continue.
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Button
              size={"lg"}
              variant={"secondary"}
              onClick={() => handleSignIn("github")}
            >
              Continue with GitHub
            </Button>
            <Button
              size={"lg"}
              variant={"outline"}
              onClick={() => handleSignIn("google")}
            >
              Continue with Google
            </Button>
          </div>
        </DialogContent>
      </form>
    </Dialog>
  );
}
