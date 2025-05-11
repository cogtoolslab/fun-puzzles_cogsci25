var jsPsychSokobanCompare = (function (jspsych) {
    "use strict";
    const info = {
        name: "sokoban-compare",
        version: "0.1",
        data: {
            trial_type: { type: jspsych.ParameterType.STRING, default: 'sokoban-compare' },
            rt: { type: jspsych.ParameterType.INT },
            response: { type: jspsych.ParameterType.OBJECT },
        },
        parameters: {
            stimuli: {
                type: jspsych.ParameterType.OBJECT,
                default: null,
                description: 'Array of Sokoban level specifications to display in grid'
            },
            randomize_order: {
                type: jspsych.ParameterType.BOOLEAN,
                default: false,
                description: 'Whether to randomize stimuli presentation order. Default is false, showing first stimuli on the left.'
            },
            canvas_size: {
                type: jspsych.ParameterType.INT,
                default: 360,
                description: 'Size in pixels of each canvas element'
            },
            progress_prompt: {
                type: jspsych.ParameterType.STRING,
                default: null,
            },
            item_layout: {
                type: jspsych.ParameterType.STRING,
                default: "grid"
            },
            grid_columns: {
                type: jspsych.ParameterType.INT,
                default: 2
            },
            first_view_duration: {
                type: jspsych.ParameterType.INT, // in seconds
                default: 5
            },
            second_view_duration: {
                type: jspsych.ParameterType.INT, // in seconds
                default: 5
            },
            stimuli_duration: {
                type: jspsych.ParameterType.INT, // in seconds
                default: null
            },
            trial_duration: {
                type: jspsych.ParameterType.INT, // in seconds
                default: null
            },
            prompt: {
                type: jspsych.ParameterType.STRING,
                default: null,
                description: 'Instructions displayed above the puzzles'
            },
            progress_prompt: {
                type: jspsych.ParameterType.STRING,
                default: null,
            }
        },
    };

    /**
    * **SOKOBAN-COMPARE**
    *
    * A jsPsych plugin for comparing two sokoban puzzles.
    *
    * @author [Junyi Chu]
    */

    class SokobanComparePlugin {
        constructor(jsPsych) {
            this.jsPsych = jsPsych;
        }

        trial(display_element, trial) {

            var response = {
                rt_done1: null,
                rt_done2: null,
                rt: null,
                response: null
            };
            const end_trial = () => {
                var trial_data = {
                    ..._.omit(trial, 'on_finish', 'type'),
                    rt_done1: response.rt_done1,
                    rt_done2: response.rt_done2,
                    rt: response.rt,
                    response: response.response
                };
                // console.log("ending trial with data output:", trial_data) // TODO: remove after debugging
                this.jsPsych.finishTrial(trial_data);
            };
            function record_response(choiceID) {
                var endTime = performance.now()
                response.rt = Math.round(endTime - startTime);
                response.response = parseInt(choiceID); // TODO
                // enable submit button
                submitBtn.disabled = false;
            }

            let html = `
                <div id="sokoban-compare-wrapper">
                <div class = "sokoban-compare-prompt">${trial.prompt}</div>
                <div id = "sokoban-compare-grid-container">
                    <div class="sokoban-compare-header-wrapper" style="width:${trial.canvas_size}">
                        <span id="label0">Inspect this puzzle.<br>Think about how ${gs.session_info.condition} it seems.</span><br>
                        <button id='sokoban-select-reveal-btn' class='submitBtn' disabled>Show next puzzle</button>
                    </div>
                    <div class="sokoban-compare-header-wrapper" style="width:${trial.canvas_size}">
                        <span id="label1" style="visibility:hidden">Inspect this puzzle.<br>Think about how ${gs.session_info.condition} it seems.</span><br>
                        <button id='sokoban-select-ready-btn' class='submitBtn' disabled style="display:none">I'm ready to choose</button>
                    </div>
                    <div id="sokoban-compare-final-prompt" style="display:none">
                        <p id="label2">Select the puzzle that looks more ${gs.session_info.condition}. Then, click Submit to continue.</p>
                        <button id="sokoban-select-submit-btn" class="submitBtn" disabled>Submit</button>
                    </div>
                </div>
                <br>
                </div>
            `;

            display_element.innerHTML = html;

            let thestimuli = trial.randomize_order ? _.shuffle(trial.stimuli) : trial.stimuli

            // Create canvas elements for each stimulus
            thestimuli.forEach((stim, choiceIndex) => {
                const canvasWrapper = document.createElement('div');
                canvasWrapper.className = "sokoban-compare-item-wrapper"
                canvasWrapper.width = trial.canvas_size;
                canvasWrapper.height = trial.canvas_size;

                const canvas = document.createElement('canvas');
                canvas.className = "sokoban-compare-item-canvas";
                canvas.id = "canvas" + choiceIndex;
                canvas.width = trial.canvas_size;
                canvas.height = trial.canvas_size;

                // Create environment and render it
                new Environment(stim, canvas, false);
                canvasWrapper.appendChild(canvas);
                if (choiceIndex != 0) {
                    canvas.style.visibility = "hidden"
                    // const overlay = document.createElement('overlay');
                    // overlay.id = "overlay";
                    // overlay.className = "sokoban-compare-item-canvas sokoban-compare-item-overlay";
                    // canvasWrapper.appendChild(overlay);
                }

                // Add click handling
                canvasWrapper.addEventListener('click', () => {
                    // Visual feedback for selection
                    $(".selected").removeClass("selected")

                    // Record the response
                    if (canvasWrapper.classList.contains('selectable')) {
                        canvasWrapper.classList.add('selected')
                        record_response(choiceIndex)
                    }
                });
                document.getElementById("sokoban-compare-grid-container").appendChild(canvasWrapper);
            })

            // Callable buttons
            const revealBtn = document.getElementById('sokoban-select-reveal-btn');
            const readyBtn = document.getElementById("sokoban-select-ready-btn")
            const submitBtn = document.getElementById('sokoban-select-submit-btn');

            // Control reveal button display
            let timeLeft = trial.first_view_duration;
            let seconds = Math.floor((timeLeft));
            revealBtn.textContent = "Show next puzzle in: " + seconds.toString();
            // Update the timer every second
            const intervalId = setInterval(() => {
                // Decrement the time
                timeLeft -= 1;

                // Calculate minutes and seconds
                seconds = Math.floor((timeLeft));

                // Display the time
                revealBtn.textContent = "Show next puzzle in: " + seconds.toString();

                if (timeLeft < 1) {
                    // Check if the timer has reached 0
                    clearInterval(intervalId);
                    revealBtn.textContent = "Show next puzzle"
                    revealBtn.disabled = false
                }
            }, 1000)

            // click reveal btn to countdown for ready btn
            revealBtn.onclick = function () {
                var endTime = performance.now()
                response.rt_done1 = Math.round(endTime - startTime);

                document.getElementById("canvas1").style.visibility = "visible"
                revealBtn.style.display = "none"; // disappear
                document.getElementById("label1").style.visibility = "visible"

                let timeLeft = trial.second_view_duration;
                let seconds = Math.floor((timeLeft));

                readyBtn.textContent = "Make selection in: " + seconds.toString();
                readyBtn.style.display = "block"; // appear
                readyBtn.disabled = true

                // Update the timer every second
                const interval2Id = setInterval(() => {
                    // Decrement the time
                    timeLeft -= 1;

                    // Calculate minutes and seconds
                    seconds = Math.floor((timeLeft));

                    // Display the time
                    readyBtn.textContent = "Make selection in: " + seconds.toString();

                    if (timeLeft < 1) {
                        // Check if the timer has reached 0
                        clearInterval(interval2Id);
                        readyBtn.textContent = "I'm ready to choose"
                        readyBtn.disabled = false
                    }
                }, 1000)
            }

            // click ready to select btn
            readyBtn.onclick = function () {
                var endTime = performance.now()
                response.rt_done2 = Math.round(endTime - startTime);

                readyBtn.style.display = "none"; // disappear
                let elements = document.getElementsByClassName("sokoban-compare-header-wrapper");
                Array.from(elements).forEach(function (element) {
                    element.style.display = "none";
                });
                // add class of selectable
                $(".sokoban-compare-item-wrapper").addClass("selectable")

                document.getElementById("sokoban-compare-final-prompt").style.display = "block"
            }

            // click submit btn
            submitBtn.onclick = function () {
                end_trial()
            };



            // Start timing
            const startTime = performance.now();

            // update progress bar
            if (trial.progress_prompt) {
                $('#jspsych-progressbar-container').find('span:first').html(trial.progress_prompt);
            }
            // toggle stimuli presentation duration
            if (trial.stimuli_duration !== null) {
                this.jsPsych.pluginAPI.setTimeout(() => {
                    const stims_collection = document.getElementsByClassName("sokoban-compare-item-canvas");
                    for (const stim of stims_collection) {
                        stim.style.visibility = "hidden"
                    }
                }, trial.stimuli_duration)

            };

            // toggle allowed trial duration
            if (trial.trial_duration !== null) {
                this.jsPsych.pluginAPI.setTimeout(end_trial, trial.trial_duration);
            }

        }
    }

    SokobanComparePlugin.info = info;

    return SokobanComparePlugin;
})(jsPsychModule)