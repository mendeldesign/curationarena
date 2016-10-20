/*	SCRIPT: curationarena-grid.js
	Curation Arena Prototype
	version Oktober 18 2016
	created by Mendel Broekhuijsen & Jesús Muñoz Alcantara

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

//var userID = jQuery.url.param("userid");

//determine the size of the div, based on the meta data from the json.
function getImageDiv(w,h,o, callback){   
	//var maxHeight = $(".grid").height();

	var params = {width: "332px", height: "", imageClass: "", imageOrientation: "landscape"};

	//square images
	if(Math.abs((w/h)-1) < 0.01){
		params = {width: "249px", height: "249px", imageClass: "grid-item--square", imageOrientation: "square"};
	}
	//landscape panoramas
	else if(w > (2 * h)){
		//params = {width:"664px", height:"249px", imageClass:"grid-item--pano", imageOrientation: "panorama"};
		params = {width:"", height:"249px", imageClass:"grid-item--pano", imageOrientation: "panorama"};
	}
	//portrait panoramas
	else if (h > (1.5 * w)){
		//params = {width:"332px", height:"747px", imageClass:"grid-item--port-pano", imageOrientation:"port-pano"};
		params = {width:"", height:"747px", imageClass:"grid-item--port-pano", imageOrientation:"port-pano"};
	}	
	else{
		/*
		1 = Horizontal (normal) 
		2 = Mirror horizontal 
		3 = Rotate 180 
		4 = Mirror vertical 
		5 = Mirror horizontal and rotate 270 CW 
		6 = Rotate 90 CW 
		7 = Mirror horizontal and rotate 90 CW 
		8 = Rotate 270 CW
		*/
		//console.log(o);
		var iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);

		switch(o){
			//rotated portrait
			case "Rotate 90 CW":  
				//rotate
				console.log("image orientation is 90 CW!");
				//if rotated portrait is too small
				if(w < 498){
					//iOS safari does the rotation by itself
					if (iOS == true) {
						params = {width: "", height: "249px", imageClass: "grid-item--port-small", imageOrientation: "portrait ios-rotate90 mini"};
					}
					else{
						//NB w and h are the other way around!
						params = {width: "", height: "166px", imageClass: "grid-item--port-small", imageOrientation: "portrait rotate90 mini"};
					}
				}
				else{
					if(iOS == true){
						params = getRandomDiv("portrait");
						//to make sure that the rotation does not get forgotten after the ipad used it
						params.imageOrientation += " ios-rotate90";
					}
					else{
						params = getRandomDiv("portrait_w-h-flip");
						params.imageOrientation += " rotate90";
					}
				}
				break;
			//upside down landscape
			case "Rotate 180":
				//if photo is too small
				if(w < 664){
					//iOS safari does the rotation by itself
					if (iOS == true) {
						params = {width: "332px", height: "", imageClass: "", imageOrientation: "landscape ios-rotate180 mini"};
					}
					else{
						//NB w and h are the other way around!
						params = {width: "332px", height: "", imageClass: "", imageOrientation: "landscape rotate180 mini"};
					}
				}
				else{
					if(iOS == true){
						params = getRandomDiv("landscape");
						params.imageOrientation += " ios-rotate180"; 
					}
					else{
						params = getRandomDiv("landscape");
						params.imageOrientation += " rotate180";
					}
				}
				break;
			//rotated upside downs portrait
			case "Rotate 270 CW":
				//if photo is too small
				if(w < 498){
					//iOS safari does the rotation by itself
					if (iOS == true) {
						params = {width: "", height: "249px", imageClass: "grid-item--port-small", imageOrientation: "portrait ios-rotate270 mini"};
					}
					else{
						//NB w and h are the other way around!
						params = {width: "", height: "166px", imageClass: "grid-item--port-small", imageOrientation: "portrait rotate270 mini"};
					}
				}
				else{
					if(iOS == true){
						params = getRandomDiv("portrait");
						params.imageOrientation += " ios-rotate270";
					}
					else{
						params = getRandomDiv("portrait_w-h-flip");
						params.imageOrientation += " rotate270";				
					}
				}
				break;
			//landscape photos
			case "Horizontal (normal)":
				//if photo is too small
				if(w < 664){
					//if tag is Horizontal (normal) but image is still portrait
					if(w < h){
						params = {width: "", height: "332px", imageClass: "", imageOrientation: "portrait mini"};
					}
					else{
						params = {width: "332px", height: "", imageClass: "", imageOrientation: "landscape mini"};
					}
				}
				else if(w < h){
					params = getRandomDiv("portrait");
				}
				else
					params = getRandomDiv("landscape");

				break;
			default: params = getRandomDiv("landscape");
				break;

		};	
	}
	return callback(params);
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

