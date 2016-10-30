'use strict';

var Q             = require('q');
var Utils         = require('./../../../../components/utils');
var log           = Utils.log;
var mandrill      = require('mandrill-api/mandrill');
var config        = require('./../../../../config/environment');
var uuid          = require('uuid');

module.exports = function (data, rule) {
  var deferred = Q.defer();

  log('info', data.logData, 'Action:giveFreeClass | Starting');
  rule.logData = data.logData;

  saveFreeClasses(rule)
    .then(sendNotificationEmail)
    .then(function () {
      log('info', rule.logData, 'Action:giveFreeClass | Reminders sent OK');
      deferred.resolve(data);
    }).catch(function (err) {
      log('error', rule.logData, 'Action:giveFreeClass | Error sending reminders', err);
      deferred.reject(err);
    });

  return deferred.promise;
};

function saveFreeClasses(rule) {
  return new Promise(function(resolve, reject) {
    log('info', rule.logData, 'Action:giveFreeClass - saveFreeClasses | Accesing');

    var extraInfo = JSON.parse(rule.extra.toString());

    var freeClasses = [];
    for (let i = 0; i < rule.result.length; i++) {
      var person = rule.result[i];
      console.log('MY EXTRA', extraInfo);
      var freeClass = {
        userEmail: person.emailaddress,
        code: uuid.v4(),
        ruleId: rule.id,
        classId: extraInfo.class_id,
        extra: JSON.stringify(extraInfo.confirm_mail)
      };
      rule.result[i].classCode = freeClass.code;

      freeClasses.push(freeClass);
    }


    Utils.insertMultiple(freeClasses, 'FreeClass').then(() => {
      log('info', rule.logData, 'Action:giveFreeClass - saveRemindedUsers | OK');
      return resolve(rule);
    }).catch((err) => {
      log('error', rule.logData, 'Action:giveFreeClass - saveFreeClasses | KO', err);
      return reject(rule);
    });

  });
}

function sendNotificationEmail (rule) {
  var deferred = Q.defer();
  log('info', rule.logData, 'Action:giveFreeClass - sendNotificationEmail | Accesing');

  var mandrill_client = new mandrill.Mandrill(config.mandrill.apiKey);
  var extraInfo = JSON.parse(rule.extra.toString());
  var recipients = [];
  var merge_vars = [];

  for (let i = 0; i < rule.result.length; i++) {
    var person = rule.result[i];
    // Set recipient
    var recipient = {
      email: person.emailaddress,
      type: 'to'
    };
    recipients.push(recipient);

    //Set merge vars
    var varSet = {
      rcpt: person.emailaddress,
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
    log('info', rule.logData, 'Action:giveFreeClass - sendNotificationEmail | sendEmail - OK');
    deferred.resolve(rule);
  }, function(e) {
    log('error', rule.logData, 'Action:giveFreeClass - sendNotificationEmail | sendEmail - KO' + e.name + ' - ' + e.message);
    deferred.resolve(rule);
  });

  return deferred.promise;
}

// function saveRemindedUsers (rule) {
//   var deferred = Q.defer();
//   log('info', rule.logData, 'Action:giveFreeClass - saveRemindedUsers | Accesing');
//
//   var remindedUsers = [];
//   for (let i = 0; i < rule.result.length; i++) {
//      var user = {
//        email: rule.result[i].email,
//        ruleID: rule.id
//      };
//      remindedUsers.push(user);
//   }
//   Utils.insertMultiple(remindedUsers, 'NotifiedUser').then(function () {
//     log('info', rule.logData, 'Action:giveFreeClass - saveRemindedUsers | OK');
//     deferred.resolve(rule);
//   }).catch(function (err) {
//     log('error', rule.logData, 'Action:giveFreeClass - saveRemindedUsers | KO', err);
//     deferred.resolve(rule);
//   });
//
//   return deferred.promise;
// }

