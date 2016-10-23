/**
 * Main application routes
 */

'use strict';

exports.register = function(server, options, next) {
  
  /* Required API endpoints */
  

  require('./api/data')(server);
  require('./api/register')(server);
  require('./api/mailing')(server);
  require('./api/users')(server);
  /* routesinject */

  next();
};

exports.register.attributes = {
  name: 'aura-workout-routes',
  version: '0.0.1'
};
