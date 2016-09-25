'use strict';

var Q             = require('q');
var Utils         = require('./../../../../components/utils');
var log           = Utils.log;
var config        = require('./../../../../config/environment');
var dataResponses = require('./../../responses/dataResponses');


module.exports = function (data, rule) {
  var deferred = Q.defer();

  log('info', data.logData, 'Action:createList | Starting');
  rule.logData = data.logData;
  createMailingLists(rule)
    .then(addMailsToList)
    .then(function () {
      log('info', rule.logData, 'Action:createList | List created OK');
      deferred.resolve(data);
    }).fail(function (err) {
      log('error', rule.logData, 'Action:createList | List creation KO', err);
      deferred.reject(err);
    });


  return deferred.promise;
};


function createMailingLists(rule) {
  var deferred = Q.defer();
  log('info', rule.logData, 'Action:createList - createMailingLists | Accesing');
  if (rule.list_id === null) {

    createMailchimpList(rule).then(function (rule) {
      log('info', rule.logData, 'Action:createList - createMailingLists | OK - Rule created');
      deferred.resolve(rule);
    }).fail(function (err) {
      log('error', rule.logData, 'Action:createList - createMailingLists | KO', err);
      deferred.reject(err);
    });
  } else {
    log('info', rule.logData, 'Action:createList - createMailingLists | OK - Already created');
    deferred.resolve(rule);
  }
  return deferred.promise;
}

function createMailchimpList(rule) {
  var deferred = Q.defer();

  log('info', rule.logData, 'Action:createList - createMailchimpList | Accesing');

  var auth = 'Basic ' + new Buffer('anyUsername:' + config.mailChimp.apiKey).toString('base64');
  var mailData = {
    logData: rule.logData,
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

    if (response.reqData.response.statusCode === 200) {
      log('info', rule.logData, 'Action:createList - createMailchimpList | Created on Mailchimp');
      rule.list_id = response.reqData.body.id;

      var newRule = JSON.parse(JSON.stringify(rule));
      delete newRule.result;
      delete newRule.logData;

      Utils.insertInto(newRule, config.dataTables.mailRules).then(function () {
        log('info', rule.logData, 'Action:createList - createMailchimpList | Updated in DB');
        deferred.resolve(rule);
      }, function (err) {
        log('error', rule.logData, 'Action:createList - createMailchimpList | KO updating', err);
        deferred.reject(dataResponses.internal_ddbb_error);
      });
    } else {
      log('error', rule.logData, 'Action:createList - createMailchimpList | Request KO ', response.reqData.body);
      deferred.reject(dataResponses.mailchimp_error);
    }

  }, function (err) {
    log('error', rule.logData, 'Action:createList - createMailchimpList | KO ', err);
    deferred.reject(dataResponses.mailchimp_error);
  });

  return deferred.promise;
}

function addMailsToList(rule) {
  var deferred = Q.defer();
  log('info', rule.logData, 'Action:createList - addMailsToList | Accessing');

  if (rule.result && rule.result.length > 0 && rule.result[0].email) {
    addUsersToList(rule).then(function (rule) {
      log('info', rule.logData, 'Action:createList - addMailsToList | OK - Rule created');
      deferred.resolve(rule);
    }).fail(function (err) {
      log('error', rule.logData, 'Action:createList - addMailsToList | KO', err);
      deferred.reject(err);
    });
  } else {
    log('info', rule.logData, 'Action:createList - addMailsToList | OK - Nothing to add');
    deferred.resolve(rule);
  }

  return deferred.promise;
}

function addUsersToList(rule) {
  var deferred = Q.defer();
  log('info', rule.logData, 'Action:createList - addUsersToList | Accessing');
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
    logData: rule.logData,
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
    if (response.reqData.response.statusCode === 200) {
      log('info', rule.logData, 'Action:createList - addUsersToList | Created on Mailchimp');
      deferred.resolve(rule);
    } else {
      log('error', rule.logData, 'Action:createList - addUsersToList | Request KO ', response.reqData.body);
      deferred.reject(dataResponses.mailchimp_error);
    }
  }, function (err) {
    log('error', rule.logData, 'Action:createList - addUsersToList | KO - Error', err);
    deferred.reject(dataResponses.mailchimp_error);
  });

  return deferred.promise;
}