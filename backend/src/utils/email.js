const axios = require('axios');

const sendEmail = async (options) => {
    const data = {
        sender: {
            name: 'ResumeGenie',
            email: 'thepriyanshiroy@gmail.com'
        },
        to: [
            {
                email: options.email
            }
        ],
        subject: options.subject,
        textContent: options.message,
    };

    try {
        await axios.post('https://api.brevo.com/v3/smtp/email', data, {
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json'
            }
        });
        console.log("Email sent successfully via Brevo API");
    } catch (error) {
        console.error("Brevo API Error:", error.response ? error.response.data : error.message);
        throw new Error("Failed to send email");
    }
};

module.exports = sendEmail;
