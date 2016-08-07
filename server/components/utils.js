'use strict';

var uuid          = require('uuid');
var GlobalModule  = require('./global');
var Q             = require('q');
var Joi           = require('joi');
var config        = require('../config/environment');
var crypto        = require('crypto');
const util        = require('util');
var req           = require('request');
var winston       = require('winston');

var w = new (winston.Logger)({
  colors: {
    trace: 'magenta',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    debug: 'blue',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    error: 'red'
  }
});

w.add(winston.transports.Console, {
  level: config.loggerLevel,
  prettyPrint: true,
  colorize: true,
  silent: false
  // , timestamp: false
});

exports.DBConnection        = DBConnection;
exports.truncateTable       = truncateTable;
exports.performQuery        = performQuery;
exports.getAllFrom          = getAllFrom;
exports.getHash             = getHash;
exports.insertInto          = insertInto;
exports.insertBulk          = insertBulk;
exports.insertMultiple      = insertMultiple;
exports.countAllFrom        = countAllFrom;
exports.generateUuid        = generateUuid;
exports.generateToken       = generateToken;
exports.encryptText         = encryptText;
exports.decryptText         = decryptText;
exports.createResponseData  = createResponseData;
exports.sendRequest         = sendRequest;
exports.logData             = logData;
exports.validateSchema      = validateSchema;
exports.log                 = log;

function DBConnection() {
  return GlobalModule.getConfigValue('db').pool;
}

function getHash(stringToHash, algorithm) {
  return crypto.createHash(algorithm).update(stringToHash).digest('hex');
}

function getAllFrom(table, sqlQuery) {
  var deferred = Q.defer();
  var conn = new DBConnection();
  conn.getConnection(function(err, connection) {
    if(err) {
      deferred.reject(err);
    }

    var page = (sqlQuery.page - 1) * sqlQuery.limit;

    var query = 'SELECT * FROM ' + table;
    if (sqlQuery.search && sqlQuery.searchParam) {
      query += ' WHERE ' + sqlQuery.searchParam + ' LIKE \'%' + sqlQuery.search + '%\'';
    }
    query += ' ORDER BY ' + sqlQuery.orderBy;
    query += ' LIMIT ' + page + ',' + sqlQuery.limit;
    
    connection.query(query, function (err, res) {
      if(err) {
        deferred.reject(err);
      }
      var response = {
        data: res
      };
      var countQuery = 'SELECT COUNT(*) as total FROM ' + table;
      if (sqlQuery.search && sqlQuery.searchParam) {
        countQuery += ' WHERE ' + sqlQuery.searchParam + ' LIKE \'%' + sqlQuery.search + '%\'';
      }

      connection.query(countQuery, function (err, res) {
        if (err) {
          deferred.reject(err);
        }
        response.count = res[0].total;
        
        deferred.resolve(response);
      });
      
      
      
    });
    // And done with the connection.
    connection.release();
  });
  return deferred.promise;
}

function performQuery(query) {
  var deferred = Q.defer();
  var conn = new DBConnection();
  conn.getConnection(function(err, connection) {
    if(err) {
      deferred.reject(err);
    }

    connection.query(query, function (err, res) {
      if(err) {
        deferred.reject(err);
      }
      var response = {
        data: res
      };
      deferred.resolve(response);
    });
    // And done with the connection.
    connection.release();
  });
  return deferred.promise;
}

function countAllFrom(table) {
  var deferred = Q.defer();
  var conn = new DBConnection();
  conn.getConnection(function(err, connection) {
    if(err) {
      deferred.reject(err);
    }

    connection.query('SELECT COUNT(*) as total FROM ' + table, function (err, res) {
      if(err) {
        deferred.reject(err);
      }
      deferred.resolve(res);
    });
    // And done with the connection.
    connection.release();
  });
  return deferred.promise;
}

function truncateTable(table) {
  var deferred = Q.defer();
  var conn = new DBConnection();
  log('info', '', 'Utils truncateTable accesing');
  conn.getConnection(function(err, connection) {
    if(err) {
      log('error', '', 'Utils truncateTable connections error', err);
      deferred.reject(err);
    }
    log('info', '', 'Utils truncateTable connected');
    connection.query('TRUNCATE TABLE ' + table + ';', function (err, res) {
      if(err) {
        log('error', '', 'Utils truncateTable truncate error', err);
        return deferred.reject(err);
      }
      log('info', '', 'Utils truncateTable truncated');
      deferred.resolve(res);
    });
    // And done with the connection.
    connection.release();
  });
  return deferred.promise;
}

function insertInto(jsonObject, table) {
  var deferred = Q.defer();
  var conn = new DBConnection();
  conn.getConnection(function(err, connection) {
    if(err) {
      deferred.reject(err);
    }

    var insertSql = 'INSERT INTO `' + table + '` (';
    var fields = '';
    var values = '';
    var update = '';
    for (var i = 0; i < Object.keys(jsonObject).length; i++) {
      var key = Object.keys(jsonObject)[i].replace(' ', '_');
      var val = conn.escape(jsonObject[Object.keys(jsonObject)[i]]);
      fields += '`' + key + '`';
      values += val;
      update += '`' + key + '`=' + val;
      if (i !== Object.keys(jsonObject).length - 1) {
        fields += ', ';
        values += ', ';
        update += ', ';
      }
    }
    insertSql += fields + ') VALUES (' + values + ') ON DUPLICATE KEY UPDATE ' + update + ';';
    console.log('INSERT', insertSql);
    connection.query(insertSql, function (err, res) {
      if(err) {
        deferred.reject(err);
      }
      deferred.resolve(res);
    });
    // And done with the connection.
    connection.release();
  });
  return deferred.promise;
}

