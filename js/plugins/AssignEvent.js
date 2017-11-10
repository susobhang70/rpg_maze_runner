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
 *
 * @param Map Id Variable
 * @desc In-Game Map ID of the Transition Map
 * @default 5
 *
 * @param Timer Toggle Switch
 * @desc In-Game Switch ID of the Timer Toggle
 * @default 1
 *
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

xhr = new XMLHttpRequest();
xhr.open("GET", "data/TransitionText.csv", false);
xhr.send(null);
fileContent = xhr.responseText;
var TransitionTexts = CSVToArray(fileContent);

zoomVar = Number(PluginManager.parameters('AssignEvent')["Zoom Variable"]);
responseVar = Number(PluginManager.parameters('AssignEvent')["Response Variable"]);
respawnVar = Number(PluginManager.parameters('AssignEvent')["Player Respawn Variable"]);
transmapid = Number(PluginManager.parameters('AssignEvent')["Map Id Variable"]);
timerSwitchVar = Number(PluginManager.parameters('AssignEvent')["Timer Toggle Switch"]);
clockSwitchVar = Number(PluginManager.parameters('AssignEvent')["Display Clock Switch"]);

var questionPos = 0;
var nCorrect = 0;
var currentLevel = 0;
var currentFinalQuestion = 0;
var zoomIncrement = 40;
var start = [8,7];
var mapId = [6,7,8,1,3];
var LastTrans = 0;

createEvent = function() {

	var currentQuestion = questions[questionPos][0];
	var options = questions[questionPos].slice(1, questions[questionPos].length);
	var answer = options[0];
	shuffle(options);
	var answerIndex = options.indexOf(answer);

	var currentZoom = $gameVariables.value(zoomVar);

	$gameMessage.setFaceImage('Indrajit', 0);
	$gameMessage.setBackground(1);
	$gameMessage.setPositionType(2);

	$gameMessage.add(currentQuestion);
	
	$gameMessage.setChoices(options, 1, -1);
	$gameMessage.setChoiceCallback(function(responseIndex) {
		if(responseIndex === answerIndex)
		{
			setTimeout(function() {
				questionPos++;
				nCorrect++;
				if(questionPos == questions.length)
					questionPos = 0;
				$gameVariables.setValue(responseVar, 1);
				$gameMessage.add("Yes! Seems I am correct, now I can see properly.");
				$gameVariables.setValue(zoomVar, currentZoom + zoomIncrement);
				$gamePlayer.setMoveSpeed($gamePlayer.moveSpeed() + 0.5);
				$gamePlayer._animationId = 41;

				if((nCorrect) % 4 == 0)
				{
					$gameMessage.add("It says a tunnel has opened! I'll check");
				}
			}, 200);
		}
		else
		{
			setTimeout(function() {
				$gameVariables.setValue(responseVar, 0);
				$gameMessage.add("Oh NOOOOOO!");
				$gamePlayer.setMoveSpeed(4);
				$gameVariables.setValue(zoomVar, 20);
				var coords = Galv.SPAWN.randomRegion(respawnVar);
				// $gamePlayer.reserveTransfer(1,coords[0],coords[1],0,1);
			}, 200);
		}
	});
}

createFinalLevelEvent = function() {

	var currentQuestion = finalQuestions[currentFinalQuestion][0];
	var options = finalQuestions[currentFinalQuestion].slice(1, finalQuestions[currentFinalQuestion].length);
	var answer = options[0];
	shuffle(options);
	var answerIndex = options.indexOf(answer);

	$gameMessage.setFaceImage('Indrajit', 0);
	$gameMessage.setBackground(1);
	$gameMessage.setPositionType(2);

	// spawn end events after 4 correct answers only
	if((nCorrect) % 4 != 0)
	{
		$gameMessage.add("The tunnel somehow seems inaccessible");
		return;
	}

	$gameMessage.add(currentQuestion);
	
	$gameMessage.setChoices(options, 1, -1);
	$gameMessage.setChoiceCallback(function(responseIndex) {
		if(responseIndex === answerIndex)
		{
			setTimeout(function() {
				$gameMessage.add("Finally! Let's see where this tunnel leads me");
				$gameVariables.setValue(zoomVar, 0);
				// $gameVariables.setValue(responseVar, 1);
				$gamePlayer.setMoveSpeed(4);
				$gamePlayer._animationId = 41;

				currentLevel++;
				currentFinalQuestion++;
				if(currentFinalQuestion == finalQuestions.length)
					currentFinalQuestion = 0;

				// $gamePlayer.reserveTransfer(mapId[currentLevel], start[0], start[1], 0, 1);
				$gameSwitches.setValue(3,true);
				$gamePlayer.reserveTransfer(transmapid, 16, 12, 0, 1);
			}, 200);
		}
		else
		{
			setTimeout(function() {
				$gameMessage.add("NOOOOOO");
				$gamePlayer.setMoveSpeed(4);
				$gameVariables.setValue(zoomVar, 20);
				$gameVariables.setValue(responseVar, 0);
				var coords = Galv.SPAWN.randomRegion(respawnVar);
				//$gamePlayer.reserveTransfer(mapId[currentLevel],coords[0],coords[1],0,1);
			}, 1000);
		}
	});
}

transitionLevel = function() {
	$gameSwitches.setValue(timerSwitchVar, false);

//	current_trans_text = TransitionTexts[currentLevel - 1][0];
	if(LastTrans == currentLevel)
		return;	
	$gameMessage.setScroll(2);
	$gameMessage.add("HIT");
	LastTrans = currentLevel;
	$gamePlayer.reserveTransfer(mapId[currentLevel], start[0], start[1], 0, 1);
}