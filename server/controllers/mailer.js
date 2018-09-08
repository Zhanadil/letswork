const to = require('await-to-js');
const mailer = require('nodemailer');

var transporter = mailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'znurtoleuov@gmail.com',
    pass: '3.3&d6Q,oL'
  }
});

module.exports = {
    sendMail: (email, subject, message) => {
        var mailOptions = {
            from: 'znurtoleuov@gmail.com',
            to: email,
            subject, subject,
            text: message,
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                throw error;
            }
            return info;
        });
    },

    sendStudentRegistrationEmail: (temporaryStudent) => {
        var mailOptions = {
            from: 'znurtoleuov@gmail.com',
            to: temporaryStudent.credentials.email,
            subject: 'Добро пожаловать на love2work',
            text: `Спасибо, что выбрали наш сайт, чтобы подтвердить свой почтовый адрес пройдите по ссылке love2work.kz:3000/student/auth/verify/${temporaryStudent.url}`,
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                throw error;
            }
            return info;
        });
    },

    sendCompanyRegistrationEmail: (temporaryCompany) => {
        var mailOptions = {
            from: 'znurtoleuov@gmail.com',
            to: temporaryCompany.credentials.email,
            subject: 'Добро пожаловать на love2work',
            text: `Спасибо, что выбрали наш сайт, чтобы подтвердить свой почтовый адрес пройдите по ссылке love2work.kz:3000/company/auth/verify/${temporaryCompany.url}`,
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                throw error;
            }
            return info;
        });
    },
};
