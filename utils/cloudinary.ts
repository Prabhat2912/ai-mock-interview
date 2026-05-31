// Browser-safe Cloudinary unsigned upload.
// Requires an unsigned upload preset created in your Cloudinary dashboard.
export async function uploadVideoToCloudinary(blob: Blob): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary env vars are not configured");
  }

  const form = new FormData();
  form.append("file", blob);
  form.append("upload_preset", uploadPreset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
    { method: "POST", body: form }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary upload failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as { secure_url?: string; url?: string };
  const url = data.secure_url || data.url;
  if (!url) throw new Error("Cloudinary response did not include a URL");
  return url;
}
