/*:
 * @plugindesc Uses two CSV files to load questions into the game message
 *
 * @author Susobhan Ghosh
 *
 * @param Answer Variable
 * @desc In-Game variable ID used storing correct answer for the question
 * @default 9
 *
 * @param Question Variable
 * @desc In-Game variable ID used storing the current question number
 * @default 10
*/

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
}

function CSVToArray( strData, strDelimiter ){
	// Check to see if the delimiter is defined. If not,
	// then default to comma.
	strDelimiter = (strDelimiter || ",");

	// Create a regular expression to parse the CSV values.
	var objPattern = new RegExp(
		(
			// Delimiters.
			"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

			// Quoted fields.
			"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

			// Standard fields.
			"([^\"\\" + strDelimiter + "\\r\\n]*))"
		),
		"gi"
		);


	// Create an array to hold our data. Give the array
	// a default empty first row.
	var arrData = [[]];

	// Create an array to hold our individual pattern
	// matching groups.
	var arrMatches = null;


	// Keep looping over the regular expression matches
	// until we can no longer find a match.
	while (arrMatches = objPattern.exec( strData )){

		// Get the delimiter that was found.
		var strMatchedDelimiter = arrMatches[ 1 ];

		// Check to see if the given delimiter has a length
		// (is not the start of string) and if it matches
		// field delimiter. If id does not, then we know
		// that this delimiter is a row delimiter.
		if (
			strMatchedDelimiter.length &&
			strMatchedDelimiter !== strDelimiter
			){

			// Since we have reached a new row of data,
			// add an empty row to our data array.
			arrData.push( [] );

		}

		var strMatchedValue;

		// Now that we have our delimiter out of the way,
		// let's check to see which kind of value we
		// captured (quoted or unquoted).
		if (arrMatches[ 2 ]){

			// We found a quoted value. When we capture
			// this value, unescape any double quotes.
			strMatchedValue = arrMatches[ 2 ].replace(
				new RegExp( "\"\"", "g" ),
				"\""
				);

		} else {

			// We found a non-quoted value.
			strMatchedValue = arrMatches[ 3 ];

		}


		// Now that we have our value string, let's add
		// it to the data array.
		arrData[ arrData.length - 1 ].push( strMatchedValue );
	}

	// Return the parsed data.
	return( arrData );
}

var path = window.location.pathname.replace(/(\/www|)\/[^\/]*$/, '/data/');
if (path.match(/^\/([A-Z]\:)/)) {
	path = path.slice(1);
}
path = decodeURIComponent(path) + "save.txt";
var fs = require('fs');
//Read Text File
var xhr = new XMLHttpRequest();
xhr.open("GET","data/Questions.csv",false);
xhr.send(null);
var fileContent = xhr.responseText;
var questions = CSVToArray(fileContent);
// console.log(questions[0]);

answerVar = Number(PluginManager.parameters('AssignEvent')["Answer Variable"]);
questionVar = Number(PluginManager.parameters('AssignEvent')["Question Variable"]);

var questionPos = 0;
var currentAnswerPos = 0;

createEvent = function() {

	var currentQuestion = questions[questionPos][0];
	var options = questions[questionPos].slice(1, questions[questionPos].length);
	var answer = options[0];
	shuffle(options);
	var answerIndex = options.indexOf(answer);

	$gameMessage.setFaceImage('Actor1', 0);
	$gameMessage.setBackground(1);
	$gameMessage.setPositionType(2);

	$gameMessage.add(currentQuestion);
	
	$gameMessage.setChoices(options, 1, -1);
	$gameMessage.setChoiceCallback(function(responseIndex) {
		if(responseIndex === answerIndex)
		{
			setTimeout(function() {
				$gameMessage.add("Yes! Correct!");
				console.log("Yes");
			}, 1000);
		}
		else
		{
			setTimeout(function() {
				$gameMessage.add("Oh NO!");
				console.log("No");
			}, 1000);
		}
	});

	questionPos++;

	if(questionPos == questions.length)
		questionPos = 0;
}