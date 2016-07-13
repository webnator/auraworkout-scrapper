'use strict';

var registerResponses  = require('./../responses/registerResponses');
var Q                 = require('q');
var Utils             = require('../../../components/utils');
var log               = Utils.log;
var config            = require('./../../../config/environment');
var request           = require('request');
var cheerio           = require('cheerio');

exports.registerUser      = registerUser;
exports.findUser          = findUser;
exports.beginCheckout     = beginCheckout;
exports.checkoutBilling   = checkoutBilling;
exports.processPayment    = processPayment;

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
  log('info', data.logData, 'beginCheckout');

  var formData = {
    customerid: data.customerId,
    rowcount: 1,
    skuid0: null,
    seriesid0: 159,
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

    var page = response.reqData.body;
    console.log('CHECK', page);

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

    console.log('Form token', data.formToken);

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
    seriesactivationdate: '6/15/16',
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

  Utils.sendRequest(data).then(function (response) {
    log('info', data.logData, 'processPayment (Request) OK');
    deferred.resolve(data);
  }, function (err) {
    log('error', data.logData, 'processPayment (Request) KO', err);
    deferred.reject(registerResponses.register_error);
  });

  return deferred.promise;
}


