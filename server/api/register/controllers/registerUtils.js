'use strict';

var registerResponses  = require('./../responses/registerResponses');
var Q                 = require('q');
var Utils             = require('../../../components/utils');
var log               = Utils.log;
var config            = require('./../../../config/environment');
var request           = require('request');
var cheerio           = require('cheerio');
var mandrill          = require('mandrill-api/mandrill');

exports.registerUser      = registerUser;
exports.findUser          = findUser;
exports.beginCheckout     = beginCheckout;
exports.checkoutBilling   = checkoutBilling;
exports.processPayment    = processPayment;
exports.sendEmail         = sendEmail;

function registerUser(data){
  var deferred = Q.defer();
  
  data.reqData = {
    method: 'POST',
    url: config.zingRegisterUrl,
    form: data.payload
  };

  Utils.sendRequest(data).then(function (response) {
    log('info', data.logData, 'registerUser (Request) OK');

    if (response.reqData.body !== '') {

      var page = response.reqData.body;
      var $ = cheerio.load(page);
      var div = $('.error').html();
      var errorField = $(div).find('input').attr('name');
      var errorMessage = $(div).find('.help-inline').html();

      var error = registerResponses.register_error;
      if (errorField || errorMessage) {
        error = registerResponses.error_in_params;
        if (errorMessage) {
          error.message = errorMessage;
        }
        if (errorField) {
          error.field = errorField;
        }
      }
      return deferred.reject(error);
    } else {
      deferred.resolve(data);
    }
  }, function (err) {
    log('error', data.logData, 'registerUser (Request) KO', err);
    deferred.reject(registerResponses.register_error);
  });

  return deferred.promise;
}

function findUser(data){
  var deferred = Q.defer();
  log('info', data.logData, 'findUser');
  
  var j = request.jar();
  var cookieStr = data.authCookie[0];
  cookieStr = cookieStr.split(';')[0];
  cookieStr = decodeURI(cookieStr);

  var cookie = request.cookie(cookieStr);
  j.setCookie(cookie, config.zingUrl);

  data.reqData = {
    method: 'GET',
    url: config.zingUrl,
    qs: {
      action: 'Report.customers',
      text: data.payload.username
    },
    jar: j
  };

  Utils.sendRequest(data).then(function (response) {
    log('info', data.logData, 'registerUser (Request) OK');

    var page = response.reqData.body;
    var $ = cheerio.load(page);
    data.customerId = $('input[name="customerid"]').val();
    

    deferred.resolve(data);
  }, function (err) {
    log('error', data.logData, 'registerUser (Request) KO', err);
    deferred.reject(registerResponses.register_error);
  });

  return deferred.promise;
}

function beginCheckout(data){
  var deferred = Q.defer();
  log('info', data.logData, 'beginCheckout')

  var series_id = 159;
  if (data.payload.series_id && data.payload.series_id !== '') {
    series_id = parseInt(data.payload.series_id);
  }

  var formData = {
    customerid: data.customerId,
    rowcount: 1,
    skuid0: null,
    seriesid0: series_id,
    giftcardid0: null,
    quantity0: 1,
    discount0: 0,
    total0: 0.01,
    giftcardcode0: null,
    giftcardpin0: null,
    isstorecredit0: false,
    groupid0: null,
    giftcardseriesid0: null
  };

  var j = request.jar();
  var cookieStr = data.authCookie[0];
  cookieStr = cookieStr.split(';')[0];
  cookieStr = decodeURI(cookieStr);

  var cookie = request.cookie(cookieStr);
  var siteCookie = request.cookie('REGISTERSITEID=2');
  var roomCookie = request.cookie('U127ROOMID=1');
  j.setCookie(cookie, config.zingUrl);
  j.setCookie(siteCookie, config.zingUrl);
  j.setCookie(roomCookie, config.zingUrl);

  data.reqData = {
    method: 'POST',
    url: config.zingUrl,
    qs: {
      action: 'Register.checkout'
    },
    form: formData,
    jar: j
  };

  Utils.sendRequest(data).then(function (response) {
    log('info', data.logData, 'beginCheckout (Request) OK');

    deferred.resolve(data);
  }, function (err) {
    log('error', data.logData, 'beginCheckout (Request) KO', err);
    deferred.reject(registerResponses.register_error);
  });

  return deferred.promise;
}

