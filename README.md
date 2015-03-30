Statistics Wrapper
===========================
This NodeJS application is a web service that will server statistics and alerts from CIC in a simple to consume JSON interface.  It connects to CIC through ICWS so you need the ICWS license for it to work.  

Statistics
----------
The following statistics are currently polled

**Workgroup**  
TotalAgents, LoggedIn, NumberAvailableForACDInteractions, InteractionsWaiting

**Workgroup Intervals**
(Current Period, Current Shift)  
InteractionsEntered, InteractionsAnswered, InteractionsCompleted, AverageTalkTime, AverageWaitTime


URLs
----------
**/workgroupstatistics?workgroups=marketing,support**  
Request workgroup statistics.  The workgroups query string parameter is optional and can be used to filter what workgroup stats are returned.  Without the parameter set, it will return all workgroups that are configured on the server

**/workgroups**  
List of workgroups that are watched.

Environment Parameters
----------
The following environment parameters must be configured in order to connect to the CIC server

**CicUser** - User to connect to the server with.  This user should have rights to view workgroup statistics.  
**CicPassword** - Password for the CicUser
**CicUrl** - the url to reach the server e.g http://yourserver:8018/ or reverse proxy i.e. http://proxy/ where the path http://proxy/cicservername/icws will hit the icws endpoint on your cic server
**CicServer** - the first cic server to try to connect to.  Leave blank if not using a reverse proxy.
**WorkgroupFilter**  - comma separated workgroups to get stats for.  If this parameter is blank, all workgroups will be watched.

Deploying to the Cloud
----------
**Heroku**  
Use this button to deploy the application right to Heroku.  This does require that ICWS is exposed to the public internet with a reverse proxy.  
[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/InteractiveIntelligence/StatisticsWrapper)

**Docker**  
Work to deploy to docker is under way, but not complete.  Feel free to contribute to help add Docker support.

Example JSON
----------
**Workgroup Statistics**

    {
      "Marketing": {
        "TotalAgents": {
          "alert": {
            "severity": 0,
            "fontColor": "#000000",
            "backgroundColor": "#FFFFFF",
            "showIcon": false
          },
          "value": 440
        },
        "LoggedIn": {
          "alert": {
            "severity": 0,
            "fontColor": "#000000",
            "backgroundColor": "#FFFFFF",
            "showIcon": false
          },
          "value": 13
        },
        "NumberAvailableForACDInteractions": {
          "alert": {
            "severity": 0,
            "fontColor": "#000000",
            "backgroundColor": "#FFFFFF",
            "showIcon": false
          },
          "value": 0
        },
        "InteractionsWaiting": {
          "alert": {
            "severity": 0,
            "fontColor": "#000000",
            "backgroundColor": "#FFFFFF",
            "showIcon": false
          },
          "value": 0
        },
        "CurrentShift": {
          "InteractionsEntered": {
            "alert": {
              "severity": 0,
              "fontColor": "#000000",
              "backgroundColor": "#FFFFFF",
              "showIcon": false
            },
            "value": 50
          },
          "InteractionsAnswered": {
            "alert": {
              "severity": 0,
              "fontColor": "#000000",
              "backgroundColor": "#FFFFFF",
              "showIcon": false
            },
            "value": 48
          },
          "InteractionsCompleted": {
            "alert": {
              "severity": 0,
              "fontColor": "#000000",
              "backgroundColor": "#FFFFFF",
              "showIcon": false
            },
            "value": 50
          },
          "AverageTalkTime": {
            "alert": {
              "severity": 0,
              "fontColor": "#000000",
              "backgroundColor": "#FFFFFF",
              "showIcon": false
            },
            "value": 4700
          },
          "AverageWaitTime": {
            "alert": {
              "severity": 0,
              "fontColor": "#000000",
              "backgroundColor": "#FFFFFF",
              "showIcon": false
            },
            "value": 227
          }
        },
        "CurrentPeriod": {
          "InteractionsEntered": {
            "alert": {
              "severity": 0,
              "fontColor": "#000000",
              "backgroundColor": "#FFFFFF",
              "showIcon": false
            },
            "value": 3
          },
          "InteractionsAnswered": {
            "alert": {
              "severity": 0,
              "fontColor": "#000000",
              "backgroundColor": "#FFFFFF",
              "showIcon": false
            },
            "value": 3
          },
          "InteractionsCompleted": {
            "alert": {
              "severity": 0,
              "fontColor": "#000000",
              "backgroundColor": "#FFFFFF",
              "showIcon": false
            },
            "value": 8
          },
          "AverageTalkTime": {
            "alert": {
              "severity": 0,
              "fontColor": "#000000",
              "backgroundColor": "#FFFFFF",
              "showIcon": false
            },
            "value": 1293
          },
          "AverageWaitTime": {
            "alert": {
              "severity": 0,
              "fontColor": "#000000",
              "backgroundColor": "#FFFFFF",
              "showIcon": false
            },
            "value": 41
          }
        }
      }
    }


Other Notes
----------
Unit Tests use Mocha

Alert severity:  
none - 0  
normal - 1  
minor - 2  
major - 3  
warning - 4  
critical - 5  
