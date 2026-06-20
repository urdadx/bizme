import { env } from "@better-comments/env/web";

export async function uploadCommentImages(commentId: string, images: File[]) {
	if (images.length === 0) {
		return;
	}

	const formData = new FormData();
	formData.set("commentId", commentId);

	for (const image of images) {
		formData.append("images", image);
	}

	const response = await fetch(`${env.VITE_SERVER_URL}/comment-attachments`, {
		method: "POST",
		body: formData,
		credentials: "include",
	});

	if (!response.ok) {
		const payload = await response.json().catch(() => null);
		throw new Error(payload?.error?.message ?? "Unable to upload images.");
	}
}
