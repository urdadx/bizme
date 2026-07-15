import nodemailer from "nodemailer";

import { env } from "@better-comments/env/server";

type WorkspaceInvitationEmail = {
  email: string;
  invitedByEmail: string;
  invitedByUsername: string;
  inviteLink: string;
  workspaceName: string;
};

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: env.GOOGLE_EMAIL,
    pass: env.GOOGLE_APP_PASSWORD,
  },
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 15_000,
});

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export async function sendWorkspaceInvitationEmail({
  email,
  invitedByEmail,
  invitedByUsername,
  inviteLink,
  workspaceName,
}: WorkspaceInvitationEmail) {
  const safeInvitedByEmail = escapeHtml(invitedByEmail);
  const safeInvitedByUsername = escapeHtml(invitedByUsername);
  const safeInviteLink = escapeHtml(inviteLink);
  const safeWorkspaceName = escapeHtml(workspaceName);

  await transporter.sendMail({
    from: `Bizme <${env.GOOGLE_EMAIL}>`,
    to: email,
    subject: `You're invited to ${workspaceName} on Bizme`,
    text: [
      `${invitedByUsername} (${invitedByEmail}) invited you to join ${workspaceName} on Bizme.`,
      "",
      `Accept the invitation: ${inviteLink}`,
      "",
      "If you were not expecting this invitation, you can ignore this email.",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <p>${safeInvitedByUsername} (${safeInvitedByEmail}) invited you to join <strong>${safeWorkspaceName}</strong> on Bizme.</p>
        <p>
          <a href="${safeInviteLink}" style="display: inline-block; border-radius: 8px; background: #111827; color: #ffffff; padding: 10px 16px; text-decoration: none;">
            Accept invitation
          </a>
        </p>
        <p style="color: #6b7280; font-size: 13px;">If you were not expecting this invitation, you can ignore this email.</p>
      </div>
    `,
  });
}
