// this loads the environment variables from the .env file
require('dotenv-extended').load();

// add your requirements
var restify = require('restify'),
    builder = require('botbuilder'),
    fs = require('fs'),
    needle = require('needle'),
    request = require('request'),
    url = require('url'),
    serveStatic = require('serve-static-restify'),    
    speechService = require('./speech-service.js'),
    config = require('./config.js'),
    msgConfig = require('./messages.js'),
    utils = require('./utility.js'),
    orderService = require('./orderService.js');

//Variable & constant declaration
var convId = '';
var convDate = '';
var features = null;
var utterances = [];
var entityCount = 0 ;
var intentCount = 0 ;
var currentIntent = '';
var intentsArray = ["MenuInquiry","MainCourseConfirmation","ExtrasConfirmation","StartersConfirmation",
                    "DrinksConfirmation","OrderClosure","SkipSelection"];    

// create chat bot
var connector = new builder.ChatConnector({ appId: process.env.FUNFOODS_APP_ID, appPassword: process.env.FUNFOODS_APP_PASSWORD });

var bot = new builder.UniversalBot(connector, function (session,args) {
        // Simply defer to help dialog for un-recognized intents
        session.userData.cart = [];
        convId = session.message.address.conversation.id;
        session.send(msgConfig.greetingMsg1 + utils.getTimeSession());
        session.send(msgConfig.greetingMsg2);
});

// integrate with the LUIS endpoint
var luisModel = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/a48955a8-3974-44fe-b9fe-89efde80dc36?subscription-key=f9f8e406ec524c76a70fad97a0d351a8&verbose=true&timezoneOffset=0&q=';
bot.recognizer(new builder.LuisRecognizer(luisModel));

bot.dialog('/menuInquiry', function (session,args) {
        intentCount++;
        currentIntent = intentsArray[0];
        console.log('In menuInquiry handler'+ currentIntent);
        orderService.getBusinessCardItems(config.REST_SERVICE_LOOKUP_ID_MENU,function(response){
            session.send(msgConfig.menuInquiryChoiceMsg);
            session.send(response);
            }) ;
    }
).triggerAction({ 
    matches: intentsArray[0]
});

bot.dialog('/mainCourseConfirmation', function (session, args) {
        intentCount++;
        currentIntent = intentsArray[1];
        console.log('In mainCourseConfirmation handler'+ currentIntent);
        var intent = args.intent;
        var item = builder.EntityRecognizer.findEntity(intent.entities, config.ENTITY_MAINCOURSE_ITEM);
        var subItem = builder.EntityRecognizer.findEntity(intent.entities, config.ENTITY_MAINCOURSE_SUB_ITEM);
        var id = '';
        var mapObj = '';

        if(null!=item && item){
             entityCount++;
             orderService.mainCourseItemsMap.forEach(function(value, key) {
                mapObj = key;
                console.log(item.entity + mapObj.toLowerCase());
                if(item.entity == mapObj.toLowerCase()){
                    id = value; 
                }
            });
            orderService.getMainCourseBusinessCardItems(id, config.REST_SERVICE_LOOKUP_ID_MAINCOURSE, function(response) {
             session.send(msgConfig.menuInquiryConfirmMsg);
             session.send(response);
            });
        }
        if(null!=subItem && subItem){
            if(null != subItem.entity) {
                 entityCount++;
                 session.userData.cart.push(subItem.entity); 
            }   
            console.log('In maincourse.subitem');
            orderService.getBusinessCardItems(config.REST_SERVICE_LOOKUP_ID_EXTRAS, function(response){
                session.send(msgConfig.extrasIdentifyMsg);
                session.send(response);
            }); 
        }
    }
).triggerAction({ 
    matches: intentsArray[1]
});

bot.dialog('/extrasConfirmation', function (session, args) {
        intentCount++;
        currentIntent = intentsArray[2];
        console.log('In extrasConfirmation handler'+ currentIntent);
        if(null!=args && null != args.intent && null!= args.intent.entities){
            var intent = args.intent;
            var item = builder.EntityRecognizer.findEntity(intent.entities, config.ENTITY_EXTRAS_ITEM);
            if(null!=item && null!=item.entity){
                session.userData.cart.push(item.entity);
                 entityCount++;
            }
        }
       orderService.getBusinessCardItems(config.REST_SERVICE_LOOKUP_ID_STARTERS, function(response){
                session.send(msgConfig.startersIdentifyMsg);
                session.send(response);
            });  
    }   
).triggerAction({ 
    matches: intentsArray[2]
});

