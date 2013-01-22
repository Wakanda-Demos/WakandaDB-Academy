
(function Component (id) {// @lock

// Add the code that needs to be shared between components here

function constructor (id) {

	// @region beginComponentDeclaration// @startlock
	var $comp = this;
	this.name = 'slide1';
	// @endregion// @endlock

	this.load = function (data) {// @lock

	// @region namespaceDeclaration// @startlock
	var button2 = {};	// @button
	var haveFun = {};	// @button
	// @endregion// @endlock

	// eventHandlers// @lock

	button2.click = function button2_click (event)// @startlock
	{// @endlock
		$('#slide1_button2').fadeOut(1000);
		$('#slide1_something').fadeIn(1500);
		var timer2 = setTimeout(function(){ $('#slide1_question, #slide1_bubble1').fadeIn(2000); clearTimeout(timer2); },2000);
		var timer3 = setTimeout(function(){
			$('#slide1_dupond, #slide1_find, #slide1_company, #slide1_name').show();
			$('#slide1_find').animate({ "top": "286px", "left": "226px", }, 1000);
			$('#slide1_dupond').animate({ "top": "286px", "left": "410px", }, 1000);
			$('#slide1_company').animate({ "top": "286px", "left": '525px', }, 1000);
			$('#slide1_name').animate({ "top": "286px", "left": "640px", }, 1000);
			clearTimeout(timer3); 
		},5000);
		var timer4 = setTimeout(function(){ $('#slide1_js1, #slide1_js2, #slide1_js3, #slide1_js4').fadeIn(2000); clearTimeout(timer4); },6000);
		var timer5 = setTimeout(function(){ $('#slide1_richText2, #slide1_haveFun').fadeIn(2000); clearTimeout(timer5); },8000);
	};// @lock

	haveFun.click = function haveFun_click (event)// @startlock
	{// @endlock
		source.user.newEntity();
		$('#slide2').fadeIn(1000);
		$('#slide1').fadeOut(1000);
		$('#slide2_textFieldName').focus();

	};// @lock

	// @region eventManager// @startlock
	WAF.addListener(this.id + "_button2", "click", button2.click, "WAF");
	WAF.addListener(this.id + "_haveFun", "click", haveFun.click, "WAF");
	// @endregion// @endlock

	};// @lock


}// @startlock
return constructor;
})();// @endlock
