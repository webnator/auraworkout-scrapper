'use strict';
var Joi       = require('joi');

function ruleModelJoi() {
  return Joi.object().keys({
    query: Joi.string(),
    name: Joi.string(),
    active: Joi.boolean(),
    onlyAdd: Joi.boolean(),
    listId: Joi.string()
  });
}

module.exports = ruleModelJoi;
