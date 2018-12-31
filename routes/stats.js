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


router.post('/listepresence', function(req, res, next){

	if (typeof req.body.saison !== 'undefined'){

		var saison = req.body.saison;

		mysqlLib.getConnection(function(err,connection) {
			if (err) {
				res.status(500).send({code:500, error: "Error in connection database : "+err });
				return;
			}

			var nbmatchL1 = 0;
			var nbmatchAcad = 0;
			var banjcs = [];
			var banacad = [];
			var pickjcs = [];
			var pickacad = [];
			var victjcs = [];
			var victacad = [];
			var championplay = [];

			function getData()
			{
				//nombre de game L1
				connection.query("SELECT COUNT(*) as nb FROM jcs_match WHERE ma_saison = ? AND ma_ligue = 'JCS'", [saison], function(err, data){
					if(data[0].nb > 0){
						nbmatchL1 = data[0].nb;
					}
				});

				//nombre de game Acad
				connection.query("SELECT COUNT(*) as nb FROM jcs_match WHERE ma_saison = ? AND ma_ligue = 'Acad'", [saison], function(err, data){
					if(data[0].nb > 0){
						nbmatchAcad = data[0].nb;
					}
				});

				//bans L1
				connection.query("select j.champion as cp, count(j.id_bann) as ct from jcs_banns j inner join jcs_match m ON j.id_match = m.mat_id WHERE ma_ligue = 'JCS' AND ma_saison = ? group by champion order by ct desc", [saison], function(err, data){
					if(data.length > 0){
						banjcs = data;
					}
				});

				//bans Acad
				connection.query("select j.champion as cp, count(j.id_bann) as ct from jcs_banns j inner join jcs_match m ON j.id_match = m.mat_id WHERE ma_ligue = 'Acad' AND ma_saison = ? group by champion order by ct desc", [saison], function(err, data){
					if(data.length > 0){
						banacad = data;
					}
				});

				//picks L1
				connection.query("select j.champion as cp, count(j.id_jpm) as ct from jcs_statsjpm j inner join jcs_match m ON j.id_match = m.mat_id WHERE ma_ligue = 'JCS' AND ma_saison = ? group by champion order by ct desc", [saison], function(err, data){
					if(data.length > 0){
						pickjcs = data;
					}
				});

				//picks acad
				connection.query("select j.champion as cp, count(j.id_jpm) as ct from jcs_statsjpm j inner join jcs_match m ON j.id_match = m.mat_id WHERE ma_ligue = 'Acad' AND ma_saison = ? group by champion order by ct desc", [saison], function(err, data){
					if(data.length > 0){
						pickacad = data;
					}
				});

				//vict L1
				connection.query("SELECT j.champion as cp, count(j.id_jpm) as nbvictoire FROM jcs_statsjpm j INNER JOIN jcs_match m ON j.id_match = m.mat_id" 
				+" INNER JOIN jcs_joueur jo ON m.mat_idgagnant = jo.jou_teamid WHERE jo.jou_name = j.nom_joueur AND m.ma_ligue = 'JCS' AND m.ma_saison = ?" 
				+" GROUP BY j.champion ORDER BY nbvictoire DESC", [saison], function(err, data){
					if(data.length > 0){
						victjcs = data;
					}
				});

				//vict Acad
				connection.query("SELECT j.champion as cp, count(j.id_jpm) as nbvictoire FROM jcs_statsjpm j INNER JOIN jcs_match m ON j.id_match = m.mat_id" 
				+" INNER JOIN jcs_joueur jo ON m.mat_idgagnant = jo.jou_teamid WHERE jo.jou_name = j.nom_joueur AND m.ma_ligue = 'Acad' AND m.ma_saison = ?" 
				+" GROUP BY j.champion ORDER BY nbvictoire DESC", [saison], function(err, data){
					if(data.length > 0){
						victacad = data;
					}
				});

				//champions presents 
				connection.query("SELECT champion FROM jcs_statsjpm WHERE saison = ? UNION SELECT champion FROM jcs_banns WHERE saison = ? ORDER BY `champion` ASC", [saison, saison], function(err, data){
					if(data.length > 0){
						championplay = data;
						callback();
					}
				});
			}

			var arrayjcs = [];
			var arrayacad = [];

			getData();

			function callback(){

				championplay.forEach(function(chp){
					var nbpick = 0;
					var nbban = 0;
					var victoire = 0;

					pickjcs.forEach(function(pick){
						if(chp.champion == pick.cp)
						{
							nbpick = pick.ct;
						}
					});

					banjcs.forEach(function(ban){
						if(chp.champion == ban.cp)
						{
							nbban = ban.ct;
						}
					});

					victjcs.forEach(function(vic){
						if(chp.champion == vic.cp)
						{
							victoire = vic.nbvictoire;
						}
					});

					if(nbpick != 0 || nbban != 0 || victoire != 0)
					{
						arrayjcs.push({
							champion: chp.champion,
							nbpick: nbpick,
							nbban: nbban,
							nbvic: victoire
						});
					}

					var nbpick = 0;
					var nbban = 0;
					var victoire = 0;

					pickacad.forEach(function(pick){
						if(chp.champion == pick.cp)
						{
							nbpick = pick.ct;
						}
					});

					banacad.forEach(function(ban){
						if(chp.champion == ban.cp)
						{
							nbban = ban.ct;
						}
					});

					victacad.forEach(function(vic){
						if(chp.champion == vic.cp)
						{
							victoire = vic.nbvictoire;
						}
					});

					if(nbpick != 0 || nbban != 0 || victoire != 0)
					{
						arrayacad.push({
							champion: chp.champion,
							nbpick: nbpick,
							nbban: nbban,
							nbvic: victoire
						});
					}

				});
			
				connection.release();

				var arraygen = [];

				arraygen.push({
					arrayjcs: arrayjcs,
					arrayacad: arrayacad
				});	

				res.json(arraygen);
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


function precisionRound(number, precision) {
	var factor = Math.pow(10, precision);
	return Math.round(number * factor) / factor;
}	


module.exports = router;
