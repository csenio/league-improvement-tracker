var express = require("express");
var router = express.Router();
var axios = require("axios");
var config = require("../config.js");
// var champions = require("../champion.json");
var champions = undefined;
var errors = [];

setChampionObject("8.24.1");

function setChampionObject(version) {
  axios
    .get(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`
    )
    .then(res => (champions = res))
    .catch(err => catchFetchingError("error fetching all champions", err));
}

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
    .then(res => cb(res))
    .catch(err => cb(null, err));
}

// getUserId("cubefox", "euw1", (result, err) => {
//   if (err) {
//     console.log("error", err);
//     debugger;
//   } else {
//     return result.accountId;
//   }
// });

// getUserMatchlist("euw", (res, err) => {
//   console.log(res);
//   console.log(err);
// });

getChampionId("region", res => {
  console.log(res);
});

function getUserMatchlist(region, cb) {
  //end < 100

  axios
    .get(
      `https://${region}.api.riotgames.com/lol/static-data/v3/tarball-links?api_key=${
        config.key
      }`
    )
    .then(res => cb(res))
    .catch(err => cb(null, err));
}

function getChampionId(region, cb) {
  //end < 100

  axios
    .get(
      `https://ddragon.leagueoflegends.com/cdn/8.24.1/data/en_US/champion.json`
    )
    .then(res => cb(res))
    .catch(err => cb(null, err));
}

module.exports = router;
