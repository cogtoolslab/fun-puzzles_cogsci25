var jsPsychSokobanSelect = (function (jspsych) {
    "use strict";

    const info = {
        name: 'sokoban-select',
        version: "0.1",
        data: {
            trial_type: { type: jspsych.ParameterType.STRING, default: 'sokoban-select' },
            rt: { type: jspsych.ParameterType.INT },
            response: { type: jspsych.ParameterType.OBJECT },
        },
        parameters: {
            stimuli: {
                type: jspsych.ParameterType.OBJECT,
                default: undefined,
                description: 'Array of Sokoban level specifications to display in grid'
            },
            completed_indexes: {
                type: jspsych.ParameterType.ARRAY,
                default: undefined,
                description: 'Array of Sokoban level indexes that were previously selected'
            },
            grid_cols: {
                type: jspsych.ParameterType.INT,
                default: 4,
                description: 'Number of columns in the grid'
            },
            canvas_size: {
                type: jspsych.ParameterType.INT,
                default: 240,
                description: 'Size in pixels of each canvas element'
            },
            prompt: {
                type: jspsych.ParameterType.STRING,
                default: null,
                description: 'Instructions displayed above the grid'
            },
            progress_prompt: {
                type: jspsych.ParameterType.STRING,
                default: null,
            },
        }
    };


    /**
    * **SOKOBAN-SOLVE**
    *
    * A jsPsych plugin for Sokoban levels.
    *
    * @author [Junyi Chu]
    */

    class SokobanSelectPlugin {
        constructor(jsPsych) {
            this.jsPsych = jsPsych;
        }

        trial(display_element, trial) {
            const selectedLevels = new Set(trial.completed_indexes);

            // Create container div
            const wrapper = document.createElement('div');
            wrapper.id = "sokoban-select-wrapper";

            // Add prompt if specified
            if (trial.prompt) {
                const promptDiv = document.createElement('div');
                promptDiv.id = "sokoban-select-prompt";
                promptDiv.innerHTML = trial.prompt;
                wrapper.appendChild(promptDiv);
            }

            // Create grid container
            const gridContainer = document.createElement('div');
            gridContainer.id = "sokoban-select-grid-container";
            gridContainer.style.gridTemplateColumns = `repeat(${trial.grid_cols}, ${trial.canvas_size + 20}px)`;

            // Create canvas elements for each stimulus
            trial.stimuli.forEach((stim, index) => {
                const canvasWrapper = document.createElement('div');
                canvasWrapper.className = "sokoban-select-item-wrapper"

                if (selectedLevels.has(index)) {
                    canvasWrapper.classList.add("item-unavailable")
                } else {

                    // Add hover effects
                    canvasWrapper.addEventListener('mouseenter', () => {
                        canvasWrapper.style.transform = 'translateY(-5px)';
                        canvasWrapper.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
                        // canvas.style.border = '5px solid #007bff';
                    });

                    canvasWrapper.addEventListener('mouseleave', () => {
                        canvasWrapper.style.transform = 'translateY(0)';
                        canvasWrapper.style.boxShadow = 'none';
                        // canvas.style.border = '1px solid #ccc';
                    });

                    // Add click handling
                    canvasWrapper.addEventListener('click', () => {
                        // console.log(selectedLevels);

                        // Visual feedback for selection
                        canvasWrapper.style.transform = 'translateY(0)';
                        canvasWrapper.style.boxShadow = 'none';
                        canvasWrapper.style.opacity = '0.6';
                        canvas.style.border = '2px solid #28a745'; // Green border for selected
                        canvasWrapper.style.cursor = 'default';

                        // Record the response
                        const response = {
                            ..._.omit(trial, 'on_finish', 'type', 'stimuli'),
                            response: index,
                            rt: performance.now() - startTime
                        };

                        // End trial with this response
                        this.jsPsych.finishTrial(response);
                    });
                }

                const canvas = document.createElement('canvas');
                canvas.className = "sokoban-select-item-canvas";
                canvas.width = trial.canvas_size;
                canvas.height = trial.canvas_size;

                // Create environment and render it
                new Environment(stim, canvas, false);

                canvasWrapper.appendChild(canvas);
                gridContainer.appendChild(canvasWrapper);
            });

            wrapper.appendChild(gridContainer);
            display_element.appendChild(wrapper);

            // update progress bar
            if (trial.progress_prompt) {
                $('#jspsych-progressbar-container').find('span:first').html(trial.progress_prompt);
            }

            // Start timing
            const startTime = performance.now();
        }
    }

    SokobanSelectPlugin.info = info;

    return SokobanSelectPlugin;
})(jsPsychModule); 