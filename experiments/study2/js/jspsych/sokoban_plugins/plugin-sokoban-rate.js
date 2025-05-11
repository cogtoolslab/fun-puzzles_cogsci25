var jsPsychSokobanRate = (function (jspsych) {
    "use strict";

    const info = {
        name: 'sokoban-rate',
        version: "0.1",
        data: {
            trial_type: { type: jspsych.ParameterType.STRING, default: 'sokoban-rate' },
            rt: { type: jspsych.ParameterType.INT },
            response: { type: jspsych.ParameterType.INT },
        },
        parameters: {
            stimuli: {
                type: jspsych.ParameterType.OBJECT,
                default: undefined,
                description: 'Sokoban level specification to display'
            },
            canvas_size: {
                type: jspsych.ParameterType.INT,
                default: 400,
                description: 'Size in pixels of canvas element'
            },
            prompt: {
                type: jspsych.ParameterType.STRING,
                default: 'Please rate this puzzle from 1-10',
            },
            labels: {
                type: jspsych.ParameterType.ARRAY,
                default: null
            },
            start_label: {
                type: jspsych.ParameterType.STRING,
                default: null,
            },
            end_label: {
                type: jspsych.ParameterType.STRING,
                default: null,
            },
            progress_prompt: {
                type: jspsych.ParameterType.STRING,
                default: null,
            },
            response_ends_trial: {
                type: jspsych.ParameterType.BOOLEAN,
                default: false,
                description: "Whether making a response immediately ends the trial"
            }
        },
    };

    class SokobanRatePlugin {
        constructor(jsPsych) {
            this.jsPsych = jsPsych;
        }

        trial(display_element, trial) {
            // Track selected rating
            var response = {
                rating: null,
                rt: null,
            };
            const end_trial = () => {
                var trial_data = {
                    ..._.omit(trial, 'on_finish'),
                    rt: response.rt,
                    response: response.rating,
                };
                console.log(trial_data)
                this.jsPsych.finishTrial(trial_data);
            };
            function record_response(choiceID) {
                var endTime = performance.now()
                var rt = Math.round(endTime - startTime);
                response.rating = choiceID;
                response.rt = rt;
                // enable submit button
                document.getElementById("sokoban-rate-submitBtn").disabled = false;
            }

            // Create container
            display_element.innerHTML = `
              <div class="sokoban-rate-wrapper">
                <div class="sokoban-rate-canvas-wrapper">
                  <canvas id="sokobanCanvas" 
                    width="${trial.canvas_size}" 
                    height="${trial.canvas_size}">
                  </canvas>
                </div>
                <div class="prompt">${trial.prompt}</div>
                <div class="rating-scale-wrapper">
                  ${Array.from({ length: 10 }, (_, i) =>
                `<button class="rating-button" value=${i + 1}>
                  ${i + 1}
                  </button>`
            ).join('')}
                </div>
                <div class="rating-labels-wrapper">
                    ${Array.from({ length: trial.labels.length }, (_, i) =>
                `<div class="rating-label">${trial.labels[i]}</div>`
            ).join('')}                    
                </div>
                <button id="sokoban-rate-submitBtn" disabled style="display:none" class="submitBtn">Continue</button>
                </div>`

            if (!trial.response_ends_trial) {
                document.getElementById("sokoban-rate-submitBtn").style.display = "block"
                document.getElementById("sokoban-rate-submitBtn").onclick = function () {
                    end_trial()
                };
            }

            // Initialize non-interactive sokoban environment with trial data
            const canvas = document.getElementById('sokobanCanvas');
            let environment = new Environment(trial.stimuli, canvas, false);

            // Add colors, values, and click handlers to buttons
            const buttons = display_element.querySelectorAll('.rating-button');
            const colors = ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee08b', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850', '#006837']
            const colors_light = ['#ff99b1', '#efaca9', '#f9b49f', '#fed9b3', '#fff1cc', '#f0f9d2', '#daefc2', '#b9e1b7', '#a8f0c7', '#70ffbc']

            buttons.forEach((button, index) => {
                // ROUND BUTTON
                button.style.backgroundColor = gs.session_info.condition == 'difficult' ? colors_light[9 - index] : colors_light[index]
                button.style.borderColor = gs.session_info.condition == 'difficult' ? colors[9 - index] : colors[index]

                button.addEventListener('click', (e) => {
                    // Remove previous selection
                    buttons.forEach(b => (b.classList.remove('selected'), b.classList.add('translucent')));

                    // Add selection to clicked button
                    button.classList.add('selected');
                    button.classList.remove('translucent');

                    // Record response
                    record_response(index + 1);
                    console.log("CHOICE", index + 1)

                    // end trial
                    if (trial.response_ends_trial) {
                        // End trial after short delay
                        setTimeout(() => {
                            end_trial();
                        }, 300);
                    }
                });

            });

            // update progress bar
            if (trial.progress_prompt) {
                $('#jspsych-progressbar-container').find('span:first').html(trial.progress_prompt);
            }

            const startTime = performance.now();
        }

    }

    SokobanRatePlugin.info = info;

    return SokobanRatePlugin;
})(jsPsychModule);