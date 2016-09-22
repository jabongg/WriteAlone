var config = require('config.json');
var mongod = require('mongodb');
var monk   = require('monk');
var _ = require('lodash');
var Q = require('q');
var db 	   = monk(config.connectionString);
var postsDb = db.get('posts');
var usersDb = db.get('users');
var userService = require('services/user.service');

var service = {};

service.create = create;
service.getAll = getAll;
service.deletePost = _delete;
service.updatePost = update;

module.exports = service ;

function create (req) {	
    var deferred = Q.defer();
    postsDb.insert(req,function (err,post) {
    	if(err) deferred.reject(err);
    	deferred.resolve(post);
        usersDb.update(
            {username: req.username},
            {$push:post._id},
            function (err){
                if(err) deferred.reject(err);
                deferred.resolve();
            });
    });
	return deferred.promise;
}

function getAll(req) {    
    var deferred = Q.defer();
    usersDb.find({"username":req},function(err,post){
            if(err) deferred.reject(err);
            if(post[0].follows){
                var usernameArray = [];
                for(var item=0; item < post[0].follows.length; item++){
                    usernameArray.push(post[0].follows[item]);
                }
                usernameArray.push(req);
            }
        postsDb.find({"username":{$in:usernameArray }}, function (err,post){

            if(err) deferred.reject(err);

            deferred.resolve(post);
        });
    });
    return deferred.promise;
}

function _delete(_id) {
    var deferred = Q.defer();
    postsDb.remove({_id:_id}, function (err){

        if(err) deferred.reject(err);

        deferred.resolve();
    });
    return deferred.promise;
}

function update (_id, reqParams) {
    var deferred = Q.defer();
    var id = reqParams.post._id;

    if(reqParams.action === 'post'){
        postsDb.findById(_id, function (err, post) {
            if (err) deferred.reject(err);

            if (post.username !== reqParams.post.username) {
                deferred.reject('You can only update your own account');
            }
            else{
                postsDb.findAndModify(
                    {_id:id}, 
                    {$set : {post: reqParams.post.post}},function (err , post){

                    if(err) deferred.reject(err);

                    deferred.resolve(post);
                });
            }
        });
    }
    if (reqParams.action === 'lc') {
        
        postsDb.findAndModify(
            {_id: id, "lc": {$elemMatch: {"username": reqParams.lc.username }}},
            {$pull: { "lc": {"username": reqParams.lc.username }}},
            function (err , post){
                if(err) deferred.reject(err);
                else{
                    postsDb.findAndModify(
                    {_id: id},
                    {$push: { lc : reqParams.lc}},
                    function(err , post){
                        if(err) deferred.reject(err);
                        deferred.resolve(post);
                    });
                }
        });
    };

    return deferred.promise;
}