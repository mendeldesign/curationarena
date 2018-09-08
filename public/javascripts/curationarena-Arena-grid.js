/*	SCRIPT: curationarena-Arena-grid.js
	Curation Arena Prototype
	version Oktober 22 2016
	created by Mendel Broekhuijsen & Jesús Muñoz Alcantara

	EXTERNAL JS: isotope.pkgd.js, masonry-horizontal.js, 
	??? imagesloaded.pkgd.js ???
	*/


//init Masonry to enable automatic layout
var $grid = $('.grid').isotope({
	layoutMode: 'masonryHorizontal',
	itemSelector: '.grid-item',
	masonryHorizontal: {
    	//the row-heights should match the smallest height of the height of the photos, as defined in the .css file
    	rowHeight: 399, 
		//gutter: 
	}
});

//create a listener for events from the ipads
var socket = io();

//determine the size of the div, based on the meta data from the json.
function getImageDiv(w,h,o, callback){   
	//var maxHeight = $(".grid").height();

	var params = {width: "532px", height: "399px", imageClass: "arena-item--land-small", imageOrientation: "landscape"};

	//not needed, but just to be sure:
	var iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);

	switch(o){
		//I do not need to set check the sized agian of these again, 
		//I only need to set the correct sizes (bigger for the arena screen)
		case "square":
			params = {width: "399px", height: "399px", imageClass: "arena-item--square", imageOrientation: "square"};
			break;
		case "panorama":
			params = {width:"", height:"399px", imageClass:"arena-item--pano", imageOrientation: "panorama"};
			break;
		case "port-pano":
			if (h > (2 * w)){
				//params = {width:"332px", height:"747px", imageClass:"grid-item--port-pano", imageOrientation:"port-pano"};
				params = {width:"249px", height:"", imageClass:"arena-item--port-pano", imageOrientation:"port-pano"};
			}
			else{
				params = {width:"", height:"798px", imageClass:"arena-item--port-pano", imageOrientation:"port-pano"};
			}
			break;
		case "portrait rotate90":
		case "portrait ios-rotate90":  
			//rotate
			if(iOS == true){
				params = getRandomDiv("portrait");
			}
			else{
				params = getRandomDiv("portrait_w-h-flip");
				params.imageOrientation += " rotate90";
			}
			//if photo is too small
		case "portrait rotate90 mini":
		case "portrait ios-rotate90 mini":
				//iOS safari does the rotation by itself
				if (iOS == true) {
					params = {width: "", height: "399px", imageClass: "arena-item--port-small", imageOrientation: "portrait"};
				}
				else{
					//NB w and h are the other way around!
					params = {width: "", height: "266px", imageClass: "arena-item--port-small", imageOrientation: "portrait rotate90"};
				}
		break;
		case "landscape rotate180":
		case "landscape ios-rotate180":
			//if photo is too small
			if(w < 664){
				//iOS safari does the rotation by itself
				if (iOS == true) {
					params = {width: "399px", height: "", imageClass: "arena-item--land-small", imageOrientation: "landscape"};
				}
				else{
					//NB w and h are the other way around!
					params = {width: "532px", height: "", imageClass: "arena-item--land-small", imageOrientation: "landscape rotate180"};
				}
			}
			else{
				if(iOS == true){
					params = getRandomDiv("landscape");
				}
				else{
					params = getRandomDiv("landscape");
					params.imageOrientation += " rotate180";
				}
			}
			break;
		case "portrait rotate270":
		case "portrait ios-rotate270":
			if(iOS == true){
				params = getRandomDiv("portrait");
			}
			else{
				params = getRandomDiv("portrait_w-h-flip");
				params.imageOrientation += " rotate270";				
			}
			break;
		//if photo is too small
		case "portrait rotate270 mini":
		case "portrait ios-rotate270 mini":
			//iOS safari does the rotation by itself
			if (iOS == true) {
				params = {width: "", height: "399px", imageClass: "arena-item--port-small", imageOrientation: "portrait"};
			}
			else{
				//NB w and h are the other way around!
				params = {width: "", height: "266px", imageClass: "arena-item--port-small", imageOrientation: "portrait rotate270"};
			}
			break;
		//if photo is too small
		case "landscape mini":
			params = {width: "532px", height: "", imageClass: "arena-item--land-small", imageOrientation: "landscape"};
			break;
		//for photos with an aspect ratio bigger than 4:3 (all DSLR)
		case "landscape--4-3":
			params = getRandomDiv("landscape--4-3");
			break;
		//all other landscape photos
		case "landscape":
			params = getRandomDiv("landscape");
			break;
		case "portrait":
			params = getRandomDiv("portrait");
			break;
		//if photo is too small
		case "portrait mini":
			params = {width: "", height: "532px", imageClass: "arena-item--port-small", imageOrientation: "portrait"};
			break;
			
		default: params = getRandomDiv("landscape");
			break;

	};	
	return callback(params);
};


