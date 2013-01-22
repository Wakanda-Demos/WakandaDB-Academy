
(function Component (id) {// @lock

// Add the code that needs to be shared between components here

function constructor (id) {

	// @region beginComponentDeclaration// @startlock
	var $comp = this;
	this.name = 'slide3';
	// @endregion// @endlock

	this.load = function (data) {// @lock

    var
        widgets,
        sample3,
        sample4;

	// @region namespaceDeclaration// @startlock
	var imageSample4 = {};	// @image
	var imageSample3 = {};	// @image
	// @endregion// @endlock

	widgets = this.widgets;
	sample3 = widgets.sample3.getValue();
	sample4 = widgets.sample4.getValue();

	// eventHandlers// @lock

	imageSample4.click = function imageSample4_click (event)// @startlock
	{// @endlock
		WDB_ACADEMY.ssjsEditor.setValue(sample4);
	};// @lock

	imageSample3.click = function imageSample3_click (event)// @startlock
	{// @endlock
		WDB_ACADEMY.ssjsEditor.setValue(sample3);
	};// @lock
	
	// @region eventManager// @startlock
	WAF.addListener(this.id + "_imageSample4", "click", imageSample4.click, "WAF");
	WAF.addListener(this.id + "_imageSample3", "click", imageSample3.click, "WAF");
	// @endregion// @endlock

	};// @lock


}// @startlock
return constructor;
})();// @endlock
