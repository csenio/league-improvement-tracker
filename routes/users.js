var express = require("express");
var router = express.Router();
var axios = require("axios");
var config = require("../config.js");
var champions = require("../champion.json");
var errors = [];

router.get("/data", function(req, res, next) {
  console.log(req);
  res.render("index", { title: "Express" });
});

// createDataSet("cubefox", "euw1", "Ahri", "10")
//   .then(res => {
//     result = res;
//     console.log("result", result);
//   })
//   .catch(err => console.log("error", err));

function createDataSet(username, region, champion, amount, setFor) {
  var dataArray = [];
  return getUserId(username, region)
    .then(userId => getUserMatchlist(userId, region, champion, amount))
    .then(matchlist => {
      matchlist.forEach(match => {
        getMatchDetails(matchlist[0].gameId.toString(), region)
          .then(res => {
            dataArray.push(res);
            console.log(dataArray);
          })
          .catch(err => console.log(err));
      });
    });
}

// createDataSet("cubefox", region, undefined, "20");

function catchFetchingError(description, errorMessage) {
  errors.push({ description: description, errorMessage: errorMessage });
}

function getUserId(username, region) {
  return new Promise((resolve, reject) => {
    axios
      .get(
        `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${username}?api_key=${
          config.key
        }`
      )
      .then(res => {
        resolve(res.data.accountId);
      })
      .catch(err => reject(err));
  });
}

function getUserMatchlist(userId, region, champion, end) {
  return new Promise((resolve, reject) => {
    if (end > 100) {
      end = 100;
    }

    var championId = champion ? getChampionId(champion) : "";

    console.log("user data:", userId, region, championId, end);
    axios
      .get(
        `https://${region}.api.riotgames.com/lol/match/v4/matchlists/by-account/${userId}?champion=${championId}&endIndex=${end}&beginIndex=0&api_key=${
          config.key
        }`
      )
      .then(res => resolve(res.data.matches))
      .catch(err => reject(null, err));
  });
}

function getChampionId(name) {
  return champions.data[name].key;
}

function getMatchDetails(matchId, region) {
  return new Promise((resolve, reject) => {
    axios
      .get(
        `https://${region}.api.riotgames.com/lol/match/v4/matches/${matchId}?api_key=${
          config.key
        }`
      )
      .then(res => resolve(res.data))
      .catch(err => reject(null, err));
  });
}

function getMatchParticipantId(match, playerId) {
  return match.participantIdentities.find(
    Identity => Identity.player.accountId == playerId
  ).participantId;
}

function getPlayerMatchDetails(match) {
  const participantId = getMatchParticipantId(
    match,
    "tydNGC-u00pR5qC-5VBYLPay4L37u0Z-qL0a_DFWpcAgFBo"
  );

  const gameDuration = match.gameDuration / 60;
  const totalCs = match.participants.find(
    participant => participant.participantId == participantId
  ).stats.totalMinionsKilled;

  return totalCs / gameDuration;
}

module.exports = router;
