const express = require("express");
const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

app.use(express.json());

let DB = null;

//Initialization

const initializationServerAndDB = async () => {
  try {
    DB = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3002, () => {
      console.log("Server Running at http://localhost:3002/");
    });
  } catch (error) {
    console.log(`DB Error: ${error}`);
  }
};

initializationServerAndDB();

//convertToResponseObject

const convertPlayerDetailsDBObjectToResponseObject = (object) => {
  return {
    playerId: object.player_id,
    playerName: object.player_name,
  };
};

const convertMatchDetailsDBObjectToResponseObject = (object) => {
  return {
    matchId: object.match_id,
    match: object.match,
    year: object.year,
  };
};

const convertMatchScoreDBObjectToResponseObject = (object) => {
  return {
    playerMatchId: player_match_id,
    playerId: player_id,
    matchId: object.match_id,
    score: object.score,
    fours: object.fours,
    sixes: object.sixes,
  };
};

// API - 1

app.get("/players/", async (request, response) => {
  const playerDetailsQuery = `
    SELECT
      *
    FROM
      player_details;`;

  const playerArray = await DB.all(playerDetailsQuery);
  response.send(
    playerArray.map((eachPlayer) =>
      convertPlayerDetailsDBObjectToResponseObject(eachPlayer)
    )
  );
});

// API - 2

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerIdQuery = `
    SELECT
      *
    FROM
      player_details
    WHERE
      player_id = ${playerId};`;

  const playerDetails = await DB.get(playerIdQuery);
  response.send(convertPlayerDetailsDBObjectToResponseObject(playerDetails));
});

// API - 3

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const playerUpdateQuery = `
    UPDATE
      player_details
    SET
      player_name = '${playerName}'
    WHERE
      player_id = ${playerId};`;

  await DB.run(playerUpdateQuery);
  response.send("Player Details Updated");
});

// API - 4

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const matchIdQuery = `
    SELECT
      *
    FROM
      match_details
    WHERE
      match_id = ${matchId};`;

  const playerDetails = await DB.get(matchIdQuery);
  response.send(convertMatchDetailsDBObjectToResponseObject(playerDetails));
});

// API - 5

app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetailsQuery = `
    SELECT
      *
    FROM
      player_match_score
      NATURAL JOIN match_details
    WHERE
      player_id = ${playerId};`;

  const playerArray = await DB.all(playerDetailsQuery);

  response.send(
    playerArray.map((eachPlayer) =>
      convertMatchDetailsDBObjectToResponseObject(eachPlayer)
    )
  );
});

// API - 6

app.get("/matches/:matchId/players/", async (request, response) => {
  const { matchId } = request.params;
  const matchDetailsQuery = `
    SELECT
      *
    FROM
      player_match_score
      NATURAL JOIN player_details 
    WHERE
      match_id = ${matchId};`;

  const playerArray = await DB.all(matchDetailsQuery);
  response.send(
    playerArray.map((eachPlayer) =>
      convertPlayerDetailsDBObjectToResponseObject(eachPlayer)
    )
  );
});

// API - 7

app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const playerScoreDetailsQuery = `
    SELECT
      player_id AS playerId,
      player_name AS playerName,
      SUM(score) AS totalScore,
      SUM(fours) AS totalFours,
      SUM(sixes) AS totalSixes
    FROM
      player_match_score
      NATURAL JOIN player_details 
    WHERE
      player_id = ${playerId};`;

  const playerMatchDetails = await DB.get(playerScoreDetailsQuery);
  response.send(playerMatchDetails);
});

module.exports = app;
