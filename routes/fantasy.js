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
const { reject } = require('async');
const { get } = require('./jcs');

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

//Recupere toutes les cartes pour une ligue/saison non normal + type
router.post('/allcardsrare', function(req, res, next){
	
	var response = [];
	
		if (typeof req.body.saison !== 'undefined' && typeof req.body.ligue !== 'undefined'){
			var saison = req.body.saison, ligue = req.body.ligue;
			var type = req.body.type;
									
			mysqlLib.getConnection(function(err,connection) {
				if (err) {
                    res.status(500).send({code:500, error: "connexion - Error in connection database : "+err });
                    return;
				}
				
				connection.query('SELECT * from jcs_carte where ligue = ? and saison = ? and nature_carte = ? rarete_carte > 1',[ligue, saison, type], function(err, result) {
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

//tirage joueur team 
router.post('/tiragejoueur', function(req, res, next){
	
	var response = [];
	
		if (typeof req.body.saison !== 'undefined' && typeof req.body.ligue !== 'undefined'){
			var saison = req.body.saison, ligue = req.body.ligue;
			var rarete = req.body.rarete;
									
			mysqlLib.getConnection(function(err,connection) {
				if (err) {
                    res.status(500).send({code:500, error: "connexion - Error in connection database : "+err });
                    return;
				}
				
				connection.query('SELECT * from jcs_carte where ligue = ? and saison = ? and rarete_carte = ? and (nature_carte = 1 OR nature_carte = 2)',[ligue, saison, rarete], function(err, result) {
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

//tirage item/event
router.post('/tirageitem', function(req, res, next){
	
	var response = [];
	
		if (typeof req.body.saison !== 'undefined' && typeof req.body.ligue !== 'undefined'){
			var saison = req.body.saison, ligue = req.body.ligue;
					
			mysqlLib.getConnection(function(err,connection) {
				if (err) {
                    res.status(500).send({code:500, error: "connexion - Error in connection database : "+err });
                    return;
				}
				
				connection.query('SELECT * from jcs_carte where ligue = ? and saison = ? and (nature_carte = 3 OR nature_carte = 4)',[ligue, saison], function(err, result) {
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
		var team = req.body.team;
		
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
					res.status(200).send({code:200, error: "erreur dans l'ajoute du roster : " + err});
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
			connection.query('SELECT * FROM jcs_roster r INNER JOIN jcs_carte c ON r.id_carte = c.id_carte where r.id_session = ? and r.id_compte = ? and r.ligue = ? and r.saison = ?',[id_session, id_compte, ligue, saison], function(err, result) {
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


//Supprimer toutes les cartes du roster
router.post('/deleteallcardroster', function(req, res, next){


	if (typeof req.body.id_compte !== 'undefined'){
	
		var id_compte = req.body.id_compte;
		var id_session = req.body.id_session;

	mysqlLib.getConnection(function(err,connection) {
		if (err) {
			res.status(500).send({code:500, error: "Error in connection database : "+err });
			return;
		}
		
		connection.query('DELETE FROM jcs_roster WHERE id_compte = ? AND id_session = ?',[id_compte, id_session],function(err, result) {
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

//Update roster
router.post('/updateroster', function(req, res, next){

	var response = [];
	
	var id_roster = req.body.id_roster;
	var item_1_id = req.body.item_1;
	var item_2_id = req.body.item_2;
	var item_3_id = req.body.item_3;

	mysqlLib.getConnection(function(err,connection) {
		if (err) {
			res.json({"code" : 100, "status" : "Error in connection database : "+err});
			return;
		}
	
			connection.query('update jcs_roster set item_1_id = ?, item_2_id = ?, item_3_id = ? where id_roster = ?', [item_1_id, item_2_id, item_3_id, id_roster], function(err, result){
					if(!err){
						response.push({'success' : true});
					}			
			});			
		
		 res.setHeader('Content-Type', 'application/json');
		 res.status(200).send(JSON.stringify(response));
	
	});
});


/*
	SESSION
*/

//Ajouter une session
router.post('/addsession', function(req, res, next){
	
	if (typeof req.body.saison !== 'undefined' && typeof req.body.ligue !== 'undefined'){
		var saison = req.body.saison, ligue = req.body.ligue;
		var semaine = req.body.semaine;

		var date = new Date();
		var date = date.addHours(2);
		var date = date.toISOString().slice(0, 19).replace('T', ' ');

		var date_fin = req.body.date_fin;
	
		mysqlLib.getConnection(function(err,connection) {
			if (err) {
				res.status(500).send({code:500, error: "Error in connection database : "+err });
				return;
			}
			
			connection.query('INSERT INTO jcs_session (semaine, date_session, date_fin, ligue, saison) VALUES (?,?,?,?,?)', [semaine,date,date_fin,ligue,saison], function(err, result) {
				connection.release();						
				if (!err) {
			
					res.json({'success':true});
				}      
				else {
					res.status(200).send({code:200, error: "erreur dans l'ajout d'une session : "+err});
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


//Recuperer une session
router.post('/getsession', function(req, res, next){
	
	if (typeof req.body.saison !== 'undefined' && typeof req.body.ligue !== 'undefined'){

		mysqlLib.getConnection(function(err,connection) {
			if (err) {
				res.status(500).send({code:500, error: "Error in connection database : "+err });
				return;
			}

			var saison = req.body.saison;
			var ligue = req.body.ligue;

			var date = new Date();
			//ajout UTC+2 heure ETE
			var date = date.addHours(2);
			var date = date.toISOString().slice(0, 19).replace('T', ' ');

		
			connection.query('SELECT * FROM jcs_session WHERE ligue = ? AND saison = ? AND date_fin >= NOW() ORDER BY id_session DESC LIMIT 1', [ligue,saison], function(err, result) {
				connection.release();
					
				if (result.length > 0) {			
					res.json(result[0]);			
				}      
				else {
					res.status(200).send({code:200, error: "pas de session en cours"});
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
		
				connection.query('update jcs_score set score_valeur = ? where id_score = ?', [score_valeur, id], function(err, result){
						if(!err){
							response.push({'success' : true});
						}			
				});			
			
			 res.setHeader('Content-Type', 'application/json');
             res.status(200).send(JSON.stringify(response));
		
		});
});

router.post('/getscore', function(req, res, next){
	
	var response = [];
	
		var id_compte = req.body.id_compte;
		var id_session = req.body.id_session;
	
		mysqlLib.getConnection(function(err,connection) {
			if (err) {
				res.json({"code" : 100, "status" : "Error in connection database : "+err});
				return;
			}
	
				connection.query('select * from jcs_score where id_compte = ? and id_session = ?', [id_compte, id_session], function(err, result){
						if(!err){

							if(result[0] === undefined)	
							{
								res.json({'success':false});
							}
							else
							{
								res.json({'success':true});
							}				
						}	
						else
						{
							console.log(err);
							res.setHeader('Content-Type', 'application/json');
							res.status(200).send(JSON.stringify(response));
						}		
				});			
		});
});

router.post('/getallscore', function(req, res, next){
	
	var response = [];
	
		var id_compte = req.body.id_compte;
		
		mysqlLib.getConnection(function(err,connection) {
			if (err) {
				res.json({"code" : 100, "status" : "Error in connection database : "+err});
				return;
			}
			
				connection.query('select * from jcs_score where id_compte = ?', [id_compte], function(err, result){
						if(!err){
							response.push(result);
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

//Check si une carte existe
router.post('/deckcarteunique', function(req, res, next){
	
	var response = [];
			
	if (typeof req.body.id_compte !== 'undefined'){
	
		var id_compte = req.body.id_compte;
		var ligue = req.body.ligue;
		var saison = req.body.saison;
		var id_carte = req.body.id_carte;
	
		mysqlLib.getConnection(function(err,connection) {
			if (err) {
				res.json({"code" : 100, "status" : "Error in connection database : "+err});
				return;
			}
			connection.query('SELECT * FROM jcs_cartes_player WHERE id_compte = ? AND id_carte = ? AND ligue = ? AND saison = ?',[id_compte, id_carte, ligue, saison], function(err, result) {
				connection.release();
				if (result.length > 0) {			
					res.json({'trouve':true});				
				}      
				else {
					res.json({'trouve':false});
				}
			});
		});
	
	}else {
		response.push({'result' : 'error', 'msg' : 'Please fill required details'});
		res.setHeader('Content-Type', 'application/json');
		res.status(200).send(JSON.stringify(response));
	}
});


//Recuperer la liste des cartes qu'un joueur n'a pas
router.post('/listenonpossession', function(req, res, next){
	var response = [];
			
	if (typeof req.body.id_compte !== 'undefined'){
	
		var id_compte = req.body.id_compte;
		var ligue = req.body.ligue;
		var saison = req.body.saison;
		
		
		mysqlLib.getConnection(function(err,connection) {
			if (err) {
				res.json({"code" : 100, "status" : "Error in connection database : "+err});
				return;
			}
			connection.query('SELECT * FROM jcs_carte WHERE saison = ?, ligue = ? AND rarete_carte > 1'
			+' MINUS SELECT * FROM jcs_cartes_player p INNER JOIN jcs_carte c ON p.id_carte = c.id_carte where p.id_compte = ? and p.ligue = ? and p.saison = ?',[id_compte, ligue, saison, type], function(err, result) {
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


//Update argent
router.post('/minusmoney', function(req, res, next){
	
	var response = [];
	
		var id = req.body.id;
		var argent = req.body.argent;
	
		mysqlLib.getConnection(function(err,connection) {
			if (err) {
				res.json({"code" : 100, "status" : "Error in connection database : "+err});
				return;
			}
			
				connection.query('UPDATE jcs_statsparij SET argent_actuel = argent_actuel - ? WHERE id_joueur = ?', [argent, id], function(err, result){
						if(!err){
							response.push({'update' : 'success'});
						}			
				});			
			
			 res.setHeader('Content-Type', 'application/json');
             res.status(200).send(JSON.stringify(response));
		
		});
});

router.post('/plusmoney', function(req, res, next){
	
	var response = [];
	
		var id = req.body.id;
		var argent = req.body.argent;
	
		mysqlLib.getConnection(function(err,connection) {
			if (err) {
				res.json({"code" : 100, "status" : "Error in connection database : "+err});
				return;
			}
			
				connection.query('UPDATE jcs_statsparij SET argent_actuel = argent_actuel + ? WHERE id_joueur = ?', [argent, id], function(err, result){
						if(!err){
							response.push({'update' : 'success'});
						}			
				});			
			
			 res.setHeader('Content-Type', 'application/json');
             res.status(200).send(JSON.stringify(response));
		
		});
});


/**
 * CALCUL DU SCORE D'UNE SESSION
 */

 //essaie v2
router.post('/test', function(req, res, next)
{
	var id_session = req.body.session; 
	var ligue = req.body.ligue;
	var saison = req.body.saison; 	
	var semaine = req.body.semaine;

	var connection = mysqlLib.getConnection();
 
	calculScoreSession(connection, id_session, ligue, saison, semaine);

});

function calculScoreSession(connection, id_session, ligue, saison, semaine)
{

}

router.post('/calculscoresession', function(req, res, next)
{
	var id_session = req.body.session; 
	var ligue = req.body.ligue;
	var saison = req.body.saison; 	
	var semaine = req.body.semaine;

	mysqlLib.getConnection(function(err,connection) {
		if (err) {
			res.json({"code" : 100, "status" : "Error in connection database : "+err});
			return;
		}
	
		connection.query('SELECT * FROM jcs_match WHERE ma_ligue = ? AND ma_saison = ? AND ma_semaine = ?', [ligue, saison, semaine], function(err, matchs){
			
			matchs.forEach(function (match) {
				connection.query('SELECT * FROM jcs_statsjpm WHERE id_match = ?', [match.mat_id], function(err, jpms)
				{
					jpms.forEach(function (stat) {
						connection.query('SELECT * FROM jcs_roster r INNER JOIN jcs_carte c ON r.id_carte = c.id_carte WHERE r.id_session = ? and r.ligue = ? and r.saison = ? and c.nom_carte = ? and c.nature_carte = 1', [id_session, ligue, saison, stat.nom_joueur], function(err, rosters){
							if(rosters.length > 0)
							{
								rosters.forEach(function (roster) {
									var score = (stat.kills*5 + stat.assists*2) - (stat.deaths*3);

									console.log(stat.nom_joueur);
									console.log(roster);
									console.log(score);

									if(roster.item_1_id != 0){
										score = score + gestionItem(match, jpms, roster, stat, roster.item_1_id, score);
									}

									if(roster.item_2_id != 0){
										score = score + gestionItem(match, jpms, roster, stat, roster.item_2_id, score);
									}

									if(roster.item_3_id != 0){
										score = score + gestionItem(match, jpms, roster, stat, roster.item_3_id, score);
									}

									connection.query('UPDATE jcs_roster SET score = score + ? WHERE id_roster = ?', [score, roster.id_roster], function(err, result){
										//hue hue 
										console.log("update score");	
									});			
								});
							}

							var scoreCarte = (stat.kills*5 + stat.assists*2) - (stat.deaths*3);

							//mise à jour du score de la carte
							connection.query('UPDATE jcs_carte SET score = score + ? WHERE nom_carte = ?', [scoreCarte, stat.nom_joueur], function(err, result)
							{
								console.log("update score carte");
							});
						});
					});
				});

				connection.query('SELECT * FROM jcs_roster r INNER JOIN jcs_carte c ON r.id_carte = c.id_carte WHERE r.id_session = ? and r.ligue = ? and r.saison = ? and c.team = ? and c.nature_carte = 2', [id_session, ligue, saison, match.mat_idgagnant], function(err, teamw)
				{
					console.log("teamW");

					if(teamw.length > 0)
					{
						teamw.forEach(function (roster) {
							var score = 5 + roster.rarete_carte;

							connection.query('UPDATE jcs_roster SET score = score + ? WHERE id_roster = ?', [score, roster.id_roster], function(err, result){
								
								console.log("update score team W");
							});		
						});
					}
				});

				connection.query('SELECT * FROM jcs_roster r INNER JOIN jcs_carte c ON r.id_carte = c.id_carte WHERE r.id_session = ? and r.ligue = ? and r.saison = ? and c.team = ? and c.nature_carte = 2', [id_session, ligue, saison, match.mat_idperdant], function(err, teaml)
				{
					console.log("teamL");
				
					if(teaml.length > 0)
					{
						teaml.forEach(function (roster) {

							var score = -5 + + roster.rarete_carte;

							connection.query('UPDATE jcs_roster SET score = score + ? WHERE id_roster = ?', [score, roster.id_roster], function(err, result){
									
								console.log("update score team L");						
							});		
						});
					}
				});
			});
		});	

		sleep(5000).then(() => {
			res.json({'fin1':'fin1'});
			connection.release();
		});
	});
});

router.post('/calculscoreevent', function(req, res, next)
{
	console.log("calculscoreevent");
	console.log(req.body.session);

	var id_session = req.body.session; 

	mysqlLib.getConnection(function(err,connection) {
		if (err) {
			res.json({"code" : 100, "status" : "Error in connection database : "+err});
			return;
		}

		

		connection.query('SELECT * FROM jcs_score WHERE id_session = ?', [id_session], function(err, scores){
			scores.forEach(function(score){
				connection.query('SELECT * FROM jcs_roster r INNER JOIN jcs_carte c ON r.id_carte = c.id_carte WHERE r.id_session = ? AND r.id_compte = ? and c.nature_carte = 4', [id_session, score.id_compte], function(err, rosters){
					if(rosters.length > 0)
					{
						gestionEvent(rosters, rosters[0].id_carte, score);

						console.log("gestion event");
					}
				});
			});
		});

		//à l'aide
		sleep(5000).then(() => {
			res.json({'fin2':'fin2'});
			connection.release();
		});
	});
});

router.post('/calculscorefin', function(req, res, next)
{
	var id_session = req.body.session; 

	console.log("calculscorefin");

	mysqlLib.getConnection(function(err,connection) {
		if (err) {
			res.json({"code" : 100, "status" : "Error in connection database : "+err});
			return;
		}

		connection.query('SELECT * FROM jcs_score WHERE id_session = ?', [id_session], function(err, scores){
			scores.forEach(function(score){
				connection.query('SELECT * FROM jcs_roster WHERE id_session = ? AND id_compte = ?', [id_session, score.id_compte], function(err, rosters){
					var scoretot =  0;

					rosters.forEach(function (roster) {
						scoretot = scoretot + roster.score;
					});

					console.log("fin roster");
					console.log(scoretot);
	
					connection.query('UPDATE jcs_score SET score_valeur = ? WHERE id_score = ?', [scoretot, score.id_score], function(err, res)
					{
						console.log("update score total");
						console.log(scoretot);
					});

					connection.query('UPDATE jcs_statsparij SET argent_actuel = argent_actuel + 75 WHERE id_joueur = ?', [score.id_compte], function(err, result){
						
						console.log("update argent");
					});	
				});
			});

			connection.query("UPDATE jcs_session SET session_etat = 'Fini' WHERE id_session = ?", [id_session], function(err, res)
			{
				console.log("update session");	
			});
		});	
		
		//à l'aide
		sleep(5000).then(() => {
			res.json({'fin3':'fin3'});
			connection.release();
		});
	});
});


function gestionItem(match, jpms, roster, stat, id, score)
{	
	var minutes = Math.trunc(match.mat_duree/60);
	var team = roster.team;

	//gros switch pour mettre en marche les items
	switch(id) {
		case 809 :
			score = score + (stat.kills*2)
			break;
		case 810 :
			if(stat.visions > 60)
			{
				score = score + 19;
			}
			break;
		case 811 :
			score = score + (Math.trunc(stat.visions / 4));
			break;
		case 812 :
			score = score + (Math.trunc(stat.assists / 2)*3);
			break;
		case 813 : 
			if(stat.farm > 300)
			{
				score = score + 20;
			}
			break;
		case 814 :
			score = score + (Math.trunc(stat.farm / 22));	
			break;
		case 815 :
			if(roster.poste == "JUNG")
			{
				score = score + (Math.trunc(stat.farm / 7));	
			}
			break;
		case 816 : 
			if(stat.degats > 15500)
			{
				score = score + 11;
			}
			break;
		case 817 :
			var maxtrouve = false;	
			jpms.forEach(function (item)
			{
				if(item.visions > stat.visions)
				{
					maxtrouve = true;
				}
			});

			if(!maxtrouve)
			{
				score = score + 20;
			}
			break;
		case 818 :
			if((stat.farm/minutes) > 8)
			{
				score = score + 18;
			}
			break;
		case 819 :
			if(stat.deaths < 3)
			{
				score = score + 16;
			}
			break;
		case 820 :
			if(stat.golds > 13500)
			{
				score = score + 17;
			}
			break;
		case 821 :
			if((stat.golds/minutes) > 390)
			{
				score = score + 17;
			}
			break;
		case 822 : 
			if(stat.assists >= 8)
			{
				score = score + 7;
			}
			break;
		case 823 :
			var maxtrouve = false;	
			jpms.forEach(function (item)
			{
				if(item.farm > stat.farm)
				{
					maxtrouve = true;
				}
			});

			if(!maxtrouve)
			{
				score = score + 19;
			}
			break;
		case 824 :
			var goldt = 0;
			var golda = 0; 
			
			if(team == match.mat_idgagnant)
			{
				goldt = match.gold_gagnant;
				golda = match.gold_perdant;
			}
			else
			{
				golda = match.gold_gagnant;
				goldt = match.gold_perdant;
			}

			if((goldt - golda) > 8000)
			{
				score = score + 23;
			}
			break;
		case 825 :
			var maxtrouve = false;	
			jpms.forEach(function (item)
			{
				if((item.farm/minutes) > (stat.farm/minutes))
				{
					maxtrouve = true;
				}
			});

			if(!maxtrouve)
			{
				score = score + 19;
			}
			break;
		case 826 :
			if(stat.kills > 4)
			{
				score = score + 8;
			}
			break;
		case 827 :
			if(stat.farm > 200)
			{
				score = score + 12;
			}
			break;
		case 828 :
			var maxtrouve = false;	
			jpms.forEach(function (item)
			{
				if(item.degats > stat.degats)
				{
					maxtrouve = true;
				}
			});

			if(!maxtrouve)
			{
				score = score + 20;
			}
			break;
		case 829 :
			var maxtrouve = false;	
			jpms.forEach(function (item)
			{
				if(item.kills > stat.kills)
				{
					maxtrouve = true;
				}
			});

			if(!maxtrouve)
			{
				score = score + 14;
			}
			break;
		case 830 : 
			var maxtrouve = false;	
			jpms.forEach(function (item)
			{
				if(item.assists > stat.assists)
				{
					maxtrouve = true;
				}
			});

			if(!maxtrouve)
			{
				score = score + 7;
			}
			break;
		case 831 :
			var kda = 0;
		
			if(stat.deaths > 0)
			{
				kda = (stat.kills + stat.assists) / stat.deaths;
			}
			else
			{
				kda = stat.kills + stat.assists;
			}

			if(kda >= 8)
			{
				score = score + 11;
			}
			break;
		case 832 : 
			var mintrouve = false;	
			jpms.forEach(function (item)
			{
				if(item.deaths < stat.deaths)
				{
					mintrouve = true;
				}
			});

			if(!mintrouve)
			{
				score = score + 14;
			}
			break;
		case 833 :
			if(stat.visions > 50)
			{
				score = score + 6;
			}
			break;
		case 834 :
			var kda = 0;
			if(stat.deaths > 0)
			{
				kda = (stat.kills + stat.assists) / stat.deaths;
			}
			else
			{
				kda = stat.kills + stat.assists;
			}

			var maxtrouve = false;	
			jpms.forEach(function (item)
			{
				var kdaitem = 0;
				if(item.deaths > 0)
				{
					kdaitem = (item.kills + item.assists) / item.deaths;
				}
				else
				{
					kdaitem = item.kills + item.assists;
				}

				if(kdaitem > kda)
				{
					maxtrouve = true;
				}
			});

			if(!maxtrouve)
			{
				score = score + 8;
			}
			break;
		case 835 :
			var killt = 0;
			var killa = 0; 
			
			if(team == match.mat_idgagnant)
			{
				killt = match.kills_gagnant;
				killa = match.kills_perdant;
			}
			else
			{
				killa = match.kills_gagnant;
				killt = match.kills_perdant;
			}

			if((killt - killa) > 13)
			{
				score = score + 30;
			}
			break;
		case 836 :
			if(team = match.mat_idgagnant)
			{
				if(minutes < 30)
				{
					score = score + 15;
				}
				
			}
			break;
		case 837 :
			if(stat.deaths == 0)
			{
				score = score + 12;
			}
		case 838 :
			var maxtrouve = false;	
			jpms.forEach(function (item)
			{
				if(item.golds > stat.golds)
				{
					maxtrouve = true;
				}
			});

			if(!maxtrouve)
			{
				score = score + 11;
			}
			break;
		default : 
			console.log("ce n'est pas sensé arriver");

	}


	return score;
}

function gestionEvent(rosters, id, score)
{	
	//doit maj le score des cartes directement???
	mysqlLib.getConnection(function(err,connection) {
		if (err) {
			res.json({"code" : 100, "status" : "Error in connection database : "+err});
			return;
		}
	

	switch(id) {
		case 839 :
			rosters.forEach(function (item)
			{
				if(item.poste == "TOP")
				{
					score = item.score * 1.5;

					connection.query('UPDATE jcs_roster SET score = ? WHERE id_roster = ?', [score, item.id_roster], function(err, result){
						connection.close();			
					});		
				}
			});
			break;
		case 840 :
			rosters.forEach(function (item)
			{
				if(item.poste == "JUNG")
				{
					score = item.score * 1.5;

					connection.query('UPDATE jcs_roster SET score = ? WHERE id_roster = ?', [score, item.id_roster], function(err, result){
						connection.close();			
					});	
				}
			});
			break;
		case 841 :
			rosters.forEach(function (item)
			{
				if(item.poste == "SUPP")
				{
					score = item.score * 1.5;

					connection.query('UPDATE jcs_roster SET score = ? WHERE id_roster = ?', [score, item.id_roster], function(err, result){
						connection.close();			
					});	
				}
			});
			break;
		case 842 :
			rosters.forEach(function (item)
			{
				if(item.poste == "MID")
				{
					score = item.score * 2;

					connection.query('UPDATE jcs_roster SET score = ? WHERE id_roster = ?', [score, item.id_roster], function(err, result){
						connection.close();			
					});	
				}
			});
			break;
		case 843 :
			rosters.forEach(function (item)
			{
				if(item.score < 0)
				{
					connection.query('UPDATE jcs_roster SET score = 0 WHERE id_roster = ?', [item.id_roster], function(err, result){
						connection.close();			
					});	
				}
			});
			break;
		case 844 :
			rosters.forEach(function (item)
			{
				score = item.score * 1.25;

				connection.query('UPDATE jcs_roster SET score = ? WHERE id_roster = ?', [score, item.id_roster], function(err, result){
					//hue hue 		
				});			
			});
			break;
		case 845 :
			rosters.forEach(function (item)
			{
				score = item.score * 1.07;

				connection.query('UPDATE jcs_roster SET score = ? WHERE id_roster = ?', [score, item.id_roster], function(err, result){
					//hue hue 		
				});			
			});
			break;
		case 846 :
			rosters.forEach(function (item)
			{
				if(item.poste == "ADC")
				{
					score = item.score * 1.5;

					connection.query('UPDATE jcs_roster SET score = score + ? WHERE id_roster = ?', [score, item.id_roster], function(err, result){
						connection.close();			
					});	
				}
			});
			break;
		case 847 :
			rosters.forEach(function (item)
			{
				connection.query('UPDATE jcs_roster SET score = score + 3 WHERE id_roster = ?', [item.id_roster], function(err, result){
					//hue  hue 		
				});	
			});
			break;
		default : 
			console.log("ce n'est pas sensé arriver");
		
		}

	});
	return score;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = router;
