// JavaScript Document
//http://code-maven.com/list-content-of-directory-with-nodejs

var fs = require('./node_modules/fs');
 
 
if (process.argv.length <= 2) {
    console.log("Usage: " + __filename + "./public/images/photos-A");
    process.exit(-1);
}
 
var path = process.argv[2];
 
fs.readdir(path, function(err, items) {
    console.log(items);
 
    for (var i=0; i<items.length; i++) {
        console.log(items[i]);
    }
});
 