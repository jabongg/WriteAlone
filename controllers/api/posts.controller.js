var config = require('config.json');
var express = require('express');
var router = express.Router();
var postService = require('services/post.service');

router.post('/', createPost);
router.get('/:username', getAllPost);
router.put('/:_id', updatePost);
router.delete('/:_id', deletePost);

module.exports = router;

function createPost (req , res) {
	postService.create(req.body)
        .then(function(post) {	
			if(post){	
            	res.send(post);
            }else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getAllPost (req , res) {
	postService.getAll(req.params.username)
        .then(function(posts) {	
			if(posts){	
            	res.json(posts);
            }else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function deletePost(req , res) {
    postService.deletePost(req.params._id)
        .then(function(){
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function updatePost (req , res) {
    var userId = req.user.sub;
    postService.updatePost(userId,req.body)
        .then(function(post){
            if(post){   
                res.send(post);
            }else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}