const nodemailer = require('nodemailer')
const sendEmail = async ({ to, subject, html }) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "kaushalmahawer267@gmail.com",
                pass: "nrhi hwpj wyma cwtb"
            },
        })
        const info = await transporter.sendMail({
            from: '"Kaushal kumar" <kaushalmahawer267@gmail.com>',
            to,
            subject,
            html
        });
        console.log("OTP sent:", info.messageId);
        return info;
    } catch (err) {
        console.log(err)
    }

}

const sendUpdate = async({from ,to ,subject,html})=>{
    try{
        const transporter = nodemailer.createTransport({
            service:"gmail",
            auth:{
                user: "kaushalmahawer267@gmail.com",
                pass: "nrhi hwpj wyma cwtb"
            }
        })
        const info =await transporter.sendMail({
            from,
            to,
            subject,
            html
        })
        console.log("Sent Email",info.messageId)
    }catch(err){
        console.log(err)
    }
}
module.exports = sendEmail,sendUpdate;