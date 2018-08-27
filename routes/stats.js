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
router.post('/listejoueur', function(req, res){
	
		if (typeof req.body.saison !== 'undefined'){
			var saison = req.body.saison;

			mysqlLib.getConnection(function(err,connection) {
				if (err) {
                    res.status(500).send({code:500, error: "Error in connection database : "+err });
                    return;
				}
				
				connection.query('SELECT DISTINCT j.jou_name as pseudo, j.jou_kills as kills, j.jou_deaths as deaths, j.jou_assists as assists, j.jou_gold as gold, j.jou_damage as damage, j.jou_vision as vision,'
				+ 'j.jou_tempsdejeu as tempsdejeu,(SELECT count(nom_joueur) FROM jcs_statsjpm WHERE saison = ? and nom_joueur = j.jou_name group by nom_joueur) as nbgame '
				+ 'FROM jcs_joueur j INNER JOIN jcs_statsjpm jp ON j.jou_name = jp.nom_joueur where j.jou_saison = ?', [saison,saison], function(err, result) {
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
	
	if (typeof req.body.pseudo !== 'undefined' && typeof req.body.saison !== 'undefined'){
			var pseudo = req.body.pseudo;
			var saison = req.body.saison;

							
			mysqlLib.getConnection(function(err,connection) {
				if (err) {
                    res.status(500).send({code:500, error: "Error in connection database : "+err });
                    return;
				}
				
				connection.query('SELECT j.id_match, j.nom_joueur, j.champion, j.kills, j.deaths, j.assists, j.degats, j.golds, j.farm, j.visions, j.poste, m.mat_duree, m.ma_ligue' 
				+' FROM jcs_statsjpm j INNER JOIN jcs_match m ON j.id_match = m.mat_id WHERE j.nom_joueur = ? AND j.saison = ? ORDER BY id_match DESC',[pseudo, saison], function(err, result) {
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
