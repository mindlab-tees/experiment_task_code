// Gambling Task, based on Rogers et al. (1999) 
// Coded by Christopher Wilson 2021-2026
// The Wilson-Medimorec MIND Lab www.themindlab.uk
// comments by AI for clarity (supposedly!)


// added delay for fnirs onset
// includes websocket markers for fnirs synchronization
// task.js
// Requires: webSerial.js, config.js, and plugin.js to be loaded first.

function createGamblingTask(jsPsych) {

    // --- 1. Load Settings from Config ---
    const trials_per_block = CGT_CONFIG.trials_per_block;
    const timing_config = CGT_CONFIG.timings;
    const start_points = CGT_CONFIG.starting_points;

    // --- 2. Setup Mechanics (Box Ratios) ---
    // We create a balanced set of ratios (1-9) to ensure equal distribution over the block
    var trial_ratios = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    var trial_ratios_all = [];
    
    // Repeat the ratios enough times to fill the block
    for (var i = 0; i < trials_per_block / 9; i++) {
        trial_ratios_all = trial_ratios_all.concat(trial_ratios);
    }

    // Shuffle independent sets for each block type
    var asc_ratios = jsPsych.randomization.shuffle(trial_ratios_all.slice());
    var desc_ratios = jsPsych.randomization.shuffle(trial_ratios_all.slice());
    var random_ratios = jsPsych.randomization.shuffle(trial_ratios_all.slice());

    // --- 3. Global Variables ---
    let ntrials = 0;
    let currentPoints = start_points;
    let bankrupt = 0;

    // --- 4. Helper Functions ---

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min);
    }

    // Logic to reset points if player goes bankrupt
    const get_start_points = () => {
        if (currentPoints < 1) {
            bankrupt++;
            // New logic: 50 divided by number of bankruptcies
            currentPoints = Math.floor(50 / bankrupt);
            return currentPoints;
        }
        return currentPoints;
    };

