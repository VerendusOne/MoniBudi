import Image from "next/image";
import { auth } from "@/auth";
import { Button } from "@/components/Button";
import { AmbientBackground } from "@/components/AmbientBackground";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-6 p-8 text-center">
      <AmbientBackground />
      <Image src="/logo.png" alt="MoniBudi" width={72} height={72} className="rounded-2xl" priority />
      <h1 className="text-3xl font-semibold">MoniBudi</h1>
      <p className="text-muted-foreground max-w-sm">
        Paycheck-first budgeting: hours, taxes, expenses, and savings, all in
        one place.
      </p>
      <div className="flex gap-3">
        {session ? (
          <Button as="a" href="/dashboard">
            Go to Dashboard
          </Button>
        ) : (
          <>
            <Button as="a" href="/signup">
              Get Started
            </Button>
            <Button as="a" href="/login" variant="secondary">
              Log In
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
