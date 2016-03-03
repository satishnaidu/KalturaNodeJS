var express = require('express');
var bodyParser = require('body-parser');
var kaltura = require('kaltura');
var morgan = require('morgan');
var methodOverride = require('method-override');
var fs = require('fs');
var parser = require('xml2json');
var Promise = require("bluebird");
var multer = require('multer');

Promise.promisifyAll(fs);

/*var upload = multer({ dest: './uploads/',
	rename: function (fieldname, filename) {
        return filename;
    },
    onFileUploadStart: function(file){
        console.log('file uploading starting...');
    }
});
*/

var storage = multer.diskStorage({ //multers disk storage settings
        destination: function (req, file, cb) {
            cb(null, './uploads/')
        },
        filename: function (req, file, cb) {
            var datetimestamp = Date.now();
            cb(null, file.originalname)
        }
});

 var upload = multer({ //multer settings
                    storage: storage
                });
//var busboy = require('connect-busboy'); 



var app = express();

app.set('port', (process.env.PORT || 5000));

//app.use(upload);

app.use(morgan('dev'));
//app.use(busboy());
app.use(express.static(__dirname + '/public'));
//app.use(express.static(__dirname + '/uploads'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());

var router = express.Router();

 app.use(function(err, req, res, next) {

 		console.log(">>>>>>>>>>>>>>>>>>>");
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
 });

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
	mediaListActionCallStart(res);
});

router.route('/playlist').get(function(req,res){
	playListAction(res);
});

router.route('/rss/playlist').get(function(req,res){
	syndicationFeedAction(res);
});

router.route("/liveStream").get(function(req,res){
	liveStreamService(res);
});

router.route("/metadata/list").get(function(req,res){
	metadataListAction(res);
});

router.route("/metadata/profile").get(function(req,res){
	metadataProfileListAction(res);
});


router.route("/metadata/listfields").get(function(req,res){
	metadataProfileListFieldsAction(res);

})
/*
router.route('/media/upload').post(function(req,res){
	  console.log(req.body);
    console.log(req.files);
    req.pipe(req.busboy);

       req.busboy.on('file', function (fieldname, file, filename) {
            console.log("Uploading: " + file);

           uploadVideoService(res,file);
          
        });
	//uploadVideoService(res);
});

*/

// accept one file where the name of the form field is named photho
app.post('/api/media/upload', upload.single('file'), function (req, res, next) {
	console.log("method invoked");
	console.log(req.body.name);
	res.setHeader('Content-Type', 'application/json');
	//uploadVideoCall(req,res);
	uploadVideoService(res,req.file);
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
})



// Playlist service list action
function playListAction(res){

	client.playlist.listAction(function(data){
		callbackResult(res,data);
	});

}

function mediaListActionCallStart(res){
	console.log("1>>>>>");

	callback(res,callbackResult);
	//var callbackResult = callbackResult(res);
	

}

function finalOutput(data){
	console.log("55>>>>>");
	return data;
}

function callback(res,callbackResult){
		console.log("2>>>>>");

		 
		var mediaListActionRes = medialistAction(res,finalOutput);
		
		callbackResult(res,mediaListActionRes);
}


// Media service list action
function medialistAction(res,finalOutput){

console.log("3>>>>>");
	var filter = new kaltura.vo.KalturaMediaEntryFilter();

	var filterAdvancedSearch = new kaltura.vo.KalturaMetadataSearchItem();
	filterAdvancedSearch.type = kaltura.kc.enums.KalturaSearchOperatorType.SEARCH_OR;
	filterAdvancedSearch.metadataProfileId = 6872562; // calling metadata profile service by profileid.

	var filterAdvancedSearchItemsArray = [];

	var filterAdvancedSearchItems = new kaltura.vo.KalturaSearchCondition();
	filterAdvancedSearchItems.field = "/*[local-name()='metadata']/*[local-name()='Uid']";
	filterAdvancedSearchItems.value = '3';
	filterAdvancedSearchItemsArray.push(filterAdvancedSearchItems);

	filterAdvancedSearch.items = filterAdvancedSearchItemsArray;

	filter.advancedSearch = filterAdvancedSearch;

	var pager = new kaltura.vo.KalturaFilterPager();
	console.log("4>>>>>");
	client.media.listAction(finalOutput,filter,pager);
}




