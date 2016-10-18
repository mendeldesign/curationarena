/**
 * Created by jmunoza on 28/09/16.
 */

var fs = require("fs");

var logger = require('../utils/logFactory').getLogger();
var imageService = {};
var storedImages = [];

var pathMendel = "./images/photos_A";
var pathJesus= "/Users/jmunoza/odrive/Dropbox/Curation\ " +
  "Prototype/curationarena/public/images/photos_A";
  var pathTest = pathMendel<

/**
 *
 * @param userId
 * @param filePath the path including the file name: /pathtofile/image.jpeg
 * @param fileName
 * @param exifData
 * @param callback
 * @returns {*}
 */
var imageSchema = function imageSchema(userId, filePath, fileName, exifData, url, callback) {
  var image = this;
  image.userId = userId;
  image.filePath = filePath;
  image.fileName = fileName;
  image.url = url || "/files/images/" + image.fileName;
  image.exif = exifData || {};

  if(callback)
    return callback(null,image);
};

//static methods
/**
 * Load images from a specific path into an array
 * @param userId
 * @param path
 * @param cb
 */
imageService.processImageFromDir = function processImageFromDir(userId, path, cb) {
  var images = [];
  var fs = require("fs");
  fs.readdir(path, function(err, files) {
    // Check for images and push on the array if it's a match.
    files.some(function(name){
        name.substr(-4).match(/(png|jpeg|jpg|gif)/) && images.push(new imageSchema(userId, path + '/' + name, name));
      }
    );
    if(err)
      return cb(err);
    else return cb(null,images);
  });
};

imageService.loadExifData = function loadExifData (images, cb){

  //done in series because it calls exiftool via shell command and has to be
  // exif tool: http://www.sno.phy.queensu.ca/~phil/exiftool/
  // done in series.
  var everySeries = require('async').everySeries;
  everySeries(images, function(image, cb1) {
    //get exif
    /**
     * https://github.com/tj/node-exif
     */
    var exif2 = require('exif2');
    exif2(image.filePath, function(err, exifData){
      if (!err) {
        //morgan.verbose('exif data loaded successfully:' + image.filePath);
        image.exif = exifData;
        cb1(null, true);
      }
      else {
        logger.error('Problem while reading exif data from file: ' + image.filePath, err);
        cb1(err);
      }
    });
  }, function(err, result){
    if(err) return cb(err);
    else return cb(null,images);
  });
};


imageService.getImages = function getImages(path,cb) {
  var context = this;
  context.processImageFromDir("UserA",pathTest, function(err, images){
    if(!err) {
      context.loadExifData(images, function(err, images){
        storedImages = storedImages.concat(images);
        cb(null, storedImages);
      });

    } else cb(err)
  });
};

/**TODO fix image lookup through USER_ID, URL and Path */
imageService.getImage = function getImage(url, cb) {
  var img = {};
  logger.debug("Looking for image at URL: " + url);
  var async = require('async');
  async.waterfall([
    function findImage(url, cb) {
      var foundImg = null;
      storedImages.some(function(image) {
        if(url == image.url) {
          logger.debug("URL correct");
          foundImg = image;
          return true;
        };
      });
      if(foundImg) cb(null, foundImg);
      var err = new Error('Not Found');
      err.status = 404;
      cb(err);
    },
    function readFile(image, cb) {
      logger.debug(image);
      var fs = require("fs");
      fs.readFile(image.filePath + "/" + image.fileName, function(err, data) {
        if (err) cb(err); // Fail if the file can't be read.
        cb(null, data);
      });
    }
  ], function(err, data){

  });

};


module.exports = imageService;