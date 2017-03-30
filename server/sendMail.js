var nodemailer = require("nodemailer"),
    config     = require("./config.js"),
    mail       = config.mail,
    mails      = [],
    succeedCallback = function() {},
    errorCallback = function() {};

var smtpTransport = nodemailer.createTransport({
    service: mail.service,
    auth: {
        user: mail.user,
        pass: mail.pass
    }
});


function send(mail, succeed, error) {
    "use strict";
    mails.push(mail);

    if ( succeed ) {
        succeedCallback = succeed;
    }
    if ( error ) {
        errorCallback = error;
    }
};

function getAndSend(){
    "use strict";
    var mail;
    if(mails.length>0){
        mail = mails.shift();
        smtpTransport.sendMail(mail, function(error, response){
            if(error){
                console.log(error);
                console.log("MailSendError");
                errorCallback();
            }else{
                console.log("Message sent!");
                succeedCallback();
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