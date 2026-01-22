// config_sciat.js
// Configuration for the Single Category IAT (SC-IAT)

var sciat_config = {
    // 1. LABELS
    // ----------------
    target_label: ['Gambling'], 
    attribute_labels: ['Positive', 'Negative'], // [0] = Good, [1] = Bad

    // 2. STIMULI
    // ----------------
    // Target: Mixed Images and Words
    // We pre-format the images as HTML strings here
    target_stimuli: [
        "<img src='logos/ladbrokes.png' height='200px'>",
        "<img src='logos/bet365.jpg' height='200px'>",
        "<img src='logos/williamhill.jpg' height='200px'>",
        "<img src='logos/paddypower.jpg' height='200px'>",
        "<img src='logos/skybet.jpg' height='200px'>",
        "<img src='logos/betfair.png' height='200px'>",
        "Casino", "Betting", "Poker", "Jackpot", "Roulette", 
        "Wager", "Odds", "Chip", "Win", "Bet"
    ],

    // Attributes: Words (Pos/Neg)
    attribute_stimuli_pos: [
        "Joy", "Happy", "Good", "Wonderful", 
        "Excellent", "Peace", "Love", "Pleasure"
    ],
    attribute_stimuli_neg: [
        "Bad", "Awful", "Pain", "Terrible", 
        "Horrible", "Evil", "Grief", "Nasty"
    ],

    // 3. SETTINGS
    // ----------------
    // Set to true if attributes are images (rare for SC-IAT), false if words
    attributes_are_images: false, 

    // Trial counts
    trial_count_practice: 10, // Trials for Block 1 & 4 (Attribute discrimination)
    trial_count_combined_practice: 20, // Total trials for Block 2 & 5
    trial_count_combined_test: 40      // Total trials for Block 3 & 6
};