const FileHandler = require('./fileHandler');
const ModelHandler = require('./modelsHandler');
let fileHandler = new FileHandler();
let model_handler = new ModelHandler();

class ModelServiceHandler {

    constructor() {
        this.models = this.getModelsList();
        this.modelEfficiency = this.getModelEfficiency();
    }

    getModelsList() {

        let modelList = [];

        fileHandler.listAllModels().forEach(file => {
            if (file.includes("svb")) {
                modelList.push(file);
            }
        })

        return modelList;
    }

    getModelEfficiency() {
        model_handler.collectTrainingData();
        model_handler.manipulateDataForBrainJS();
        model_handler.usePreTrainedModel("svb10000");
        return model_handler.getErrorRate();
    }

    trainCustomModel(customModelRequirements){

        model_handler.initCustomModelTraining(customModelRequirements);

        return {
            status: "success"
        };

    }

    checkIfTrained(modelName) {
        return require('fs').existsSync(__dirname + `/models/${modelName}.json`) ? { "trained": true } : { "trained": false };
    }

}

module.exports = ModelServiceHandler;