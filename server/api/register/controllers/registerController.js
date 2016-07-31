'use strict';

var registerResponses = require('./../responses/registerResponses');

var Errors            = require('../../../components/errors');
var Utils             = require('../../../components/utils');
var RegisterModelJoi  = require('./../models/registerModelJoi');
var _registerUtils    = require('./../controllers/registerUtils');
var _dataUtils        = require('./../../data/controllers/dataUtils');
var log               = Utils.log;

exports.registerUser = function(request, reply) {
  var data = {
    logData : Utils.logData(request),
    payload : request.payload,
    schema  : new RegisterModelJoi()
  };
  var response;
  log('info', data.logData, 'getRegister Accessing');

  Utils.validateSchema(data)
    .then(_registerUtils.registerUser)
    .then(_dataUtils.logInPlatform)
    .then(_dataUtils.secondlogInPlatform)
    .then(_registerUtils.findUser)
    .then(_registerUtils.beginCheckout)
    .then(_registerUtils.checkoutBilling)
    .then(_registerUtils.processPayment)
    .then(_registerUtils.sendEmail)
    .then(function(data){
      response = Utils.createResponseData(registerResponses.registration_ok);
      log('info', data.logData, 'getRegister OK response', response);
      return reply(response).code(response.result.statusCode);
    })
    .fail(function(err){
      response = Errors.createGeneralError(err);
      log('error', data.logData, 'getRegister KO - Error: ', response);
      return reply(response).code(err.statusCode);
    });
};
