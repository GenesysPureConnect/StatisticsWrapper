var _cicUser = process.env.CicUser;
var _cicPassword = process.env.CicPassword;
var _cicUrl = process.env.CicUrl;
var _cicServer = process.env.CicServer;

var envWorkgroupFilter = process.env.WorkgroupFilter || "Marketing,Support"
var _workgroupFilter = envWorkgroupFilter.split(',')


var _intervals = ["CurrentShift", "CurrentPeriod"];

module.exports = {
    cicUser: _cicUser,
    cicPassword: _cicPassword,
    cicUrl:_cicUrl,
    cicServer: _cicServer,
    workgroupFilter: _workgroupFilter,
    intervals: _intervals,

}
