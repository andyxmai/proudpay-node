var express = require('express');
var router = express.Router();
var url = require('url');
var braintree = require('braintree');

// Braintree 
var gateway = braintree.connect({
    environment:  braintree.Environment.Sandbox,
    merchantId:   '2c389dxhtk5jkctm',
    publicKey:    'n6dbqznhvmh2cbkr',
    privateKey:   'cb4ee99fabce5fdcf88926d7a476ceae'
});

/* GET home page. */
router.get('/', function(req, res) {
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;
  //var customer_id = 'Awl85RoF4U';
  gateway.customer.find(query.customer_id, function (err, customer) {
    //console.log(customer.creditCards);
    res.send(customer);
  });
});

module.exports = router;
