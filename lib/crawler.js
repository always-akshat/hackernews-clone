/**
 * Created by akshat on 5/9/15.
 */

var cheerio = require("cheerio");
var request = require("request");
var Emitter = require("events").EventEmitter;
var util = require("util");
var post = require("../models/post");
var async = require("async");


var Crawler = function(){
    Emitter.call(this);
    var self = this;

    self.crawlHN = function(args) {
        var pages = args.pages || 3,
            hnURL = args.url || "https://news.ycombinator.com/?p=",
            asyncTasks = [];


        for(var pageCounter =1 ; pageCounter <= pages; pageCounter++) {
            (function (page) {
                asyncTasks.push(function (cb) {
                    var reqURL = hnURL+ page;
                    request(reqURL, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            var $ = cheerio.load(body),
                                newsItems = $(".athing");
                            for (var newsPost in newsItems) {
                                if (newsItems.hasOwnProperty(newsPost) && isNaN(parseInt(newsPost)) === false) {
                                    try {
                                        var line1, line2, link = '', title = '', site, comments = 0, hackerUrl = '', hackerId = 0, upvotes = 0, post = {};
                                        line1 = ($(newsItems[newsPost]).find($('.title'))['1']['children']);  // a tag
                                        line2 = $(newsItems[newsPost]).next().children()['1']['children'];
                                        link = line1['1'].attribs.href;
                                        title = line1['1']['children'][0]['data'];
                                        if (line1 && line1['1']['next'] && line1['1']['next']['children']) {
                                            site = line1['1']['next']['children'][0]['data'];
                                            site = site.substring(site.lastIndexOf("(") + 1, site.lastIndexOf(")"));
                                        } else {
                                            site = 'https://news.ycombinator.com';
                                        }

                                        if (line2[1] && line2[1]['children']) {
                                            upvotes = parseInt((line2[1]['children'][0]['data']).split(" ")[0]);
                                            upvotes = isNaN(upvotes) === false ? upvotes : 0 ;
                                        } else {
                                            upvotes = 0;
                                        }

                                        if (line2[5] && line2[5]['attribs']) {
                                            hackerUrl = line2[5]['attribs']['href'];
                                            hackerId = parseInt(hackerUrl.split("id=")[1]);
                                        }

                                        if (line2[7] && line2[7]['children']) {
                                            comments = parseInt((line2[7]['children'][0]['data']).split(" ")[0]);
                                            comments = isNaN(comments ) === false ? comments : 0 ;
                                        }

                                        post = {
                                            link: link,
                                            title: title,
                                            site: site,
                                            upvotes: upvotes,
                                            hackerUrl: hackerUrl,
                                            comments: comments,
                                            hackerId: hackerId
                                        };

                                        self.emit('postExistsCheck', post);
                                    } catch (err) {
                                        return cb(err);
                                    }
                                }
                            }
                            pageCounter += 1;
                            return cb(null, 1);
                        } else {
                            return cb('couldnt scrap');
                        }
                    });
                });
            })(pageCounter);
        }
        //console.log(asyncTasks);


        async.series(asyncTasks, function(err, results){
            if(err){
                console.log(err);
                self.emit('abort',err);
                self.emit('failed',{error:err, errorCode:500});
            }else{
                self.emit('done');
            }
        })

    };

    var postExistsCheck = function(args){
        //console.log(args);
        //console.log(args);
        if(args && args.hackerId){
            post.findOne({hackerId: args.hackerId})
                .exec(function(err, savedPost){
                    if(err){
                        self.emit('abort',err)
                    }else{
                        if(savedPost){
                            //TODO : check for change in comments, votes
                            self.emit('updatePost', args);
                        }else{
                            self.emit('addPost', args);
                        }
                    }
                });
        }
    };

    var updatePost = function(args){
        post.update({hackerId : args.hackerId},{comments : args.comments, votes : args.votes})
            .exec(function(err, updatedDocs){
                if(err){
                    self.emit('abort',err);
                }
            })
    };

    var addPost = function(args){
        var newPost = new post(args);
        newPost.save(function(err, savedPost){
            if(err){
                self.emit('abort', err);
            }
        });
    };

    var abort = function(err){
        console.log(err);
        //process.exit(0);
    };

    self.on('updatePost', updatePost);
    self.on('addPost', addPost);
    self.on('abort', abort);
    self.on('postExistsCheck', postExistsCheck);

    return self;
};

util.inherits(Crawler,Emitter);
module.exports = Crawler;