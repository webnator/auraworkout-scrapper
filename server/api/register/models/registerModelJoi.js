'use strict';
var Joi       = require('joi');

function registerModelJoi() {
  return Joi.object().keys({
    action: Joi.string().valid('Account.save').required(),
    facebookid: Joi.string().allow('').required(),
    groupactivationcode: Joi.string().required(),
    state: Joi.string().required(),
    month: Joi.string().required(),
    day: Joi.string().required(),
    year: Joi.string().required(),
    referrer: Joi.string().required(),
    phone: Joi.string().required(),
    phone2: Joi.string().required(),
    address: Joi.string().required(),
    address2: Joi.string().required(),
    city: Joi.string().required(),
    zip: Joi.string().required(),
    billingaddress: Joi.string().required(),
    billingzip: Joi.string().required(),
    company: Joi.string().required(),
    emergencycontact: Joi.string().required(),
    emergencyphone: Joi.string().required(),

    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    username: Joi.string().email().required(),
    password: Joi.string().required(),
    passwordconfirm: Joi.string().required(),
    agreeterms: Joi.string().valid('1').required()
  });
}

module.exports = registerModelJoi;