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

			var listejoueur = [];
			var nbgames = [];
			var resArray = [];

			mysqlLib.getConnection(function(err,connection) {
				if (err) {
                    res.status(500).send({code:500, error: "Error in connection database : "+err });
                    return;
				}

				//var pre_query = new Date().getTime();

				connection.query('SELECT DISTINCT j.jou_name as pseudo, j.jou_kills as kills, j.jou_deaths as deaths, j.jou_assists as assists, j.jou_gold as gold, j.jou_damage as damage, j.jou_vision as vision,'
				+ 'j.jou_tempsdejeu as tempsdejeu FROM jcs_joueur j WHERE j.jou_saison = ?', [saison], function(err, data) {

					if(data.length > 0){
						listejoueur = data;
						callback();
					}
					else {
						res.status(200).send({code:200, error: "erreur"});
					}
				});

				connection.query('SELECT nom_joueur, count(nom_joueur) as nbgame FROM jcs_statsjpm WHERE saison = ? group by nom_joueur', [saison], 
				function(err, data){
					if(data.length > 0){
						nbgames = data;	
						callback();	
					}
					else {
						res.status(200).send({code:200, error: "erreur"});
					}
				});

				function callback(){

				if(listejoueur.length > 0 && nbgames.length > 0){

					listejoueur.forEach(function(item){

						var nbgame = 0;

						nbgames.forEach(function(nb){
							if(item.pseudo == nb.nom_joueur){
								nbgame = nb.nbgame;
							}			
						});

						var kda = item.kills + item.assists;
						if(item.deaths > 0){
							kda = kda/item.deaths;
						}
						kda = precisionRound(kda, 2);

						var dpm = item.damage/(item.tempsdejeu/60);
						dpm = precisionRound(dpm, 0);

						var gpm = item.gold/(item.tempsdejeu/60);
						gpm = precisionRound(gpm, 0);

						var vpm = item.vision/(item.tempsdejeu/60);
						vpm = precisionRound(vpm, 2);

						var dg = item.damage/item.gold;
						dg = precisionRound(dg, 2);

						resArray.push({
							pseudo: item.pseudo,
							kda: kda,
							dpm: dpm,
							gpm: gpm,
							vpm: vpm,
							dg: dg,
							nbgame: nbgame
						});

					});

					res.json(resArray);

					//var post_query = new Date().getTime();
					//var duration = (post_query - pre_query) / 1000;

					//console.log("Durée requête : "+duration);

					connection.release();
				}
				
				}
			
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


function precisionRound(number, precision) {
	var factor = Math.pow(10, precision);
	return Math.round(number * factor) / factor;
}	


module.exports = router;
