gs = {
    study_metadata: {
        project: "fun-puzzles", // mongo dbname
        experiment: "fun-puzzles-exp1", // mongo colname
        iteration: "production2",
        dev_mode: false,// Change this to TRUE if testing in dev mode or FALSE for real experiment
        study_duration: "50 minutes",
        compare_stim_duration: 10, // seconds
    },
    session_timing: { // placeholders for jspsych to write
        startInstructionTS: undefined,
        startPracticeTS: undefined,
        startPreTS: undefined,
        startMainTS: undefined,
        startPostTS: undefined,
        startSurveyTS: undefined,
    },
    session_info: {
        stim_id: undefined,
        gameID: undefined,
        condition: undefined, // "difficult", "enjoyable"
        stimuli_set: undefined,
        stimuli: {
            pre: undefined,
            post: undefined,
            main: undefined
        },
        on_finish: undefined
    },
    comprehensionAttempts: 0,
    prolific_info: {
        prolificPID: undefined,
        prolificStudyID: undefined,
        prolificSessionID: undefined
    },
    game_info: {
        fps: 60,
        count_moves: false,
        count_boxes_left: false,
        solve_duration: 300, // seconds
        limit_time: true
    },
    keycodes: {
        37: "L",
        38: "U",
        39: "R",
        40: "D"
    },
    direction_to_vec: {
        U: { x: 0, y: -1 },
        D: { x: 0, y: 1 },
        L: { x: -1, y: 0 },
        R: { x: 1, y: 0 },
    },
    agent: {
        names: {
            default: "Turtle",
        },
        colors: {
            default: { h: 118, s: 100, l: 25 }, // hsl(118, 100.00%, 25.50%)
            limbs: { h: 97, s: 45, l: 58 },
        },
        size: {
            radius: 0.28,
            head_radius: 0.15,
            flipper_radius: 0.15,
            // eye_radius: 0.3,
            // pupil_radius: 0.5,
        },
        animations: {
            travel_frames: 10, // number of frames to travel 1 tile
            bump: {
                duration: 200,
                amplitude: .12,
                speed: 4,
            }
        }
    },
    box: {
        colors: {
            default: { h: 290, s: 5, l: 85 }, // grayscale dark
            border: { h: 290, s: 5, l: 50 }, // grayscale light
            success: { h: 284, s: 100, l: 80 }, // purple
            success_border: { h: 284, s: 85, l: 50 }, //  dark purple
            success_shiny: { h: 284, s: 100, l: 95 }, // purple tinted white
        },
        size: {
            base: 0.45,
            borderWidth: 0.07,
        }
    },
    goal: {
        colors: {
            default: { h: 45, s: 87, l: 57 }, // yellow
            // border: { h: 45, s: 100, l: 80 } // bright yellow
        },
        size: {
            radius: 0.12,
            borderWidth: 1
        }
    },
    tile: {
        colors: {
            default: { h: 196, s: 66, l: 85 }, // light blue #c0e5f2
            wall: { h: 196, s: 100, l: 25.7 }, // dark blue #006083ff
            goal: { h: 41, s: 72.8, l: 75.5 },// sand #eed193ff
        },
        size: {
            base: 0.94,
        },
        animations: {
            transition: {
                frames: 10, // # of frames to transition tile
                delay: 30, // # of milisseconds to offset each tiles' transition start
            },
        },
        corner_radius: 0.1, // proportion
        wall_line_width: 5,
    },
    game_visuals: {
        bg_color: { h: 196, s: 100, l: 25 }, //{ h: 40, s: 80, l: 90 },
    }
}