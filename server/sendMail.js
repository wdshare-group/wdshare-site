var nodemailer = require("nodemailer"),
    config     = require("./config.js"),
    mail       = config.mail,
    mails      = [];

var smtpTransport = nodemailer.createTransport({
    service: mail.service,
    auth: {
        user: mail.user,
        pass: mail.pass
    }
});


function send(mail){
    "use strict";
    mails.push(mail);
}

function getAndSend(){
    "use strict";
    var mail;
    if(mails.length>0){
        mail = mails.shift();
        smtpTransport.sendMail(mail, function(error, response){
            if(error){
                console.log(error);
                console.log("MailSendError");
            }else{
                console.log("Message sent!");
                //console.log("Message sent: " + response.message);
            }
        });
    }else{
        smtpTransport.close();
    }
}
//process.nextTick(getAndSend);
setInterval(getAndSend,5000);


module.exports = send;