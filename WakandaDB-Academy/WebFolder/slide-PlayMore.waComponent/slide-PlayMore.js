
(function Component (id) {// @lock

// Add the code that needs to be shared between components here

function constructor (id) {

	// @region beginComponentDeclaration// @startlock
	var $comp = this;
	this.name = 'slide-PlayMore';
	// @endregion// @endlock

	this.load = function (data) {// @lock

	var
	    lastSlideIndex,
	    slideCodes,
	    $containerCodes;

	// @region namespaceDeclaration// @startlock
	// @endregion// @endlock

    slideCodesIndex = $('[data-type=component]').length - 3;
    slideCodes = WAF.widgets['slide' + slideCodesIndex];
    $containerCodes = slideCodes.widgets.containerCodes.$domNode;

	// eventHandlers// @lock

	$.ajax({
	    type : 'GET',
 		url: 'http://127.0.0.1:8084/getCodes',				
//        url: 'http://194.98.194.84:8084/getCodes',
	    success: function onGetCodesSuccess(result){

	    	$containerCodes.html(result);	

	    },
	    error: function onGetCodesError(result){

	    	console.log('onGetCodesError:', result);

	    }
	});


	// @region eventManager// @startlock
	// @endregion// @endlock

	};// @lock


}// @startlock
return constructor;
})();// @endlock
