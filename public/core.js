angular.module('myKalturaApp',[])
	.controller('mainController',function($scope, $http){

		$http.get('/api/media')
			.success(function(data){
				var result = data['result'];
				$scope.videos=result;

			})
			.error(function(error){
				console.error('Error: ',error);
			});

		$http.get('/api/playlist')
			.success(function(data){
				var result = data['result'];
				$scope.playlists=result;
			})
			.error(function(error){
				console.error("Play list error:",error);
			});

		$http.get('/api/rss/playlist')
			.success(function(data){
				var result = data['result'];
				$scope.syndicationfeeds=result;
			})
			.error(function(error){
				console.error("Play list error:",error);
			});

	});
