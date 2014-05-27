var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var braintree = require('braintree');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// Braintree 
var gateway = braintree.connect({
    environment:  braintree.Environment.Sandbox,
    merchantId:   '2c389dxhtk5jkctm',
    publicKey:    'n6dbqznhvmh2cbkr',
    privateKey:   'cb4ee99fabce5fdcf88926d7a476ceae'
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(logfmt.requestLogger());


app.use('/', routes);
app.use('/users', users);

// app.get("/braintree", function (req, res) {
//   res.render("braintree.ejs");
// });

// app.get("/addcard", function (req, res) {
//   res.render("braintree.ejs");
// });


app.post("/create_transaction", function (req, res) {
  var saleRequest = {
    customerId: req.body.customer_id,
    amount: req.body.amount,
    options: {
      submitForSettlement: true
    }
  };

  gateway.transaction.sale(saleRequest, function (err, result) {
    console.log(result);
    res.send(result);
  });
});

app.post("/create_customer", function (req, res) {
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

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;

var port = Number(process.env.PORT || 3000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
