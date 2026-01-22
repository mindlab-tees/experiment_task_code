// Gambling Task (Rogers et al., 1999) implementation for jsPsych
// Christopher Wilson 2021 - 2026 (comments to code added by AI tools for clarity)
// Wilson-Medimorec MIND Lab - https://themindlab.uk
// Requires jsPsychGamblingTask plugin

function createGamblingTask(jsPsych, trials_per_block = 18) {

    // 1. Setup Logic
    var trial_ratios = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    
    // Create an array of values which repeats the trial ratios
    var trial_ratios_all = [];
    for (var i = 0; i < trials_per_block / 9; i++) {
        trial_ratios_all = trial_ratios_all.concat(trial_ratios);
    }

    // Randomize for each block
    var asc_ratios = jsPsych.randomization.shuffle(trial_ratios_all.slice());
    var desc_ratios = jsPsych.randomization.shuffle(trial_ratios_all.slice());
    var random_ratios = jsPsych.randomization.shuffle(trial_ratios_all.slice());

    let ntrials = 0;
    let currentPoints = 100;
    let bankrupt = 0;

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min);
    }

    // 2. Define Instructions
    
    var gambling_instructions1 = {
        type: jsPsychInstructions,
        pages: [
            '<p>In this task you will see a row of boxes. Some of the boxes are red and some are blue. There is a yellow token hidden on one of the boxes. You will be asked to decide which colour box the coin is hidden in (Red or Blue).</p><p>You will then be asked to bet an amount of your points that your decision was correct.</p><p>Click next to continue.</p>',
            '<h2>The screen will look like this:</h2><img src="images/cgt1.png" width="50%" height="50%"/><h2>Here you will guess which colour box contains the token.<h2>', 
            '<h2>Then you will be asked to place a bet:</h2><img src="images/cgt2.png" width="50%" height="50%"/><h2>The amount in the circle is the amount you will bet. The amount will change every second and the sequence will repeat until you respond. Respond when you are happy with the amount</h2>',
            '<h2>You will then see the outcome of your bet:</h2><img src="images/cgt3.png" width="50%" height="50%"/><h2>If you were correct, you will win the amount you bet. If you were incorrect, you will lose the amount you bet.</h2>',
            '<h2>Your goal is to get the highest score you can.</h2>',
            '<h2>Click next to practice.</h2>'
        ],
        show_clickable_nav: true,
        allow_backward: true,
        allow_keys: false,
        data: { phase: 'gambling_instructions1' },
        // FIX: Ensure clean start for practice
        on_finish: function() {
            currentPoints = 100;
            ntrials = 0;
            bankrupt = 0;
        }
    };

    var instruction_asc = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: "<h2>Block Instructions</h2><p>In this next game, the bet amounts will start <strong>SMALL</strong> and gradually <strong>INCREASE</strong>.</p><p>If you want to bet a large amount, you will need to <strong>WAIT</strong> for the amount to rise.</p><br/><p>Press SPACEBAR to start.</p>",
        choices: [' '],
        on_finish: function() {
            currentPoints = 100; // Reset at start of block
            bankrupt = 0;
        }
    };

    var instruction_desc = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: "<h2>Block Instructions</h2><p>In this next game, the bet amounts will start <strong>LARGE</strong> and gradually <strong>DECREASE</strong>.</p><p>If you want to bet a small amount, you will need to <strong>WAIT</strong> for the amount to fall.</p><br/><p>Press SPACEBAR to start.</p>",
        choices: [' '],
        on_finish: function() {
            currentPoints = 100; // Reset at start of block
            bankrupt = 0;
        }
    };

    var instruction_random = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: "<h2>Block Instructions</h2><p>In this next game, the bet amounts will appear in a <strong>RANDOM ORDER</strong>.</p><p>Pay attention and choose the amount you want when you see it.</p><br/><p>Press SPACEBAR to start.</p>",
        choices: [' '],
        on_finish: function() {
            currentPoints = 100; // Reset at start of block
            bankrupt = 0;
        }
    };

    // 3. Define Blocks
    const gambling_block_practice = {
        type: jsPsychGamblingTask,
        timeline: [{
            starting_points: function() {
                if (ntrials === 0) {
                    currentPoints = 100;
                    return 100;
                }
                if (currentPoints < 1) {
                    bankrupt = bankrupt + 1;
                    currentPoints = Math.floor(50 / bankrupt);
                    return currentPoints;
                } else {
                    return currentPoints;
                }
            },
            n_redboxes: function() {
                return getRandomInt(1, 9);
            },
            on_finish: function(data) {
                currentPoints = data.end_total;
                ntrials++; // FIX: Increment this so we don't reset to 100 next trial!
            }
        }],
        repetitions: 5,
        data: { phase: 'gambling_practice', task: 'gambling' },
        on_timeline_finish: function() {
            jsPsych.data.addProperties({ block_end_points: currentPoints });
            ntrials = 0; // Reset for next block
        }
    };

    const gambling_block_asc = {
        type: jsPsychGamblingTask,
        timeline: [{
            starting_points: function() {
                if (currentPoints < 1) {
                    bankrupt = bankrupt + 1;
                    currentPoints = Math.floor(50 / bankrupt);
                    return currentPoints;
                } else {
                    return currentPoints;
                }
            },
            n_redboxes: function() {
                if (asc_ratios.length > 0) {
                    var n = asc_ratios.pop();
                    jsPsych.data.addProperties({ current_red_boxes: n });
                    return n;
                } else {
                    return getRandomInt(1, 9);
                }
            },
            on_finish: function(data) {
                currentPoints = data.end_total;
            }
        }],
        repetitions: trials_per_block,
        data: { phase: 'gambling_ascending', task: 'gambling' },
        on_timeline_finish: function() {
            jsPsych.data.addProperties({ block_end_points: currentPoints });
        }
    };

    const gambling_block_desc = {
        type: jsPsychGamblingTask,
        timeline: [{
            starting_points: function() {
                if (currentPoints < 1) {
                    bankrupt = bankrupt + 1;
                    currentPoints = Math.floor(50 / bankrupt);
                    return currentPoints;
                } else {
                    return currentPoints;
                }
            },
            n_redboxes: function() {
                if (desc_ratios.length > 0) {
                    var n = desc_ratios.pop();
                    jsPsych.data.addProperties({ current_red_boxes: n });
                    return n;
                } else {
                    return getRandomInt(1, 9);
                }
            },
            on_finish: function(data) {
                currentPoints = data.end_total;
            }
        }],
        repetitions: trials_per_block,
        bet_values: [0.95, 0.75, 0.5, 0.25, 0.05],
        data: { phase: 'gambling_descending', task: 'gambling' },
        on_timeline_finish: function() {
            jsPsych.data.addProperties({ block_end_points: currentPoints });
        }
    };

    const gambling_block_random = {
        type: jsPsychGamblingTask,
        timeline: [{
            starting_points: function() {
                if (currentPoints < 1) {
                    bankrupt = bankrupt + 1;
                    currentPoints = Math.floor(50 / bankrupt);
                    return currentPoints;
                } else {
                    return currentPoints;
                }
            },
            n_redboxes: function() {
                if (random_ratios.length > 0) {
                    var n = random_ratios.pop();
                    jsPsych.data.addProperties({ current_red_boxes: n });
                    return n;
                } else {
                    return getRandomInt(1, 9);
                }
            },
            on_finish: function(data) {
                currentPoints = data.end_total;
            }
        }],
        repetitions: trials_per_block,
        bet_values: function() {
            var bet_values = [0.95, 0.75, 0.5, 0.25, 0.05];
            var bet_values_random = jsPsych.randomization.shuffle(bet_values);
            return bet_values_random;
        },
        data: { phase: 'gambling_random', task: 'gambling' },
        on_timeline_finish: function() {
            jsPsych.data.addProperties({ block_end_points: currentPoints });
        }
    };

    // 4. Sequence Logic
    var timeline_asc = { timeline: [instruction_asc, gambling_block_asc] };
    var timeline_desc = { timeline: [instruction_desc, gambling_block_desc] };
    var timeline_rand = { timeline: [instruction_random, gambling_block_random] };

    var gambling_block_sequence = {
        timeline: jsPsych.randomization.shuffle([timeline_asc, timeline_desc, timeline_rand])
    };

    var gambling_instructions2 = {
        type: jsPsychInstructions,
        pages: [
            '<p>Now you will play the game for real. Remember, your goal is to get the highest score you can.</p><p>Click next to continue.</p>'
        ],
        show_clickable_nav: true,
        allow_backward: false,
        allow_keys: false,
        data: { phase: 'gambling_instructions2' },
        on_finish: function(data) {
            ntrials = 0;
        }
    };

    // 5. Final Return
    var full_gambling_timeline = {
        timeline: [gambling_instructions1, gambling_block_practice, gambling_instructions2, gambling_block_sequence],
        randomize_order: false
    };

    return full_gambling_timeline;
}