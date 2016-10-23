'use strict';

var userController = require('./controllers/userController');

module.exports = function(server) {
  server.route({
    method: 'POST',
    path: '/redeemCode',
    config: {
      auth: false,
      tags: ['api', 'data'],
      description: 'Redeems the free class code'
    },
    handler: userController.redeemCode
  });
  

};
