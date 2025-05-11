practice_stims = [
  {
    prompt: '<p>Now, you try! Push each <span class="instructions pebble">pebble</span> onto a <span class="instructions beach">beach tile</span> to turn them into <span class="instructions gem">purple gems</span>!</p>\
    <p>Note: If the game isn\'t responding, simply re-activate it by clicking on any game tile.</p>',
    stimuli: {
      "level_id": 3,
      "collection_id": "tutorial",
      "layout": [
        "######",
        "#  $.#",
        "#@ $.#",
        "#    #",
        "######"
      ],
      "width": 6,
      "height": 5,
      "start_position": { "x": 1, "y": 2 },
      "boxes": [
        { "x": 3, "y": 2, "state": "$" },
        { "x": 3, "y": 1, "state": "$" },
      ],
    },
  }, {
    prompt: '<p>Sometimes, you begin with a mix of <span class="instructions pebble">pebbles</span> and <span class="instructions gem">gems</span>.</p><p>Try solving this puzzle. You might need to temporarily move gems out of the way.</p>\
    <p> Note: If the game isn\'t responding, simply re-activate it by clicking on any game tile.</p>',
    stimuli: {
      "level_id": 4,
      "collection_id": "tutorial",
      "layout": [
        "######",
        "#    #",
        "#*$ @#",
        "#. ###",
        "######",
      ],
      "width": 6,
      "height": 5,
      "start_position": { "x": 4, "y": 2 },
      "boxes": [
        { "x": 1, "y": 2, "state": "*" },
        { "x": 2, "y": 2, "state": "$" },
      ],
    }
  },
  {
    prompt: '<p>Awesome! For the rest of the study, all puzzles will contain 3 gems.<br>Try one last puzzle for practice:</p>\
    <p> Note: If the game isn\'t responding, simply re-activate it by clicking on any game tile.</p>',
    stimuli: {
      "level_id": 5,
      "collection_id": "tutorial",
      "layout": ['  #####', '  #.  #', '###   #', '# $*$ #', '#   ###', '#@ .#', '#####'],
      "width": 7,
      "height": 7,
      "start_position": { "x": 1, "y": 5 },
      "boxes": [
        { "x": 2, "y": 3, "state": "$" },
        { "x": 3, "y": 3, "state": "*" },
        { "x": 4, "y": 3, "state": "$" }
      ],
    }
  }
]