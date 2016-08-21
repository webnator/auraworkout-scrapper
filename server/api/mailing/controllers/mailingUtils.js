'use strict';

var responses = require('./../responses/mailingResponses');
var Utils         = require('../../../components/utils');
var log           = Utils.log;
var config        = require('./../../../config/environment');

exports.getRules    = getRules;
exports.createRule  = createRule;
exports.updateRule  = updateRule;
exports.deleteRule  = deleteRule;

function getRules(data){
  return new Promise(function(resolve, reject) {
    log('info', data.logData, 'mailingUtils getRules accesing');

    var query = 'SELECT * FROM ' + config.dataTables.mailRules;
    if (data.params.ruleId && data.params.ruleId !== '') {
      query += '  WHERE id="' + data.params.ruleId + '" OR list_id = "' + data.params.ruleId + '";';
    }
    Utils.performQuery(query).then(function (response) {
      data.mailRules = response.data;

      if(data.mailRules.length > 0) {
        log('info', data.logData, 'mailingUtils getRules OK');
        resolve(data);
      } else {
        log('error', data.logData, 'mailingUtils getRules KO - No rules');
        reject(responses.no_rules);
      }
    }, function (err) {
      log('error', data.logData, 'mailingUtils getRules KO - Error', err);
      reject(err);
    });

  });
}

function createRule(data){
  return new Promise(function(resolve, reject) {
    log('info', data.logData, 'mailingUtils createRule accesing');

    var query = 'INSERT INTO ' + config.dataTables.mailRules + ' (`query`, `list_name`, `onlyAdd`, `active`, `list_id`) VALUES (';
    query += '"' + data.payload.query + '", ';
    query += '"' + data.payload.name + '", ';
    query += '"' + data.payload.active + '", ';
    query += '"' + data.payload.onlyAdd + '", ';
    query += '"' + data.payload.listId + '")';

    Utils.performQuery(query).then(function () {
      log('info', data.logData, 'mailingUtils createRule OK');
      resolve(data);
    }, function (err) {
      log('error', data.logData, 'mailingUtils createRule KO - Error', err);
      reject(responses.internal_ddbb_error);
    });

  });
}

function updateRule(data){
  return new Promise(function(resolve, reject) {
    log('info', data.logData, 'mailingUtils updateRule accesing');

    var query = 'UPDATE ' + config.dataTables.mailRules + ' SET ';
    query += '`id`="' + data.params.ruleId + '"';

    if(data.payload.query && data.payload.query !== '') {
      query += ', `query`="' + data.payload.query + '"';
    }
    if(data.payload.name && data.payload.name !== '') {
      query += ', `list_name`="' + data.payload.name + '"';
    }
    if(data.payload.active && data.payload.active !== '') {
      var active = data.payload.active ? 1 : 0;
      query += ', `active`=' + active + '';
    }
    if(data.payload.onlyAdd && data.payload.onlyAdd !== '') {
      var onlyAdd = data.payload.onlyAdd ? 1 : 0;
      query += ', `onlyAdd`=' + onlyAdd + '';
    }
    if(data.payload.listId && data.payload.listId !== '') {
      query += ', `list_id`="' + data.payload.listId + '"';
    }
    query += ' WHERE `id`="' + data.params.ruleId + '"';

    console.log('UPDATE QUERY', query);
    Utils.performQuery(query).then(function () {
      log('info', data.logData, 'mailingUtils updateRule OK');
      resolve(data);
    }, function (err) {
      log('error', data.logData, 'mailingUtils updateRule KO - Error', err);
      reject(responses.internal_ddbb_error);
    });
  });
}

function deleteRule(data){
  return new Promise(function(resolve, reject) {
    log('info', data.logData, 'mailingUtils deleteRule accesing');

    var query = 'DELETE FROM ' + config.dataTables.mailRules + ' WHERE `id`="' + data.params.ruleId + '" ';
    Utils.performQuery(query).then(function () {
      log('info', data.logData, 'mailingUtils deleteRule OK');
      resolve(data);
    }, function (err) {
      log('error', data.logData, 'mailingUtils deleteRule KO - Error', err);
      reject(responses.internal_ddbb_error);
    });
  });
}

