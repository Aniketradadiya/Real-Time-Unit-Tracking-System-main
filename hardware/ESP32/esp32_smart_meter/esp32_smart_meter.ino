/*
  =============================================================================
  GridOS ESP32 Smart Energy Meter & Real-Time Telemetry Bridge
  =============================================================================
  Features:
  1. Measures Voltage (V), Current (A), Power (W), Energy (kWh), Frequency (Hz), PF.
  2. Connects to local WiFi.
  3. Sends real-time telemetry JSON to GridOS Backend API via HTTP POST.
  4. Reads server relay commands (ON / OFF) to cut/restore load based on wallet balance.
  5. Supports PZEM-004T AC Energy Module OR analog/pulse sensing fallback.
  =============================================================================
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h> // Install 'ArduinoJson' by Benoit Blanchon from Library Manager
#include <Preferences.h>
#include <PZEM004Tv30.h>


// ==================== CONFIGURATION ====================
// 1. WiFi Credentials (e.g., Home Wi-Fi or Mobile Hotspot 2.4GHz)
const char* WIFI_SSID     = "MyPhone";
const char* WIFI_PASSWORD = "12345678";

// 2. GridOS Backend Server URL (Configured for your local machine)
const char* SERVER_URL    = "http://172.26.145.236:11020/api/live-data";
const char* DEVICE_ID     = "ESP32-GRID-NODE-01";
const bool USE_PZEM_SENSOR = false; // Set true only after installing PZEM-004T hardware.

// 3. Pin Definitions
#define RELAY_PIN       26   // GPIO connected to Relay module
#define STATUS_LED      2    // Built-in LED on most ESP32 Dev boards
#define PZEM_RX_PIN     16   // Connect to PZEM-004T TX
#define PZEM_TX_PIN     17   // Connect to PZEM-004T RX

// Send telemetry every 2 seconds
const unsigned long SEND_INTERVAL_MS = 2000;
const unsigned long ENERGY_PERSIST_INTERVAL_MS = 10000;
unsigned long lastSendTime = 0;
unsigned long lastEnergySampleTime = 0;
unsigned long lastEnergyPersistTime = 0;
float accumulatedEnergy = 0.0;
Preferences energyStorage;

PZEM004Tv30 pzem(Serial2, PZEM_RX_PIN, PZEM_TX_PIN);

void persistEnergy() {
  energyStorage.putFloat("totalKwh", accumulatedEnergy);
  Serial.print(F("[Energy] Saved total: "));
  Serial.print(accumulatedEnergy, 4);
  Serial.println(F(" kWh"));
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println();
  Serial.println(F("========================================"));
  Serial.println(F("   GridOS ESP32 Smart Unit Tracker      "));
  Serial.println(F("========================================"));

  pinMode(RELAY_PIN, OUTPUT);
  pinMode(STATUS_LED, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH); // Default: Relay closed (Power ON)
  digitalWrite(STATUS_LED, LOW);

  energyStorage.begin("energy", false);
  accumulatedEnergy = energyStorage.getFloat("totalKwh", 0.0f);
  lastEnergySampleTime = millis();
  lastEnergyPersistTime = lastEnergySampleTime;

  Serial.print(F("[Energy] Restored total: "));
  Serial.print(accumulatedEnergy, 4);
  Serial.println(F(" kWh"));

  // Connect to WiFi
  connectWiFi();
}

void loop() {
  // Keep WiFi alive
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  unsigned long now = millis();
  if (now - lastSendTime >= SEND_INTERVAL_MS) {
    lastSendTime = now;
    readAndTransmitTelemetry();
  }
}

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) {
    return;
  }

  // Save before reconnecting. The stored total is never reset here.
  persistEnergy();

  Serial.println();
  Serial.print(F("[WiFi] Connecting to: "));
  Serial.println(WIFI_SSID);

  WiFi.disconnect(true);
  delay(500);

  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.setSleep(false);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  // Try up to ~15 seconds
  const int maxAttempts = 30;
  const int delayMs = 500;
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < maxAttempts) {
    delay(delayMs);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println(F("[WiFi] Connected successfully!"));
    Serial.print(F("[WiFi] ESP32 IP Address: "));
    Serial.println(WiFi.localIP());
    digitalWrite(STATUS_LED, HIGH);
    lastEnergySampleTime = millis();
  } else {
    Serial.println(F("\n[WiFi] Connection timed out. Will retry on next loop."));
    digitalWrite(STATUS_LED, LOW);
  }
}

void readAndTransmitTelemetry() {
  if (WiFi.status() != WL_CONNECTED) {
    return;
  }

  float voltage;
  float current;
  float power;
  float frequency;
  float powerFactor;

  if (USE_PZEM_SENSOR) {
    voltage = pzem.voltage();
    current = pzem.current();
    power = pzem.power();
    frequency = pzem.frequency();
    powerFactor = pzem.pf();

    if (isnan(voltage) || isnan(current) || isnan(power) || isnan(frequency) || isnan(powerFactor)) {
      Serial.println(F("[PZEM] Read failed; keeping the last stored energy total"));
      return;
    }
  } else {
    // No sensor / load connected: send 0 readings
    voltage = 0.0;
    current = 0.0;
    power = 0.0;
    frequency = 0.0;
    powerFactor = 0.0;
    Serial.println(F("[IDLE] No load/sensor connected; sending 0 values"));
  }

  unsigned long now = millis();
  float elapsedHours = (now - lastEnergySampleTime) / 3600000.0f;
  if (power > 0.0f && elapsedHours > 0.0f) {
    accumulatedEnergy += (power * elapsedHours) / 1000.0f;
  }

  if (power > 0.0f && elapsedHours > 0.0f) {
    if (now - lastEnergyPersistTime >= ENERGY_PERSIST_INTERVAL_MS) {
      persistEnergy();
      lastEnergyPersistTime = now;
    }
  }
  lastEnergySampleTime = now;

  // Build JSON Payload
  StaticJsonDocument<256> doc;
  doc["deviceId"]    = DEVICE_ID;
  doc["voltage"]     = serialized(String(voltage, 1));
  doc["current"]     = serialized(String(current, 2));
  doc["power"]       = serialized(String(power, 1));
  doc["energy"]      = serialized(String(accumulatedEnergy, 4));
  doc["frequency"]   = serialized(String(frequency, 1));
  doc["powerFactor"] = serialized(String(powerFactor, 2));

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  Serial.print(F("[HTTP] Sending: "));
  Serial.println(jsonPayload);

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");

  int httpCode = http.POST(jsonPayload);

  if (httpCode > 0) {
    String response = http.getString();
    Serial.printf("[HTTP] Response code: %d | Body: %s\n", httpCode, response.c_str());

    // Parse server response for relay command (e.g. if wallet runs out of balance)
    StaticJsonDocument<256> respDoc;
    DeserializationError error = deserializeJson(respDoc, response);
    if (!error) {
      const char* relayControl = respDoc["relayControl"] | "ON";
      if (strcmp(relayControl, "OFF") == 0) {
        digitalWrite(RELAY_PIN, LOW); // Cut load
        Serial.println(F("[RELAY] Turned OFF by Server (Zero Balance)"));
      } else {
        digitalWrite(RELAY_PIN, HIGH); // Restore load
      }
    }
  } else {
    Serial.printf("[HTTP] POST failed, error: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
}