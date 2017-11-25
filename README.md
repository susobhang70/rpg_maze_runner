# RPG Maze Runner
RPG Puzzle Game for Children

## Import and Run
Import this project into RPG Maker MV using the file `Game.rpgproject`. From there, either export the game and get 
an executable to play it, or run the game from the play button.

## Goal and Gameplay
- The objective is to clear the levels and progress in the story as you go. 
- There are three levels in the game, with a story about the character before each level.
- Each level consists of a maze, and a small visible range (FOV) around your character.
- Each level has 4 treasures and a trap door to the next level.
- Each treasure is associated with a quiz question. Answering it correctly will increase FOV and movement speed of your character,
while getting it wrong will reset your FOV to minimum and teleport you to a random location on the map.
- The trap door gets activated only when all 4 treasures have been found. It also has a quiz question attached to it,
and the same rules apply as above.
- Getting answers wrong doesn't make you lose your progress in terms of number of questions answered.

## Modding
The questions and the story can be totally modded and changed to suit the audience playing the game.
- `data/Questions.csv`: Holds all the normal treasure questions, along with four options (first one being the correct one).
The options get randomly ordered at runtime. You can change questions in here and same will be reflected in game.
- `data/LevelUpQuestions.csv`: Holds all the normal treasure questions, along with four options (first one being the correct one).
The options get randomly ordered at runtime. You can change questions in here and same will be reflected in game.
- `data/TransitionText.csv`: Holds all the story content shown after each level. You may change these to change how your 
character gets developed throughout the game, aka changing the story.

<b>Note</b>: Maintain a character length of 45 per line in each of the above files (use alt+enter to shift to new line in the
same record/cell). Else, the remaining portion of the line will get cut off on the screen during gameplay.
