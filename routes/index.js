
var config = require('../config/environment');

module.exports = function(app) {

    app.use(function(req,res,next){
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
    });

    app.use('/auth', require('../lib/auth'));
    app.use('/api/v1/user',require('./users'));

    app.route('/:url(api|components|app|bower_components|assets)/*')
        .get(function(){
            console.log('nothing hear');
        });
    console.log(app.get('appPath'));


    app.route('/login')
        .get(function(req, res) {
            //res.sendFile(app.get('appPath') + '/login.html');
            var options = {
                root: app.get('appPath'),
                dotfiles: 'deny',
                headers: {
                    'x-timestamp': Date.now(),
                    'x-sent': true
                }
            };


            var fileName = 'login.html';
            res.sendFile(fileName, options, function (err) {
                if (err) {
                    console.log(err);
                    res.status(err.status).end();
                }
                else {
                    console.log('Sent:', fileName);
                }
            });

        });

    app.route('/feed')
        .get(function(req, res) {
            //res.sendFile(app.get('appPath') + '/login.html');
            var options = {
                root: app.get('appPath'),
                dotfiles: 'deny',
                headers: {
                    'x-timestamp': Date.now(),
                    'x-sent': true
                }
            };
            var fileName = 'feed.html';
            res.sendFile(fileName, options, function (err) {
                if (err) {
                    res.status(err.status).end();
                }
                else {
                    console.log('Sent:', fileName);
                }
            });

        });

    app.route('/*')
        .get(function(req, res) {
            var options = {
                root: app.get('appPath'),
                dotfiles: 'deny',
                headers: {
                    'x-timestamp': Date.now(),
                    'x-sent': true
                }
            };
            var fileName = 'login.html';
            res.sendFile(fileName, options, function (err) {
                if (err) {
                    res.status(err.status).end();
                }
                else {
                    console.log('Sent:', fileName);
                }
            });
        });
};