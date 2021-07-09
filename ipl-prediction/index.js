const express = require('express');
const compression = require('compression');
const app = express();
const bodyparser = require('body-parser');
const EndPointService = require('./service');

app.use(compression());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));
app.use(express.static('public'));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

let service = new EndPointService(app);
service.enableTestEndpoint();
service.enableDatasetEndpoints();
service.enablePredictionEndpoints();
service.enableModelsEndpoints();
service.enableAboutEndpoints();

let server = app.listen(process.env.PORT || 8080, () => {
    console.log("Calculo is up and running on port ", server.address().port);
});