function getRandomDiv(o) {
	var randomInt = Math.floor(Math.random() * 100);
	//console.log(randomInt);
	switch(o){
		case "portrait":
			if(randomInt <= 10){
				return ({width: "", height: "798px", imageClass: "arena-item--port-big", imageOrientation: "portrait"});
			}
			else{
				return ({width: "", height: "399px", imageClass: "arena-item--port-small", imageOrientation: "portrait"});
			}
			break;
		case "portrait_w-h-flip":
			//NB w and h are the other way around!
			if(randomInt <= 10){
				return ({width: "", height: "532px", imageClass: "arena-item--port-big", imageOrientation: "portrait"});
			}
			else{
				return ({width: "", height: "266px", imageClass: "arena-item--port-small", imageOrientation: "portrait"});
			}
			break;
		case "landscape":
			if(randomInt <= 10){
			return ({width: "1064px", height: "", imageClass: "arena-item--land-big", imageOrientation: "landscape"});
			}
			else{
				return ({width: "532px", height: "", imageClass: "arena-item--land-small", imageOrientation: "landscape"});
			}
			break;
		case "landscape--4-3":
			if(randomInt <= 10){
			return ({width: "", height: "798", imageClass: "arena-item--land-big", imageOrientation: "landscape"});
			}
			else{
				return ({width: "", height: "399", imageClass: "arena-item--land-small", imageOrientation: "landscape"});
			}
			break;
	}
}

//Upon recieving the image URL from the ipad
socket.on('chat message', function(addItem, url, w, h, gridItemClass, imageOrientation){
console.log(addItem +" "+url);

	//Add items that were selected on iPad
	if(addItem==true){

		getImageDiv(w,h,imageOrientation, function(params){
			//console.log("W " + w +"px H "+ h + "px " + o);

			//photo in een predefined div
			//$("#"+f.id).append("<img src="+f.url+" height='" + randomHeight + "' id='" + f.id+"' onclick="+photoURL+"/>");

			//photo als div aan de body toegevoegd
			// create new item elements
			//just push it through without changing the div size (does not work for iPad)
			//var $photoDiv = $("<div class='grid-item "+ gridItemClass + "'><img src="+url+" width='" + w +"'height='" + h +"' class='" + imageOrientation +"'/></div>");
			var $photoDiv = $("<div class='grid-item "+ params.imageClass + "'><img src="+url+" width='" + params.width +"'height='" + params.height +"' class='" + params.imageOrientation +"'/></div>");

			// append items to grid
			$grid.append( $photoDiv )
			// add and lay out newly appended items
			.isotope( 'appended', $photoDiv );

			//$(".grid").append("<div class='grid-item'><img src="+f.url+" height='" + randomHeight + "' id='" + f.id+"' onclick=" +photoURL+" /></div>");
			//console.log(i);
			//console.log(f.url +" id = " + f.id);

		});
	}
	//Remove Items that were deselect on iPad
	else if(addItem==false){
		
		var $photoItem = $grid.children([0]).find("[src='" + url + "']");
		console.log($photoItem);
		
		// use the old method (true; more static) or reflow after removal (false)
		if (false) {
			$( $photoItem.parent([0])).remove();
			//re-layout
	 		$grid.isotope();
		} else {
			var removableDiv = $( $photoItem.parent([0]));
			//re-layout
	 		$grid.isotope('remove', removableDiv).isotope('layout'); 
		}
	}
});


/*
//Event listeners for the grid items, in case interaction with the arena screen is required	
$grid.on( 'click', '.grid-item', function() {
  //console.log($(this).hasClass("item--selected"));
  //toggle selector
  if($(this).hasClass("item--selected") == true)
  {
	  //remove item from the other screen:
	  console.log("deselected " +$(this).children([0]).attr("src")); 

	  // toggle the class of the item to show/hide visibility on the screen
	  $( this ).removeClass("item--selected");
	  //re-layout
	  $grid.isotope();  
	}

	else if($(this).hasClass("item--selected") == false)
	{
	  //send this item to the other screen:
	  console.log("selected " +$(this).children([0]).attr("src")); 

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
/*
	  //When a photo is clicked on the other view, the photos is deleted again from the screen
	  $( this ).remove();
	  
	  //re-layout.
	  $grid.isotope();
	}
});
*/ 