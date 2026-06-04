/* task.js */
function createGamblingTask(jsPsych) {

    const trials_per_block = GT_CONFIG.trials_per_block;
    const timing_config = GT_CONFIG.timings;
    const start_points = GT_CONFIG.starting_points;

    var trial_ratios = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    var trial_ratios_all = [];
    for (var i = 0; i < trials_per_block / 9; i++) {
        trial_ratios_all = trial_ratios_all.concat(trial_ratios);
    }

    var asc_ratios = jsPsych.randomization.shuffle(trial_ratios_all.slice());
    var desc_ratios = jsPsych.randomization.shuffle(trial_ratios_all.slice());
    var random_ratios = jsPsych.randomization.shuffle(trial_ratios_all.slice());

    let ntrials = 0;
    let currentPoints = start_points;
    let bankrupt = 0;

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min);
    }

    const get_start_points = () => {
        return currentPoints;
    };

    var create_marker_trial = function(marker_char) {
        return {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: '<div style="font-size:60px;">+</div>', 
            choices: "NO_KEYS",
            trial_duration: 1000, 
            on_start: function() {
                if (typeof sendSerialMarker === "function") {
                    sendSerialMarker(marker_char);
                }
            }
        };
    };

    // --- Blocks ---

    const gambling_block_practice = {
        type: jsPsychGamblingTask,
        timings: timing_config, 
        send_markers: false,
        timeline: [{
            starting_points: get_start_points,
            cumulative_bankruptcies: () => bankrupt,
            n_redboxes: () => getRandomInt(1, 9),
            on_finish: function(data) {
                if (data.bankruptcy_triggered) { bankrupt++; }
                currentPoints = data.end_total;
                ntrials++; 
            }
        }],
        repetitions: 5,
        data: { phase: 'gambling_practice' }
    };

    const gambling_block_asc = {
        type: jsPsychGamblingTask,
        timings: timing_config,
        timeline: [{
            starting_points: get_start_points,
            cumulative_bankruptcies: () => bankrupt,
            n_redboxes: function() {
                return asc_ratios.length > 0 ? asc_ratios.pop() : getRandomInt(1, 9);
            },
            on_finish: (data) => { 
                if (data.bankruptcy_triggered) { bankrupt++; }
                currentPoints = data.end_total; 
            }
        }],
        repetitions: trials_per_block,
        data: { phase: 'gambling_ascending' }
    };

    const gambling_block_desc = {
        type: jsPsychGamblingTask,
        timings: timing_config,
        timeline: [{
            starting_points: get_start_points,
            cumulative_bankruptcies: () => bankrupt,
            n_redboxes: function() {
                return desc_ratios.length > 0 ? desc_ratios.pop() : getRandomInt(1, 9);
            },
            on_finish: (data) => { 
                if (data.bankruptcy_triggered) { bankrupt++; }
                currentPoints = data.end_total; 
            }
        }],
        repetitions: trials_per_block,
        bet_values: [0.95, 0.75, 0.5, 0.25, 0.05],
        data: { phase: 'gambling_descending' }
    };

    const gambling_block_random = {
        type: jsPsychGamblingTask,
        timings: timing_config,
        timeline: [{
            starting_points: get_start_points,
            cumulative_bankruptcies: () => bankrupt,
            n_redboxes: function() {
                return random_ratios.length > 0 ? random_ratios.pop() : getRandomInt(1, 9);
            },
            on_finish: (data) => { 
                if (data.bankruptcy_triggered) { bankrupt++; }
                currentPoints = data.end_total; 
            }
        }],
        repetitions: trials_per_block,
        bet_values: function() {
            var vals = [0.95, 0.75, 0.5, 0.25, 0.05];
            return jsPsych.randomization.shuffle(vals);
        },
        data: { phase: 'gambling_random' }
    };

    // --- Instructions ---

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

    // --- Scoring Trial (Rogers et al., 1999) ---
