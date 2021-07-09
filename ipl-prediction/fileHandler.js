const fs = require('fs');

class FileHandler {

    constructor(){

    }

    convertToCSV(objArray) {
        var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
        var str = '';
    
        for (var i = 0; i < array.length; i++) {
            var line = '';
            for (var index in array[i]) {
                if (line != '') line += ','
    
                line += array[i][index];
            }
    
            str += line + '\r\n';
        }
    
        return str;
    }
    
    exportCSVFile(headers, items, fileTitle) {
        if (headers) {
            items.unshift(headers);
        }
    
        // Convert Object to JSON
        var jsonObject = JSON.stringify(items);
    
        var csv = this.convertToCSV(jsonObject);
        
        fs.writeFileSync("./models/" + fileTitle + ".csv", Buffer.from(Uint8Array([csv])));

    }

    exportPredictionFunction(fileName, functionCode) {
        fs.writeFileSync(`./standaloneFunctions/${fileName}.js`, functionCode.toString() + "\n module.exports.run = anonymous;");
    }

    importPredictionFunction(fileName) {
        return require('./standaloneFunctions/' + fileName);
    }
    
    exportModel(fileName, modelJSON) {
        fs.writeFileSync("./models/" + fileName + ".json", JSON.stringify(modelJSON, null, '  '));
    }

    importModel(modelName) {
        let func = require('./standaloneFunctions/trainedModelLSTM');
        func.addModel(modelName);
        return func;
    }

    importModelAsJSON(modelName) {
        return JSON.parse(fs.readFileSync("./models/" + modelName + ".json", 'utf-8'));
    }

    listAllModels() {
        return fs.readdirSync("./models");
    }

}

module.exports = FileHandler;