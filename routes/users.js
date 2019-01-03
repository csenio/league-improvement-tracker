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

function catchFetchingError(description, errorMessage) {
  errors.push({ description: description, errorMessage: errorMessage });
}

function getUserId(username, region, cb) {
  axios
    .get(
      `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${username}?api_key=${
        config.key
      }`
    )
    .then(res => {
      console.log(res);
      cb(res);
    })
    .catch(err => cb(null, err));
}

// getUserMatchlist("cubefox", "euw1", "Ahri", 30, (res, err) => {
//   if (err) {
//     console.log("error getting user matchlist", err);
//   } else {
//     console.log(res);
//   }
// });

//gets the last 'end' matches in chronological order, newest first. userId required from Riot server first -> getUserId.
function getUserMatchlist(username, region, champion, end, cb) {
  if (end > 100) {
    end = 100;
  }
  var championId = getChampionId(champion);

  getUserId(username, region, (result, err) => {
    if (err) {
      console.log("error", err);
    } else {
      console.log(result.data.accountId, region, championId, end);
      axios
        .get(
          `https://${region}.api.riotgames.com/lol/match/v4/matchlists/by-account/${
            result.data.accountId
          }?champion=${championId}&endIndex=${end}&beginIndex=0&api_key=${
            config.key
          }`
        )
        .then(res => cb(res.data.matches))
        .catch(err => cb(null, err));
    }
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

getMatchDetails("3883259526", "euw1", (res, err) => {
  if (err) {
    console.log("error getting match details", err);
  } else {
    console.log(res);
  }
});

module.exports = router;
