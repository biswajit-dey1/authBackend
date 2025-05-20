import Mailgen from "mailgen";

import nodemailer from "nodemailer";

const sendMail = async (options) => {
    const mailGenerator = new Mailgen({

        theme: "default",
        product: {
            name: "Task Manager",
            link: "https://mailgen.js/",
        },
    });

    const emailHtml = mailGenerator.generate(options.mailGenContent)

    const emailTextual = mailGenerator.generatePlaintext(options.mailGenContent)

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // true for port 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {

        await transporter.sendMail(
            {
                from: process.env.SMTP_SENDER,
                to: options.email,
                subject: options.subject,
                text: emailTextual,
                html: emailHtml
            }
        )

    } catch (error) {
        console.error(
            "Email service failed silently. Make sure you have provided your MAILTRAP credentials in the .env file",
          );
          console.error("Error: ", error);
    }
};



// This is factory function

const emailVerificationMailGenContent = (userName, verificationlink) => {

    return {
        body: {
            name: userName,
            intro: 'Welcome to our App! We\'re very excited to have you on board.',
            action: {
                instructions: 'To verify your email please click on the following button:',
                button: {
                    color: '#22BC66',
                    text: 'Confirm your account',
                    link: verificationlink
                }
            },
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    }
}


export {sendMail, emailVerificationMailGenContent};