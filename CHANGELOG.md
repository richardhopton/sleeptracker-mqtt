## v1.1.14

**Bug Fixes**

- (ESPHome) Fix address based BLE discovery

## v1.1.13

**Breaking Changes**

- (ErgoWifi) Remove old config options

**New Features**

- (ESPHome) Support finding beds using mac address instead of name

**Bug Fixes**

- (HomeAssistant) Don't allow invalid device topics (fixes ErgoMotion issue)
- (ErgoMotion) Use connection for one command only
- (HomeAssistant) Remove deprecated discovery property for light entities

## v1.1.12

**Breaking Changes**

- (ErgoWifi) Previous Ergomotion support has been renamed to ErgoWifi

**New Features**

- (ErgoMotion) Initial support for local TCP beds
- (ESPHome) Support pairing with BLE Devices

**Bug Fixes**

- (Leggett & Platt) Fix Gen2 support
- (Leggett & Platt) Reinstate not supported message

## v1.1.11

**New Features**

- (Leggett & Platt) Initial support for Okin variants
- (ESPHome) Detect if the ESPHome BT Proxy has proxy configured

**Bug Fixes**

- (Reverie) Fix bad messages in the logs that said Richmat
- (ESPHome) Update native api to fix some uuid issues

## v1.1.10

**New Features**

- (Leggett & Platt) Initial support for Leggett & Platt beds
- (Logicdata) Initial support for Logicdata beds

**Bug Fixes**

- (Sleeptracker) Fix entity categories
- (HomeAssistant) Stop handlers from crashing add-on

## v1.1.9

**New Features**

- (Reverie) Initial support for some Reverie beds
- (Linak) Add massage buttons

**Bug Fixes**

- (Linak) Fix commands for presets
- (Linak) Don't disconnect
- (HomeAssistant) Remove device name prefix from entity names
- (HomeAssistant) Delay sending available message a little

## v1.1.8

**New Features**

- (Solace) Finalize preset buttons
- (MotoSleep) Support for MotoSleep beds
- (Linak) Add preset buttons and light entities

**Bugs Fixed**

- (Linak) Fix command for light toggle
- (Linak) Fix bed sensor data extraction
- (Linak) Remove device type configuration
- (Linak/Solace/Richmat) Disconnect from BLE devices if main service/characteristics not found

## v1.1.7

**New Features**

- (Richmat) Allow bluetooth to stay connected
- (ESPHome) Attempt to reconnect when bluetooth disconnected unexpectedly

**Bugs Fixed**

- (Solace) Fixes to initial prototype
- (Linak) Ensure entities are properly initialized and set to online
- (ESPHome) Remove device name prefixes due to bugs
- (ESPHome) Fix BLE support for new ESPHome devices

## v1.1.6

**Bugs Fixed**

- (ESPHome) Build error caused by changes in discovery

## v1.1.5

**Bugs Fixed**

- (ESPHome) Support device name prefixes

## v1.1.4

**New Features**

- (Solace) Very early support for Solace beds

**Bugs Fixed**

- (ESPHome) Better handling of ESPHome encryption key config
- (ESPHome) Better support for Bluetooth devices
- (Linak) Tweaks to Linak bed prototype
- (Sleeptracker) Fixed VOC sensor class

## v1.1.3

**New Features**

- (Richmat) Support for ZR10 & ZR60 remote codes
- (Linak) Very early support for Linak beds

## v1.1.2

**New Features**

- (Sleeptracker) Support for STS-60 devices

## v1.1.1

**Bugs Fixed**

- (HomeAssistant) Cannot save config with default config
- (Richmat) Strings not used properly

## v1.1.0

**Bugs Fixed**

- (Richmat) Strings module not found

## v1.0.9

**Bugs Fixed**

- (Richmat) Casing of import breaks docker build

## v1.0.8

**New Features**

- (Richmat) Experimental support for Richmat beds that use BLE controllers, e.g. Sven & Son

**Bugs Fixed**

- (ErgoMotion) Some buttons shouldn't be visible for all beds
- (ErgoMotion) Some buttons have wrong names

## v1.0.7

**New Features**

- (Sleeptracker) Support for Beautyrest SmartMotion & Serta Perfect smart bases
- (ErgoMotion) Experimental support for ErgoMotion beds that use the ErgoWifi app and Keeson WF02D & WF03D controller.

**Breaking Changes**

- (Sleeptracker) Changed the MQTT topic to handle split base beds; You will need to delete the current device and let the add-on re-create it, although entity ids should stay the same.

**Bugs Fixed**

- (Sleeptracker) Split base beds showing as two devices

## v1.0.6

**Bugs Fixed**

- State updates stop after HomeAssistant reboot

## v1.0.5

**Bugs Fixed**

- (Sleeptracker) Fix naming for split base bed entities

## v1.0.4

**Bugs Fixed**

- (Sleeptracker) Stop logging expected errors on status request

## v1.0.3

**Bugs Fixed**

- (Sleeptracker) Massage Head & Foot Step weren't working

## v1.0.2

**New Features**

- (Sleeptracker) Add buttons to use and set the TV preset

## v1.0.1

**Bugs Fixed**

- Sleeptracker API not returning manufacturer details, which caused HA to fail to add the devices
