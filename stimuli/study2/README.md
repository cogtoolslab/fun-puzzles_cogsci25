This folder contains files for generating experiment stimuli and injecting them into the cogtools MongoDB instance.

## Overview

### In this directory

- `fun-puzzles_pilot_levels_metadata.json` contains 32 levels designed for novices, organized into 4 sets of 8.
- `generate_trials.ipynb`: A python notebook that samples levels, generates trial sequences, and pushes to mongo. The script inserts one row for each of 240 participants (40 x 2 conditions x 3 stimuli sets).

### A general framework for running the code here

## Level definition

Each level is a dictionary with the following elements:

- author_name [string] Name of author, just in case collection names duplicate
- collection_name [string] Name of collection from original author, in lowercase and with spaces/underscores converted to hyphens
- level_name [string] Name of level from original author, in lowercase and with spaces/underscores converted to hyphens
- layout [list] List of rows representing the level layout
- width [integer] Level width in tiles, including outer walls
- height [integer] Level height in tiles, including outer walls
- start_position [dictionary] Initial agent coordinates in x (col, from left) and y (row, from top)
- boxes [list] List of dictionaries, each representing a box with x coordinate, y coordinate, and state ($ or \*)

e.g.,

```
  {
    "author_name": "david-w-skinner",
  "collection_name": "Microban",
  "level_name": 1
  "layout": ["#### ", "# .# ", "# ###", "#.$ #", "#$ @ #", "# ###", "####"],
  "width": 6,
  "height": 7,
  "start_position": { "x": 3, "y": 4 },
  "boxes": [
  { "x": 2, "y": 3, "state": "$" },
  { "x": 1, "y": 4, "state": "$" },
  ],
  }
```
