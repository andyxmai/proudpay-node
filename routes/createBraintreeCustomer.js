var express = require('express');
var router = express.Router();
var braintree = require('braintree');

// Braintree 
var gateway = braintree.connect({
    environment:  braintree.Environment.Production,
    merchantId:   'sgy5fmkkbp6cw9vf',
    publicKey:    'm8wkrtthtth9pbxj',
    privateKey:   'be752af645ce005b989b886339066d2c'
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
