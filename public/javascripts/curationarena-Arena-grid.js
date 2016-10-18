/*	SCRIPT: curationarena-Arena-grid.js
	Curation Arena Prototype
	version Oktober 7 2016
	created by Mendel Broekhuijsen

	EXTERNAL JS: isotope.pkgd.js, masonry-horizontal.js, 
	??? imagesloaded.pkgd.js ???
	*/


//init Masonry to enable automatic layout
var $grid = $('.grid').isotope({
	layoutMode: 'masonryHorizontal',
	itemSelector: '.grid-item',
	masonryHorizontal: {
    	//the row-heights should match the smallest height of the height of the photos, as defined in the .css file
    	rowHeight: 249, 
		//gutter: 
	}
});

//create a listener for events from the ipads
var socket = io();


//get the size of the image, based on the URL
function getImageDiv(w,h,imageOrientation, callback){   
	//var maxHeight = $(".grid").height();

		if(imageOrientation == "landscape"){

			if(w <= 664){
				callback("");
			}		
			else{
				//create random height:
				if (getRandomInt(1,5) > 1){
					callback("");
				}
				else if (getRandomInt(1,5) < 1){
					callback("grid-item--land-big");
				}
			}
		}
		else if(imageOrientation == "portrait"){
			//create random size:
			else if (getRandomInt(1,5) > 4){
				callback("grid-item--port-small");
			}
			else if (getRandomInt(1,5) < 4){
				callback("grid-item--port-big");
			}
		}
		else if(imageOrientation == "panorama"){
			callback("grid-item--pano");
		}
		else if(imageOrientation == "port-pano")
			callback("grid-item--port-pano");
		};
};


function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}


//Upon recieving the image URL from the ipad
socket.on('chat message', function(addItem, url, w, h, imageOrientation, c){
console.log(addItem +" "+url);

	//Add items that were selected on iPad
	if(addItem==true){

		getImageDiv(w,h,imageOrientation, function(imageClass){
			//console.log("W " + w +"px H "+ h + "px " + o);

			//photo in een predefined div
			//$("#"+f.id).append("<img src="+f.url+" height='" + randomHeight + "' id='" + f.id+"' onclick="+photoURL+"/>");

			//photo als div aan de body toegevoegd
			// create new item elements
			//optie 3 zonder onclick, want die komt op de .grid-item class te staan
			var $photoDiv = $("<div class='grid-item "+ imageClass + "'><img src="+url+" width='" + w +"'height='" + h +"' id='" + imageOrientation +"'/></div>");
			//var $photoItem = getItemSize($photoDiv);

			//photoArray.push( $photoItem );

			//loader!!!
				// layout Isotope after each image loads
	//$grid.imagesLoaded().progress( function() {
	//$(img).on('load', function(){
		//console.log("image is loaded "+ url);
			
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
		
		$( $photoItem.parent([0])).remove();
		//re-layout
	 	$grid.isotope(); 
	}
});


/*
//Event listeners for the grid items	
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