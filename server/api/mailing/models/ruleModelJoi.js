'use strict';
var Joi       = require('joi');

function ruleModelJoi() {
  return Joi.object().keys({
    query: Joi.string().required(),
    name: Joi.string().required(),
    active: Joi.boolean().default(1),
    onlyAdd: Joi.boolean().default(0),
    listId: Joi.string()
  });
}

module.exports = ruleModelJoi;
