var jsPsychGamblingTask = (function (jspsych) {
  "use strict";

  const info = {
    name: "gambling-task",
    parameters: {
      starting_points: {
        type: jspsych.ParameterType.INT,
        default: 100
      },
      cumulative_bankruptcies: {
        type: jspsych.ParameterType.INT,
        default: 0
      },
      com_port: {
        type: jspsych.ParameterType.STRING,
        default: "3"
      },
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
        default: true 
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

      const sendMarker = (msg) => {
        if (trial.send_markers) {
            if (typeof sendSerialMarker === "function") {
                sendSerialMarker(msg);
            }
        }
      };

      var response = {
        colour_rt: null, colour_key: null,
        bet_rt: null, bet_amount: null,
        colour_chosen: null, bet_proportion: null,
        respIsCorrect: null, outcome: null, end_total: null,
        bankruptcy_triggered: false 
      };

      sendMarker("t"); 

      let score = trial.starting_points;
      let bet_values = trial.bet_values;
      let bet_proportion = bet_values[0];
      
      // FIX 1: Force Integer immediately
      let betAmount = Math.round(score * bet_values[0]); 
      if (betAmount < 1) betAmount = 1; // Minimum bet of 1

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
          starting_points: trial.starting_points,
          colour_rt: response.colour_rt,
          colour_key: response.colour_key,
          colour_chosen: response.colour_chosen,
          bet_amount: response.bet_amount,
          bet_proportion: response.bet_proportion,
          bet_rt: response.bet_rt,
          bet_values: trial.bet_values,
          n_redboxes: trial.n_redboxes,
          n_blueboxes: 10 - trial.n_redboxes,
          tokenPosition: tokenPosition,
          respIsCorrect: response.respIsCorrect,
          outcome: response.outcome,
          end_total: score,
          bankruptcy_triggered: response.bankruptcy_triggered
        };

        display_element.innerHTML = "";
        sendMarker("T"); 
        this.jsPsych.finishTrial(trial_data);
      };

      const increaseBetAmount = () => {
        if (betIndex === bet_values.length - 1) betIndex = 0;
        else betIndex++;
        
        bet_proportion = bet_values[betIndex];
        
        // FIX 2: Force Integer here too
        betAmount = Math.round(score * bet_values[betIndex]);
        if (betAmount < 1) betAmount = 1;

        document.getElementById("betCircle").textContent = betAmount;
      };

      // PHASE 3: Reveal Result
      const showResults = () => {
        clearInterval(betInterval);
        sendMarker("w"); 

        const isCorrect = (chosenColor === "red" && tokenPosition < numberOfRedBoxes) ||
                          (chosenColor === "blue" && tokenPosition >= numberOfRedBoxes);

        response.respIsCorrect = isCorrect;
        
        // betAmount is now guaranteed integer, so outcome is integer
        const outcome = isCorrect ? betAmount : -betAmount;
        response.outcome = outcome;
        
        score += outcome;

        const results = document.getElementById("results");

        // FIX 3: Robust Bankruptcy Check
        // Now that score is integer, (score <= 0) will trigger reliably
        if (score <= 0) {
            response.bankruptcy_triggered = true;
            
            // Safe Parsing: Ensure we have a valid number
            let current_b = 0;
            if (typeof trial.cumulative_bankruptcies === 'number') {
                current_b = trial.cumulative_bankruptcies;
            } else if (typeof trial.cumulative_bankruptcies === 'function') {
                // If jsPsych passed the function itself (rare but possible)
                current_b = trial.cumulative_bankruptcies();
            }

            let new_b_count = current_b + 1; 
            let top_up = Math.floor(50 / new_b_count);
            
            // Visual Update
            results.innerHTML = `
                <p style="color:red; font-weight:bold;">You lose ${Math.abs(outcome)} points.</p>
                <div style="border: 4px solid red; padding: 15px; background: #fff0f0; color: red;">
                    <h2>🚫 BANKRUPTCY! 🚫</h2>
                    <p style="color:black">Your score has been topped up to <strong>${top_up}</strong>.</p>
                </div>
            `;
            
            // Reset Score
            score = top_up;

        } else {
            // Normal Result
            results.innerHTML = `You ${isCorrect ? "win" : "lose"} ${Math.abs(outcome)} points. Score: ${score}`;
            if (!isCorrect) document.getElementById("results").style.color = "red";
        }

        response.end_total = score;
        document.getElementById("score").textContent = score;

        if (!isTokenRevealed) {
          const boxes = document.getElementsByClassName("box");
          boxes[tokenPosition].classList.add("token");
          isTokenRevealed = true;
        }

        document.getElementById("betControls").style.display = "none";
        document.getElementById("colorChoice").style.display = "none";
        document.getElementById("prompts").style.display = "none";

        // Delay extended slightly to allow reading the bankruptcy msg
        let delay = response.bankruptcy_triggered ? 5000 : trial.timings.post_outcome;
        endTimeout = setTimeout(end_trial, delay);
      };

      const after_bet_response = (info) => {
        sendMarker("v"); 

        response.bet_rt = info.rt;
        response.bet_amount = betAmount;
        response.bet_proportion = bet_proportion;

        document.getElementById("prompt1").innerText = "You bet: " + betAmount + " points";
        document.getElementById("prompt2").innerText = "Please wait...";
        document.getElementById("betControls").style.display = "none";

        afterBetTimeout = setTimeout(showResults, trial.timings.post_bet);
      };

      const after_colour_response = (info) => {
        sendMarker("u"); 

        chosenColor = (info.key.toLowerCase() === "z") ? "red" : "blue";
        response.colour_chosen = chosenColor;
        response.colour_rt = info.rt;
        response.colour_key = info.key;

        document.getElementById("colorChoice").style.display = "none";
        document.getElementById("prompt1").innerText = "You chose: " + chosenColor;
        document.getElementById("prompt2").innerText = "Please wait...";

        afterColourTimeout = setTimeout(() => {
          document.getElementById("betControls").style.display = "block";
          document.getElementById("prompt1").innerText = "Choose the amount to bet on your choice";
          document.getElementById("prompt2").innerText = "Press SPACEBAR to bet";

          document.getElementById("betCircle").textContent = betAmount;
          
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

      var keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_colour_response,
        valid_responses: ["z", "m"],
        rt_method: "performance",
        persist: false,
        allow_held_key: false,
      });
    }
// --- Simulation Code ---
    simulate(trial, evolution_handler, validate_data) {
        const mode = trial.simulation_options?.mode || 'visual';
        
        if (mode === 'data-only') {
            // 1. REPLICATE MATH LOGIC (So data is accurate without visuals)
            let score = trial.starting_points;
            let bet_values = trial.bet_values;
            
            // Simulate random bet choice
            let betIndex = Math.floor(Math.random() * bet_values.length);
            let betAmount = Math.round(score * bet_values[betIndex]);
            if (betAmount < 1) betAmount = 1;

            // Simulate Win/Loss (50/50 chance)
            let isCorrect = Math.random() > 0.5;
            let outcome = isCorrect ? betAmount : -betAmount;
            
            // Update Score
            score += outcome;
            let bankruptcy = false;

            // Bankruptcy Check (Critical for your testing)
            if (score <= 0) {
                bankruptcy = true;
                let current_b = (typeof trial.cumulative_bankruptcies === 'function') 
                                ? trial.cumulative_bankruptcies() 
                                : trial.cumulative_bankruptcies || 0;
                let new_b_count = current_b + 1;
                score = Math.floor(50 / new_b_count); // Calculate top-up
            }

            // 2. FINISH INSTANTLY
            this.jsPsych.finishTrial({
                rt: 250, // Fake RT
                colour_key: 'z',
                bet_amount: betAmount,
                outcome: outcome,
                end_total: score,
                bankruptcy_triggered: bankruptcy
            });

        } else {
            // VISUAL MODE (Watch the robot play)
            this.trial(document.body, trial);
            
            const choice_rt = 500;
            this.jsPsych.pluginAPI.setTimeout(() => {
                this.jsPsych.pluginAPI.pressKey('z');
            }, choice_rt);
            
            // Wait random time to vary bets
            const bet_rt = 1000 + Math.floor(Math.random() * 2000); 
            const time_to_press_space = choice_rt + trial.timings.post_choice + bet_rt;
            
            this.jsPsych.pluginAPI.setTimeout(() => {
                this.jsPsych.pluginAPI.pressKey(' ');
            }, time_to_press_space);
        }
    }
  
  }
  GamblingTaskPlugin.info = info;

  return GamblingTaskPlugin;
})(jsPsychModule);