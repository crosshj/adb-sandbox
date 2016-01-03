/*

https://github.com/openstf/adbkit

also check out:
	http://developer.android.com/tools/help/monkeyrunner_concepts.html

*/

var adb = require('adbkit');
var fs = require('fs');

var client = adb.createClient();

var pngWriteCB = function(){
	console.log('//TODO: find pixels and return location');
};

var findPixels = function(clientId, callback){
	if (!clientId){ return callback('findPixels: No client id specified!'); }
	var screencapCB = function(err, screencap){
		if (err){ return callback(err);	}
		var xLoc = 0;
		var yLoc = 0;
		//console.log(screencap);
		var writeStream = fs.createWriteStream('./screencap.png');
		screencap.pipe(writeStream);
		// fs.writeFile('screencap.png', screencap, function (err) {
		// 	if (err){ return callback(err); };
		// 	pngWriteCB();
		// });
		callback(null, { 
					x: xLoc, 
					y: yLoc  
			});
	};
	client.screencap(clientId, screencapCB);
};

var findPixelsCB = function(err, location){
	if (err){ return console.log(err); }
	console.log(location);
};

var listDevicesCB = function(err, devices){
	if (err){ return console.log(err); }
	if (!devices || devices.length === 0){ 
		return console.log('no devices found');
	}

	//TODO: be fancy, let user choose device
	var clientId = devices[0].id;

	findPixels(clientId, findPixelsCB);
};

client.listDevices(listDevicesCB);

