'use strict';

var Q             = require('q');
var Utils         = require('./../../../../components/utils');
var log           = Utils.log;
var mandrill      = require('mandrill-api/mandrill');
var config        = require('./../../../../config/environment');

module.exports = function (data, rule) {
  var deferred = Q.defer();

  log('info', data.logData, 'Action:sendReminder | Starting');
  rule.logData = data.logData;

  sendRemindEmail(rule)
    .then(saveRemindedUsers)
    .then(function () {
      log('info', rule.logData, 'Action:sendReminder | Reminders sent OK');
      deferred.resolve(data);
    }).fail(function (err) {
      log('error', rule.logData, 'Action:sendReminder | Error sending reminders', err);
      deferred.reject(err);
    });

  return deferred.promise;
};

function sendRemindEmail (rule) {
  var deferred = Q.defer();
  log('info', rule.logData, 'Action:sendReminder - sendRemindEmail | Accesing');

  var mandrill_client = new mandrill.Mandrill(config.mandrill.apiKey);
  var extraInfo = JSON.parse(rule.extra.toString());
  var recipients = [];
  var merge_vars = [];

  for (let i = 0; i < rule.result.length; i++) {
    var person = rule.result[i];
    // Set recipient
    var recipient = {
      email: person.email,
      type: 'to'
    };
    recipients.push(recipient);

    //Set merge vars
    var varSet = {
      rcpt: person.email,
      vars: []
    };
    for (let info in person) {
      var infoVar = {
        name: info,
        content: person[info]
      };
      varSet.vars.push(infoVar);
    }
    merge_vars.push(varSet);
  }

  var message = {
    subject: extraInfo.subject,
    from_email: extraInfo.from_email,
    from_name: extraInfo.from_name,
    to: recipients,
    headers: {
      'Reply-To': extraInfo.from_email
    },
    track_opens: true,
    track_clicks: true,
    merge: true,
    merge_language: 'handlebars',
    global_merge_vars: [],
    tags: [],
    merge_vars: merge_vars,
  };
  var async = false;
  var mailSendRequest = {
    template_name: extraInfo.template_name,
    template_content: [],
    message: message,
    async: async
  };

  mandrill_client.messages.sendTemplate(mailSendRequest, function() {
    log('info', rule.logData, 'Action:sendReminder - sendRemindEmail | sendEmail - OK');
    deferred.resolve(rule);
  }, function(e) {
    log('error', rule.logData, 'Action:sendReminder - sendRemindEmail | sendEmail - KO' + e.name + ' - ' + e.message);
    deferred.resolve(rule);
  });

  return deferred.promise;
}

function saveRemindedUsers (rule) {
  var deferred = Q.defer();
  log('info', rule.logData, 'Action:sendReminder - saveRemindedUsers | Accesing');

  var remindedUsers = [];
  for (let i = 0; i < rule.result.length; i++) {
     var user = {
       email: rule.result[i].email,
       ruleID: rule.id
     };
     remindedUsers.push(user);
  }
  Utils.insertMultiple(remindedUsers, 'NotifiedUser').then(function () {
    log('info', rule.logData, 'Action:sendReminder - saveRemindedUsers | OK');
    deferred.resolve(rule);
  }).catch(function (err) {
    log('error', rule.logData, 'Action:sendReminder - saveRemindedUsers | KO', err);
    deferred.resolve(rule);
  });

  return deferred.promise;
}

