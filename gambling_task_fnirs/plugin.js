var jsPsychGamblingTask = (function (jspsych) {
  "use strict";

  const info = {
    name: "gambling-task",
    parameters: {
      starting_points: {
        type: jspsych.ParameterType.INT,
        default: 100
      },
      com_port: {
        type: jspsych.ParameterType.STRING,
        default: "3"
      },
      // Timings (all in ms)
      timings: {
        type: jspsych.ParameterType.OBJECT,
        default: {
            post_choice: 3000,
            post_bet: 3000,
            post_outcome: 3000,
            bet_interval: 2000
        }
      },
      send_markers: {
    type: jspsych.ParameterType.BOOL,
    default: true // Default to TRUE so it works for normal blocks
  },
      bet_values: {
        type: jspsych.ParameterType.INT,
        array: true,
        default: [0.05, 0.25, 0.5, 0.75, 0.95]
      },
      n_redboxes: {
        type: jspsych.ParameterType.INT,
        default: 5
      }
    },
  };

  class GamblingTaskPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }
    trial(display_element, trial) {

      // --- 1. WebSocket Helper ---
      const sendMarker = (msg) => {
        try {
          if (trial.send_markers && typeof useWebSocket === "function") {
            useWebSocket(trial.com_port, msg);
          }
        } catch (err) {
          console.error("WebSocket error:", err);
        }
      };

      var response = {
        colour_rt: null, colour_key: null,
        bet_rt: null, bet_amount: null,
        colour_chosen: null, bet_proportion: null,
        respIsCorrect: null, outcome: null, end_total: null
      };

      sendMarker("t"); // Start Marker

      let score = trial.starting_points;
      let bet_values = trial.bet_values;
      let bet_proportion = bet_values[0];
      let betAmount = score * bet_values[0];
      let tokenPosition = Math.floor(Math.random() * 10);
      let isTokenRevealed = false;
      let chosenColor = null;
      let betIndex = 0;
      let betInterval;
      
      let afterColourTimeout, afterBetTimeout, endTimeout;

      const numberOfRedBoxes = trial.n_redboxes;
      const numberOfBlueBoxes = 10 - numberOfRedBoxes;

      // HTML Template
      var html = `
        <div id="jspsych-gambling-task">
            <div id="boxes"></div>
            <div id="prompts">
                <div id="prompt1">Choose the color of the box where you think the token is hidden.</div>
                <div id="prompt2">Press Z for Red or Press M for Blue</div>
            </div>
            <div id="game">
                <div id="colorChoice">
                    <div class="color-choice">
                        <div class="red choice-btn">Red</div>
                        <div class="blue choice-btn">Blue</div>
                    </div>
                </div>
                <div id="betControls" style="display: none;">
                    <div id="betCircle" class="bet-circle silver"></div>
                </div>
                <div id="scorec" class="gold">Current Score: <span id="score">${Math.round(score)}</span></div>
                <div id="results"></div>
            </div>
        </div>`;

      display_element.innerHTML = html;

      // Draw Boxes
      const boxesContainer = document.getElementById("boxes");
      for (let i = 0; i < numberOfRedBoxes; i++) {
        let box = document.createElement("div");
        box.className = "box red";
        boxesContainer.appendChild(box);
      }
      for (let i = 0; i < numberOfBlueBoxes; i++) {
        let box = document.createElement("div");
        box.className = "box blue";
        boxesContainer.appendChild(box);
      }

      // --- Logic Functions ---

      const end_trial = () => {
        this.jsPsych.pluginAPI.clearAllTimeouts();
        if (typeof keyboardListener !== "undefined") this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
        
        var trial_data = {
          /* ... (data saving logic same as before) ... */
          end_total: score
        };

        display_element.innerHTML = "";
        sendMarker("T"); // End Marker
        this.jsPsych.finishTrial(trial_data);
      };

      const increaseBetAmount = () => {
        if (betIndex === bet_values.length - 1) betIndex = 0;
        else betIndex++;
        
        bet_proportion = bet_values[betIndex];
        betAmount = score * bet_values[betIndex];
        document.getElementById("betCircle").textContent = Math.round(betAmount);
      };

      // PHASE 3: Reveal Result
      const showResults = () => {
        clearInterval(betInterval);
        sendMarker("w"); // Result Marker

        const isCorrect = (chosenColor === "red" && tokenPosition < numberOfRedBoxes) ||
                          (chosenColor === "blue" && tokenPosition >= numberOfRedBoxes);

        response.respIsCorrect = isCorrect;
        const outcome = isCorrect ? betAmount : -betAmount;
        response.outcome = outcome;
        score += outcome;
        response.end_total = score;

        const results = document.getElementById("results");
        let roundScore = Math.round(score);
        results.innerHTML = `You ${isCorrect ? "win" : "lose"} ${Math.round(Math.abs(outcome))} points. Score: ${roundScore}`;
        document.getElementById("score").textContent = roundScore;
        if (!isCorrect) document.getElementById("results").style.color = "red";

        if (!isTokenRevealed) {
          const boxes = document.getElementsByClassName("box");
          boxes[tokenPosition].classList.add("token");
          isTokenRevealed = true;
        }

        document.getElementById("betControls").style.display = "none";
        document.getElementById("colorChoice").style.display = "none";
        document.getElementById("prompts").style.display = "none";

        // CONFIGURABLE DELAY: Post-Outcome
        endTimeout = setTimeout(end_trial, trial.timings.post_outcome);
      };

      // PHASE 2: Handle Bet Selection
      const after_bet_response = (info) => {
        sendMarker("v"); // Bet Marker

        response.bet_rt = info.rt;
        response.bet_amount = betAmount;
        response.bet_proportion = bet_proportion;

        document.getElementById("prompt1").innerText = "You bet: " + Math.round(betAmount) + " points";
        document.getElementById("prompt2").innerText = "Please wait...";
        document.getElementById("betControls").style.display = "none";

        // CONFIGURABLE DELAY: Post-Bet
        afterBetTimeout = setTimeout(showResults, trial.timings.post_bet);
      };

      // PHASE 1: Handle Color Selection
      const after_colour_response = (info) => {
        sendMarker("u"); // Choice Marker

        chosenColor = (info.key.toLowerCase() === "z") ? "red" : "blue";
        response.colour_chosen = chosenColor;
        response.colour_rt = info.rt;
        response.colour_key = info.key;

        document.getElementById("colorChoice").style.display = "none";
        document.getElementById("prompt1").innerText = "You chose: " + chosenColor;
        document.getElementById("prompt2").innerText = "Please wait...";

        // CONFIGURABLE DELAY: Post-Choice
        afterColourTimeout = setTimeout(() => {
          document.getElementById("betControls").style.display = "block";
          document.getElementById("prompt1").innerText = "Choose the amount to bet on your choice";
          document.getElementById("prompt2").innerText = "Press SPACEBAR to bet";

          document.getElementById("betCircle").textContent = Math.round(betAmount);
          
          // CONFIGURABLE DELAY: Bet Interval
          betInterval = setInterval(increaseBetAmount, trial.timings.bet_interval);

          this.jsPsych.pluginAPI.getKeyboardResponse({
            callback_function: after_bet_response,
            valid_responses: [" "],
            rt_method: "performance",
            persist: false,
            allow_held_key: false,
          });
        }, trial.timings.post_choice);
      };

      // Start Listener
      var keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_colour_response,
        valid_responses: ["z", "m"],
        rt_method: "performance",
        persist: false,
        allow_held_key: false,
      });
    }
  }
  GamblingTaskPlugin.info = info;

  return GamblingTaskPlugin;
})(jsPsychModule);