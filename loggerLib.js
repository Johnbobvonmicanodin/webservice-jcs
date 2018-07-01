var winston = require('winston');       // Logging library
var fs = require('fs');               // File library
const logDir = 'logs';
const env = process.env.NODE_ENV || 'development';

/* CONFIGURATION DES LOGS (AVEC WINSTON) */
// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}
const tsFormat = () => (new Date()).toLocaleTimeString();

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            timestamp: tsFormat,
            colorize: true,
            //level: 'info'
        })/*,
        new (require('winston-daily-rotate-file'))({
            filename: logDir + '/-results.log',
            timestamp: tsFormat,
            datePattern: 'yyyy-MM-dd',
            prepend: true,
            level: env === 'development' ? 'verbose' : 'info'
        })*/
    ]
});
/*logger.debug('Debugging info');
logger.verbose('Verbose info');
logger.info('Hello world');
logger.warn('Warning message');
logger.error('Error info');*/

module.exports = logger;