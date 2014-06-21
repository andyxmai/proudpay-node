var express = require('express');
var router = express.Router();
var braintree = require('braintree');

// Braintree 
var gateway = braintree.connect({
    environment:  braintree.Environment.Sandbox,
    merchantId:   '2c389dxhtk5jkctm',
    publicKey:    'n6dbqznhvmh2cbkr',
    privateKey:   'cb4ee99fabce5fdcf88926d7a476ceae'
});

/* POST home page. */
router.post('/', function(req, res) {
  var customerRequest = {
    id: req.body.customer_id,
    firstName: req.body.first_name,
    lastName: req.body.last_name,
    creditCard: {
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
  };

  gateway.customer.create(customerRequest, function (err, result) {
    console.log(result);
    res.send(result);
    // if (result.success) {
    //   res.send({"success":1});
    // } else {
    //   res.send({"error":result.message});
    // }
  });
});

module.exports = router;
