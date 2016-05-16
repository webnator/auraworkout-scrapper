'use strict';

var dataController = require('./controllers/dataController');

module.exports = function(server) {
  server.route({
    method: 'GET',
    path: '/data',
    config: {
      auth: false,
      tags: ['api', 'data'],
      description: 'Default data get request'
    },
    handler: dataController.fetchData
  });

};
