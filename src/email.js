

function getHashOf(plaintext ) {
  const crypto = require('crypto');

  // Defining key
  const secret = 'Hi';
  // Calling createHash method
  const hash = crypto.createHash('sha256', secret)
    // updating data
    .update('How are you?')
    // Encoding to be used
    .digest('hex');

  // const sliced = hash.slice(0, 5)
  return hash;
}

function makeid(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
}

function authPasswordResetRequest(token, email) {
  // const token = req.headers.token
  // const data = getData();
  // const user = data.users.find(u => u.token.includes(token) === true);
  // if (!user) return {error: 'user not found'}
  // if (!data.users.find(u => u.emailAddress === email)) {
  //   return {error : 'email not found'};
  // }


  const rand = makeid(6);
  const passReset = getHashOf(rand);
  const sixDigit = passReset.slice(0, 6);

  // data.passwordRequest.push(
  //   {
  //     email: email,
  //     passReq: sixDigit
  //   });



  var nodemailer = require('nodemailer');
  let transporter = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: "be9ec5b31bc99d",
      pass: "9910b7b64cee1c"
    }
  })

  const mailOptions = {
    from: 'crunchieDevelopment@gmail.com',
    to: email,
    subject: 'Code to reset password is found below',
    text: sixDigit
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
  return {}
}

authPasswordResetRequest(1, 'zachary@gmail.com')