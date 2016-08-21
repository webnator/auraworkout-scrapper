'use strict';

var responses = require('../../../components/responses');

module.exports = {
  internal_ddbb_error: {
    statusCode: 500,
    code: responses.auraworkout500.code,
    message: 'Internal DDBB Error'
  },

  rules_listed_ok: {
    statusCode: 200,
    code: responses.auraworkout200.code,
    message: 'Rules listed successfully'
  },

  no_rules: {
    statusCode: 501,
    code: responses.auraworkout501.code,
    message: 'No mailing rules have been returned'
  },

  rule_created: {
    statusCode: 201,
    code: responses.auraworkout201.code,
    message: 'Rule has been created successfully'
  },

  rule_updated: {
    statusCode: 201,
    code: responses.auraworkout201.code,
    message: 'Rule has been updated successfully'
  },

  rule_deleted: {
    statusCode: 204,
    code: responses.auraworkout204.code,
    message: 'Rule has been deleted successfully'
  }
};
