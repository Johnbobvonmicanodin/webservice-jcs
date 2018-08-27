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

//var api_key = 'RGAPI-d406a073-e3ad-45e7-a6ba-21ec2e621c90';
	
router.get('/champions', function(req, res, next){
	
	var URL = 'https://euw1.api.riotgames.com/lol/static-data/v3/champions?locale=en_US&champListData=info&dataById=false&api_key='+ api_key;
	
	request.get(URL, (error, response, body) => {
		if(!error){
			let json = JSON.parse(body);
			
			res.json(json);
		}
		else{
			res.json({'success':'non'});
		}
		
	});
	
});

router.post('/gamedata', function(req, res){
	
	var response = [];
	
	if(typeof req.body.id !== 'undefined'){
		var id = req.body.id;
		var teamw = req.body.teamw;
		var teaml = req.body.teaml;
		var ligue = req.body.ligue;
		
		var jsonArray = [];
		var winteam = [];
		var loseteam = [];	
		var winbans = [];
		var losebans = [];
		var stringData = [];
		
		//var URL = 'https://euw1.api.riotgames.com/lol/match/v3/matches/'+id+'?api_key=' + api_key;
		
		mysqlLib.getConnection(function(err, connection){
			if (err) {
				res.json({"code" : 100, "status" : "Error in connection database : "+err});
				return;
			}
		
		
		connection.query("select param_valeur from jcs_parametre where param_libelle = 'cle api riot'", function(err, param){
		
		if(!err){
			var api_key = param[0].param_valeur;
			
			var URL = 'https://euw1.api.riotgames.com/lol/match/v3/matches/'+id+'?api_key=' + api_key;
		
		connection.query('select jou_id, jou_name from jcs_joueur where jou_teamid = ?',[teamw],  function(err, rows){
			rows.forEach(joueur => {
				winteam.push({jou_id: joueur.jou_id, jou_name: joueur.jou_name});
			});
				connection.query('select jou_id, jou_name from jcs_joueur where jou_teamid = ?',[teaml],  function(err, data){
					connection.release();
					data.forEach(joueur => {
						loseteam.push({jou_id: joueur.jou_id, jou_name: joueur.jou_name});
						
					});
					request.get(URL, (error, response, body) => {
							if(!error){
								let json = JSON.parse(body);
								var idplayer = [];
								var playername = [];
								
								var duree = json.gameDuration;
								for(var i = 0; i < json.participantIdentities.length; i++)
								{
									var participant = json.participantIdentities[i];
									//pas de pseudo en custom 
									//playername.push(participant.player.summonerName);
									idplayer.push(participant.participantId);
									
								}
									
									json.participants.forEach(stats => {
			
									for(var i = 0; i<10;i++){
										if(idplayer[i] == stats.participantId){
											//console.log(stats);
											
											var champion = stats.championId;
											//console.log(stats.championId);
											
											var kda = 0;
											if(stats.stats.deaths > 0){
												kda = precisionRound((stats.stats.kills+stats.stats.assists)/stats.stats.deaths,2);
											}
											else{
												kda = precisionRound(stats.stats.kills+stats.stats.assists,2);
											}
											var gpm, dpm, vpm, dsg;
											
											gpm = Math.round(stats.stats.goldEarned/(duree/60));
											dpm = Math.round(stats.stats.totalDamageDealtToChampions/(duree/60));
											vpm = precisionRound(stats.stats.visionScore/(duree/60),2);
											dsg = precisionRound(stats.stats.totalDamageDealtToChampions/stats.stats.goldEarned,2);
											
											//var player = playername[i];
											var player = idplayer[i];
											
											stringData.push({
														player:' ',
														win:stats.stats.win,
														kills:stats.stats.kills,
														deaths:stats.stats.deaths,
														assists:stats.stats.assists,
														visions:stats.stats.visionScore,
														duree:duree,
														champion:champion,
														role:stats.timeline.lane+' '+stats.timeline.role,
														kda:kda,
														gpm:gpm,
														dpm:dpm,
														vpm:vpm,
														dsg:dsg,
														farm:stats.stats.totalMinionsKilled+stats.stats.neutralMinionsKilled,
														gold:stats.stats.goldEarned,
														damage:stats.stats.totalDamageDealtToChampions,
														
													});
																			
										}
									}
									
								});	
								
								json.teams.forEach(data => {
									if(data.win == 'Win'){
										data.bans.forEach(champion => {
											winbans.push(champion.championId);
										});
									}
									else{
										data.bans.forEach(champion => {
											losebans.push(champion.championId);
										});
									}
								});
								
								}
								
								//console.log(winbans);
								//console.log(losebans);
								
								jsonArray.push(winteam);
								jsonArray.push(loseteam);
								jsonArray.push(stringData);
								jsonArray.push(winbans);
								jsonArray.push(losebans);
								res.json(jsonArray);
							
							
					});
				});
				
		});
		
		}
		else
		{
			res.json({"sucess":"non"});
		}
		
		});
		
		});
		
	}else{
		response.push({'result' : 'error', 'msg' : 'Please fill required details'});
		res.setHeader('Content-Type', 'application/json');
    	res.status(200).send(JSON.stringify(response));
	}	

});

