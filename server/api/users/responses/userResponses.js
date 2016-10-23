'use strict';

var responses = require('../../../components/responses');

module.exports = {
  internal_ddbb_error: {
    statusCode: 500,
    code: responses.auraworkout500.code,
    message: 'Internal DDBB Error'
  },

  code_redeemed_ok: {
    statusCode: 200,
    code: responses.auraworkout200.code,
    message: 'Code successfully redeemed'
  },

  invalid_code_ko: {
    statusCode: 404,
    code: responses.auraworkout404.code,
    message: 'Code is not valid'
  },

  code_claimed_ko: {
    statusCode: 403,
    code: responses.auraworkout403.code,
    message: 'Code has already been claimed'
  },

  invalid_user_ko: {
    statusCode: 400,
    code: responses.auraworkout400.code,
    message: 'The user is not registered'
  },

  internal_error: {
    statusCode: 500,
    code: responses.auraworkout500.code,
    message: 'There was an error processign your request, please try again'
  }

};
