var express = require("express");
var router = express.Router();
var axios = require("axios");
var config = require("../config.js");

router.get("/u/:region/:user", (req, res, next) => {
  console.log(config.key);
  axios
    .get(
      `https://${
        req.params.region
      }.api.riotgames.com/lol/summoner/v4/summoners/by-name/${
        req.params.user
      }?api_key=${config.key}`
    )
    .then(res => console.log("success", res))
    .catch(err => console.log("error", err));
  // debugger;
  res.send(`respond with ${req.params.user} data`);
});

module.exports = router;
