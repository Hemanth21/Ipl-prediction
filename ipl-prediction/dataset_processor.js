const fs = require('fs');
const _ = require('lodash');

class DataSetProcessor {

    constructor() {
        this.dataset = fs.readFileSync("./datasets/matches.csv", 'utf-8').split("\n");
        this.headers = null;
        this.data = null;
        this.cleanData = null;
        this.teamNames = this.getTeamNamesUpdate();
        this.teamNameAsNo = this.getTeamNameAsNo();
        this.teamNoAsName = this.getTeamNoAsName();
        this.tossDecision = this.getTossDecisionAsNo();
        this.cityNameAsNo = this.getCityNameAsNo();
        this.venueAsNo = this.getVenueNameAsNo();
        this.superCleanData = null;
    }

    collectDataFromCSV() {

        this.headers = this.dataset[0].split(',');
        this.data = this.dataset.slice(1).map(record => record.split(',').reduce((current, value, index) => {
            current[this.headers[index]] = value;
            return current;
        }, {}));
        
    }

    makeReadable() {

        this.cleanData = this.data.map(record => {

            _.forOwn(record, (value, key) => {

                let tempName = this.updateTeamNames(value);

                if (tempName !== value) {
                    record[key] = tempName;
                }

                if (key === 'city') {
                    record[key] = (value == '') ? 'Dubai' : value;
                }

                // if (key === 'winner') {
                //     if (typeof value === 'undefined' | value == '') {
                //         record[key] = "Draw";
                //         console.log('found');
                //     }
                // }

                if (key === 'winner') {
                    record[key] = this.updateTeamNames(value);
                }

            });
            
            return record;

        });

    }

    cleanseData() {
        
        this.superCleanData = this.cleanData.map(record => {
            
            _.forOwn(record, (value, key) => {
                
                if (key === 'winner'){
                    record[key] = this.teamNameAsNo[value];
                }

                if (key === 'city') {
                    record[key] = this.cityNameAsNo[value];
                }

                if (key === 'toss_decision') {
                    record[key] = this.tossDecision[value];
                }

                if (key === 'toss_winner') {
                    record[key] = this.teamNameAsNo[value];
                }

                if (key === 'team1') {
                    record[key] = this.teamNameAsNo[value];
                }

                if (key === 'team2') {
                    record[key] = this.teamNameAsNo[value];
                }

                if (key === 'venue') {
                    record[key] = this.venueAsNo[value];
                }

            }, {})

            return record;

        })

    }

    updateTeamNames(inputName) {

        if(inputName in this.teamNames) {
            return this.teamNames[inputName];
        } else {
            return inputName;
        }
    }

    getTeamNamesUpdate() {

        let abbreviatedTeamNames = ['Chennai Super Kings', 'Mumbai Indians', 'Kolkata Knight Riders', 'Royal Challengers Bangalore', 'Deccan Chargers', 'Delhi Capitals', 'Rajasthan Royals', 'Delhi Daredevils', 'Gujarat Lions', 'Kings XI Punjab', 'Sunrisers Hyderabad', 'Rising Pune Supergiants', 'Rising Pune Supergiant', 'Kochi Tuskers Kerala', 'Pune Warriors'];
        let updatedTeamNames = ['CSK', 'MI', 'KKR', 'RCB', 'SRH', 'DC', 'RR', 'DC', 'GL', 'KXIP', 'SRH', 'RPS', 'RPS', 'KTK', 'RPS'];

        let obj = {};

        for(let index = 0; index < abbreviatedTeamNames.length; index++) {
            obj[abbreviatedTeamNames[index]] = updatedTeamNames[index];
        }

        return obj;
    }

    getTeamNameAsNo() {
        return {'CSK':1,'KKR':2,'RCB':3,'DC':4,'MI':5,'RR':6,'DD':7,'GL':8,'KXIP':9,'SRH':10,'RPS':11,'KTK':12,'PW':13, 'Draw':14, '' : 14, undefined:14};
    }

