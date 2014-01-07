﻿/*	In order to make the helloWorld() function available client-side, you have to add a reference to the 'newsletter' module in the GUI Designer.
	The helloWorld() function can be executed from your JS file as follows:
	alert(newsletter.helloWorld());
	
	For more information, refer to http://doc.wakanda.org/Wakanda0.Beta/help/Title/en/page1516.html
*/

var privateSettingsFile = File(getFolder().path + 'PRIVATE-SETTING-nogit.js'); 
if (privateSettingsFile.exists) {
    include('PRIVATE-SETTING-nogit.js');
}

exports.submitEmail = function submitEmail(email) {
    var
        body,
        bodyStr,
        source,
        xhr,
        result;

    body = {
        secretKey: MARKETO_SECRET_KEY,
        list: 'Play.Wakanda.org Leads',
        fields: {
            'Email': email
            //,'Source': 'JS Weekly'
        }
    };

    bodyStr = JSON.stringify(body);

    xhr = new XMLHttpRequest();
    xhr.open('POST', MARKETO_URL);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(bodyStr);

    result = {
    	status: xhr.status + ' ' + xhr.statusText,
    	type: xhr.getResponseHeader('Content-Type'),
    	response: xhr.responseText
    };

    return result;
};