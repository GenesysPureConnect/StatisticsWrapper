var assert = require('assert')
var stats = require('../statistics');

describe('Stats Tests',function(){

  it('Process workgroup test',function(){
      var stat = {
        "statisticKey": {
          "statisticIdentifier": "inin.workgroup:NumberAvailableForACDInteractions",
          "parameterValueItems": [
            {
              "parameterTypeId": "ININ.People.WorkgroupStats:Workgroup",
              "value": "Swat Team"
            }
          ]
        },
        "statisticValue": {
          "__type": "urn:inin.com:statistics:statisticIntValue",
          "value": 100,
          "statisticValueType": 0
        }
    };

    stats.addWorkgroupStatToCatalog(stat);

    var catalog = stats.getWorkgroupStatCatalog();
    assert.equal(100, catalog["Swat Team"].NumberAvailableForACDInteractions.value);
  });


    it('Process workgroup interval stat test',function(){

        var interval = "SDFLSKJDFSLDFK";

        var stat = {
        "statisticKey": {
          "statisticIdentifier": "inin.workgroup:InteractionsEntered",
          "parameterValueItems": [
            {
              "parameterTypeId": "ININ.People.WorkgroupStats:Workgroup",
              "value": "Swat Team"
            },
            {
              "parameterTypeId": "ININ.Queue:Interval",
              "value": interval
            }
          ]
        },
        "statisticValue": {
          "__type": "urn:inin.com:statistics:statisticIntValue",
          "value": 100,
          "statisticValueType": 0
        }
      };

      stats.addWorkgroupStatToCatalog(stat);

      var catalog = stats.getWorkgroupStatCatalog();
      assert.equal(100, catalog["Swat Team"][interval].InteractionsEntered.value);
    });
/*
  it('POST /users should return 200',function(done){
    request()
      .post('/users')
      .set('Content-Type','application/json')
      .write(JSON.stringify({ username: 'test', password: 'pass' }))
      .expect(200,done);
  });*/
});