    getTossDecisionAsNo() {
        return {'bat': 1, 'field': 2};
    }

    getCityNameAsNo() {
        return {
                'Abu Dhabi': 1,'Ahmedabad': 2,'Bangalore': 3,'Bengaluru': 3,'Bloemfontein': 4,'Cape Town': 5,'Centurion': 6,'Chandigarh': 7,'Chennai': 8,
                'Cuttack': 9,'Delhi': 10,'Dharamsala': 11,'Dubai': 1,'Durban': 12,'East London': 13,'Hyderabad': 14,'Indore': 15,
                'Jaipur': 16,'Johannesburg': 17,'Kanpur': 18,'Kimberley': 19,'Kochi': 20,'Kolkata': 21,'Mohali': 22,'Mumbai': 23,
                'Nagpur': 24,'Port Elizabeth': 25,'Pune': 26,'Raipur': 27,'Rajkot': 28,'Ranchi': 29,'Sharjah': 30,'Visakhapatnam': 31
        };
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

    getVenueNameAsNo() {
        return {
            '"MA Chidambaram Stadium': 1,'"Punjab Cricket Association IS Bindra Stadium': 2,
            '"Punjab Cricket Association Stadium': 2,'"Rajiv Gandhi International Stadium': 3,
            '"Sardar Patel Stadium': 4,'"Vidarbha Cricket Association Stadium': 5,
            'ACA-VDCA Stadium': 6,'Barabati Stadium': 7,
            'Brabourne Stadium': 8,'Buffalo Park': 9,
            'De Beers Diamond Oval': 10,'Dr DY Patil Sports Academy': 11,
            'Dr. Y.S. Rajasekhara Reddy ACA-VDCA Cricket Stadium': 12,'Dubai International Cricket Stadium': 13,
            'Eden Gardens': 14,'Feroz Shah Kotla': 15,
            'Feroz Shah Kotla Ground': 15,'Green Park': 16,
            'Himachal Pradesh Cricket Association Stadium': 17,'Holkar Cricket Stadium': 18,
            'IS Bindra Stadium': 19,'JSCA International Stadium Complex': 20,
            'Kingsmead': 21,'M Chinnaswamy Stadium': 22,
            'M. A. Chidambaram Stadium': 1,'M. Chinnaswamy Stadium': 22,
            'Maharashtra Cricket Association Stadium': 23,'Nehru Stadium': 24,
            'New Wanderers Stadium': 25,'Newlands': 26,
            'OUTsurance Oval': 27,'Rajiv Gandhi Intl. Cricket Stadium': 3,
            'Saurashtra Cricket Association Stadium': 28,'Sawai Mansingh Stadium': 29,
            'Shaheed Veer Narayan Singh International Stadium': 30,'Sharjah Cricket Stadium': 31,
            'Sheikh Zayed Stadium': 32,'St George\'s Park': 33,
            'Subrata Roy Sahara Stadium': 34,'SuperSport Park': 35,
            'Wankhede Stadium': 36
        };
    }

    writeToFile() {

        let fileData = {
            "headers": this.headers,
            "teamNames": this.teamNames,
            "teamNameAsNo": this.teamNameAsNo,
            "matchData": this.superCleanData
        };

        fs.writeFileSync("./cleansedData/cleanData.json", JSON.stringify(fileData));

    }

    getTrainableData() {

        this.collectDataFromCSV();
        this.makeReadable();
        this.cleanseData();

        return this.superCleanData;
    }

    getOnlyRequiredField(data, fields) {
        return data.map(record => _.pick(record, fields));
    }

}

module.exports = DataSetProcessor;

// let datasetProcess = new DataSetProcessor();
// datasetProcess.collectDataFromCSV();
// datasetProcess.makeReadable();
// datasetProcess.cleanseData();
// datasetProcess.writeToFile();

// console.log(datasetProcess.cleanData);

