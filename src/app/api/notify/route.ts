import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { ownerEmail, customerName, date, time, amount, sportName } = await req.json();

    if (!ownerEmail) {
      return NextResponse.json({ error: "Owner email is required" }, { status: 400 });
    }

    // Configure your SMTP transporter
    // Note: To use Gmail, you'll need to generate an App Password
    // https://myaccount.google.com/apppasswords
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const formattedDate = new Date(date).toLocaleDateString("en-US", {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const mailOptions = {
      from: `"GHos Notifications" <${process.env.EMAIL_USER}>`,
      to: ownerEmail,
      subject: `New Booking Alert: ${sportName} on ${formattedDate}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #00d4ff, #00ff88); padding: 24px; text-align: center;">
            <h1 style="color: #020617; margin: 0; font-size: 24px;">New Booking Alert</h1>
            <p style="color: rgba(2, 6, 23, 0.8); margin: 8px 0 0 0;">You have a new reservation pending verification!</p>
          </div>
          
          <div style="padding: 32px; background: #ffffff;">
            <h3 style="color: #0f172a; margin-top: 0; font-size: 18px;">Booking Details:</h3>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: bold; width: 120px;">Customer:</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${customerName}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: bold;">Sport:</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${sportName}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: bold;">Date:</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: bold;">Time:</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${time}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #64748b; font-weight: bold;">Amount:</td>
                <td style="padding: 12px 0; color: #10b981; font-weight: bold; font-size: 18px;">₹${amount}</td>
              </tr>
            </table>

            <div style="margin-top: 32px; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/bookings" style="display: inline-block; background: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Verify Payment</a>
            </div>
          </div>
          
          <div style="background: #f8fafc; padding: 16px; text-align: center; color: #94a3b8; font-size: 12px;">
            This is an automated message from GHos. Please do not reply directly to this email.
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email Error:", error);
    return NextResponse.json({ error: "Failed to send email notification" }, { status: 500 });
  }
}
