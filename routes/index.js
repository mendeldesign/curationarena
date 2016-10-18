var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;

//[MJB] Added for access the io variable in your app.js, and even make it available to your routes by defining module.exports as a function which accepts io as a parameter.
module.exports = function(io) {
    var app = require('express');
    var router = app.Router();

    io.on('connection', function(socket) { 
        //log when a user is connected
        console.log('iPad connected');
        
        //when reveiving a message
        socket.on('chat message', function(i,url, w, h, imageOrientation, imageclass){
          console.log('request ' + i +" "+ url);

          //broadcast the message to the other people
          io.emit('chat message', i, url, w, h, imageOrientation, imageclass);
        });
  		
  		//log when a user is disconnected
  		socket.on('disconnect', function(){
    		//console.log('iPad disconnected');
  		}); 
    });
    return router;
}
