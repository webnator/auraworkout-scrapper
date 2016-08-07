'use strict';

var dataResponses = require('./../responses/dataResponses');
var Q             = require('q');
var Utils         = require('../../../components/utils');
var log           = Utils.log;
var config        = require('./../../../config/environment');

exports.getRules            = getRules;
exports.fetchFromRules      = fetchFromRules;
exports.createMailingLists  = createMailingLists;
exports.addMailsToList      = addMailsToList;

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
    deferred.reject(err);
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
    deferred.reject(err);
  });

  return deferred.promise;
}

function createMailingLists(data) {
  var promiseQueue = [];
  data = data[0].value;

  log('info', data.logData, 'mailingUtils createMailList accesing');


  for (var i = 0; i < data.mailRules.length; i++) {
    var rule = data.mailRules[i];
    if (rule.list_id === null) {
      promiseQueue.push(createMailchimpList(data, rule));
    }

  }
  if (promiseQueue.length <= 0) {
    log('info', data.logData, 'mailingUtils createMailList allListsCreated - OK');
    promiseQueue.push(data);
  }
  return Q.allSettled(promiseQueue);
}

function createMailchimpList(data, rule) {
  var deferred = Q.defer();

  log('info', data.logData, 'mailingUtils createMailchimpList accesing');

  var auth = 'Basic ' + new Buffer('anyUsername:' + config.mailChimp.apiKey).toString('base64');
  var mailData = {
    logData: data.logData,
    reqData: {
      method: 'POST',
      url: config.mailChimp.url + '/lists',
      headers: {
        'Authorization': auth
      },
      json: {
        name: rule.list_name,
        contact: config.mailChimp.contact,
        permission_reminder: 'You’re receiving this email as a customer of Aura',
        campaign_defaults: {
          from_name: 'Aura',
          from_email: 'aura@auraworkout.com',
          subject: 'Aura',
          language: 'en'
        },
        visibility: 'pub',
        email_type_option: true
      }
    }
  };

  Utils.sendRequest(mailData).then(function (response) {
    log('info', data.logData, 'mailingUtils createMailchimpList - Created on Mailchimp');
    rule.list_id = response.reqData.body.id;

    var newRule = JSON.parse(JSON.stringify(rule));
    delete newRule.result;

    Utils.insertInto(newRule, config.dataTables.mailRules).then(function () {
      log('info', data.logData, 'mailingUtils createMailchimpList - Updated in DB');
      deferred.resolve(data);
    }, function (err) {
      log('error', data.logData, 'mailingUtils createMailchimpList - KO updating', err);
      deferred.reject(dataResponses.internal_ddbb_error);
    });

  }, function (err) {
    log('error', data.logData, 'mailingUtils createMailchimpList KO - Error', err);
    deferred.reject(err);
  });

  return deferred.promise;
}

function addMailsToList(data) {
  var promiseQueue = [];
  data = data[0].value;

  log('info', data.logData, 'mailingUtils addMailsToList accesing');

  for (var i = 0; i < data.mailRules.length; i++) {
    var rule = data.mailRules[i];
    if (rule.result && rule.result.length > 0 && rule.result[0].email) {
      promiseQueue.push(addUsersToList(data, rule));
    }

  }
  if (promiseQueue.length <= 0) {
    log('info', data.logData, 'mailingUtils addMailsToList nothingToAdd - OK');
    promiseQueue.push(data);
  }
  return Q.allSettled(promiseQueue);
}

function addUsersToList(data, rule) {
  var deferred = Q.defer();
  log('info', data.logData, 'mailingUtils addUsersToList accesing');
  var auth = 'Basic ' + new Buffer('anyUsername:' + config.mailChimp.apiKey).toString('base64');

  var putOperationsArray = [];
  for (var i = 0; i < rule.result.length; i++) {
    var email = rule.result[i].email;
    var opBody = {
      email_address: email,
      status_if_new: 'subscribed'
    };
    var operation = {
      method: 'PUT',
      path: '/lists/' + rule.list_id + '/members/' + Utils.getHash(email, 'md5'),
      body: JSON.stringify(opBody)
    };
    putOperationsArray.push(operation);
  }

  var mailData = {
    logData: data.logData,
    reqData: {
      method: 'POST',
      url: config.mailChimp.url + '/batches',
      headers: {
        'Authorization': auth
      },
      json: {
        operations: putOperationsArray
      }
    }
  };

  Utils.sendRequest(mailData).then(function (response) {
    log('info', data.logData, 'mailingUtils addUsersToList - Created on Mailchimp');
    console.log('RESPONSE', response.reqData.body);
    deferred.resolve(data);
  }, function (err) {
    log('error', data.logData, 'mailingUtils addUsersToList KO - Error', err);
    deferred.reject(err);
  });

  return deferred.promise;
}
