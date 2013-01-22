
(function Component (id) {// @lock

// Add the code that needs to be shared between components here

function constructor (id) {

	// @region beginComponentDeclaration// @startlock
	var $comp = this;
	this.name = 'lastSlide';
	// @endregion// @endlock

	this.load = function (data) {// @lock

	// @region namespaceDeclaration// @startlock
	var textFieldMail = {};	// @textField
	var comment = {};	// @textField
	var buttonSubmit = {};	// @button
	var image1 = {};	// @image
	var buttonDownload = {};	// @button
	// @endregion// @endlock

	// eventHandlers// @lock

	textFieldMail.keyup = function textFieldMail_keyup (event)// @startlock
	{// @endlock
		if ($$('slide6_textFieldMail').getValue() != '') $$('slide6_buttonSubmit').enable();

	};// @lock

	comment.keyup = function comment_keyup (event)// @startlock
	{// @endlock
		if ($$('slide6_comment').getValue() != '') $$('slide6_buttonSubmit').enable();
	};// @lock

	$$('slide6_buttonSubmit').disable();

	buttonSubmit.click = function buttonSubmit_click (event)// @startlock
	{// @endlock
		var comment = $$('slide6_comment').getValue();
		var mail = $$('slide6_textFieldMail').getValue();
		var name = $$('slide6_textFieldName').getValue();

		if (comment != '' && name == '') {
			$('#slide6_textFieldName').css('border', '2px solid red');
		} else {
			$('#slide6_textFieldName').css('border', '1px solid black');
		}
		
		if (mail != '' && !validEmail(mail)) {
			$('#slide6_textFieldMail').css('border', '2px solid red');
		} else {
			$('#slide6_textFieldMail').css('border', '1px solid black');
		}
		
		if ((comment != '' && name != '') || (mail != '' && validEmail(mail))) {

				if ((mail != '' && validEmail(mail))) {
		   			$$('slide6_textFieldMail').setValue('');
		   			$('#slide6_containerNewsletter').fadeOut(500);
		   			$('#slide6_containerWelcome').fadeIn(500);
					$.ajax({
					   url: 'https://community.marketo.com/MarketoArticle?id=kA050000000Kyr7',
					   data : JSON.stringify({ "userID" : localStorage['userID'], 'mail' : mail, 'name' : name, 'comment' : comment}),	
					   type : 'GET',			   
					   success : function(result) { 				   			 
					   },
					   error : function(result){ console.log('error'); }			   
					});					
				}

				$.ajax({
				   url: 'http://127.0.0.1:8084/saveComment/',
	//			   url: 'http://194.98.194.84:8084/cors/',
				   data : JSON.stringify({ "userID" : localStorage['userID'], 'mail' : mail, 'name' : name, 'comment' : comment, "geoData" : localStorage['geoData']}),	
				   type : 'POST',			   
				   success : function(result){ 
   				   		if ($$('slide6_comment').getValue() != '') $('#slide6_commentsList').prepend('<b>' + $$('slide6_textFieldName').getValue() + ' :</b> "' + $$('slide6_comment').getValue() +'"<hr/>');
				   		$$('slide6_comment').setValue('');
				   },
				   error : function(result){ console.log('error'); }			   
				});
		}
	};// @lock

	image1.mouseout = function image1_mouseout (event)// @startlock
	{// @endlock
		$('#slide' + lastSlide + '_textMail').fadeOut(500);
	};// @lock

	image1.mouseover = function image1_mouseover (event)// @startlock
	{// @endlock
		$('#slide' + lastSlide + '_textMail').fadeIn(500);
	};// @lock

	$.ajax({
		url: 'http://127.0.0.1:8084/getComments',				
//	   url: 'http://194.98.194.84:8084/rest/User/getAllComments',
	   type : 'GET',
	   success : function(result){ $('#slide' + lastSlide + '_commentsList').html(result); },
	   error : function(result){ console.log('error'); }
	});

	buttonDownload.click = function buttonDownload_click (event)// @startlock
	{// @endlock
		window.location = 'http://www.wakanda.org/downloads'
//	var OSName="Unknown OS";
//	if (navigator.appVersion.indexOf("Win")!=-1) OSName="Windows";
//	if (navigator.appVersion.indexOf("Mac")!=-1) OSName="MacOS";
//	if (navigator.appVersion.indexOf("Linux")!=-1) OSName="Linux";

//	switch (OSName) {
//		    
//		    case 'Windows':
//				window.location.href = 'http://download.wakanda.org/ProductionChannel/v3/Windows/124119/Wakanda-All-in-One-32-v3-124119.msi';
//		    break;
//		    	
//		    case 'MacOS':
//				window.location.href = 'http://download.wakanda.org/ProductionChannel/v3/Mac/124119/Wakanda%20All-in-One-v3-124119.dmg';
//		    break;

//		    case 'Linux':
//				window.location.href = 'http://download.wakanda.org/ProductionChannel/v3/Linux/124119/wakanda_3.0-124119_amd64.deb';
//		    break;
//		    		    	
//		    default:
//				window.location.href = 'http://www.wakanda.org/downloads';
//		    
//		    }
	};// @lock

	// @region eventManager// @startlock
	WAF.addListener(this.id + "_textFieldMail", "keyup", textFieldMail.keyup, "WAF");
	WAF.addListener(this.id + "_comment", "keyup", comment.keyup, "WAF");
	WAF.addListener(this.id + "_buttonSubmit", "click", buttonSubmit.click, "WAF");
	WAF.addListener(this.id + "_image1", "mouseout", image1.mouseout, "WAF");
	WAF.addListener(this.id + "_image1", "mouseover", image1.mouseover, "WAF");
	WAF.addListener(this.id + "_buttonDownload", "click", buttonDownload.click, "WAF");
	// @endregion// @endlock

	};// @lock


}// @startlock
return constructor;
})();// @endlock
