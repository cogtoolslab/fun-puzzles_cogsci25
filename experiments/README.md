Directory to contain experiment code (e.g., HTML/CSS/JavaScript) for this project.

Template for new iterations:

```
### X.X
- code: `experiments/[experiment_name]`
- `experimentName` = `[MongoDB collectionName]`

#### X.X.X `iterationName` = `[iteration name]`

YYYY-MM-DD

- describe what's new
```

# Study 2 (experiment)

### 1.1 Experiment 1

- code: `/experiments/exp1`
- `experimentName` = `fun-puzzles-exp1`

#### 1.1.1 `iterationName` = `production2`

2024-01-23

- add comprehension check; two attempts allowed before returning
  - appears as 2qn on single page after practice levels, before first comparison task. Following [prolific policy](https://researcher-help.prolific.com/en/article/fb63bb)
  - comprehension check 1 asks about rating condition (difficult or enjoyable); check 2 asks about task (solve or design)

#### 1.1.0 `iterationName` = `production`

2024-01-22

- 3 sets of 8 puzzles
- counterbalance which set is in which study phase (pre,main,post)
- 20 batches of 8 comparison trials, randomly selected. Across these batches, each puzzle appears 40 times, each of 28 possible pairings appears between 3-10 times (160/28 = 5.7)

### 1.0 Pilot

- code: `/experiments/pilot` in [exp1-pilot branch](<[url](https://github.com/cogtoolslab/fun-puzzles/tree/exp1-pilot)>)
- `experimentName` = `fun-puzzles-pilot`

#### 1.0.0 `iterationName` = `pilot1_debug`

2024-01-08

- stimuli from `fun-puzzles-pilot` collection
- Compare task has 8 trials of hand-selected pairs from Set B and Set C
  - view each item for at least 10 seconds
- Main task has 8 trials from set A. 5 mins allowed.
- Practice task has 3 trials:
  - 2 boxes, any sequence
  - 2 boxes, one is on goal but blocks the other
  - 3 boxes, one is on goal but blocks the others
