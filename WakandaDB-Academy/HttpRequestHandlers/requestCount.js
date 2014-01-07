﻿
var 
    privateSettingsFile;

privateSettingsFile = File(getFolder().path + 'PRIVATE-SETTING-nogit.js'); 
if (privateSettingsFile.exists) {
    include('PRIVATE-SETTING-nogit.js');
}

function getRequestCount(request, response) {

	var
	    AWSClient,
	    myAWS,
	    requestObj,
	    AWSResponse,
	    i;

	AWSClient = require("waf-aws/aws").client;
	myAWS = new AWSClient(AWSAccessKeyId, signingKey);

    json = {
        type   : "request", // If it is not explicitely said in the service doc that it uses rest, dont modify this value
        name   : "monitoring.eu-west-1",
        config : {
            Version				: "2010-08-01", // Check the version on the service reference( page example : "http://docs.aws.amazon.com/AutoScaling/latest/APIReference/Welcome.html" look for "API Version")
            baseURL				: "monitoring.eu-west-1.amazonaws.com", // endpoint for the service you wish to interact with : http://docs.aws.amazon.com/general/latest/gr/rande.html
            SignatureMethod		: "HmacSHA1",
            SignatureVersion	: "2",
            socket 				: true
        }
    };

    myAWS.addService(json);

    Date.prototype.addDays = function(days) {
        var
            date;

        date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
	    return date;
	}

    function getTimestamp(str) {
        var
            d;

        d = str.match(/\d+/g); // extract date parts
        return Number(new Date(d[0], d[1] - 1, d[2], d[3], d[4], d[5])); // build Date object
	}

	beginDate	= ((new Date).addDays(-1)).toISOString();
	endDate	= (new Date).toISOString();

	requestObj = {
		"HTTPVerb" 	: "GET",
		"resource"	: "/",
		"params"	: {
			"Action"					: "GetMetricStatistics",
			"Namespace"					: "AWS/ELB",
			"MetricName"				: "RequestCount",
			"StartTime"					: beginDate,
			"EndTime"					: endDate,
			"Period"					: 60*60,
			"Statistics.member.1"		: "Sum"
		}
	};

	AWSResponse = myAWS["monitoring.eu-west-1"].request(requestObj).send();
	//AWSResponse = " 2013-02-12T07:53:00Z Count 27.0 2013-02-11T19:53:00Z Count 206.0 2013-02-10T21:53:00Z Count 104.0 2013-02-11T12:53:00Z Count 153.0 2013-02-12T12:53:00Z Count 26.0 2013-02-12T09:53:00Z Count 1177.0 2013-02-12T02:53:00Z Count 130.0 2013-02-11T15:53:00Z Count 450.0 2013-02-11T17:53:00Z Count 256.0 2013-02-11T21:53:00Z Count 415.0 2013-02-11T20:53:00Z Count 16.0 2013-02-11T16:53:00Z Count 662.0 2013-02-10T13:53:00Z Count 1.0 2013-02-12T03:53:00Z Count 43.0 2013-02-12T04:53:00Z Count 49.0 2013-02-11T10:53:00Z Count 229.0 2013-02-12T10:53:00Z Count 234.0 2013-02-11T14:53:00Z Count 837.0 2013-02-11T09:53:00Z Count 106.0 2013-02-10T23:53:00Z Count 97.0 2013-02-12T00:53:00Z Count 11.0 2013-02-10T14:53:00Z Count 143.0 2013-02-11T23:53:00Z Count 3.0 2013-02-11T04:53:00Z Count 79.0 2013-02-11T07:53:00Z Count 574.0 2013-02-11T00:53:00Z Count 65.0 2013-02-10T20:53:00Z Count 285.0 2013-02-10T17:53:00Z Count 260.0 2013-02-12T05:53:00Z Count 5.0 2013-02-11T11:53:00Z Count 210.0 2013-02-10T19:53:00Z Count 23.0 2013-02-11T05:53:00Z Count 65.0 2013-02-10T15:53:00Z Count 79.0 2013-02-11T06:53:00Z Count 15.0 2013-02-11T22:53:00Z Count 99.0 2013-02-11T08:53:00Z Count 184.0 2013-02-10T18:53:00Z Count 319.0 2013-02-12T08:53:00Z Count 593.0 2013-02-11T13:53:00Z Count 201.0 2013-02-11T03:53:00Z Count 61.0 2013-02-12T01:53:00Z Count 229.0 2013-02-12T11:53:00Z Count 387.0 2013-02-10T22:53:00Z Count 172.0 2013-02-11T18:53:00Z Count 2.0 2013-02-12T06:53:00Z Count 2.0 RequestCount 867e7f98-751b-11e2-a2c9-73a7fed25ddf "
	AWSResponse = JSON.parse(XmlToJSON(AWSResponse, "json-bag", "GetMetricStatisticsResponse"));
	data = AWSResponse.GetMetricStatisticsResult[0].Datapoints[0].member;

	requestCount = [];
	for (i = 0; i < data.length ; i += 1) {
		requestCount.push([
		    data[i].Timestamp[0].__CDATA, 
		    data[i].Sum[0].__CDATA
		]);
	}
  
  	requestCount = requestCount.sort(); 

	response.headers['Access-Control-Allow-Origin'] = '*';

	return JSON.stringify(requestCount);
}

//a = getRequestCount();
//a