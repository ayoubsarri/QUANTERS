import fs from "fs";
import path from "path";
import https from "https";

const home = process.env.USERPROFILE || process.env.HOME;
const configstorePath = path.join(home, ".config", "configstore", "firebase-tools.json");
const configstore = JSON.parse(fs.readFileSync(configstorePath, "utf8"));
const token = configstore.tokens.access_token;

const postData = JSON.stringify({
  notification: {
    sendEmail: {
      resetPasswordTemplate: {
        senderLocalPart: "security",
        subject: "Reset your password — QUANTERS Platform",
        body: `<div style="max-width:580px;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;background:#030812;color:#ffffff;padding:32px;border-radius:12px;border:1px solid #1e293b;"><div style="text-align:center;margin-bottom:24px;"><h2 style="color:#38E4FF;margin:0;letter-spacing:1px;">QUANTERS</h2><p style="color:#94a3b8;font-size:13px;margin:4px 0 0;">QUANTA Scientific Club • University of Algiers 1</p></div><h3 style="color:#ffffff;font-size:18px;">Password Reset Request</h3><p style="color:#cbd5e1;line-height:1.6;">Hello,</p><p style="color:#cbd5e1;line-height:1.6;">A request was received to reset your QUANTERS account password for <strong>%EMAIL%</strong>. Click the button below to set a new secure password:</p><div style="text-align:center;margin:32px 0;"><a href="%LINK%" style="display:inline-block;background:#38E4FF;color:#030812;font-weight:700;padding:14px 28px;border-radius:8px;text-decoration:none;">Reset Password</a></div><p style="color:#94a3b8;font-size:13px;line-height:1.5;">If the button does not work, copy and paste this link into your browser:<br/><a href="%LINK%" style="color:#38E4FF;word-break:break-all;">%LINK%</a></p><hr style="border:none;border-top:1px solid #1e293b;margin:24px 0;"/><p style="color:#64748b;font-size:12px;margin:0;">If you did not request this password reset, you can safely ignore this email. Your password will remain unchanged.</p></div>`,
        bodyFormat: "HTML",
        replyTo: "quantaclubdz@gmail.com",
      },
      verifyEmailTemplate: {
        senderLocalPart: "auth",
        subject: "Verify your official email address — QUANTERS Platform",
        body: `<div style="max-width:580px;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;background:#030812;color:#ffffff;padding:32px;border-radius:12px;border:1px solid #1e293b;"><div style="text-align:center;margin-bottom:24px;"><h2 style="color:#38E4FF;margin:0;letter-spacing:1px;">QUANTERS</h2><p style="color:#94a3b8;font-size:13px;margin:4px 0 0;">QUANTA Scientific Club • University of Algiers 1</p></div><h3 style="color:#ffffff;font-size:18px;">Welcome to QUANTERS!</h3><p style="color:#cbd5e1;line-height:1.6;">Hello %DISPLAY_NAME%,</p><p style="color:#cbd5e1;line-height:1.6;">Thank you for registering on the QUANTERS platform. Please confirm your email address by clicking the verification button below:</p><div style="text-align:center;margin:32px 0;"><a href="%LINK%" style="display:inline-block;background:#38E4FF;color:#030812;font-weight:700;padding:14px 28px;border-radius:8px;text-decoration:none;">Verify Email Address</a></div><p style="color:#94a3b8;font-size:13px;line-height:1.5;">Direct verification link:<br/><a href="%LINK%" style="color:#38E4FF;word-break:break-all;">%LINK%</a></p><hr style="border:none;border-top:1px solid #1e293b;margin:24px 0;"/><p style="color:#64748b;font-size:12px;margin:0;">If you did not create an account on QUANTERS, please disregard this message.</p></div>`,
        bodyFormat: "HTML",
        replyTo: "quantaclubdz@gmail.com",
      },
      changeEmailTemplate: {
        senderLocalPart: "security",
        subject: "Security Alert: Sign-in email changed — QUANTERS Platform",
        body: `<div style="max-width:580px;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;background:#030812;color:#ffffff;padding:32px;border-radius:12px;border:1px solid #1e293b;"><div style="text-align:center;margin-bottom:24px;"><h2 style="color:#38E4FF;margin:0;letter-spacing:1px;">QUANTERS</h2><p style="color:#94a3b8;font-size:13px;margin:4px 0 0;">QUANTA Scientific Club Security</p></div><h3 style="color:#ffffff;font-size:18px;">Email Address Changed</h3><p style="color:#cbd5e1;line-height:1.6;">Hello %DISPLAY_NAME%,</p><p style="color:#cbd5e1;line-height:1.6;">The sign-in email address for your QUANTERS account was recently updated to <strong>%NEW_EMAIL%</strong>.</p><p style="color:#cbd5e1;line-height:1.6;">If you did not authorize this change, please revert it immediately using the link below:</p><div style="text-align:center;margin:32px 0;"><a href="%LINK%" style="display:inline-block;background:#ef4444;color:#ffffff;font-weight:700;padding:14px 28px;border-radius:8px;text-decoration:none;">Revert Email Change</a></div><hr style="border:none;border-top:1px solid #1e293b;margin:24px 0;"/><p style="color:#64748b;font-size:12px;margin:0;">Need assistance? Contact QUANTA administration at quantaclubdz@gmail.com.</p></div>`,
        bodyFormat: "HTML",
        replyTo: "quantaclubdz@gmail.com",
      },
      revertSecondFactorAdditionTemplate: {
        senderLocalPart: "security",
        subject: "Security Notice: 2-Step verification updated — QUANTERS Platform",
        body: `<div style="max-width:580px;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;background:#030812;color:#ffffff;padding:32px;border-radius:12px;border:1px solid #1e293b;"><div style="text-align:center;margin-bottom:24px;"><h2 style="color:#38E4FF;margin:0;letter-spacing:1px;">QUANTERS</h2><p style="color:#94a3b8;font-size:13px;margin:4px 0 0;">QUANTA Scientific Club Security</p></div><h3 style="color:#ffffff;font-size:18px;">Two-Step Verification Updated</h3><p style="color:#cbd5e1;line-height:1.6;">Hello %DISPLAY_NAME%,</p><p style="color:#cbd5e1;line-height:1.6;">Two-step verification (%SECOND_FACTOR%) has been enrolled on your QUANTERS account.</p><p style="color:#cbd5e1;line-height:1.6;">If you did not set up this second factor, follow this link immediately to remove it:</p><div style="text-align:center;margin:32px 0;"><a href="%LINK%" style="display:inline-block;background:#ef4444;color:#ffffff;font-weight:700;padding:14px 28px;border-radius:8px;text-decoration:none;">Remove Second Factor</a></div><hr style="border:none;border-top:1px solid #1e293b;margin:24px 0;"/><p style="color:#64748b;font-size:12px;margin:0;">For account protection questions, reach out to quantaclubdz@gmail.com.</p></div>`,
        bodyFormat: "HTML",
        replyTo: "quantaclubdz@gmail.com",
      },
    },
  },
});

const req = https.request(
  "https://identitytoolkit.googleapis.com/admin/v2/projects/quanters-d0312/config?updateMask=notification.sendEmail",
  {
    method: "PATCH",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
    },
  },
  (res) => {
    let body = "";
    res.on("data", (c) => (body += c));
    res.on("end", () => {
      console.log("PATCH notification.sendEmail Status:", res.statusCode);
      if (res.statusCode === 200) {
        console.log("Email templates successfully updated to international production standards!");
      } else {
        console.log("Response body:", body);
      }
    });
  }
);

req.on("error", console.error);
req.write(postData);
req.end();
