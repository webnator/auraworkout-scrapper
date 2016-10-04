'use strict';

var dataResponses = require('./../responses/dataResponses');

var Errors            = require('../../../components/errors');
var Utils             = require('../../../components/utils');
var _dataUtils        = require('./dataUtils');
var _mailingUtils     = require('./mailingUtils');
var _customerUtils    = require('./customerUtils');
var log               = Utils.log;

exports.fetchData = fetchData;
exports.getData = getData;

function fetchData(request, reply) {
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

    .then(_mailingUtils.getRules)
    .then(_mailingUtils.fetchFromRules)
    .then(_mailingUtils.performRuleAction)
    .then(_mailingUtils.storeRulesResults)

    //.then(_dataUtils.storeData)
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
}

function getData(request, reply) {
  var data = {
    logData : Utils.logData(request),
    query: request.query,
    params: request.params
  };
  var response;
  log('info', data.logData, 'getCustomers Accessing');

  _customerUtils.getData(data)
    .then(function(){
      response = Utils.createResponseData(dataResponses.customers_listed_ok, data.customers);
      response.result.page = data.query.page;
      response.result.limit = data.query.limit;
      response.result.total = data.total;
      response.result.totalPages = data.totalPages;

      log('info', data.logData, 'getCustomers OK response', response);
      return reply(response).code(response.result.statusCode);
    })
    .fail(function(err){
      response = Errors.createGeneralError(err);
      log('error', data.logData, 'getCustomers KO - Error: ', response);
      return reply(response).code(err.statusCode);
    });
}
