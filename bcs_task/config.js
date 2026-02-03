/* Configuration file for Berg's Card Sorting Task
   Load this in index.html BEFORE bcst_task.js
*/

var BCST_CONFIG = {
    // 'random' = Shuffles the 64 cards every time the task runs
    // 'fixed'  = Uses the standard sorted order (Red Triangle 1 -> Blue Circle 4)
    deck_type: 'random', 

    // The logic sequence for sorting rules. 
    // Standard BCST loops: Color -> Shape -> Number -> Color -> Shape -> Number
    rule_sequence: ['color', 'shape', 'number', 'color', 'shape', 'number'],
    
    // How many correct responses in a row are needed to switch rules?
    streak_threshold: 10,
    
    // Location of your card images relative to the index.html file
    // Ensure this includes the trailing slash
    img_folder: 'bcs_task/img/',
    
    // Feedback settings
    show_feedback: true,
    feedback_duration: 1000 // in milliseconds
};