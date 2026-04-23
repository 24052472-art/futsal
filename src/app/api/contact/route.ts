import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"GameHaru Contact" <${process.env.EMAIL_USER}>`,
      to: "abhi.kush047@gmail.com",
      replyTo: email,
      subject: `Contact Form: Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #00d4ff, #00ff88); padding: 24px; text-align: center;">
            <h1 style="color: #020617; margin: 0; font-size: 24px;">New Contact Message</h1>
            <p style="color: rgba(2, 6, 23, 0.8); margin: 8px 0 0 0;">Someone reached out via the Contact form</p>
          </div>
          
          <div style="padding: 32px; background: #ffffff;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: bold; width: 100px;">Name:</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: bold;">Email:</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a;"><a href="mailto:${email}" style="color: #00d4ff;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #64748b; font-weight: bold; vertical-align: top;">Message:</td>
                <td style="padding: 12px 0; color: #0f172a; line-height: 1.6;">${message.replace(/\n/g, "<br/>")}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #f8fafc; padding: 16px; text-align: center; color: #94a3b8; font-size: 12px;">
            Sent from GameHaru Contact Form
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact Email Error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
