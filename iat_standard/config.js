// config.js
// Configuration for the Implicit Association Task
// Study: Gambling vs Control / Sports vs Hobbies

var iat_config = {
    // 1. LABELS (What appears at the top of the screen)
    // ------------------------------------------------
    attributes: ['Gambling Logo', 'Other Logo'],
    categories: ['Sports', 'Hobbies'],

    // 2. STIMULI LISTS
    // ----------------
    // Attribute 0: Gambling Images (Corresponds to attributes[0])
    attr_stim_0: [
        "logos/ladbrokes.png",
        "logos/bet365.png",
        "logos/williamhill.png",
        "logos/paddypower.png",
        "logos/skybet.jpg",
        "logos/betfair.png",
        "logos/coral.png",
        "logos/lottery.png"
    ],

    // Attribute 1: Neutral Images (Corresponds to attributes[1])
    attr_stim_1: [
        "logos/boeing.png",
        "logos/asda.png",
        "logos/siemens.png",
        "logos/intel.jpg",
        "logos/nestle.jpg",
        "logos/igt.jpg"
    ],

    // Category 0: Sports Words (Corresponds to categories[0])
    cat_stim_0: [
        "Football", "Tennis", "Cricket", "Rugby", "Hockey", "Golf"
    ],

    // Category 1: Hobbies Words (Corresponds to categories[1])
    cat_stim_1: [
        "Reading", "Cooking", "Gardening", "Traveling", "Fishing", "Drawing"
    ],

    // 3. SETTINGS
    // -----------
    // Set to true if the list above contains image paths, false if words
    attr_is_image: true, 
    cat_is_image: false,

    // Trial counts
    block_length: 20,      // Practice blocks
    long_block_length: 40  // Test blocks
};