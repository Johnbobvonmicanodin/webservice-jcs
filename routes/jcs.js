let express = require('express'),
    router = express.Router(),
    mysqlLib = require("../mysqlLib"),
    logger = require("../loggerLib"),
    AES = require("crypto-js/aes"),
    SHA256 = require("crypto-js/sha256"),
    nodemailer = require('nodemailer'),
    jwt = require('jsonwebtoken'),
    settings = require("../settings");

const request = require("request");

router.post('/gamedata', function (req, res) {

    let response = [];
    let getFromId = req.body.getFromId;

    if (typeof req.body.id !== 'undefined') {
        function getGameInfo(getFromId, callback) {
            if (!getFromId) {
                request("http://webservice-harmful.jcs-infinity.fr/api/gameinfo", function onRequest(error, response, body) {
                    if (error || response.statusCode !== 200) {
                        return callback(error || {statuscode: response.statusCode});
                    }
                    let json = JSON.parse(body);
                    let amount_of_games = json.length;
                    let last_game = json[amount_of_games - 1];
                    let gameId = last_game.game_id;
                    let tournament_code = last_game.tournament_code;
                    let timestamp = last_game.timestamp;
                    callback(null, gameId, tournament_code, timestamp, amount_of_games);
                })
            } else {
                let id = req.body.id;
                let tournament_code = "pas de code car lien";
                // le timestamp est récupéré depuis l'API Riot
                getAmountOfGames(function (err, amount_of_games) {
                    if (!err) {
                        callback(null, id, tournament_code, null, amount_of_games);
                    }
                })
            }
        }

        getGameInfo(getFromId, function (err, id, tournament_code, timestamp, amount_of_games) {
            if (err) {
                console.log(err)
            } else {
                let teamw = req.body.teamw;
                let teaml = req.body.teaml;
                let ligue = req.body.ligue;
                let saison = req.body.saison;

                let jsonArray = [];
                let winteam = [];
                let loseteam = [];
                let winbans = [];
                let losebans = [];
                let stringData = [];

                let teamSub;
                if (ligue === 'JCS') {
                    teamSub = saison * 100;
                } else {
                    teamSub = saison * 100 + 1;
                }


                mysqlLib.getConnection(function onConnect(err, connection) {
                    if (err) {
                        res.json({"code": 500, "status": "Error in connection database : " + err});
                        return;
                    }


                    connection.query("select param_valeur from jcs_parametre where param_libelle = 'cle api riot'", function (err, param) {

                        if (!err) {
                            let api_key = param[0].param_valeur;

                            let URL;
                            if (tournament_code === "pas de code car lien") {
                                URL = 'https://euw1.api.riotgames.com/lol/match/v4/matches/' + id + '?api_key=' + api_key;
                            } else {
                                URL = 'https://euw1.api.riotgames.com/lol/match/v4/matches/' + id + '/by-tournament-code/' + tournament_code + '?api_key=' + api_key;
                            }

                            connection.query('select jou_id, jou_name, jou_invocateur, jou_accountID, jou_teamid from jcs_joueur where jou_teamid = ? or jou_teamid = ?', [teamw, teamSub], function (err, rows) {
                                if (!err) {
                                    rows.forEach(joueur => {
                                        if (joueur.jou_teamid === teamSub) {
                                            joueur.jou_name = "[SUB]" + joueur.jou_name;
                                        }
                                        winteam.push({jou_id: joueur.jou_id, jou_name: joueur.jou_name, jou_inv: joueur.jou_invocateur, jou_aid: joueur.jou_accountID});
                                    });
                                    connection.query('select jou_id, jou_name, jou_invocateur, jou_accountID, jou_teamid from jcs_joueur where jou_teamid = ? or jou_teamid = ?', [teaml, teamSub], function (err, data) {
                                        connection.release();

                                        data.forEach(joueur => {
                                            if (joueur.jou_teamid === teamSub) {
                                                joueur.jou_name = "[SUB]" + joueur.jou_name;
                                            }
                                            loseteam.push({jou_id: joueur.jou_id, jou_name: joueur.jou_name, jou_inv: joueur.jou_invocateur, jou_aid: joueur.jou_accountID});
                                        });
                                        request.get(URL, (error, response, body) => {
                                            if (!error && response.statusCode === 200) {
                                                let json = JSON.parse(body);
                                                let idplayer = [];
                                                let playername = [];

                                                if (timestamp === null) {
                                                    timestamp = formatTimestamp(json.gameCreation);
                                                }
                                                let duree = json.gameDuration;
                                                for (let i = 0; i < json.participantIdentities.length; i++) {
                                                    let participant = json.participantIdentities[i];
                                                    //pas de pseudo en custom
                                                    playername.push(participant.player);
                                                    idplayer.push(participant.participantId);

                                                }

                                                json.participants.forEach(stats => {

                                                    for (let i = 0; i < 10; i++) {
                                                        if (idplayer[i] === stats.participantId) {
                                                            //console.log(stats);

                                                            let champion = stats.championId;
                                                            //console.log(stats.championId);

                                                            let kda = 0;
                                                            if (stats.stats.deaths > 0) {
                                                                kda = precisionRound((stats.stats.kills + stats.stats.assists) / stats.stats.deaths, 2);
                                                            } else {
                                                                kda = precisionRound(stats.stats.kills + stats.stats.assists, 2);
                                                            }
                                                            let gpm, dpm, vpm, dsg;

                                                            gpm = Math.round(stats.stats.goldEarned / (duree / 60));
                                                            dpm = Math.round(stats.stats.totalDamageDealtToChampions / (duree / 60));
                                                            vpm = precisionRound(stats.stats.visionScore / (duree / 60), 2);
                                                            dsg = precisionRound(stats.stats.totalDamageDealtToChampions / stats.stats.goldEarned, 2);

                                                            let player = playername[i];
                                                            //let player = idplayer[i];

                                                            stringData.push({
                                                                player: ' ',
                                                                lolname : player.summonerName,
                                                                lolid : player.accountId,
                                                                win: stats.stats.win,
                                                                kills: stats.stats.kills,
                                                                deaths: stats.stats.deaths,
                                                                assists: stats.stats.assists,
                                                                visions: stats.stats.visionScore,
                                                                duree: duree,
                                                                champion: champion,
                                                                role: stats.timeline.lane + ' ' + stats.timeline.role,
                                                                kda: kda,
                                                                gpm: gpm,
                                                                dpm: dpm,
                                                                vpm: vpm,
                                                                dsg: dsg,
                                                                farm: stats.stats.totalMinionsKilled + stats.stats.neutralMinionsKilled,
                                                                gold: stats.stats.goldEarned,
                                                                damage: stats.stats.totalDamageDealtToChampions,

                                                            });

                                                        }
                                                    }

                                                });

                                                json.teams.forEach(data => {
                                                    if (data.win === 'Win') {
                                                        data.bans.forEach(champion => {
                                                            winbans.push(champion.championId);
                                                        });
                                                    } else {
                                                        data.bans.forEach(champion => {
                                                            losebans.push(champion.championId);
                                                        });
                                                    }
                                                });


                                                jsonArray.push(winteam);
                                                jsonArray.push(loseteam);
                                                jsonArray.push(stringData);
                                                jsonArray.push(winbans);
                                                jsonArray.push(losebans);
                                                jsonArray.push([id, tournament_code, timestamp, amount_of_games]);
                                                res.json(jsonArray);
                                            } else {
                                                res.status(500).json({"success": false});
                                            }
                                        });
                                    });
                                }
                            });
                        } else {
                            res.status(500).json({"success": false});
                        }
                    });
                });
            }
        });
    } else {
        response.push({'result': 'error', 'msg': 'Please fill required details'});
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify(response));
    }

});

