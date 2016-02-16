angular.module('myKalturaApp',[])
	.controller('mainController',function($scope, $http){

		$http.get('/api/media')
			.success(function(data){
				console.log(data);
				$scope.videos=data['objects'];

			})
			.error(function(error){
				console.log('Error: ',error);
			});

		$scope.playVideo = function(){
			alert("Play back videos currently not working on.");
		};

	});
