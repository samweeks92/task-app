const sgMail = require('@sendgrid/mail')
const sendgridAPIKey = process.env.SENDGRID_API_KEY


sgMail.setApiKey(sendgridAPIKey)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'task-app@samweeks.london',
        subject: 'Thanks for joining Task-app!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app`
    })
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'task-app@samweeks.london',
        subject: 'Sorry to see you go!',
        text: `See you next time, ${name}. Let me know if there's anything we could have done to keep you.`
    })
}


module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}