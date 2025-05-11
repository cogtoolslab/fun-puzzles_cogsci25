# Fun Puzzles Experiment 1

**Researchers**: Junyi Chu, Kristine Zheng, Judy Fan

## Study information

### Background

What makes people think a puzzle will be fun to solve? While most people would agree that a jigsaw puzzle with 50 pieces is harder to solve than one with only 5 pieces, it is less obvious what makes some puzzles seem more enjoyable than others. In this study, we examine how novices might estimate puzzle **difficulty** and **enjoyment**, and the impact of puzzle solving experience, both in puzzle-specific experience (just by looking vs. after attempting a puzzle) and more general puzzle-solving experience (i.e., after attempting several puzzles). Additionally, we ask how these judgements vary with vs. without puzzle-solving experience. Our primary aim is to assess sources of consistency and variability in these ratings across participants.

**The Sokoban domain.** We use a type of logic puzzles known as Sokoban. Sokoban is a well-known puzzle game comprising a simple 2D maze with a single character and several boxes. The player’s goal is to push the boxes one at a time into goal locations. Puzzle solutions comprise a sequence of moves, and puzzle-solving performance can be evaluated in terms of success (how many boxes were placed onto goals) and efficiency (amount of time and moves taken to complete the puzzle). Critically, boxes can only be pushed, not pulled, so it is possible for a box to be “stuck” (e.g., in a corner). Learning to avoid these “deadlock” situations can reduce planning complexity and greatly speed up and increase the chances of puzzle completion. Thus, Sokoban is a useful domain to study changes in representation.

Sokoban puzzles have been a useful domain for studying planning and problem solving.
Visually similar puzzles (e.g., of similar size and number of boxes) can elicit wide variability in solution times, from a few seconds to more than an hour to solve (Jarušek & Pelánek, 2001). Thus, Sokoban is a useful domain to study how participants might go beyond perceptual heuristics to evaluate puzzles, and also to assess how puzzle-solving experience might drive differences in puzzle evaluation.

### Research questions

1. **To what extent do novice participants provide consistent ratings when evaluating a puzzle for the first time?**
   a. What is the overall inter-rater reliability of participant ratings for each metric (fun, difficulty)?
   b. Does inter-rater reliability differ by rating metric (e.g., enjoyment vs. difficulty)?
   c. What is the relationship between participants’ ratings of puzzle enjoyment and puzzle difficulty?

2. **How do participant ratings align with ratings derived from a corpus analysis?**
   a. To what extent do experimentally-measured participant enjoyment ratings converge with corpus-derived enjoyment ratings?
   b. To what extent do experimentally-measured participant difficulty ratings converge with corpus-derived difficulty ratings?
   c. How does the relationship between enjoyment and difficulty ratings compare between participant-derived and corpus-derived data?

3. **What is the relationship between individuals’ puzzle-solving behavior and their subjective ratings of puzzle enjoyment and difficulty?**

4. **What is the impact of puzzle-solving experience on how participants discern which puzzle will be more difficult / more enjoyable without actually attempting the puzzles?**
   a. What is the impact on inter-rater consistency in puzzle comparisons?
   b. What is the impact on average ratings (i.e., are some puzzles consistently rated as less difficult by participants with puzzle-solving experience)?

### Hypotheses

1. **Hypotheses about inter-rater consistency**
   a. If puzzle difficulty or enjoyment can be reliably estimated from viewing a puzzle, then ratings from different participants should show high consistency (i.e., high inter-rater reliability) for individual puzzles across a diverse set of puzzles. Average ratings should be invariant to which raters are used (e.g., low leave-one-out error)
   b. If puzzle enjoyment involves a noisier or more subjective assessment than puzzle difficulty, then inter-rater reliability for enjoyment should be lower than for difficulty.
   c. We expect puzzle enjoyment to be correlated with puzzle difficulty. Based on related work, we expect that puzzle enjoyment has a U-shape relationship with puzzle difficulty, with the greatest enjoyment for puzzles at moderate levels of difficulty and less enjoyment for levels that are too easy or too difficult. However, for a novel domain it is unclear how a “moderate” difficulty level should be defined. Thus, we will test for both linear and quadratic relationships between puzzle difficulty and enjoyment.

