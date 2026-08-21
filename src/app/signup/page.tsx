"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const body = await res.json();
      setError(body.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (signInResult?.error) {
      setError("Account created, but sign-in failed. Try logging in.");
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
        <h1 className="text-xl font-semibold mb-2">Create your account</h1>
        <Input
          type="text"
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password (min. 8 characters)"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Creating account…" : "Sign Up"}
        </Button>
        <p className="text-sm text-muted-foreground text-center">
          Already have an account?{" "}
          <a href="/login" className="text-accent">
            Log in
          </a>
        </p>
      </form>
    </main>
  );
}