// TRIGGER HELPER: Sends marker via Web Serial with a Fixation Cross
    // This creates a stable 1-second gap to ensure the marker is recorded safely.
    var create_marker_trial = function(marker_char) {
        return {
            type: jsPsychHtmlKeyboardResponse,
            // 1. Visual Confirmation: Show a cross so the participant is ready
            stimulus: '<div style="font-size:60px;">+</div>', 
            choices: "NO_KEYS",
            // 2. Safety Buffer: 1000ms gives the serial port plenty of time
            trial_duration: 1000, 
            on_start: function() {
                // 3. Send IMMEDIATELY when this trial starts
                if (typeof sendSerialMarker === "function") {
                    sendSerialMarker(marker_char);
                    console.log("Block Marker Sent: " + marker_char);
                } else {
                    console.warn("sendSerialMarker missing. Block marker " + marker_char + " not sent.");
                }
            }
        };
    };

    // --- 5. Block Definitions ---

    // PRACTICE Block
    const gambling_block_practice = {
        type: jsPsychGamblingTask,
        timings: timing_config, // Pass config timings to plugin
        timeline: [{
            starting_points: get_start_points,
            n_redboxes: () => getRandomInt(1, 9), // Random for practice
            send_markers: false, // No markers for practice
            on_finish: function(data) {
                currentPoints = data.end_total;
                ntrials++; 
            }
        }],
        repetitions: 5,
        data: { phase: 'gambling_practice' }
    };

    // ASCENDING Block (Bets increase)
    const gambling_block_asc = {
        type: jsPsychGamblingTask,
        timings: timing_config,
        timeline: [{
            starting_points: get_start_points,
            n_redboxes: function() {
                // Pop a value from the balanced list, or random if empty
                return asc_ratios.length > 0 ? asc_ratios.pop() : getRandomInt(1, 9);
            },
            on_finish: (data) => { currentPoints = data.end_total; }
        }],
        repetitions: trials_per_block,
        // Default bet_values in plugin are Ascending [0.05 ... 0.95]
        data: { phase: 'gambling_ascending' }
    };

    // DESCENDING Block (Bets decrease)
    const gambling_block_desc = {
        type: jsPsychGamblingTask,
        timings: timing_config,
        timeline: [{
            starting_points: get_start_points,
            n_redboxes: function() {
                return desc_ratios.length > 0 ? desc_ratios.pop() : getRandomInt(1, 9);
            },
            on_finish: (data) => { currentPoints = data.end_total; }
        }],
        repetitions: trials_per_block,
        // Explicitly set descending bets
        bet_values: [0.95, 0.75, 0.5, 0.25, 0.05],
        data: { phase: 'gambling_descending' }
    };

    // RANDOM Block (Bets shuffled)
    const gambling_block_random = {
        type: jsPsychGamblingTask,
        timings: timing_config,
        timeline: [{
            starting_points: get_start_points,
            n_redboxes: function() {
                return random_ratios.length > 0 ? random_ratios.pop() : getRandomInt(1, 9);
            },
            on_finish: (data) => { currentPoints = data.end_total; }
        }],
        repetitions: trials_per_block,
        // Function to shuffle bets for every trial
        bet_values: function() {
            var vals = [0.95, 0.75, 0.5, 0.25, 0.05];
            return jsPsych.randomization.shuffle(vals);
        },
        data: { phase: 'gambling_random' }
    };

    // --- 6. Instructions & Sequence ---

    var gambling_instructions1 = {
        type: jsPsychInstructions,
        pages: [
            '<p>In this task you will see a row of boxes. Some of the boxes are red and some are blue. There is a yellow token hidden on one of the boxes.</p>',
            '<h2>The screen will look like this:</h2><img src="images/cgt1.png" width="50%" height="50%"/>', 
            '<h2>Then you will be asked to place a bet.</h2><p>Wait for the amount you want, then press Space.</p>',
            '<h2>Click next to practice.</h2>'
        ],
        show_clickable_nav: true,
        allow_keys: false,
        on_finish: function() {
            currentPoints = start_points;
            ntrials = 0;
            bankrupt = 0;
        }
    };

    var instruction_asc = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: "<h2>Block Instructions</h2><p>Bet amounts will start <strong>SMALL</strong> and <strong>INCREASE</strong>.</p><p>Press SPACEBAR to start.</p>",
        choices: [' '],
        on_finish: function() { currentPoints = start_points; }
    };

    var instruction_desc = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: "<h2>Block Instructions</h2><p>Bet amounts will start <strong>LARGE</strong> and <strong>DECREASE</strong>.</p><p>Press SPACEBAR to start.</p>",
        choices: [' '],
        on_finish: function() { currentPoints = start_points; }
    };

    var instruction_random = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: "<h2>Block Instructions</h2><p>Bet amounts will appear in a <strong>RANDOM ORDER</strong>.</p><p>Press SPACEBAR to start.</p>",
        choices: [' '],
        on_finish: function() { currentPoints = start_points; }
    };

    var gambling_instructions2 = {
        type: jsPsychInstructions,
        pages: ['<p>Now you will play the game for real.</p>'],
        show_clickable_nav: true,
        on_finish: function() { ntrials = 0; }
    };

    // --- 7. Timeline Assembly ---
    // Inject the specific markers (a, d, r) before each block type
    var timeline_asc = { timeline: [instruction_asc, create_marker_trial("a"), gambling_block_asc] };
    var timeline_desc = { timeline: [instruction_desc, create_marker_trial("d"), gambling_block_desc] };
    var timeline_rand = { timeline: [instruction_random, create_marker_trial("r"), gambling_block_random] };

    // Shuffle the order of the 3 blocks
    var gambling_block_sequence = {
        timeline: jsPsych.randomization.shuffle([timeline_asc, timeline_desc, timeline_rand])
    };

    // Full Timeline Return
    var full_gambling_timeline = {
        timeline: [gambling_instructions1, gambling_block_practice, gambling_instructions2, gambling_block_sequence]
    };

    return full_gambling_timeline;
}