import nodemailer from "nodemailer";
import config from "../config";
import pug from "pug";
import { convert } from "html-to-text";

interface EmailInfo {
  subject: string;
}

class EmailService {
  public to;
  public from;
  public firstName;
  public url;

  constructor(user: any, url: string) {
    this.to = user.email;
    this.from = `PathNest <hello@pathnest.io>`;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
  }

  newTransport() {
    if (config.NODE_ENV !== "production") {
      return nodemailer.createTransport({
        host: config.BREVO_HOST,
        port: config.BREVO_PORT,
        auth: {
          user: config.BREVO_USER,
          pass: config.BREVO_PASS,
        },
      });
    } else {
      return nodemailer.createTransport({
        host: config.EMAIL_HOST,
        port: config.EMAIL_PORT,
        auth: {
          user: config.EMAIL_USER,
          pass: config.EMAIL_PASS,
        },
      });
    }
  }

  async send(template: string, info: EmailInfo) {
    const html = pug.renderFile(`${__dirname}/../views/${template}.pug`, {
      url: this.url,
      firstName: this.firstName,
      subject: info.subject,
    });

    const mailOptions = {
      to: this.to,
      from: this.from,
      subject: info.subject,
      html,
      text: convert(html),
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendEmailVerification() {
    await this.send("verifyEmail", {
      subject: "🚀 Welcome to PathNest! Please Verify Your Email 📧",
    });
  }

  async sendWelcome() {
    await this.send("welcome", {
      subject:
        "🎉 Welcome to PathNest! Let’s shape your child’s future together!",
    });
  }

  async sendForgotPassword() {
    await this.send("forgotPassword", {
      subject: "Reset Your PathNest Password 🔒",
    });
  }

  async sendPasswordChanged() {
    await this.send("passwordChanged", {
      subject: "🔑 Your Password Was Successfully Changed",
    });
  }

  async sendPartnerAddition() {
    await this.send("partnerAddition", {
      subject: "🌟 New Partner Added to Your Child’s Profile",
    });
  }

  async sendPartnerInvitation() {
    await this.send("partnerInvite", {
      subject: "✉️ You’ve Been Invited to PathNest!",
    });
  }
}

export default EmailService;
