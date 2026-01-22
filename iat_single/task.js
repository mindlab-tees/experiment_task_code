// task_sciat.js
//  Single Category IAT for jsPsych
// Christopher Wilson 2026 (comments to code added by AI tools for clarity)
// Wilson-Medimorec MIND Lab - https://themindlab.uk
// requires jsPsychIatHtml plugin

function createSCIATTask(jsPsych, config) {

    // Extract Config
    var target_label = config.target_label;
    var attr_labels  = config.attribute_labels; // [Pos, Neg]
    
    var target_stim  = config.target_stimuli;
    var attr_stim_pos = config.attribute_stimuli_pos;
    var attr_stim_neg = config.attribute_stimuli_neg;

    // Helper to format attribute stimuli (Targets are already formatted in config)
    function formatAttr(item) {
        if (config.attributes_are_images) {
            return "<img src='" + item + "' height='200px'></img>";
        }
        return item;
    }

    // --- BLOCK 1: Attribute Practice (Pos vs Neg) ---
    var stimuli_b1 = [];
    for (var i = 0; i < config.trial_count_practice; i++) {
        stimuli_b1.push({
            stimulus: formatAttr(attr_stim_pos[i % attr_stim_pos.length]),
            category: 'positive',
            left_category_label: [attr_labels[0]], right_category_label: [attr_labels[1]],
            stim_key_association: 'left', display_feedback: true, force_correct_key_press: true
        });
        stimuli_b1.push({
            stimulus: formatAttr(attr_stim_neg[i % attr_stim_neg.length]),
            category: 'negative',
            left_category_label: [attr_labels[0]], right_category_label: [attr_labels[1]],
            stim_key_association: 'right', display_feedback: true, force_correct_key_press: true
        });
    }
    stimuli_b1 = jsPsych.randomization.shuffle(stimuli_b1);

    // --- HELPER FOR COMBINED BLOCKS --- 
    // Logic: 1 part Target (L), 1 part Attr1 (L), 2 parts Attr2 (R)
    function createCombinedBlock(total_trials, labels_left, labels_right, attr1_stim, attr2_stim, cat_attr1, cat_attr2) {
        var seq = [];
        var quarter = Math.floor(total_trials / 4);

        // 1 part Target (Left)
        for (var i = 0; i < quarter; i++) {
            seq.push({
                stimulus: target_stim[i % target_stim.length],
                category: 'target',
                left_category_label: labels_left, right_category_label: labels_right,
                stim_key_association: 'left', display_feedback: true, force_correct_key_press: true
            });
        }
        // 1 part Attribute 1 (Left)
        for (var i = 0; i < quarter; i++) {
            seq.push({
                stimulus: formatAttr(attr1_stim[i % attr1_stim.length]),
                category: cat_attr1,
                left_category_label: labels_left, right_category_label: labels_right,
                stim_key_association: 'left', display_feedback: true, force_correct_key_press: true
            });
        }
        // 2 parts Attribute 2 (Right) - Doubled to balance keys
        for (var i = 0; i < (quarter * 2); i++) {
            seq.push({
                stimulus: formatAttr(attr2_stim[i % attr2_stim.length]),
                category: cat_attr2,
                left_category_label: labels_left, right_category_label: labels_right,
                stim_key_association: 'right', display_feedback: true, force_correct_key_press: true
            });
        }
        return jsPsych.randomization.shuffle(seq);
    }

    // Block 2 & 3: Target + Positive vs Negative
    var labels_L_pair1 = [target_label[0], attr_labels[0]];
    var labels_R_pair1 = [attr_labels[1]];
    
    var stimuli_b2 = createCombinedBlock(config.trial_count_combined_practice, labels_L_pair1, labels_R_pair1, attr_stim_pos, attr_stim_neg, 'positive', 'negative');
    var stimuli_b3 = createCombinedBlock(config.trial_count_combined_test,     labels_L_pair1, labels_R_pair1, attr_stim_pos, attr_stim_neg, 'positive', 'negative');

    // --- BLOCK 4: Attribute Switch (Neg vs Pos) ---
    var stimuli_b4 = [];
    for (var i = 0; i < config.trial_count_practice; i++) {
        stimuli_b4.push({
            stimulus: formatAttr(attr_stim_neg[i % attr_stim_neg.length]),
            category: 'negative',
            left_category_label: [attr_labels[1]], right_category_label: [attr_labels[0]],
            stim_key_association: 'left', display_feedback: true, force_correct_key_press: true
        });
        stimuli_b4.push({
            stimulus: formatAttr(attr_stim_pos[i % attr_stim_pos.length]),
            category: 'positive',
            left_category_label: [attr_labels[1]], right_category_label: [attr_labels[0]],
            stim_key_association: 'right', display_feedback: true, force_correct_key_press: true
        });
    }
    stimuli_b4 = jsPsych.randomization.shuffle(stimuli_b4);

    // Block 5 & 6: Target + Negative vs Positive
    var labels_L_pair2 = [target_label[0], attr_labels[1]]; // Target + Neg
    var labels_R_pair2 = [attr_labels[0]]; // Pos

    // Note: We swap the attr inputs here so "Negative" is the single part on the Left, and "Positive" is the double part on the Right
    var stimuli_b5 = createCombinedBlock(config.trial_count_combined_practice, labels_L_pair2, labels_R_pair2, attr_stim_neg, attr_stim_pos, 'negative', 'positive');
    var stimuli_b6 = createCombinedBlock(config.trial_count_combined_test,     labels_L_pair2, labels_R_pair2, attr_stim_neg, attr_stim_pos, 'negative', 'positive');

    // --- TRIAL DEFINITION ---
    var trial = {
        type: jsPsychIatHtml,
        stimulus: jsPsych.timelineVariable('stimulus'),
        stim_key_association: jsPsych.timelineVariable('stim_key_association'),
        html_when_wrong: '<span style="color: red; font-size: 80px">X</span>',
        force_correct_key_press: jsPsych.timelineVariable('force_correct_key_press'),
        display_feedback: jsPsych.timelineVariable('display_feedback'),
        left_category_key: 'e',
        right_category_key: 'i',
        left_category_label: jsPsych.timelineVariable('left_category_label'),
        right_category_label: jsPsych.timelineVariable('right_category_label'),
        response_ends_trial: true,
        data: {
            task: 'SC_IAT',
            category: jsPsych.timelineVariable('category'),
            left_label: jsPsych.timelineVariable('left_category_label'),
            right_label: jsPsych.timelineVariable('right_category_label')
        }
    };

    // --- TIMELINE BLOCKS ---
    var block_1 = { timeline: [trial], timeline_variables: stimuli_b1, randomize_order: true, data: { block_id: '1_AttrPractice' } };
    var block_2 = { timeline: [trial], timeline_variables: stimuli_b2, randomize_order: true, data: { block_id: '2_CombinedPractice1' } };
    var block_3 = { timeline: [trial], timeline_variables: stimuli_b3, randomize_order: true, data: { block_id: '3_CombinedTest1' } };
    var block_4 = { timeline: [trial], timeline_variables: stimuli_b4, randomize_order: true, data: { block_id: '4_AttrSwitch' } };
    var block_5 = { timeline: [trial], timeline_variables: stimuli_b5, randomize_order: true, data: { block_id: '5_CombinedPractice2' } };
    var block_6 = { timeline: [trial], timeline_variables: stimuli_b6, randomize_order: true, data: { block_id: '6_CombinedTest2' } };

    // --- INSTRUCTIONS ---
    var instr_main = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: "<h1>Single Category IAT</h1><p>Sort items into the groups displayed at the top.</p><p>'E' for Left, 'I' for Right.</p><p>Press SPACEBAR.</p>",
        choices: [' ']
    };
    
    // Dynamic Instructions using labels from config
    var instr_b1 = { type: jsPsychHtmlKeyboardResponse, stimulus: `<h2>Block 1</h2><p>Left: ${attr_labels[0]} <br> Right: ${attr_labels[1]}</p><p>Press SPACEBAR.</p>`, choices: [' '] };
    var instr_b2 = { type: jsPsychHtmlKeyboardResponse, stimulus: `<h2>Block 2</h2><p>Left: ${labels_L_pair1.join(" OR ")} <br> Right: ${labels_R_pair1}</p><p>Press SPACEBAR.</p>`, choices: [' '] };
    var instr_b3 = { type: jsPsychHtmlKeyboardResponse, stimulus: "<h2>Block 3</h2><p>Test Block. Same rules.</p><p>Press SPACEBAR.</p>", choices: [' '] };
    var instr_b4 = { type: jsPsychHtmlKeyboardResponse, stimulus: `<h2>Block 4</h2><p><strong>SWITCH!</strong><br>Left: ${attr_labels[1]} <br> Right: ${attr_labels[0]}</p><p>Press SPACEBAR.</p>`, choices: [' '] };
    var instr_b5 = { type: jsPsychHtmlKeyboardResponse, stimulus: `<h2>Block 5</h2><p>Left: ${labels_L_pair2.join(" OR ")} <br> Right: ${labels_R_pair2}</p><p>Press SPACEBAR.</p>`, choices: [' '] };
    var instr_b6 = { type: jsPsychHtmlKeyboardResponse, stimulus: "<h2>Block 6</h2><p>Final Test Block.</p><p>Press SPACEBAR.</p>", choices: [' '] };

    return {
        timeline: [
            instr_main,
            instr_b1, block_1,
            instr_b2, block_2,
            instr_b3, block_3,
            instr_b4, block_4,
            instr_b5, block_5,
            instr_b6, block_6
        ]
    };
}