// webSerial.js
// Handles communication with the fNIRS trigger box via USB
// No external server or IP address required.

let serialPort;
let serialWriter;

// 1. Function to trigger the browser's "Select Device" popup
async function connectSerialPort() {
    if (!("serial" in navigator)) {
        alert("Web Serial is not supported in this browser. Please use Chrome or Edge.");
        return false;
    }

    try {
        serialPort = await navigator.serial.requestPort();
        await serialPort.open({ baudRate: 9600 }); // Standard fNIRS baud rate

        const textEncoder = new TextEncoderStream();
        const writableStreamClosed = textEncoder.readable.pipeTo(serialPort.writable);
        serialWriter = textEncoder.writable.getWriter();

        console.log("fNIRS Trigger Box Connected!");
        return true;
    } catch (error) {
        console.error("Connection failed:", error);
        alert("Connection failed: " + error);
        return false;
    }
}

// 2. Function to send a marker (replaces useWebSocket)
async function sendSerialMarker(marker) {
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