$.getScript("http://requirejs.org/docs/release/2.2.0/minified/require.js", function(){

  var 	fs = require(['fs'], function (){
   console.log("Script loaded");
	
	function processImageDir(path, outFilename, cb) {
		fs.readdir(path, function(err, files) {
	
			var imgfiles = [];
	
			// Check for images and push on the array if it's a match.
			files.forEach(function(name) {
				name.substr(-4).match(/(png|jpeg|jpg|gif)/) && imgfiles.push(name)
			});
	
			fs.writeFile(__dirname + '/' + outFilename, JSON.stringify({
				images: imgfiles
			}), function(err) {
				if (err) throw err;
				cb && cb("Sweet.");
			});
	
		});
	}
	
	processImageDir('./images/photos_A', "preload-images.json", function(message) {
		console.log(message);
	});
   });
});

/* 
//http://nodeexamples.com/2012/09/28/getting-a-directory-listing-using-the-fs-module-in-node-js/

	//#!/usr/bin/env node
	
	var fs = require("fs"),
		path = require("path");
	
	var p = "../"
	fs.readdir(p, function (err, files) {
		if (err) {
			throw err;
		}
	
		files.map(function (file) {
			return path.join(p, file);
		}).filter(function (file) {
			return fs.statSync(file).isFile();
		}).forEach(function (file) {
			console.log("%s (%s)", file, path.extname(file));
		});
	});

});*/