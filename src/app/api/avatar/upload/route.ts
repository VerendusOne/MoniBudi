import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { auth } from "@/auth";
import { ALLOWED_AVATAR_TYPES, MAX_AVATAR_BYTES } from "@/lib/avatar";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HandleUploadBody;
    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname) => {
        const session = await auth();
        if (!session?.user?.id || !pathname.startsWith(`avatars/${session.user.id}/`) || pathname.slice(`avatars/${session.user.id}/`.length).includes("/")) {
          throw new Error("Unauthorized upload");
        }
        return {
          allowedContentTypes: ALLOWED_AVATAR_TYPES,
          maximumSizeInBytes: MAX_AVATAR_BYTES,
          addRandomSuffix: false,
        };
      },
      onUploadCompleted: async () => {},
    });
    return Response.json(result);
  } catch {
    return Response.json({ error: "Unable to upload photo." }, { status: 400 });
  }
}
