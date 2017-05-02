/**
 * Utility api for VCA app
 */

var utils = {};

//Required modules
var msgConfig = require('./messages.js');

//Variables & constant decalration
utils.singleSlash = '/';
utils.protocol = 'http';
utils.colon = ':';
utils.dollar = '$';
utils.hyphen = '-';
utils.comma = ',';
utils.doubleSlash = '//';

function isNull(str){
    
};

//Get time session for greeting msg
function getTimeSession(){

    console.log('In getTimeSession() of utility');    
    var currTimeStamp = new Date();  

    /* hour is before noon */
    if ( currTimeStamp.getHours() < 12 )  { 
        return msgConfig.goodMgMsg;
    } 
    else  /* Hour is from noon to 5pm */
    if ( currTimeStamp.getHours() >= 12 && currTimeStamp.getHours() < 17 ) { 
        return msgConfig.goodAftMsg
    } 
    else  /* the hour is after 5pm, so it is between 5pm and midnight */
    if ( currTimeStamp.getHours() >= 17 && currTimeStamp.getHours() <= 24 ) { 
        return msgConfig.goodEveMsg;
    } 
};

function formatCartItems(cartList,callback){

    console.log(cartList.length);
    var cartListJson = "[";
    var cnt = 0;
    for(i=0; i<cartList.length; i++){
        if(i < cartList.length-1)
            cartListJson += '{"name":"'+cartList[i] +'"}' + ",";
        else
            cartListJson += '{"name":"'+cartList[i] +'"}'; 
    }
    cartListJson += "]";
    console.log(cartListJson);
    callback(cartListJson);
};

//=========================================================
// Utilities
//=========================================================
function hasAudioAttachment(session) {
    return session.message.attachments.length > 0 &&
        (session.message.attachments[0].contentType === 'audio/wav' ||
            session.message.attachments[0].contentType === 'application/octet-stream');
}

function getAudioStreamFromMessage(message) {
    var headers = {};
    var attachment = message.attachments[0];
    if (checkRequiresToken(message)) {
        // The Skype attachment URLs are secured by JwtToken,
        // you should set the JwtToken of your bot as the authorization header for the GET request your bot initiates to fetch the image.
        // https://github.com/Microsoft/BotBuilder/issues/662
        connector.getAccessToken(function (error, token) {
            var tok = token;
            headers['Authorization'] = 'Bearer ' + token;
            headers['Content-Type'] = 'application/octet-stream';

            return needle.get(attachment.contentUrl, { headers: headers });
        });
    }

    headers['Content-Type'] = attachment.contentType;
    return needle.get(attachment.contentUrl, { headers: headers });
}

function checkRequiresToken(message) {
    return message.source === 'skype' || message.source === 'msteams';
}

function processText(text) {
    var result = 'You said: ' + text + '.';

    if (text && text.length > 0) {
        var wordCount = text.split(' ').filter(function (x) { return x; }).length;
        result += '\n\nWord Count: ' + wordCount;

        var characterCount = text.replace(/ /g, '').length;
        result += '\n\nCharacter Count: ' + characterCount;

        var spaceCount = text.split(' ').length - 1;
        result += '\n\nSpace Count: ' + spaceCount;

        var m = text.match(/[aeiou]/gi);
        var vowelCount = m === null ? 0 : m.length;
        result += '\n\nVowel Count: ' + vowelCount;
    }

    return result;
}

/**
 * Grants public access to api methods
 */
module.exports.getTimeSession = getTimeSession;
module.exports.formatCartItems = formatCartItems;
module.exports.utils = utils;