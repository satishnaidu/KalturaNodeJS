var express = require('express');
var bodyParser = require('body-parser');
var kaltura = require('kaltura');
var config = require ('./config.js');
var morgan = require('morgan');
var methodOverride = require('method-override');


var app = express();



app.use(morgan('dev'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());

var router = express.Router();


var client = init_client();


function init_client() {
	console.log('Initializing client');
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
		   },config.secret , config.user_Id, null, config.partner_id, expiry, privileges);
	
	return client;
}



// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Do some validation/logging for each request.');
    next(); // make sure we go to the next routes and don't stop here
});


router.get('/', function(req, res) {
    //res.json({ Hai: 'Your api is up, narrow down your path for proceed further!' }); 
    res.sendfile('./public/index.html');   
});


 

router.route('/media').get(function(req,res){
	listActionCall(res);
});

function listActionCall(res){
	client.media.listAction(function(data) {
		
		res.send(data);
		 
	});
}


app.use('/api',router);
app.listen(5000);
console.log("listening on port: 5000");
