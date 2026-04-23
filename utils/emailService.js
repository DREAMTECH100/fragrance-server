const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const emailService = async (to, subject, text) => {
  try {
    await resend.emails.send({
      from: "Fragrance Solution <onboarding@resend.dev>", // ✅ default working sender
      to,
      subject,
      html: `<p>${text}</p>`
    });
  } catch (error) {
    console.error("Resend Error:", error);
    throw new Error("Email failed");
  }
};

module.exports = emailService;