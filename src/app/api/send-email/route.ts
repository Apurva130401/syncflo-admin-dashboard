import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend('re_LM8Cj6Eu_9ia46wHhdB8BicZ6dXEbbvVj');

export async function POST(request: Request) {
    try {
        const { to, subject, message } = await request.json();

        console.log('Attempting to send email to:', to);

        const { data, error } = await resend.emails.send({
            from: 'SyncFlo AI <support@updates.syncflo.xyz>',
            reply_to: 'apurvamishra13@gmail.com',
            to: [to],
            subject: subject,
            html: `<p>${message}</p>`,
        });

        if (error) {
            console.error('Resend API Error:', error);
            return NextResponse.json({ error }, { status: 500 });
        }

        console.log('Email sent successfully:', data);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Internal Server Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
