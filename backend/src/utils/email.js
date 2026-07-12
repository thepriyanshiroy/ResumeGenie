const nodemailer = require('nodemailer');
const sendEmail = async options =>{
    //1) create a transported
    const transporter = nodemailer.createTransport({

        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_PORT == 465, // true for 465 (SSL), false for 587 (TLS)
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
