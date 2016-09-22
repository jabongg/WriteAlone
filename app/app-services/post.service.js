(function () {
	'use strict';

	angular.module('app').
		factory('PostService' , Service);

	function Service ($http , $q) {
		
		var service = {};

		service.SaveUserPost = saveUserPost;
		service.GetPosts = getPosts;
		service.DeleteUserPost = Delete;
		service.UpdateUserPost = updatePost;

		return service;

		function getPosts(username) {
            return $http.get('/api/posts/' + username).then(handleSuccess, handleError);
        }

		function saveUserPost (post) {
			return $http.post('/api/posts', post).then(handleSuccess, handleError);
		}

		function Delete(_id) {
            return $http.delete('/api/posts/' + _id).then(handleSuccess, handleError);
        }

        function updatePost(postObj){
        	return $http.put('/api/posts/' + postObj.post._id , postObj).then(handleSuccess, handleError);
        }

		//private function
		function handleSuccess (res) {
			return res.data;
		}

		function handleError (res) {
			return $q.reject(res.data);
		}
	}
})();