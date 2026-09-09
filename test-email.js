import { Resend } from 'resend';
import 'dotenv/config';

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  console.log('Sending test email...');
  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'vsawantlm17@gmail.com',
      subject: 'Resend API Test',
      html: '<p>This is a test from the local environment.</p>',
    });
    console.log('Success:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testEmail();
