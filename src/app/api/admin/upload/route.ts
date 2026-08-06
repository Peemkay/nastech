import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";

// Client-upload pattern: the browser uploads the file bytes directly to
// Vercel Blob storage; this route only authorizes the upload (checks admin
// session, constrains file type/size) and never sees the file itself.
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await requireAdmin();
        if (!session) throw new Error("Unauthorized");
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
          addRandomSuffix: true,
          maximumSizeInBytes: 8 * 1024 * 1024, // 8MB
        };
      },
      onUploadCompleted: async () => {
        // no-op — the resulting URL is saved onto the product by the admin form itself
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 400 });
  }
}