2. **Comparing participant ratings with corpus analysis**
   a. We expect a positive correlation between experimentally-measured puzzle enjoyment ratings and corpus-derived enjoyment (i.e., % liked)
   b. We expect a positive correlation between experimentally-measured puzzle difficulty ratings and corpus-derived difficulty (i.e., % solved)
   c. We expect a similar relationship to be found across both datasets

3. **Comparing puzzle-solving behavior and puzzle ratings:**
   a. Hypotheses about between-participant variation in ratings for a given puzzle:
   i. If ratings reflect appraisals about actual observed performance, then puzzles should be rated as more difficult by participants who did not solve a puzzle than participants who completed the puzzle
   ii. If ratings reflect actual effort taken to solve a puzzle, then difficulty ratings should be higher for solved puzzles that (i) took more time, (ii) required more actions, (iii) required more puzzle restarts
   iii. If ratings reflect estimates of puzzle-solving progress, then difficulty ratings should be higher for trials with (i) more boxes placed on goals
   b. We will test the relationship between the above variables (3a) and puzzle enjoyment ratings. However, we do not have specific directional hypotheses.
   c. As exploratory analyses, we will also explore relationships between puzzle ratings and model-based measures of puzzle-solving behavior, such as similarity between observed milestone completion sequence and the optimal solution

4. **What is the impact of puzzle-solving experience on how participants evaluate puzzles?**
   If experience solving puzzles drives the way participants initially reason about puzzles, then:
   a. post-test comparisons should demonstrate greater inter-rater reliability than pre-play comparisons;
   b. post-test comparisons should be more similar to corpus ratings than to pre-play comparisons.
   c. Puzzle rankings (i.e. relative ratings from puzzle-solving task) should be more similar to rankings computed from post-play comparisons than pre-play comparisons.
   d. Puzzle rankings will shift systematically from pre- to post-play judgment (e.g., puzzle difficulty and enjoyment might be systematically under-estimated or over-estimated)

This is an initial study, which does not distinguish between different hypotheses for why such shifts may occur. For example, if participants show increased inter-rater reliability in puzzle difficulty estimates after puzzle-solving experience, it may reflect more accurate simulations of possible moves, simulating longer sequences of moves, or simply thinking longer about the puzzle, to name a few.

## Design Plan

### Study type

This study uses experimental data with human participants.

### Study design

Rating type (difficulty or enjoyment) will be manipulated as a between-subjects condition

<!-- describe the overall design of the study (what will be manipulated and/or measured, specify whether manipulations will be between- or within-participants, etc.)-->

#### Stimuli

We selected 24 puzzles from publicly available puzzle sets recommended for novices (Dmitri and Yorick, Microban, Sokogen-99060, Minicosmos). We used a multi-step process to select these stimuli:

1. First, we filtered for puzzles with similar complexity:
   - All puzzles contain 3 boxes
   - Puzzle size ranges from 6x6 to 9x9 tiles (including the bordering wall). This translates to a navigable space ranging from 4x4 to 7x7.
2. To ensure a majority of puzzles would be solvable within 5 minutes, we next identified puzzles wherein:
   - At least 100 attempts observed in corpus
   - Best solution observed in the corpus required at most 99 moves – providing a reliable upper bound on optimal solution length
   - More than 50% of attempts were successful - providing an upper bound on difficulty
3. This yielded 94 levels. Next, we performed a median split on 3 variables (defined below) to obtain low and high category.
   - Enjoyment: (n_likes - n_dislike) / n_played. Low enjoyment puzzles were liked on 1.55% to 3.08% of attempts; High enjoyment puzzles were liked 3.11% to 4.15%
   - Difficulty: 1 - (n_solved / n_played). Low difficulty puzzles were unsolved on up to 27% of attempts; High difficulty puzzles were unsolved in approximately 28% to 50% of attempts.
   - ShortestPath: number of steps in the best observed solution. Short puzzles had best solutions of 16 to 47 steps; long puzzles had solutions ranging from 48 to 99 steps.
