/**
 * Main application file
 */
'use strict';

var Hapi          = require('hapi');
var config        = require('./config/environment');
var GlobalModule  = require('./components/global.js');
var fs            = require('fs');

// Create a server with a host and port
var server;
var setOptions = function () {
  var opts = {};
  opts.routes = {prefix: config.routes.prefix};
  return opts;
};

var tls = {
  key: fs.readFileSync(__dirname + '/certs/domain.key'),
  cert: fs.readFileSync(__dirname + '/certs/domain.crt')
};

var init = function () {
  return new Promise((resolve, reject) => {
    // Create a server with a host and port
    server = new Hapi.Server();
    server.connection({
      port: config.port,
      routes: {
        cors: true
      }
      //tls: tls
    });
    //server.connection({address: '0.0.0.0', port: 443, tls: tls });

    // Register the server and start the application
    server.register(
      [
        {register: require('./routes')},
        {register: require('hapi-mysql'), options: config.mysqlSettings},
        {register: require('inert')},
        {register: require('vision')}
      ],
      setOptions(),
      function (err) {
        if (err) {
          return reject(err);
        }
        server.start(function (err) {
          if (err) {
            return reject(err);
          }
          GlobalModule.setConfigValue('db', server.plugins['hapi-mysql']);
          return resolve(server);
        });
      }
    );
  });
};

var stopServer = function() {
  return new Promise((resolve, reject) => {
    GlobalModule.getConfigValue('db').close();
    server.stop(function (err) {
      if (err) {
        return reject(err);
      }
      console.log('Server stopped');
      return resolve(server);
    });
  });
};

exports.init = init;
exports.stopServer = stopServer;
