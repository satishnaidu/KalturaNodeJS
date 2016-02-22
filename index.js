var express = require('express');
var bodyParser = require('body-parser');
var kaltura = require('kaltura');
var morgan = require('morgan');
var methodOverride = require('method-override');


var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(morgan('dev'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());

var router = express.Router();


var client = init_client();

// Preaparing client session;
function init_client() {
	console.log('Initializing client');
	var config = kaltura.config;
	var clientConfig = new kaltura.kc.KalturaConfiguration(config.partner_id);
	client = new kaltura.kc.KalturaClient(clientConfig);
	var type = kaltura.kc.enums.KalturaSessionType.ADMIN;

	clientConfig.serviceUrl = config.service_url;

	var expiry = null;
	var privileges = null;
	var ks = client.session.start(function(ks) {
	    	console.log("in call back first");
	    	client.setKs(ks);
		    console.log(ks);
		   },config.admin_secret , config.user_Id, type, config.partner_id, expiry, privileges);
	
	return client;
}



// middleware to use for all requests
router.use(function(req, res, next) {
   console.log('Do some validation/logging for each request.');
    next(); // make sure we go to the next routes and don't stop here
});


router.get('/', function(req, res) {
    res.sendfile('./public/index.html');   
});


 
// All route handlers for each service
router.route('/media').get(function(req,res){
	medialistAction(res);
});

router.route('/playlist').get(function(req,res){
	playListAction(res);
});

router.route('/rss/playlist').get(function(req,res){
	syndicationFeedAction(res);
});


// Playlist service list action
function playListAction(res){

	client.playlist.listAction(function(data){
		callbackResult(res,data);
	});

}

// Media service list action
function medialistAction(res){
	client.media.listAction(function(data) {
		
		callbackResult(res,data);
		 
	});
}

// Syndication feed service list action
function syndicationFeedAction(res){

	client.syndicationFeed.listAction(function(data){
		callbackResult(res,data);
	});
}

// common call back result method
function callbackResult(res,data){

	//Preparing error if any error case
	//var error = prepareError();
	//var result = responseWrapper(data,error);

	var result = responseWrapper(data);

	return res.json(result);
	
}

// Wrapper class around original data, to include error messages also
function responseWrapper(data,error){

	var result ={};
	if(error){
		result['error'] = error;
	}
	if(data){
		result['result'] = data;
	}

	return result;
}

// Preparing error object
function prepareError(){

	var error ={};
	error['error_code'] = 500;
	error['error_message'] = 'Internal server error in application';
	error['error_type'] = 'Service Error';

	return error;
}


app.use('/api',router);

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
