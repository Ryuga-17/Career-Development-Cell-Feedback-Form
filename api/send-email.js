import { Resend } from 'resend';

// Vercel handles API routes out of the box in the /api directory
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // We expect the frontend to send the PDF as a base64 encoded JSON string
    const { pdfBase64, companyName } = req.body;

    if (!pdfBase64) {
      return res.status(400).json({ error: 'No PDF data provided' });
    }

    // Strip the "data:application/pdf;filename=generated.pdf;base64," prefix if it exists
    const base64Content = pdfBase64.replace(/^data:.*,/, '');

    const resend = new Resend(process.env.RESEND_API_KEY);

    const data = await resend.emails.send({
      from: 'onboarding@resend.dev', // Default testing email allowed by Resend free tier
      to: 'vsawantlm17@gmail.com',
      subject: `New Recruiter Feedback - ${companyName || 'Submitted Form'}`,
      html: '<p>A new recruiter feedback form has been submitted. Please find the attached PDF document.</p>',
      attachments: [
        {
          filename: 'recruiter-feedback.pdf',
          content: base64Content,
        },
      ],
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
}
