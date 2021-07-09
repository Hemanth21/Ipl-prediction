const brain = require('brain.js');
const net = new brain.NeuralNetwork();
const _ = require('lodash');
const fs = require('fs');

const raw = fs.readFileSync('./datasets/winequality-white.csv', 'utf-8').split('\n');
const headers = raw[0].split(';').map(header => header.replace(/"/g, ''));

const data = raw.slice(1).map(line => line.split(';').reduce((cur, v, i) => {

    if(headers[i].includes('sulfur') || headers[i].includes('sugar')) {
        cur[headers[i]] = parseFloat(v) / 1000;
    } else if(headers[i].includes('alcohol')) {
        cur[headers[i]] = parseFloat(v) / 1000;
    } else {
        cur[headers[i]] = parseFloat(v) / 10;
    }

    return cur;

}, {}));

const numTrainData = 1000;

const trainingData = data.slice(0, numTrainData).map(obj => ({
    input: _.omit(obj, ['quality']),
    output: _.pick(obj, ['quality'])
}));

console.log(trainingData[0]);
console.log('done training', net.train(trainingData));
console.log("DataSet Length: " + data.length);
console.log("test: " + net.run(data[3000]).toString())