function checkoutBilling(data){
  var deferred = Q.defer();
  log('info', data.logData, 'checkoutBilling');

  var j = request.jar();
  var cookieStr = data.authCookie[0];
  cookieStr = cookieStr.split(';')[0];
  cookieStr = decodeURI(cookieStr);

  var cookie = request.cookie(cookieStr);
  var siteCookie = request.cookie('REGISTERSITEID=2');
  var roomCookie = request.cookie('U127ROOMID=1');
  j.setCookie(cookie, config.zingUrl);
  j.setCookie(siteCookie, config.zingUrl);
  j.setCookie(roomCookie, config.zingUrl);

  data.reqData = {
    method: 'GET',
    url: config.zingUrl,
    qs: {
      action: 'RegisterCheckout.billing'
    },
    headers: {
      Referer: 'http://reserve.auraworkout.com/admin/index.cfm?action=Register.view&customerid=' + data.customerId
    },
    jar: j
  };

  Utils.sendRequest(data).then(function (response) {
    log('info', data.logData, 'checkoutBilling (Request) OK');

    var page = response.reqData.body;
    var $ = cheerio.load(page);
    data.formToken = $('input[name="formtoken"]').val();

    deferred.resolve(data);
  }, function (err) {
    log('error', data.logData, 'checkoutBilling (Request) KO', err);
    deferred.reject(registerResponses.register_error);
  });

  return deferred.promise;
}

function processPayment(data){
  var deferred = Q.defer();
  log('info', data.logData, 'processPayment');

  var formData = {
    formtoken: data.formToken,
    paymenttypeid: '99',
    paymentcomptypeid: '5',
    compreason: 'Automatic Series Registration',
    billingfirstname: data.payload.firstname,
    billinglastname: data.payload.lastname,
    billingaddress: data.payload.address,
    billingzip: data.payload.billingzip,
    seriesactivationdate: null,
    _submit: 'Place Order'
  };

  var j = request.jar();
  var cookieStr = data.authCookie[0];
  cookieStr = cookieStr.split(';')[0];
  cookieStr = decodeURI(cookieStr);

  var cookie = request.cookie(cookieStr);
  var siteCookie = request.cookie('REGISTERSITEID=2');
  var roomCookie = request.cookie('U127ROOMID=1');
  j.setCookie(cookie, config.zingUrl);
  j.setCookie(siteCookie, config.zingUrl);
  j.setCookie(roomCookie, config.zingUrl);

  data.reqData = {
    method: 'POST',
    url: 'https://reserve.auraworkout.com/admin/index.cfm',
    qs: {
      action: 'RegisterCheckout.processPayment'
    },
    form: formData,
    jar: j
  };

  Utils.sendRequest(data).then(function () {
    log('info', data.logData, 'processPayment (Request) OK');
    deferred.resolve(data);
  }, function (err) {
    log('error', data.logData, 'processPayment (Request) KO', err);
    deferred.reject(registerResponses.register_error);
  });

  return deferred.promise;
}

function sendEmail(data) {
  var deferred = Q.defer();
  log('info', data.logData, 'sendEmail Accessing');

  var mandrill_client = new mandrill.Mandrill(config.mandrill.apiKey);

  var emailConfig = JSON.parse(JSON.stringify(config.mandrill.defaultConfig));
  if (data.payload.email_template && data.payload.email_template !== '') {
    emailConfig.template = data.payload.email_template;
  }
  if (data.payload.email_subject && data.payload.email_subject !== '') {
    emailConfig.subject = data.payload.email_subject;
  }
  if (data.payload.email_from && data.payload.email_from !== '') {
    emailConfig.from_email = data.payload.email_from;
  }
  if (data.payload.email_name && data.payload.email_name !== '') {
    emailConfig.from_name = data.payload.email_name;
  }

  var template_content = [{
    firstname: data.payload.firstname,
    lastname: data.payload.lastname,
    username: data.payload.username
  }];
  var message = {
    subject: emailConfig.subject,
    from_email: emailConfig.from_email,
    from_name: emailConfig.from_name,
    to: [{
      email: data.payload.username,
      name: data.payload.firstname + ' ' + data.payload.firstname,
      type: 'to'
    }],
    headers: {
      'Reply-To': emailConfig.from_email
    },
    track_opens: true,
    track_clicks: true,
    merge: true,
    merge_language: 'mailchimp',
    global_merge_vars: [],
    merge_vars: [],
    tags: [
      'customer-registration'
    ]
  };
  var async = false;
  var mailSendRequest = {
    template_name: emailConfig.template,
    template_content: template_content,
    message: message,
    async: async
  };

  mandrill_client.messages.sendTemplate(mailSendRequest, function(result) {
    log('info', data.logData, 'sendEmail - OK');
    deferred.resolve(data);
  }, function(e) {
    log('error', data.logData, 'sendEmail - KO' + e.name + ' - ' + e.message);
    deferred.resolve(data);
  });

  return deferred.promise;
}


