
$(document).ready(function() {

	/* Hover effect */
	$(".gen-animation").mouseover(function(){
		base_link_color = $(this).children("a.gen-animation").css('color');
        $(this).addClass("active");
		$(this).children("a.gen-animation").css('color', '#fcfbf4');
	});
	$(".gen-animation").mouseout(function(){
        $(this).removeClass("active");
		$(this).children("a.gen-animation").css('color', base_link_color);
	});

	
	$(".more-arrow").click(function(){	
			$(this).toggleClass("active");
			$(this).parent().parent().find(".max-content").slideToggle(500);
		});
		
	$(".logoImg").mouseover(function(){
		$(this).addClass("logoFade");
		});
	$(".logoImg").mouseout(function(){
		$(this).removeClass("logoFade");
		});


});