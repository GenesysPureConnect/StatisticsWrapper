
var csrfToken = null;
var setCookie = null;
var sessionId = null;
var fullServerUrl = null;

module.exports = {


    loginRequestOptions: function (server, cic, username, password){
        console.log('login request options\nserver: ' + server + "\ncic: " + cic)

        var url = '';

        if(cic == null || cic == ''){
            url = server + '/icws/connection';
        }else{
            url = server + "/" + cic + '/icws/connection';

        }
        console.log(url)

        var options = {
            url: url,
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


    connectionComplete: function(connectedServerUrl, connectionInformation){
        fullServerUrl = connectedServerUrl.replace("/icws/connection", "");
        setCookie = connectionInformation['set-cookie'];
        sessionId = connectionInformation['inin-icws-session-id'];
        csrfToken = connectionInformation['inin-icws-csrf-token'];

    },

    getRequestOptions: function (method, url, data){
        var options = {
            url: fullServerUrl +"/icws/" + sessionId + url,
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
