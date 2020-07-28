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

/*
	CARTES 
*/

//Recupere toutes les cartes pour une ligue/saison
router.post('/allcards', function(req, res, next){
	
	var response = [];
	
		if (typeof req.body.saison !== 'undefined' && typeof req.body.ligue !== 'undefined'){
			var saison = req.body.saison, ligue = req.body.ligue;
									
			mysqlLib.getConnection(function(err,connection) {
				if (err) {
                    res.status(500).send({code:500, error: "connexion - Error in connection database : "+err });
                    return;
				}
				
				connection.query('SELECT * from jcs_carte where ligue = ? and saison = ? ',[ligue, saison], function(err, result) {
					connection.release();
					if (!err) {				
						res.json(result);						
					}      
					else {
						res.status(200).send({code:200, error: "erreur dans l'accès aux cartes"});
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

//Recupere toutes les cartes pour une ligue/saison pour un type
router.post('/allcardstype', function(req, res, next){
	
	var response = [];
	
		if (typeof req.body.saison !== 'undefined' && typeof req.body.ligue !== 'undefined'){
			var saison = req.body.saison, ligue = req.body.ligue;
			var type = req.body.type;

			if(type == 3 || type == 4)
			{
				var ligue = "all";
			}
			
										
			mysqlLib.getConnection(function(err,connection) {
				if (err) {
                    res.status(500).send({code:500, error: "connexion - Error in connection database : "+err });
                    return;
				}
				
				connection.query('SELECT * from jcs_carte where ligue = ? and saison = ? and nature_carte = ?',[ligue, saison, type], function(err, result) {
					connection.release();
					if (!err) {				
						res.json(result);						
					}      
					else {
						res.status(200).send({code:200, error: "erreur dans l'accès aux cartes"});
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

//Recupere toutes les cartes pour une ligue/saison pour un type seulement normales (cartes de base)
router.post('/allcardsbase', function(req, res, next){
	
	var response = [];
	
		if (typeof req.body.saison !== 'undefined' && typeof req.body.ligue !== 'undefined'){
			var saison = req.body.saison, ligue = req.body.ligue;
			var type = req.body.type;

			if(type == 3 || type == 4)
			{
				var ligue = "all";
			}
			
			mysqlLib.getConnection(function(err,connection) {
				if (err) {
                    res.status(500).send({code:500, error: "connexion - Error in connection database : "+err });
                    return;
				}
				
				connection.query('SELECT * from jcs_carte where ligue = ? and saison = ? and nature_carte = ? and rarete_carte = 1',[ligue, saison, type], function(err, result) {
					connection.release();
					if (!err) {				
						res.json(result);						
					}      
					else {
						res.status(200).send({code:200, error: "erreur dans l'accès aux cartes"});
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


//Ajoute une carte 
router.post('/addcard', function(req, res, next){
	
	if (typeof req.body.saison !== 'undefined' && typeof req.body.ligue !== 'undefined'){
		var saison = req.body.saison, ligue = req.body.ligue;
		var nom_carte = req.body.nom_carte;
		var rarete_carte = req.body.rarete_carte;
		var effet_carte = req.body.effet_carte;
		var poste = req.body.poste;
		var nature_carte = req.body.nature_carte;
		var prix = req.body.prix;
		
		mysqlLib.getConnection(function(err,connection) {
			if (err) {
				res.status(500).send({code:500, error: "Error in connection database : "+err });
				return;
			}
			
			connection.query('INSERT INTO jcs_carte (nom_carte, rarete_carte, effet_carte, poste, nature_carte, prix, ligue, saison) VALUES (?,?,?,?,?,?,?,?)', [nom_carte,rarete_carte,effet_carte,poste,nature_carte,prix,ligue,saison], function(err, result) {
				connection.release();						
				if (!err) {
			
					res.json({'success':true});
				}      
				else {
					res.status(200).send({code:200, error: "erreur dans l'ajout des cartes"});
					console.log(err);
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


//Supprimer une carte
router.post('/deletecard', function(req, res, next){


	if (typeof req.body.nom_carte !== 'undefined'){
		var nom_carte = req.body.nom_carte;
		var saison = req.body.saison, ligue = req.body.ligue;

	mysqlLib.getConnection(function(err,connection) {
		if (err) {
			res.status(500).send({code:500, error: "Error in connection database : "+err });
			return;
		}
		
		connection.query('DELETE FROM jcs_carte WHERE nom_carte = ? and ligue = ? and saison = ?',[nom_carte, ligue, saison],function(err, result) {
			connection.release();
			if (!err) {				
				res.json({'success':true});						
			}      
			else {
				res.status(200).send({code:200, error: "erreur, la suppression des cartes a echoué"});
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

//Modifier une carte 
router.post('/modifycard', function(req, res, next){
	
	var response = [];
	
		var id = req.body.id;
		var effet_carte = req.body.effet_carte;
		var prix = req.body.prix;
		var score = req.body.score;
		
		mysqlLib.getConnection(function(err,connection) {
			if (err) {
				res.json({"code" : 100, "status" : "Error in connection database : "+err});
				return;
			}
										
				connection.query('update jcs_carte set effet_carte = ?, prix = ?, score = ?  where id_carte = ?', [effet_carte, prix, score, id], function(err, result){
						if(!err){
							response.push({'passe' : 'success'});
						}			
				});			
			
			 res.setHeader('Content-Type', 'application/json');
             res.status(200).send(JSON.stringify(response));
		
		});
});

//Recuperer une liste de cartes pour un nom
router.post('/cardsforaname', function(req, res, next){
	
		var response = [];
				
		if (typeof req.body.nom_carte !== 'undefined'){
			var nom_carte = req.body.nom_carte;
			var saison = req.body.saison, ligue = req.body.ligue;

			mysqlLib.getConnection(function(err,connection) {
				if (err) {
					res.json({"code" : 100, "status" : "Error in connection database : "+err});
					return;
				}
				connection.query('SELECT * FROM jcs_carte where nom_carte = ? and ligue = ? and saison = ?',[nom_carte, ligue, saison], function(err, result) {
					connection.release();
					if (!err) {				
						res.json(result);						
					}      
					else {
						res.status(200).send({code:200, error: "erreur dans l'accès aux cartes"});
					}
				});
			});
		
		}else {
			response.push({'result' : 'error', 'msg' : 'Please fill required details'});
			res.setHeader('Content-Type', 'application/json');
			res.status(200).send(JSON.stringify(response));
		}
});


/*
	ROSTER 
*/

//Ajoute une ligne roster 
router.post('/addroster', function(req, res, next){
	
	if (typeof req.body.saison !== 'undefined' && typeof req.body.ligue !== 'undefined'){
		var saison = req.body.saison, ligue = req.body.ligue;
		var id_compte = req.body.id_compte;
		var id_carte = req.body.id_carte;
		var id_session = req.body.id_session;
		var item_1_id = req.body.item_1_id;
		var item_2_id = req.body.item_2_id;
		var item_3_id = req.body.item_3_id;
		var score = req.body.score;

		mysqlLib.getConnection(function(err,connection) {
			if (err) {
				res.status(500).send({code:500, error: "Error in connection database : "+err });
				return;
			}
			
			connection.query('INSERT INTO jcs_roster (id_compte, id_carte, id_session, item_1_id, item_2_id, item_3_id, score, saison, ligue) VALUES (?,?,?,?,?,?,?,?,?)', [id_compte,id_carte,id_session,item_1_id,item_2_id,item_3_id,score,saison,ligue], function(err, result) {
				connection.release();						
				if (!err) {
			
					res.json({'success':true});
				}      
				else {
					res.status(200).send({code:200, error: "erreur dans l'ajoute du roster"});
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

//Roster pour un joueur pour une session
router.post('/rosterjoueur', function(req, res, next){
	
	var response = [];
			
	if (typeof req.body.id_session !== 'undefined'){
		var id_session = req.body.id_session;
		var id_compte = req.body.id_compte;
		var saison = req.body.saison, ligue = req.body.ligue;

		mysqlLib.getConnection(function(err,connection) {
			if (err) {
				res.json({"code" : 100, "status" : "Error in connection database : "+err});
				return;
			}
			connection.query('SELECT * FROM jcs_roster where id_session = ? and id_compte = ? and ligue = ? and saison = ?',[id_session, id_compte, ligue, saison], function(err, result) {
				connection.release();
				if (!err) {				
					res.json(result);						
				}      
				else {
					res.status(200).send({code:200, error: "erreur dans l'accès aux rosters"});
				}
			});
		});
	
	}else {
		response.push({'result' : 'error', 'msg' : 'Please fill required details'});
		res.setHeader('Content-Type', 'application/json');
		res.status(200).send(JSON.stringify(response));
	}
});


//Roster pour un joueur pour toutes les session d'un saison 
router.post('/allrosterjoueur', function(req, res, next){
	
	var response = [];
			
	if (typeof req.body.id_compte !== 'undefined'){
		var id_compte = req.body.id_compte;
		var saison = req.body.saison, ligue = req.body.ligue;

		mysqlLib.getConnection(function(err,connection) {
			if (err) {
				res.json({"code" : 100, "status" : "Error in connection database : "+err});
				return;
			}
			connection.query('SELECT * FROM jcs_roster where id_compte = ? and ligue = ? and saison = ?',[id_compte, ligue, saison], function(err, result) {
				connection.release();
				if (!err) {				
					res.json(result);						
				}      
				else {
					res.status(200).send({code:200, error: "erreur dans l'accès aux rosters"});
				}
			});
		});
	
	}else {
		response.push({'result' : 'error', 'msg' : 'Please fill required details'});
		res.setHeader('Content-Type', 'application/json');
		res.status(200).send(JSON.stringify(response));
	}
});


//Supprimer une carte du roster
router.post('/deletecardroster', function(req, res, next){


	if (typeof req.body.id_roster !== 'undefined'){
	
		var id_roster = req.body.id_roster;

	mysqlLib.getConnection(function(err,connection) {
		if (err) {
			res.status(500).send({code:500, error: "Error in connection database : "+err });
			return;
		}
		
		connection.query('DELETE FROM jcs_roster WHERE id_roster = ?',[id_roster],function(err, result) {
			connection.release();
			if (!err) {				
				res.json({'success':true});						
			}      
			else {
				res.status(200).send({code:200, error: "erreur, la suppression de la carte du roster a échoué"});
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


/*
	SESSION
*/

//Ajouter une session
router.post('/addsession', function(req, res, next){
	
	if (typeof req.body.saison !== 'undefined' && typeof req.body.ligue !== 'undefined'){
		var saison = req.body.saison, ligue = req.body.ligue;
		var semaine = req.body.semaine;
		var date_session = req.body.date_session;
		var date_fin = req.body.date_fin;
	
		mysqlLib.getConnection(function(err,connection) {
			if (err) {
				res.status(500).send({code:500, error: "Error in connection database : "+err });
				return;
			}
			
			connection.query('INSERT INTO jcs_session (semaine, date_session, date_fin, ligue, saison) VALUES (?,?,?,?,?)', [semaine,date_session,date_fin,ligue,saison], function(err, result) {
				connection.release();						
				if (!err) {
			
					res.json({'success':true});
				}      
				else {
					res.status(200).send({code:200, error: "erreur dans l'ajout d'une session"});
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


/*
	SCORES
*/

//Ajoute un score 
router.post('/addscore', function(req, res, next){
	
	if (typeof req.body.id_compte !== 'undefined' && typeof req.body.id_session !== 'undefined'){
		
		var id_compte = req.body.id_compte;
		var id_session = req.body.id_session;
		var score_valeur = req.body.score_valeur;
	
		mysqlLib.getConnection(function(err,connection) {
			if (err) {
				res.status(500).send({code:500, error: "Error in connection database : "+err });
				return;
			}
			
			connection.query('INSERT INTO jcs_score (id_compte, id_session, score_valeur) VALUES (?,?,?)', [id_compte,id_session,score_valeur], function(err, result) {
				connection.release();						
				if (!err) {
			
					res.json({'success':true});
				}      
				else {
					res.status(200).send({code:200, error: "erreur dans l'ajout du score"});
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

//Update score
router.post('/updatescore', function(req, res, next){
	
	var response = [];
	
		var id = req.body.id;
		var score_valeur = req.body.score_valeur;
	
		mysqlLib.getConnection(function(err,connection) {
			if (err) {
				res.json({"code" : 100, "status" : "Error in connection database : "+err});
				return;
			}
				passe = SHA256(passe).toString();
				
				connection.query('update jcs_score set score_valeur = ? where id_score = ?', [score_valeur, id], function(err, result){
						if(!err){
							response.push({'passe' : 'success'});
						}			
				});			
			
			 res.setHeader('Content-Type', 'application/json');
             res.status(200).send(JSON.stringify(response));
		
		});
});

/*
	CARTES_PLAYER
*/


//Ajouter une carte dans le deck d'un joueur 
router.post('/addcardplayer', function(req, res, next){
	
	if (typeof req.body.id_compte !== 'undefined' && typeof req.body.id_carte !== 'undefined'){
		
		var id_compte = req.body.id_compte;
		var id_carte = req.body.id_carte;
		var ligue = req.body.ligue;
		var saison = req.body.saison;
		
		mysqlLib.getConnection(function(err,connection) {
			if (err) {
				res.status(500).send({code:500, error: "Error in connection database : "+err });
				return;
			}
			
			connection.query('INSERT INTO jcs_cartes_player (id_compte, id_carte, ligue, saison) VALUES (?,?,?,?)', [id_compte,id_carte,ligue,saison], function(err, result) {
				connection.release();						
				if (!err) {
			
					res.json({'success':true});
				}      
				else {
					res.status(200).send({code:200, error: "erreur dans l'ajoute d'une carte"});
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

//Deck pour un joueur pour saison/ligue pour un type
router.post('/deckjoueur', function(req, res, next){
	
	var response = [];
			
	if (typeof req.body.id_compte !== 'undefined'){
	
		var id_compte = req.body.id_compte;
		var ligue = req.body.ligue;
		var saison = req.body.saison;
		var type = req.body.type;

		if(type == 3 || type == 4)
		{
			var ligue = "all";
		}
		
		mysqlLib.getConnection(function(err,connection) {
			if (err) {
				res.json({"code" : 100, "status" : "Error in connection database : "+err});
				return;
			}
			connection.query('SELECT * FROM jcs_cartes_player p INNER JOIN jcs_carte c ON p.id_carte = c.id_carte where p.id_compte = ? and p.ligue = ? and p.saison = ? and c.nature_carte = ?',[id_compte, ligue, saison, type], function(err, result) {
				connection.release();
				if (!err) {				
					res.json(result);						
				}      
				else {
					res.status(200).send({code:200, error: "erreur dans l'accès au deck"});
				}
			});
		});
	
	}else {
		response.push({'result' : 'error', 'msg' : 'Please fill required details'});
		res.setHeader('Content-Type', 'application/json');
		res.status(200).send(JSON.stringify(response));
	}
});


 
module.exports = router;
