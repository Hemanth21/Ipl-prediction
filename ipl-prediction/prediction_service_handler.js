const FileHandler = require('./fileHandler');
const DataSetProcessor = require('./dataset_processor')
const ModelHandler = require('./modelsHandler');
const _ = require('lodash');
let fileHandler = new FileHandler();
let dataset_processor = new DataSetProcessor();
let model_handler = new ModelHandler();


class PredictionServiceHandler {

    constructor() {
        this.teamNameAsNo = dataset_processor.teamNameAsNo;
        this.TeamNoAsName = this.getTeamNoAsName();
    }

    getTeamNoAsName() {
        return this.objectFlip(this.teamNameAsNo);
    }

    objectFlip(obj) {
        const ret = {};

        Object.keys(obj).forEach((key) => {
          ret[obj[key]] = key;
        });

        return ret;
    }

    predictOneVsOne(match_details) {

        match_details["team1"] = dataset_processor.teamNameAsNo[match_details["team1"]];
        match_details["team2"] = dataset_processor.teamNameAsNo[match_details["team2"]];
        match_details["tossWinner"] = dataset_processor.teamNameAsNo[match_details["tossWinner"]];
        match_details["tossDecision"] = (match_details["tossDecision"] === "Batting") ? 1 : 2;

        console.log(match_details);
        

        model_handler.initForOneVsOnePrediction();
        
        return this.TeamNoAsName[model_handler.predictOneVsOne(match_details)];
    }

    predictSeasonalMatches(SeasonalMatchData) {

        let normalData = SeasonalMatchData["matchData"].map(record => {

            record["team1"] = dataset_processor.teamNameAsNo[record["team1"]];
            record["team2"] = dataset_processor.teamNameAsNo[record["team2"]];
            record["tossWinner"] = dataset_processor.teamNameAsNo[record["tossWinner"]];
            record["tossDecision"] = (record["tossDecision"] === "Batting") ? 1 : 2;

            return record;

        });

        console.log(normalData);
        
        model_handler.initForSeasonalPrediction();

        let result =  model_handler.predictSeasonalMatches(normalData);

        return result;

    }

    SeasonalWins() {
        return model_handler.SeasonalWinCounts;
    }

    analytics() {
        return model_handler.SeasonalRanks;
    }

}

module.exports = PredictionServiceHandler;