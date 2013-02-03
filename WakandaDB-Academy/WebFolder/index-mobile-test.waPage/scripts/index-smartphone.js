
WAF.onAfterInit = function onAfterInit() {// @lock

// @region namespaceDeclaration// @startlock
	var imageButton5 = {};	// @buttonImage
	var imageButton4 = {};	// @buttonImage
	var imageButtonModel = {};	// @buttonImage
	var imageButtonHome = {};	// @buttonImage
// @endregion// @endlock

// eventHandlers// @lock

	imageButton5.click = function imageButton5_click (event)// @startlock
	{// @endlock
		WAF.widgets.navigationView.goToView(4);
	};// @lock

	imageButton4.click = function imageButton4_click (event)// @startlock
	{// @endlock
		WAF.widgets.navigationView.goToView(3);
	};// @lock

	imageButtonModel.click = function imageButtonModel_click (event)// @startlock
	{// @endlock
		WAF.widgets.navigationView.goToView(2);
	};// @lock

	imageButtonHome.click = function imageButtonHome_click (event)// @startlock
	{// @endlock
		WAF.widgets.navigationView.goToView(1);
	};// @lock

// @region eventManager// @startlock
	WAF.addListener("imageButton5", "click", imageButton5.click, "WAF");
	WAF.addListener("imageButton4", "click", imageButton4.click, "WAF");
	WAF.addListener("imageButtonModel", "click", imageButtonModel.click, "WAF");
	WAF.addListener("imageButtonHome", "click", imageButtonHome.click, "WAF");
// @endregion
};// @endlock
