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

exports.logInPlatform = function(data){
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
};

exports.secondlogInPlatform = function(data){
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
};

exports.fetchCustomers = function(data){
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
};

exports.fetchSales = function(data){
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
};

exports.fetchAttendance = function(data){
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
};

exports.fetchSeries = function(data){
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
};

exports.storeData = function(data){
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
};

exports.storeCustomers = function(data){
  var deferred = Q.defer();

  log('info', data.logData, 'storeCustomers accesing', { totalCustomers: data.output.customers.length });

  for (var i = 0; i < data.output.customers.length; i++) {
    var customer = data.output.customers[i];
    Utils.insertInto(customer, 'Customer').then(function () {
    }, function (err) {
      console.log('ERROR', err);
    });
  }
  deferred.resolve(data);

  return deferred.promise;
};

exports.storeSales = function(data){
  var deferred = Q.defer();

  log('info', data.logData, 'storeSales accesing', { totalSales: data.output.sales.length });
  for (var i = 0; i < data.output.sales.length; i++) {
    var sale = data.output.sales[i];
    Utils.insertInto(sale, 'Sale').then(function () {
    }, function (err) {
      console.log('ERROR', err);
    });
  }
  deferred.resolve(data);

  return deferred.promise;
};

exports.storeAttendance = function(data){
  var deferred = Q.defer();

  log('info', data.logData, 'storeAttendance accesing', { totalAttendances: data.output.attendance.length });
  for (var i = 0; i < data.output.attendance.length; i++) {
    var attendance = data.output.attendance[i];
    Utils.insertInto(attendance, 'Attendance').then(function () {
    }, function (err) {
      console.log('ERROR', err);
    });
  }
  deferred.resolve(data);

  return deferred.promise;
};

exports.storeSeries = function(data){
  var deferred = Q.defer();

  log('info', data.logData, 'storeSeries accesing', { totalSeries: data.output.series.length });
  
  Utils.truncateTable('Serie').then(function () {
    for (var i = 0; i < data.output.series.length; i++) {
      var series = data.output.series[i];
      Utils.insertInto(series, 'Serie').then(function () {
      }, function (err) {
        console.log('ERROR', err);
      });
    }
    deferred.resolve(data);
  });

  return deferred.promise;
};
