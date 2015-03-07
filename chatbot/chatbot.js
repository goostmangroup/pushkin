function Input(text, rule) {
	this.text = text;
	this.rule = rule;
}
Input.prototype = {
        toString: function() {
            return this.text;
        }
}

function Rule(inputs, cinputs, context, responses, action) {
	this.inputs = [];
	for (var i=0, x=inputs.length; i<x; i++) {
		this.inputs.push(new Input(inputs[i], this));
	}
	this.cinputs = [];
	if (cinputs != null) {
		for (var j=0, y=cinputs.length; j<y; j++) {
			this.cinputs.push(new Input(cinputs[j], this));
		}
	}
	this.context = context;
	this.responses = responses;
	this.action = action;
}

Rule.prototype = {
	execute: function() {
		if (typeof this.responses != "undefined") {
			var i = Math.floor(Math.random() * this.responses.length);
			chatbot.response = this.responses[i];
		}
		if (typeof this.action != "undefined" && this.action != null) {
			this.action();
		}
		chatbot.memory.context = this.context;
	}
}

function Dictionary() {
	
}

Dictionary.prototype = {

	addRule: function ( rule ) {
		this.addInputs(rule.inputs);
	},

	addInputs: function( inputs ) {
		if (typeof inputs != "undefined") {
			for (var i=0, x=inputs.length; i<x; i++) {
				var words = inputs[i].text.split(" ");
				for (var j=0, y=words.length; j<y; j++) {
					var token = words[j];
					this[token] = this[token] || [];
                                        if (this[token].indexOf(inputs[i])<0) {
						this[token].push(inputs[i]);
					}
				}
			}
		}
	} 
}

function ContextDictionary() {
	
}

ContextDictionary.prototype = {
	addRule: function( rule ) {
		if (typeof rule.cinputs != "undefined" && typeof rule.context !=undefined) {
			this[rule.context] = this[rule.context] || (new Dictionary());
			this[rule.context].addRule(rule.cinputs);
		}
	} 
}

function Chatbot() {
	this.memory = new Object();
	this.context = "";
	this.dictionary = new Dictionary();
	this.contextDictionary = new ContextDictionary();
}

Chatbot.prototype = {

    addRule: function(rule) {
        this.dictionary.addRule(rule);
	this.contextDictionary.addRule(rule);
    },

    answer: function(question) {
        question = question.replace(/\!/g, ' !');
        question = question.replace(/\?/g, ' ?');
        console.log(question);
    	var words = question.toLowerCase().split(" ");
    	var selectedInputs = [];
    	for (var i=0, x=words.length; i<x; i++) {
    		if (typeof this.dictionary[words[i]] != "undefined") {
                        console.log(i + ' ' + words[i]);
    			var foundInputs = this.dictionary[words[i]];
               		console.log(' found ' + foundInputs.join());
 			for (var j=0, y=foundInputs.length; j<y; j++) {
    				foundInputs[j].score = foundInputs[j].score || 0;
    				foundInputs[j].score += 1.0 / y;
                       		console.log(foundInputs[j].score + ' ' + foundInputs[j]);
                                if (selectedInputs.indexOf(foundInputs[j])<0) {
                                	selectedInputs.push(foundInputs[j]);
				}
    			}
    		}
    	}
        console.log(' selected inputs ' + selectedInputs.join());
    	var bestInput = [];
    	var highestScore = 0;
    	for (var k=0, z=selectedInputs.length; k<z; k++) {
    		if (selectedInputs[k].score > highestScore) {
    			highestScore = selectedInputs[k].score;
    			bestInput = [];
                        bestInput.push(selectedInputs[k]);
                        console.log(' best inputs ' + bestInput.join());
    		}
    		if (selectedInputs[k].score == highestScore) {
                        bestInput.push(selectedInputs[k]);
                        console.log(' best inputs ' + bestInput.join());
    		}
    	}
    	for (var k=0, z=selectedInputs.length; k<z; k++) {
    		console.log(selectedInputs[k].score + ' ' + selectedInputs[k]);
    	}
    	for (var k=0, z=selectedInputs.length; k<z; k++) {
    		delete selectedInputs[k].score;
    	}
        console.log(' best inputs ' + bestInput.join());
        if (bestInput.length > 0) {
                var n = Math.floor(Math.random() * bestInput.length);
                console.log('n ' + n);
                console.log('selected ' + bestInput[n].rule.responses.join());
		bestInput[n].rule.execute();
        }
    }
}

var chatbot = new Chatbot();

function ask(text) {
   if (event.keyCode == 13) {
      chatbot.answer(text.value);
      var divv = document.getElementById('answer');
      divv.innerHTML = "Пушкин: " + chatbot.response;
   }
}

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};
