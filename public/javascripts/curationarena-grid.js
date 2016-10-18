/*	SCRIPT: curationarena-grid.js
	Curation Arena Prototype
	version Oktober 7 2016
	created by Mendel Broekhuijsen

	EXTERNAL JS: isotope.pkgd.js, masonry-horizontal.js, 
	??? imagesloaded.pkgd.js ???
	*/


// init Masonry to enable automatic layout
var $grid = $('.grid').isotope({
	layoutMode: 'masonryHorizontal',
	itemSelector: '.grid-item',
	masonryHorizontal: {
    	//the row-heights should match the smallest height of the height of the photos, as defined in the .css file
    	rowHeight: 249, 
		//gutter: 
	}
});

// Socket.io functionality for sending photos
var socket = io("");

//get the size of the image, based on the URL.
function getImageDiv(w,h,o, callback){   
	//var maxHeight = $(".grid").height();

	if(o == "Rotate 90 CW"){
		//rotate
		console.log("image orientation is 90 CW!");
	}
	else if(o == ""){
	}
	else if(o == ""){
	}
	else if(o == ""){

	}
	else{
		if(w >= h){

			if(w <= 664){
				callback("landscape", "");
			}
			else if(w > (2 * h)){
				callback("panorama", "grid-item--pano");
			}			
			else{
				//create random height:
				if (getRandomInt(1,5) > 3){
					callback("landscape", "");
				}
				else if (getRandomInt(1,5) < 3){
					callback("landscape", "grid-item--land-big");
				}
			}
		}
		else{
			if (h > (1.5 * w)){
				callback("port-pano", "grid-item--port-pano");
			}	
			//create random size:
			else if (getRandomInt(1,5) > 2.5){
				callback("portrait", "grid-item--port-small");
			}
			else if (getRandomInt(1,5) < 2.5){
				callback("","grid-item--port-big");
			}
		}
	}
};

/*
// generate random item sizes class="grid-item grid-item--width# grid-item--height#" />
function getItemSize(i) {
  var $item = i;
  // add width and height class
  var wRand = Math.random();
  var hRand = Math.random();
  var widthClass = wRand > 0.85 ? 'grid-item--size3' : wRand > 0.7 ? 'grid-item--size2' : '';
  var heightClass = hRand > 0.85 ? 'grid-item--size3' : hRand > 0.5 ? 'grid-item--size2' : '';
  
  $item.addClass( widthClass ).addClass( heightClass );
 
 return $item;
};
*/

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

//eerst alle photos in een array duwen om de volgorde te bewaren?
//var photoArray = new Array();

//jQuery.getJSON('/files/images', function(data){
jQuery.getJSON('./images/photos_A/photosEXIFtestMendel.json', function(data){
	$.each(data.photos, function (i, f) {

		var w = f.exif['image width'];
		var h = f.exif['image height'];
		var o = f.exif['orientation'];

		getImageDiv(w,h,o, function(imageOrientation, imageClass){
					 //console.log("W " + w +"px H "+ h + "px " + o);

					 //photo in een predefined div
					 //$("#"+f.id).append("<img src="+f.url+" height='" + randomHeight + "' id='" + f.id+"' onclick="+photoURL+"/>");
					 
					 //photo als div aan de body toegevoegd
					 // create new item elements
					//optie 3 zonder onclick, want die komt op de .grid-item class te staan
					var $photoDiv = $("<div class='grid-item "+ imageClass + "'><img src="+f.url+" width='" + w +"'height='" + h +"' id='" + imageOrientation +"'/></div>");
					 //var $photoItem = getItemSize($photoDiv);
					 
					 //photoArray.push( $photoItem );
					 
					 //!!!on load thing!!!
					 // layout Isotope after each image loads
	//$grid.imagesLoaded().progress( function() {
					 	//$(img).on('load', function(){
	//	console.log("image is loaded "+ url);

					 // append items to grid
					 $grid.append( $photoDiv )
				    	// add and lay out newly appended items
				    	.isotope( 'appended', $photoDiv );

					//	 $(".grid").append("<div class='grid-item'><img src="+f.url+" height='" + randomHeight + "' id='" + f.id+"' onclick=" +photoURL+" /></div>");
						 //console.log(i);
						 //console.log(f.url +" id = " + f.id);

						});

	});

});

//---------------event listeners-------------------

$grid.on( 'click', '.grid-item', function() {
  //console.log($(this).hasClass("item--selected"));
  //toggle selector

  var url = $(this).children([0]).attr("src");
  var w = $(this).children([0]).attr("width");
  var h = $(this).children([0]).attr("height");
  var imageOrientation = $(this).children([0]).attr("id");
  var imageClass = $(this).class();

  //already create the div that will be sent to the other screen
  var $photoDiv = $("<div class='"+ imageClass + "'><img src="+url+" width='" + w +"'height='" + h +"' id='" + imageOrientation +"'/></div>")


  if($(this).hasClass("item--selected") == true)
  {
 	//send the URL to the other screen
	socket.emit('chat message', false, url, w, h, imageOrientation, imageclass);// children([0]).attr("src"));
	  //remove item from the other screen:
	  console.log("deselected " + $(this).children([0]).attr("src"));//children([0]).attr("src")); 

	  // toggle the class of the item to show/hide visibility on the screen
	  $( this ).removeClass("item--selected");
	  //re-layout
	  $grid.isotope();  
	}

	else if($(this).hasClass("item--selected") == false)
	{
	  //send the URL to the other screen
	  socket.emit('chat message', true, url, w, h, imageOrientation, imageclass);
	 
	  //send this item to the other screen:
	  console.log("selected " +  $(this).children([0]).attr("src")); 

	  // toggle the class of the item to show/hide visibility on the screen
	  $(this).addClass("item--selected"); 
	  
	  //add selection item -- Werkt Niet tot nu toe!
	  /*var check = new Image();
	  check.src = "http://i.stack.imgur.com/X9Xth.png";
	  $( this ).add(check);
	  */
	  
	  //toggle size
	  /*
	  if($(this).children([0]).attr("id") == "portrait"){
		  $(this).toggleClass("grid-item--port-big");
	  }
	  if($(this).children([0]).attr("id") == "landscape"){
		  $(this).toggleClass("grid-item--land-big");
	  }
	  */

	  //to remove the item straight away:
	  //$( this ).remove();
	  
	  //re-layout.
	  $grid.isotope();
	}
});