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
				
				connection.query('SELECT * FROM jcs_parijoueur p INNER JOIN jcs_pari pa ON pa.par_id = p.id_pari_origine WHERE p.id_joueur = ? ORDER BY p.id_parij DESC',[id], function(err, result) {
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
				
				connection.query("SELECT * FROM jcs_pari WHERE par_date_fin >= NOW() AND par_solution LIKE 'En attente' ORDER BY par_id DESC", function(err, result) {
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


router.post('/parisnonresolu', function(req, res, next){

			mysqlLib.getConnection(function(err,connection) {
				if (err) {
                    res.status(500).send({code:500, error: "Error in connection database : "+err });
                    return;
				}
				
				connection.query("SELECT * FROM jcs_pari WHERE par_solution LIKE 'En attente' ORDER BY par_id ASC", function(err, result) {
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


router.post('/ajoutpari', function(req, res, next){

			var question = req.body.question;
			var cote1 = req.body.cote1;
			var cote2 = req.body.cote2;
			var choix1 = req.body.issue1;
			var choix2 = req.body.issue2;
			var datelimite = req.body.date; 

			mysqlLib.getConnection(function(err,connection) {
				if (err) {
                    res.status(500).send({code:500, error: "Error in connection database : "+err });
                    return;
				}
				
				connection.query("INSERT INTO jcs_pari (par_idmatch, par_question, par_issue_1, par_issue_2, par_cote_1, par_cote_2"
				+", par_cote_evo_1, par_cote_evo_2, par_date, par_date_fin) VALUES (0,?,?,?,?,?,?,?,NOW(),?)",
				[question,choix1,choix2,cote1,cote2,cote1,cote2,datelimite], function(err, result) {
					connection.release();
					if (!err) {				
						res.json({"succes":true});						
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


router.post('/resoudrepari', function(req, res, next){

	var id = req.body.id;
	var solution = req.body.solution;

	mysqlLib.getConnection(function(err,connection) {
		if (err) {
			res.status(500).send({code:500, error: "Error in connection database : "+err });
			return;
		}

		connection.query("UPDATE jcs_pari SET par_solution = ? WHERE par_id = ?",[solution, id],function(err, result) {
			//connection.release();
			if (!err) {				
				connection.query("UPDATE jcs_parijoueur SET resolu = 1 WHERE id_pari_origine = ?",[id],function(err, result) {
					if(!err){
						connection.query("SELECT * FROM jcs_parijoueur WHERE id_pari_origine = ?",[id], function(err, data){
							
							var iterateur = 0;

							if(data.length == 0){							
								connection.release();
								res.json({"sucess":true});
							}
												
							for(iterateur; iterateur < data.length; iterateur++){								
								if(data[iterateur].issue_choisi == solution){								
									var recette = data[iterateur].cote_pari * data[iterateur].mise_pari;
									recette =  parseFloat(recette.toFixed(2));

									connection.query("UPDATE jcs_statsparij SET argent_actuel = argent_actuel + ?, nb_win = nb_win + 1 WHERE id_joueur = ?",
									[recette, data[iterateur].id_joueur],function(err, result){
										//go					
									});
								}
								else
								{
									connection.query("UPDATE jcs_statsparij SET nb_lose = nb_lose + 1 WHERE id_joueur = ?",
									[data[iterateur].id_joueur],function(err, result){
										//go					
									});
								}
							}

							if(iterateur >= data.length){
								connection.release();
								res.json({"sucess":true});
							}			
						
						});
					}
				});				
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


router.post('/supprimerpari', function(req, res, next){
	
	var id = req.body.id;
	
	mysqlLib.getConnection(function(err,connection) {
		if (err) {
			res.status(500).send({code:500, error: "Error in connection database : "+err });
			return;
		}
		connection.query("SELECT * FROM jcs_parijoueur WHERE id_pari_origine = ?",[id],function(err, data){	
			if(data.length > 0){
				
				var iterateur = 0;
				
				data.forEach(function(item){		
					connection.query("UPDATE jcs_statsparij SET argent_actuel = argent_actuel + ? WHERE id_joueur = ?",[item.mise_pari,item.id_joueur],function(err, result){					
						iterateur++;		
						if(iterateur == data.length)
						{			
						connection.query("DELETE FROM jcs_pari WHERE par_id = ?",[id],function(err,result){				
							connection.query("DELETE FROM jcs_parijoueur WHERE id_pari_origine = ?",[id],function(err,result){
								connection.release();
								res.json({"success":true});
							});
						});
						}		
					});			
				});
						
			}
			else
			{
				connection.query("DELETE FROM jcs_pari WHERE par_id = ?",[id],function(err,result){
					connection.release();
					res.json({"success":true});
				});
			}
		});
	});
	
});


Date.prototype.addHours= function(h){
    this.setHours(this.getHours()+h);
    return this;
}

module.exports = router;
