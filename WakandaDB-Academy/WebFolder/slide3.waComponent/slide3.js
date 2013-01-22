
(function Component (id) {// @lock

// Add the code that needs to be shared between components here

function constructor (id) {

	// @region beginComponentDeclaration// @startlock
	var $comp = this;
	this.name = 'slide3';
	// @endregion// @endlock

	this.load = function (data) {// @lock

	// @region namespaceDeclaration// @startlock
	var image2 = {};	// @image
	var image1 = {};	// @image
	// @endregion// @endlock
	$comp = this;
	// eventHandlers// @lock

	image2.click = function image2_click (event)// @startlock
	{// @endlock
 
 		ace.edit("codeRunner_containerSsjsEditor").setValue($comp.widgets.sample2.getValue());

	};// @lock

	image1.click = function image1_click (event)// @startlock
	{// @endlock
 		ace.edit("codeRunner_containerSsjsEditor").setValue($comp.widgets.sample1.getValue());

	};// @lock
	
	// @region eventManager// @startlock
	WAF.addListener(this.id + "_image2", "click", image2.click, "WAF");
	WAF.addListener(this.id + "_image1", "click", image1.click, "WAF");
	// @endregion// @endlock

	};// @lock


}// @startlock
return constructor;
})();// @endlock
