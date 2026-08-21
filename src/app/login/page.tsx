"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
      <Image src="/logo.png" alt="MoniBudi" width={56} height={56} className="rounded-xl" priority />
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-card border border-border/60 rounded-2xl card-shadow p-8 flex flex-col gap-4"
      >
        <h1 className="text-xl font-semibold mb-2">Log in</h1>
        <Input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Logging in…" : "Log In"}
        </Button>
        <p className="text-sm text-muted-foreground text-center">
          No account yet?{" "}
          <a href="/signup" className="text-accent">
            Sign up
          </a>
        </p>
      </form>
    </main>
  );
}
