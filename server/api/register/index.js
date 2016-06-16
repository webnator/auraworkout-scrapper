'use strict';

var registerController = require('./controllers/registerController');

module.exports = function(server) {
  server.route({
    method: 'POST',
    path: '/register',
    config: {
      auth: false,
      tags: ['api', 'register'],
      description: 'Register a new user into zingfit'
    },
    handler: registerController.registerUser
  });

};




 

