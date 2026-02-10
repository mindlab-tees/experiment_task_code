// webSerial.js
// Handles communication with the fNIRS trigger box via USB
// Updated to read "dummy_mode" from JATOS Study Input

let serialPort;
let serialWriter;

// HELPER: Check JATOS Study Input for the flag
const isDummyMode = () => {
    // Check if JATOS exists and if the input JSON has the flag
    if (typeof jatos !== 'undefined' && jatos.studyJsonInput && jatos.studyJsonInput.dummy_mode === true) {
        return true;
    }
    return false;
};

// 1. Function to trigger the browser's "Select Device" popup
async function connectSerialPort() {
    
    // --- JATOS DUMMY CHECK ---
    if (isDummyMode()) {
        console.warn("⚠️ JATOS DUMMY MODE DETECTED: Simulating connection...");
        await new Promise(r => setTimeout(r, 800)); // Fake an 800ms connection delay
        console.log("⚠️ DUMMY MODE: Virtual Device Connected!");
        return true; // Return success so setup.js proceeds
    }
    // -------------------------

    if (!("serial" in navigator)) {
        alert("Web Serial is not supported in this browser. Please use Chrome or Edge.");
        return false;
    }

    try {
        serialPort = await navigator.serial.requestPort();
        await serialPort.open({ baudRate: 9600 }); 

        const textEncoder = new TextEncoderStream();
        const writableStreamClosed = textEncoder.readable.pipeTo(serialPort.writable);
        serialWriter = textEncoder.writable.getWriter();

        console.log("USB Serial Connected!");
        return true;
    } catch (error) {
        console.error("Connection failed:", error);
        // We do NOT alert here anymore so the Retry Loop can handle it gracefully
        return false;
    }
}

// 2. Function to send a marker
async function sendSerialMarker(marker) {
    
    // --- JATOS DUMMY CHECK ---
    if (isDummyMode()) {
        console.log(`%c[DUMMY MARKER] >> ${marker}`, "color: orange; font-weight: bold; background: #eee; padding: 2px;");
        return; 
    }
    // -------------------------

    if (serialWriter) {
        try {
            await serialWriter.write(marker);
            console.log(`>> Marker Sent: ${marker}`);
        } catch (error) {
            console.error("Failed to send marker:", error);
        }
    } else {
        console.warn(`Serial port disconnected. Marker '${marker}' NOT sent.`);
    }
}