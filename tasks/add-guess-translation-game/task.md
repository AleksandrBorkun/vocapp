# Description

Add new page '/deck/[id]/guess-translation/page.tsx' to render Guess Translation game.

Game will use random words from the active deck. One game should use up to 20 words per round. Words should be selected by 40/40/20 principle. 40% - new, 40% - in progress of learning, 20% - repetition of well known words. Word `accuracy` will define how well user know the word.

Every time user selected correct translation accuracy increase by 5% (20 correct answers = 100% accuracy), and when wrong fall by 2%. The mininum accuracy is 0, maximum is 1 (aka 100%).

When user selected correct translation selected word and `Next` button turns green.

When user selected wrong translation selected word turns red, and correct word turns green. Tooltip message shown.

At the end of the game round accurasy statistic is shown to user e.g. `Well done! 9/10 Correct!` and 2 button available `Next Round` and `Go Home`

# Design

Follow precisly this design './design.html'.
