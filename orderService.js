/**
 * Order lifecycle management service api
 */

//Required modules
var http = require("http");
var utils = require('./utility.js');
var HashMap = require('hashmap');
var config = require('./config.js');

var mainCourseItemsMap = new HashMap();

/**
 * Prepare business card items in a structured way
 */
function prepareBusinessCard(json, currIntent) {
    var item = "";
    var resultantCard = "";
    var sequence = 0;
    if(currIntent != null){
        console.log("currIntent :"+currIntent);
        var card = JSON.parse(json);
        if(currIntent != config.REST_SERVICE_LOOKUP_ID_MAINCOURSE){
            for(var menu in card) {
                item = card[menu].Name;
                id = card[menu].ID;
                mainCourseItemsMap.set(item,id);
                console.log('In prepareBusinessCard() Not MainCourseConfirmation - '+item);
                resultantCard += (++sequence) + ") " + item + " ";   
            }
        } else{
            for(var menu in card) {
                item = card[menu].Name + ', $' + card[menu].Rate + ' - ' + card[menu].Description;
                console.log('In prepareBusinessCard() MainCourseConfirmation - '+item);
                resultantCard += (++sequence) + ") " + item + " ";   
            }   
        }
    }
    console.log('In prepareBusinessCard result :' + resultantCard);
    return resultantCard;
};

/**
 * Get business card items for given intent
 */
function getMainCourseBusinessCardItems(id,intentId,callback){
    console.log('In getBusiness : '+intentId + id);
    var url = config.APP_JS_URL + intentId + '/' + id;
    console.log(url);
    doAjaxCall4BusinessCards(url,intentId,callback);
};

function getBusinessCardItems(intentId,callback){
    console.log('In getBusinessCardItems() : '+intentId);
    var url = config.APP_JS_URL + intentId ;
    console.log(url);
    doAjaxCall4BusinessCards(url,intentId,callback);
};

function doAjaxCall4BusinessCards(url,intentId,callback){
    var options = {
        host: config.APP_JS_SERVER_HOST_NAME,
        port: config.APP_JS_SERVER_PORT_NO,
        path: url,
        method: 'GET'
    };
     
    var req = http.request(options, function (res) {
        var responseString = "";
        console.log('In getBusinessCardItems() : inside request');
        res.on("data", function (data) {
            console.log('data from order mgmt api service'+data);
            responseString += data;
        });
        res.on("end", function () {
            console.log('responseString from order mgmt api service'+responseString);
            var cardResponse = prepareBusinessCard(responseString, intentId);
            console.log("res"+cardResponse);
            callback(cardResponse);
        });
    });
    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });
    req.end();
   
    console.log("end");
};

/**
 * Get summary of cart items for given cart list
 */
function getSumAmtforCartItems(cartList,callback){
    console.log('In getSumAmtforCartItems() : '+cartList);
    //console.log('JSON.parse(cartList) '+JSON.parse(cartList));
    var options = {
        host: config.APP_JS_SERVER_HOST_NAME,
        port: config.APP_JS_SERVER_PORT_NO,
        path: config.APP_JS_URL +'/' + config.REST_SERVICE_LOOKUP_ID_SUMMARY,
        method: 'POST',
        json: true,
        headers: {
            "content-type": "application/json"
        }
    };
     
    var req = http.request(options, function (res) {
        var responseString = "";
        console.log('In getSummary() : inside request');
        res.on('data', function (body) {
            console.log('data from order mgmt api service'+body);
            responseString += body;
        });
        res.on('end', function () {
            console.log('responseString from order mgmt api service'+responseString);
            callback(responseString);
        });
    });
    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });
   
    req.write(cartList);
    req.end();
    console.log("end");
};

/**
 * save the conversation for the cartlist
 */
function saveConversationData(conversation_id, intent, createdDate, utterances,entities, features,callback){
    console.log('In saveConversationData()');
    var isSaved = false;
    var response ='';
        if(utterances!=null){
         for(i=0; i<utterances.length; i++) {
            if(i < utterances.length-1) {
                response += '{"text": "'+utterances[i] + '"},';
            } else {
            response += '{"text": "'+utterances[i] + '"}';
            }
         }
     }
   
    var cartList = '{"conversation_id" :"' + conversation_id + '",' +'"intent": "' + intent + '",'+ '"createdDate":"' + createdDate + '",'+ '"utterances": ['+ response+ '],'+ '"entities": "'+ entities + '",'+ '"features": "' + features + '" }';
    console.log("CARTLIST"+cartList);
    var options = {
        host: config.APP_JS_SERVER_HOST_NAME,
        port: config.APP_JS_SERVER_PORT_NO,
        path:'/VCABotApplication/analytics/conversation',
        method: 'POST',
        json: true,
        headers: {
            "content-type": "application/json"
        }
    };

    var req = http.request(options, function (res) {
        var responseString = "";
        console.log('In saveConversationData() : inside request');
        res.on('data', function (body) {
            console.log('data from order mgmt api service->'+body);
            responseString += body;
        });
        res.on('end', function () {
            console.log('responseString from order mgmt api service->'+responseString);
            isSaved = true;
            callback(isSaved);
        });
    });
    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });
   
    req.write(cartList);
    req.end();
    console.log("end");
};

/**
 * Grants public access to api methods
 */
module.exports.prepareBusinessCard = prepareBusinessCard;
module.exports.getBusinessCardItems = getBusinessCardItems;
module.exports.getMainCourseBusinessCardItems = getMainCourseBusinessCardItems;
module.exports.mainCourseItemsMap = mainCourseItemsMap;
module.exports.getSumAmtforCartItems = getSumAmtforCartItems;
module.exports.saveConversationData = saveConversationData;