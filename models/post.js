/**
 * Created by akshat on 5/9/15.
 */


var mongoose = require('mongoose');
var schema = mongoose.Schema;

var postSchema = new schema({
    title : {type : String},
    url: {type : String},
    hackerUrl:{type : String},
    createdOn : {type : Date, default : Date.now()},
    updatedOn : {type : Date, default : Date.now()},
    hackerId : {type : Number, default : 0},
    upvotes : {type : Number, default : 0},
    comments : {type : Number, default : 0}
});

module.exports = mongoose.model('post', postSchema);
