// IAT Task for JS-Psych
// This function creates a full Implicit Association Test (IAT) task sequence
// using the jsPsych library. It includes practice and test blocks with
// configurable attributes, categories, and stimuli.

// Created by Christopher Wilson (2025-2026) and adapted from prior work.
// Comments added by AI for clarity. - Let me know if anything does not make sense!
// Wilson-Medimorec MIND Lab - https://themindlab.uk
// Requires jsPsych and jsPsychIatHtml plugin.


function createIATTask(jsPsych, config) {

    // 1. Extract Configuration Variables
    // We use default values (||) if specific settings aren't provided
    var attributes = config.attributes; // e.g. ['Gambling', 'Other']
    var categories = config.categories; // e.g. ['Sports', 'Hobbies']
    
    var attr_stim_0 = config.attr_stim_0; // List for Attribute 0 (Left in Block 1)
    var attr_stim_1 = config.attr_stim_1; // List for Attribute 1 (Right in Block 1)
    var cat_stim_0 = config.cat_stim_0;   // List for Category 0 (Left in Block 2)
    var cat_stim_1 = config.cat_stim_1;   // List for Category 1 (Right in Block 2)

    var block_length = config.block_length || 20;
    var long_block_length = config.long_block_length || 40;

    // Helper: Formats stimulus as HTML image or Text based on config
    function formatStim(item, isImage) {
        if (isImage) {
            return "<img src='" + item + "' height='200px'></img>";
        }
        return item; // Return plain text
    }

    // --- LOGIC START (Adapted from your original code) ---

    // Block 1: Attributes Practice
    var stimuli_block_1_unshuffled = [];
    var trials_per = Math.floor(block_length / 2);

    for (var i = 0; i < trials_per; i++) {
        stimuli_block_1_unshuffled.push({
            stimulus: formatStim(attr_stim_0[i % attr_stim_0.length], config.attr_is_image),
            stim_id: attr_stim_0[i % attr_stim_0.length],
            stim_type: "attribute",
            stim_group: attributes[0],
            iat_condition: "practice",
            left_category_label: [attributes[0]],
            right_category_label: [attributes[1]],
            stim_key_association: 'left',
            display_feedback: true,
            force_correct_key_press: true
        });
        stimuli_block_1_unshuffled.push({
            stimulus: formatStim(attr_stim_1[i % attr_stim_1.length], config.attr_is_image),
            stim_id: attr_stim_1[i % attr_stim_1.length],
            stim_type: "attribute",
            stim_group: attributes[1],
            iat_condition: "practice",
            left_category_label: [attributes[0]],
            right_category_label: [attributes[1]],
            stim_key_association: 'right',
            display_feedback: true,
            force_correct_key_press: true
        });
    }
    var stimuli_block_1 = jsPsych.randomization.shuffle(stimuli_block_1_unshuffled);

    // Block 2: Categories Practice
    var stimuli_block_2_unshuffled = [];
    for (var i = 0; i < trials_per; i++) {
        stimuli_block_2_unshuffled.push({
            stimulus: formatStim(cat_stim_0[i % cat_stim_0.length], config.cat_is_image),
            stim_id: cat_stim_0[i % cat_stim_0.length],
            stim_type: "category",
            stim_group: categories[0],
            iat_condition: "practice",
            left_category_label: [categories[0]],
            right_category_label: [categories[1]],
            stim_key_association: 'left',
            display_feedback: true,
            force_correct_key_press: true
        });
        stimuli_block_2_unshuffled.push({
            stimulus: formatStim(cat_stim_1[i % cat_stim_1.length], config.cat_is_image),
            stim_id: cat_stim_1[i % cat_stim_1.length],
            stim_type: "category",
            stim_group: categories[1],
            iat_condition: "practice",
            left_category_label: [categories[0]],
            right_category_label: [categories[1]],
            stim_key_association: 'right',
            display_feedback: true,
            force_correct_key_press: true
        });
    }
    var stimuli_block_2 = jsPsych.randomization.shuffle(stimuli_block_2_unshuffled);

    // Block 3 & 4: Combined (Compatible)
    // Labels: Left = [Attr0, Cat0], Right = [Attr1, Cat1]
    var labels_left_3 = [attributes[0], categories[0]];
    var labels_right_3 = [attributes[1], categories[1]];

    function createCombinedBlock(length, blockType) {
        var sequence = [];
        var trials_quad = Math.floor(length / 4);
        
        for (var i = 0; i < trials_quad; i++) {
            // Cat 0 (Left)
            sequence.push({
                stimulus: formatStim(cat_stim_0[i % cat_stim_0.length], config.cat_is_image),
                stim_id: cat_stim_0[i % cat_stim_0.length],
                stim_type: "category",
                stim_group: categories[0],
                iat_condition: "compatible",
                block_type: blockType,
                left_category_label: labels_left_3,
                right_category_label: labels_right_3,
                stim_key_association: 'left',
                display_feedback: true,
                force_correct_key_press: true
            });
            // Attr 0 (Left)
            sequence.push({
                stimulus: formatStim(attr_stim_0[i % attr_stim_0.length], config.attr_is_image),
                stim_id: attr_stim_0[i % attr_stim_0.length],
                stim_type: "attribute",
                stim_group: attributes[0],
                iat_condition: "compatible",
                block_type: blockType,
                left_category_label: labels_left_3,
                right_category_label: labels_right_3,
                stim_key_association: 'left',
                display_feedback: true,
                force_correct_key_press: true
            });
            // Cat 1 (Right)
            sequence.push({
                stimulus: formatStim(cat_stim_1[i % cat_stim_1.length], config.cat_is_image),
                stim_id: cat_stim_1[i % cat_stim_1.length],
                stim_type: "category",
                stim_group: categories[1],
                iat_condition: "compatible",
                block_type: blockType,
                left_category_label: labels_left_3,
                right_category_label: labels_right_3,
                stim_key_association: 'right',
                display_feedback: true,
                force_correct_key_press: true
            });
            // Attr 1 (Right)
            sequence.push({
                stimulus: formatStim(attr_stim_1[i % attr_stim_1.length], config.attr_is_image),
                stim_id: attr_stim_1[i % attr_stim_1.length],
                stim_type: "attribute",
                stim_group: attributes[1],
                iat_condition: "compatible",
                block_type: blockType,
                left_category_label: labels_left_3,
                right_category_label: labels_right_3,
                stim_key_association: 'right',
                display_feedback: true,
                force_correct_key_press: true
            });
        }
        return jsPsych.randomization.shuffle(sequence);
    }

    var stimuli_block_3 = createCombinedBlock(block_length, 'practice');
    var stimuli_block_4 = createCombinedBlock(long_block_length, 'test');

    // Block 5: Reversed Attributes
    var stimuli_block_5_unshuffled = [];
    for (var i = 0; i < trials_per; i++) {
        // Attr 0 is now Right
        stimuli_block_5_unshuffled.push({
            stimulus: formatStim(attr_stim_0[i % attr_stim_0.length], config.attr_is_image),
            stim_id: attr_stim_0[i % attr_stim_0.length],
            stim_type: "attribute",
            stim_group: attributes[0],
            iat_condition: "practice",
            left_category_label: [attributes[1]],
            right_category_label: [attributes[0]],
            stim_key_association: 'right', 
            display_feedback: true,
            force_correct_key_press: true
        });
        // Attr 1 is now Left
        stimuli_block_5_unshuffled.push({
            stimulus: formatStim(attr_stim_1[i % attr_stim_1.length], config.attr_is_image),
            stim_id: attr_stim_1[i % attr_stim_1.length],
            stim_type: "attribute",
            stim_group: attributes[1],
            iat_condition: "practice",
            left_category_label: [attributes[1]],
            right_category_label: [attributes[0]],
            stim_key_association: 'left',
            display_feedback: true,
            force_correct_key_press: true
        });
    }
    var stimuli_block_5 = jsPsych.randomization.shuffle(stimuli_block_5_unshuffled);

    // Block 6 & 7: Reversed Combined (Incompatible)
    // Labels: Left = [Attr1, Cat0], Right = [Attr0, Cat1]
    var labels_left_6 = [attributes[1], categories[0]];
    var labels_right_6 = [attributes[0], categories[1]];

    function createReversedBlock(length, blockType) {
        var sequence = [];
        var trials_quad = Math.floor(length / 4);
        
        for (var i = 0; i < trials_quad; i++) {
            // Cat 0 (Left)
            sequence.push({
                stimulus: formatStim(cat_stim_0[i % cat_stim_0.length], config.cat_is_image),
                stim_id: cat_stim_0[i % cat_stim_0.length],
                stim_type: "category",
                stim_group: categories[0],
                iat_condition: "incompatible",
                block_type: blockType,
                left_category_label: labels_left_6,
                right_category_label: labels_right_6,
                stim_key_association: 'left',
                display_feedback: true,
                force_correct_key_press: true
            });
            // Attr 0 (Right) - REVERSED
            sequence.push({
                stimulus: formatStim(attr_stim_0[i % attr_stim_0.length], config.attr_is_image),
                stim_id: attr_stim_0[i % attr_stim_0.length],
                stim_type: "attribute",
                stim_group: attributes[0],
                iat_condition: "incompatible",
                block_type: blockType,
                left_category_label: labels_left_6,
                right_category_label: labels_right_6,
                stim_key_association: 'right',
                display_feedback: true,
                force_correct_key_press: true
            });
            // Cat 1 (Right)
            sequence.push({
                stimulus: formatStim(cat_stim_1[i % cat_stim_1.length], config.cat_is_image),
                stim_id: cat_stim_1[i % cat_stim_1.length],
                stim_type: "category",
                stim_group: categories[1],
                iat_condition: "incompatible",
                block_type: blockType,
                left_category_label: labels_left_6,
                right_category_label: labels_right_6,
                stim_key_association: 'right',
                display_feedback: true,
                force_correct_key_press: true
            });
            // Attr 1 (Left) - REVERSED
            sequence.push({
                stimulus: formatStim(attr_stim_1[i % attr_stim_1.length], config.attr_is_image),
                stim_id: attr_stim_1[i % attr_stim_1.length],
                stim_type: "attribute",
                stim_group: attributes[1],
                iat_condition: "incompatible",
                block_type: blockType,
                left_category_label: labels_left_6,
                right_category_label: labels_right_6,
                stim_key_association: 'left',
                display_feedback: true,
                force_correct_key_press: true
            });
        }
        return jsPsych.randomization.shuffle(sequence);
    }

    var stimuli_block_6 = createReversedBlock(block_length, 'practice');
    var stimuli_block_7 = createReversedBlock(long_block_length, 'test');

    // --- TIMELINE VARIABLES DEFINITION ---
    var trial = {
        type: jsPsychIatHtml,
        stimulus: jsPsych.timelineVariable('stimulus'),
        stim_key_association: jsPsych.timelineVariable('stim_key_association'),
        html_when_wrong: '<span style="color: red; font-size: 80px">X</span>',
        force_correct_key_press: jsPsych.timelineVariable('force_correct_key_press'),
        trial_duration: 3000,
        left_category_key: 'e',
        right_category_key: 'i',
        left_category_label: jsPsych.timelineVariable('left_category_label'),
        right_category_label: jsPsych.timelineVariable('right_category_label'),
        response_ends_trial: true,
        display_feedback: jsPsych.timelineVariable('display_feedback'),
        data: {
            stim_type: jsPsych.timelineVariable('stim_type'),
            stim_group: jsPsych.timelineVariable('stim_group'),
            left_category_label: jsPsych.timelineVariable('left_category_label'),
            right_category_label: jsPsych.timelineVariable('right_category_label'),
            stimulus: jsPsych.timelineVariable('stim_id')
        }
    };

    var block_1 = { timeline: [trial], timeline_variables: stimuli_block_1, randomize_order: true, data: { task: 'IAT', block: '1' } };
    var block_2 = { timeline: [trial], timeline_variables: stimuli_block_2, randomize_order: true, data: { task: 'IAT', block: '2' } };
    var block_3 = { timeline: [trial], timeline_variables: stimuli_block_3, randomize_order: true, data: { task: 'IAT', block: '3' } };
    var block_4 = { timeline: [trial], timeline_variables: stimuli_block_4, randomize_order: true, data: { task: 'IAT', block: '4' } };
    var block_5 = { timeline: [trial], timeline_variables: stimuli_block_5, randomize_order: true, data: { task: 'IAT', block: '5' } };
    var block_6 = { timeline: [trial], timeline_variables: stimuli_block_6, randomize_order: true, data: { task: 'IAT', block: '6' } };
    var block_7 = { timeline: [trial], timeline_variables: stimuli_block_7, randomize_order: true, data: { task: 'IAT', block: '7' } };

    // --- INSTRUCTIONS ---
    var iat_instructions_main = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: "<h1>Task Instructions</h1><p>In this task, you will sort words and images into groups.</p><p>Use the <strong>'E' key</strong> for LEFT and <strong>'I' key</strong> for RIGHT.</p><p>Go as FAST as you can while being ACCURATE.</p><p>Press SPACEBAR to begin.</p>",
        choices: [' ']
    };

    var instructions_b1 = { type: jsPsychHtmlKeyboardResponse, stimulus: "<h2>Block 1 of 7</h2><p>Press <strong>'E'</strong> for <strong>" + attributes[0] + "</strong>.</p><p>Press <strong>'I'</strong> for <strong>" + attributes[1] + "</strong>.</p><p>Press SPACEBAR to start.</p>", choices: [' '] };
    var instructions_b2 = { type: jsPsychHtmlKeyboardResponse, stimulus: "<h2>Block 2 of 7</h2><p>Press <strong>'E'</strong> for <strong>" + categories[0] + "</strong>.</p><p>Press <strong>'I'</strong> for <strong>" + categories[1] + "</strong>.</p><p>Press SPACEBAR to start.</p>", choices: [' '] };
    var instructions_b3 = { type: jsPsychHtmlKeyboardResponse, stimulus: "<h2>Block 3 of 7</h2><p>Press <strong>'E'</strong> for <strong>" + attributes[0] + "</strong> OR <strong>" + categories[0] + "</strong>.</p><p>Press <strong>'I'</strong> for <strong>" + attributes[1] + "</strong> OR <strong>" + categories[1] + "</strong>.</p><p>Press SPACEBAR to start.</p>", choices: [' '] };
    var instructions_b4 = { type: jsPsychHtmlKeyboardResponse, stimulus: "<h2>Block 4 of 7</h2><p>Test Block. Same rules.</p><p>Press SPACEBAR to start.</p>", choices: [' '] };
    var instructions_b5 = { type: jsPsychHtmlKeyboardResponse, stimulus: "<h2>Block 5 of 7</h2><p><strong>SWITCH!</strong></p><p>Press <strong>'E'</strong> for <strong>" + attributes[1] + "</strong>.</p><p>Press <strong>'I'</strong> for <strong>" + attributes[0] + "</strong>.</p><p>Press SPACEBAR to start.</p>", choices: [' '] };
    var instructions_b6 = { type: jsPsychHtmlKeyboardResponse, stimulus: "<h2>Block 6 of 7</h2><p>Press <strong>'E'</strong> for <strong>" + labels_left_6.join('</strong> OR <strong>') + "</strong>.</p><p>Press <strong>'I'</strong> for <strong>" + labels_right_6.join('</strong> OR <strong>') + "</strong>.</p><p>Press SPACEBAR to start.</p>", choices: [' '] };
    var instructions_b7 = { type: jsPsychHtmlKeyboardResponse, stimulus: "<h2>Block 7 of 7</h2><p>Final Test Block.</p><p>Press SPACEBAR to start.</p>", choices: [' '] };

    var iat_full_sequence = {
        timeline: [
            iat_instructions_main, instructions_b1, block_1,
            instructions_b2, block_2,
            instructions_b3, block_3,
            instructions_b4, block_4,
            instructions_b5, block_5,
            instructions_b6, block_6,
            instructions_b7, block_7
        ]
    };

    return iat_full_sequence;
}