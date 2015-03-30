var workgroupStatCatalog = {};
var agentStatCatalog = {};
var alertCatalog= {};
var currentAlertList = {}

function getAlertDefinition(definitionId)
{
    for(var id in alertCatalog)
        {
            for(var d=0;d< alertCatalog[id].length;d++ ){
                if(alertCatalog[id][d].alertDefinitionId === definitionId){
                    return alertCatalog[id][d];
                }
            }
        }
    }

    function getAlertRule(ruleId, definition){
        var rules = definition.alertRules;
        for(var x=0; x<rules.length; x++){
            var rule = rules[x];
            if(rule.alertRuleId === ruleId){
                return rule;
            }
        }
    }

    function addWorkgroupAlertNotification(workgroup, statName, interval, alertNotification){
        if(currentAlertList[workgroup] == null){
            currentAlertList[workgroup]={}
        }

        var alertNotifications = null

        if(interval == null){

            console.log("workgroup alert for stat " + statName + " for " + workgroup);
            if(currentAlertList[workgroup][statName] == null){
                currentAlertList[workgroup][statName] = {};
            }

            alertNotifications = currentAlertList[workgroup][statName];
        }
        else {
            console.log("workgroup interval stat " + statName+ " for " + workgroup + " and interval " + interval);

            if(currentAlertList[workgroup][interval] == null){
                currentAlertList[workgroup][interval] = {};
            }

            if(currentAlertList[workgroup][interval][statName] == null){
                currentAlertList[workgroup][interval][statName] = {};
            }

            alertNotifications = currentAlertList[workgroup][interval][statName];

        }

        if(alertNotifications[alertNotification.alertRuleId] == null){
            alertNotifications[alertNotification.alertRuleId]  = alertNotification
        }
    }

    function removeWorkgroupAlertNotification(workgroup, statName, interval, alertNotification){
        if(currentAlertList[workgroup] == null){
            return
        }

        var alertNotifications = null

        if(interval == null){

            if(currentAlertList[workgroup][statName] == null){
                return
            }

            alertNotifications = currentAlertList[workgroup][statName];
        }
        else {

            if(currentAlertList[workgroup][interval] == null){
                return
            }

            if(currentAlertList[workgroup][interval][statName] == null){
                return;
            }

            alertNotifications = currentAlertList[workgroup][interval][statName];

        }

        if(alertNotifications[alertNotification.alertRuleId] != null){
            delete alertNotifications[alertNotification.alertRuleId]
        }
    }

    function getWorkgroupAlertLevel(workgroup, statName, interval){

        if(currentAlertList[workgroup] == null){
            return getDefaultAlertSettings()
        }

        var alertNotifications = null

        if(interval == null){
            if(currentAlertList[workgroup][statName] == null){
                return getDefaultAlertSettings()
            }

            alertNotifications = currentAlertList[workgroup][statName];
        }
        else{
            if(currentAlertList[workgroup][interval] == null){
                return getDefaultAlertSettings()
            }

            if(currentAlertList[workgroup][interval][statName] == null){
                return getDefaultAlertSettings()
            }

            alertNotifications = currentAlertList[workgroup][interval][statName];

        }

        var severity = -1;
        var alertSettings = getDefaultAlertSettings();

        for(var key in alertNotifications){
            var alertNotification = alertNotifications[key]
            var definition = getAlertDefinition(alertNotification.alertDefinitionId);
            var alertRule = getAlertRule(alertNotification.alertRuleId, definition);

            //console.log("Get Alert Level alert: " + JSON.stringify(alertRule))

            if(alertRule != null && alertRule.alertSeverity > severity){
                alertSettings = getDefaultAlertSettings(); //reset it to normal
                alertSettings.severity = alertRule.alertSeverity;

                for(var i=0;i < alertRule.alertActions.length; i++){
                        var action = alertRule.alertActions[i];
                        if(action.targetId == "ININ.Supervisor.IconAlertAction"){
                            alertSettings.showIcon = true;
                        }
                        else if(action.targetId == "ININ.Supervisor.FontAlertAction"){
                            console.log(JSON.stringify(action["namedValues"]))
                            var backgroundRGBA = action["namedValues"]["ININ.Supervisor.FontAlertAction.BackgroundColor"];
                            var foregroundRGBA = action["namedValues"]["ININ.Supervisor.FontAlertAction.TextColor"];

                            function decStringToHex(decString){
                                var hex = parseInt(decString).toString(16)

                                if(hex.length == "1"){
                                    return "0" + hex;
                                }

                                return hex;
                            }

                            function parseRGBA(rgba){
                                var arr = rgba.split(":");
                                var hex = "#" + decStringToHex(arr[1]) + decStringToHex(arr[2]) + decStringToHex(arr[3])
                                console.log("pars RGB " + rgba + " = " + hex)
                                return hex;
                            }

                            if(backgroundRGBA != null){
                                var background = parseRGBA(backgroundRGBA);
                                alertSettings.backgroundColor = background;
                            }

                            if(foregroundRGBA != null){
                                alertSettings.fontColor = parseRGBA(foregroundRGBA);
                            }
                        }
                    }
            //    }

            }

        }

        return alertSettings;
    }


    function getWorkgroupForStatistic (statistic){
        var paramValues = statistic.statisticKey.parameterValueItems;

        for(var i = 0; i < paramValues.length; i++){
            if(paramValues[i].parameterTypeId == "ININ.People.WorkgroupStats:Workgroup"){
                return paramValues[i].value;
            }
        }

        return null;
    }

    function getAgentForStatistic (statistic){
        var paramValues = statistic.statisticKey.parameterValueItems;

        for(var i = 0; i < paramValues.length; i++){
            if(paramValues[i].parameterTypeId == "ININ.People.AgentStats:User"){
                return paramValues[i].value;
            }
        }

        return null;
    }

    function getDefaultAlertSettings(){
        var alert = {};
        alert.severity = 0;
        alert.fontColor = "#000000";
        alert.backgroundColor = "#FFFFFF";
        alert.showIcon = false;
        return alert;
    }

    function getIntervalForStatistic (statistic){
        var paramValues = statistic.statisticKey.parameterValueItems;

        for(var i = 0; i < paramValues.length; i++){
            if(paramValues[i].parameterTypeId == "ININ.Queue:Interval"){
                return paramValues[i].value;
            }
        }

        return null;
    }

    function getStatisticName (statistic){
        var id = statistic.statisticKey.statisticIdentifier;

        return id.split(':')[1];

    }

    function getStatisticValue (statistic){

        if(statistic.statisticValue == null){
        //    console.log("Value is null")
            return null;
        }

        if(statistic.statisticValue['__type']=='urn:inin.com:statistics:statisticErrorValue'){
            var errorMessage = "";
            switch(statistic.statisticValue.value){
                case 1:
                    errorMessage = "Malformed Statistic Key";
                    break;
                case 2:
                    errorMessage = "Unknown Statistic Key";
                    break;
                case 3:
                    errorMessage = "Statistic Provider Too Busy";
                    break;
                default:
                    errorMessage = "Unknown, value: " + statistic.statisticValue.value;
            }

            throw errorMessage;
        }

        //console.log("Value is " + statistic.statisticValue.value)
        return statistic.statisticValue.value;
    }

    module.exports = {

        workgroupStats : ['inin.workgroup:TotalAgents', 'inin.workgroup:LoggedIn', 'inin.workgroup:NumberAvailableForACDInteractions', 'inin.workgroup:InteractionsWaiting'],
        workgroupIntervalStats : ['inin.workgroup:InteractionsEntered', 'inin.workgroup:InteractionsAnswered', 'inin.workgroup:InteractionsCompleted', 'inin.workgroup:AverageTalkTime', 'inin.workgroup:AverageWaitTime'],
        agentStats : ['inin.agent:AverageHoldTime', 'inin.agent:AverageTalkTime', 'inin.agent:InteractionsEntered', 'inin.agent:InteractionsAnswered', 'inin.agent:LongestTalkTime', 'inin.agent:NonACDInteractions'],


        isWorkgroupStatistic: function(statistic){
            return statistic.statisticKey.statisticIdentifier.indexOf('inin.workgroup') == 0;
        },

        isAgentStatistic: function(statistic){
            return statistic.statisticKey.statisticIdentifier.indexOf('inin.agent') == 0;
        },

        alertCatalogUpdated: function (change){

            var removedSets = change.alertSetsRemoved;
            if(removedSets != null){
                for(var x=0; x<removedSets.length;x++){
                    var alert = removedSets[x];
                    if(alertCatalog[alert.alertSetId]){
                        delete alert.alertSetId;
                    }
                }
            }

            var changedSets = change.alertSetsChanged;
            if(changedSets != null)
            {
                for(var x=0; x<changedSets.length;x++){
                    var alert = changedSets[x];
                    alertCatalog[alert.alertSetId] = alert.alertDefinitions;
                }
            }

            var addedSets = change.alertSetsAdded;
            if(addedSets != null){
                for(var x=0; x<addedSets.length;x++){
                    var alert = addedSets[x];
                    alertCatalog[alert.alertSetId] = alert.alertDefinitions;
                }
            }

        },

        handleAlertNotification: function (alert){

            var definition = getAlertDefinition(alert.alertDefinitionId);

            if(definition == null)
            {
                return
            }

            var statId = definition.statisticKey.statisticIdentifier;

            var workgroup = getWorkgroupForStatistic(definition);

            if(this.workgroupStats.indexOf(statId) > -1){

            //    console.log("workgroup stat alert " + statId + " for " + workgroup);
                if(!alert.cleared){
                    addWorkgroupAlertNotification(workgroup, statId, null, alert)
                }
                else
                {
                    removeWorkgroupAlertNotification(workgroup, statId, null, alert)
                }
                var alertLevel = getWorkgroupAlertLevel(workgroup, statId, null)


                if(workgroupStatCatalog[workgroup] == null){
                    return;
                }
                if(workgroupStatCatalog[workgroup][statId.split(':')[1]] == null){
                    workgroupStatCatalog[workgroup][statId.split(':')[1]] = {alert:getDefaultAlertSettings(), value:null};
                }
                workgroupStatCatalog[workgroup][statId.split(':')[1]].alert = alertLevel;
            }
            else if(this.workgroupIntervalStats.indexOf(statId) > -1){
                var interval = getIntervalForStatistic(definition);
                if(!alert.cleared){
                    addWorkgroupAlertNotification(workgroup, statId, interval, alert)
                }
                else{
                    removeWorkgroupAlertNotification(workgroup, statId, interval, alert)
                }
                var alertLevel = getWorkgroupAlertLevel(workgroup, statId, interval)

                if(workgroupStatCatalog[workgroup][interval][statId.split(':')[1]] == null){
                    workgroupStatCatalog[workgroup][interval][statId.split(':')[1]] = {alert:getDefaultAlertSettings(), value:null};
                }

                workgroupStatCatalog[workgroup][interval][statId.split(':')[1]].alert = alertLevel;
            }
        },

        addWorkgroupStatToCatalog : function(statistic){
            var workgroup = "";
            var statName = "";
            var interval = "";
            var value ="";
            try
            {
                workgroup = getWorkgroupForStatistic(statistic);
                statName = getStatisticName(statistic);
                interval = getIntervalForStatistic(statistic);
                value = getStatisticValue(statistic);
            }
            catch(e){
                console.log("Error in addWorkgroupStatToCatalog: " + e);
                console.log("error params: " + workgroup + "-"+ statName + "-" + interval);
                return;
            }
            //console.log("adding: " + workgroup + "-"+ statName + "-" + interval);
            //console.log(JSON.stringify(statistic));

            if(workgroupStatCatalog[workgroup] == null){
                workgroupStatCatalog[workgroup] = {};
            }

            if(interval != null){
                if(workgroupStatCatalog[workgroup][interval] == null){
                    workgroupStatCatalog[workgroup][interval] = {};
                }

                if(workgroupStatCatalog[workgroup][interval][statName] == null){
                    workgroupStatCatalog[workgroup][interval][statName] = {alert:getDefaultAlertSettings(), value:null};
                }

                workgroupStatCatalog[workgroup][interval][statName].value = getStatisticValue(statistic);
            }
            else{
                if(workgroupStatCatalog[workgroup][statName] == null){
                    workgroupStatCatalog[workgroup][statName] = {alert:getDefaultAlertSettings(), value:null};
                }

                workgroupStatCatalog[workgroup][statName].value = getStatisticValue(statistic);
            }
        },

        addAgentStatToCatalog : function(statistic){
            var workgroup = "";
            var statName = "";
            var interval = "";
            var agent = "";
            var value = "";

            try
            {
                workgroup = getWorkgroupForStatistic(statistic);
                statName = getStatisticName(statistic);
                interval = getIntervalForStatistic(statistic);
                agent = getAgentForStatistic(statistic);
                value = getStatisticValue(statistic);
            }
            catch(e){
                console.log("Error in addAgentStatToCatalog: " + e);
                console.log("stat params: " + agent + '-' + workgroup + "-"+ statName + "-" + interval);
                return;
            }

        //    console.log("adding agent : " + agent + '-' + workgroup + "-"+ statName + "-" + interval + "-" + JSON.stringify(statistic));
            //console.log(JSON.stringify(statistic));

            if(agentStatCatalog[workgroup] == null){
                agentStatCatalog[workgroup] = {};
            }

            if(agentStatCatalog[workgroup][agent] == null){
                agentStatCatalog[workgroup][agent] = {};
            }

            if(agentStatCatalog[workgroup][agent][interval] == null){
                agentStatCatalog[workgroup][agent][interval] = {};
            }

            if(agentStatCatalog[workgroup][agent][interval][statName] == null){
                agentStatCatalog[workgroup][agent][interval][statName] = {alert:getDefaultAlertSettings(), value:null};
            }

            agentStatCatalog[workgroup][agent][interval][statName].value = getStatisticValue(statistic);
        },

        getAgentStatCatalog: function(){
            return agentStatCatalog;
        },

        getWorkgroupStatCatalog: function(){
            return workgroupStatCatalog;
        }

    };
