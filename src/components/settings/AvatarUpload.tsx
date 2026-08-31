"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { useConfirm } from "@/components/ConfirmDialog";
import { updateAvatar, removeAvatar } from "@/lib/actions/account";

export function AvatarUpload({
  avatarUrl,
  name,
  email,
}: {
  avatarUrl: string | null;
  name: string | null;
  email: string | null;
}) {
  const router = useRouter();
  const confirmDialog = useConfirm();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setPending(true);

    const formData = new FormData();
    formData.set("avatar", file);
    try {
      const result = await updateAvatar(formData);
      if (result?.error) {
        setError(result.error);
        setPreview(null);
      } else {
        router.refresh();
      }
    } finally {
      setPending(false);
      URL.revokeObjectURL(objectUrl);
    }
  }

  async function handleRemove() {
    const ok = await confirmDialog({
      title: "Remove profile photo?",
      description: "You can always upload a new one later.",
      confirmLabel: "Remove",
      destructive: true,
    });
    if (!ok) return;
    setPending(true);
    try {
      await removeAvatar();
      setPreview(null);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar src={preview ?? avatarUrl} name={name} email={email} size={64} />
        {pending && (
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
            className="text-sm font-medium text-accent rounded-md px-1 py-0.5 transition-[opacity,transform] duration-150 ease-[var(--ease-out)] hover:opacity-80 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none"
          >
            {avatarUrl || preview ? "Change photo" : "Upload photo"}
          </button>
          {(avatarUrl || preview) && (
            <button
              type="button"
              disabled={pending}
              onClick={handleRemove}
              className="text-sm text-muted-foreground rounded-md px-1 py-0.5 transition-[color,transform] duration-150 ease-[var(--ease-out)] hover:text-red-500 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none"
            >
              Remove
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">PNG, JPEG, WEBP, or GIF. Up to 5MB.</p>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleFileChange}
        className="sr-only"
      />
    </div>
  );
}
