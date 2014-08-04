var express = require('express');
var router = express.Router();
var braintree = require('braintree');
var nodemailer = require("nodemailer");

// Braintree 
var gateway = braintree.connect({
    environment:  braintree.Environment.Production,
    merchantId:   'sgy5fmkkbp6cw9vf',
    publicKey:    'm8wkrtthtth9pbxj',
    privateKey:   'be752af645ce005b989b886339066d2c'
});

var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "support@proudpay.com",
        pass: "proudpay2014"
    }
});

/* POST home page. */
router.post('/', function(req, res) {
  var customerRequest = {
    id: req.body.customer_id,
    firstName: req.body.first_name,
    lastName: req.body.last_name,
  };

  if ('card_number' in req.body) {
    var creditCardInfo =  {
      number: req.body.card_number,
      cvv: req.body.cvv,
      expirationMonth: req.body.expiration_month,
      expirationYear: req.body.expiration_year,
      billingAddress: {
        postalCode: req.body.zipcode
      },
      options: {
        verifyCard: true
      }
    }
    customerRequest.creditCard = creditCardInfo;
  }

  gateway.customer.create(customerRequest, function (err, result) {
    console.log(result);
    res.send(result);
    // if (result.success) {
    //   res.send({"success":1});
    // } else {
    //   res.send({"error":result.message});
    // }
  });

  var mailOptions = {
    from: "ProudPay <support@proudpay.com>", // sender address
    to: 'andrew.x.mai@gmail.com', // send to support email
    subject: "New User: " + req.body.first_name + " " + req.body.last_name, // Subject line
    text: "New User: " + req.body.first_name + " " + req.body.last_name, // plaintext body
  }

  // send mail with defined transport object
  smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
        console.log(error);
    } else{
        console.log("Message sent: " + response.message);
    }
  });   
});

module.exports = router;
