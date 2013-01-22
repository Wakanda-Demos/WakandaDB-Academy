
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
        sample1,
        sample2;

	// @region namespaceDeclaration// @startlock
	var imageSample2 = {};	// @image
	var imageSample1 = {};	// @image
	// @endregion// @endlock

    widgets = this.widgets;
	sample1 = widgets.sample1.getValue();
	sample2 = widgets.sample2.getValue();

	// eventHandlers// @lock

	imageSample2.click = function imageSample2_click (event)// @startlock
	{// @endlock
 		WDB_ACADEMY.ssjsEditor.setValue(sample2);
	};// @lock

	imageSample1.click = function imageSample1_click (event)// @startlock
	{// @endlock
 		WDB_ACADEMY.ssjsEditor.setValue(sample1);
	};// @lock
	
	// @region eventManager// @startlock
	WAF.addListener(this.id + "_imageSample2", "click", imageSample2.click, "WAF");
	WAF.addListener(this.id + "_imageSample1", "click", imageSample1.click, "WAF");
	// @endregion// @endlock

	};// @lock


}// @startlock
return constructor;
})();// @endlock
