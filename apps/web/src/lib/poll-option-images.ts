import { env } from "@better-comments/env/web";

export async function uploadPollOptionImage(optionId: string, image: File) {
 const formData = new FormData();
 formData.set("optionId", optionId);
 formData.set("image", image);

 const response = await fetch(`${env.VITE_SERVER_URL}/poll-option-images`, {
  method: "POST",
  body: formData,
  credentials: "include",
 });

 if (!response.ok) {
  const payload = await response.json().catch(() => null);
  throw new Error(payload?.error?.message ?? "Unable to upload poll image.");
 }
}
