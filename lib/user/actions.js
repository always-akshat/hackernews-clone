/**
 * Created by akshat on 6/9/15.
 */

var Emitter = require("events").EventEmitter;
var util = require("util");
var user = require("../../models/user");
var post = require("../../models/post");
var config = require("../../config/environment/index");
var mongoose = require('mongoose');

var Actions = function(){
    Emitter.call(this);
    var continueWith = null;
    var self = this;

    var abort = function(err){
        console.log('aborting');
        console.log(err.stack);
    };

    self.read = function(args, next){
        try {
            var query = {}, update = {};
            query = {
                _id: mongoose.Types.ObjectId(args.userId)
            };
            update = {
                "$push": {
                    read: mongoose.Types.ObjectId(args.postId)
                }
            }
        }
        catch(err){
            args.error = 'Backend Error. Please try again later';
            args.errorCode = 500;
            self.emit('abort',err);
            self.emit('action-failed',args);
        }
        user.update(query, update)
            .exec(function(err, updatedRows){
                if(err){
                    args.error = 'Backend Error. Please try again later';
                    args.errorCode =500;
                    self.emit('abort',err);
                    self.emit('action-failed',err);
                }else{
                    self.emit('action-done', args);
                }
            });
    };
    self.deleted = function(args, next){
        try {
            var query = {}, update = {};
            query = {
                _id: mongoose.Types.ObjectId(args.userId)
            };
            update = {
                "$push": {
                    deleted: mongoose.Types.ObjectId(args.postId)
                }
            }
        }
        catch(err){
            args.error = 'Backend Error. Please try again later';
            args.errorCode = 500;
            self.emit('abort',err);
            self.emit('action-failed',args);
        }
        user.update(query, update)
            .exec(function(err, updatedRows){
                if(err){
                    args.error = 'Backend Error. Please try again later';
                    args.errorCode =500;
                    self.emit('abort',err);
                    self.emit('action-failed',err);
                }else{
                    self.emit('action-done', args);
                }
            });
    };
    self.retrieve = function(args, next){
        try {
            var query = {
                _id: mongoose.Types.ObjectId(args.userId)
            };
        }
        catch(err){
            args.error = 'Backend Error. Please try again later';
            args.errorCode = 500;
            self.emit('abort',err);
            self.emit('action-failed',args);
        }
        user.findOne(query)
            .exec(function(err, retrievedUser){
                if(err){
                    args.error = 'Backend Error. Please try again later';
                    args.errorCode =500;
                    self.emit('abort',err);
                    self.emit('action-failed',err);
                }else{
                    self.emit('action-done', retrievedUser);
                }
            });
    };

    var actionFailed = function(args){
        self.emit('failed',args);
    };

    var actionDone = function(args){
        self.emit('succeeded',args);
    };



    self.on('action-failed', actionFailed);
    self.on('action-done', actionDone);
    self.on('abort',abort);


    return self;

}


util.inherits(Actions,Emitter);
module.exports = Actions;