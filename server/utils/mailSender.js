const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT || 587,
            secure: process.env.MAIL_SECURE === 'true' || false,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        });

        let info = await transporter.sendMail({
            from: `"EduSync" <${process.env.MAIL_USER}>`,
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`,
        });
        
        console.log(`Email sent successfully to ${email}`);
        return info;
    } catch (error) {
        console.error("Error sending email:", error.message);
        throw new Error("Cannot send email. Please check configuration.");
    }
}

module.exports = mailSender;
