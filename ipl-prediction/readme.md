IPL Match Prediction - Calculo-alpha Server
===========================

Calculo is powered by Node.js and writen purely in JavaScript.


#### Important Node Modules Used
--------------------------------
+ [Brain.js](https://www.npmjs.com/package/brain.js)
+ [Express](https://www.npmjs.com/package/express)
+ [Lodash](https://www.npmjs.com/package/lodash)

#### Little Bit Explanation
---------------------------
1. Neural Networks are used for prediction.
2. Recurrent Neural Network is tried in for prediction, but results are not great.
3. This project is nearly made like a node module for data normalization and training for future data about IPL matches.
4. ML and Data Analytics in JS is still in ealy stages, in-order to showcase them, I have made this project.

#### Neural Networks Used
-------------------------

+ Long Short Term Memory (LSTM) with TimeStep Neural Network
+ Convolutional Neural Network

#### API Endpoints availabe in this Server
---------------

+ Data Set or Data Analytics related Endpoints
  ----------
    + [/dataset/allTeams](https://calculo-alpha.herokuapp.com/dataset/allTeams) 
      
       returns list of teams available in data set

    + [/dataset/totalWins](https://calculo-alpha.herokuapp.com/dataset/totalWins)
     
       returns total no of matches won by each team
       
    + [/dataset/analyseByYear](https://calculo-alpha.herokuapp.com/dataset/analyseByYear)
  
       returns matches won by each team at a specified year
       
    + [/dataset/analyse](https://calculo-alpha.herokuapp.com/dataset/analyse)

       returns list of teams match data

    + [/dataset/headers](https://calculo-alpha.herokuapp.com/dataset/headers)
     
       returns list of headers in data set
       
    + [/dataset/matchDetailsCount](https://calculo-alpha.herokuapp.com/dataset/matchDetailsCount)
  
       returns total match data available in data set 
       
    + [/dataset/venue](https://calculo-alpha.herokuapp.com/dataset/venue)

       returns list of venues available in data set
       
    + [/dataset/city](https://calculo-alpha.herokuapp.com/dataset/city)

       returns list of cities available in data set
       
    + [/dataset/csv](https://calculo-alpha.herokuapp.com/dataset/csv)

       returns a blob of data set as CSV file
       
    + [/dataset/json](https://calculo-alpha.herokuapp.com/dataset/json)
  
       returns a blob of data set cleaned in Calculo server as JSON file

+ Prediction related Endpoints
    ------------

    + [/predict/OneVsOne](https://calculo-alpha.herokuapp.com/predict/OneVsOne)

        returns a prediction of which team wins in when provided with two teams data in Post Request

    + [/predict/Seasonal](https://calculo-alpha.herokuapp.com/predict/Seasonal)

        returns a Play-Off eligible teams when entire match making data is provided in Post Request

    + [/predict/seasonalWins](https://calculo-alpha.herokuapp.com/predict/seasonalWins)

        returns a list of predicted Seasonal Wins data

    + [/predict/analytics](https://calculo-alpha.herokuapp.com/predict/analytics)

        returns a list of predicted Seasonal Analytics data

+ Models related Endpoints
    ----
    + [/models/listAll](https://calculo-alpha.herokuapp.com/models/listAll)

        returns a list of all models trained with calculo alpha team

    + [/models/efficiency](https://calculo-alpha.herokuapp.com/models/efficiency)

        return Efficiency stats of main model of Alpha Brain engine

    + [/models/trainCustom](https://calculo-alpha.herokuapp.com/models/trainCustom)   

        used to train a custom model of Neural net based on inputs in Post Request

    + [/models/checkIfTrained](https://calculo-alpha.herokuapp.com/models/checkIfTrained)

        return true if custom model is trained 

    + [/models/downloadModel](https://calculo-alpha.herokuapp.com/models/downloadModel)

        return a blob of custom trained model

#### Steps to start the Server
------------------------------

```
// To enter the server directory
cd calculo

// To install all the required node modules
npm install

// To start server, by default it uses Port 8080
npm start
```

----------------
#### Demo Server
----------------
[Calculo alpha App](https://calculo-alpha.herokuapp.com)

###### Still things are getting a proper shape, so stay tuned for better version

----------------

#### Disclaimer
----------------
Unlike others, who use python and other libraries which are built and made so much better year by year. We took a new trial approach to predict IPL match outcomes with JavaScript. Please stay tuned for even more accuracy in predictions.
