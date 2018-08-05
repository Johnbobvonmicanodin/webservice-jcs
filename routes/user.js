var	express = require('express'),
	router = express.Router(),
	mysqlLib = require("../mysqlLib"),
	logger = require("../loggerLib"),
	AES = require("crypto-js/aes"),
	SHA256 = require("crypto-js/sha256"),
	nodemailer = require('nodemailer'),
	jwt = require('jsonwebtoken'),
	settings = require("../settings");

const request = require("request");

router.post('/connexion', function(req, res, next){
	
	var response = [];
	
		if (typeof req.body.login !== 'undefined' && typeof req.body.passe !== 'undefined'){
			var login = req.body.login, passe = req.body.passe;
							
			passe = SHA256(passe).toString();
					
			mysqlLib.getConnection(function(err,connection) {
				if (err) {
                    res.status(500).send({code:500, error: "connexion - Error in connection database : "+err });
                    return;
				}
				
				connection.query('SELECT uti_login, uti_id, uti_admin from jcs_utilisateur where uti_login = ? and uti_passe = ? limit 1',[login, passe], function(err, result) {
					connection.release();
					if (result.length > 0) {
							
						res.json({
							"success" : true,
							"uti_id" : result[0].uti_id,
							"uti_login" : result[0].uti_login,
							"uti_admin" : result[0].uti_admin,
						});
										
					}      
					else {
						res.status(200).send({code:200, error: "connexion - Login ou mot de passe incorrect"});
					}
				});
			
				connection.on('error', function(err) {      
                    res.status(500).send({code:500, error: "connexion - Error in connection database : "+err });
                    return;
				});
			
			});
		} else {
            res.status(412).send({code:412, error: "connexion - Tout les paramètres ne sont pas fournis" });
            return;
		}
});	


router.post('/inscription', function(req, res, next){
	
	var response = [];
	
	if (typeof req.body.login !== 'undefined' && typeof req.body.passe !== 'undefined'){
			var login = req.body.login, passe = req.body.passe;
							
			passe = SHA256(passe).toString();
			
			mysqlLib.getConnection(function(err,connection) {
				if (err) {
                    res.status(500).send({code:500, error: "connexion - Error in connection database : "+err });
                    return;
				}
				
				connection.query('INSERT INTO jcs_utilisateur (uti_login, uti_passe, uti_admin) VALUES (?,?,0)',[login, passe], function(err, result) {
					
					if (!err) {
					
						connection.query('SELECT * FROM jcs_utilisateur WHERE uti_login = ?',[login], function(err, data){
							if(data.length > 0){
								var id = data[0].uti_id;

								connection.query('INSERT INTO jcs_statsparij (id_joueur) VALUES (?)',[id],function(err, valeur){
									connection.release();
									if(!err){
										res.json(data);
									}
								});
							}
						});													
					}      
					else {
						res.status(200).send({code:200, error: "connexion - Login ou mot de passe incorrect"});
					}
				});
			
				connection.on('error', function(err) {      
                    res.status(500).send({code:500, error: "connexion - Error in connection database : "+err });
                    return;
				});
			
			});
		} else {
            res.status(412).send({code:412, error: "connexion - Tout les paramètres ne sont pas fournis" });
            return;
		}
	
});

router.post('/modify', function(req, res, next){
	
	var response = [];
	
		var id = req.body.id, passe = req.body.passe;
		
		mysqlLib.getConnection(function(err,connection) {
			if (err) {
				res.json({"code" : 100, "status" : "Error in connection database : "+err});
				return;
			}
				passe = SHA256(passe).toString();
				
				connection.query('update jcs_utilisateur set uti_passe = ? where uti_id = ?', [passe, id], function(err, result){
						if(!err){
							response.push({'passe' : 'success'});
						}			
				});			
			
			 res.setHeader('Content-Type', 'application/json');
             res.status(200).send(JSON.stringify(response));
		
		});
});


