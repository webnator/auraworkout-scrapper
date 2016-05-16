'use strict';

var responses = require('../../../components/responses');

module.exports = {
  internal_ddbb_error: {
    statusCode: 500,
    code: responses.auraworkout500.code,
    message: 'Internal DDBB Error'
  },

  pettition_accepted: {
    statusCode: 202,
    code: responses.auraworkout202.code,
    message: 'Fetch data petition accepted'
  },

  petition_refused: {
    statusCode: 406,
    code: responses.auraworkout406.code,
    message: 'Fetch data petition refused'
  },

  login_error: {
    statusCode: 401,
    code: responses.auraworkout401.code,
    message: 'Error login to Zing platform'
  },

  customers_listed_ok: {
    statusCode: 200,
    code: responses.auraworkout200.code,
    message: 'Customers retrieved correctly'
  }
};
