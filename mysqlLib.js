var mysql = require("mysql");
var settings = require("./settings");
var dbConfig = settings.dbConfig;

const pool      =    mysql.createPool({
    connectionLimit : 100, //important
    host     : dbConfig.server,
    user     : dbConfig.user,
    password : dbConfig.password,
    database : dbConfig.database,
    debug    :  false
  });

/*const pool      =    mysql.createPool({
    connectionLimit : 100, //important
    host     : '149.255.137.161',
    user     : 'ehpadmysql',
    password : '!ehpadmysql;2017',
    database : 'ehpad',
    debug    :  false
  });*/

  exports.getConnection = function(callback) {
  pool.getConnection(function(err, conn) {
    if(err) {
      return callback(err);
    }
    callback(err, conn);
  });
};


//module.exports = mysqlLib;