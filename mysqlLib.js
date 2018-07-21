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

  exports.getConnection = function(callback) {
  pool.getConnection(function(err, conn) {
    if(err) {
      return callback(err);
    }
    callback(err, conn);
  });
};


//module.exports = mysqlLib;