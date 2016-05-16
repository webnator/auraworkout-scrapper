'use strict';

var dataResponses = require('./../responses/dataResponses');
var Q             = require('q');
var Utils         = require('../../../components/utils');
var log           = Utils.log;
var config        = require('./../../../config/environment');

exports.getCustomers = function(data){
  var deferred = Q.defer();

  log('info', data.logData, 'getCustomers accesing');

  Utils.getAllFrom('Customer').then(function (response) {
    data.customers = response;
    deferred.resolve(data);
  }, function (err) {
    console.log('ERROR', err);
    deferred.reject(dataResponses.internal_ddbb_error);
  });


  return deferred.promise;
};
