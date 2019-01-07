var express = require("express");
var router = express.Router();
var axios = require("axios");
var config = require("../config.js");
var champions = require("../champion.json");
var errors = [];
var fs = require("fs");

router.get("/data", function(req, res, next) {
  createDataSet(req.query.username, req.query.region, "Ahri", "18")
    .then(dataset => {
      res.send(dataset);
      res.status(200);
    })
    .catch(err => res.status(404));
});

// createDataSet("cubefox", "euw1", "", "18");
// getPlayerMatchDetails(match, userId)

//data Array is an array of objects containing gamedata according to the filter
function createDataSet(username, region, champion, amount, filter) {
  var uId;
  return getUserId(username, region)
    .then(userId => {
      uId = userId;
      return getUserMatchlist(uId, region, champion, amount);
    })
    .then(matchlist => {
      console.log("matchlist:", matchlist);
      return (
        Promise.all(
          matchlist.map(match =>
            getMatchDetails(match.gameId.toString(), region)
          )
        )
          .then(mappedMatchList => {
            console.log(mappedMatchList);
          })

          //   // Promise.all(
          //   //   mappedMatchList.map(match =>
          //   //     getPlayerMatchDetails(
          //   //       match,
          //   //       uId
          //   //       // "tydNGC-u00pR5qC-5VBYLPay4L37u0Z-qL0a_DFWpcAgFBo"
          //   //     )
          //   //   )
          //   // )
          .catch(err => console.log(err))
      );
    })
    .catch(err => console.log(err));
}

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

function getPlayerMatchDetails(match, userId) {
  const participantId = getMatchParticipantId(match, userId);
  const matchFilteredForUser = match.participants.find(
    participant => participant.participantId == participantId
  ).stats;
  console.log(matchFilteredForUser);
  return matchFilteredForUser;
}

module.exports = router;