function formatTimestamp(timestamp) {
    let date = new Date(timestamp);

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let hours = date.getHours();
    let minutes = date.getMinutes();

    return day + '/' + month + '/' + year + ' ' + hours + ':' + minutes;
}

router.post('/putgamedata', function (req, res) {

    let response = [];

    if (typeof req.body.gamewin !== 'undefined' || req.body.gamelose !== 'undefined') {

        let gamewin = req.body.gamewin;
        let gamelose = req.body.gamelose;
        let tournament_code = req.body.tournament_code;
        let duree = req.body.duree;
        let idteamw = req.body.idteamw;
        let idteaml = req.body.idteaml;
        let ligue = req.body.ligue;
        let saison = req.body.saison;
        const idgame = Number(req.body.idgame);
        let banswin = req.body.banswin;
        let banslose = req.body.banslose;
        let semaine = req.body.semaine;
        let lien = req.body.lien;
        if (lien === '') {
            lien = 'https://matchhistory.euw.leagueoflegends.com/en/#match-details/EUW1/' + req.body.idgame;
        }
        let idmatchbase = 0;
        let goldW = 0;
        let goldP = 0;
        let killsW = 0;
        let killsP = 0;
        let date = new Date();
        let dd = date.getDate();
        let mm = date.getMonth() + 1; //January is 0!
        let yyyy = date.getFullYear();
        if (dd < 10) {
            dd = '0' + dd
        }
        if (mm < 10) {
            mm = '0' + mm
        }
        date = yyyy + '-' + mm + '-' + dd;

        mysqlLib.getConnection(function (err, connection) {
            if (err) {
                res.json({"code": 100, "status": "Error in connection database : " + err});
                return;
            }

            gamewin.forEach(stats => {
                if (stats.player.includes("[SUB]")) {
                    stats.player = stats.player.replace("[SUB]", "");
                }
                goldW = goldW + stats.gold;
                killsW = killsW + stats.kills;
            });
            gamelose.forEach(stats => {
                if (stats.player.includes("[SUB]")) {
                    stats.player = stats.player.replace("[SUB]", "");
                }
                goldP = goldP + stats.gold;
                killsP = killsP + stats.kills;
            });

            connection.query('insert into jcs_match (mat_idriot, mat_link, tournament_code, mat_idgagnant, mat_idperdant, mat_duree, gold_gagnant, gold_perdant, kills_gagnant, kills_perdant, date_match, ma_ligue, ma_saison, ma_semaine) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                [idgame, lien, tournament_code, idteamw, idteaml, duree, goldW, goldP, killsW, killsP, date, ligue, saison, semaine], function (err, data) {
                    if (!err) {
                        connection.query('select mat_id from jcs_match where mat_idriot = ? order by mat_id desc', [idgame], function (err, rows) {
                            if (!err) {
                                idmatchbase = rows[0].mat_id;

                                gamewin.forEach(stats => {
                                    connection.query('insert into jcs_statsjpm (id_match, nom_joueur, champion, kills, deaths, assists, degats, golds, farm, visions, poste, match_temps, saison) values (?,?,?,?,?,?,?,?,?,?,?,?,?)',
                                        [idmatchbase, stats.player, stats.champion, stats.kills, stats.deaths, stats.assists, stats.damage, stats.gold, stats.farm, stats.visions, stats.role, duree, saison], function (err, donnee) {
                                            if (!err) {
                                                //oui
                                            } else {
                                                console.log(err);
                                            }
                                        });
                                });

                                gamelose.forEach(stats => {
                                    connection.query('insert into jcs_statsjpm (id_match, nom_joueur, champion, kills, deaths, assists, degats, golds, farm, visions, poste, match_temps, saison) values (?,?,?,?,?,?,?,?,?,?,?,?,?)',
                                        [idmatchbase, stats.player, stats.champion, stats.kills, stats.deaths, stats.assists, stats.damage, stats.gold, stats.farm, stats.visions, stats.role, duree, saison], function (err, donnee) {
                                            if (!err) {
                                                //oui
                                            } else {
                                                console.log(err);
                                            }
                                        });
                                });

                                banswin.forEach(champion => {
                                    connection.query('insert into jcs_banns (champion, id_team, id_match, saison) values (?,?,?,?)',
                                        [champion, idteamw, idmatchbase, saison], function (err, donnee) {
                                            if (!err) {
                                                //oui
                                            } else {
                                                console.log(err);
                                            }
                                        });
                                });

                                banslose.forEach(champion => {
                                    connection.query('insert into jcs_banns (champion, id_team, id_match, saison) values (?,?,?,?)',
                                        [champion, idteaml, idmatchbase, saison], function (err, donnee) {
                                            if (!err) {
                                                //oui
                                            } else {
                                                console.log(err);
                                            }
                                        });
                                });
                            }
                        });
                    } else {
                        console.log(err);
                    }
                });

            gamewin.forEach(stats => {
                connection.query('update jcs_joueur set jou_kills = jou_kills + ?, jou_deaths = jou_deaths + ?, jou_assists = jou_assists + ?, jou_gold = jou_gold + ?, jou_vision = jou_vision + ?, jou_damage = jou_damage + ?, jou_tempsdejeu = jou_tempsdejeu + ? where jou_name = ? and jou_saison = ?',
                    [stats.kills, stats.deaths, stats.assists, stats.gold, stats.visions, stats.damage, duree, stats.player, saison], function (err, data) {

                    });
            });

            gamelose.forEach(stats => {
                connection.query('update jcs_joueur set jou_kills = jou_kills + ?, jou_deaths = jou_deaths + ?, jou_assists = jou_assists + ?, jou_gold = jou_gold + ?, jou_vision = jou_vision + ?, jou_damage = jou_damage + ?, jou_tempsdejeu = jou_tempsdejeu + ? where jou_name = ? and jou_saison = ?',
                    [stats.kills, stats.deaths, stats.assists, stats.gold, stats.visions, stats.damage, duree, stats.player, saison], function (err, data) {

                    });
            });

            connection.query('update jcs_team set nb_match = nb_match + 1, nb_victoires = nb_victoires + 1 where team_id = ?',
                [idteamw], function (err, data) {
                    if (err) {
                        console.log('erreur update team gagnante');
                    }
                });

            connection.query('update jcs_team set nb_match = nb_match + 1 where team_id = ?',
                [idteaml], function (err, data) {
                    if (err) {
                        console.log('erreur update team perdante');
                    }
                });

            res.json({'success': 'oui'});
        });

        deleteGameInfo(idgame);

    } else {
        response.push({'result': 'error', 'msg': 'Please fill required details'});
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify(response));
    }

});

