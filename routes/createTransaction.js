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

router.post('/', function(req, res) {
  var saleRequest = {
    customerId: req.body.customer_id,
    amount: req.body.total,
    options: {
      submitForSettlement: true
    }
  };

  gateway.transaction.sale(saleRequest, function (err, result) {
    res.send(result);
    if (result) {
      if (result.success) {
        console.log("success");
        mailCustomerReceipt(req);
      }
    }
  });
});

function mailCustomerReceipt(req) {
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

function cashback() {
  var Cashback = Parse.Object.extend("Cashback");
  var query = new Parse.Query(Cashback);
  query.equalTo("user", {
    __type: "Pointer",
    className: "_User",
    objectId: req.body.customer_id
  });

  query.first({
    success: function(cashback) {
      var cashBackFloat = parseFloat(cashback.get("cashbackCount"));
      var totalFloat = parseFloat(req.body.customerFinalAmount) + cashBackFloat;
      var currCreditFloat = parseFloat(customer.get("credits"));
      if (totalFloat > 100.00) {

          var additionalCreditsFloat = Math.floor(totalFloat/100);
          var newCredits = currCreditFloat+additionalCreditsFloat.toFixed(2).toString();
          customer.set("credits", newCredits);
          var newCashBackCount = (totalFloat-(additionalCreditsFloat*100)).toFixed(2).toString();
          console.log("greater than 100; cashBackCount: "+newCashBackCount);
          cashback.set("cashbackCount", newCashBackCount);
          cashback.save();
          //object[@"cashBackCount"] = [NSString stringWithFormat:@"%0.2f", totalFloat-(additionalCredits*100)];
      } else {
        var newCashBackCount = (cashBackFloat+parseFloat(req.body.customerFinalAmount)).toFixed(2).toString();
        console.log("less than 100; cashBackCount: "+newCashBackCount);
        customer.set("cashbackCount", newCashBackCount);
        customer.save();
          //object[@"cashBackCount"] = [NSString stringWithFormat:@"%0.2f", cashBackFloat + amountFloat];
      }
    },
    error: function() {
    }
  });


  query.get(req.body.customer_id, {
    success: function(customer) {
      console.log("got customer");
      // The object was retrieved successfully.
      var cashBackFloat = parseFloat(customer.get("cashBackCount"));
      var totalFloat = parseFloat(req.body.customerFinalAmount) + cashBackFloat;
      var currCreditFloat = parseFloat(customer.get("credits"));
      if (totalFloat > 100.00) {

          var additionalCreditsFloat = Math.floor(totalFloat/100);
          var newCredits = currCreditFloat+additionalCreditsFloat.toFixed(2).toString();
          customer.set("credits", newCredits);
          var newCashBackCount = (totalFloat-(additionalCreditsFloat*100)).toFixed(2).toString();
          console.log("greater than 100; cashBackCount: "+newCashBackCount);
          customer.set("cashBackCount", newCashBackCount);
          customer.save();
          //object[@"cashBackCount"] = [NSString stringWithFormat:@"%0.2f", totalFloat-(additionalCredits*100)];
      } else {
        var newCashBackCount = (cashBackFloat+parseFloat(req.body.customerFinalAmount)).toFixed(2).toString();
        console.log("less than 100; cashBackCount: "+newCashBackCount);
        customer.set("cashBackCount", newCashBackCount);
        customer.save();
          //object[@"cashBackCount"] = [NSString stringWithFormat:@"%0.2f", cashBackFloat + amountFloat];
      }
    },
    error: function(object, error) {
      // The object was not retrieved successfully.
      // error is a Parse.Error with an error code and description.
      console.log(error);
    }
  });
}

module.exports = router;