bot.dialog('/startersConfirmation', function (session, args) {
        intentCount++;
        currentIntent = intentsArray[3];
        console.log('In startersConfirmation handler'+ currentIntent);
        if(null!=args && null != args.intent && null!= args.intent.entities){
            var intent = args.intent;
            var item = builder.EntityRecognizer.findEntity(intent.entities, config.ENTITY_STARTERS_ITEM);
            if(null!=item && null!=item.entity){
                entityCount++;
                session.userData.cart.push(item.entity);
                session.send(msgConfig.starterConfirmMsg1 + item.entity + msgConfig.starterConfirmMsg2);
            }
        }
       orderService.getBusinessCardItems(config.REST_SERVICE_LOOKUP_ID_DRINKS,function(response){
                session.send(msgConfig.drinksIdentifyMsg);
                session.send(response);
            }); 
    }   
).triggerAction({ 
    matches: intentsArray[3]
});

bot.dialog('/drinksConfirmation', function (session, args) {
        intentCount++;
        currentIntent = intentsArray[4];
        console.log('In DrinksConfirmation handler'+ currentIntent);
        if(null!=args && null != args.intent && null!= args.intent.entities){
            var intent = args.intent;
            var item = builder.EntityRecognizer.findEntity(intent.entities, config.ENTITY_DRINKS_ITEM);
            if(null!=item && null!=item.entity){
                entityCount++;
                session.userData.cart.push(item.entity);
                session.send(msgConfig.drinksConfirmMsg1 + item.entity + msgConfig.drinksConfirmMsg2);
            }
        }
        session.send(msgConfig.sumMsg1);
    }   
).triggerAction({ 
    matches: intentsArray[4]
});

bot.dialog('/orderClosure', function (session) {
        intentCount++;
        currentIntent = intentsArray[5];
        console.log('In OrderClosure handler'+ currentIntent);
        console.log(session.userData.cart);
        var cartListJson = '';
        var sumMsg = '';
        utils.formatCartItems(session.userData.cart, function(response){
            cartListJson = response;
        });
        orderService.getSumAmtforCartItems(cartListJson, function(response){
            sumMsg = msgConfig.sumMsg2 + response;
        });
        
       /* utterances.push('hi');
        utterances.push('helo');
        utterances.push('how r u');
        utterances.push('menu');
        utterances.push('pizza');
        utterances.push('zen');
        utterances.push('coke');
        utterances.push('thank u');
        utterances.push('welcome');*/

        /*var utterances = vcaAppServer.utterances;
        console.log("UTTERANCES"+utterances);*/
        var isConversationSaved = true;
        convDate = new Date().toISOString().slice(0,10);

        orderService.saveConversationData(convId,intentCount,convDate,utterances,entityCount,features, function(isConversationSaved) {
            if(isConversationSaved){
                session.send(sumMsg);
                session.endConversation(msgConfig.orderClosureMsg1);
            } else {
                //Write logic to handle saving conv data upon failure...
                session.endConversation(msgConfig.orderClosureMsg2);
            }
        });   
    }
       
).triggerAction({ 
    matches: intentsArray[5]
});

bot.dialog('/skipSelection', function (session, args) {
    intentCount++;
    console.log(currentIntent);
    
    switch (currentIntent) 
    { 
        case intentsArray[1]:
            session.beginDialog('/extrasConfirmation');
            break;
        
        case intentsArray[2]:
            session.beginDialog('/startersConfirmation');
            break;
        
        case intentsArray[3]:
            session.beginDialog('/drinksConfirmation');
            break;
        
        case intentsArray[4]:
            session.beginDialog('/orderClosure');
            break;
        
        default: 
            session.beginDialog('/menuInquiry');
    }
}).triggerAction({ 
    matches: intentsArray[6]
});

/* 
 * We'll get back to this one when playing with the voice channel
var bot = new builder.UniversalBot(connector, function(session){
    if(hasAudioAttachment(session)) {
        var stream = getAudioStreamFromMessage(session.message);
        speechService.getTextFromAudioStream(stream)
            .then(function(text){
                session.send(processText(text));
            })
            .catch(function (error){
                session.send('Oops, I messed up! Try again later.');
                console.error(error);
            });
    } else {
        session.send('Did you try to speak with me? Seems I could not hear you properly. Try again, please!');
    }
});
*/

// setup restify server
var server = restify.createServer();
server.get('/', restify.serveStatic({
    directory: __dirname,
    default: '/index.html'
}));
server.post('/api/messages', connector.listen());
server.listen(process.env.PORT || 3000, function(){
    console.log('%s listening to %s', server.name, server.url);
});

//=========================================================
// Bots Events
//=========================================================

// Sends greeting message when the bot is first added to a conversation
/*bot.on('conversationUpdate', function (message) {
    if (message.membersAdded) {
        message.membersAdded.forEach(function (identity) {
            if (identity.id === message.address.bot.id) {
                var reply = new builder.Message()
                    .address(message.address)
                    .text('Hi! I am the Funfoods Bot. I can talk and chat with you. Try me.');
                bot.send(reply);
            }
        });
    }
});*/