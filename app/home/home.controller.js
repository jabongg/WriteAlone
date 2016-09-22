(function () {
    'use strict';

    angular
        .module('app')
        .filter('likeFilter', Filter);

    angular
        .module('app')
        .controller('Home.IndexController', Controller);

    function Filter(){
        return function (likes){
            //if(value===null || value === "") return likes.length;
            // else{
                angular.forEach(likes,function(item){
                    if(item.username === "daskan"){
                        return item.like;
                    }
                });
                return false;
            // }
        }
    }
    function Controller(UserService,PostService,FlashService,$rootScope,$scope) {
        var vm = this;
        var likes = 0;
        $scope.newPost = $scope.postarea= $scope.comment= '';
        $scope.posts   = [] ;
        $scope.users = [];
        $scope.like = true;

        vm.user = null;
        vm.savePost = savePost;
        vm.clearAll = clearAll;
        vm.loadPosts = loadPosts;

        initController();

        function initController() {
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;                
                loadPosts ();
            });

            UserService.GetAll().then(function(response){
                if(response.length >0){
                    angular.forEach(response,function(item){                        
                        $scope.users.push(item);
                    })
                }
            });         
        }

        function loadPosts () {                         
            $scope.posts = []; 
            PostService.GetPosts(vm.user.username).then(function(response) {  
                if(response.length >0){
                    angular.forEach(response,function(item){                      
                        $scope.posts.unshift(item);
                    })
                }
            })
            .catch(function (error) {
                FlashService.Error(error);
            });
        }

        function savePost(){
            var postObj = {
                username : vm.user.username,
                post : $scope.newPost , 
                lc : [{
                    username : vm.user.username,
                    like : false ,
                    comment : ''
                }]
            }

            // save post of the user
            PostService.SaveUserPost(postObj).then(function(response) {      
                $scope.posts.unshift(response);
                $scope.newPost='';
            })
            .catch(function (error) {
                FlashService.Error(error);
            });
            
        }

        $scope.deletePost = function(post){
            PostService.DeleteUserPost(post._id).then(function(response) { 
                if(response){
                    loadPosts();
                }
            })
            .catch(function (error) {
                FlashService.Error(error);
            });
        }

        $scope.editPost = function(post , comment,action){
            var postObj = {};
            if(action === 'lc'){
                !$scope.like;
                postObj = {
                    action : action ,
                    post : post,
                    lc : {
                        username : vm.user.username,
                        like : $scope.like,
                        comment: comment
                    }
                }
            }
            if(action === 'edit'){
                postObj = {
                    action : action ,
                    post : post
                }
            }            
            PostService.UpdateUserPost(postObj).then(function(response){
                if(response){
                    $scope.post = response;
                }
            })
            .catch(function (error) {
                FlashService.Error(error);
            });
        }

        $scope.follower =function(user){
            UserService.FollowUser(vm.user._id , user).then(function(){
                FlashService.Success('Now Following:'+user.firstName);
            })
            .catch(function (error) {
                FlashService.Error(error);
            });
        }

        $scope.emptyOrNull = function(item){
          return !(item.comment === null || item.comment.trim().length === 0)
        }
        function clearAll () {        
            $scope.newPost = '';         
        }
    }

    


})();