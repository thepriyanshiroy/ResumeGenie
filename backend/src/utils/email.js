const nodemailer = require('nodemailer');

// 1) create a transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_PORT === '465',
    family: 4, // Force IPv4 to fix ENETUNREACH in production
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
});

transporter.verify()
    .then(() => console.log("SMTP Connected Successfully"))
    .catch((error) => console.error(error));

const sendEmail = async options =>{
    //2) Define the email options
    const mailOptions = {
        from: 'Priyanshi Roy <thepriyanshiroy@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        //html:
    };
    //3) Actually send the email
    await transporter.sendMail(mailOptions);
};
module.exports = sendEmail;
