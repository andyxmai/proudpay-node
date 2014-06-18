var express = require('express');
var logfmt = require("logfmt");
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var braintree = require('braintree');
var nodemailer = require("nodemailer");

var routes = require('./routes/index');
var users = require('./routes/users');
//var customerInfo = require('./routes/getCustomerInfo');

var app = express();

// Braintree 
var gateway = braintree.connect({
    environment:  braintree.Environment.Sandbox,
    merchantId:   '2c389dxhtk5jkctm',
    publicKey:    'n6dbqznhvmh2cbkr',
    privateKey:   'cb4ee99fabce5fdcf88926d7a476ceae'
});

// Parse
var Parse = require('parse').Parse;
Parse.initialize("b5kezfWTiIjiIiGgtEAxOd5DaZQT8t3d0NofPlGn", "6w8HJ5Jbpyl5Tr20DHeUbigm4rFQ5popfMTByNTH");

// NodeMailer
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "proudpayreceipt@gmail.com",
        pass: "proudpay2014"
    }
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
//app.use('/get_customer_info', customerInfo);

app.get("/braintree", function (req, res) {
  res.render("braintree.ejs");
});

// app.get("/addcard", function (req, res) {
//   res.render("braintree.ejs");
// });

app.get("/get_customer_info", function(req, res) {
  var url = require('url');
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;
  //var customer_id = 'Awl85RoF4U';
  gateway.customer.find(query.customer_id, function (err, customer) {
    //console.log(customer.creditCards);
    res.send(customer);
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

app.post("/create_transaction", function (req, res) {
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
        mailCustomerReceipt(req);

        var User = Parse.Object.extend("_User");
        var query = new Parse.Query(User);
        query.get(req.body.customer_id, {
          success: function(user) {
            console.log("got user");
            // The object was retrieved successfully.
            var cashBackFloat = parseFloat(user.get("cashBackCount"));
            var totalFloat = parseFloat(req.body.customerFinalAmount) + cashBackFloat;
            var currCreditFloat = parseFloat(user.get("credits"));
            if (totalFloat > 100.00) {

                var additionalCreditsFloat = Math.floor(totalFloat/100);
                var newCredits = currCreditFloat+additionalCreditsFloat.toFixed(2).toString();
                user.set("credits", newCredits);
                var newCashBackCount = (totalFloat-(additionalCreditsFloat*100)).toFixed(2).toString();
                console.log("greater than 100; cashBackCount: "+newCashBackCount);
                user.set("cashBackCount", newCashBackCount);
                //object[@"cashBackCount"] = [NSString stringWithFormat:@"%0.2f", totalFloat-(additionalCredits*100)];
            } else {
              var newCashBackCount = (cashBackFloat+parseFloat(req.body.customerFinalAmount)).toFixed(2).toString();
              console.log("less than 100; cashBackCount: "+newCashBackCount);
              user.set("cashBackCount", newCashBackCount);
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
    }
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

app.post("/add_card", function (req, res) {
  var newCard = {
    customerId: req.body.customer_id,
    number: req.body.card_number,
    cvv: req.body.cvv,
    expirationMonth: req.body.expiration_month,
    expirationYear: req.body.expiration_year,
    billingAddress: {
      postalCode: req.body.zipcode
    },
    options: {
      verifyCard: true,
      makeDefault: true
    }
  };
  gateway.creditCard.create(newCard, function (err, result) {
    console.log(result);
    res.send(result);
  });
});

app.post("/delete_card", function (req, res) {
  gateway.creditCard.delete(req.body.card_token, function (err) {
    if (err) {
      res.send(err);
    } else {
      res.send({'success':1});
    }
  });
});

app.post("/default_card", function (req, res) {
  gateway.creditCard.update(req.body.card_token, {
    options: {
     makeDefault: true
    }
  }, function (err, result) {
    res.send(result);
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
