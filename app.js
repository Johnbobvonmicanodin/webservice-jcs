var settings      = require('./settings'),        // Fichier de config
    express       = require('express'),
    http          = require("http"),
    path          = require('path'),
    favicon       = require('serve-favicon'),
    logger        = require('morgan'),
    cookieParser  = require('cookie-parser'),
    bodyParser    = require('body-parser'),
    loggerLib     = require('./loggerLib.js'),  // LOGGER
    jwtAuth       = require('express-jwt'),     // Sécurisation des routes
    app           = express(),
    cluster       = require("cluster"),
    fs            = require('fs');

var pjson = require('./package.json');
var errDomain = require('domain');

const mysql = require('mysql');   // MYSQL CONNECTOR

/* Vérification du token pour les routes sécurisées */
var jwtCheck = jwtAuth({
  secret: settings.secret
});

//var index = require('./routes/index');

// Incllusion des models
var jcs = require('./routes/jcs');
var user = require('./routes/user');
var pari = require('./routes/pari');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'JCSLOGOFINAL.ico')));


//app.use(logger('dev'));
/*app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());*/

app.use(bodyParser.urlencoded({ extended : true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  // On créer un domain pour cette requête
  var domain = errDomain.create();

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
 //  next();

  // gestion des erreurs
  domain.on('error', function(error) {
    console.error('DOMAINE ERROR CAUGHT:', error.stack);
    try {
      // on ferme gracieusement
      setTimeout(function() {
        console.error('Failsafe shutdown');
                
        // on clos le processus
          process.exit(1);
      }, 5000);
            
      // on se déconnecte du serveur
      var worker = cluster.worker;
            
      if (worker) {
        worker.disconnect();
      }

      // on arrête de répondre aux nouvelles requêtes
      server.close();
                
      try {
        // on tente d'utiliser l'erreur d'Express
        next(error);
      }
      catch(error) {
        // Si l'erreur d'Express échoue
        // on répond en node pur
        console.error('Failed to route Express error');
        response.statusCode = 500;
        response.setHeader('content-type', 'text/plain');
        response.send('Server error');
      }
    }
    catch(error) {
      console.error('Unable to send 500 response\n', error.stack);
    }
  });

  // on ajoute notre requête et réponse au domaine
  domain.add(req);
  domain.add(res);

  // on passe aux autres middleware
  domain.run(next);

});

app.use('/jcs', jcs);
app.use('/user', user);
app.use('/pari', pari);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  if (err.name === 'UnauthorizedError') {
    res.status(401).send('Unauthorized Access!');
  } else {
    // render the error page
    res.status(err.status || 500);
    res.render('error');
  }
});

fs.watchFile("package.json", function(curr, prev) {
  console.log("Package.json changé, rechargement du cluster ...");
  cluster.reload();
});

function startWorker() {
  var worker = cluster.fork();
  console.log('CLUSTER: Worker %d started', worker.id);
}

if (cluster.isMaster) {
  require('os').cpus().forEach(function() {
      startWorker();
  });
  
  // logue quand un worker se déconnecte
  cluster.on('disconnect', function(worker) {
      console.log('CLUSTER: Worker %d disconnected from the cluster.', worker.id);
  });
  
  // lance un nouveau worker quand un s'arrête
  cluster.on('exit', function(worker, code, signal) {
      console.log('CLUSTER: Worker %d died with exit code %d (%s)', worker.id, code, signal);
      startWorker();
  });
}

// démarre le serveur en tant que module pour les workers
else {
	
  http.createServer(app, function (req, resp) { }).listen(settings.webPort, function () {
    loggerLib.info("========================================");
    loggerLib.info("WebService JCS - Sécurisé");
    loggerLib.info("Démarrage écoute sur le port : " + settings.webPort);
    loggerLib.info("Version : " + pjson.version);
    loggerLib.info("========================================");
  })
}

module.exports = app;