var express = require('express')
var app = express();

var cors = require('cors')
app.use(cors())

app.set('port', (process.env.PORT || 8080))

var request = require('request');
var stats = require('./statistics');
var connection = require('./connection');
var configuration = require('./configuration');

var messageTimer = null
var watchedWorkgroupList = [];


function pollMessages(){
    request(connection.getRequestOptions("GET",'/messaging/messages',null), function(error, response, body){

        if(error != null){
            console.log("ERROR - Unable to poll messages from CIC");
            logIntoCICAndStartWatches();
        }

        if(body == null){
            return;
        }
//        console.log(JSON.stringify(body));
        //console.log(body);
        for(var i = 0; i< body.length; i++){
            var message = body[i];

            console.log(message['__type']);

            if(message['__type'] == 'urn:inin.com:statistics:statisticValueMessage'){
                for(var s = 0; s< message.statisticValueChanges.length; s++){

                    var stat = message.statisticValueChanges[s];

                    if(stats.isWorkgroupStatistic(stat))
                    {
                        stats.addWorkgroupStatToCatalog(stat);
                    }
                    else if(stats.isAgentStatistic(stat))
                    {
                        stats.addAgentStatToCatalog(stat);
                    }
                }
            }else if (message['__type'] == 'urn:inin.com:alerts:alertNotificationMessage'){
            //    console.log(JSON.stringify(message));
                for(var a = 0; a< message.alertNotificationList.length; a++){
                    stats.handleAlertNotification(message.alertNotificationList[a]);
                }

            }else if (message['__type'] == 'urn:inin.com:alerts:alertCatalogChangedMessage'){
                //console.log(JSON.stringify(message));
                stats.alertCatalogUpdated(message);
            }
        }
    });
}

function startAlertWatches(){

    request(connection.getRequestOptions("PUT", "/messaging/subscriptions/alerts/alert-catalog", {
        'alertSetCategories': [2]
    }), function(error,response,body){
        request(connection.getRequestOptions("PUT", "/messaging/subscriptions/alerts/alert-notifications", {

        }), function(error,response,body){

        }); //end stat values put
    }); //end stat values put
}

function startWorkgroupStatWatches(workgroupList){
    watchedWorkgroupList = workgroupList;
    var statWatchData = [];

    for(var x=0; x< workgroupList.length; x++){
        var workgroup = workgroupList[x];
        console.log('start watch on ' + workgroup)

        for(var statKeyIndex = 0; statKeyIndex< stats.workgroupStats.length; statKeyIndex++){
            var statWatchParams = {
                "statisticIdentifier": stats.workgroupStats[statKeyIndex],
                "parameterValueItems": [{
                    "parameterTypeId": "ININ.People.WorkgroupStats:Workgroup",
                    "value": workgroup
                }]
            };

            statWatchData.push(statWatchParams);

        }


        for(var statKeyIndex = 0; statKeyIndex< stats.workgroupIntervalStats.length; statKeyIndex++){
            for(var intervalIndex=0; intervalIndex< configuration.intervals.length; intervalIndex++)
            {

                var statWatchParams = {
                    "statisticIdentifier": stats.workgroupIntervalStats[statKeyIndex],
                    "parameterValueItems": [{
                        "parameterTypeId": "ININ.People.WorkgroupStats:Workgroup",
                        "value": workgroup
                    }, {
                        "parameterTypeId": "ININ.Queue:Interval",
                        "value": configuration.intervals[intervalIndex]
                    }]
                };

                statWatchData.push(statWatchParams);
            }

        }
    }

    request(connection.getRequestOptions("PUT", "/messaging/subscriptions/statistics/statistic-values", {
        'statisticKeys': statWatchData
    }), function(error,response,body){

        if(error){
            console.log("Error starting stat watch:" + JSON.stringify(error))
        }
    }); //end stat values put

}


function performPostLoginOperations(server, headers){
    connection.connectionComplete(configuration.cicUrl, server, headers);

    if(configuration.workgroupFilter.length == 0)
    {

        request(connection.getRequestOptions("GET", "/configuration/workgroups", null), function(error,response,body){
            //console.log(JSON.stringify(body));
            var workgroups = [];
            for(var x=0; x< body.items.length; x++){
                var workgroup = body.items[x];
                workgroups.push(workgroup.configurationId.id);
            }

            startWorkgroupStatWatches(workgroups);

        });//end workgroup get
    }
    else
    {
        startWorkgroupStatWatches(configuration.workgroupFilter);
    }

    //Start polling for messages
    messageTimer = setInterval(pollMessages, 2000);

    setTimeout(function() {
        //start agent watches in a little bit so we don't flood the system
        startAgentStatWatches();
    }, 3000);

    setTimeout(function() {
        startAlertWatches();
    }, 3000);
}

