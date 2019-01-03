var express = require("express");
var router = express.Router();
var axios = require("axios");
var config = require("../config.js");
var champions = require("../champion.json");
var errors = [];

// setChampionObject("8.24.1");

// function setChampionObject(version) {
//   axios
//     .get(
//       `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`
//     )
//     .then(res => {
//       console.log("champions:", champions);
//       champions = res;
//       console.log("champions now:", champions);
//       console.log("result:", res);
//       debugger;
//     })
//     .catch(err => catchFetchingError("error fetching all champions", err));
// }

function execute(username, region, champion, amount) {
  getUserId(username, region)
    .then(userId => getUserMatchlist(userId, region, champion, amount))
    .then(matchlist => console.log(matchlist));
}

execute("cubefox", "euw1", "Ahri", "20");

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
    var championId = getChampionId(champion);
    console.log(userId, region, championId, end);

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

function getMatchDetails(matchId, region, cb) {
  axios
    .get(
      `https://${region}.api.riotgames.com/lol/match/v4/matches/${matchId}?api_key=${
        config.key
      }`
    )
    .then(res => cb(res.data))
    .catch(err => cb(null, err));
}

// getMatchDetails("3883259526", "euw1", (res, err) => {
//   if (err) {
//     console.log("error getting match details", err);
//   } else {
//     console.log(res);
//   }
// });

function getSpecificDetail(match, detail, cb) {}

module.exports = router;
