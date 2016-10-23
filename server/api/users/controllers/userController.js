'use strict';

var userResponses = require('./../responses/userResponses');

var Errors            = require('../../../components/errors');
var Utils             = require('../../../components/utils');
var CodeRedeemJoi     = require('./../models/CodeRedeem');


var _codeRedeemUtils  = require('./codeRedeemUtils');
var log               = Utils.log;



class UserController {
  static redeemCode (request, reply) {
    var data = {
      logData : Utils.logData(request),
      payload : request.payload,
      schema  : new CodeRedeemJoi()
    };
    var response;
    log('info', data.logData, 'UserController getRegister | Accessing');

    Utils.validateSchema(data)
      .then(_codeRedeemUtils.retrieveClassCode)
      .then(_codeRedeemUtils.getUser)
      .then(_codeRedeemUtils.setFreeClass)
      .then(_codeRedeemUtils.setClassAsClaimed)
      .then(function(data){
        response = Utils.createResponseData(userResponses.code_redeemed_ok);
        log('info', data.logData, 'UserController getRegister | OK response', response);
        return reply(response).code(response.result.statusCode);
      })
      .fail(function(err){
        response = Errors.createGeneralError(err);
        log('error', data.logData, 'UserController getRegister | KO - Error: ', response);
        return reply(response).code(err.statusCode);
      });
  }

}

module.exports = UserController;