//Log into CIC
function logIntoCICAndStartWatches(){
    console.log("Logging into cic server at " + configuration.cicUrl + " with user " + configuration.cicUser);
    request(connection.loginRequestOptions(configuration.cicUrl,configuration.cicServer, configuration.cicUser, configuration.cicPassword), function(error, response, body){
        if(response == null)
        {
            console.log("No response from server")
            setTimeout(function() {
                logIntoCICAndStartWatches();
            }, 3000);

        }
        console.log("log in to the server is complete: " +  response.statusCode);
        if(response.statusCode == 201){
            performPostLoginOperations(configuration.cicUrl, response.headers);
        }else if(response.statusCode ==503){
            console.log(configuration.cicUrl + " is not accepting connections. Server list:")
            console.log(response.body.alternateHostList)


            logIntoAlternateServer(response.body.alternateHostList)
            return;

        }
    });//end log in request
}

function logIntoAlternateServer(serverList){

    var nextServer = serverList.shift();

    console.log("Logging into alternate cic server at " + nextServer + " with user " + configuration.cicUser);
    request(connection.loginRequestOptions(configuration.cicUrl,nextServer, configuration.cicUser, configuration.cicPassword), function(error, response, body){
        if(response == null)
        {
            logIntoAlternateServer(serverList)
            return;
        }
        console.log("log in to the server is complete: " +  response.statusCode);
        if(response.statusCode == 201){
            performPostLoginOperations(nextServer, response.headers);
        }else if(response.statusCode ==503){
            console.log(serverList + " is not accepting connections")

            logIntoAlternateServer(serverList)
            return;

        }
    });//end log in request
}

function startAgentStatWatches(){
    //watchedWorkgroupList = workgroupList;
    var agentStatWatchData = [];

    for(var wgIndex=0; wgIndex < watchedWorkgroupList.length; wgIndex++)
    {
        var workgroup = watchedWorkgroupList[wgIndex];
        request(connection.getRequestOptions("GET", "/configuration/workgroups/" + watchedWorkgroupList[wgIndex] + "?rightsFilter=view&select=members", null), function(error,response,body){

            var agents = [];
            var statWatchData = [];

            for(var x=0; x< body.members.length; x++){

                var agent = body.members[x].id;

            //    console.log("starting agent watch:" + agent + ", " + workgroup)
            //    console.log(JSON.stringify(body));
                for(var statKeyIndex = 0; statKeyIndex< stats.agentStats.length; statKeyIndex++){

                    var statWatchParams = {
                        "statisticIdentifier": stats.agentStats[statKeyIndex],
                        "parameterValueItems": [{
                            "parameterTypeId": "ININ.People.WorkgroupStats:Workgroup",
                            "value": body.configurationId.id
                        }, {
                            "parameterTypeId": "ININ.Queue:Interval",
                            "value": "CurrentShift"
                        }, {
                            "parameterTypeId": "ININ.People.AgentStats:User",
                            "value": agent
                        }]
                    };

                    agentStatWatchData.push(statWatchParams);

                }

            }

            request(connection.getRequestOptions("PUT", "/messaging/subscriptions/statistics/statistic-values", {
                'statisticKeys': agentStatWatchData
            }), function(error,response,body){

                if(error){
                    console.log("Error starting agent stat watch:" + JSON.stringify(error))
                }
                else{
                //    console.log("agent response:" + JSON.stringify(response))
                }
            }); //end stat values put
        });
    }

}

logIntoCICAndStartWatches();

app.listen(app.get('port'), function() {
    console.log("Node app is running at localhost:" + app.get('port'))
})

app.get('/workgroups', function(request, response){
    response.send(watchedWorkgroupList);
})

app.get('/workgroupstatistics', function(request, response){

    var workgroupStats = stats.getWorkgroupStatCatalog();

    if(request.query.workgroups == null || request.query.workgroups == 'null')
    {
        response.send(workgroupStats);
        return;
    }

    var workgroupFilter = request.query.workgroups.toLowerCase().split(',')
    var returnData = {};

    for(var workgroupKey in workgroupStats){
        if(workgroupFilter.indexOf(workgroupKey.toLowerCase()) > -1){
            returnData[workgroupKey] = workgroupStats[workgroupKey];
        }
    }
    response.send(returnData);
})

app.get('/agentstatistics', function(request, response){

    var agentStats = stats.getAgentStatCatalog();

    if(request.query.workgroups == null || request.query.workgroups == 'null')
    {
        response.send(agentStats);
        return;
    }

    var workgroupFilter = request.query.workgroups.toLowerCase().split(',')
    var returnData = {};

    for(var workgroupKey in workgroupStats){
        if(workgroupFilter.indexOf(workgroupKey.toLowerCase()) > -1){
            returnData[workgroupKey] = agentStats[workgroupKey];
        }
    }
    response.send(returnData);
})
