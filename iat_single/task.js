// task_sciat.js
//  Single Category IAT for jsPsych
// Christopher Wilson 2026 (comments to code added by AI tools for clarity)
// Wilson-Medimorec MIND Lab - https://themindlab.uk
// requires jsPsychIatHtml plugin
// Implements Karpinski & Steinman (2006) logic: Fixed Attributes, Moving Target

function createSCIATTask(jsPsych, config) {

    // Extract Config
    var target_label = config.target_label;
    var attr_labels  = config.attribute_labels; // [Positive, Negative]
    
    var target_stim  = config.target_stimuli;
    var attr_stim_pos = config.attribute_stimuli_pos;
    var attr_stim_neg = config.attribute_stimuli_neg;

    // Helper: Detect if stimulus is an image file extension or text
    function formatStim(item) {
        if (item.includes('.png') || item.includes('.jpg') || item.includes('.jpeg')) {
            return "<img src='" + item + "' height='200px'></img>";
        }
        return item;
    }

    // Helper: Format Attributes (if config says they are images)
    function formatAttr(item) {
        if (config.attributes_are_images) {
            return "<img src='" + item + "' height='200px'></img>";
        }
        return item;
    }

    // --- BLOCK 1: Attribute Discrimination (Pos vs Neg) ---
    var stimuli_b1 = [];
    for (var i = 0; i < 10; i++) { // 20 trials total
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

    // --- HELPER: SC-IAT RATIO LOGIC ---
    // The SC-IAT requires a 50/50 response split.
    // Logic: 1 Target : 1 Shared_Attribute : 2 Single_Attribute
    
    function createCombinedBlock(total_trials, labels_left, labels_right, side_with_two_items) {
        var seq = [];
        var units = Math.floor(total_trials / 4);

        // Identify which attribute is "Shared" (same side as target) and which is "Single"
        var shared_attr_stim = (side_with_two_items === 'left') ? attr_stim_pos : attr_stim_neg;
        var single_attr_stim = (side_with_two_items === 'left') ? attr_stim_neg : attr_stim_pos;
        
        var shared_category = (side_with_two_items === 'left') ? 'positive' : 'negative';
        var single_category = (side_with_two_items === 'left') ? 'negative' : 'positive';

        // Target Key
        var target_key = (side_with_two_items === 'left') ? 'left' : 'right';
        var single_key = (side_with_two_items === 'left') ? 'right' : 'left';

        for (var i = 0; i < units; i++) {
            // 1. Target Trial
            seq.push({
                stimulus: formatStim(target_stim[i % target_stim.length]),
                category: 'target',
                left_category_label: labels_left, right_category_label: labels_right,
                stim_key_association: target_key, display_feedback: true, force_correct_key_press: true
            });

            // 2. Shared Attribute Trial (1x)
            seq.push({
                stimulus: formatAttr(shared_attr_stim[i % shared_attr_stim.length]),
                category: shared_category,
                left_category_label: labels_left, right_category_label: labels_right,
                stim_key_association: target_key, display_feedback: true, force_correct_key_press: true
            });

            // 3. Single Attribute Trial (2x) - Doubled to balance keys
            for (var k = 0; k < 2; k++) {
                seq.push({
                    stimulus: formatAttr(single_attr_stim[(i*2 + k) % single_attr_stim.length]),
                    category: single_category,
                    left_category_label: labels_left, right_category_label: labels_right,
                    stim_key_association: single_key, display_feedback: true, force_correct_key_press: true
                });
            }
        }
        return jsPsych.randomization.shuffle(seq);
    }

    // --- PAIRING 1: Target shares key with POSITIVE (Left) ---
    var labels_L_pair1 = [target_label, attr_labels[0]]; // Gambling + Pos
    var labels_R_pair1 = [attr_labels[1]];               // Neg
    
    var stimuli_b2 = createCombinedBlock(config.trial_count_practice, labels_L_pair1, labels_R_pair1, 'left');
    var stimuli_b3 = createCombinedBlock(config.trial_count_test,     labels_L_pair1, labels_R_pair1, 'left');

    // --- PAIRING 2: Target shares key with NEGATIVE (Right) ---
    // Note: Attributes stay fixed (Pos=Left, Neg=Right). Target moves Right.
    var labels_L_pair2 = [attr_labels[0]];               // Pos
    var labels_R_pair2 = [target_label, attr_labels[1]]; // Gambling + Neg

    var stimuli_b4 = createCombinedBlock(config.trial_count_practice, labels_L_pair2, labels_R_pair2, 'right');
    var stimuli_b5 = createCombinedBlock(config.trial_count_test,     labels_L_pair2, labels_R_pair2, 'right');


    // --- TRIAL TEMPLATE ---
    var trial = {
        type: jsPsychIatHtml,
        stimulus: jsPsych.timelineVariable('stimulus'),
        stim_key_association: jsPsych.timelineVariable('stim_key_association'),
        html_when_wrong: '<span style="color: red; font-size: 80px">X</span>',
        force_correct_key_press: true,
        left_category_key: 'e',
        right_category_key: 'i',
        left_category_label: jsPsych.timelineVariable('left_category_label'),
        right_category_label: jsPsych.timelineVariable('right_category_label'),
        response_ends_trial: true,
        display_feedback: true,
        data: {
            task: 'SC_IAT',
            category: jsPsych.timelineVariable('category')
        }
    };

    // --- BLOCKS ---
    var block_1 = { timeline: [trial], timeline_variables: stimuli_b1, randomize_order: true, data: { block_id: '1_AttrPractice' } };
    var block_2 = { timeline: [trial], timeline_variables: stimuli_b2, randomize_order: true, data: { block_id: '2_Pair1_Practice' } };
    var block_3 = { timeline: [trial], timeline_variables: stimuli_b3, randomize_order: true, data: { block_id: '3_Pair1_Test' } };
    var block_4 = { timeline: [trial], timeline_variables: stimuli_b4, randomize_order: true, data: { block_id: '4_Pair2_Practice' } };
    var block_5 = { timeline: [trial], timeline_variables: stimuli_b5, randomize_order: true, data: { block_id: '5_Pair2_Test' } };

    // --- INSTRUCTIONS ---
    var instr_main = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: "<h1>Single Category IAT</h1><p>Sort items into groups.</p><p>'E' for Left, 'I' for Right.</p><p>Press SPACEBAR.</p>",
        choices: [' ']
    };

    var instr_b1 = { type: jsPsychHtmlKeyboardResponse, stimulus: `<h2>Block 1</h2><p>Left: ${attr_labels[0]} <br> Right: ${attr_labels[1]}</p><p>Press SPACEBAR.</p>`, choices: [' '] };
    var instr_b2 = { type: jsPsychHtmlKeyboardResponse, stimulus: `<h2>Block 2</h2><p>Left: ${labels_L_pair1.join(" OR ")} <br> Right: ${labels_R_pair1}</p><p>Press SPACEBAR.</p>`, choices: [' '] };
    var instr_b3 = { type: jsPsychHtmlKeyboardResponse, stimulus: `<h2>Block 3</h2><p>Test Block. Same rules.</p><p>Press SPACEBAR.</p>`, choices: [' '] };
    var instr_b4 = { type: jsPsychHtmlKeyboardResponse, stimulus: `<h2>Block 4</h2><p><strong>SWITCH!</strong><br>The category <strong>${target_label}</strong> has moved to the RIGHT.</p><p>Left: ${labels_L_pair2} <br> Right: ${labels_R_pair2.join(" OR ")}</p><p>Press SPACEBAR.</p>`, choices: [' '] };
    var instr_b5 = { type: jsPsychHtmlKeyboardResponse, stimulus: `<h2>Block 5</h2><p>Final Test Block.</p><p>Press SPACEBAR.</p>`, choices: [' '] };

    return {
        timeline: [
            instr_main,
            instr_b1, block_1,
            instr_b2, block_2,
            instr_b3, block_3,
            instr_b4, block_4,
            instr_b5, block_5
        ]
    };
}