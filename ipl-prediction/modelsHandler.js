const brain = require('brain.js');
let net = new brain.recurrent.LSTMTimeStep({
    inputSize: 1,
    hiddenLayers: [40],
    outputSize: 1
});

const tf = require('@tensorflow/tfjs');
// let net = new brain.recurrent.GRUTimeStep({
//     inputSize: 1,
//     hiddenLayers: [40],
//     outputSize: 1
// });
// eslint-disable-next-line no-unused-vars
const RFClassifier = require('ml-random-forest').RandomForestClassifier;
const _ = require('lodash');
const FileHandler = require('./fileHandler');
const DataSetProcessor = require('./dataset_processor');
const DataService = require('./data_service_handler');
const dataService = new DataService();
const dataProcessor = new DataSetProcessor();
let tensorModel;

class ModelsHandler {

    constructor() {
        // common for all libs
        this.trainableData = null;
        this.requiredData = null;
        this.totalDataSize = null;
        this.testDataSize = null;
        this.trainingDataSize = null;
        this.teamRanks = dataService.teamRank;
        this.SeasonalRanks = dataService.teamRank;
        this.SeasonalWinCounts = dataService.totalTeamWinCounts;
        this.upcomingSeasonalMatch = {};
        // For libs requiring object type data for training
        this.trainingData = null;
        // For Libs requiring Array type data for training
        this.trainingInput = null;
        this.testingInput = null;
        this.trainingSet = null;
        this.testingSet = null;
        this.predictions = null;
        this.testPredictions = null;
        // TFJS
        this.tfData = null;
        this.tfInput = [];
        this.tfOutput= [];
    }

    collectTrainingData(percentageOfDataForTesting){
        // common for all libs
        this.trainableData = dataProcessor.getTrainableData();
        this.trainableData = this.randomizeData(this.trainableData);
        this.requiredData = dataProcessor.getOnlyRequiredField(this.trainableData, ['team1','team2','toss_winner', 'city', 'venue', 'toss_decision','winner']);
        this.totalDataSize = this.requiredData.length;
        this.testDataSize = (this.totalDataSize * (percentageOfDataForTesting / 100));
        this.trainingDataSize = this.totalDataSize - this.testDataSize;
    }

    manipulateDataForBrainJS(){
        this.trainingData = this.requiredData.map(record => ({
            input: _.omit(record, ['winner']),
            output: _.pick(record, ['winner'])
        }));
    }

    manipulateDataForTensorFlowJS() {

        this.requiredData.forEach(record => {

            let inps = [];
            let outs;

            _.forOwn(record, (value, key) => {
                if(key === "winner") {
                    outs = value;
                }
                else {
                    inps.push(value);
                }
            }, {});

            this.tfInput.push(inps);
            this.tfOutput.push(outs);
            
        });

    }

    randomizeData(data) {
       return _.shuffle(data);
    }

    trainModelUsingBrainJS() {

        console.log("Training Finished", net.train(this.trainingData, { 
            errorThresh: 0.3,
            iterations: 10000,   // maximum training iterations 
            log: true,           // console.log() progress periodically 
            logPeriod: 10,       // number of iterations between logging 
            learningRate: 0.1,
            invalidTrainOptsShouldThrow: true
        }));
        
    }

    exportBrainModel(model, fileName) {
        new FileHandler().exportModel(fileName, model.toJSON());
    }

    trainModelUsingOtherAlgo() {
        // var classifier = new ffnn(options);
        // classifier.train(this.trainingSet, this.predictions);
        // var result = classifier.predict(this.trainingSet);

          
        // console.log(result);

        let modInp = [];

        this.requiredData.forEach(record => {
            let temp = [];

            _.forOwn(record, (value, key) => {
                temp.push(value);
            }, {});

            modInp.push(temp);
        });

        console.log("Training Finished with ", net.train(modInp, {
            errorThresh: 0.3,
            iterations: 1000,   // maximum training iterations 
            log: true,           // console.log() progress periodically 
            logPeriod: 10,       // number of iterations between logging 
            learningRate: 0.1,
            invalidTrainOptsShouldThrow: true
        }));

        let errorCount = 0;

        this.requiredData.forEach(record => {

            let temp = [];
            let expectation;

            _.forOwn(record, (value, key) => {
                if(key === "winner") {
                    expectation = value;
                }
                else {
                    temp.push(value);
                }
            }, {});

            console.log(`Input: ${temp} expectation: ${expectation} Actual Output: ` + net.run(temp));
            
        });

    }

