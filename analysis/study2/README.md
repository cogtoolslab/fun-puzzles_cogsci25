Directory to contain analysis notebooks/scripts for this project.

- `00_get_data_from_mongo.ipynb` pulls data form mongoDB and produces several csvs inside the `results/csv/study2` folder:

  - `<iterationName>_survey.csv` contains information from debrief survey
  - `<iterationName>_testTrials.csv` has 1 row per trial of main puzzle-solving phase
  - `<iterationName>_compareTrials.csv` has 1 row per trial of pretest and posttest phases
  - Puzzle-solving traces are saved as one csv per puzzle per game ID.
    - Path: `results/csv/study2/gameID/<gameID>_<trialNum>_attemptTrace.csv`

Analysis is in R:

- `01_make_results_dataframes.Rmd` computes several and saves as tidy dataframes in the following results CSVs:

  - `ratings-reliability-summary.csv`: Inter-rater agreement by rating condition and puzzle stimuli set
  - `puzzle_summary.csv`: summary statistics for each puzzle, including ratings and online metrics from study 1
  - `participant-mElo-long.csv`: mElo scores for each puzzle and participant
  - `bootElo_summary.csv`: bootstrapped summary statistics of ELO scores

- `02_analyze-ratings.Rmd` code for analyzing and producing figures of self-rated enjoyment and difficulty ratings
- `03_analyze-comparisons.Rmd` code for analyzing and producing figures of puzzle comparison task