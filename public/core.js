var app = angular.module('myKalturaApp',['ngFileUpload']);

	app.controller('mainController',['$scope', 'Upload','$timeout','$http',function($scope, Upload,$timeout,$http){

		// upload later on form submit or something similar 
 	   $scope.submit = function() {
     		
       	 	$scope.upload($scope.file);
    	};

		// upload on file select or drop 
    	$scope.upload = function (file) {

    	console.log("file name is: ");
    	console.log(file);
       	Upload.upload({
            url: '/api/media/upload',
            data: {file: file}
        }).then(function (resp) {
            console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
        }, function (resp) {
            console.log('Error status: ' + resp.status);
        }, function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
        });
    	};

		/*$http.get('/api/media')
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
		*/

		$http.get('/api/liveStream')
			.success(function(data){
				var result = data['result'];
				$scope.liveStreams = result;
			})
			.error(function(error){
				console.error("liveStream error",error);
			})

	}]);
