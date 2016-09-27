// JavaScript Document

//get files from folders

var folder_A = "../images/photos_A/";
var folder_B = "../images/photos_B/";

/*
$.ajax({
    url: folder_A,
    success: function (data) {
        $(data).find("a").attr("href", function (i, val) {
            if( val.match(/\.(jpe?g|png|gif)$/) ) { 
                $("body").append( "<img src='"+ folder_A + val +"'>" );
				// output
				console.log(folder_A);
            } 
        });
    }
});

$.ajax({
    url : folder_B,
    success: function (data) {
        $(data).find("a").attr("href", function (i, val) {
            if( val.match(/\.(jpe?g|png|gif)$/) ) { 
                $("body").append( "<img src='"+ folder_B + val +"'>" );
				// output
				console.log(folder_B);
            } 
        });
    }
});

*/
$(document).ready(function(){

var dir = "../images/photos_A/";
var fileextension= ".jpg" | ".png";

$.ajax({
//This will retrieve the contents of the folder if the folder is configured as ‘browsable’
	url: dir,
	success: function (data) {
	//Lsit all png file names in the page
	$(data).find("a:contains(" + fileextension + ")").each(function () {
		var filename = this.href.replace(window.location.host, "").replace("http:///","");
		$("body").append("<img src='" + dir + filename + "'>");
					console.log(filename)
	});
		console.log(dir)
  }
});
};