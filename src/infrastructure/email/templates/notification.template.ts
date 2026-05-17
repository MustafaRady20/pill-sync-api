export interface NotificationEmailContext {
  title: string;
  body: string;
  userId: string;
}

export function notificationEmailTemplate(
  ctx: NotificationEmailContext,
): string {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>${ctx.title}</title>
    <style>
      body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; padding: 32px; }
      h1 { font-size: 22px; color: #111; }
      p  { font-size: 15px; color: #444; line-height: 1.6; }
      .footer { margin-top: 32px; font-size: 12px; color: #aaa; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>${ctx.title}</h1>
      <p>${ctx.body}</p>
      <div class="footer">You are receiving this because of your account activity.</div>
    </div>
  </body>
</html>
  `.trim();
}
