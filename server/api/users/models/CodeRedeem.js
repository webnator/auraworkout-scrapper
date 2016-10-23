'use strict';
var Joi       = require('joi');

function codeRedeemJoi() {
  return Joi.object().keys({
    classCode: Joi.string().guid().required()
  });
}

module.exports = codeRedeemJoi;