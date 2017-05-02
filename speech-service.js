var uuid = require('node-uuid'),
    request = require('request');

var SPEECH_API_KEY = process.env.FUNFOODS_SPEECH_API_KEY;

var TOKEN_EXPIRY_IN_SECONDS = 600;

var speechApiAccessToken = '';

var instanceId = uuid.v4();

exports.getTextFromAudioStream = function(stream){
    return new Promise(
        function(resolve, reject) {
            if(!speechApiAccessToken) {
                try{
                    authenticate(function(){
                        streamToText(stream, resolve, reject);
                    });
                } catch(exception) {
                    reject(exception);
                }
            } else {

            }
        }
    );
};

function authenticate(callback) {
    var requestData = {
        url: 'https://api.cognitive.microsoft.com/sts/v1.0/issueToken',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Ocp-Apim-Subscription-Key': SPEECH_API_KEY
        }
    };

    request.post(requestData, function(error, response, token){
        if(error) {
            console.error(error);
        } else if(response.statusCode !== 200) {
            console.error(token);
        } else {
            speechApiAccessToken = 'Bearer ' + token;
            setTimeout(authenticate, (TOKEN_EXPIRY_IN_SECONDS - 60) * 1000);
            if(callback){
                callback();
            }
        }
    });
}

function streamToText(stream, resolve, reject) {
    var speechApiUrl = [
        'https://speech.platform.bing.com/recognize?scenarios=smd',
        'appid=D4D52672-91D7-4C74-8AD8-42B1D98141A5',
        'locale=en-US',
        'device.os=Windows Phone OS',
        'version=3.0',
        'format=json',
        'form=BCSSTT',
        'instanceid=' + instanceId,
        'requestid=' + uuid.v4() 
    ].join('&');

    var speechRequestData = {
        url: speechApiUrl,
        headers: {
            'Authorization': speechApiAccessToken,
            'content-type': 'audio/wav, codec=\'audio/pcm\'; samplerate=16000'            
        }
    };

    stream.pipe(request.post(speechRequestData, function(error, response, body){
        if (error) {
            reject(error);
        } else if(response.statusCode !== 200) {
            reject(body);
        } else {
            resolve(JSON.parse(body).header.name);
        }
    }));
}