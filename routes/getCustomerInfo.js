var express = require('express');
var router = express.Router();
var url = require('url');
var braintree = require('braintree');

// Braintree 
var gateway = braintree.connect({
    environment:  braintree.Environment.Production,
    merchantId:   'sgy5fmkkbp6cw9vf',
    publicKey:    'm8wkrtthtth9pbxj',
    privateKey:   'be752af645ce005b989b886339066d2c'
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
