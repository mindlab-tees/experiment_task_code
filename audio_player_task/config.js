// config.js
const experimentConfig = {
    audioTask: {
        testStimulus: "Audio_Test.wav",
        conditions: {
            "standard": "Audio_Standard.mp3",
            "brum": "Audio_Brum.mp3",
            "ne": "Audio_NE.mp3",
            "rp": "Audio_RP.mp3",
            "scot": "Audio_Scot.mp3"
        },
        instructions: {
            //
            testAudioHeader: `
                <p id="title"><strong>Instructions</strong></p>
                <span id="instructions">
                <p>Before we start, we need to check that you can hear the sound from the computer correctly. 
                Make sure your headphone volume is correctly adjusted. On the next screen some test audio will play.</p>
                </span>`,
            testAudioButton: "Click here to test audio",
            // Prompt from experimental code snippet
            testAudioPrompt: `
                <div style="width: 500px; margin: auto;">
                    <p>You should now hear some sample audio. Make sure your headphone volume is loud enough 
                    to hear and understand the sample audio. If you cannot hear it well, press <strong>N</strong> 
                    on the keyboard to replay it. If you can hear well and would like to continue, 
                    press <strong>Y</strong> on the keyboard to continue.</p>
                </div>`,
            //
            mainInterviewHeader: `
                <p id="title"><strong>Instructions</strong></p>
                <span id="instructions">
                <p>You will now hear a narration. Click play to listen.</p>
                </span>`,
            mainInterviewButton: "Click here to play the narration"
        }
    }
};