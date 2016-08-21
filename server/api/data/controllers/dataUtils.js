'use strict';

var dataResponses = require('./../responses/dataResponses');
var Q             = require('q');
var Utils         = require('../../../components/utils');
var log           = Utils.log;
var config        = require('./../../../config/environment');
var request       = require('request');
var fs            = require('fs');
var mkpath        = require('mkpath');
var Converter     = require('csvtojson').Converter;

exports.logInPlatform = logInPlatform;
exports.secondlogInPlatform = secondlogInPlatform;
exports.fetchCustomers = fetchCustomers;
exports.fetchSales = fetchSales;
exports.fetchAttendance = fetchAttendance;
exports.fetchSeries = fetchSeries;
exports.storeData = storeData; // Deprecated - Will come back as reports
exports.storeCustomers = storeCustomers;
exports.storeSales = storeSales;
exports.storeAttendance = storeAttendance;
exports.storeSeries = storeSeries;

function logInPlatform(data){
  var deferred = Q.defer();

  log('info', data.logData, 'logInPlatform accesing');
  var loginUrl = config.zingUrl + '?action=';

  var formData = {
    action: 'Sec.doLogin',
    password: config.zingCredentials.password,
    username: config.zingCredentials.username
  };
  data.reqData = {
    method: 'POST',
    url: loginUrl,
    form: formData
  };

  Utils.sendRequest(data).then(function (response) {
    data.authCookie = response.reqData.response.headers['set-cookie'];
    deferred.resolve(data);
  }, function (err) {
    log('error', data.logData, 'logInPlatform (Request) KO', err);
    deferred.reject(dataResponses.login_error);
  });

  return deferred.promise;
}

function secondlogInPlatform(data){
  var deferred = Q.defer();

  log('info', data.logData, 'secondlogInPlatform accesing');
  var loginUrl = config.zingUrl + '?action=';

  var j = request.jar();
  var cookieStr = data.authCookie[0];
  cookieStr = cookieStr.split(';')[0];
  cookieStr = decodeURI(cookieStr);

  var cookie = request.cookie(cookieStr);
  j.setCookie(cookie, loginUrl);

  var formData = {
    action: 'Sec.doLogin',
    password: config.zingCredentials.password,
    username: config.zingCredentials.username
  };
  data.reqData = {
    method: 'POST',
    url: loginUrl,
    form: formData,
    jar: j
  };

  Utils.sendRequest(data).then(function (data) {
    deferred.resolve(data);
  }, function (err) {
    log('error', data.logData, 'logInPlatform (Request) KO', err);
    deferred.reject(dataResponses.login_error);
  });

  return deferred.promise;
}

function fetchCustomers(data){
  var deferred = Q.defer();

  log('info', data.logData, 'fetchCustomers accesing');
  var customersUrl = config.zingUrl;

  var j = request.jar();
  var cookieStr = data.authCookie[0];
  cookieStr = cookieStr.split(';')[0];
  cookieStr = decodeURI(cookieStr);

  var cookie = request.cookie(cookieStr);
  j.setCookie(cookie, customersUrl);

  if (!data.output) {
    data.output = {};
  }

  data.reqData = {
    method: 'GET',
    url: customersUrl,
    qs: {
      action: 'Report.exportEmails' 
    },
    jar: j
  };

  Utils.sendRequest(data).then(function (data) {
    var converter = new Converter({});
    converter.fromString(data.reqData.body, function(err, result){
      if(err) {
        return deferred.reject(err);
      }
      data.output.customers = result;
      deferred.resolve(data);
    });
  }, function (err) {
    log('error', data.logData, 'fetchCustomers (Request) KO', err);
    deferred.reject(dataResponses.login_error);
  });

  return deferred.promise;
}

function fetchSales(data){
  var deferred = Q.defer();

  log('info', data.logData, 'fetchSales accesing');
  var salesUrl = config.zingUrl;

  var j = request.jar();
  var cookieStr = data.authCookie[0];
  cookieStr = cookieStr.split(';')[0];
  cookieStr = decodeURI(cookieStr);

  var cookie = request.cookie(cookieStr);
  j.setCookie(cookie, salesUrl);

  if (!data.output) {
    data.output = {};
  }

  data.reqData = {
    method: 'POST',
    url: salesUrl,
    qs: {
      action: 'Report.allSalesByDate'
    },
    jar: j,
    form: {
      export: 'csv'
    }
  };

  Utils.sendRequest(data).then(function (data) {
    var converter = new Converter({});
    converter.fromString(data.reqData.body, function(err, result){
      if(err) {
        return deferred.reject(err);
      }
      data.output.sales = result;
      deferred.resolve(data);
    });
  }, function (err) {
    log('error', data.logData, 'fetchSales (Request) KO', err);
    deferred.reject(dataResponses.login_error);
  });

  return deferred.promise;
}

