// setup.js
// Requires: webSerial.js (for connectSerialPort and sendSerialMarker)
// Requires: jsPsychHtmlButtonResponse, jsPsychHtmlKeyboardResponse, jsPsychInstructions

function createSetupTimeline(jsPsych) {

    // 1. Connection Screen
// 1. Connection Screen
    // Global variable to track connection status across trials
    var is_device_connected = false;

    // 1. The Connection Trial
    var setup_connect_trial = {
        type: jsPsychHtmlButtonResponse,
        stimulus: function() {
            // Dynamic stimulus: Shows an error message if they failed previously
            let msg = `
                <h2>fNIRS Setup: Step 1</h2>
                <p>Please connect the USB serial cable.</p>
                <div style="margin: 20px; padding: 20px; background: #eee; border: 1px solid #ccc;">
                    <span id="connection-status" style="color: red; font-weight: bold;">Status: Disconnected</span>
                </div>
            `;
            // Add a red warning if this is a retry
            if (jsPsych.data.get().last(1).values()[0]?.connection_attempted) {
                 msg += `<p style="color:red; font-weight:bold;">Connection failed or cancelled. Please try again.</p>`;
            }
            return msg;
        },
        choices: ['Connect to USB Serial'],
        response_ends_trial: false, // We handle the finish manually
        on_load: function() {
            // Attach listener
            document.querySelector('.jspsych-btn').addEventListener('click', async (e) => {
                let btn = e.target;
                
                // Visual feedback: Disable button while processing
                btn.innerHTML = "Connecting...";
                btn.disabled = true;

                // Attempt Connection
                if (typeof connectSerialPort === "function") {
                    let success = await connectSerialPort();
                    
                    if (success) {
                        is_device_connected = true;
                        document.getElementById('connection-status').innerHTML = '<span style="color: green;">CONNECTED!</span>';
                        btn.innerHTML = "Success!";
                        
                        // Wait 1 second then finish
                        setTimeout(() => jsPsych.finishTrial({connection_attempted: true}), 1000);
                    } else {
                        // Failed: Finish trial immediately so the loop can reload it
                        is_device_connected = false;
                        jsPsych.finishTrial({connection_attempted: true}); 
                    }
                } else {
                    alert("Error: webSerial.js not loaded.");
                    jsPsych.finishTrial({connection_attempted: true});
                }
            });
        }
    };

    // 2. The Loop Node
    // This keeps repeating the trial above until 'is_device_connected' is true
    var setup_connect_loop = {
        timeline: [setup_connect_trial],
        loop_function: function() {
            if (is_device_connected) {
                return false; // Stop looping, move to next step
            } else {
                return true; // Connection failed, run trial again (reloads button)
            }
        }
    };

    // 3. Signal Test (Persistent Listener from previous step)
    var spaceListener;
    var setup_test_signal = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `
            <h2>fNIRS Setup: Step 2</h2>
            <p>Check the fNIRS software (COBI).</p> 
            <p>You should see a marker appear <strong>every time</strong> you press Space.</p>
            <div style="font-size: 24px; font-weight: bold; margin: 30px; padding: 20px; border: 2px dashed black;">
                Press [SPACE] to send marker "o" <br/>
                <span id="marker-feedback" style="color:gray; font-size:18px;">(Ready)</span>
            </div>
            <br/>
            <p>Press <strong>[C]</strong> to confirm and continue.</p>
        `,
        choices: ['c', 'C'], 
        on_load: function() {
            spaceListener = function(e) {
                if (e.key === " " || e.code === "Space") {
                    e.preventDefault();
                    if (typeof sendSerialMarker === "function") sendSerialMarker('o');
                    
                    let fb = document.getElementById('marker-feedback');
                    if(fb) {
                        fb.style.color = "green";
                        fb.innerText = "Marker Sent!";
                        setTimeout(() => { if(fb) { fb.style.color = "gray"; fb.innerText = "(Ready)"; }}, 200);
                    }
                }
            };
            document.addEventListener('keydown', spaceListener);
        },
        on_finish: function() {
            document.removeEventListener('keydown', spaceListener);
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
            setup_connect_loop, 
            setup_test_signal, 
            setup_instructions, 
            setup_baseline_instruction, 
            setup_baseline_recording
        ]
    };
}