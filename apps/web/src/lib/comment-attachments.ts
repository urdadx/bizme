export type UploadedCommentAttachment = {
	id: string;
	url: string;
	filename: string;
	mimeType: string;
	size: number;
};

export async function uploadCommentImages(
	commentId: string,
	images: File[],
	options: { visitorId?: string; baseUrl: string },
) {
	if (images.length === 0) {
		return [];
	}

	const baseUrl = options.baseUrl.replace(/\/$/, "");

	const formData = new FormData();
	formData.set("commentId", commentId);

	for (const image of images) {
		formData.append("images", image);
	}

	const response = await fetch(`${baseUrl}/comment-attachments`, {
		method: "POST",
		body: formData,
		credentials: "include",
		headers: options.visitorId ? { "X-Bizme-Visitor-Id": options.visitorId } : undefined,
	});

	if (!response.ok) {
		const payload = await response.json().catch(() => null);
		throw new Error(payload?.error?.message ?? "Unable to upload images.");
	}

	const payload = await response.json().catch(() => null);
	return (payload?.attachments ?? []) as UploadedCommentAttachment[];
}