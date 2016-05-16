'use strict';

var dataResponses = require('./../responses/dataResponses');

var Errors        = require('../../../components/errors');
var Utils         = require('../../../components/utils');
var _dataUtils    = require('./../controllers/dataUtils');
var log           = Utils.log;

exports.fetchData = function(request, reply) {
  var data = {
    logData : Utils.logData(request)
  };
  var response;
  log('info', data.logData, 'getData Accessing');

  _dataUtils.logInPlatform(data)
    .then(_dataUtils.secondlogInPlatform)
    
    .then(_dataUtils.fetchCustomers)
    .then(_dataUtils.storeCustomers)
    
    .then(_dataUtils.fetchSales)
    .then(_dataUtils.storeSales)
    
    .then(_dataUtils.fetchAttendance)
    .then(_dataUtils.storeAttendance)

    .then(_dataUtils.fetchSeries)
    .then(_dataUtils.storeSeries)
    
    .then(_dataUtils.storeData)
    .then(function(){
      response = Utils.createResponseData(dataResponses.pettition_accepted);
      log('info', data.logData, 'getData OK response', response);
      return reply(response).code(response.result.statusCode);
    })
    .fail(function(err){
      response = Errors.createGeneralError(err);
      log('error', data.logData, 'getData KO - Error: ', response);
      return reply(response).code(err.statusCode);
    });
};
