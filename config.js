/** 
 * Master configuration for dev enviroment
*/
var config = {};

/** 
 * AWS Application Instance
*/
config.APP_JS_SERVER_HOST_NAME = '52.41.1.31';
config.APP_JS_SERVER_PORT_NO = 8080;
config.APP_JS_URL = '/VCABotApplication/service/order/';
config.APP_JS_URL_CONVERSATION = '/VCABotApplication/analytics/';

/** 
 * Rest Service Lookup ID for dev enviroment
*/
config.REST_SERVICE_LOOKUP_ID_MENU = 'menu';
config.REST_SERVICE_LOOKUP_ID_MAINCOURSE = 'MaincourseList';
config.REST_SERVICE_LOOKUP_ID_EXTRAS = 'extras';
config.REST_SERVICE_LOOKUP_ID_STARTERS = 'starters';
config.REST_SERVICE_LOOKUP_ID_DRINKS = 'drinks';
config.REST_SERVICE_LOOKUP_ID_SUMMARY = 'summary';
config.REST_SERVICE_LOOKUP_ID_CONVERSATION = 'conversation';
/** 
 * LUIS Entities for dev enviroment
*/
config.ENTITY_MAINCOURSE_ITEM = 'maincourse.item';
config.ENTITY_MAINCOURSE_SUB_ITEM = 'maincourse.subitem';
config.ENTITY_EXTRAS_ITEM = 'extras.item';
config.ENTITY_STARTERS_ITEM = 'starters.item';
config.ENTITY_DRINKS_ITEM = 'drinks.item';

module.exports = config;