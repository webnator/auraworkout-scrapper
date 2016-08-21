'use strict';

var dataResponses = require('./../responses/dataResponses');
var Q             = require('q');
var Utils         = require('../../../components/utils');
var log           = Utils.log;

exports.getData = getData;

function getData(data){
  var deferred = Q.defer();

  log('info', data.logData, 'getData accesing');

  var sqlQuery = {
    limit: data.query.limit || 100,
    page: data.query.page || 1,
    orderBy: data.query.orderBy || 'id',
    search: data.query.search,
    searchParam: data.query.searchParam
  };
  
  switch (data.params.dataTable) {
    case 'customer':
      sqlQuery.orderBy = data.query.orderBy || 'id';
      break;
    case 'attendance':
      sqlQuery.orderBy = data.query.orderBy || 'ATTENDANCEID';
      break;
    case 'sale':
      sqlQuery.orderBy = data.query.orderBy || 'ORDER_ID';
      break;
    case 'serie':
      sqlQuery.orderBy = data.query.orderBy || 'EMAIL';
      break;
    default:
      deferred.reject(dataResponses.data_type_not_valid);
      break;
  }
  data.params.dataTable = data.params.dataTable.charAt(0).toUpperCase() + data.params.dataTable.slice(1);

  Utils.getAllFrom(data.params.dataTable, sqlQuery).then(function (response) {
    data.customers = response.data;
    data.total = response.count;
    data.totalPages = Math.ceil(data.total / data.query.limit);
    deferred.resolve(data);

  }, function (err) {
    console.log('ERROR', err);
    deferred.reject(err);
  });

  return deferred.promise;
}
