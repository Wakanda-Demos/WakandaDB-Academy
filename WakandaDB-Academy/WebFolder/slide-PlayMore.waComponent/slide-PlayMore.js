
(function Component (id) {// @lock

// Add the code that needs to be shared between components here

function constructor (id) {

	// @region beginComponentDeclaration// @startlock
	var $comp = this;
	this.name = 'slide-PlayMore';
	// @endregion// @endlock

	this.load = function (data) {// @lock

	// @region namespaceDeclaration// @startlock
	// @endregion// @endlock

	// eventHandlers// @lock

	$.ajax({
 		url: 'http://127.0.0.1:8084/getCodes',				
//        url: 'http://194.98.194.84:8084/getCodes',
	   type : 'GET',
	   success : function(result){ $('#slide' + (lastSlide-1) + '_containerCodes').html(result); },
	   error : function(result){ console.log('error'); }
	});


	// @region eventManager// @startlock
	// @endregion// @endlock

	};// @lock


}// @startlock
return constructor;
})();// @endlock
