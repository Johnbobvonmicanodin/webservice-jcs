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

//récupérer les joueurs par saison par kda
router.post('/listejoueur', function(req, res, next){
	
	var response = [];
	
		if (typeof req.body.id !== 'undefined'){
			var id = req.body.id;
			var saison = req.body.saison;
			
			mysqlLib.getConnection(function(err,connection) {
				if (err) {
                    res.status(500).send({code:500, error: "Error in connection database : "+err });
                    return;
				}
				
				connection.query('SELECT j.jou_name, j from jcs_joueur j inner join jcs_statsjpm jp where id_joueur = ?',[id, saison], function(err, result) {
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


router.post('/listematchjoueur', function(req, res, next){
	
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


module.exports = router;
