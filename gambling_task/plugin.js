var jsPsychGamblingTask = (function (jspsych) {
  "use strict";

  const info = {
    name: "gambling-task",
    parameters: {
        /**The start value of points at the beginning of the task **/
      starting_points: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Starting points value",
        
      },
      /** Does the participant need to place a bet during the trials (i.e. practice trials might not need a bet to be places) **/
      bet_required: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Bet required during trials?",
        default: true,
      },
      /** What proportions will be presented as bets? This should be an array of numerical values between 0 and 1 which will be used when the participant needs to make a bet. The bet_order variable below will be used to modify the order (ascending, descending, as presented, or randomised)   */
      bet_values: {
        type: jspsych.ParameterType.INT,
        array: true,
        pretty_name: "bet values",
        default: [0.05, 0.25, 0.5, 0.75,0.95]
      },
      /** proportion of red/blue boxes */

      n_redboxes:{
        type: jspsych.ParameterType.INT,
        pretty_name: "what proprtion (0 - 1) should be red boxes? the rest will be blue",
        default:5
      } 

    },
  };

  /**
   * ** Gambling Task**
   *
   * This is my attempt to implement the Gambling Task in JSPsych, based on Rogers et al., 1999.
   *
   * @author Christopher Wilson
   * @see {@link https://DOCUMENTATION_URL DOCUMENTATION LINK TEXT}
   */
  class GamblingTaskPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }
    trial(display_element, trial) {

// store response
var response = {
colour_rt: null,
colour_key: null,
bet_rt:null,
bet_amount:null,
colour_chosen:null,
bet_proportion:null,
respIsCorrect:null,
outcome:null,
end_total:null
};


      // end trial
          // function to end trial when it is time
          const end_trial = () => {
       
            // kill any remaining setTimeout handlers
            this.jsPsych.pluginAPI.clearAllTimeouts();
            // kill keyboard listeners
            if (typeof keyboardListener !== "undefined") {
                this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
               
            }
            if (typeof betListener !== "undefined") {
          
                this.jsPsych.pluginAPI.cancelKeyboardResponse(betListener);
            }
            // gather the data to store for the trial
            var trial_data = {
            starting_points: trial.starting_points,
            colour_rt: response.colour_rt,
            colour_key:response.colour_key,
            colour_chosen:response.colour_chosen,
            bet_amount:response.bet_amount,
            bet_proportion: response.bet_proportion,
            bet_rt:response.bet_rt,
            bet_values: trial.bet_values,
            n_redboxes: trial.n_redboxes,
            n_blueboxes: 10 -  trial.n_redboxes,
            tokenPosition: tokenPosition,
            respIsCorrect: response.respIsCorrect,
            outcome: response.outcome,
            end_total:response.end_total
              
            
            };
            // clear the display
            display_element.innerHTML = "";
            // move on to the next trial

            console.log("end trial?1")
            this.jsPsych.finishTrial(trial_data);
            console.log("end trial?2")
        };




    // css styles
    
/* var cssstr=".box{width:20px;height:20px;display:inline-block;margin:5px;}"+
".red{background-color:red;}"+
".blue{background-color:blue;}"+
".yellow{background-color:yellow;}" +
".bet-circle{width:100px;height:100px;border:2pxsolidblack;border-radius:50%;text-align:center;line-height:100px;font-size:24px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);}"+
".color-choice{display:flex;justify-content:space-between;width:150px;margin:20pxauto;}"
".color-choicediv{width:50px;height:50px;text-align:center;line-height:50px;font-size:18px;cursor:pointer;}"+
".color-choicediv.red{background-color:red;}"+
".color-choicediv.blue{background-color:blue;}"; */


    // display stimulus
    var html = '<div id="jspsych-gambling-task"><div id="boxes"><!-- Display the boxes (red or blue) --></div><div id ="prompts"><div id ="prompt1">Choose the color of the box where you think the token is hidden.</div><div id ="prompt2">Press Z for Red or Press M for Blue</div></div><div id="game"><div id="colorChoice"> <div class="color-choice"><div class="red choice-btn" class="">Red</div><div class="blue choice-btn">Blue</div></div></div><div id="betControls" style="display: none;"><div id="betCircle" class="bet-circle silver"></div> </div> <div id = "scorec" class = "gold">Current Score: <span id="score"> </span></div><div id="results"> <!-- Display game results here --></div></div></div>';

    

    // Initialize game variables
    let score = trial.starting_points; // Starting score
    let bet_values = trial.bet_values;
    let bet_proportion = bet_values[0];
    let betAmount = score * bet_values[0];
    let currentBet = 0;
    let tokenPosition = Math.floor(Math.random() * 10); // Random token position (0-9)
    let isTokenRevealed = false;
    let chosenColor = null;
    let i = 0; // Initial bet amount
    let betInterval;

    let afterBetTimeout;
    let endTimeout
    // Generate a random proportion of red and blue boxes
    const numberOfRedBoxes = trial.n_redboxes;
    const numberOfBlueBoxes = 10 - numberOfRedBoxes;
        



    


    var after_bet_response = (info) => {
        response.bet_rt = info.rt;
        response.bet_amount = betAmount;
        response.bet_proportion = bet_proportion;
        placeBet();

      
      
   

    };

    var after_colour_response = (info) =>{

        console.log(info);
        if (info.key == "z" | info.key == "Z"){
            console.log(info.key);
            chosenColor = "red";
            console.log(chosenColor);

        } else {
            chosenColor = "blue";
        }
        
        response.colour_chosen = chosenColor;
        response.colour_rt = info.rt;
        response.colour_key = info.key;

        // Hide color choice buttons and show bet controls
        document.getElementById("colorChoice").style.display = "none";
        document.getElementById("betControls").style.display = "block";

        // modify prompt for bet

        document.getElementById("prompt1").innerText = "Choose the amount to bet on your choice";
        document.getElementById("prompt2").innerText = "Press SPACEBAR to bet";

        // Start increasing the bet amount every 2 seconds
        document.getElementById("betCircle").textContent = Math.round(betAmount);
        betInterval = setInterval(increaseBetAmount, 2000);

        // Add an event listener for the spacebar
 var betListener = this.jsPsych.pluginAPI.getKeyboardResponse({
    callback_function: after_bet_response,
    valid_responses: [" "],
    rt_method: "performance",
    persist: false,
    allow_held_key: false,
});


    };













    // Function to increase the bet amount
    function increaseBetAmount() {
        
        if (i == bet_values.length -1  ){i = 0; } else{
        i = i +1;}
       bet_proportion = bet_values[i];
       
        betAmount = score * bet_values[i];
        document.getElementById("betCircle").textContent = Math.round( betAmount);

    }

    // Function to place a bet
    function placeBet() {
        if (isTokenRevealed) {
            return; // Token already revealed, prevent additional bets
        }

        // Determine if the bet is correct (yellow token within the chosen color)
        const isCorrect = (chosenColor === "red" && tokenPosition < numberOfRedBoxes) || 
                          (chosenColor === "blue" && tokenPosition >= numberOfRedBoxes);


        response.respIsCorrect = isCorrect; 
        // Calculate the outcome
        const outcome = isCorrect ? betAmount : -betAmount;

        response.outcome = outcome;

        // Update the score
        score += outcome;
        currentBet = betAmount;
        
        response.end_total = score;

        // Display results
        const results = document.getElementById("results");

        var roundScore = Math.round(score);

        results.innerHTML = `You ${isCorrect ? "win" : "lose"} ${Math.round(Math.abs(outcome))} points. Score: ${roundScore}`;
        
        var scoreDisplay = document.getElementById("score");
        scoreDisplay.textContent = roundScore;
        

        if (isCorrect == false) {document.getElementById("results").style.color = "red";}


        // Reveal the token position if the bet is placed
        if (!isTokenRevealed) {
            const boxes = document.getElementsByClassName("box");
            boxes[tokenPosition].classList.add("token");
            isTokenRevealed = true;
        }



               // Stop increasing the bet amount and reset
               clearInterval(betInterval);
               betAmount = 0;
               document.getElementById("betControls").style.display = "none";
               document.getElementById("colorChoice").style.display = "none";
               document.getElementById("prompt1").style.display = "none";
               document.getElementById("prompt2").style.display = "none";


    afterBetTimeout = setTimeout(  after_response, 2000);

      
    }

  
    var after_response = (info) =>{

        clearTimeout(afterBetTimeout);
        console.log(info);

     

        endTimeout = setTimeout(end_trial, 1000);

    };


   
// draw
display_element.innerHTML =  display_element.innerHTML + html;

var init_display = function(){
    // Display the initial game state with red and blue boxes
    const boxes = document.getElementById("boxes");
    for (let i = 0; i < numberOfRedBoxes; i++) {
        const box = document.createElement("div");
        box.className = "box red";
        boxes.appendChild(box);
    }
    for (let i = 0; i < numberOfBlueBoxes; i++) {
        const box = document.createElement("div");
        box.className = "box blue";
        boxes.appendChild(box);
    }
};

var scoreDisplay = document.getElementById("score");
scoreDisplay.textContent = Math.round(score);

    // Add event listeners for color choice using 'Z' and 'M' keys
    var keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_colour_response,
        valid_responses: ["z","m"],
        rt_method: "performance",
        persist: false,
        allow_held_key: false,
    });


    init_display();


    }
  }
GamblingTaskPlugin.info = info;

  return GamblingTaskPlugin;
})(jsPsychModule);