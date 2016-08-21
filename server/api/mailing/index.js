'use strict';

var mailingController = require('./controllers/mailingController');

module.exports = function(server) {
  server.route({
    method: 'GET',
    path: '/mailing/rules/{ruleId?}',
    config: {
      auth: false,
      tags: ['api', 'data'],
      description: 'Gets all (or one) mail rules'
    },
    handler: mailingController.getRules
  });

  server.route({
    method: 'POST',
    path: '/mailing/rules/',
    config: {
      auth: false,
      tags: ['api', 'data'],
      description: 'Creates a new rule'
    },
    handler: mailingController.createRule
  });

  server.route({
    method: 'PUT',
    path: '/mailing/rules/{ruleId}',
    config: {
      auth: false,
      tags: ['api', 'data'],
      description: 'Updates an existing rule'
    },
    handler: mailingController.updateRule
  });

  server.route({
    method: 'DELETE',
    path: '/mailing/rules/{ruleId}',
    config: {
      auth: false,
      tags: ['api', 'data'],
      description: 'Deletes an existing rule'
    },
    handler: mailingController.deleteRule
  });
  

};
