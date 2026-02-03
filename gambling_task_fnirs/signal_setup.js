// setup.js
// Requires: webSerial.js (for connectSerialPort and sendSerialMarker)
// Requires: jsPsychHtmlButtonResponse, jsPsychHtmlKeyboardResponse, jsPsychInstructions

function createSetupTimeline(jsPsych) {

    // 1. Connection Screen
    var setup_connect = {
        type: jsPsychHtmlButtonResponse,
        stimulus: `
            <h2>fNIRS Setup: Step 1</h2>
            <p>Please connect the USB serial cable to this computer.</p>
            <p>Click the button below, select the <strong>USB Serial Device</strong> from the list, and click 'Connect'.</p>
            <div style="margin: 20px; padding: 20px; background: #eee; border: 1px solid #ccc;">
                <span id="connection-status" style="color: red; font-weight: bold;">Status: Disconnected</span>
            </div>
        `,
        choices: ['Connect'],
        on_load: function() {
            // Attach listener to the jsPsych button
            document.querySelector('.jspsych-btn').addEventListener('click', async (e) => {
                e.preventDefault(); // Prevent immediate advance
                
                // Attempt connection using webSerial.js
                if (typeof connectSerialPort === "function") {
                    let success = await connectSerialPort();
                    if (success) {
                        document.getElementById('connection-status').innerHTML = '<span style="color: green;">CONNECTED!</span>';
                        // Wait 1 second then advance automatically
                        setTimeout(() => jsPsych.finishTrial(), 1000);
                    }
                } else {
                    alert("Error: webSerial.js not loaded.");
                }
            });
        }
    };

    // 2. Signal Test (Spacebar Loop)
    var setup_test_signal = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `
            <h2>fNIRS Setup: Step 2</h2>
            <p>Check the fNIRS software (COBI). You should see a marker appear when you press Space.</p>
            <div style="font-size: 24px; font-weight: bold; margin: 30px; padding: 20px; border: 2px dashed black;">
                Press [SPACE] to send marker "o" <br/>
                Press [C] to confirm and continue
            </div>
        `,
        choices: [' ', 'c', 'C'],
        on_finish: function(data) {
            // If space was pressed, send marker
            if (jsPsych.pluginAPI.compareKeys(data.response, ' ')) {
                if (typeof sendSerialMarker === "function") sendSerialMarker('o');
            }
        }
    };

    // Loop function
    var setup_test_loop = {
        timeline: [setup_test_signal],
        loop_function: function(data) {
            // Keep looping if they pressed Space
            if (jsPsych.pluginAPI.compareKeys(data.values()[0].response, ' ')) {
                return true; 
            } else {
                return false; // Stop if they pressed C
            }
        }
    };

    // 3. Setup Instructions
    var setup_instructions = {
        type: jsPsychInstructions,
        pages: [
            '<h2>Step 3: Participant Setup</h2><p>Place headband on participant. Check position and coverage.</p>',
            '<h2>Step 4: Signal Check</h2><p>Check raw intensity values in COBI. Adjust LED Drive Current and Gain as needed.</p>',
            '<h2>Step 5: Start Recording</h2><p>Click "Start New Experiment" in COBI Studio.</p>'
        ],
        show_clickable_nav: true
    };

    // 4. Baseline
    var setup_baseline_instruction = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: '<h2>Step 6: Baseline</h2><p>Ask participant to remain still. Press <b>Z</b> to start the 20s baseline recording.</p>',
        choices: ['z', 'Z'],
    };

    var setup_baseline_recording = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: '<div style="font-size:60px;">+</div>',
        choices: "NO_KEYS",
        trial_duration: 20000,
        on_start: function() {
            if (typeof sendSerialMarker === "function") {
                sendSerialMarker("b");
                console.log("Baseline Started (Marker b)");
            }
        },
        on_finish: function() {
            if (typeof sendSerialMarker === "function") {
                sendSerialMarker("B");
                console.log("Baseline Ended (Marker B)");
            }
        }
    };

    // Return the timeline object
    return {
        timeline: [
            setup_connect, 
            setup_test_loop, 
            setup_instructions, 
            setup_baseline_instruction, 
            setup_baseline_recording
        ]
    };
}