router.post('/putgamedata', function(req, res){
	
	var response = [];
	
	if(typeof req.body.gamewin !== 'undefined' || req.body.gamelose !== 'undefined'){
		
		var gamewin = req.body.gamewin; var gamelose = req.body.gamelose; var duree = req.body.duree; var idteamw = req.body.idteamw; var idteaml = req.body.idteaml;
		var ligue = req.body.ligue; var saison = req.body.saison; var idgame = req.body.idgame; var banswin = req.body.banswin; var banslose = req.body.banslose; var semaine = req.body.semaine;
		var idgame = parseInt(idgame);
		var lien = req.body.lien;
		var idmatchbase = 0;
		var goldW = 0; var goldP = 0; var killsW = 0; var killsP = 0;
		var date = new Date();
		var dd = date.getDate();
		var mm = date.getMonth()+1; //January is 0!
		var yyyy = date.getFullYear();
		if(dd<10) {
			dd = '0'+dd
		} 
		if(mm<10) {
			mm = '0'+mm
		} 
		date = yyyy + '-' + mm + '-' + dd;
			
		mysqlLib.getConnection(function(err, connection){
			if (err) {
				res.json({"code" : 100, "status" : "Error in connection database : "+err});
				return;
			}
					
			gamewin.forEach(stats => {
				goldW = goldW + stats.gold;
				killsW = killsW + stats.kills;
			});
			gamelose.forEach(stats => {
				goldP = goldP + stats.gold;
				killsP = killsP + stats.kills;
			});
			
			connection.query('insert into jcs_match (mat_idriot, mat_link, mat_idgagnant, mat_idperdant, mat_duree, gold_gagnant, gold_perdant, kills_gagnant, kills_perdant, date_match, ma_ligue, ma_saison, ma_semaine) values (?,?,?,?,?,?,?,?,?,?,?,?,?)',
			[idgame, lien, idteamw, idteaml, duree, goldW, goldP, killsW, killsP, date, ligue, saison, semaine], function(err, data){
				if(!err){
					connection.query('select mat_id from jcs_match where mat_idriot = ? order by mat_id desc',[idgame], function(err, rows){
						if(!err){
							idmatchbase = rows[0].mat_id;
							
							gamewin.forEach(stats => {		
								connection.query('insert into jcs_statsjpm (id_match, nom_joueur, champion, kills, deaths, assists, degats, golds, farm, visions, poste, match_temps, saison) values (?,?,?,?,?,?,?,?,?,?,?,?,?)',
								[idmatchbase, stats.player, stats.champion, stats.kills, stats.deaths, stats.assists, stats.damage, stats.gold, stats.farm, stats.visions, stats.role, duree, saison],function(err, donnee){
									if(!err){
										//oui
									}else{
										console.log(err);
									}
								});
							});
							
							gamelose.forEach(stats => {
								connection.query('insert into jcs_statsjpm (id_match, nom_joueur, champion, kills, deaths, assists, degats, golds, farm, visions, poste, match_temps, saison) values (?,?,?,?,?,?,?,?,?,?,?,?,?)',
								[idmatchbase, stats.player, stats.champion, stats.kills, stats.deaths, stats.assists, stats.damage, stats.gold, stats.farm, stats.visions, stats.role, duree, saison],function(err, donnee){
									if(!err){
										//oui
									}else{
										console.log(err);
									}
								});
							});
							
							banswin.forEach(champion => {
								connection.query('insert into jcs_banns (champion, id_team, id_match) values (?,?,?)',
								[champion, idteamw, idmatchbase],function(err, donnee){
									if(!err){
										//oui
									}else{
										console.log(err);
									}
								});
							});
							
							banslose.forEach(champion => {
								connection.query('insert into jcs_banns (champion, id_team, id_match) values (?,?,?)',
								[champion, idteaml, idmatchbase],function(err, donnee){
									if(!err){
										//oui
									}else{
										console.log(err);
									}
								});
							});
						}
					});
				}
				else{
					console.log(err);
				}
			});
			
			gamewin.forEach(stats => {			
				connection.query('update jcs_joueur set jou_kills = jou_kills + ?, jou_deaths = jou_deaths + ?, jou_assists = jou_assists + ?, jou_gold = jou_gold + ?, jou_vision = jou_vision + ?, jou_damage = jou_damage + ?, jou_tempsdejeu = jou_tempsdejeu + ? where jou_name = ? and jou_saison = ?',
				[stats.kills, stats.deaths, stats.assists, stats.gold, stats.visions, stats.damage, duree, stats.player, saison], function(err, data){
					
				});
			});
			
			gamelose.forEach(stats => {
				connection.query('update jcs_joueur set jou_kills = jou_kills + ?, jou_deaths = jou_deaths + ?, jou_assists = jou_assists + ?, jou_gold = jou_gold + ?, jou_vision = jou_vision + ?, jou_damage = jou_damage + ?, jou_tempsdejeu = jou_tempsdejeu + ? where jou_name = ? and jou_saison = ?',
				[stats.kills, stats.deaths, stats.assists, stats.gold, stats.visions, stats.damage, duree, stats.player, saison], function(err, data){
					
				});
			});
			
			connection.query('update jcs_team set nb_match = nb_match + 1, nb_victoires = nb_victoires + 1 where team_id = ?',
			[idteamw], function(err, data){
				if(err){
					console.log('erreur update team gagnante');
				}
			});
			
			connection.query('update jcs_team set nb_match = nb_match + 1 where team_id = ?',
			[idteaml], function(err, data){
				if(err){
					console.log('erreur update team perdante');
				}
			});
			
			res.json({'success':'oui'});
		});
			
	}
	else{
		response.push({'result' : 'error', 'msg' : 'Please fill required details'});
		res.setHeader('Content-Type', 'application/json');
		res.status(200).send(JSON.stringify(response));
	}
	
});


