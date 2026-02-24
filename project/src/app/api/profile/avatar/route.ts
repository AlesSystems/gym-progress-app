import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { put } from "@vercel/blob";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateApiResponse } from "@/lib/utils";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, {
        code: "UNAUTHORIZED",
        message: "Not authenticated.",
      }),
      { status: 401 }
    );
  }

  const userId = (session.user as { id: string }).id;

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, {
        code: "INVALID_FORM",
        message: "Invalid form data.",
      }),
      { status: 400 }
    );
  }

  const file = formData.get("avatar");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, {
        code: "MISSING_FILE",
        message: "No file uploaded.",
      }),
      { status: 400 }
    );
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, {
        code: "INVALID_TYPE",
        message: "Only JPEG, PNG, WebP, and GIF images are allowed.",
      }),
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, {
        code: "FILE_TOO_LARGE",
        message: "Image must be 10 MB or smaller.",
      }),
      { status: 400 }
    );
  }

  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const filename = `avatars/${userId}.${ext}`;

  const blob = await put(filename, file, { access: "public", allowOverwrite: true });

  await db.user.update({
    where: { id: userId },
    data: { image: blob.url },
  });

  return NextResponse.json(generateApiResponse(true, { image: blob.url }, "Avatar updated."));
}
