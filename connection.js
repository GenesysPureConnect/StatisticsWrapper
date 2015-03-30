
var csrfToken = null;
var setCookie = null;
var sessionId = null;
var server = null;

module.exports = {


    loginRequestOptions: function (server, cic, username, password){
        var options = {
            url: server + "/" + cic + '/icws/connection',
            json: true,
            body: {
                '__type':'urn:inin.com:connection:icAuthConnectionRequestSettings',
                'applicationName' :"Statistics Aggregator",
                'userID': username,
                'password' : password

            },
            method:"POST",
            headers: {
                "Accept-Language":"en-us"
            }
        };

        return options;
    },


    connectionComplete: function(serverUrl, cicServerName, connectionInformation){
        server = serverUrl;
        cicServer = cicServerName;
        setCookie = connectionInformation['set-cookie'];
        sessionId = connectionInformation['inin-icws-session-id'];
        csrfToken = connectionInformation['inin-icws-csrf-token'];

    },

    getRequestOptions: function (method, url, data){
        var options = {
            url: server + "/" + cicServer +"/icws/" + sessionId + url,
            json: true,
            body: data,
            method:method,
            headers: {
                "Accept-Language":"en-us",
                "cookie":setCookie,
                "ININ-ICWS-CSRF-Token": csrfToken,

            }
        };

        return options;
    }

};
