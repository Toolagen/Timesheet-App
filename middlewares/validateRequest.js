var jwt = require('jwt-simple');
var config = require('../config/config');
var Promise = require("bluebird");

module.exports = function(req, res, next) {
 
  // When performing a cross domain request, you will recieve
  // a preflighted request first. This is to check if our the app
  // is safe. 

  
 //debugger;
  // We skip the token outh for [OPTIONS] requests.
  // if(req.method == 'OPTIONS') next();
  // var hash = bcrypt.hashSync("To0lagen");
  //bcrypt.compareSync("To0lagen", hash); // true
  var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'] || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
  var key = (req.body && req.body.x_key) || (req.query && req.query.x_key) || req.headers['x-key'] || (req.headers.authorization && req.headers.authorization.split(' ')[2]);
  var userValidated = false;

  if (token || key) {
    try {
      var decoded = jwt.decode(token, config.secretkey);
 

      // if (decoded.exp <= Date.now()) {
      //   res.status(401);
      //   res.json({
      //     "status": 401,
      //     "message": "Token Expired"
      //   });
      //   return;
      // }
 
      // validate user
      for (var i = 0, len = config.Users.length; i < len; i++) {
        var user = config.Users[i];
        if (user.upn === decoded.uemail) {
            userValidated = true;
            break;
        }
      }

      if(userValidated){
          next();
      }
      else{
        res.status(403);
        res.json({
            "status": 403,
            "message": "Not Authorized"
        });
        return;
      }
    } catch (err) {
      res.status(500);
      res.json({
        "status": 500,
        "message": "Oops something went wrong",
        "error": err
      });
      return;
    }
  } else {
    res.status(401);
    res.json({
      "status": 401,
      "message": "Invalid Token or Key"
    });
    return;
  }
};