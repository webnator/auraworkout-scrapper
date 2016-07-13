'use strict';

var Responses = require('./responses');

exports.createGeneralError = function (err) {
  var result = {
    result: err
  };

  if (!result.result.code) {
    result.result.code = Responses.general500.code;
  }
  return result;
};