4. Finally, we performed stratified sampling to create 3 puzzle sets, with each set containing 1 puzzle for each combination of binary variables (8 puzzles per set).

#### Task procedure

All participants complete the same instructions procedure and 3 practice puzzles. Next, participants complete three test phases, with a different puzzle set used for each phase. Thus, there are 6 stimuli orders.

1. Pre-play puzzle comparison task (8 trials)
2. Puzzle selection, solving and rating (8 trials)
3. Post-play puzzle comparison task (8 trials)

**Puzzle comparison**

In the puzzle comparison task, participants view static images of two puzzles (an “original” and a “new” puzzle) and judge which puzzle seems harder / more enjoyable.

1. First, the “original” puzzle is displayed with the prompt “Look at this puzzle. How difficult/enjoyable would it be to attempt it?”.
2. After 10 seconds have passed, participants see a prompt to reveal the other (“new”) puzzle. The original puzzle will remain visible, and we will record when participants reveal the new puzzle.
3. After the new puzzle has been displayed for 10 seconds, the comparison prompt will appear: “Compared to the original puzzle, is the new puzzle less or more [difficult / enjoyable]?”

Participants will provide a response from 1 (a lot less difficult/enjoyable) to 10 (a lot more difficult/enjoyable). We will record their response, and various reaction times (e.g., duration each puzzle was displayed, time spent making a response)

**Puzzle selection**

First participants will select a puzzle from a gallery showing all available puzzles, with order randomized. Participants will attempt and rate each of these puzzles in any sequence of their own choosing, until all puzzles have been completed. Each puzzle can only be selected once.

**Puzzle solving**
The puzzle appears in a large game area. Participants use the arrow keys to control the agent inside the game. In a sidebar, participants can access:

- An undo button that reverts the most recent move
- A reset button that returns the puzzle to its initial state
- A countdown timer that starts at 5 minutes (in MM:SS) notation.

When the puzzle is complete, a message with “great job!” appears. If 5 minutes have passed and the puzzle is not yet solved, a message with “great try!” appears. When participants close either message, they will proceed to the puzzle rating interface.

**Puzzle rating**

Participants rate each attempted puzzle on a 1-10 scale. The options are colored in a green-yellow-red scale with both ends labeled:

- For difficulty, the labels are "1: Not at all difficult" in green and "10: Extremely difficult" in red
- For enjoyment, the labels are "1: Not at all enjoyable" in red and "10: Extremely enjoyable" in green

#### Manipulated variables

The key manipulation is rating condition (between-subjects, either **difficulty** or **enjoyment**)

### Measured variables

Here are the key variables we will measure.

For each puzzle in the main Puzzle Solving & Rating task:

- enjoyment ratings just after puzzle attempt (1-10)
- difficulty ratings just after puzzle attempt (1-10)
- traces of each attempt. This include the timestamp of each arrow press, undo, and reset, as well as performance metrics (e.g., whether puzzle was solved, time to solution)

For each participant, we also compute from binary comparisons the relative ranking of puzzles in terms of:

- pre-play enjoyment
- post-play enjoyment
- pre-play difficulty
- post-play difficulty

Other variables we are measuring but do not appear explicitly in our hypotheses:

- Demographics (age, gender, general video game experience; experience with sokoban)
- Exit survey feedback
  - How much effort did you put into this study?
  - How difficult was this study for you?
- Reaction time for ratings

#### Computing relative puzzle ratings from comparison tasks

To obtain participant-specific puzzle rankings from the comparison tasks, we use these metrics

- selectionRate for each comparison task (pre- / post-play)
- mElo for each comparison task (pre- / post-play)
- mElo stability for each comparison task (pre- / post-play)

Both selectionRate and mElo are estimates of how likely a puzzle will be selected in a new comparison against another randomly selected puzzle. We will compute both scores once per puzzle for each rating scale (difficulty / enjoyment) and measurement phase (pre- / post-play), and normalize them to z-scores (across the same rating scale & measurement phase).

