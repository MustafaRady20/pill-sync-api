export function verificationEmailTemplate(code: string): string {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Verify your email</title>
    <style>
      body  { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
      .wrap { max-width: 480px; margin: 48px auto; background: #fff; border-radius: 10px; padding: 40px; }
      h2    { color: #111; margin-bottom: 8px; }
      p     { color: #555; font-size: 15px; line-height: 1.6; }
      .code { display: block; margin: 32px auto; text-align: center; font-size: 42px;
              font-weight: 700; letter-spacing: 12px; color: #1a1a1a;
              background: #f0f4ff; border-radius: 8px; padding: 16px 24px; }
      .note { font-size: 13px; color: #999; margin-top: 24px; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <h2>Verify your email address</h2>
      <p>Use the code below to complete your registration. It expires in <strong>10 minutes</strong>.</p>
      <span class="code">${code}</span>
      <p class="note">If you didn't create an account, you can safely ignore this email.</p>
    </div>
  </body>
</html>
  `.trim();
}
