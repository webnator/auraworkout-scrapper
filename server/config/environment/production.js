'use strict';

// Production specific configuration
// =================================
module.exports = {
  ip              : 'localhost',
  port            : process.env.PORT || 9000,

  mysqlSettings: {
    host     : '107.180.21.19',
    port     : '3306',
    user     : 'toptalAdmin',
    password : 'QbX!4{82KOx*',
    database : 'zing_reports'
  },

  mongoSettings: {
  port: '',
    username: 'root',
    password: 'AC1kuG1RVoWH'
}
};