function deleteGameInfo(gameId) {
    let requestBody = {
        "gameId": gameId
    };
    request({method: 'POST', uri: "http://webservice-harmful.jcs-infinity.fr/api/deletegameinfo", json: requestBody}, (error) => {
        if (error) {
            console.log(error);
        }
    });
}

router.get('/listegames', function (req, res, next) {

    mysqlLib.getConnection(function (err, connection) {
        if (err) {
            res.json({"code": 100, "status": "Error in connection database : " + err});
            return;
        }

        connection.query('select * from jcs_match order by mat_id desc limit 10', function (err, data) {
            connection.release();
            if (err) {
                console.log('erreur selection');
            } else {
                res.json(data);
            }
        });

    });
});

router.get('/amountofgames', function (req, res) {
    getAmountOfGames((err, amount_of_games, timestamp) => {
        res.json({'amount_of_games': amount_of_games, 'timestamp': timestamp});
    });
});

function getAmountOfGames(callback) {
    request("http://webservice-harmful.jcs-infinity.fr/api/gameinfo", function onRequest(error, response, body) {
        if (error || response.statusCode !== 200) {
            return callback(error || {statuscode: response.statusCode});
        }
        let json = JSON.parse(body);
        let amount_of_games = json.length;
        let timestamp = null;
        if (amount_of_games > 0) {
            timestamp = json[amount_of_games - 1].timestamp;
        }
        callback(null, amount_of_games, timestamp);
    })
}


