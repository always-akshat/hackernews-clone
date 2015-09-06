/**
 * Created by akshat on 6/9/15.
 */

var mongoose = require('mongoose');
var schema = mongoose.Schema;
var objectId = schema.ObjectId;
var post = require('./post');
var crypto = require('crypto');

var userSchema = new schema({
    email : {type : String},
    hashedPassword :{type: String},
    salt : {type : String},
    role :{type : String, default :'user', enum :['user','admin']},
    createdOn : {type : Date, default : Date.now()},
    updatedOn : {type : Date, default : Date.now()},
    read : [{type: objectId, ref:'post'}],
    deleted : [{type: objectId, ref:'post'}]
});


//virtuals
userSchema
    .virtual('password')
    .set(function(password) {
        this._password = password;
        this.salt = this.makeSalt();
        this.hashedPassword = this.encryptPassword(password);
    })
    .get(function() {
        return this._password;
    });

userSchema
    .virtual('token')
    .get(function() {
        return {
            '_id': this._id,
            'role': this.role
        };
    });

//methods

userSchema.methods = {

    authenticate: function(plainText) {
        return this.encryptPassword(plainText) === this.hashedPassword;
    },

    makeSalt: function() {
        return crypto.randomBytes(16).toString('base64');
    },

    encryptPassword: function(password) {
        if (!password || !this.salt) return '';
        var salt = new Buffer(this.salt, 'base64');
        return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
    }
};





module.exports = mongoose.model('user', userSchema);
