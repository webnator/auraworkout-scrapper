'use strict';

var responses = require('../../../components/responses');

module.exports = {
  internal_ddbb_error: {
    statusCode: 500,
    code: responses.auraworkout500.code,
    message: 'Internal DDBB Error'
  },

  all_ok: {
    statusCode: 200,
    code: responses.auraworkout200.code,
    message: 'Yay! all good'
  },

  register_error: {
    statusCode: 400,
    code: responses.auraworkout400.code,
    message: 'Error while registering into zingfit'
  }
};
