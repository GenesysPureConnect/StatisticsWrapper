var workgroupStatCatalog = {};

function getWorkgroupForStatistic (statistic){
    var paramValues = statistic.statisticKey.parameterValueItems;

    for(var i = 0; i < paramValues.length; i++){
        if(paramValues[i].parameterTypeId == "ININ.People.WorkgroupStats:Workgroup"){
            return paramValues[i].value;
        }
    }

    return null;
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
        return null;
    }

    return statistic.statisticValue.value;
}

module.exports = {

  workgroupStats : ['inin.workgroup:TotalAgents', 'inin.workgroup:LoggedIn', 'inin.workgroup:NumberAvailableForACDInteractions'],
  workgroupIntervalStats : ['inin.workgroup:InteractionsEntered', 'inin.workgroup:InteractionsAnswered', 'inin.workgroup:InteractionsCompleted', 'inin.workgroup:AverageTalkTime', 'inin.workgroup:AverageWaitTime'],

  isWorkgroupStatistic: function(statistic){
      return statistic.statisticKey.statisticIdentifier.indexOf('inin.workgroup') == 0;
  },

  addWorkgroupStatToCatalog : function(statistic){
      var workgroup = getWorkgroupForStatistic(statistic);
      var statName = getStatisticName(statistic);
      var interval = getIntervalForStatistic(statistic);

      if(workgroupStatCatalog[workgroup] == null){
          workgroupStatCatalog[workgroup] = {};
      }

      if(interval != null){
          if(workgroupStatCatalog[workgroup][interval] == null){
              workgroupStatCatalog[workgroup][interval] = {};
          }

          if(workgroupStatCatalog[workgroup][interval][statName] == null){
              workgroupStatCatalog[workgroup][interval][statName] = {alert:0, value:null};
          }

          workgroupStatCatalog[workgroup][interval][statName].value = getStatisticValue(statistic);
      }
      else{
          if(workgroupStatCatalog[workgroup][statName] == null){
              workgroupStatCatalog[workgroup][statName] = {alert:0, value:null};
          }

          workgroupStatCatalog[workgroup][statName].value = getStatisticValue(statistic);
      }
  },

  getWorkgroupStatCatalog: function(){
      return workgroupStatCatalog;
  }

};
