'use strict'

var express = require('express');
var router = express.Router();

var config = require('../config/environment');
var auth = require('../lib/auth/auth.service');
var registrationController = require('../lib/user/register');
var feedController = require('../lib/user/feed');
var actionController = require('../lib/user/actions');
var crawlController = require('../lib/crawler');

//var middleware = require('../middleware/');
//var errors = require('../components/errors');
//these routes need to written using regex

router.post('/register',function(req,res,next){
    var register = new registrationController();
    if(!req.body || !req.body.password || !req.body.email){
        res.status(400).send({error : 'Missing parameters'}).end();
    }else{
        var args = {
            email : req.body.email,
            password : req.body.password
        };

        register.on("registered", function(regResult){
            //self.emit("registered",regResult);
            console.log('success');
            console.log(regResult);
            res.status(200).send(regResult).end();
        });
        register.on("not-registered", function(regResult){
            console.log('error');
            console.log(regResult);
            res.status(regResult.errorCode).send({error : regResult.error}).end();
            //self.emit("not-registered",regResult);
        });
        register.register(args, next);
    }
});

router.get('/feed', auth.isAuthenticated(),function(req,res,next){
    //console.log(req.user);
    var feed = new feedController();

    if(!req.user){
        res.status(401).send({error : 'Unauthorized'}).end();
    }else{
        feed.on("feed-created", function(feed){
            //self.emit("registered",regResult);
            console.log('success');
            //console.log(feed);
            res.status(200).send(feed).end();
        });
        feed.on("feed-not-created", function(errFeed){
            console.log('error');
            console.log(errFeed);
            res.status(errFeed.errorCode).send({error : errFeed.error}).end();
            //self.emit("not-registered",regResult);
        });
        console.log('calling feed');
        feed.feed(req.user, next)
    }
});

router.post('/read/:postId', auth.isAuthenticated(),function(req,res,next){
    //console.log(req.user);
    var action = new actionController();

    if(!req.user || !req.params.postId){
        res.status(401).send({error : 'Unauthorized'}).end();
    }else{
        var args = {
            userId : req.user._id,
            postId : req.params.postId
        };
        action.on("succeeded", function(feed){
            console.log('success');
            res.status(200).send({success:true}).end();
        });
        action.on("failed", function(errFeed){
            console.log('error');
            console.log(errFeed);
            res.status(errFeed.errorCode).send({error : errFeed.error}).end();
        });
        action.read(args,next);
    }
});

router.post('/delete/:postId', auth.isAuthenticated(),function(req,res,next){

    var action = new actionController();

    if(!req.user || !req.params.postId){
        res.status(401).send({error : 'Unauthorized'}).end();
    }else{
        var args = {
            userId : req.user._id,
            postId : req.params.postId
        };
        action.on("succeeded", function(feed){
            res.status(200).send({success:true}).end();
        });
        action.on("failed", function(errFeed){
            res.status(errFeed.errorCode).send({error : errFeed.error}).end();
        });
        action.deleted(args,next);
    }
});

router.get('/me', auth.isAuthenticated(),function(req,res,next){

    var action = new actionController();

    if(!req.user){
        res.status(401).send({error : 'Unauthorized'}).end();
    }else{
        var args = {
            userId : req.user._id,
        };
        action.on("succeeded", function(user){
            res.status(200).send(user).end();
        });
        action.on("failed", function(errFeed){
            res.status(errFeed.errorCode).send({error : errFeed.error}).end();
        });
        action.retrieve(args,next);
    }
});

router.post('/crawl', auth.isAuthenticated(),function(req,res,next){

    var crawler = new crawlController();

    if(!req.user){//} || req.role !=='admin'){
        res.status(401).send({error : 'Unauthorized'}).end();
    }else{
        crawler.on("done", function(user){
            res.status(200).send({success:true}).end();
        });
        crawler.on("failed", function(errFeed){
            res.status(errFeed.errorCode).send({error : errFeed.error}).end();
        });
        crawler.crawlHN({})
    }
});

module.exports = router;
