var jsPsychSokobanSolve = (function (jspsych) {
    "use strict";
    const info = {
        name: "sokoban-solve",
        version: "0.1",
        data: {
            trial_type: { type: jspsych.ParameterType.STRING, default: 'sokoban-solve' },
            trial_start_time: { type: jspsych.ParameterType.INT },
            trial_end_time: { type: jspsych.ParameterType.INT },
            steps: { type: jspsych.ParameterType.ARRAY },
            inputEvents: { type: jspsych.ParameterType.ARRAY },
            environment: {
                type: jspsych.ParameterType.OBJECT,
                default: null,
            },
        },
        parameters: {
            stimuli: {
                type: jspsych.ParameterType.OBJECT,
                default: null,
            },
            progress_prompt: {
                type: jspsych.ParameterType.STRING,
                default: null,
            },
            trial_duration: {
                type: jspsych.ParameterType.INT, // in seconds
                default: null
            },
            prompt: {
                type: jspsych.ParameterType.STRING,
                default: 'Push each <span class="instructions pebble">pebble</span> onto a <span class="instructions beach">sand tile</span> to turn them into <span class="instructions gem">purple gems</span>!</p>'
            },
            canvas_size: {
                type: jspsych.ParameterType.INT,
                default: 600
            }
        },
    };

    /**
    * **SOKOBAN-SOLVE**
    *
    * A jsPsych plugin for Sokoban levels.
    *
    * @author [Junyi Chu]
    */

    class SokobanSolvePlugin {
        constructor(jsPsych) {
            this.jsPsych = jsPsych;
        }

        trial(display_element, trial) {

            let html = `
                <div id="sokoban-solve-wrapper">
                    <div id="sokoban-solve-prompt" style="margin-top:50px">
                    </div>
                    <div id="sokoban-solve-container">
                        <div id = "sokoban-solve-canvas-wrapper">
                        <canvas id="sokobanCanvas" tabindex="0" width="${trial.canvas_size}px" height="${trial.canvas_size}px" style="display: block; margin: auto; outline: none"></canvas>
                        </div>
                        <div id="sokoban-solve-sidebar">
                            <button id="undoBtn" class="gameBtn"><i class="fas fa-arrow-left">&nbsp;&nbsp;</i>UNDO</button>
                            <button id="resetBtn" class="gameBtn"><i class="fas fa-fast-backward">&nbsp;&nbsp;</i>RESET</button>
                            <div id="timer" style="visibility: hidden;"></div>
                            </div>
                        </div>
                    <div id="puzzle-solved-modal" class="modal" style="display: none; "><span id="puzzle-solved-modal-text">Solved! 🎉</span><span id="puzzle-over-modal-text" style="display:none">Time's up! ⌛️</span><br><br>Click <b>Continue</b> to move on.<br><button id="submitBtn">Continue</button></div>
                </div>
            `;

            display_element.innerHTML = html;
            // // Add prompt if specified
            if (trial.prompt) {
                const promptDiv = document.getElementById('sokoban-solve-prompt');
                promptDiv.innerHTML = trial.prompt;
            }
            // Progress bar prompt
            if (trial.progress_prompt) {
                $('#jspsych-progressbar-container').find('span:first').html(trial.progress_prompt);
            }

            // Initialize sokoban environment with trial data
            const canvas = document.getElementById('sokobanCanvas');
            let environment = new Environment(trial.stimuli, canvas, true);

            const undoBtn = document.getElementById('undoBtn');
            undoBtn.addEventListener('click', () => {
                environment.undo();
            });

            const resetBtn = document.getElementById('resetBtn');
            resetBtn.addEventListener('click', () => {
                environment.restart()
            });

            var response = {
                solveDuration: null,
                rt: null,
            };
            const end_trial = () => {
                var trialdata = {
                    ..._.omit(trial, 'on_finish', 'type'),
                    startTime: startTime,
                    solveDuration: response.solveDuration,
                    rt: response.rt,
                    steps: environment.steps || [],
                    inputEvents: environment.inputEvents || []
                };
                this.jsPsych.finishTrial(trialdata);
            };

            const submitBtn = document.getElementById('submitBtn');
            submitBtn.disabled = true;
            submitBtn.addEventListener('click', () => {
                var endTime = performance.now();
                response.rt = Math.round(endTime - startTime);
                // End trial after short delay
                setTimeout(() => {
                    end_trial()
                }, 300);
            });

            const startTime = performance.now();

            // Timer
            if (trial.trial_duration !== null) {
                // Get the display element
                let timeLeft = trial.trial_duration;
                const display = document.getElementById("timer");
                let minutes = Math.floor(timeLeft / 60);
                let seconds = Math.floor((timeLeft % 60));
                display.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                display.style.visibility = "visible";

                // Update the timer every second
                const intervalId = setInterval(() => {
                    // Decrement the time
                    timeLeft -= 1;
                    // Calculate minutes and seconds
                    minutes = Math.floor(timeLeft / 60);
                    seconds = Math.floor((timeLeft % 60));

                    // Display the time
                    display.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

                    if (environment.solved) {
                        // log seconds taken
                        environment.removeEventListeners()
                        response.solveDuration = trial.trial_duration - timeLeft
                        clearInterval(intervalId);
                        submitBtn.disabled = false
                    } else if (timeLeft < 1) {
                        // Check if the timer has reached 0
                        environment.removeEventListeners()
                        response.solveDuration = null
                        clearInterval(intervalId);
                        document.getElementById("puzzle-solved-modal-text").style.display = "none"
                        document.getElementById("puzzle-over-modal-text").style.display = "block"
                        submitBtn.disabled = false
                        document.getElementById("puzzle-solved-modal").style.display = "block"
                    }
                }, 1000);
            }

        }
    }

    SokobanSolvePlugin.info = info;

    return SokobanSolvePlugin;
})(jsPsychModule)