router.get('/listegames', function(req, res, next){
	
	mysqlLib.getConnection(function(err, connection){
			if (err) {
				res.json({"code" : 100, "status" : "Error in connection database : "+err});
				return;
			}
		
		connection.query('select * from jcs_match order by mat_id desc limit 10', function(err, data){
			connection.release();
			if(err){
					console.log('erreur selection');
			}
			else
			{
				res.json(data);
			}
		});
		
	});
});


router.post('/deletegame', function(req, res, next){
	
	var response = [];
	
	if(typeof req.body.idgame !== 'undefined'){
		
		var id = req.body.idgame;
		
		mysqlLib.getConnection(function(err, connection){
			if (err) {
				res.json({"code" : 100, "status" : "Error in connection database : "+err});
				return;
			}
		
			/*connection.query('delete from jcs_banns where id_match = ?',[id], function(err, data){		
			if(!err){
					connection.query('delete from jcs_statsjpm where id_match = ?',[id], function(err, data){
						if(!err){
							connection.query('delete from jcs_match where mat_id = ?',[id], function(err, data){
							connection.release();
							if(!err){
								res.json({"sucess":"oui"});
							}
							});
						}
					});
			}
			});*/

			connection.query('select * from jcs_match where mat_id = ?',[id], function(err, datam){
				connection.query('update from jcs_team set nb_match = nb_match-1, nb_victoires = nb_victoires-1 where team_id = ?',[datam[0].mat_idgagnant],function(err, result){
					connection.query('update from jcs_team set nb_match = nb_match-1 where team_id = ?',[datam[0].mat_idperdant],function(err, result){
					
							connection.query('delete from jcs_banns where id_match = ?',[id], function(err, data){	
								
								connection.query('select * from jcs_statsjpm where id_match = ?',[id], function(err, data){
									
									var iterateur = 0;
																	
									data.forEach(function(item){										
										connection.query('update jcs_joueur set jou_kills = jou_kills - ?, jou_deaths = jou_deaths - ?, jou_assists = jou_assists - ?, jou_gold = jou_gold - ?'
										+', jou_damage = jou_damage - ?, jou_vision = jou_vision - ?, jou_tempsdejeu = jou_tempsdejeu - ? where jou_name = ? and jou_saison = ?'
										,[item.kills,item.deaths,item.assists,item.golds,item.degats,item.visions,datam[0].mat_duree,item.nom_joueur,datam[0].ma_saison],function(err, result){								
											iterateur++;
											if(iterateur == data.length)
											{
												connection.query('delete from jcs_statsjpm where id_match = ?',[id], function(err, data){
													if(!err){
														connection.query('delete from jcs_match where mat_id = ?',[id], function(err, data){
														connection.release();
														if(!err){
															res.json({"sucess":"oui"});
														}
														});
													}
												});
											}
										});

									});
								});
							});
						
					});
				});
			});

		
			
		});
	}
	else{
		response.push({'result' : 'error', 'msg' : 'Please fill required details'});
		res.setHeader('Content-Type', 'application/json');
		res.status(200).send(JSON.stringify(response));
	}	
});


