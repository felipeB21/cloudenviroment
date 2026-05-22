import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div>
      <section className="text-center max-w-4xl mx-auto px-4">
        <h1>
          Your environment variables, secured in {""}
          <span className="text-primary">CloudEnvironment</span>
        </h1>
        <p className="mt-6 text-muted-foreground">
          Sync and manage your <span className="font-bold">.env</span> files
          across all your projects with end-to-end encryption.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button size={"lg"} className="p-5 w-42">
            Start for free
          </Button>
        </div>
      </section>
    </div>
  );
}
