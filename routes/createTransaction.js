var express = require('express');
var router = express.Router();
var braintree = require('braintree');
var nodemailer = require("nodemailer");

// Braintree 
var gateway = braintree.connect({
    environment:  braintree.Environment.Sandbox,
    merchantId:   '2c389dxhtk5jkctm',
    publicKey:    'n6dbqznhvmh2cbkr',
    privateKey:   'cb4ee99fabce5fdcf88926d7a476ceae'
});

router.post('/create_transaction', function(req, res) {
  var saleRequest = {
    customerId: req.body.customer_id,
    amount: req.body.total,
    options: {
      submitForSettlement: true
    }
  };

  gateway.transaction.sale(saleRequest, function (err, result) {
    console.log(result);
    res.send(result);
    if (result) {
      if (result.success) {
        var mailOptions = {
          from: "ProudPay <proudpayreceipt@gmail.com>", // sender address
          to: req.body.customer_email, // list of receivers
          subject: "You paid " + req.body.merchant + " $" + req.body.customerFinalAmount, // Subject line
          text: "Thank you for using ProudPay!", // plaintext body
        }

        // send mail with defined transport object
        smtpTransport.sendMail(mailOptions, function(error, response){
          if(error){
              console.log(error);
          }else{
              console.log("Message sent: " + response.message);
          }
            // if you don't want to use this transport object anymore, uncomment following line
            //smtpTransport.close(); // shut down the connection pool, no more messages
        });   
      }
    }
  });
});

module.exports = router;