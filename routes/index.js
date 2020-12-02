const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const jwt = require('jsonwebtoken');

const User = require('../models/Users');

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});

router.post('/register', (req, res, next) => {
  const { username, password } = req.body;

  bcrypt.hash(password, 10, function(err,hash) {
    const user = new User( {
      username,
      password: hash
    });
    const promise =user.save();
    promise.then((data) => {
      res.json(data);
    }).catch((error) => {
      res.json(error);
    })
  });
});

router.post('/authenticate', (req,res) => {
  const { username, password } = req.body;

  User.findOne({
    username
  }, (err, user) => {
    if (err)
      throw err;

    if (!user) {
      res.json({
        status: false,
        message: 'authentication failed, user not found'
      });
    }else{
      bcrypt.compare(password,user.password).then((result) => {
        if(!result){
          res.json({
            status: false,
            message: 'authentication failed, wrong password '
          });
        }else {
          const payload = {
            username
          };
          const token = jwt.sign(payload, req.app.get('api_secret_key'), {
            expiresIn: 720
          });
          res.json({
            status: true,
            token
          });
        }
      });
    }
  })
});

module.exports = router;
