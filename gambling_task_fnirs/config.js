// config.js

// --- MASTER SWITCH ---
// Set to TRUE for fNIRS (Long delays + Markers)
// Set to FALSE for Behavioral (Fast delays + No Markers)
const ENABLE_FNIRS = false; 


const CGT_CONFIG = {
    // Hardware Settings
    com_port: "3", 

    // Experiment Logic
    trials_per_block: 18,
    starting_points: 100,

    // Marker Flag: automatically follows the master switch
    send_markers: ENABLE_FNIRS, 
    
    // Timing Settings (Automatically switches based on ENABLE_FNIRS)
    timings: ENABLE_FNIRS ? 
    {   // SLOW MODE (fNIRS Hemodynamic Response)
        post_choice: 3000,
        post_bet: 3000,
        post_outcome: 3000,
        bet_interval: 1500
    } : 
    {   // FAST MODE (Behavioral)
        post_choice: 500,
        post_bet: 500,
        post_outcome: 1500,
        bet_interval: 1500
    }
};