function insertMultiple(jsonObject, table) {
  var deferred = Q.defer();
  var conn = new DBConnection();
  log('info', '', 'Utils insertMultiple accesing');
  conn.getConnection(function(err, connection) {
    if(err) {
      log('error', '', 'Utils insertMultiple connections error', err);
      deferred.reject(err);
    }
    log('info', '', 'Utils insertMultiple connected');

    var total = jsonObject.length;
    var current = 0;
    var i, y;
    for (i = 0; i < jsonObject.length; i++) {

      var insertSql = 'INSERT INTO `' + table + '` (';
      var fields = '';
      var values = '';
      var update = '';
      for (y = 0; y < Object.keys(jsonObject[i]).length; y++) {
        var key = Object.keys(jsonObject[i])[y].replace(' ', '_');
        var val = conn.escape(jsonObject[i][Object.keys(jsonObject[i])[y]]);
        fields += '`' + key + '`';
        values += val;
        update += '`' + key + '`=' + val;
        if (y !== Object.keys(jsonObject[i]).length - 1) {
          fields += ', ';
          values += ', ';
          update += ', ';
        }
      }
      insertSql += fields + ') VALUES (' + values + ') ON DUPLICATE KEY UPDATE ' + update + ';';
      connection.query(insertSql, function (err) {
        current++;
        if (err) {
          console.log('Error Processing record for ' + table + ':', current, 'of', total, 'ERROR', err);
        } else {
          console.log('Processing record for ' + table + ':', current, 'of', total);
        }
        isDone(total, current, deferred);
      });
    }
  });

  function isDone(total, current, deferred) {
    if (current >= total) {
      console.log('IS DONE resolving');
      deferred.resolve();
    }
  }

  return deferred.promise;
}

function insertBulk(jsonObject, table) {
  var deferred = Q.defer();
  var conn = new DBConnection();
  conn.getConnection(function(err, connection) {
    if(err) {
      deferred.reject(err);
    }
    var insertSql = 'INSERT INTO `' + table + '` (';
    var fields = '';
    var i, y;
    for (i = 0; i < Object.keys(jsonObject[0]).length; i++) {
      var key = Object.keys(jsonObject[0])[i].replace(' ', '_');
      fields += '`' + key + '`';
      if (i !== Object.keys(jsonObject[0]).length - 1) {
        fields += ', ';
      }
    }
    var values = [];
    for (i = 0; i < jsonObject.length; i++) {
      var rowVal = [];
      for (y = 0; y < Object.keys(jsonObject[i]).length; y++) {
        var colKey = Object.keys(jsonObject[i])[y];
        rowVal.push(conn.escape(jsonObject[i][colKey]));
      }
      values.push(rowVal);
    }
    insertSql += fields + ') VALUES ? ';
    connection.query(insertSql, [values], function (err, res) {
      if(err) {
        return deferred.reject(err);
      }

      return deferred.resolve(res);
    });
    // And done with the connection.
    connection.release();
  });
  return deferred.promise;
}

function generateUuid() {
  return uuid.v4();
}

function generateToken(bytes, format){
  return crypto.randomBytes(bytes).toString(format);
}

function encryptText(encText) {
  var algorithm = 'aes-256-ctr';
  var text = String(encText);
  var cipher = crypto.createCipher(algorithm, config.salt);
  var crypted = cipher.update(text, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
}

function decryptText(text) {
  var algorithm = 'aes-256-ctr';
  var decipher = crypto.createDecipher(algorithm, config.salt);
  var dec = decipher.update(text, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}

function createResponseData(result, data) {
  var response = {
    result: result
  };
  if (data) {
    response.data = data;
  }
  return response;
}

function sendRequest(data){
  var deferred = Q.defer();
  log('info', data.logData, 'Utils sending request', data.reqData);
  req(data.reqData, function(error, response, body){
    // if(typeof body === 'string'){
    //   try{
    //     body = JSON.parse(body);
    //   } catch(e) {
    //     body = {};
    //   }
    // }
    data.reqData.body = body;
    data.reqData.response = response;

    if (error) {
      log('error', data.logData, 'Utils request failed', error);
      deferred.reject(error);
    } else {
      log('info', data.logData, 'Utils request received');
      deferred.resolve(data);
    }
  });
  return deferred.promise;
}

function logData(request){
  return {
    method: request.method.toUpperCase(),
    uuid: generateUuid(),
    path: request.path
  };
}

function validateSchema(data){
  var deferred  = Q.defer();

  Joi.validate(data.payload, data.schema, function(err) {
    if (err) {
      var error = {
        message: err.details[0].message,
        code: 400,
        statusCode: 400
      };
      deferred.reject(error);
    } else {
      deferred.resolve(data);
    }
  });

  return deferred.promise;
}

function log(level, generalData, description, extraData){
  var date = new Date().toISOString();
  var uuid = generalData.uuid || '';
  if ((typeof generalData === 'string') || (typeof generalData !== 'object')){
    w[level](util.format( '%s [%s] %s | %s | "%s" %j', date, uuid, config.host, config.appName, generalData, description || {}));
  }else{
    var method = generalData.method.toUpperCase();// || "METHOD ERROR";
    var path = generalData.path; //|| "PATH ERROR";
    w[level](util.format( '%s [%s] %s | %s | %s %s | %s | extraData: %j', date, uuid, config.host, config.appName, method, path, description, extraData || {}));
  }
}
