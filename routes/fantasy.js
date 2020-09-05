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
					
				if (result[0].saison != null) {			
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
						connection.query('SELECT * FROM jcs_roster r INNER JOIN jcs_carte c ON r.id_carte = j.id_carte WHERE r.session = ? and r.ligue = ? and r.saison = ? and j.nature_carte = 1', [id_session, ligue, saison], function(err, rosters){
							if(rosters.length > 0)
							{
								rosters.forEach(function (roster) {
									var score = (stat.kills*5 + stat.assists*2) - (stat.deaths*3);

									if(roster.item_1_id != 0){
										gestionItem(roster.item_1_id, score);
									}

									if(roster.item_2_id != 0){
										gestionItem(roster.item_2_id, score);
									}

									if(roster.item_3_id != 0){
										gestionItem(roster.item_3_id, score);
									}

									//updateroster pour le score
								});
							}
						});
					});
				});
			});

			//pour chaque match selectionner toutes les statsjpm, 
				//pour chaque stats jpm, selectionner les rosters ayant l'id joueur et l'id session
					//pour chaque roster calcule + item

			//pour chaque match recherchez les rosters ayant les id des teams gagnant et perdante 
				//maj le roster avec le score 
				//interrogez l'id match pour avoir les données supplémentaires

			//event 
		});

		
	});
});

function caculeScoreFin()
{
	//mets à jour le score général pour chaque roster et calcul le score généré pas les joueurs 
}

function gestionItem(data, score)
{	
	//gros switch pour mettre en marche les items
}

module.exports = router;
