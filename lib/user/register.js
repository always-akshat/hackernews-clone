/**
 * Created by akshat on 6/9/15.
 */

var Emitter = require("events").EventEmitter;
var util = require("util");
var user = require("../../models/user");
var jwt = require('jsonwebtoken');
var config = require("../../config/environment/index");

var Register = function(){
    Emitter.call(this);
    var self = this;
    var continueWith = null;

    var validateInputs = function(args){
        //make sure there's an email and password
        if(!args.password || !args.email){
            args.error = 'Missing Parameters';
            args.errorCode = 400;
            self.emit("invalid",args);
        }else{
            self.emit("validated",args);
        }

    };

    var checkIfUserExists = function(args){
        user.findOne({email : args.email}, function(err,exists){
            if(err){
                self.emit('abort',err);
            }else {
                if (exists) {
                    args.error = 'User Exists';
                    args.errorCode = 401;
                    self.emit("invalid", args);
                } else{
                    self.emit("user-doesnt-exist", args);
                }
            }
        });
    };

    var createUser = function(args){
        var newUser = new user(args);
        newUser.save(newUser,function(err,savedUser){
            if(err){
                args.error = 'server error : please try again later'
                args.errorCode = 500
                self.emit('abort',err);
            }else {
                var sendBody = {
                    userId : newUser._id,
                    token : jwt.sign({_id: newUser._id }, config.secrets.session)
                };
                self.emit("user-created", sendBody);
            }
        });
    };

    self.register = function(args, next){
        continueWith = next;
        self.emit("user-received",args);
    };

    //the final call if everything works as expected
    var registrationOk = function(args){
        /*var regResult = new RegResult();
         regResult.success = true;
         regResult.message = "Welcome!";
         regResult.user = app.user;
         regResult.log = app.log;*/
        self.emit("registered", args);
        if(continueWith){
            continueWith(null,args);
        }
    };

    //the final call if anything fails
    var registrationNotOk = function(args){
        /*var regResult = new RegResult();
         regResult.success = false;
         regResult.message = app.message;*/
        self.emit("not-registered", args);
        /*if(continueWith){
            continueWith(null,app);
        }*/
    };

    var abort = function(err){
        console.log('aborting');
        console.log(err);
    }

    //The event chain for a successful registration
    self.on("user-received",validateInputs);
    self.on("validated", checkIfUserExists);
    self.on("user-doesnt-exist",createUser);
    self.on("user-created",registrationOk);

    //the event chain for a non-successful registration
    self.on("invalid",registrationNotOk);
    self.on("abort", abort);
    return self;
};

util.inherits(Register,Emitter);
module.exports = Register;