var cgt_scoring_trial = {
        type: jsPsychCallFunction,
        data: { phase: 'cgt_scoring' },
        func: function() {
            const expData = jsPsych.data.get().filterCustom(d => 
                d.phase && d.phase.includes('gambling_') && d.phase !== 'gambling_practice'
            );

            if (expData.count() === 0) return;

            // Updated decision logic using 'colour_chosen' key
            const isMajorityChoice = (d) => {
                if (d.n_redboxes > 5) return d.colour_chosen === 'red';
                if (d.n_redboxes < 5) return d.colour_chosen === 'blue';
                return null;
            };

            const qualityTrials = expData.filterCustom(d => isMajorityChoice(d) !== null);
            const majorityTrials = expData.filterCustom(d => isMajorityChoice(d) === true);

            // 1. Quality of Decisions
            const qualityOfDecisions = qualityTrials.count() > 0 ? (majorityTrials.count() / qualityTrials.count()) : 0;

            // 2. Risk Taking (Mean % bet on majority choices)
           // const riskTaking = majorityTrials.count() > 0 ? (majorityTrials.values().reduce((acc, d) => acc + (d.bet_amount / d.starting_points), 0) / majorityTrials.count()) : null;

           const riskTaking = majorityTrials.count() > 0 ? (majorityTrials.values().reduce((acc, d) => acc + d.bet_proportion, 0) / majorityTrials.count()) : null;
            // 3. Risk Adjustment (Bet sensitivity to odds)
            const getMeanBetAtRatio = (r) => {
                const rTrials = majorityTrials.filterCustom(d => d.n_redboxes === r || d.n_redboxes === (10 - r));
              //  return rTrials.count() > 0 ? (rTrials.values().reduce((acc, d) => acc + (d.bet_amount / d.starting_points), 0) / rTrials.count()) : 0;
            
            return rTrials.count() > 0 ? (rTrials.values().reduce((acc, d) => acc + d.bet_proportion, 0) / rTrials.count()) : 0;
            };
            const riskAdjustment = (2 * getMeanBetAtRatio(9)) + getMeanBetAtRatio(8) - getMeanBetAtRatio(7) - (2 * getMeanBetAtRatio(6));

            // 4. Delay Aversion (Descending - Ascending mean % bets)
            const getCondMean = (p) => {
                const pTrials = expData.filter({phase: p});
               // return pTrials.count() > 0 ? (pTrials.values().reduce((acc, d) => acc + (d.bet_amount / d.starting_points), 0) / pTrials.count()) : 0;
            return pTrials.count() > 0 ? (pTrials.values().reduce((acc, d) => acc + d.bet_proportion, 0) / pTrials.count()) : 0;
            };
            const delayAversion = getCondMean('gambling_descending') - getCondMean('gambling_ascending');

            // 5. Deliberation Time (Using 'colour_rt' key)
            const deliberationTime = expData.select('colour_rt').mean();

            jsPsych.data.addProperties({
                gt_quality_of_decisions: qualityOfDecisions,
                gt_risk_taking: riskTaking,
                gt_risk_adjustment: riskAdjustment,
                gt_delay_aversion: delayAversion,
                gt_deliberation_time: deliberationTime
            });
        }
    };
    // --- Timeline Assembly ---
    
    var asc_sequence = [instruction_asc];
    if (GT_CONFIG.send_markers) { asc_sequence.push(create_marker_trial("a")); }
    asc_sequence.push(gambling_block_asc);

    var desc_sequence = [instruction_desc];
    if (GT_CONFIG.send_markers) { desc_sequence.push(create_marker_trial("d")); }
    desc_sequence.push(gambling_block_desc);

    var rand_sequence = [instruction_random];
    if (GT_CONFIG.send_markers) { rand_sequence.push(create_marker_trial("r")); }
    rand_sequence.push(gambling_block_random);

    var gambling_block_sequence = {
        timeline: jsPsych.randomization.shuffle([
            { timeline: asc_sequence }, 
            { timeline: desc_sequence }, 
            { timeline: rand_sequence }
        ])
    };

    return {
        timeline: [
            gambling_instructions1, 
            gambling_block_practice, 
            gambling_instructions2, 
            gambling_block_sequence,
            cgt_scoring_trial
        ]
    };
}