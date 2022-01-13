const express = require("express");
const { json } = require("express");
const axios = require("axios");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
app.use(cors());
/* cors */
app.use(json());
app.listen(process.env.PORT || 3333, (erro) => {
  if (erro) {
    return console.log(erro);
  }
  console.log("deu certo direitinho");
});

app.get("/", async (req, res) => {
  res.send("hello word");
});

app.get("/summoner/:summonerName", async (req, res) => {
  const { summonerName } = req.params;
  const summonerIdResponse = await axios
    .get(
      `${process.env.LOL_URL}/lol/summoner/v4/summoners/by-name/${summonerName}`,
      {
        headers: { "X-Riot-Token": process.env.LOL_KEY },
      }
    )
    .catch((e) => {
      return res.status(e.response.status).json(e.response.data);
    });
  const { id, profileIconId, summonerLevel } = summonerIdResponse.data;

  const responseRanked = await axios
    .get(`${process.env.LOL_URL}/lol/league/v4/entries/by-summoner/${id}`, {
      headers: { "X-Riot-Token": process.env.LOL_KEY },
    })
    .catch((e) => {
      return res.status(e.response.status).json(e.response.data);
    });

  const { tier, rank, wins, losses, queueType } = responseRanked.data[1]
    ? responseRanked.data[1]
    : responseRanked.data[0];

  res.json({
    iconUrl: `${process.env.LOL_ICONS}/${profileIconId}.png`,
    summonerLevel,
    tier,
    rank,
    wins,
    losses,
    queueType,
    winRate: ((wins / (wins + losses)) * 100).toFixed(1),
  });
});