// Syndication feed service list action
function syndicationFeedAction(res){

	client.syndicationFeed.listAction(function(data){
		callbackResult(res,data);
	});
}



function liveStreamService(res){

	var filter = new kaltura.vo.KalturaLiveStreamEntryFilter();
	var pager = new kaltura.vo.KalturaFilterPager();

	client.liveStream.listAction(function(data){

		callbackResult(res,data);

	},filter,pager);

}

function metadataListAction(res){

	var filter = new kaltura.vo.KalturaMetadataFilter();
	filter.objectIdEqual= '0_tqus9ndh';
	var pager = new kaltura.vo.KalturaFilterPager();
	pager.PageSize = 10;
	pager.PageIndex =1;

	client.metadata.listAction(function(data){

		var list = data.objects;
		console.log(list);
		console.log(list.length);
		var options = {
    			sanitize: false
		};
		for(var i=0;i<list.length;i++){

			var metadata = list[i].xml;
			delete list[i].xml;
			//list[i].xml = parser.toJson(metadata);
			list[i].json = parser.toJson(metadata,options);
			
		}
		callbackResult(res,data);
	},filter,pager);
}

function metadataProfileListAction(res){

	var filter = new kaltura.vo.KalturaMetadataFilter();
	var pager = new kaltura.vo.KalturaFilterPager();
	client.metadataProfile.listAction(function(data){
		callbackResult(res,data);
	},filter,pager);
}

function metadataProfileUpdateAction(res){

	var filter = new kaltura.vo.KalturaMetadataFilter();
	var pager = new kaltura.vo.KalturaFilterPager();

	var metadataProfileId = 6872562;

	var xsd = fs.readFileSync('./customdata.xsd');
	client.metadataProfile.updateDefinitionFromFile(function(data){

	},metadataProfileId,xsd);

}

var postListFieldsActionRes = function postListFieldsActionRes(data){
		callbackResult(res,data);
};


function metadataProfileListFieldsAction(res){

	var metadataProfileId = 6872562;

	client.metadataProfile.listFields(postListFieldsActionRes,metadataProfileId);
}



//Kaltura Upload video service
function uploadVideoService(res,fileData){

	console.log("upload service invoked");
	var entry = new kaltura.vo.KalturaMediaEntry();
	entry.name = 'Media entry using AngularJs & NodeJS';
	entry.mediaType = kaltura.kc.enums.KalturaMediaType.VIDEO;

	client.media.add(function(entry){
		//console.log("meida response "+entry);
		//console.log(entry);
		
		var uploadTokenReq = new kaltura.vo.KalturaUploadToken();
		var filePath = __dirname+ '/'+fileData.path;
		uploadTokenReq.fileName = filePath;
		//uploadTokenReq.partnerId = entry.partnerId;
		console.log(uploadTokenReq);
		client.uploadToken.add(function(uploadToken){ 
			console.log(fileData);
			var tokenId = uploadToken.id;
			console.log("uploadToken "+tokenId);	
			//var fileData = null;
			//var fileData = fs.readFileSync('a.mp4');
			console.log("new file data");
			//fs.readFile('a.mp4','utf8', function (err, fileData) {

		
				
				console.log("filePath "+filePath);

				 //var file = fs.readFileSync(filePath);
				// console.log(file);
				// if (err) {
      			//	 return console.error('file error '+err);
  				// }

				client.uploadToken.upload(function(resultToken){

					if (resultToken && resultToken.code && resultToken.message) {
   						 console.log('Kaltura Error', resultToken);
    						return res.send(resultToken.message);
  					} 

				console.log(entry.id);
				console.log("uploaded successfully "+resultToken);
				console.log(resultToken);

				var resource = new kaltura.vo.KalturaUploadedFileTokenResource();

				resource.token = resultToken;
				console.log(resource);
				client.media.addContent(function(entry){

					console.log("content added successfully "+entry);
					callbackResult(res,entry);

				},entry.id,resource);

			},tokenId,filePath);

  				 //console.log("Asynchronous read: " + fileData.toString());
			//});

		},uploadTokenReq);
		//callbackResult(res,data);

	},entry);
}




// common call back result method
function callbackResult(res,data){

		console.log("final response >>>>>");
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
