/*

https://github.com/openstf/adbkit

also check out:
	http://developer.android.com/tools/help/monkeyrunner_concepts.html

*/
var monkeyPort = 8081;
var monkeyClient;
var clientId = 0;

var adb = require('adbkit');
var monkey = require('adbkit-monkey');
var testClient;

var fs = require('fs');
var gm = require('gm').subClass({imageMagick: true});

var client = adb.createClient();

var pngWriteCB = function(callback){
	gm('./screencap.png')
		.rotate('black', '<90')
		.write('./screencap.png', function(err){
			if (err){ return callback('gm.rotate: ' + err); }
			var xLoc = 0;
			var yLoc = 0;
			console.log('//TODO: find pixels and return location');
			callback(null, { 
						x: xLoc, 
						y: yLoc  
			});
		});			
};

var findPixels = function(clientId, callback){
	if (!clientId){ return callback('findPixels: No client id specified!'); }
	var screencapCB = function(err, screencap){
		if (err){ return callback(err);	}

		//console.log(screencap);
		var writeStream = fs.createWriteStream('./screencap.png');
		
		writeStream.on('finish', function() {
			pngWriteCB(callback); 
		});

		screencap.pipe(writeStream);
	};
	client.screencap(clientId, screencapCB);
};

var findPixelsCB = function(err, location){
	if (err){ return console.log(err); }
	console.log(location);
};

var startActivityCB = function(err){
	if (err){ return console.log(err); }
}

var startActivity = function(){
	var options = {
		wait: true,
		component: 'com.ea.game.dungeonkeeper_na/com.ea.game.dungeonkeeper.DKActivity'
	};
	client.startActivity(clientId, options, startActivityCB);
};

var openMonkeyCB = function(err, monkey){
	if (err){ return console.log(err); }
	
	console.log('monkey sleep START');
	monkey.multi()
		.sleep(15000, function(err){
			if (err){ return console.log(err); }
			console.log('monkey sleep END');
			findPixels(clientId, findPixelsCB);
			monkey.end();
		});
	// monkey.multi()
	// 	.touchDown(100, 0)
	// 	.sleep(5)
	// 	.touchMove(100, 20)
	// 	.sleep(5)
	// 	.touchMove(100, 40)
	// 	.sleep(5)
	// 	.touchMove(100, 60)
	// 	.sleep(5)
	// 	.touchMove(100, 80)
	// 	.sleep(5)
	// 	.touchMove(100, 100)
	// 	.sleep(5)
	// 	.touchUp(100, 100)
	// 	.sleep(5)
	// 	.execute(function(err) {
	// 	//assert.ifError(err);
	// 	console.log('Dragged out the notification bar');

	// 	monkey.end();
	// });
};

var listDevicesCB = function(err, devices){
	if (err){ return console.log(err); }
	if (!devices || devices.length === 0){ 
		return console.log('no devices found');
	}

	//TODO: be fancy, let user choose device
	clientId = devices[0].id;

	client.openMonkey(clientId, monkeyPort, openMonkeyCB);
	//monkeyClient = monkey.connect({ port: monkeyPort });
	startActivity();
	//openMonkeyCB(null, monkeyClient);
};

client.listDevices(listDevicesCB);

