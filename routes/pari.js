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

router.post('/statparis', function(req, res, next){
	
	var response = [];
	
		if (typeof req.body.id !== 'undefined'){
			var id = req.body.id;
			
			mysqlLib.getConnection(function(err,connection) {
				if (err) {
                    res.status(500).send({code:500, error: "Error in connection database : "+err });
                    return;
				}
				
				connection.query('SELECT * from jcs_statsparij where id_joueur = ?',[id], function(err, result) {
					connection.release();
					if (result.length > 0) {
							
						res.json(result);
										
					}      
					else {
						res.status(200).send({code:200, error: "erreur"});
					}
				});
			
				connection.on('error', function(err) {      
                    res.status(500).send({code:500, error: "Error in connection database : "+err });
                    return;
				});
			
			});
		} else {
            res.status(412).send({code:412, error: "Tout les paramètres ne sont pas fournis" });
            return;
		}
});	


router.post('/mesparis', function(req, res, next){
	
	var response = [];
	
	if (typeof req.body.id !== 'undefined'){
			var id = req.body.id;
							
			mysqlLib.getConnection(function(err,connection) {
				if (err) {
                    res.status(500).send({code:500, error: "Error in connection database : "+err });
                    return;
				}
				
				connection.query('SELECT * FROM jcs_parijoueur WHERE id_joueur = ? ORDER BY id_parij DESC',[id], function(err, result) {
					connection.release();
					if (!err) {				
						res.json(result);						
					}      
					else {
						res.status(200).send({code:200, error: "erreur"});
					}
				});
			
				connection.on('error', function(err) {      
                    res.status(500).send({code:500, error: "Error in connection database : "+err });
                    return;
				});
			
			});
		} else {
            res.status(412).send({code:412, error: "Tout les paramètres ne sont pas fournis" });
            return;
		}
	
});


router.post('/mesparisencours', function(req, res, next){
	
	var response = [];
	
	if (typeof req.body.id !== 'undefined'){
			var id = req.body.id;
							
			mysqlLib.getConnection(function(err,connection) {
				if (err) {
                    res.status(500).send({code:500, error: "Error in connection database : "+err });
                    return;
				}
				
				connection.query('SELECT * FROM jcs_parijoueur WHERE id_joueur = ? AND resolu = 0 ORDER BY id_parij DESC',[id], function(err, result) {
					connection.release();
					if (!err) {				
						res.json(result);						
					}      
					else {
						res.status(200).send({code:200, error: "erreur"});
					}
				});
			
				connection.on('error', function(err) {      
                    res.status(500).send({code:500, error: "Error in connection database : "+err });
                    return;
				});
			
			});
		} else {
            res.status(412).send({code:412, error: "Tout les paramètres ne sont pas fournis" });
            return;
		}
});


router.post('/parisencours', function(req, res, next){

			mysqlLib.getConnection(function(err,connection) {
				if (err) {
                    res.status(500).send({code:500, error: "Error in connection database : "+err });
                    return;
				}
				
				connection.query('SELECT * FROM jcs_pari WHERE par_date_fin <= NOW() ORDER BY par_idmatch DESC', function(err, result) {
					connection.release();
					if (!err) {				
						res.json(result);						
					}      
					else {
						res.status(200).send({code:200, error: "erreur"});
					}
				});
			
				connection.on('error', function(err) {      
                    res.status(500).send({code:500, error: "Error in connection database : "+err });
                    return;
				});
			
			});	
});


router.post('/parier', function(req, res, next){

	var iduser = req.body.iduser;
	var idpari = req.body.idpari;
	var issue = req.body.issue;
	var cote = req.body.cote;
	var mise = req.body.mise;
	var date = new Date();
	//ajout UTC+2 heure ETE
	var date = date.addHours(2);
	var date = date.toISOString().slice(0, 19).replace('T', ' ');
	
	mysqlLib.getConnection(function(err,connection) {
		if (err) {
			res.status(500).send({code:500, error: "Error in connection database : "+err });
			return;
		}
		
		connection.query('INSERT INTO jcs_parijoueur (id_joueur,issue_choisi,cote_pari,mise_pari,date_pari,id_pari_origine)'
		+' VALUES (?,?,?,?,?,?)',[iduser,issue,cote,mise,date,idpari],function(err, result) {
			
			connection.query('UPDATE jcs_statsparij SET nb_pari = nb_pari + 1, argent_actuel = argent_actuel - ?'
			+' WHERE id_joueur = ?',[mise, iduser], function(err, data){	
			connection.release();
			if (!err) {				
				res.json({"succes":true});						
			}      
			else {
				res.status(200).send({code:200, error: "erreur"});
			}
			});
		});
	
		connection.on('error', function(err) {      
			res.status(500).send({code:500, error: "Error in connection database : "+err });
			return;
		});
	
	});	
});

Date.prototype.addHours= function(h){
    this.setHours(this.getHours()+h);
    return this;
}

module.exports = router;
