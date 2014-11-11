SalesforceConsoleStatistics
===========================

Unit Tests use Mocha

Alert severity:
none - 0
normal - 1
minor - 2
major - 3
warning - 4
critical - 5


Request workgroup statistics:
/workgroupstatistics?workgroups=marketing,support

the workgroups query string parameter is optional. Without that parameter set, it will return all workgroups that are configured on the server


The following environment variables need to be set to connect to the server:
CicUser
CicPassword
CicUrl
WorkgroupFilter  - comma separated workgroups to get stats for. 
