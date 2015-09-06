/**
 * Created by akshat on 6/9/15.
 */

'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');

var router = express.Router();

router.post('/', function(req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        var error = err || info;
        if (error) {
            return res.status(401).send(error).end();
        }
        if (!user) {
            return res.status(404).send({message: 'Something went wrong, please try again.'}).end();
        }
        var token = auth.signToken(user._id, user.role);
        user = user.toObject();
        user.token = token;
        delete user.hashedPassword;
        delete user.salt;
        res.status(200).send(user).end();
    })(req, res, next)
});

module.exports = router;