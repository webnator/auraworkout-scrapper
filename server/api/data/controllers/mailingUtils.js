'use strict';

var dataResponses = require('./../responses/dataResponses');
var Q             = require('q');
var Utils         = require('../../../components/utils');
var log           = Utils.log;
var config        = require('./../../../config/environment');
var Rule          = require('./rules');

exports.getRules            = getRules;
exports.fetchFromRules      = fetchFromRules;
exports.performRuleAction   = performRuleAction;
exports.storeRulesResults   = storeRulesResults;

function getRules(data){
  var deferred = Q.defer();

  log('info', data.logData, 'mailingUtils getRules accesing');

  Utils.performQuery('SELECT * FROM ' + config.dataTables.mailRules + ' WHERE active=1').then(function (response) {
    data.mailRules = response.data;
    if(data.mailRules.length > 0) {
      log('info', data.logData, 'mailingUtils getRules OK');
      deferred.resolve(data);
    } else {
      log('error', data.logData, 'mailingUtils getRules KO - No rules');
      deferred.reject(dataResponses.no_rules);
    }

  }, function (err) {
    log('error', data.logData, 'mailingUtils getRules KO - Error', err);
    deferred.reject(dataResponses.internal_ddbb_error);
  });

  return deferred.promise;
}

function fetchFromRules(data) {
  var promiseQueue = [];

  log('info', data.logData, 'mailingUtils fetchFromRules accesing');

  for (var i = 0; i < data.mailRules.length; i++) {
    promiseQueue.push(processMailRule(data, data.mailRules[i]));
  }

  return Q.allSettled(promiseQueue);
}

function processMailRule(data, rule) {
  var deferred = Q.defer();
  log('info', data.logData, 'mailingUtils processMailRule accesing');

  Utils.performQuery(rule.query).then(function (response) {
    log('info', data.logData, 'mailingUtils processMailRule OK');
    rule.result = response.data;
    deferred.resolve(data);
  }, function (err) {
    log('error', data.logData, 'mailingUtils processMailRule KO - Error', err);
    deferred.reject(dataResponses.internal_ddbb_error);
  });

  return deferred.promise;
}


function performRuleAction(data) {
  var promiseQueue = [];
  data = data[0].value;

  for (let i = 0; i < data.mailRules.length; i++) {
    var rule = new Rule(data, data.mailRules[i]);
    promiseQueue.push(rule.execute());
  }

  return Q.allSettled(promiseQueue);
}

function storeRulesResults(data) {
  var deferred = Q.defer();
  data = data[0].value;
  log('info', data.logData, 'mailingUtils storeRulesResults | accesing');

  var results = [];
  for (let i = 0; i < data.mailRules.length; i++) {
    var result = {
      ruleID: data.mailRules[i].id,
      usersAffected: data.mailRules[i].result.length,
      result: JSON.stringify(data.mailRules[i].result)
    };
    results.push(result);
  }

  Utils.insertMultiple(results, 'RulesResult').then(function () {
    log('info', data.logData, 'mailingUtils storeRulesResults | OK');
    deferred.resolve(data);
  }).catch(function (err) {
    log('error', data.logData, 'mailingUtils storeRulesResults | KO', err);
    deferred.resolve(data);
  });

  return deferred.promise;
}


