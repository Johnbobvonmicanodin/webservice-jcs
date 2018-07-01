var cluster = require('./app');

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
    //require('./app.js')();
    
}