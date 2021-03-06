'use strict';

var userResponses   = require('./../responses/userResponses');
var Utils           = require('../../../components/utils');
var log             = Utils.log;
var config          = require('./../../../config/environment');
var mandrill        = require('mandrill-api/mandrill');
var _dataUtils      = require('./../../data/controllers/dataUtils');
var _registerUtils  = require('./../../register/controllers/registerUtils');



class CodeRedeemService {
  static retrieveClassCode(data) {
    return new Promise(function(resolve, reject) {
      log('info', data.logData, 'CodeRedeemService retrieveClassCode | Accesing');

      var query = 'SELECT * FROM ' + config.dataTables.freeClasses;
      query += ' WHERE code="' + data.payload.classCode + '" LIMIT 1';

      Utils.performQuery(query).then((response) => {
        if(response.data.length < 1) {
          log('info', data.logData, 'CodeRedeemService retrieveClassCode | KO - Code not valid');
          return reject(userResponses.invalid_code_ko);
        } else {
          data.freeClass = response.data[0];

          if (data.freeClass.claimed !== 0) {
            log('info', data.logData, 'CodeRedeemService retrieveClassCode | KO - Code already claimed');
            return reject(userResponses.code_claimed_ko);
          }

          log('info', data.logData, 'CodeRedeemService retrieveClassCode | OK');
          return resolve(data);
        }
      }).catch((err) => {
        log('error', data.logData, 'CodeRedeemService retrieveClassCode | KO - Error', err);
        return reject(err);
      });
    });
  }

  static getUser(data) {
    return new Promise(function (resolve, reject) {
      log('info', data.logData, 'CodeRedeemService getUser | Accesing');

      var query = 'SELECT * FROM ' + config.dataTables.customers;
      query += ' WHERE emailaddress="' + data.freeClass.userEmail + '" LIMIT 1';

      Utils.performQuery(query).then(function (response) {
        if(response.data.length < 1) {
          log('info', data.logData, 'CodeRedeemService getUser | KO - User not found');
          return reject(userResponses.invalid_user_ko);
        } else {
          data.user = response.data[0];

          log('info', data.logData, 'CodeRedeemService getUser | OK');
          return resolve(data);
        }
      }).catch((err) => {
        log('error', data.logData, 'CodeRedeemService getUser | KO - Error', err);
        return reject(err);
      });

    });
  }

  static setFreeClass(data) {
    return new Promise(function(resolve, reject) {
      log('info', data.logData, 'CodeRedeemService setFreeClass | Accesing');

      data.payload.username = data.freeClass.userEmail;
      data.payload.series_id = data.freeClass.classId;
      data.payload.firstname = data.user.firstname;
      data.payload.lastname = data.user.lastname;
      data.payload.address = data.user.address;
      data.payload.billingzip = data.user.zip;

      _dataUtils.logInPlatform(data)
        .then(_dataUtils.secondlogInPlatform)
        .then(_registerUtils.findUser)
        .then(_registerUtils.beginCheckout)
        .then(_registerUtils.checkoutBilling)
        .then(_registerUtils.processPayment)
        .then(() => {
          log('info', data.logData, 'CodeRedeemService setFreeClass | OK');
          return resolve(data);
        }).catch((err) => {
          log('error', data.logData, 'CodeRedeemService setFreeClass | KO - Error', err);
          return reject(userResponses.internal_error);
        });
    });

  }
  static setClassAsClaimed(data) {
    return new Promise(function(resolve, reject) {
      log('info', data.logData, 'CodeRedeemService setClassAsClaimed | Accesing');

      var query = 'UPDATE ' + config.dataTables.freeClasses;
      query+= ' SET claimed=1, claimedDate=now()';
      query+= ' WHERE id=' + data.freeClass.id;

      Utils.performQuery(query).then(() => {
        log('info', data.logData, 'CodeRedeemService setClassAsClaimed | OK');
        return resolve(data);
      }).catch((err) => {
        log('error', data.logData, 'CodeRedeemService setClassAsClaimed | KO - Error', err);
        return reject(err);
      });
    });
  }

  static sendConfirmationEmail(data) {
    return new Promise(function(resolve, reject) {
      log('info', data.logData, 'CodeRedeemService sendConfirmationEmail | Accesing');

      var extraInfo = JSON.parse(data.freeClass.extra);
      var mandrill_client = new mandrill.Mandrill(config.mandrill.apiKey);

      var message = {
        subject: extraInfo.subject,
        from_email: extraInfo.from_email,
        from_name: extraInfo.from_name,
        to: [{
          email: data.user.emailaddress,
          type: 'to'
        }],
        headers: {
          'Reply-To': extraInfo.from_email
        },
        track_opens: true,
        track_clicks: true,
        merge: true,
        merge_language: 'handlebars',
        global_merge_vars: [],
        tags: [],
        merge_vars: [],
      };
      var async = false;
      var mailSendRequest = {
        template_name: extraInfo.template_name,
        template_content: [],
        message: message,
        async: async
      };
      mandrill_client.messages.sendTemplate(mailSendRequest, function() {
        log('info', data.logData, 'CodeRedeemService sendConfirmationEmail | sendEmail - OK');
        return resolve(data);
      }, function(e) {
        log('error', data.logData, 'CodeRedeemService sendConfirmationEmail | sendEmail - KO ' + e.name + ' - ' + e.message);
        return resolve(data);
      });
    });
  }
}

module.exports = CodeRedeemService;