router.post('/verifierpasse', function(req, res, next){
	
		var response = [];
				
		if (typeof req.body.id !== 'undefined' && req.body.passe !== 'undefined'){
			var id = req.body.id;
			var passe = req.body.passe;
		
			mysqlLib.getConnection(function(err,connection) {
				if (err) {
					res.json({"code" : 100, "status" : "Error in connection database : "+err});
					return;
				}
			
				passe = SHA256(passe).toString();
			
				connection.query('select uti_passe from jcs_utilisateur where uti_passe = ? and uti_id = ?'
				,[passe, id], function(err, result){
					connection.release();
					if(result.length > 0){
						res.json({"passe" : true});
					}
					else{
						res.json({"passe" : false});
					}
				});
			});
		
		}else {
			response.push({'result' : 'error', 'msg' : 'Please fill required details'});
			res.setHeader('Content-Type', 'application/json');
			res.status(200).send(JSON.stringify(response));
		}
});


router.post('/dedans', function(req, res, next){
	
	var response = [];
		
	if (typeof req.body.login !== 'undefined'){
			var login = req.body.login;
				
			mysqlLib.getConnection(function(err,connection) {
			if (err) {
				res.json({"code" : 100, "status" : "Error in connection database : "+err});
				return;
			}
					
			connection.query('select * from jcs_utilisateur where uti_login = ?'
			,[login], function(err, result) {				
				connection.release();
				if (result.length > 0){		
					
					res.json({"login" : false});
				}
				else
				{
					
					res.json({"login" : true});
				}
			});
			
		});
	} else {
		response.push({'result' : 'error', 'msg' : 'Please fill required details'});
		res.setHeader('Content-Type', 'application/json');
    	res.status(200).send(JSON.stringify(response));
	}
});

router.post('/changerlogin', function(req, res, next){	
	var response = [];
	
		if (typeof req.body.login){
			var login = req.body.login;
			var id = req.body.id;
		
			mysqlLib.getConnection(function(err,connection) {
			if (err) {
				res.json({"code" : 100, "status" : "Error in connection database : "+err});
				return;
			}
		
				connection.query('update jcs_utilisateur set uti_login = ? where uti_id = ?', [login, id], function(err, result){		
						if(!err){
							res.json({"success" : true});
						}								
				});				
			});	
		}else {
			response.push({'result' : 'error', 'msg' : 'Please fill required details'});
			res.setHeader('Content-Type', 'application/json');
			res.status(200).send(JSON.stringify(response));
		}
});


router.post('/listegames', function(req, res, next){
	
	mysqlLib.getConnection(function(err, connection){
			if (err) {
				res.json({"code" : 100, "status" : "Error in connection database : "+err});
				return;
			}
		
		connection.query('select * from jcs_match order by mat_id desc limit 10', function(err, data){
			connection.release();
			if(err){
					console.log('erreur selection');
			}
			else
			{
				res.json(data);
			}
		});
		
	});
});


router.post('/deletegame', function(req, res, next){
	
	var response = [];
	
	if(typeof req.body.idgame !== 'undefined'){
		
		var id = req.body.idgame;
		
		mysqlLib.getConnection(function(err, connection){
			if (err) {
				res.json({"code" : 100, "status" : "Error in connection database : "+err});
				return;
			}
		
			connection.query('delete from jcs_banns where id_match = ?',[id], function(err, data){		
			if(!err){
					connection.query('delete from jcs_statsjpm where id_match = ?',[id], function(err, data){
						if(!err){
							connection.query('delete from jcs_match where mat_id = ?',[id], function(err, data){
							connection.release();
							if(!err){
								res.json({"sucess":"oui"});
							}
							});
						}
					});
			}
			});
			
		});
	}
	else{
		response.push({'result' : 'error', 'msg' : 'Please fill required details'});
		res.setHeader('Content-Type', 'application/json');
		res.status(200).send(JSON.stringify(response));
	}	
});


 
module.exports = router;
