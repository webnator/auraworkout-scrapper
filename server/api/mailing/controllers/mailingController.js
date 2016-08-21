'use strict';

var responses = require('./../responses/mailingResponses');

var Errors              = require('./../../../components/errors');
var Utils               = require('./../../../components/utils');
var _mailingUtils       = require('./mailingUtils');
var log                 = Utils.log;
var RuleModelJoi        = require('./../models/ruleModelJoi');
var UpdateRuleModelJoi  = require('./../models/updateRuleModelJoi');

exports.getRules = getRules;
exports.createRule = createRule;
exports.updateRule = updateRule;
exports.deleteRule = deleteRule;


function getRules(request, reply) {
  var data = {
    logData : Utils.logData(request),
    params: request.params
  };
  var response;
  log('info', data.logData, 'mailingController getRules - Accessing');

  _mailingUtils.getRules(data)
    .then(function(data){
      response = Utils.createResponseData(responses.rules_listed_ok, data.mailRules);
      log('info', data.logData, 'mailingController getRules - OK response', response);
      return reply(response).code(response.result.statusCode);
    })
    .catch(function(err){
      response = Errors.createGeneralError(err);
      log('error', data.logData, 'mailingController getRules - KO Error: ', response);
      return reply(response).code(err.statusCode);
    });
}

function createRule(request, reply) {
  var data = {
    logData : Utils.logData(request),
    payload: request.payload,
    schema: new RuleModelJoi()
  };
  var response;
  log('info', data.logData, 'mailingController createRule - Accessing');

  Utils.validateSchema(data)
    .then(_mailingUtils.createRule)
    .then(function(){
      response = Utils.createResponseData(responses.rule_created);
      log('info', data.logData, 'mailingController createRule - OK response', response);
      return reply(response).code(response.result.statusCode);
    })
    .catch(function(err){
      response = Errors.createGeneralError(err);
      log('error', data.logData, 'mailingController createRule - KO Error: ', response);
      return reply(response).code(err.statusCode);
    });
}

function updateRule(request, reply) {
  var data = {
    logData : Utils.logData(request),
    params: request.params,
    payload: request.payload,
    schema: new UpdateRuleModelJoi()
  };
  var response;
  log('info', data.logData, 'mailingController updateRule - Accessing');

  Utils.validateSchema(data)
    .then(_mailingUtils.updateRule)
    .then(function(){
      response = Utils.createResponseData(responses.rule_updated);
      log('info', data.logData, 'mailingController updateRule - OK response', response);
      return reply(response).code(response.result.statusCode);
    })
    .catch(function(err){
      response = Errors.createGeneralError(err);
      log('error', data.logData, 'mailingController updateRule - KO Error: ', response);
      return reply(response).code(err.statusCode);
    });
}

function deleteRule(request, reply) {
  var data = {
    logData : Utils.logData(request),
    params: request.params
  };
  var response;
  log('info', data.logData, 'mailingController deleteRule - Accessing');

  _mailingUtils.deleteRule(data)
    .then(function(){
      response = Utils.createResponseData(responses.rule_deleted);
      log('info', data.logData, 'mailingController deleteRule - OK response', response);
      return reply(response).code(response.result.statusCode);
    })
    .catch(function(err){
      response = Errors.createGeneralError(err);
      log('error', data.logData, 'mailingController deleteRule - KO Error: ', response);
      return reply(response).code(err.statusCode);
    });
}

