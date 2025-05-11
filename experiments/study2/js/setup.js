function setupGame() {
    var urlParams = new URLSearchParams(window.location.search);
    try {
        gs.prolific_info.prolificID = urlParams.get('PROLIFIC_PID');
        gs.prolific_info.prolificStudyID = urlParams.get('STUDY_ID');
        gs.prolific_info.prolificSessionID = urlParams.get('SESSION_ID');
    } catch (error) {
        console.error('Error obtaining prolific URL parameters:', error);
    }

    // #region Initialize stimuli
    // [gs.session_info.stimuli.pre, gs.session_info.stimuli.main, gs.session_info.stimuli.post] = _.shuffle(Object.keys(trial_stims.stims))
    // Step 1: request stimuli to initialize this session
    socket.emit("getStims",
        {
            db_name: "stimuli",
            exp_name: gs.study_metadata.experiment,
        }
    );

    // Step 2: when server sends us stim, add it to the experiment.
    socket.on('stims', function (d) {
        // console.log(d); // debug
        gs.session_info.stim_id = d.stim_id;
        gs.session_info.gameID = d.gameid;  // gameId assigned by app.js
        gs.session_info.condition = d.condition; //_.sample(trial_stims.conditions)
        gs.session_info.stimuli_set = d.stimuli_set;
        gs.session_info.stimuli.pre = d.stims.stimuli_compare1;
        gs.session_info.stimuli.post = d.stims.stimuli_compare2;
        gs.session_info.stimuli.main = d.stims.stimuli_test;
        // console.log("Initializing session", gs.session_info.gameID, d.condition); //debug

        // Helper variables
        var completed_level_indexes = [] // track sequence of completed levels
        const condition_text = `<span style="font-weight:bold">${gs.session_info.condition}</span>`;

        // Step 3: specify parameters for writing data to mongo
        gs.session_info.on_finish = function (data) {
            json = _.extend({},
                { study_metadata: gs.study_metadata },
                { session_info: _.omit(gs.session_info, 'on_finish', 'stimuli') },
                { prolific: gs.prolific_info },
                data);
            socket.emit('currentData', json,
                gs.study_metadata.project, //dbname
                gs.study_metadata.experiment, //colname
                gs.session_info.gameID);
        }


        // #endregion

        // #region JsPsych
        var jsPsych = initJsPsych({
            show_progress_bar: true,
            auto_update_progress_bar: true,
            on_finish: gs.session_info.on_finish,
            override_safe_mode: true,
        });

        /* preload images */
        var preload = {
            type: jsPsychPreload,
            images: ['assets/instructions/treasure_turtle.jpeg', 'assets/instructions/01-tutorial-still.jpg', 'assets/instructions/01-tutorial.gif', 'assets/instructions/02a-push-one.gif', 'assets/instructions/02b-completed.gif', 'assets/instructions/02c-walls.gif', 'assets/instructions/03a-stuck-gem.gif', 'assets/instructions/03b-undo-reset.gif']
        };

        var enterFullscreen = {
            type: jsPsychFullscreen,
            fullscreen_mode: true,
            version: "2.0.0",
            message: "<p>The experiment will switch to fullscreen when you press the button below.</p><p>Please remain in fullscreen for the duration of the experiment, otherwise certain features will not work correctly.</p>",
            button_label: "Continue",
            on_load: function () {
                // Display progress bar
                document.getElementById("jspsych-progressbar-container").style.visibility = "visible";
            }
        }

        var consent = {
            data: {
                study_phase: "consent"
            },
            type: jsPsychHtmlButtonResponse,
            stimulus:
                '<h2> Puzzle Study </h2><div style="text-align: left">' +
                '<p> Welcome! We\'re researchers at Stanford University interested in how people approach puzzles.' +
                '<p>Over the next ' + gs.study_metadata.study_duration + ' or so, we\'ll show you different puzzles and ask you some questions about them.</p>' +
                '<p><i> Note: We recommend completing the study in Chrome. It has not been tested in other browsers.</i></p>' +
                '<div class="consent">' +
                '<p>By following the instructions, you are participating in a study being performed by researchers in the Department of Psychology at Stanford University. If you have questions about this research, please contact us at <a href="mailto:cogtoolslab.requester@gmail.com?subject=Puzzle study">cogtoolslab.requester@gmail.com</a>. We will do our best to communicate with you in a timely, professional, and courteous manner. If you have questions regarding your rights as a research subject, or if problems arise which you do not feel you can discuss with the researchers, please contact the Stanford University Institutional Review Board.</p>' +
                '<ul><li>You must be at least 18 years old to participate.</li>' +
                '<li>Your participation in this research is voluntary.</li>' +
                '<li>You may decline to answer any or all of the following questions.</li>' +
                '<li>You may decline further participation, at any time, without adverse consequences.</li>' +
                '<li>Your anonymity is assured; the researchers who have requested your participation will not receive any personally identifying information.</li></ul>' +
                '</div></div>' +
                '<p> Do you agree with the terms of the experiment as explained above? </p>',
            choices: ['Yes, I have read and agree with the above'],
            margin_vertical: "30px",
            on_load: function () {
                // Remove progress bar from screen
                document.getElementById("jspsych-progressbar-container").style.visibility = "hidden";
            },
            enable_button_after: 3000
        };
        // #endregion

        // #region familiarization
        var taskInstructions = {
            data: {
                study_phase: "instructions"
            },
            type: jsPsychInstructions,
            version: "2.0.0",
            pages: [
                '<p> Today, you will be a game tester for a new puzzle game called <span class="instructions"> Treasure Turtle</span>.</p>\
                    <p> Your job is to perform different tasks to rate how '+ condition_text + ' different puzzles are.</p>\
                    <img height="300" src="assets/instructions/treasure_turtle.jpeg">',
                "<p>In this game, <span class='shelby instructions'>Shelby the Treasure Turtle</span> is collecting <span class='gem instructions'>gems 💎</span></p>\
                    <p>In the water, these gems look like <span class='instructions pebble'>gray pebbles</span>.</p>\
                    <p>But on the <span class='beach instructions'>beach</span>, they'll turn into bright <span class='instructions gem'>purple gems</span>!</p>\
                    <img height='300' src='assets/instructions/01-tutorial-still.jpg'>",
                "<p>Help Shelby push every <span class='pebble instructions'>gray pebble</span> onto a <span class='beach instructions'>sandy beach</span>.</p>\
                    <p>Use the arrow keys to move Shelby around.</p><p><br></p>\
                    <img height='300' src='assets/instructions/01-tutorial.gif'>",
                '<div class="instructions">Remember these rules:</div><div class="row">\
                        <div class="column_thirds"><p style="min-height:80px">You can only push one gem at a time.</p><img width="100%" src="assets/instructions/02a-push-one.gif"></div>\
                        <div class="column_thirds"><p style="min-height:80px">The puzzle is complete when every beach tile has a gem.</p><img width="100%" src="assets/instructions/02b-completed.gif"></div>\
                        <div class="column_thirds"><p style="min-height:80px">Dark blue tiles are walls. Shelby cannot swim or push gems through them.</p><img width="100%" src="assets/instructions/02c-walls.gif"></div></div>',
                '<div class="instructions">Oh, one more thing! Shelby can only <span class="shelby">push</span>. She cannot pull.</div><div class="row">\
                        <div class="column_half"><p style="min-height:80px">Sometimes this means gems can get stuck.</p><img height="300" src="assets/instructions/03a-stuck-gem.gif"></div>\
                        <div class="column_half"><p style="min-height:80px">You can always <b>undo</b> previous moves or <b>reset</b> the puzzle and start over.</p><img height="300" src="assets/instructions/03b-undo-reset.gif"></div></div>',
                '<p>Let\'s get started!</p> \
                <p>On the next screen, you\'ll complete <em>three</em> practice puzzles to get familiar with the game.</p>\
                <p>Please do your best.</p> \
                <p> You will not be able to proceed to the rest of the study until you solve all three puzzles.'
            ],
            show_clickable_nav: true,
            allow_keys: false,
            allow_backward: true,
            on_start: function () {
                gs.session_timing.startInstructionTS = Date.now();
            }
        }

        var practiceLevels = {
            data: {
                study_phase: "practice"
            },
            timeline: [{
                type: jsPsychSokobanSolve,
                version: "0.1",
                prompt: jsPsych.timelineVariable('prompt'),
                stimuli: jsPsych.timelineVariable('stimuli')
            }],
            // timeline_variables: tutorial_stims
            timeline_variables: practice_stims,
            on_start: function () {
                gs.session_timing.startPracticeTS = Date.now();
            },
            on_finish: gs.session_info.on_finish,
        }

        // #endregion

        var practiceConclusion = {
            type: jsPsychHtmlButtonResponse,
            stimulus: `<p>Nice work!</p>\
            On the next page, we'll explain the rest of the study, and ask you some comprehension questions to make sure everything is crystal clear.</p>
            <p>Please do your best. You will have <b>two</b> opportunities to correctly answer these questions. <br>Otherwise, you will be asked to return the study. </p>`,
            choices: ['Continue'],
            margin_vertical: "30px",
        }

        // #region comprehension
        // https://researcher-help.prolific.com/en/article/fb63bb
        var comprehensionCheck = {
            data: {
                study_phase: "comprehension",
                comprehension_attempt: gs.comprehensionAttempts
            },
            type: jsPsychSurveyMultiChoice,
            name: 'checkCondition',
            preamble: `<h3>Instructions:</h3><div class="consent">For the rest of the study, you will rate how ` + condition_text + ` puzzles are in three different tasks:<br><ul><li>First, you will compare puzzles and choose which puzzle looks more ${gs.session_info.condition} at first glance.</li>\
                        <li>Then, you will try to solve some puzzles, and rate how ${gs.session_info.condition} they were.</li>\
                        <li>At the end, you\'ll compare and rate another set of puzzles.</li></ul></div>`,
            questions: [
                {
                    prompt: '<h3>How will you be rating the puzzles in this study?</h3>\
                    <em>Please re-read the study instructions above if you are not sure.</em>',
                    options: _.shuffle(['I will rate how enjoyable puzzles are', 'I will rate how difficult puzzles are']),
                    required: true,
                },
                {
                    prompt: '<h3>Which of the these tasks will you perform in this study?</h3>\
                    <em>Please re-read the study instructions above if you are not sure.</em>',
                    options: _.shuffle(['Try to solve some puzzles', 'Try to design new puzzle levels']),
                    required: true,
                },
            ],
            horizontal: false,
            on_finish: gs.session_info.on_finish,
        };

        var loop_prompt = {
            data: {
                study_phase: "comprehension"
            },
            type: jsPsychHtmlButtonResponse,
            stimulus: function () {
                data = jsPsych.data.get()
                var resp1 = data.values()[data.values().length - 1].response.Q0.includes(gs.session_info.condition)
                var resp2 = data.values()[data.values().length - 1].response.Q1.includes('solve')
                var resp = !resp1 && !resp2 ? 'You got both wrong.' : !resp1 ? 'You got the first one wrong.' : 'You got the second one wrong.'

                if (gs.comprehensionAttempts < 2) {
                    return `<p>Oh no! ${resp} <br>You have one more attempt. Please try your best.</p>`
                } else {
                    return `<p>Oh no! ${resp} </p><p> You are out of attempts. Please return this study to Prolific.</p>`
                }
            },
            choices: () => {
                if (gs.comprehensionAttempts >= 2) {
                    return ['Return to Prolific']
                } else {
                    return ['Retry']
                }
            },
            margin_vertical: "20px",
            on_finish: () => {
                if (gs.comprehensionAttempts >= 2) {
                    window.onbeforeunload = null; // prevent warning message on redirect (erikb)                
                    window.open('https://app.prolific.com/submissions/complete?cc=C421PLIV', '_self') //   failed check code for returning study     
                }
            }
        }

        var ifLoop = {
            timeline: [loop_prompt],
            conditional_function: function () {
                data = jsPsych.data.get()
                var resp1 = data.values()[data.values().length - 1].response.Q0.includes(gs.session_info.condition)
                var resp2 = data.values()[data.values().length - 1].response.Q1.includes('solve')
                if (resp1 && resp2) {
                    return false
                } else {
                    gs.comprehensionAttempts += 1;
                    return true
                }
                return false
            }
        }

        // redo familiarization if comprehension check failed
        var comprehensionProcedure = {
            timeline: [comprehensionCheck, ifLoop],
            loop_function: function (data) {
                // console.log("DATA:", data.values())
                var resp1 = data.values()[0].response.Q0.includes(gs.session_info.condition)
                var resp2 = data.values()[0].response.Q1.includes('solve')
                if (resp1 && resp2) {
                    return false
                } else {
                    return true
                }
            },
            on_start: function () {
                gs.session_timing.startComprehensionTS = Date.now();
            },
        }

        // #endregion

        // #region study body
        const getFromLastTrial = (trialType, selector) => {
            return jsPsych.data.get().filter({ trial_type: trialType }).last().select(selector).values[0]
        };

        compare1_timeline = _.shuffle(gs.session_info.stimuli.pre).map((stim, idx) => ({ stimuli: stim, index: idx }));

        var preComparison1Message = {
            type: jsPsychHtmlButtonResponse,
            stimulus: "<div class='instructions'><h3>Task 1 of 3: Window shopping</h3><p>Help us decide which puzzles seem more " + condition_text + " at first glance.</p></div>\
                    <div class='consent'><br>You will see " + compare1_timeline.length + " pairs of puzzles. For each pair: <ol><li>One puzzle will appear first. Inspect it for at least 10 seconds.</li>\
                        <li>Then, reveal and inspect the second puzzle.</li>\
                        <li>When you're ready, click the puzzle that seems more " + condition_text + ".</li></ol>\
                        <p>We\'re interested in your intuitions. So, just choose based on your best judgment.</p></div>",
            choices: ['Continue'],
            margin_vertical: "20px",
            enable_button_after: 3000,
        }

        var compare1 = {
            timeline: [
                {
                    type: jsPsychSokobanCompare,
                    prompt: `<h3>Which puzzle seems more ${condition_text}?</h3>`,
                    stimuli: jsPsych.timelineVariable('stimuli'),
                    randomize_order: true,
                    first_view_duration: gs.study_metadata.dev_mode ? 1 : gs.study_metadata.compare_stim_duration,
                    second_view_duration: gs.study_metadata.dev_mode ? 1 : gs.study_metadata.compare_stim_duration,
                    response_ends_trial: false,
                    progress_prompt: function () {
                        return `Trial ${jsPsych.evaluateTimelineVariable('index') + 1} of ${gs.session_info.stimuli.pre.length}`
                    }
                }
            ],
            data: {
                study_phase: "pretest"
            },
            timeline_variables: compare1_timeline,
            on_finish: gs.session_info.on_finish,
            on_start: function () {
                gs.session_timing.startPreTS = Date.now();
            }
        }


        compare2_timeline = _.shuffle(gs.session_info.stimuli.post).map((stim, idx) => ({ stimuli: stim, index: idx }));

        var preComparison2Message = {
            type: jsPsychHtmlButtonResponse,
            timeline: [{
                stimulus: "<p> Great job trying out all those puzzles! </p>"
            },
            {
                stimulus: "<div class='instructions'><h3>Task 3 of 3: Window shopping</h3><p>Once again, help us decide which puzzles seem more " + condition_text + " at first glance.</p></div>\
                    <div class='consent'><br>You will see " + compare2_timeline.length + " pairs of new puzzles. For each pair: <ol><li>One puzzle will appear first. Inspect it for at least 10 seconds.</li>\
                        <li>Then, reveal the second puzzle and inspect it.</li>\
                        <li>When you're ready, click the puzzle that seems more " + condition_text + ".</li></ol>\
                        <p>We\'re interested in your intuitions. So, just choose based on your best judgment.</p></div>"
            },],
            choices: ['Continue'],
            margin_vertical: "20px",
            enable_button_after: 3000
        }

        var compare2 = {
            timeline: [
                {
                    type: jsPsychSokobanCompare,
                    prompt: `<h3>Which puzzle seems more ${condition_text}?</h3>`,
                    stimuli: jsPsych.timelineVariable('stimuli'),
                    randomize_order: true,
                    first_view_duration: gs.study_metadata.dev_mode ? 1 : gs.study_metadata.compare_stim_duration,
                    second_view_duration: gs.study_metadata.dev_mode ? 1 : gs.study_metadata.compare_stim_duration,
                    response_ends_trial: false,
                    progress_prompt: function () {
                        return `Trial ${jsPsych.evaluateTimelineVariable('index') + 1} of ${gs.session_info.stimuli.post.length}`
                    }
                }
            ],
            data: {
                study_phase: "posttest"
            },
            timeline_variables: compare2_timeline,
            on_finish: gs.session_info.on_finish,
            on_start: function () {
                gs.session_timing.startPostTS = Date.now();
            }
        }

        var preSokobanMessage = {
            type: jsPsychHtmlButtonResponse,
            timeline: [
                { stimulus: "<p>Great! Now it's your turn to solve some puzzles!</p>" },
                {
                    stimulus: `<div class="instructions">Task 2 of 3: Puzzle testing</div><p>On the next page, you will see a gallery of ${gs.session_info.stimuli.main.length} puzzles.</p>\
                        <ul><li>First, choose a puzzle and try to solve it. You will be given ${Math.floor(gs.game_info.solve_duration / 60)} minutes per puzzle.</li>\
                            <li>Then, rate how ${condition_text} you found it. </li>\
                            <li>Repeat this for all ${gs.session_info.stimuli.main.length} puzzles. You can attempt the puzzles in any order you choose.</li></ul></p >`
                }],
            choices: ['Continue'],
            margin_vertical: "20px",
            enable_button_after: 3000,
            on_finish: function () {
                gs.session_timing.startMainTS = Date.now();
            }
        }

        var sokobanProcedure = {
            data: {
                study_phase: "test"
            },
            timeline: [
                {
                    type: jsPsychSokobanSelect,
                    stimuli: gs.session_info.stimuli.main,
                    grid_cols: 4,
                    canvas_size: 240,
                    prompt: "<p>Which puzzle do you want to try next? Click to choose it: </p>",
                    completed_indexes: completed_level_indexes,
                    progress_prompt: function () {
                        return `Trial ${jsPsych.evaluateTimelineVariable('index') + 1} of ${gs.session_info.stimuli.main.length}`
                    },
                    on_finish: function (data) {
                        completed_level_indexes.push(data.response)
                        gs.session_info.on_finish(data)
                    }
                },
                {
                    type: jsPsychSokobanSolve,
                    version: "0.1",
                    trial_duration: gs.study_metadata.dev_mode ? 3 : gs.game_info.solve_duration,
                    prompt: 'Turn all the <span class="instructions pebble">pebbles</span> into <span class="instructions gem">gems</span>!</p>',
                    stimuli: function () {
                        // Get environment from previous trial
                        return gs.session_info.stimuli.main[getFromLastTrial('sokoban-select', 'response')];
                    },
                    on_finish: gs.session_info.on_finish,
                    progress_prompt: function () {
                        return `Trial ${jsPsych.evaluateTimelineVariable('index') + 1} of ${gs.session_info.stimuli.main.length}`
                    }
                },
                {
                    type: jsPsychSokobanRate,
                    prompt: [`<h3>How ${condition_text} was this puzzle?</h3>`],
                    labels: [`Not at all<br>${condition_text}`, `Extremely<br>${condition_text}`],
                    response_ends_trial: false,
                    stimuli: function () {
                        // Get environment from previous trial
                        return gs.session_info.stimuli.main[getFromLastTrial('sokoban-select', 'response')];
                    },
                    on_finish: gs.session_info.on_finish,
                    progress_prompt: function () {
                        return `Trial ${jsPsych.evaluateTimelineVariable('index') + 1} of ${gs.session_info.stimuli.main.length}`
                    }
                },
            ],
            on_timeline_start: function () {
                gs.session_timing.startMainTS = Date.now();
            },
            on_finish: gs.session_info.on_finish,
            timeline_variables: gs.session_info.stimuli.main.map((stim, idx) => ({ stim: stim, index: idx })),
        }

        // #endregion

        // #region exit trials

        // End of experiment, move to exit survey
        var preExitMessage = {
            type: jsPsychHtmlButtonResponse,
            stimulus: '<p>You\'ve completed the experiment!\
                                                </br>On the next page, please complete a brief set of questions about how the experiment went.\
                                            </br>Once you submit your answers, you\'ll be redirected back to Prolific and credited for participation.</p>',
            choices: ['Continue'],
            margin_vertical: "20px",
            on_finish: function () {
                gs.session_timing.startSurveyTS = Date.now();
            }

        }

        // define survey trial
        var exitSurvey = {
            type: jsPsychSurvey,
            version: "2.0.0",
            data: { study_phase: "exit survey" },
            survey_json: {
                title: 'Debrief survey',
                description: 'Please answer the following questions.',
                completeText: 'Thank you for participating!',
                pages: [
                    {
                        name: "page1",
                        title: 'Page 1 of 3: Your experience',
                        elements: [
                            {
                                type: 'comment',
                                name: 'participantExplanations',
                                title: `Today, you rated how ${gs.session_info.condition} puzzles are from 1-10. What factors affected your ratings?`,
                                placeholder: "Please describe your thought process.",
                                rows: 1,
                                auto_grow: true,
                                isRequired: true
                            },
                            {
                                type: 'rating',
                                name: 'judgedDifficulty',
                                title: 'How difficult did you find this study overall?',
                                minRateDescription: 'Very Easy',
                                maxRateDescription: 'Very Hard',
                                rateValues: [{ value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }, { value: 5 }],
                                isRequired: true,
                            },
                            {
                                type: 'rating',
                                name: 'participantEffort',
                                title: 'How much effort did you put into attempting to solve the puzzles? Your response will not effect your final compensation.',
                                minRateDescription: 'Very Low Effort',
                                maxRateDescription: 'Very High Effort',
                                rateValues: [{ value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }, { value: 5 }],
                                isRequired: true,
                            }
                        ]
                    },
                    {
                        name: 'page2',
                        title: 'Page 2 of 3: Demographic Information',
                        elements: [
                            {
                                type: 'rating',
                                name: 'sokobanFamiliarity',
                                title: 'Before this study, how often have you played this game? Include games with the same rules but different art work (e.g., Sokoban, Boxyboy). Do not include games with different rules or mechanics (e.g., portals).',
                                rateValues: [{ value: 0, text: 'Never' },
                                { value: 1, text: 'A few times' },
                                { value: 2, text: 'Several times' },
                                { value: 3, text: 'I\'m very familiar with this game' }],
                                // rateValues: [{value: 0, text: 'I have never played this game before.' },
                                //     {value: 1, text: 'I have played this game a few times before.' },
                                //     {value: 2, text: 'I have played this game several times.' },
                                //     {value: 3, text: 'I am extremely familiar with this game.' }],
                                isRequired: true,
                            },
                            {
                                type: 'rating',
                                name: 'gamingFrequency',
                                title: 'In the past three months, how often do you play digital games on average? Please indicate all forms of digital gaming experience (e.g., mobile, console, PC).',
                                rateValues: [{ value: 0, text: 'None' }, { value: 1, text: 'Less than 1 hr per week' }, { value: 2, text: '1 - 5 hours per week' }, { value: 3, text: '6 - 10 hours per week' }, { value: 4, text: 'More than 10 hours per week' }],
                                isRequired: true,
                            },
                            {
                                type: 'text',
                                name: 'participantYears',
                                title: 'How many years old are you?',
                                inputType: 'number',
                                min: 0,
                                max: 120,
                                textbox_columns: 5,
                                isRequired: true
                            },
                            {
                                type: 'radiogroup',
                                name: 'participantGender',
                                title: "What gender do you identify as?",
                                choices: ['Male', 'Female', 'Non-binary', 'Prefer not to answer'],
                                showOtherItem: true,
                                isRequired: true
                            },
                            {
                                type: 'checkbox',
                                name: 'participantRace',
                                title: 'What is your race?',
                                choices: ['White', 'Black/African American', 'American Indian/Alaska Native', 'Asian', 'Native Hawaiian/Pacific Islander', 'Multiracial/Mixed', 'Prefer not to answer'],
                                showNoneItem: false,
                                showOtherItem: true,
                                isRequired: true,
                            },
                            {
                                type: 'radiogroup',
                                name: 'participantEthnicity',
                                title: 'What is your ethnicity?',
                                choices: ['Hispanic', 'Non-Hispanic', 'Prefer not to answer'],
                                isRequired: true
                            },
                        ]
                    },
                    {
                        name: 'page3',
                        title: 'Page 3 of 3: Session information',
                        elements: [

                            {
                                type: 'checkbox',
                                name: 'inputDevice',
                                title: 'In addition to the keyboard and mouse, did you use any other device to complete this study? Please select all that apply.',
                                choices: ['Trackpad', 'Touch Screen', 'Stylus'],
                                colCount: 1,
                                showNoneItem: true,
                                showOtherItem: true,
                                isRequired: true,
                            },
                            {
                                type: 'text',
                                name: "technicalDifficultiesComments",
                                title: "Do you have any other comments or feedback to share with us about your experience? If you encountered any technical difficulties, please briefly describe the issue.",
                                placeholder: "I did not encounter any technical difficulities.",
                                required: false,
                                rows: 1,
                                auto_grow: true,
                            }]
                    }
                ]
            },

            on_start: function () {
                gs.session_timing.endExperimentTS = Date.now(); // collect end experiment time
                document.querySelector('#jspsych-progressbar-container').style.display = "none";
            },
            on_finish: function (data) {
                var updatedData = _.extend({},
                    { study_metadata: gs.study_metadata },
                    { session_info: _.omit(gs.session_info, 'on_finish', 'stimuli') },
                    { prolific: gs.prolific_info },
                    { session_timing: gs.session_timing },
                    _.omit(data, 'on_start', 'on_finish'));
                socket.emit('currentData', updatedData,
                    gs.study_metadata.project, //dbname
                    gs.study_metadata.experiment, //colname
                    gs.session_info.gameID)
                jsPsych.progressBar.progress = 1;
            }
        };

        var goodbye = {
            type: jsPsychInstructions,
            pages: ["<p>Thanks for participating in our experiment!</p><p>Please click the <em>Submit</em> button to complete the study.</p><p>Once you click <em>Submit</em>, you will be redirected to Prolific and receive credit for your participation.</p>"],
            show_clickable_nav: true,
            allow_backward: false,
            button_label_next: '< Submit',
            data: { study_phase: "exit survey" },
            on_finish: () => {
                window.onbeforeunload = null; // prevent warning message on redirect (erikb)                
                window.open('https://app.prolific.com/submissions/complete?cc=C714OT7U', '_self') //
                // window.open("https://cogtoolslab.org:8874/index.html?PROLIFIC_PID=done&SESSION_ID=done&STUDY_ID=pilot", "_self")
            }
        };
        // #endregion 

        trials = [];
        trials.push(preload)
        trials.push(consent);
        if (!gs.study_metadata.dev_mode) {
            trials.push(enterFullscreen);
        }
        trials.push(taskInstructions);
        trials.push(practiceLevels);
        trials.push(practiceConclusion);
        trials.push(comprehensionProcedure);
        trials.push(preComparison1Message);
        trials.push(compare1);
        trials.push(preSokobanMessage);
        trials.push(sokobanProcedure);
        trials.push(preComparison2Message);
        trials.push(compare2);
        trials.push(preExitMessage);
        trials.push(exitSurvey);
        trials.push(goodbye);

        // Run the experiment
        jsPsych.run(trials);

    }) // close socket
} // close setupGame