function getRandomDiv(o) {
	var randomInt = Math.floor(Math.random() * 100);
	console.log(randomInt);
	switch(o){
		case "portrait":
			if(randomInt <= 50){
				return ({width: "", height: "498px", imageClass: "grid-item--port-big", imageOrientation: "portrait"});
			}
			else{
				return ({width: "", height: "249px", imageClass: "grid-item--port-small", imageOrientation: "portrait"});
			}
			break;
		case "portrait_w-h-flip":
			//NB w and h are the other way around!
			if(randomInt <= 50){
				return ({width: "", height: "332px", imageClass: "grid-item--port-big", imageOrientation: "portrait"});
			}
			else{
				return ({width: "", height: "166px", imageClass: "grid-item--port-small", imageOrientation: "portrait"});
			}
			break;
		case "landscape":
			if(randomInt <= 50){
			return ({width: "664px", height: "", imageClass: "grid-item--land-big", imageOrientation: "landscape"});
			}
			else{
				return ({width: "332px", height: "", imageClass: "", imageOrientation: "landscape"});
			}
			break;
	}
}

//eerst alle photos in een array duwen om de volgorde te bewaren?
//var photoArray = new Array();
var userID = "Mendel";
jQuery.getJSON('/files/'+ userID+'/images', function(data){
//jQuery.getJSON('./images/photos_A/photosEXIFtest.json', function(data){
	$.each(data.photos, function (i, f) {
		
		console.log(f.width + " "+f.height);
		
		var w = parseInt(f.width, 10);
		var h = parseInt(f.height, 10);
		var o = f.rotation.description;

		getImageDiv(w,h,o, function(params){
			 //console.log("W " + w +"px H "+ h + "px " + o);

			 //photo in een predefined div
			 //$("#"+f.id).append("<img src="+f.url+" height='" + randomHeight + "' id='" + f.id+"' onclick="+photoURL+"/>");
			 
			 //photo als div aan de body toegevoegd
			 // create new item elements
			
			//pre-loader doe not work because the smaller items are loaded faster
			//var img = new Image();
			//$(img).on('load', function(){
				var $photoDiv = $("<div class='grid-item "+ params.imageClass + "'><img src="+f.url+" width='" + params.width +"'height='" + params.height +"' class='" + params.imageOrientation +"'/></div>");
				//var $photoDiv = $("<div class='grid-item "+ params.imageClass + "'><img src="+f.path+" class='" + params.imageOrientation +"'/></div>");
			 	//var $photoItem = getItemSize($photoDiv);
			 
			 	//photoArray.push( $photoItem );

			 	//hide the spinning loading unit
			 	$("#loading").hide();
			 
			 	// append items to grid
			 	$grid.append( $photoDiv )
				// add and lay out newly appended items
				.isotope( 'appended', $photoDiv );

				//	 $(".grid").append("<div class='grid-item'><img src="+f.url+" height='" + randomHeight + "' id='" + f.id+"' onclick=" +photoURL+" /></div>");
				 //console.log(i);
				 //console.log(f.url +" id = " + f.id);
			
			//});
			//img.src = f.path;
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
  var gridItemClass = $(this).attr("class");
  var imageOrientation = $(this).children([0]).attr("class");

  //already create the div that will be sent to the other screen
  //var $photoDiv = $("<div class='"+ gridItemClass + "'><img src="+url+" width='" + w +"'height='" + h +"' class='" + imageOrientation +"'/></div>")


  if($(this).hasClass("item--selected") == true)
  {
 	//send the URL to the other screen
	socket.emit('chat message', false, url, w, h, gridItemClass, imageOrientation);// children([0]).attr("src"));
	  //remove item from the other screen:
	  console.log("deselected " + url);//children([0]).attr("src")); 

	  // toggle the class of the item to show/hide visibility on the screen
	  $( this ).removeClass("item--selected");
	  //re-layout
	  $grid.isotope();  
	}

	else if($(this).hasClass("item--selected") == false)
	{
	  //send the URL to the other screen
	  socket.emit('chat message', true, url, w, h, gridItemClass, imageOrientation);
	 
	  //send this item to the other screen:
	  console.log("selected " +  url); 

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