router.post('/deletegame', function (req, res, next) {

    let response = [];

    if (typeof req.body.idgame !== 'undefined') {

        let id = req.body.idgame;

        mysqlLib.getConnection(function (err, connection) {
            if (err) {
                res.json({"code": 100, "status": "Error in connection database : " + err});
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

            connection.query('select * from jcs_match where mat_id = ?', [id], function (err, datam) {
                connection.query('update from jcs_team set nb_match = nb_match-1, nb_victoires = nb_victoires-1 where team_id = ?', [datam[0].mat_idgagnant], function (err, result) {
                    connection.query('update from jcs_team set nb_match = nb_match-1 where team_id = ?', [datam[0].mat_idperdant], function (err, result) {

                        connection.query('delete from jcs_banns where id_match = ?', [id], function (err, data) {

                            connection.query('select * from jcs_statsjpm where id_match = ?', [id], function (err, data) {

                                let iterateur = 0;

                                data.forEach(function (item) {
                                    connection.query('update jcs_joueur set jou_kills = jou_kills - ?, jou_deaths = jou_deaths - ?, jou_assists = jou_assists - ?, jou_gold = jou_gold - ?'
                                        + ', jou_damage = jou_damage - ?, jou_vision = jou_vision - ?, jou_tempsdejeu = jou_tempsdejeu - ? where jou_name = ? and jou_saison = ?'
                                        , [item.kills, item.deaths, item.assists, item.golds, item.degats, item.visions, datam[0].mat_duree, item.nom_joueur, datam[0].ma_saison], function (err, result) {
                                            if (err) {
                                                console.log(err);
                                            }
                                            iterateur++;
                                            if (iterateur == data.length) {
                                                connection.query('delete from jcs_statsjpm where id_match = ?', [id], function (err, data) {
                                                    if (!err) {
                                                        connection.query('delete from jcs_match where mat_id = ?', [id], function (err, data) {
                                                            connection.release();
                                                            if (!err) {
                                                                res.json({"sucess": "oui"});
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
    } else {
        response.push({'result': 'error', 'msg': 'Please fill required details'});
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify(response));
    }
});


router.post('/updateapi', function (req, res, next) {
    let response = [];

    if (typeof req.body.cleapi !== 'undefined') {
        let api = req.body.cleapi;

        mysqlLib.getConnection(function (err, connection) {
            if (err) {
                res.json({"code": 100, "status": "Error in connection database : " + err});
                return;
            }

            connection.query("update jcs_parametre set param_valeur = ? where param_libelle = 'cle api riot'", [api], function (err, data) {
                connection.release();
                if (!err) {
                    res.json({"sucess": "oui"});
                }
            });

        });
    } else {
        response.push({'result': 'error', 'msg': 'Please fill required details'});
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify(response));
    }
});


router.post('/getparam', function (req, res, next) {
    var response = [];

    if (typeof req.body.param !== 'undefined') {
        var param = req.body.param;

        mysqlLib.getConnection(function (err, connection) {
            if (err) {
                res.json({"code": 100, "status": "Error in connection database : " + err});
                return;
            }

            connection.query("select * from jcs_parametre where param_libelle = ?", [param], function (err, data) {
                connection.release();
                if (!err) {
                    res.json(data);
                }
            });

        });
    } else {
        response.push({'result': 'error', 'msg': 'Please fill required details'});
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify(response));
    }
});


router.post('/ajoutjoueur', function (req, res, next) {
    let response = [];

    if (typeof req.body.pseudo !== 'undefined' && req.body.structure !== 'undefined' && req.body.key == settings.codeAdmin) {
        let pseudo = req.body.pseudo;
        let structure = req.body.structure;
        let saison = req.body.saison;
        let pseudolol = req.body.pseudolol;

        mysqlLib.getConnection(function (err, connection) {
            if (err) {
                res.json({"code": 100, "status": "Error in connection database : " + err});
                return;
            }

            connection.query("insert into jcs_joueur (jou_name, jou_invocateur, jou_teamid, jou_kills, jou_deaths, jou_assists, jou_gold, jou_damage, jou_vision, jou_saison, jou_tempsdejeu)"
                + "values (?,?,?,0,0,0,0,0,0,?,0)", [pseudo, pseudolol, structure, saison], function (err, data) {
                connection.release();
                if (!err) {
                    res.json({"sucess": "oui"});
                }
            });

        });

    } else {
        response.push({'result': 'error', 'msg': 'Please fill required details'});
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify(response));
    }
});


router.get('/test', function (req, res, next) {

    let id = '3525332039';
    //3563615843 Moi
    //3565156971 Drako

    let URL = 'https://euw1.api.riotgames.com/lol/match/v4/matches/' + id + '?api_key=' + api_key;

    request.get(URL, (error, response, body) => {

        if (!error) {

            let json = JSON.parse(body);

            //let json = JSON.parse(body);
            let idplayer = [];
            let playername = [];
            let stringData = [];

            let duree = json.gameDuration;


            for (let i = 0; i < json.participantIdentities.length; i++) {
                let participant = json.participantIdentities[i];
                //pas de pseudo en custom
                //playername.push(participant.player.summonerName);
                idplayer.push(participant.participantId);

            }

            //console.log(json);

            json.teams.forEach(data => {
                console.log(data.bans);
            });

            json.participants.forEach(stats => {

                for (let i = 0; i < 10; i++) {
                    if (idplayer[i] == stats.participantId) {
                        console.log(stats);

                        let champion = stats.championId;
                        //console.log(stats.championId);

                        let kda = 0;
                        if (stats.stats.deaths > 0) {
                            kda = precisionRound((stats.stats.kills + stats.stats.assists) / stats.stats.deaths, 2);
                        } else {
                            kda = precisionRound(stats.stats.kills + stats.stats.assists, 2);
                        }
                        let gpm, dpm, vpm, dsg;

                        gpm = Math.round(stats.stats.goldEarned / (duree / 60));
                        dpm = Math.round(stats.stats.totalDamageDealtToChampions / (duree / 60));
                        vpm = precisionRound(stats.stats.visionScore / (duree / 60), 2);
                        dsg = precisionRound(stats.stats.totalDamageDealtToChampions / stats.stats.goldEarned, 2);

                        //let player = playername[i];
                        let player = idplayer[i];

                        //console.log("KDA : "+kda+" GPM : "+gpm+" DPM : "+dpm+" VPM : "+vpm);
                        //console.log(playername[i]+" "+stats.stats.kills+"/"+stats.stats.deaths+"/"+stats.stats.assists);

                    }
                }

            });

            res.json({'success': 'oui'});
        } else {
            res.json({"code": 100, "status": "Error in connection : " + error});
            return;
        }

    });

});


function precisionRound(number, precision) {
    let factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
}


module.exports = router;