**selectionRate** = frequency selected / frequency presented. This will be a numeric variable, ranging from 0 to 1. Each puzzle will be presented 40 times per rating scale and measurement phase (i.e., once per participant).

**mElo** = mean Elo score, similar to how chess players are ranked according to their history of wins and losses. Here, a puzzle with greater ELO score is more likely to be selected in a binary comparison task (i.e., more often judged to be more difficult / enjoyable). However, because Elo scores are sensitive to the sequence of matches, we will use a bootstrapping method to compute a mean Elo score by aggregating across a sample of 100 possible trial sequences. We follow this method from [Clark et al 2018](https://doi.org/10.1371/journal.pone.0190393)

We use **mElo stability** as a measure of inter-rater reliability, with one reliability score for each rating scale and measurement phase. Ratings that are more reliable (for a given rating scale and task) should result in mElo scores that are less impacted by the outcome of a new pairwise comparison. Thus, we will compute mElo stability as the average difference in mElo scores computed from all participants (n ratings) versus leaving one participant out (n-1 ratings), iterating over all participants.

## Sampling Plan

### Data collection procedure

We will recruit participants from Prolific, with the following parameters.

- UK / US
- Standard Sample
- Fluent in English
- Can only complete the study once.
- Compensation = $9 (45 mins at $12 per hour). No performance bonus.

### Sampling procedure

Data collection will be stopped when at least 40 participants per stimuli set and condition have completed the experiment, yielding a total N of 240. Any sessions that are excluded will be replaced with new participants.

This allows us to obtain sufficiently precise estimates of mElo rankings.

## Analysis Plan

### Data exclusion criteria

We will exclude data from an entire experimental session if participant incorrectly answers attention check during debrief survey. This question requires participants to identify what they were asked to do in the study. Correct response requires selecting 2 out of 4 options (chance accuracy = 1/6).

Note that participants must solve all 3 practice trials before proceeding to the rest of our study.

### Handling missing data

We will only include complete sessions (i.e., responses are collected for all trials).

### Planned analyses

#### Descriptive analyses

1. Distribution of ratings for attempted puzzles. Are participants using the entire scale?
2. What is the puzzle solution rate in the experiment? We expect some moderate success (i.e., not 0 or 100%) since these levels are designed for novices.
3. For each puzzle, what is the standard error around puzzle ratings (from main puzzle-solving task)?

#### 1. Inter-rater consistency of puzzle ratings

#### 2. Comparing participant ratings with corpus analysis:

Agreement of puzzle ratings in experimental measures and observed corpus data

#### 3. Relationship between puzzle-solving traces and ratings

For each of the hypothesized predictors of listed in 3a, we will build the following linear mixed effects regression model and test if $\beta_predictor$ is significantly different from 0 at alpha=0.05. We will do this separately for difficulty and enjoyment

`rating ~ predictor + (1|subject) + (1|item)`

For any significant predictors, we will combine them in a regression and test which measures survive.

#### 4. What is the impact of puzzle-solving experience on how participants compare puzzles?

To test how the distribution of puzzle ranks change from pre-play to post-play, we will use the general

`DV ~ 1 + manipulation + (1|subject) + (1|item)`

post-test comparisons should demonstrate greater inter-rater reliability than pre-play comparisons;
post-test comparisons should be more similar to corpus ratings than to pre-play comparisons.
Puzzle rankings (i.e. relative ratings from puzzle-solving task) should be more similar to rankings computed from post-play comparisons than pre-play comparisons.
Puzzle rankings will shift systematically from pre- to post-play judgment (e.g., puzzle difficulty and enjoyability might be systematically under-estimated or over-estimated)

a. `DV` = mElo consistency, `manipulation` = pre or post-play
b. `DV` = similarity of mElo distribution to corpus distribution, `manipulation` = pre or post-play
c. `DV` = similarity of mElo distribution to puzzle ratings from puzzle-solving task, `manipulation` = pre or post-play.
d-i. `DV` = selection rate, `manipulation` = pre or post-play
d-ii. `DV` = mElo, `manipulation` = pre or post-play
