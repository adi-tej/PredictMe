function popup(message,isError,callback) {
	   
	   if( $('#messageContainer').length === 0 ) {
		   //create and dump the container.
		   var html = '<div class="white_content success-message-box" id="messageContainer">'+
				      '</div>'+
			          '<div id="fade" class="black_overlay"></div>';
		   $('body').append(html);
	   }
		if(isError){
			$('#messageContainer').addClass("error-message");
			}
        
	    // get the screen height and width  
	    var maskHeight = $(document).height();  
	    var maskWidth = $(window).width();
	    
	    // calculate the values for center alignment
	    var dialogTop =  (maskHeight/3.5) - ($('#messageContainer').height());
	    var dialogLeft = (maskWidth/2) - ($('#messageContainer').width()/2); 
	    
	    // assign values to the overlay and dialog box
	    $('#fade').css({height:maskHeight, width:maskWidth}).show();
	    $('#messageContainer').css({top:dialogTop, left:dialogLeft}).show();

			if (message) {
					$('#messageContainer').html(message);
				}			
			  setTimeout(function(){
	    		  $('#messageContainer').hide();
	    		  $('#fade').hide();
	    		  if (callback) {
	    			  callback();
	    		  }
	    	  },3000);
			  
				$(window).resize(function() {

					//only do it if the dialog box is not hidden
					if (!$('#messageContainer').is(':hidden'))
						popup();
				});

			}