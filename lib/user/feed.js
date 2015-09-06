/**
 * Created by akshat on 6/9/15.
 */

var Emitter = require("events").EventEmitter;
var util = require("util");
var user = require("../../models/user");
var post = require("../../models/post");
var config = require("../../config/environment/index");

var Feed = function(){
    Emitter.call(this);
    var continueWith = null;
    var self = this;

    var abort = function(err){
        console.log('aborting');
        console.log(err.stack);
    };

    var buildQuery = function(args){
        var query = {};
        console.log('called build query test');
        if(args.user.deleted && args.user.deleted.length){
            query={
                "_id" : {
                    "$nin" : args.user.deleted
                }
            }
        }
        post.find(query)
            .sort({hackerId:-1})
            .lean()
            .exec(function(err, retrievedPosts){
                if(err){
                    self.emit('abort',err);
                    args.error = 'backend Error';
                    args.errorCode = 500;
                    self.emit('invalid',args);
                }else{
                    args.posts = retrievedPosts;
                    console.log('calling markRead');
                    self.emit('markRead', args);
                }
            });
    };

    var markRead = function(args){
        try {
            var readPosts = args.user.read.map(function (element) {
                return element.toString()
            });
            args.posts.forEach(function (element) {
                if (readPosts.indexOf(element._id.toString()) !== -1) {
                    element.read = 1;
                }
            });
            self.emit('feed-retrieved', args.posts);
        }catch(err){
            args.error = 'backend Error';
            args.errorCode = 500;
            self.emit('abort',err);
            self.emit('invalid', args);
        }
    };

    self.feed = function(user, next){
        continueWith = next;
        self.emit('build-query',{user:user});
    };

    var feedOk = function(args){
        //console.log('feed OK');
        self.emit("feed-created", args);
        /*if(continueWith){
            continueWith(null,args);
        }*/
    };
    var feedNotOk = function(args){
        self.emit("feed-not-creatd", args);
        /*if(continueWith){
         continueWith(null,app);
         }*/
    };

    self.on("build-query", buildQuery);
    self.on("abort", abort);
    self.on("markRead", markRead);
    self.on("feed-retrieved", feedOk);
    self.on("invalid", feedNotOk);

    return self;
};


util.inherits(Feed,Emitter);
module.exports = Feed;