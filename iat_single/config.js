// config_sciat.js
// Configuration for Single Category IAT (SC-IAT)

var sciat_config = {
    // 1. LABELS
    // ----------------
    target_label: 'Gambling', 
    attribute_labels: ['Positive', 'Negative'], // [0]=Good, [1]=Bad

    // 2. STIMULI
    // ----------------
    // Target: Mixed Images and Words
    target_stimuli: [
        "logos/ladbrokes.png", 
        "logos/bet365.png",
        "logos/williamhill.png", 
        "logos/paddypower.png",
        "logos/coral.png",
        "logos/skybet.jpg", 
        "logos/betfair.png",
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
    // Are the TARGET items images? (We handle the mix in logic, 
    // but this flag is for the attribute lists)
    attributes_are_images: false, 

    // Trial counts (Must ensure 50/50 response split)
    // Practice: 10 Target+Pos vs 10 Neg
    trial_count_practice: 24, 
    // Test: 20 Target+Pos vs 20 Neg
    trial_count_test: 72 
};