function fetchAttendance(data){
  var deferred = Q.defer();

  log('info', data.logData, 'fetchAttendance accesing');
  var attendanceUrl = config.zingUrl;

  var j = request.jar();
  var cookieStr = data.authCookie[0];
  cookieStr = cookieStr.split(';')[0];
  cookieStr = decodeURI(cookieStr);

  var cookie = request.cookie(cookieStr);
  j.setCookie(cookie, attendanceUrl);

  if (!data.output) {
    data.output = {};
  }

  data.reqData = {
    method: 'GET',
    url: attendanceUrl,
    qs: {
      action: 'Report.attendanceExport',
      export: 'csv'
    },
    jar: j
  };

  Utils.sendRequest(data).then(function (data) {
    var converter = new Converter({});
    converter.fromString(data.reqData.body, function(err, result){
      if(err) {
        return deferred.reject(err);
      }
      data.output.attendance = result;
      deferred.resolve(data);
    });
  }, function (err) {
    log('error', data.logData, 'fetchAttendance (Request) KO', err);
    deferred.reject(dataResponses.login_error);
  });

  return deferred.promise;
}

function fetchSeries(data){
  var deferred = Q.defer();

  log('info', data.logData, 'fetchSeries accesing');
  var attendanceUrl = config.zingUrl;

  var j = request.jar();
  var cookieStr = data.authCookie[0];
  cookieStr = cookieStr.split(';')[0];
  cookieStr = decodeURI(cookieStr);

  var cookie = request.cookie(cookieStr);
  j.setCookie(cookie, attendanceUrl);

  if (!data.output) {
    data.output = {};
  }

  data.reqData = {
    method: 'GET',
    url: attendanceUrl,
    qs: {
      action: 'Report.exportAllOpenSeries'
    },
    jar: j
  };

  Utils.sendRequest(data).then(function (data) {
    var converter = new Converter({});
    converter.fromString(data.reqData.body, function(err, result){
      if(err) {
        return deferred.reject(err);
      }
      data.output.series = result;
      deferred.resolve(data);
    });
  }, function (err) {
    log('error', data.logData, 'fetchSeries (Request) KO', err);
    deferred.reject(dataResponses.login_error);
  });

  return deferred.promise;
}

function storeData(data){
  var deferred = Q.defer();
  log('info', data.logData, 'dataAction (Promise) OK');

  mkpath.sync('./tmp/');

  fs.writeFile('./tmp/outputCustomer.json', JSON.stringify(data.output.customers), function(err) {
    if(err) {
      return deferred.reject(err);
    }
    fs.writeFile('./tmp/outputSales.json', JSON.stringify(data.output.sales), function(err) {
      if (err) {
        return deferred.reject(err);
      }
      fs.writeFile('./tmp/outputAttendance.json', JSON.stringify(data.output.attendance), function (err) {
        if (err) {
          return deferred.reject(err);
        }
        fs.writeFile('./tmp/outputSeries.json', JSON.stringify(data.output.series), function (err) {
          if (err) {
            return deferred.reject(err);
          }
          console.log('File written');
          deferred.resolve(data);
        });
      });
    });
  });
  
  return deferred.promise;
}

function storeCustomers(data){
  var deferred = Q.defer();

  log('info', data.logData, 'storeCustomers accesing', { totalCustomers: data.output.customers.length });

  Utils.truncateTable('Customer').then(function () {
    Utils.insertMultiple(data.output.customers, 'Customer', data).then(function () {
      deferred.resolve(data);
    }, function (err) {
      console.log('ERROR', err);
    });
  });

  return deferred.promise;
}

function storeSales(data){
  var deferred = Q.defer();
  log('info', data.logData, 'storeSales accesing', { totalSales: data.output.sales.length });

  Utils.truncateTable('Sale').then(function () {
    Utils.insertMultiple(data.output.sales, 'Sale', data).then(function () {
      deferred.resolve(data);
    }, function (err) {
      console.log('ERROR', err);
    });
  });

  return deferred.promise;
}

function storeAttendance(data){
  var deferred = Q.defer();
  log('info', data.logData, 'storeAttendance accesing', { totalAttendances: data.output.attendance.length });

  Utils.truncateTable('Attendance').then(function () {
    Utils.insertMultiple(data.output.attendance, 'Attendance', data).then(function () {
      deferred.resolve(data);
    }, function (err) {
      console.log('ERROR', err);
    });
  });

  return deferred.promise;
}

function storeSeries(data){
  var deferred = Q.defer();
  log('info', data.logData, 'storeSeries accesing', { totalSeries: data.output.series.length });

  Utils.truncateTable('Serie').then(function () {
    Utils.insertMultiple(data.output.series, 'Serie', data).then(function () {
      deferred.resolve(data);
    }, function (err) {
      console.log('ERROR', err);
    });
  });

  return deferred.promise;
}
