'use strict';

var Q = require('q');


module.exports = function (data, rule) {
  var deferred = Q.defer();

  log('info', data.logData, 'Action:sendReminder | Starting');
  rule.logData = data.logData;

  sendRemindEmail(rule)
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


  return deferred.promise;
}