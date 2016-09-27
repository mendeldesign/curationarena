// JavaScript Document
//code from http://code-maven.com/list-content-of-directory-with-nodejs

var fs = require('./node_modules/fs');
 
if (process.argv.length <= 2) {
    console.log("Usage: " + __filename + " ./public/images/photos-A");
    process.exit(-1);
}
 
var path = process.argv[2];
 
fs.readdir(path, function(err, items) {
    for (var i=0; i<items.length; i++) {
        var file = path + '/' + items[i];
 
        console.log("Start: " + file);
        fs.stat(file, generate_callback(file));
    }
});
 
function generate_callback(file) {
    return function(err, stats) {
            console.log(file);
            console.log(stats["size"]);
        }
};