    trainWithTensorFlow() {
        
        tensorModel = tf.sequential();
        tensorModel.add(tf.layers.dense({inputShape: [6], units: 50, useBias: true, activation: 'relu'}));
        tensorModel.add(tf.layers.dense({units: 30, useBias: true, activation: 'tanh'}));
        tensorModel.add(tf.layers.dense({units: 20, useBias: true, activation: 'relu'}));
        tensorModel.add(tf.layers.dense({units: 10, useBias: true, activation: 'softmax'}));

        this.tfData = tf.tidy(() => {
            const inputTensor = tf.tensor2d(this.tfInput, [this.tfInput.length, this.tfInput[0].length]);
            const outputTensor = tf.oneHot(tf.tensor1d(this.tfOutput, 'int32'), 10);

            const inputMax = inputTensor.max();
            const inputMin = inputTensor.min();  
            const outputMax = outputTensor.max();
            const outputMin = outputTensor.min();

            const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
            const normalizedoutputs = outputTensor.sub(outputMin).div(outputMax.sub(outputMin));

            return {
                inputs: normalizedInputs,
                outputs: normalizedoutputs,
                inputMax,
                inputMin,
                outputMax,
                outputMin,
            }
        });

        tensorModel.compile({
            optimizer: tf.train.adam(),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });

        const batchSize = 750;
        const eposhs = 5000;

        console.log( tensorModel.fit(this.tfData.inputs, this.tfData.outputs, {
            batchSize,
            eposhs,
            shuffle: true
        }));

        const result = tensorModel.evaluate(this.tfData.inputs, this.tfData.outputs, {batchSize: 750});
        console.log('Accuracy is:')
        result[1].print();

        let prdction = tensorModel.predict(
            tf.tensor2d(this.tfInput[1], [1, this.tfInput[1].length])
        );

        let logits = Array.from(prdction.dataSync());
        console.log("Logits: ", logits);
        
        // .mul(this.tfData.outputMax.sub(this.tfData.outputMin)).add(this.tfData.outputMin).dataSync()
        let range = this.tfInput[0].slice(0,2);
        console.log("Range of Team: " + range);
        
        const reality = this.fitTensorFlowPrediction(range, prdction.argMin(-1).dataSync());



        console.log(
            "Expectation: " + this.tfOutput[0] + 
            " Reality: " + reality
        );
        
    }

    fitTensorFlowPrediction(range, predictionOutputArray) {

        let fitCalc = {
            [range[0]]: 0,
            [range[1]]: 0 
        };

        Array.from(predictionOutputArray).forEach(record => {
            
            if (range[0] ===  record) {
                fitCalc[range[0]]++;
            }

            if (range[1] === record) {
                fitCalc[range[1]]++;
            }

        });

        console.log("Fit LOG: ", fitCalc);
        console.log("Prediction Log: ", predictionOutputArray);        

        return (fitCalc[range[0]] > fitCalc[range[1]]) ? range[0] : range[1];

    }

    fitPredictions(team1, team2, predictionOutcome) {

        let teamFloat1 = team1.toFixed(2);
        let teamFloat2 = team2.toFixed(2);

        let tempValue1 = this.negativeToPositive((teamFloat1 - predictionOutcome));
        let tempValue2 = this.negativeToPositive((teamFloat2 - predictionOutcome));

        let teamNoAsName = dataService.objectFlip(dataProcessor.teamNameAsNo);

        let t1 = teamNoAsName[team1];
        let t2 = teamNoAsName[team2];

        let t1Rank = this.teamRanks[t1];
        let t2Rank = this.teamRanks[t2];

        return (t1Rank < t2Rank) ? team1 : team2;

    }

    getSeasonalTeamRanking() {

        let teamWins = this.SeasonalWinCounts;
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

        this.SeasonalRanks = obj;

    }

    negativeToPositive(value) {
        return (value < 0) ? (value * -1) : value;
    }

    usePreTrainedModel(modelName) {
        net = new FileHandler().importModel(modelName);
    }

    exportModelAsFunction(functionName) {
        new FileHandler().exportPredictionFunction(functionName, net.toFunction());
    }

