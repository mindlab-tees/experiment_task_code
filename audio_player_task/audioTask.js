// audioTask.js
// Requires: jsPsychPreload, jsPsychAudioKeyboardResponse, jsPsychHtmlButtonResponse

function createAudioTaskTimeline(jsPsych, currentCondition, config) {

    // Media Preloading
    var preload_trial = {
        type: jsPsychPreload,
        audio: [config.testStimulus, ...Object.values(config.conditions)],
        message: 'Loading experimental media. Please wait...',
        data: { phase: 'preload' }
    };

    //  Audio Test Instructions
    var test_instructions = {
        type: jsPsychHtmlButtonResponse,
        stimulus: config.instructions.testAudioHeader, //
        choices: [config.instructions.testAudioButton], //
        button_html: '<button type="button" class="btn btn-success">%choice%</button>',
        data: { phase: 'audio_test_instructions' }
    };

    //  Audio Test Trial & Loop
    var test_audio_trial = {
        type: jsPsychAudioKeyboardResponse,
        stimulus: config.testStimulus,
        choices: ["y", "n"],
        prompt: config.instructions.testAudioPrompt,
        trial_ends_after_audio: false,
        data: { phase: "test_audio" }
    };

    var test_audio_loop = {
        timeline: [test_audio_trial],
        loop_function: function(data) {
            return !jsPsych.pluginAPI.compareKeys(data.values()[0].response, 'y');
        }
    };

    // Main Audio Instructions
    var main_audio_instructions = {
        type: jsPsychHtmlButtonResponse,
        stimulus: config.instructions.mainInterviewHeader, //
        choices: [config.instructions.mainInterviewButton], //
        button_html: '<button type="button" class="btn btn-success">%choice%</button>',
        data: { phase: 'main_audio_instructions' }
    };

    //  Condition-Based Audio Trial
    var main_audio_trial = {
        type: jsPsychAudioKeyboardResponse,
        stimulus: function() {
            return config.conditions[currentCondition];
        },
        choices: "NO_KEYS",
        trial_ends_after_audio: true,
        prompt: "<p>Audio playing...</p>",
        data: { 
            phase: "main_audio",
            condition: currentCondition 
        }
    };

    return {
        timeline: [
            preload_trial,
            test_instructions, 
            test_audio_loop, 
            main_audio_instructions, 
            main_audio_trial
        ]
    };
}