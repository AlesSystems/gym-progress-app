# React Native Development Errors & Solutions

## Error: Unable to load script - Metro bundler not running

### Symptoms
```
java.lang.RuntimeException: Unable to load script.

Make sure you're running Metro or that your bundle 'index.android.bundle' is packaged correctly for release.

The device must either be USB connected (with bundler set to "localhost:8081") or be on the same Wi-Fi network as your computer (with bundler set to your computer IP) to connect to Metro.

If you're using USB on a physical device, make sure you also run this command:
  adb reverse tcp:8081 tcp:8081
```

### Root Cause
The React Native app on the device/emulator cannot connect to the Metro bundler running on your development machine. This typically happens when:

1. Metro bundler is not running at all
2. ADB port forwarding is not configured (for USB-connected devices)
3. Firewall is blocking port 8081
4. Metro bundler crashed or failed to start

### Solution

#### Step 1: Start Metro Bundler
In one terminal, navigate to the WorkoutPlanner directory and start Metro:

```bash
cd WorkoutPlanner
npm start
```

Or to reset cache if you're experiencing issues:
```bash
npm run start:reset
```

**Keep this terminal open!** Metro must continue running while you develop.

#### Step 2: Set up ADB Port Forwarding (USB devices only)
In a **separate terminal**, run:

```bash
cd WorkoutPlanner
npm run android:setup
```

This runs: `adb reverse tcp:8081 tcp:8081`

#### Step 3: Run the Android App
In a **third terminal** (or after step 2 completes), run:

```bash
cd WorkoutPlanner
npm run android
```

### Quick Setup Script
For Windows users, use the automated setup script:

```bash
cd WorkoutPlanner
setup-dev.bat
```

This script will:
- Configure ADB port forwarding
- Check if Metro is running
- Verify device connection
- Provide next steps

### Common Issues

#### Metro not starting
**Error:** Port 8081 already in use

**Solution:**
1. Find the process: `netstat -ano | findstr :8081` (Windows) or `lsof -i :8081` (Mac/Linux)
2. Kill the process: `taskkill /F /PID <PID>` (Windows) or `kill -9 <PID>` (Mac/Linux)
3. Restart Metro: `npm start`

#### ADB device not found
**Error:** `error: no devices/emulators found`

**Solution:**
1. Verify device connection: `adb devices`
2. Enable USB debugging on your Android device
3. Accept the USB debugging prompt on your device
4. Try reconnecting the USB cable

#### Firewall blocking Metro
**Error:** Connection timeout or refused

**Solution:**
- Windows: Allow Node.js through Windows Firewall
- Mac: System Preferences > Security & Privacy > Firewall > Firewall Options > Allow incoming connections for Node
- Linux: `sudo ufw allow 8081/tcp`

### Development Workflow

The correct workflow requires **two separate terminals**:

**Terminal 1 - Metro Bundler (must stay open):**
```bash
cd WorkoutPlanner
npm start
```

**Terminal 2 - Android App:**
```bash
cd WorkoutPlanner
npm run android:setup  # First time or after device disconnect
npm run android        # Build and run app
```

### Verification

To verify everything is working:

1. Check Metro is running: Open `http://localhost:8081/status` in a browser
   - Should return: `{"packager":"running"}`

2. Check port forwarding: `adb reverse --list`
   - Should show: `tcp:8081 -> tcp:8081`

3. Check device connection: `adb devices`
   - Should list your device/emulator

### Related Logs

When this error occurs, you'll see these log entries:
- `The packager does not seem to be running as we got an IOException`
- `ReactHost{0}.handleHostException`
- `Unable to load script`

All indicate the same root cause: Metro bundler is not accessible from the device.