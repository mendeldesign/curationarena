/**
 * Created by jmunoza on 28/09/16.
 */
var logger = require('../utils/logFactory').getLogger();
var imageService = {};

/**
 * USB drives are in var '/Volumes/USB_NAME/folder;
 * @type {string}
 */
//var pathUserA = "/Users/jmunoza/odrive/Dropbox/Curation\ " +
//  "Prototype/curationarena/public/images/photos_A";
//var pathUserB= "/Users/jmunoza/odrive/Dropbox/Curation\ " +
//  "Prototype/curationarena/public/images/photos_B";
var pathUserA = "/Users/Mendel/Desktop/photos_A";
var pathUserB = "/Users/Mendel/Desktop/photos_A-2";

var userFiles = [
  {
    userId : 'user_A',
    path: pathUserA,
    json: []
  },
  {
    userId : 'user_B',
    path: pathUserB,
    json: []
  }
];

/**
 *
 * @param userId
 * @param fileWithPath
 * @param fileName
 * @param directory
 * @param url
 * @param callback
 * @returns {*}
 *
 *  Example.
 *  It returns an object with the following structure:
 *     {
 *        "user":"UserA",
 *        "path":"./images/photos_A/P1010342.JPG",
 *        "directory": "./images/photos_A/",
 *        "name":"P1010342.JPG",
 *        "url":"/files/images/P1010342.JPG",
 *        "orientation": "1",
 *        "rotation": "Rotate 90 CW",
 *        "width": "2048",
 *        "height": "1360",
 *        "original_time": "2007:12:25 17:42:40",
 *        "creation_time": "2007:12:25 17:42:40",
 *        "modified_time": "2016:10:17 17:41:04+02:00",
 *        "access_time": "2016:10:17 17:41:04+02:00",
 *        "file_type_extension":"jpg",
 *        "mime_type":"image/jpeg",
 *        "icon" : "image",
 *        "bytes" : "2048",
 *        "size"  : "2048 bytes"
 *     }
 *
 */
var imageSchema = function imageSchema(userId, fileWithPath, fileName, directory, url, callback) {
  var image = this;
  image.user = userId;
  image.path = fileWithPath;
  image.name = fileName;
  image.directory = directory;
  image.url = url || "/files/" + userId + "/images/" + encodeURIComponent(fileWithPath);
  image.orientation;
  image.rotation;
  image.width;
  image.height;
  image.original_time;
  image.creation_time;
  image.modified_time;
  image.access_time;
  image.file_type;
  image.mime_type;
  image.icon = 'image';
  image.bytes;
  image.size;

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
  logger.verbose('[imageService.processImageFromDir] Loading images, path: ' + path);
  fs.readdir(path, function(err, files) {
    var filePath = path;
    if(filePath.indexOf('/', filePath.length - 1) == -1) filePath += '/';
    // Check for images and push on the array if it's a match.
    files.some(function(name){
      name.substr(-4).match(/(png|jpeg|jpg|gif|JPG|JPEG|PNG|GIF)/) && images.push(new imageSchema(userId, filePath+name, name, filePath));
    });
    if(err) return cb(err);
    else return cb(null,images);
  });
};

