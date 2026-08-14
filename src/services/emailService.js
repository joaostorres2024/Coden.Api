const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  family: 4
})

async function enviarCodigoRecuperacao(email, codigo) {
  await transporter.sendMail({
    from: `"Coden" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Código de recuperação de senha",
    html: `
      <p>Você solicitou a redefinição de senha.</p>
      <p>Seu código de verificação é:</p>
      <h2>${codigo}</h2>
      <p>Este código expira em 10 minutos. Se você não solicitou, ignore este e-mail.</p>
    `
  })
}

module.exports = { enviarCodigoRecuperacao }