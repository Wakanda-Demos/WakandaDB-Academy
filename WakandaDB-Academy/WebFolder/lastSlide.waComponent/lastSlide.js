
(function Component (id) {// @lock

// Add the code that needs to be shared between components here

function constructor (id) {

	// @region beginComponentDeclaration// @startlock
	var $comp = this;
	this.name = 'lastSlide';
	// @endregion// @endlock

	this.load = function (data) {// @lock

	var
	    FEEDBACKS_BASE_URL,
	    widgets,
	    // widgets
	    textFieldName,
	    textFieldMail,
	    textFieldComment,
	    buttonSubmitComment,
	    // $jQuery nodes
	    $codeRunner,
	    $commentList,
	    $textFieldName,
	    $textMail,
	    $textFieldMail,
	    $containerNewsletter,
	    $containerWelcome,
	    $commentsList;

	FEEDBACKS_BASE_URL = 'http://127.0.0.1:8084/';

	widgets = this.widgets;

	textFieldName = widgets.textFieldName;
	textFieldComment = widgets.textFieldComment;
	textFieldMail = widgets.textFieldMail;
	buttonSubmitComment = widgets.buttonSubmitComment;

	$codeRunner = WDB_ACADEMY.$codeRunner;
	$commentList = widgets.commentsList.$domNode;
	$textTipMail = widgets.textTipMail.$domNode;
	$textFieldName = textFieldName.$domNode;	
	$textFieldMail = textFieldMail.$domNode;
	$containerNewsletter = widgets.containerNewsletter.$domNode;
	$containerWelcome = widgets.containerWelcome.$domNode;
	$commentsList = widgets.commentsList.$domNode;

	buttonSubmitComment.disable();

	$.ajax({
        type: 'GET',
        url: FEEDBACKS_BASE_URL + 'getComments',				
        //url: FEEDBACKS_BASE_URL + 'rest/User/getAllComments',
        success: function onGetCommentsSuccess(result) {
        	$commentsList.html(result);
        },
        error: function onGetCommentsError(result) {
        	console.log('error');
        }
	});

	// @region namespaceDeclaration// @startlock
	var textFieldMail = {};	// @textField
	var textFieldComment = {};	// @textField
	var buttonSubmitComment = {};	// @button
	var imageTipEmail = {};	// @image
	var buttonDownload = {};	// @button
	// @endregion// @endlock

	// eventHandlers// @lock

	textFieldMail.keyup = function textFieldMail_keyup (event)// @startlock
	{// @endlock
		if (textFieldMail.getValue() !== '') {
			buttonSubmitComment.enable();
		}

	};// @lock

	textFieldComment.keyup = function textFieldComment_keyup (event)// @startlock
	{// @endlock
		if (textFieldComment.getValue() !== '') {
			buttonSubmitComment.enable();
		}
	};// @lock

	buttonSubmitComment.click = function buttonSubmitComment_click (event)// @startlock
	{// @endlock
		var
		    comment,
		    mail,
		    name,
		    mailIsValid;

		name = textFieldName.getValue();
		comment = textFieldComment.getValue();
		mail = textFieldMail.getValue();
		mailIsValid = (mail !== '') && validEmail(mail);
		
		if (comment !== '' && name === '') {
			$textFieldName.css('border', '2px solid red');
		} else {
			$textFieldName.css('border', '1px solid black');
		}
		
		if (mailIsValid) {
			$textFieldMail.css('border', '2px solid red');
		} else {
			$textFieldMail.css('border', '1px solid black');
		}
		
		if ((comment !== '' && name !== '') || mailIsValid) {

			if (mailIsValid) {
	   			textFieldMail.setValue('');
	   			$containerNewsletter.fadeOut(500);
	   			$containerWelcome.fadeIn(500);
				$.ajax({
				    type : 'GET',			   
				    url: 'https://community.marketo.com/MarketoArticle?id=kA050000000Kyr7',
				    data : JSON.stringify({
				    	userID: localStorage.userID,
				    	mail: mail,
				    	name: name,
				    	comment: comment
				    }),	
				    success: function(result) { 				   			 
				    },
				    error: function(result){
				        console.error('error', result);
				    }
				});					
			}

			$.ajax({
			    type: 'POST',			   
			    url: FEEDBACKS_BASE_URL + 'saveComment/',
                // url: FEEDBACKS_BASE_URL + 'cors/',
			    data: JSON.stringify({ "userID" : localStorage['userID'], 'mail' : mail, 'name' : name, 'comment' : comment, "geoData" : localStorage['geoData']}),	
			    success: function onSaveCommentSuccess(result) {
   				   	if (comment !== '') {
   				   	    $commentsList.prepend(
   				   	        '<strong>' + name + ' :</strong> "' + comment + '"<hr/>'
   				   	    );
   				   	}
			   	    textFieldComment.setValue('');
			    },
			    error: function onSaveCommentError(result) {
			        console.error('onSaveCommentError:', result);
			    }
			});
		}
	};// @lock

	imageTipEmail.mouseout = function imageTipEmail_mouseout (event)// @startlock
	{// @endlock
		$textTipMail.fadeOut(500);
	};// @lock

	imageTipEmail.mouseover = function imageTipEmail_mouseover (event)// @startlock
	{// @endlock
		$textTipMail.fadeIn(500);
	};// @lock

	buttonDownload.click = function buttonDownload_click (event)// @startlock
	{// @endlock
		// TODO
		// add the download lead to Marketo

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
	WAF.addListener(this.id + "_textFieldComment", "keyup", textFieldComment.keyup, "WAF");
	WAF.addListener(this.id + "_buttonSubmitComment", "click", buttonSubmitComment.click, "WAF");
	WAF.addListener(this.id + "_imageTipEmail", "mouseout", imageTipEmail.mouseout, "WAF");
	WAF.addListener(this.id + "_imageTipEmail", "mouseover", imageTipEmail.mouseover, "WAF");
	WAF.addListener(this.id + "_buttonDownload", "click", buttonDownload.click, "WAF");
	// @endregion// @endlock

	};// @lock


}// @startlock
return constructor;
})();// @endlock