imageService.loadExifData = function loadExifData (images, cb){

  var context = this;
  var imagesWithExif = [];
  const THUMBNAIL_DIRECTORY = 'THUMBNAILS/';
  const THUMBNAIL_NAME = 'thumbnail_';

  //function to check that the folder exists
  var prepareNewPath = function prepareNewPath(newPath, cb0){
    var fs = require("fs");
    fs.access(newPath, function(err) {
      if(err) {
        fs.mkdir(newPath, function (err){
          if(err) cb0(err);
          else cb0(null);
        });
      }
      else cb0(null);
    });
  };


  var newPath = images[0].directory + THUMBNAIL_DIRECTORY;
  prepareNewPath(newPath, function(err){
    if(err){
      return cb(err);
    }
    else {
      /**
       * get exif
       * https://github.com/tj/node-exif
       * done in series because it calls exiftool via shell command and has to be
       * exif tool: http://www.sno.phy.queensu.ca/~phil/exiftool/
       */
      var exiftool = require('exif2');
      // done in series.
      var everySeries = require('async').everySeries;
      everySeries(images, function(image, cb1) {
        exiftool(image.path, function(err, exifMetadata){
          if (!err) {
            //logger.verbose('exif data loaded successfully: ' + image.path);
            /**
             *
             * 1 = Horizontal (normal)
             * 2 = Mirror horizontal
             * 3 = Rotate 180
             * 4 = Mirror vertical
             * 5 = Mirror horizontal and rotate 270 CW
             * 6 = Rotate 90 CW
             * 7 = Mirror horizontal and rotate 90 CW
             * 8 = Rotate 270 CW
             *
             */
            image.orientation = exifMetadata['orientation'];
            var rotation = exifMetadata['rotation'] || exifMetadata['orientation'] || '1';
            switch(rotation){
              case '1':
              case 'Horizontal (normal)':
                image.rotation = { index: '1', description: 'Horizontal (normal)'};
                break;
              case '2':
              case 'Mirror horizontal':
                image.rotation = { index: '2', description: 'Mirror horizontal'};
                break;
              case '3':
              case 'Rotate 180':
                image.rotation = { index: '3', description: 'Rotate 180'};
                break;
              case '4':
              case 'Mirror vertical':
                image.rotation = { index: '4', description: 'Mirror vertical'};
                break;
              case '5':
              case 'Mirror horizontal and rotate 270 CW':
                image.rotation = { index: '5', description: 'Mirror horizontal' +
                ' and rotate 270 CW'};
                break;
              case '6':
              case 'Rotate 90 CW':
                image.rotation = { index: '6', description: 'Rotate 90 CW'};
                break;
              case '7':
              case 'Mirror horizontal and rotate 90 CW':
                image.rotation = { index: '7', description: 'Mirror horizontal' +
                ' and rotate 90 CW'};
                break;
              case '8':
              case 'Rotate 270 CW':
                image.rotation = { index: '8', description: 'Rotate 270 CW'};
                break;
              default:
                image.rotation = { index: '1', description: 'Horizontal (normal)'};
                break;
            }
            image.width = exifMetadata['image width'];
            image.height = exifMetadata['image height'];
            /**
             * convert exifDate to normal date
             * https://github.com/briangershon/exif-date-to-iso
             */
            var moment = require('moment-timezone');
            var timeZone = moment.tz.guess();
            const exifDate = require('exif-date-to-iso');
            image.original_time = exifDate.toISO(exifMetadata['date time original'], timeZone);
            image.creation_time = exifDate.toISO(exifMetadata['create date'], timeZone);
            image.modified_time = exifDate.toISO(exifMetadata['modify date'], timeZone);
            image.access_time = exifDate.toISO(exifMetadata['file access date time'], timeZone);
            image.file_type = exifMetadata['file type extension'];
            image.mime_type = exifMetadata['mime type'];
            image.bytes = exifMetadata['file size'];
            image.size = exifMetadata['file size'];

            //create thumbnail
            const THUMBNAIL_HEIGHT = 498;
            var thumbnailPath = image.directory + THUMBNAIL_DIRECTORY + THUMBNAIL_NAME + image.name;
            context.createThumbnailFromFile(image.path, thumbnailPath, 0,THUMBNAIL_HEIGHT, 'center', 'middle', function(err, newPathToFile) {
              if(err) {
                logger.error(err);
                cb1(null, true); // to continue with other files
              }
              else {
                image.thumbnail_url = "/files/" + image.user + "/images/" + encodeURIComponent(newPathToFile);
                image.thumbnail_path = newPathToFile;
                imagesWithExif.push(image);
                cb1(null, true);
              }
            });
          }
          else {
            logger.error('Problem while reading exif data from file: ' + image.path, err);
            cb1(null, true); // to continue reading exifdata of other files
          }
        });
      }, function(err, result){
        if(err) return cb(err);
        else return cb(null,imagesWithExif);
      });
    }
  });
};

imageService.getImagesForUser = function getImagesForUser(userId,cb) {
  /*
   * TODO get path for user from DB
   */
  logger.debug(userId);
  userFiles.forEach(function (user){
    if(user.userId == userId) return cb(null,user.json);

  });

};

