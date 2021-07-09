const DataSetProcessor = require('./dataset_processor');
const fs = require('fs');
const _ = require('lodash');
let dataset_processor = new DataSetProcessor();

class DataServiceHandler {

    constructor() {
        
        // Data from Model Handler

        // Data from dataset handler
        this.city = null;
        this.year = null;
        this.team = null;
        this.venue = null;
        this.seasons = null;
        this.seasonData = null;
        this.cleanData = null;
        this.Analytics = null;
        this.totalTeamWinCounts = null;
        this.matchDetailsAvailable = null;
        this.headersInDataset = null;
        this.teamRank = {};
        // Data from file handler

        // auto initialize data
        this.initiate();
    }

    loadCleanData() {
        this.cleanData = JSON.parse(fs.readFileSync('./cleansedData/cleanData.json', 'utf-8'));
    }

    getTeamData() {
        let temp = _.omit(this.cleanData["teamNameAsNo"], ["", "undefined", "Draw", "PW", "DD"]);
        this.team = []
        _.forOwn(temp, (value, key) => {
            this.team.push(key);
        }, {});
    }

    getSeasons() {
        let temp = new Set();

        this.cleanData["matchData"].map(record => {
            temp.add(record["season"]);
        });

        this.seasons = [...temp].sort();
    }

    getSeasonWiseData() {
        
        this.seasonData = {};

        this.seasons.map(record => {
            this.seasonData[record] = [];
        });

        this.cleanData["matchData"].map(record => {
            this.seasonData[record["season"]].push(record);
        });

    }

    analyseSeasonalData() {
        
        let temp = {};
        let yearWiseTeam = {};
        let teamWins = {};
        let tempWins = {};

        this.seasons.map(record => {
            temp[record] = {};
            yearWiseTeam[record] = {};
        });

        this.seasons.map(record => {
            this.seasonData[record].map(sub_record => {
                temp[record][sub_record["winner"]] = 0;
                teamWins[sub_record["winner"]] = 0;
            });
        });

        let teamNames = this.objectFlip(dataset_processor.teamNameAsNo);

        this.seasons.map(record => {
            this.seasonData[record].map(sub_record => {
                temp[record][sub_record["winner"]]++;
                teamWins[sub_record["winner"]]++;
            });
        });

        tempWins = teamWins;
        teamWins = {};

        this.seasons.map(record => {
            _.forOwn(temp[record], (value, key) => {
                yearWiseTeam[record][(teamNames[key].includes("undefined")) ? "Draw":teamNames[key]] = value;
            }, {});
        });

        _.forOwn(tempWins, (value, key) => {
            teamWins[(teamNames[key].includes("undefined")) ? "Draw":teamNames[key]] = value;
        }, {});

        this.Analytics = yearWiseTeam;
        this.totalTeamWinCounts = teamWins;
        
    }

    getMatchDettailsAvailableCount() {
        this.matchDetailsAvailable = this.cleanData["matchData"].length;
    }

    getheaderDetails() {
        this.headersInDataset = this.cleanData["headers"];
    }

    getVenueDetails() {
        this.venue = []; 
        _.forOwn(dataset_processor.venueAsNo, (value, key) => {
            this.venue.push(key);
        }, {});
    }

    getCityDetails() {
        this.city = [];
        _.forOwn(dataset_processor.cityNameAsNo, (value, key) => {
            this.city.push(key);
        }, {});
    }

    getTeamRanking() {

        let teamWins = this.totalTeamWinCounts;
        let TeamWins = [];
        let obj = {};
        let rank = 1;

        _.forOwn(teamWins, (value, key) => {

            if (key !== 'Draw') {
                TeamWins.push({'team': key, 'wins': value});
            }

        }, {});

        TeamWins = _.sortBy(TeamWins, [function(o) { return o.wins; }]);

        for (let index = TeamWins.length - 1; index >= 0; index--) {
            obj[TeamWins[index]['team']] = rank++;
        }

        this.teamRank = obj;

    }

    objectFlip(obj) {
        const ret = {};

        Object.keys(obj).forEach((key) => {
          ret[obj[key]] = key;
        });

        return ret;
    }

    initiate() {
        this.loadCleanData();
        this.getTeamData();
        this.getSeasons();
        this.getSeasonWiseData();
        this.analyseSeasonalData();
        this.getMatchDettailsAvailableCount();
        this.getheaderDetails();
        this.getVenueDetails();
        this.getCityDetails();
        this.getTeamRanking();
    }

}

// let service = new ServiceHandler();

// console.log("Teams: ",service.team);
// console.log("Seasons: ", service.seasons);
// console.log("SeasonWiseData: ", service.seasonData);



module.exports = DataServiceHandler;