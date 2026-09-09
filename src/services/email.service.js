import { BrevoClient } from "@getbrevo/brevo";

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const response = await brevo.transactionalEmails.sendTransacEmail({
      sender: {
        name: "PizzaHub",
        email: process.env.EMAIL_FROM,
      },

      to: Array.isArray(to) ? to.map((email) => ({ email })) : [{ email: to }],

      subject,
      htmlContent: html,

      ...(text && {
        textContent: text,
      }),
    });

    console.log("Brevo email sent successfully:", response);

    return response;
  } catch (error) {
    console.error("Brevo email error:", error?.response?.body || error);

    throw error;
  }
};

export const sendVerificationEmail = async (email, name, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;

  await sendEmail({
    to: email,
    subject: "Verify your PizzaHub account",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h1>Welcome to PizzaHub 🍕</h1>

        <p>Hello ${name},</p>

        <p>
          Thanks for creating your PizzaHub account.
          Please verify your email address.
        </p>

        <a
          href="${verificationUrl}"
          style="
            display:inline-block;
            padding:12px 20px;
            background:#ea580c;
            color:white;
            text-decoration:none;
            border-radius:6px;
          "
        >
          Verify Email
        </a>

        <p>
          This link expires in 24 hours.
        </p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

  await sendEmail({
    to: email,
    subject: "Reset your PizzaHub password",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h1>Password Reset 🍕</h1>

        <p>Hello ${name},</p>

        <p>
          We received a request to reset your password.
        </p>

        <a
          href="${resetUrl}"
          style="
            display:inline-block;
            padding:12px 20px;
            background:#ea580c;
            color:white;
            text-decoration:none;
            border-radius:6px;
          "
        >
          Reset Password
        </a>

        <p>
          This link expires in 15 minutes.
        </p>
      </div>
    `,
  });
};