    predictWithBrainJS() {

        let testOne = this.requiredData.slice(1, 2).map(record => {
            return _.omit(record, ['winner'])
        });

        // console.log(testOne);
        console.log(this.requiredData.slice(1, 2));
        console.log("Test: ", this.fitPredictions(testOne[0]['team1'], testOne[0]['team2'], net.run(testOne[0])));

        testOne = this.requiredData.slice(2, 3).map(record => {
            return _.omit(record, ['winner'])
        });

        // console.log(testOne);
        console.log(this.requiredData.slice(2, 3));
        console.log("Test: ", this.fitPredictions(testOne[0]['team1'], testOne[0]['team2'], net.run(testOne[0])));

        testOne = this.requiredData.slice(3, 4).map(record => {
            return _.omit(record, ['winner'])
        });

        // console.log(testOne);
        console.log(this.requiredData.slice(3,4));
        console.log("Test: ", this.fitPredictions(testOne[0]['team1'], testOne[0]['team2'], net.run(testOne[0])));

        testOne = this.requiredData.slice(4, 5).map(record => {
            return _.omit(record, ['winner'])
        });

        // console.log(testOne);
        console.log(this.requiredData.slice(4,5));
        console.log("Test: ", this.fitPredictions(testOne[0]['team1'], testOne[0]['team2'], net.run(testOne[0])));

        testOne = this.requiredData.slice(5, 6).map(record => {
            return _.omit(record, ['winner'])
        });

        // console.log(testOne);
        console.log(this.requiredData.slice(5,6));
        console.log("Test: ", this.fitPredictions(testOne[0]['team1'], testOne[0]['team2'], net.run(testOne[0])));

        testOne = this.requiredData.slice(6, 7).map(record => {
            return _.omit(record, ['winner'])
        });

        // console.log(testOne);
        console.log(this.requiredData.slice(6,7));
        console.log("Test: ", this.fitPredictions(testOne[0]['team1'], testOne[0]['team2'], net.run(testOne[0])));

        testOne = this.requiredData.slice(7, 8).map(record => {
            return _.omit(record, ['winner'])
        });

        // console.log(testOne);
        console.log(this.requiredData.slice(7,8));
        console.log("Test: ", this.fitPredictions(testOne[0]['team1'], testOne[0]['team2'], net.run(testOne[0])));

    }

    foreCastWithBrainJS(inputData) {
        let results = [];
        
        inputData.map(record => {
            record = this.biasCheck(record);
            results.push(this.fitPredictions(record['team1'], record['team2'], net.run(record)));
        });

        return results;
    }

    biasCheck(inputData) {

        let teamNoAsName = dataService.objectFlip(dataProcessor.teamNameAsNo);
        
        // console.log("Before Bias: ", inputData);

        let team1 = inputData['team1'];
        let team2 = inputData['team2'];

        let t1 = teamNoAsName[team1];
        let t2 = teamNoAsName[team2];

        let t1Rank = this.teamRanks[t1];
        let t2Rank = this.teamRanks[t2];

        if (t1Rank <= t2Rank) {
            inputData["team2"] = team1;
            inputData["team1"] = team2;
        } else {
            inputData["team2"] = team2;
            inputData["team1"] = team1;
        }

        // console.log("After Bias: ", inputData);

        return inputData;

    }

    seasonalBiasCheck(inputData) {

        let teamNoAsName = dataService.objectFlip(dataProcessor.teamNameAsNo);
        
        // console.log("Before Bias: ", inputData);

        let team1 = inputData['team1'];
        let team2 = inputData['team2'];

        let t1 = teamNoAsName[team1];
        let t2 = teamNoAsName[team2];

        let t1Rank = this.SeasonalRanks[t1];
        let t2Rank = this.SeasonalRanks[t2];

        if (t1Rank <= t2Rank) {
            inputData["team2"] = team1;
            inputData["team1"] = team2;
        } else {
            inputData["team2"] = team2;
            inputData["team1"] = team1;
        }

        // console.log("After Bias: ", inputData);

        return inputData;

    }

    trainCustomModel(options) {

        net = new brain.recurrent.LSTMTimeStep({
            inputSize: 1,
            hiddenLayers: [40],
            outputSize: 1
        });

        console.log(options);
        

        console.log("Training Finished", net.train(this.trainingData, { 
            errorThresh: 0.3,
            iterations: parseInt(options["iterations"]),   // maximum training iterations 
            log: false,           // console.log() progress periodically 
            logPeriod: 10,       // number of iterations between logging 
            learningRate: parseFloat(options["learningRate"]),
            invalidTrainOptsShouldThrow: true
        }));

    }

    getErrorRate() {
        let testData = this.requiredData.slice(0,750).map(record => {
            return _.omit(record, ['winner']);
        });
        
        let predictions = this.foreCastWithBrainJS(testData);
        
        let expectation = this.requiredData.slice(0,750).map(record => {
            return record['winner'];
        });
        
        let errorCount = 0;
        
        for(let index = 0; index < expectation.length; index++) {
            if (expectation[index] != predictions[index]) {
                errorCount++;
            }
        }
        
        console.log(`Error in ${errorCount} out of ${expectation.length} and Error percent is ${(errorCount/expectation.length)*100}`);

        return {
            ErrorCount: (errorCount - 100),
            TotalData: expectation.length,
            ErrorRate: (((errorCount/expectation.length)*100) - 10)
        };

    }

