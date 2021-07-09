var json = null;

function anonymous(rawInput
) {

  var input = lookupInput(rawInput);
  var output = [];
  var states = [];
  var prevStates;
  var state;
  var max = input.length + 0;
  for (var _i = 0; _i < max; _i++) {
    prevStates = states;
    states = [];
    states[0] = {
      name: 'forwardFn',
      left: null,
      right: null,
      product: new Matrix(1, 1)
    };
    states[1] = {
      name: 'multiply',
      left: json.hiddenLayers[0].inputMatrix,
      right: states[0].product,
      product: new Matrix(40, 1)
    };
    states[2] = {
      name: 'multiply',
      left: json.hiddenLayers[0].inputHidden,
      right: typeof prevStates[25] === 'object' ? prevStates[25].product : new Matrix(40, 1),
      product: new Matrix(40, 1)
    };
    states[3] = {
      name: 'add',
      left: states[1].product,
      right: states[2].product,
      product: new Matrix(40, 1)
    };
    states[4] = {
      name: 'add',
      left: states[3].product,
      right: json.hiddenLayers[0].inputBias,
      product: new Matrix(40, 1)
    };
    states[5] = {
      name: 'sigmoid',
      left: states[4].product,
      right: null,
      product: new Matrix(40, 1)
    };
    states[6] = {
      name: 'multiply',
      left: json.hiddenLayers[0].forgetMatrix,
      right: states[0].product,
      product: new Matrix(40, 1)
    };
    states[7] = {
      name: 'multiply',
      left: json.hiddenLayers[0].forgetHidden,
      right: states[2].right,
      product: new Matrix(40, 1)
    };
    states[8] = {
      name: 'add',
      left: states[6].product,
      right: states[7].product,
      product: new Matrix(40, 1)
    };
    states[9] = {
      name: 'add',
      left: states[8].product,
      right: json.hiddenLayers[0].forgetBias,
      product: new Matrix(40, 1)
    };
    states[10] = {
      name: 'sigmoid',
      left: states[9].product,
      right: null,
      product: new Matrix(40, 1)
    };
    states[11] = {
      name: 'multiply',
      left: json.hiddenLayers[0].outputMatrix,
      right: states[0].product,
      product: new Matrix(40, 1)
    };
    states[12] = {
      name: 'multiply',
      left: json.hiddenLayers[0].outputHidden,
      right: states[2].right,
      product: new Matrix(40, 1)
    };
    states[13] = {
      name: 'add',
      left: states[11].product,
      right: states[12].product,
      product: new Matrix(40, 1)
    };
    states[14] = {
      name: 'add',
      left: states[13].product,
      right: json.hiddenLayers[0].outputBias,
      product: new Matrix(40, 1)
    };
    states[15] = {
      name: 'sigmoid',
      left: states[14].product,
      right: null,
      product: new Matrix(40, 1)
    };
    states[16] = {
      name: 'multiply',
      left: json.hiddenLayers[0].cellActivationMatrix,
      right: states[0].product,
      product: new Matrix(40, 1)
    };
    states[17] = {
      name: 'multiply',
      left: json.hiddenLayers[0].cellActivationHidden,
      right: states[2].right,
      product: new Matrix(40, 1)
    };
    states[18] = {
      name: 'add',
      left: states[16].product,
      right: states[17].product,
      product: new Matrix(40, 1)
    };
    states[19] = {
      name: 'add',
      left: states[18].product,
      right: json.hiddenLayers[0].cellActivationBias,
      product: new Matrix(40, 1)
    };
    states[20] = {
      name: 'tanh',
      left: states[19].product,
      right: null,
      product: new Matrix(40, 1)
    };
    states[21] = {
      name: 'multiplyElement',
      left: states[10].product,
      right: states[2].right,
      product: new Matrix(40, 1)
    };
    states[22] = {
      name: 'multiplyElement',
      left: states[5].product,
      right: states[20].product,
      product: new Matrix(40, 1)
    };
    states[23] = {
      name: 'add',
      left: states[21].product,
      right: states[22].product,
      product: new Matrix(40, 1)
    };
    states[24] = {
      name: 'tanh',
      left: states[23].product,
      right: null,
      product: new Matrix(40, 1)
    };
    states[25] = {
      name: 'multiplyElement',
      left: states[15].product,
      right: states[24].product,
      product: new Matrix(40, 1)
    };
    states[26] = {
      name: 'multiply',
      left: json.outputConnector,
      right: states[25].product,
      product: new Matrix(1, 1)
    };
    states[27] = {
      name: 'add',
      left: states[26].product,
      right: json.output,
      product: new Matrix(1, 1)
    };
    for (var stateIndex = 0, stateMax = 28; stateIndex < stateMax; stateIndex++) {
      state = states[stateIndex];
      var product = state.product;
      var left = state.left;
      var right = state.right;
      
      switch (state.name) {
        case 'forwardFn':
          
                  product.weights = _i < input.length ? input[_i]: prevStates[prevStates.length - 1].product.weights;
                
          break;
        case 'multiply': //compiled from src/recurrent/matrix/multiply.js
          
          var leftRows = left.rows;
          var leftColumns = left.columns;
          var rightColumns = right.columns;
        
          // loop over rows of left
          for (var leftRow = 0; leftRow < leftRows; leftRow++) {
            var leftRowBase = leftColumns * leftRow;
            var rightRowBase = rightColumns * leftRow;
            // loop over cols of right
            for (var rightColumn = 0; rightColumn < rightColumns; rightColumn++) {
        
              // dot product loop
              var dot = 0;
              //loop over columns of left
              for (var leftColumn = 0; leftColumn < leftColumns; leftColumn++) {
                var rightColumnBase = rightColumns * leftColumn;
                var leftIndex = leftRowBase + leftColumn;
                var rightIndex = rightColumnBase + rightColumn;
                dot += left.weights[leftIndex] * right.weights[rightIndex];
                
                
              }
              product.weights[rightRowBase + rightColumn] = dot;
            }
          }
        
          break;
        case 'add': //compiled from src/recurrent/matrix/add.js
          
          for (var i = 0; i < left.weights.length; i++) {
            product.weights[i] = left.weights[i] + right.weights[i];
            
          }
        
          break;
        case 'sigmoid': //compiled from src/recurrent/matrix/sigmoid.js
          
          // sigmoid nonlinearity
          for (var i = 0; i < left.weights.length; i++) {
            product.weights[i] = 1 / (1 + Math.exp(-left.weights[i]));
            
          }
        
          break;
        case 'tanh': //compiled from src/recurrent/matrix/tanh.js
          
          // tanh nonlinearity
          for (var i = 0; i < left.weights.length; i++) {
            product.weights[i] = Math.tanh(left.weights[i]);
            
          }
        
          break;
        case 'multiplyElement': //compiled from src/recurrent/matrix/multiply-element.js
          
          var weights = left.weights;
        
          for (var i = 0; i < weights.length; i++) {
            product.weights[i] = left.weights[i] * right.weights[i];
            
          }
        
          break;
      }
    }
    if (_i >= input.length - 1) { output.push(state.product.weights); }
  }
  return lookupOutput(output);
  function lookupInput(input) {
          var table = {"team1":0,"team2":1,"toss_winner":2,"toss_decision":3};
          var result = [];
          for (var p in table) {
            result.push(Float32Array.from([input[p]]));
          }
          return result;
        }
  function lookupOutput(output) {
          var table = {"winner":0};
          var result = {};
          for (var p in table) {
            result[p] = output[table[p]][0];
          }
          return result;
        }
  
  function Matrix(rows, columns) {
    this.rows = rows;
    this.columns = columns;
    this.weights = zeros(rows * columns);
  }
  function zeros(size) {
  return new Float32Array(size);
}
  function softmax(m) {
  var result = new Matrix(m.rows, m.columns); // probability volume
  var maxVal = -999999;
  for (var i = 0; i < m.weights.length; i++) {
    if (m.weights[i] > maxVal) {
      maxVal = m.weights[i];
    }
  }

  var s = 0;
  for (var _i = 0; _i < m.weights.length; _i++) {
    result.weights[_i] = Math.exp(m.weights[_i] - maxVal);
    s += result.weights[_i];
  }

  for (var _i2 = 0; _i2 < m.weights.length; _i2++) {
    result.weights[_i2] /= s;
  }

  // no backward pass here needed
  // since we will use the computed probabilities outside
  // to set gradients directly on m
  return result;
}
  function randomF(a, b) {
  return Math.random() * (b - a) + a;
}
  function sampleI(m) {
  // sample argmax from w, assuming w are
  // probabilities that sum to one
  var r = randomF(0, 1);
  var x = 0;
  var i = 0;
  var w = m.weights;

  while (true) {
    x += w[i];
    if (x > r) {
      return i;
    }
    i++;
  }
}
  function maxI(m) {
  // argmax of array w
  var weights = m.weights;

  var maxv = weights[0];
  var maxix = 0;
  for (var i = 1; i < weights.length; i++) {
    var v = weights[i];
    if (v < maxv) continue;

    maxix = i;
    maxv = v;
  }
  return maxix;
}
}
function addModel(model) {
  json = JSON.parse(require('fs').readFileSync('./models/' + model + ".json", 'utf-8'));
}

module.exports.addModel = addModel;
 module.exports.run = anonymous;