router.post('/updateapi', function(req, res, next){
	var response = [];
	
	if(typeof req.body.cleapi !== 'undefined'){
		var api = req.body.cleapi;
		
		mysqlLib.getConnection(function(err, connection){
			if (err) {
				res.json({"code" : 100, "status" : "Error in connection database : "+err});
				return;
			}
			
			connection.query("update jcs_parametre set param_valeur = ? where param_libelle = 'cle api riot'",[api], function(err, data){		
			connection.release();
			if(!err){
				res.json({"sucess":"oui"});
			}
			});
			
		});
	}
	else{
		response.push({'result' : 'error', 'msg' : 'Please fill required details'});
		res.setHeader('Content-Type', 'application/json');
		res.status(200).send(JSON.stringify(response));
	}	
});


 router.get('/test', function(req, res, next){
	
	var id = '3525332039';
	//3563615843 Moi
	//3565156971 Drako
	
	var URL = 'https://euw1.api.riotgames.com/lol/match/v3/matches/'+id+'?api_key=' + api_key;

	request.get(URL, (error, response, body) => {
		
		if(!error){
		
		let json = JSON.parse(body);
		
		//var json = JSON.parse(body);
		var idplayer = [];
		var playername = [];
		var stringData = [];
		
		var duree = json.gameDuration;
		
		
		for(var i = 0; i < json.participantIdentities.length; i++)
		{
			var participant = json.participantIdentities[i];
			//pas de pseudo en custom 
			//playername.push(participant.player.summonerName);
			idplayer.push(participant.participantId);
					
		}
		
		//console.log(json);
		
		json.teams.forEach(data => {
			console.log(data.bans);
		});
		
		json.participants.forEach(stats => {
			
			for(var i = 0; i<10;i++){
				if(idplayer[i] == stats.participantId){
					console.log(stats);
					
					var champion = stats.championId;
					//console.log(stats.championId);
					
					var kda = 0;
					if(stats.stats.deaths > 0){
						kda = precisionRound((stats.stats.kills+stats.stats.assists)/stats.stats.deaths,2);
					}
					else{
						kda = precisionRound(stats.stats.kills+stats.stats.assists,2);
					}
					var gpm, dpm, vpm, dsg;
					
					gpm = Math.round(stats.stats.goldEarned/(duree/60));
					dpm = Math.round(stats.stats.totalDamageDealtToChampions/(duree/60));
					vpm = precisionRound(stats.stats.visionScore/(duree/60),2);
					dsg = precisionRound(stats.stats.totalDamageDealtToChampions/stats.stats.goldEarned,2);
					
					//var player = playername[i];
					var player = idplayer[i];
					
					//console.log("KDA : "+kda+" GPM : "+gpm+" DPM : "+dpm+" VPM : "+vpm);
					//console.log(playername[i]+" "+stats.stats.kills+"/"+stats.stats.deaths+"/"+stats.stats.assists);
					
				}
			}
			
		});		
	
		res.json({'success':'oui'});
		}
		else{
			 res.json({"code" : 100, "status" : "Error in connection : "+error});
			 return;
		}
				
	});
	 
 });
 
function precisionRound(number, precision) {
  var factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}	

 
module.exports = router;
