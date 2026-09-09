import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
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