imageService.loadImagesOnStart = function loadImagesOnStart(cb){
  var context = this;
  userFiles.forEach(function (user){
    context.loadImagesForUser(user.userId, user.path, function(err, images){
      if(!err) {
        logger.debug('Photos for user:' + user.userId + ' loaded successfully');
        user.json = user.json.concat(images);
        cb(null);
      }
      else cb(err);
    });
  });
};

imageService.loadImagesForUser = function loadImagesForUser(user, path, cb) {
  var context = this;
  context.processImageFromDir(user,path, function(err, images){
    if(!err) {
      context.loadExifData(images, function(err, images){
        //storedImages = storedImages.concat(images);
        images = images.sort(function(a,b){
          if(a.original_time < b.original_time) return -1;
          else return 1;
        });
        /*
         * TODO save everything in DB
         */
        cb(null, images);
      });

    } else cb(err)
  });
};

/**TODO fix image lookup through USER_ID, URL and Path */
imageService.getImage = function getImage(user, url, cb) {
  var pathToFile = url;
  cb(null, pathToFile);
};

/**
 * Original code taken from https://github.com/chrisben/image-thumb
 * @param pathToFile
 * @param targetWidth
 * @param targetHeight
 * @param horizontalAlign
 * @param verticalAlign
 * @param callback
 */
imageService.createThumbnailFromFile = function createThumbnailFromFile (pathToFile, pathToNewFile, targetWidth, targetHeight, horizontalAlign, verticalAlign, callback) {

  if (targetHeight === 0 && targetWidth === 0) {
    throw 'At least one of width or height needs to be set';
  }

  logger.verbose('[' + pathToFile + '] -> ' + targetWidth + 'x' + targetHeight);

  /**
   * Uses EyalAr/lwip : a Light-weight image processor for NodeJS
   * https://github.com/EyalAr/lwip
   * @type {*}
   */
  var lwip = require('lwip');
  lwip.open(pathToFile, function (err, image) {
    if (err || !image) {
      return cb(err);
    }

    var origWidth = image.width(),
      origHeight = image.height(),
      origRatio = (origHeight !== 0 ? (origWidth / origHeight) : 1),
      cropWidth = origWidth,
      cropHeight = origHeight,
      targetRatio = ((targetHeight !== 0 && targetWidth !== 0) ? (targetWidth / targetHeight) : origRatio);

    if (targetWidth === 0) {
      targetWidth = Math.round(targetHeight * targetRatio);
    } if (targetHeight === 0) {
      targetHeight = Math.round(targetWidth / targetRatio);
    }

    logger.verbose('Original: ' + origWidth + 'x' + origHeight + ' ->' +
      ' Target: ' + targetWidth + 'x' + targetHeight);

    if (targetRatio > origRatio) {
      // original image too high
      cropHeight = Math.round(origWidth / targetRatio);
    } else if (targetRatio < origRatio) {
      // original image too wide
      cropWidth = Math.round(origHeight * targetRatio);
    }

    // These are coordinates starting from 0
    var left, right, top, bottom;

    if (horizontalAlign == 'left') {
      left = 0;
      right = cropWidth - 1;
    } else if (horizontalAlign == 'right') {
      left = origWidth - cropWidth;
      right = origWidth - 1;
    } else {
      // default: center
      left = Math.round((origWidth - cropWidth)/2);
      right = left + cropWidth - 1;
    }

    if (verticalAlign == 'top') {
      top = 0;
      bottom = cropHeight - 1;
    } else if (verticalAlign == 'bottom') {
      top = origHeight - cropHeight;
      bottom = origHeight - 1;
    } else {
      // default: middle
      top = Math.round((origHeight - cropHeight)/2);
      bottom = top + cropHeight - 1;
    }

    logger.verbose('Crop dimensions: ' + cropWidth + 'x' + cropHeight + ' left: ' + left + ' right: ' + right + ' top: '+ top + ' bottom: ' + bottom);

    image.batch()
      .crop(left, top, right, bottom)
      .resize(targetWidth, targetHeight, 'lanczos')
      .writeFile(pathToNewFile, function(err){
        if(err)  {
          logger(err);
          callback(err);
        }
        else return callback(null, pathToNewFile);
      });

  });
};

module.exports = imageService;