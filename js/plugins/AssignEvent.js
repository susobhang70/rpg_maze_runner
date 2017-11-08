/*:
 * @plugindesc Uses two CSV files to load questions into the game message
 *
 * @author Susobhan Ghosh
 *
 * @param Zoom Variable
 * @desc In-Game variable ID used storing the zoom variable
 * @default 1
 *
 * @param Response Variable
 * @desc In-Game variable ID used storing the response variable, if it was true or false
 * @default 9
 *
 * @param Player Respawn Variable
 * @desc In-Game Region ID denoting the player respawn points after getting a wrong answer
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

//Read Text File
var xhr = new XMLHttpRequest();
xhr.open("GET", "data/Questions.csv", false);
xhr.send(null);
var fileContent = xhr.responseText;
var questions = CSVToArray(fileContent);

xhr = new XMLHttpRequest();
xhr.open("GET", "data/LevelUpQuestions.csv", false);
xhr.send(null);
fileContent = xhr.responseText;
var finalQuestions = CSVToArray(fileContent);

zoomVar = Number(PluginManager.parameters('AssignEvent')["Zoom Variable"]);
responseVar = Number(PluginManager.parameters('AssignEvent')["Response Variable"]);
respawnVar = Number(PluginManager.parameters('AssignEvent')["Player Respawn Variable"]);

var questionPos = 0;
var currentLevel = 0;
var zoomIncrement = 40;
var start = [8,7];
var mapId = [1,3];

createEvent = function() {

	var currentQuestion = questions[questionPos][0];
	var options = questions[questionPos].slice(1, questions[questionPos].length);
	var answer = options[0];
	shuffle(options);
	var answerIndex = options.indexOf(answer);

	var currentZoom = $gameVariables.value(zoomVar);

	$gameMessage.setFaceImage('Actor1', 0);
	$gameMessage.setBackground(1);
	$gameMessage.setPositionType(2);

	$gameMessage.add(currentQuestion);
	
	$gameMessage.setChoices(options, 1, -1);
	$gameMessage.setChoiceCallback(function(responseIndex) {
		if(responseIndex === answerIndex)
		{
			questionPos++;
			setTimeout(function() {
				$gameVariables.setValue(responseVar, 1);
				$gameMessage.add("Yes! Correct! \\i[\.]");
				$gameVariables.setValue(zoomVar, currentZoom + zoomIncrement);
				$gamePlayer.setMoveSpeed($gamePlayer.moveSpeed() + 0.5);
				$gamePlayer._animationId = 41;
			}, 1000);
		}
		else
		{
			setTimeout(function() {
				$gameVariables.setValue(responseVar, 0);
				$gameMessage.add("Oh NO!");
				$gamePlayer.setMoveSpeed(4);
				$gameVariables.setValue(zoomVar, 20);
				var coords = Galv.SPAWN.randomRegion(respawnVar);
				// $gamePlayer.reserveTransfer(1,coords[0],coords[1],0,1);
			}, 1000);
		}
	});

	if(questionPos === questions.length)
		questionPos = 0;
}

createFinalLevelEvent = function() {

	var currentQuestion = finalQuestions[currentLevel][0];
	var options = finalQuestions[currentLevel].slice(1, finalQuestions[currentLevel].length);
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
				$gameMessage.add("Finally! This tunnel should lead me out!");
				$gameVariables.setValue(zoomVar, 0);
				// $gameVariables.setValue(responseVar, 1);
				$gamePlayer.setMoveSpeed(4);
				$gamePlayer._animationId = 41;

				currentLevel++;
				if(currentLevel === finalQuestions.length)
					currentLevel = 0;

				$gamePlayer.reserveTransfer(mapId[currentLevel], start[0], start[1], 0, 1);
			}, 1000);
		}
		else
		{
			setTimeout(function() {
				$gameMessage.add("NOOOOOO");
				$gamePlayer.setMoveSpeed(4);
				$gameVariables.setValue(zoomVar, 20);
				$gameVariables.setValue(responseVar, 0);
				var coords = Galv.SPAWN.randomRegion(respawnVar);
				// $gamePlayer.reserveTransfer(1,coords[0],coords[1],0,1);
			}, 1000);
		}
	});
}