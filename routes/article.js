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

//récupérer les joueurs par saison
router.post('/ajoutarticle', function(req, res){
	
		if (typeof req.body.auteur !== 'undefined' && req.body.key == settings.codeAdmin){
			var titre = req.body.titre;
			var contenu = req.body.contenu;
			var auteur = req.body.auteur;
			var actif = req.body.actif;

			var date = new Date();
			//ajout UTC+2 heure ETE
			var date = date.addHours(2);
			var date = date.toISOString().slice(0, 19).replace('T', ' ');

			mysqlLib.getConnection(function(err,connection) {
				if (err) {
                    res.status(500).send({code:500, error: "Error in connection database : "+err });
                    return;
				}
				
				connection.query('INSERT INTO jcs_article (art_titre, art_contenu, art_auteur, art_date, art_actif) VALUES (?,?,?,?,?)', [titre,contenu,auteur,date,actif], function(err, result) {
					connection.release();						
					if (!err) {
				
						res.json({'success':true});
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


router.post('/getarticleactif', function(req, res, next){

			mysqlLib.getConnection(function(err,connection) {
				if (err) {
                    res.status(500).send({code:500, error: "Error in connection database : "+err });
                    return;
				}
				
				connection.query('SELECT * FROM jcs_article WHERE art_actif = 1 ORDER BY art_id DESC',function(err, result) {
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

router.post('/getallarticle', function(req, res, next){

	mysqlLib.getConnection(function(err,connection) {
		if (err) {
			res.status(500).send({code:500, error: "Error in connection database : "+err });
			return;
		}
		
		connection.query('SELECT * FROM jcs_article ORDER BY art_id DESC',function(err, result) {
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

router.post('/deletearticle', function(req, res, next){


	if (typeof req.body.id !== 'undefined' && req.body.key == settings.codeAdmin){
		var id = req.body.id;

	mysqlLib.getConnection(function(err,connection) {
		if (err) {
			res.status(500).send({code:500, error: "Error in connection database : "+err });
			return;
		}
		
		connection.query('DELETE FROM jcs_article WHERE art_id = ?',[id],function(err, result) {
			connection.release();
			if (!err) {				
				res.json({'success':true});						
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


router.post('/activerarticle', function(req, res, next){


	if (typeof req.body.id !== 'undefined' && req.body.key == settings.codeAdmin){
		var id = req.body.id;

	mysqlLib.getConnection(function(err,connection) {
		if (err) {
			res.status(500).send({code:500, error: "Error in connection database : "+err });
			return;
		}
		
		connection.query('UPDATE jcs_article SET art_actif = 1 WHERE art_id = ?',[id],function(err, result) {
			connection.release();
			if (!err) {				
				res.json({'success':true});						
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


router.post('/modifierarticle', function(req, res, next){


	if (typeof req.body.id !== 'undefined' && req.body.key == settings.codeAdmin){
		var id = req.body.id;
		var titre = req.body.titre;
		var contenu = req.body.contenu;
		var date = new Date();
		//ajout UTC+2 heure ETE
		var date = date.addHours(2);
		var date = date.toISOString().slice(0, 19).replace('T', ' ');

	mysqlLib.getConnection(function(err,connection) {
		if (err) {
			res.status(500).send({code:500, error: "Error in connection database : "+err });
			return;
		}
		
		connection.query('UPDATE jcs_article SET art_titre = ?, art_contenu = ?, art_date = ? WHERE art_id = ?',[titre,contenu,date,id],function(err, result) {
			connection.release();
			if (!err) {				
				res.json({'success':true});						
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


router.post('/deletecommentaire', function(req, res, next){


	if (typeof req.body.id !== 'undefined' && req.body.key == settings.codeAdmin){
		var id = req.body.id;

	mysqlLib.getConnection(function(err,connection) {
		if (err) {
			res.status(500).send({code:500, error: "Error in connection database : "+err });
			return;
		}
		
		connection.query('DELETE FROM jcs_commentaire WHERE id_com = ?',[id],function(err, result) {
			connection.release();
			if (!err) {				
				res.json({'success':true});						
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


router.post('/ajoutcommentaire', function(req, res){
	
	if (typeof req.body.auteur !== 'undefined'){
		var id_art = req.body.id;
		var contenu = req.body.contenu;
		var auteur = req.body.auteur;
	
		var date = new Date();
		//ajout UTC+2 heure ETE
		var date = date.addHours(2);
		var date = date.toISOString().slice(0, 19).replace('T', ' ');

		mysqlLib.getConnection(function(err,connection) {
			if (err) {
				res.status(500).send({code:500, error: "Error in connection database : "+err });
				return;
			}
			
			connection.query('INSERT INTO jcs_commentaire (id_art, nom_auteur, contenu_com, date_com) VALUES (?,?,?,?)', [id_art,auteur,contenu,date], function(err, result) {
				connection.release();						
				if (!err) {
			
					res.json({'success':true});
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


router.post('/getallcom', function(req, res, next){

	mysqlLib.getConnection(function(err,connection) {
		if (err) {
			res.status(500).send({code:500, error: "Error in connection database : "+err });
			return;
		}

		var id_art = req.body.id;
		
		connection.query('SELECT * FROM jcs_commentaire WHERE id_art = ? ORDER BY id_com DESC',[id_art],function(err, result) {
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


module.exports = router;
