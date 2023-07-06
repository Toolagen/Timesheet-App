// var express = require('express');
// var router = express.Router();
// var passport = require('passport');
// var config = require('../config/config');
// var jwt = require('jwt-simple');

// /* GET home page. */
// router.get('/', function (req, res) {
//     res.render('index', { title: 'Timesheet  Management App' });
// });


// //-----------------------------------------------------------------------------
// // Set up the route controller
// //
// // 1. For 'login' route and 'returnURL' route, use `passport.authenticate`.
// // This way the passport middleware can redirect the user to login page, receive
// // id_token etc from returnURL.
// //
// // 2. For the routes you want to check if user is already logged in, use
// // `ensureAuthenticated`. It checks if there is an user stored in session, if not
// // it will call `passport.authenticate` to ask for user to log in.
// //-----------------------------------------------------------------------------
// // function ensureAuthenticated(req, res, next) {
// //     if (req.isAuthenticated()) { return next(); }
// //     res.redirect('/login');
// //   };
  
//   // Use jwt-simple npm to generate token by using app secret key
//   function genToken(user){
//     var expires = expiresIn(2);
//     var payload = {
//         uname : user.displayName,
//         uemail : user.upn,
//         exp : expires
//     }
//     var token = jwt.encode(payload, config.secretkey);

//     return {
//         token : token,
//         expires : expires,
//         username : user.upn,
//         userid : user.oid
//     }
//   }

//   function expiresIn(numDays) {
//     var dateObj = new Date();
//     return dateObj.setDate(dateObj.getDate() + numDays);
//   }

//   router.get('/', function(req, res) {
//     res.render('index', { user: req.user });
//   });
  
//   // '/account' is only available to logged in user
//   // router.get('/account', ensureAuthenticated, function(req, res) {
//   //   res.render('account', { user: req.user });
//   // });
  
//   router.get('/login',
//     function(req, res, next) {
//       passport.authenticate('azuread-openidconnect',
//         {
//           response: res,                      // required
//           resourceURL: config.resourceURL,    // optional. Provide a value if you want to specify the resource.
//           customState: 'my_state',            // optional. Provide a value if you want to provide custom state value.
//           failureRedirect: '/'
//         }
//       )(req, res, next);
//     },
//     function(req, res) {
//       log.info('Login was called in the Sample');
//       res.redirect('/');
//   });
  
//   // 'GET returnURL'
//   // `passport.authenticate` will try to authenticate the content returned in
//   // query (such as authorization code). If authentication fails, user will be
//   // redirected to '/' (home page); otherwise, it passes to the next middleware.
//   router.get('/auth/openid/return',
//     function(req, res, next) {
//       passport.authenticate('azuread-openidconnect',
//         {
//           response: res,                      // required
//           failureRedirect: '/'
//         }
//       )(req, res, next);
//     },
//     function(req, res) {
//       log.info('We received a return from AzureAD.');
//       res.redirect('/');
//     });
  
//   // 'POST returnURL'
//   // `passport.authenticate` will try to authenticate the content returned in
//   // body (such as authorization code). If authentication fails, user will be
//   // redirected to '/' (home page); otherwise, it passes to the next middleware.
//   router.post('/auth/openid/return',
//     function(req, res, next) {
//       passport.authenticate('azuread-openidconnect',
//         {
//           response: res,                      // required
//           failureRedirect: '/'
//         }
//       )(req, res, next);
//     },
//     function(req, res) {
//       if(req.user){
//         if(req.user.oid){
//           res.redirect(config.clientUrl + "/login?token=" + genToken(req.user).token +"&key=" + req.user.upn)
//         }
//       }
//       // log.info('We received a return from AzureAD.');
//       // res.redirect('/');
//     });
  
//   // 'logout' route, logout from passport, and destroy the session with AAD.
//   // router.get('/logout', function(req, res){
//   //   req.session.destroy(function(err) {
//   //     req.logOut();
//   //     res.redirect(config.destroySessionUrl);
//   //   });
//   // });

// module.exports = router;

/* token expiry upto 1 year */
var express = require('express');
var router = express.Router();
var passport = require('passport');
var config = require('../config/config');
var jwt = require('jwt-simple');

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', { title: 'Timesheet Management App' });
});

function genToken(user) {
    var expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1); // Set expiry to 1 year

    var payload = {
        uname: user.displayName,
        uemail: user.upn,
        exp: expires.getTime() // Expiry timestamp in milliseconds
    };

    var token = jwt.encode(payload, config.secretkey);

    return {
        token: token,
        expires: expires,
        username: user.upn,
        userid: user.oid
    };
}

router.get('/', function (req, res) {
    res.render('index', { user: req.user });
});

router.get('/auth/login',
    function (req, res, next) {
        passport.authenticate('azuread-openidconnect',
            {
                response: res,                      // required
                resourceURL: config.resourceURL,    // optional. Provide a value if you want to specify the resource.
                customState: 'my_state',            // optional. Provide a value if you want to provide custom state value.
                failureRedirect: '/'
            }
        )(req, res, next);
    },
    function (req, res) {
        log.info('Login was called in the Sample');
        res.redirect('/');
    }
);

router.get('/auth/openid/return',
    function (req, res, next) {
        passport.authenticate('azuread-openidconnect',
            {
                response: res,                      // required
                failureRedirect: '/'
            }
        )(req, res, next);
    },
    function (req, res) {
        log.info('We received a return from AzureAD.');
        res.redirect('/');
    }
);

router.post('/auth/openid/return',
    function (req, res, next) {
        passport.authenticate('azuread-openidconnect',
            {
                response: res,                      // required
                failureRedirect: '/'
            }
        )(req, res, next);
    },
    function (req, res) {
        if (req.user) {
            if (req.user.oid) {
                var token = genToken(req.user);
                res.cookie('token',  token.token);
                res.cookie('key', req.user.upn);
        
                res.redirect(config.clientUrl + "/login");
            }
        }
    }
);

module.exports = router;
