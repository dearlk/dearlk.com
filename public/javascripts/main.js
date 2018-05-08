/////////////////////////////
////    client side     ////
///////////////////////////
alert("hi");

$(document).ready(function() {
      alert("document ready occurred!");
});

$(window).load(function() {
      alert("window load occurred!");
});

$(function(){
	alert("hi")
  $(window).onload(function(e){
	    var parameters = {host: "dev.delapic"};
	    $.get( '/ping',parameters, function(data) {
	    	alert(data);
	      $('#dev_results').html(data);
	    });
  	};
  });
});