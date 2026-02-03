// config.js
const CGT_CONFIG = {
    // Hardware Settings
    com_port: "3",              // The COM port for the trigger box
    
    // Timing Settings (in milliseconds)
    timings: {
        post_choice: 3000,      // Delay after choosing Red/Blue (before betting starts)
        post_bet: 3000,         // Delay after placing the bet (before result reveals)
        post_outcome: 3000,     // Delay after result is shown (before next trial)
        bet_interval: 2000,     // Speed at which bet amounts cycle
    },

    // Experiment Logic
    trials_per_block: 18,
    starting_points: 100
};