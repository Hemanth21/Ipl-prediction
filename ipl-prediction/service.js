const FileHandler = require('./fileHandler');
const ModelHandler = require('./modelsHandler');
const DataSetProcessor = require('./dataset_processor');
const DataServiceHandler = require('./data_service_handler');
const PredictionServiceHandler = require('./prediction_service_handler');
const ModelServiceHandler = require('./models_service_handler');

let fileHandler = new FileHandler();
let dataset_processor = new DataSetProcessor();
let model_handler = new ModelHandler();
let DataServiceManager = new DataServiceHandler();
let PredictionServiceManager = new PredictionServiceHandler();
let ModelServiceManger = new ModelServiceHandler();


class EndpointService {

    constructor(restControl) {
        this.restControl = restControl;

        // Data from Model Handler

        // Data from dataset handler
        this.city = null;
        this.year = null;
        this.team = null;
        this.venue = null;
        this.season = null;
        // Data from file handler
    }

    enableTestEndpoint() {
        this.restControl.get("/ping", (req, res) => {
            res.send("Server is Alive :)");
        });
    }

    enableDatasetEndpoints() {

        this.restControl.get("/dataset/allTeams", (req, res) => {
            res.send(DataServiceManager.team);
        });

        this.restControl.get("/dataset/totalWins", (req, res) => {
            res.send(DataServiceManager.totalTeamWinCounts);
        });

        this.restControl.get("/dataset/analyseByYear", (req, res) => {
            res.send(DataServiceManager.Analytics[req.query.year]);
        });

        this.restControl.get("/dataset/analyse", (req, res) => {
            res.send(DataServiceManager.Analytics);
        });

        this.restControl.get("/dataset/headers", (req, res) => {
            res.send(DataServiceManager.headersInDataset);
        });

        this.restControl.get("/dataset/matchDetailsCount", (req, res) => {
            res.send(DataServiceManager.matchDetailsAvailable + "");
        });

        this.restControl.get("/dataset/venue", (req, res) => {
            res.send(DataServiceManager.venue);
        });

        this.restControl.get("/dataset/city", (req, res) => {
            res.send(DataServiceManager.city);
        });

        this.restControl.get("/dataset/csv", (req, res) => {
            res.sendFile(__dirname + "/datasets/svbDataset.csv");
        });

        this.restControl.get("/dataset/json", (req, res) => {
            res.sendFile(__dirname + "/cleansedData/cleanData.json");
        });

    }

    enablePredictionEndpoints() {

        this.restControl.post("/predict/OneVsOne", (req, res) => {
            res.send({
                "winner": `${PredictionServiceManager.predictOneVsOne(req.body)}`
            });
        });

        this.restControl.post("/predict/Seasonal", (req, res) => {
            res.send({
                "predictions": PredictionServiceManager.predictSeasonalMatches(req.body)
            });
        });

        this.restControl.get("/predict/seasonalWins", (req, res) => {
            res.send(PredictionServiceManager.SeasonalWins());
        });

        this.restControl.get("/predict/analytics", (req, res) => {
            res.send(PredictionServiceManager.analytics());
        });

    }

    enableModelsEndpoints() {

        this.restControl.get("/models/listAll", (req, res) => {
            res.send(ModelServiceManger.models);
        });

        this.restControl.get("/models/efficiency", (req, res) => {
            res.send(ModelServiceManger.modelEfficiency);
        });

        this.restControl.post("/models/trainCustom", (req, res) => {
            res.send(ModelServiceManger.trainCustomModel(req.body))
        });

        this.restControl.post("/models/checkIfTrained", (req, res) => {            
            res.send(ModelServiceManger.checkIfTrained(req.body["modelName"]));
        });

        this.restControl.post("/models/downloadModel", (req, res) => {
            res.sendFile(__dirname + `/models/${req.body["modelName"]}.json`);
        });

        this.restControl.post("/models/downloadOurModel", (req, res) => {
            res.sendFile(__dirname + `/models/${req.body["modelName"]}`);
        });

    }

    enableAboutEndpoints() {

        this.restControl.get("/about/web", (req, res) => {
            res.sendFile(__dirname + "/calculo.md");
        });

        this.restControl.get("/about/backend", (req, res) => {
            res.sendFile(__dirname + "/readme.md");
        });

    }

}


module.exports = EndpointService;