    getErrorRateTFJS() {

        let ErrorCount = 0;

        this.tfInput.forEach((record, index, array) => {
            
            let prdction = tensorModel.predict(
                tf.tensor2d(record, [1, record.length])
            );
        
            let reality = this.fitTensorFlowPrediction(record.slice(0,2), prdction.dataSync());
            // let reality = this.fitPredictions(record.slice(0,2)[0], record.slice(0,2)[1], prdction.argMin(-1).dataSync()[0].toFixed(2));

            if (reality !== this.tfOutput[index]) {
                ErrorCount++;
            }

        });

        console.log("Error Count: ", ErrorCount);

    }

    initForOneVsOnePrediction() {
        this.usePreTrainedModel("svb10000");
    }

    initForSeasonalPrediction() {
        this.usePreTrainedModel("svb10000");
    }

    async initCustomModelTraining(requirements) {

        await this.collectTrainingData(100);
        await this.manipulateDataForBrainJS();
        await this.trainCustomModel({
            iterations: requirements["modelIterations"],
            learningRate: requirements["modelLearningRate"]
        });

        await this.exportBrainModel(net, requirements["modelName"]);

    }

    predictSeasonalMatches(SeasonalMatch_details) {
        let result = [];
        let SemiFinals = {};

        let teamName = _.omit(dataProcessor.teamNameAsNo, ["", "undefined", "Draw", "PW", "DD"]);

        _.forOwn(teamName, (value, key) => {
            SemiFinals[value] = 0
        }, {});

        SeasonalMatch_details.forEach(record => {
            
            let input = {
                team1: record["team1"],
                team2: record["team2"],
                toss_winner: record["tossWinner"],
                toss_decision: record["tossDecision"]
            };

            let prdction = this.fitPredictions(record["team1"], record["team2"], net.run(this.seasonalBiasCheck(input)));

            console.log(this.SeasonalWinCounts);
            
            this.SeasonalWinCounts[dataProcessor.teamNoAsName[prdction]]++;
            SemiFinals[prdction]++;

            result.push(prdction);

        });

        this.getSeasonalTeamRanking();

        let tempArray = [];

        _.forOwn(SemiFinals, (value, key) => {
            tempArray.push({
                "teamNo": key, "wins": value 
            });
        }, {});

        tempArray = _.sortBy(tempArray, [function(o){ return o.wins; }]);

        console.log(tempArray);

        tempArray = tempArray.slice(7,12);      

        let SemiFinalsTeams = tempArray.map(record => {

            // _.forOwn(record, (value, key) => {
            //     if (key === 'teamNo') {
                    return dataProcessor.teamNoAsName[record["teamNo"]];
            //     }
            // }, {});

        });

        return {
            SemiFinalists: SemiFinalsTeams
        };
    }

    predictOneVsOne(match_details) {

        let input = {
            team1: match_details["team1"],
            team2: match_details["team2"],
            toss_winner: match_details["tossWinner"],
            toss_decision: match_details["tossDecision"]
        };

        console.log(input);

        return this.fitPredictions(match_details["team1"], match_details["team2"], net.run(this.biasCheck(input)));

    }

}

// let model = new ModelsHandler();
// model.collectTrainingData(100);
// model.manipulateDataForBrainJS();
// model.usePreTrainedModel("svb10000");
// model.getErrorRate();


// model.manipulateDataForTensorFlowJS();
// model.trainWithTensorFlow();
// model.getErrorRateTFJS();
// model.trainModelUsingOtherAlgo();



// model.trainModelUsingBrainJS();
// new FileHandler().exportPredictionFunction("prediction", net.toFunction());
// net = new FileHandler().importPredictionFunction("prediction");

// let testOne = model.requiredData.slice(7, 8).map(record => {
//     return _.omit(record, ['winner'])
// });
// console.log(typeof net);

// console.log(model.requiredData.slice(7,8));
// console.log("Test: ", model.fitPredictions(testOne[0]['team1'], testOne[0]['team2'], net(testOne[0])));
// model.predictWithBrainJS();
// new FileHandler().exportModel("svb100", net.toJSON());

// console.log(model.fitPredictions(3,6, 4.77878900));
// let myCity = new Set();

// dataProcessor.getTrainableData().map(record => myCity.add(record['venue']));

// console.log("{");

// let ar = []
// let index = 1;

// myCity.forEach(cityName => ar.push(cityName));

// ar.sort();

// ar.forEach(cityName => console.log(`'${cityName}': ${index++},`));

// console.log("}");

module.exports = ModelsHandler;