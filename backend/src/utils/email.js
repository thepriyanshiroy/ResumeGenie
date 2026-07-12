const nodemailer = require('nodemailer');
const sendEmail = async options =>{
    //1) create a transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail', // This automatically sets the correct host, port, and secure settings for Gmail
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });
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
