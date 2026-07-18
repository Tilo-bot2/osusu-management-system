# Development Setup Guide

## Prerequisites

Before starting, ensure you have installed:

- **Node.js 18+** - https://nodejs.org/
- **pnpm** - https://pnpm.io/
- **Android SDK** - https://developer.android.com/studio
- **Android NDK** - Version 25.1.8937393
- **Java Development Kit (JDK) 17** - https://adoptopenjdk.net/
- **Git** - https://git-scm.com/

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/Tilo-bot2/osusu-management-system.git
cd osusu-management-system
```

### 2. Install Root Dependencies

```bash
pnpm install
```

### 3. Navigate to Mobile App

```bash
cd artifacts/mobile
pnpm install
```

### 4. Set Up Android Environment

```bash
# For macOS
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools

# For Linux
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools

# For Windows (PowerShell)
$env:ANDROID_HOME = "$env:USERPROFILE\Android\Sdk"
$env:Path += ";$env:ANDROID_HOME\emulator;$env:ANDROID_HOME\platform-tools"
```

## Running the App

### Start Metro Bundler

```bash
pnpm start
```

### Run on Android Device/Emulator

```bash
# In a new terminal, from artifacts/mobile/
pnpm android
```

Or manually:

```bash
cd android
./gradlew installDebug
```

## Development Workflow

### Hot Reload

- Press `r` in the Metro Bundler terminal to reload
- Press `d` to open the developer menu

### Debugging

1. Open Metro Bundler developer menu: `d` in terminal
2. Select "Debug"
3. Open Chrome DevTools: http://localhost:8081/debugger-ui

### Type Checking

```bash
pnpm type-check
```

### Linting

```bash
pnpm lint
```

## Building for Production

### Debug APK (for testing)

```bash
cd artifacts/mobile/android
./gradlew assembleDebug
```

Output: `app/build/outputs/apk/debug/app-debug.apk`

### Release APK (for distribution)

```bash
# Set environment variables first
export KEYSTORE_PATH="$(pwd)/release.keystore"
export KEYSTORE_PASSWORD="your-password"
export KEY_ALIAS="osusu-key"
export KEY_PASSWORD="your-password"

# Build
cd artifacts/mobile/android
./gradlew assembleRelease
```

Output: `app/build/outputs/apk/release/app-release.apk`

## Troubleshooting

### Issue: "ANDROID_HOME not set"

**Solution:** Set the environment variable as shown in step 4 above.

### Issue: "No connected devices"

**Solution:**
```bash
# List available emulators
emulator -list-avds

# Start an emulator
emulator -avd <emulator_name>

# Or connect a physical device via USB (ensure USB debugging is enabled)
adb devices
```

### Issue: "Gradle build failed"

**Solution:**
```bash
cd artifacts/mobile/android
./gradlew clean
./gradlew assembleDebug
```

### Issue: "Metro Bundler port 8081 in use"

**Solution:**
```bash
# Find and kill the process
lsof -i :8081
kill -9 <PID>

# Or use a different port
pnpm start -- --port 8082
```

## Project Structure

```
artifacts/mobile/
├── src/
│   ├── App.tsx           # Main app component
│   ├── index.tsx         # App entry point
│   └── ...              # Other components
├── android/
│   ├── app/
│   │   ├── build.gradle  # App-level Gradle config
│   │   └── src/
│   ├── build.gradle      # Project-level Gradle config
│   └── settings.gradle
├── package.json
├── tsconfig.json
├── metro.config.js
└── README.md
```

## Resources

- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Android Developer Guide](https://developer.android.com/guide)
- [Gradle Documentation](https://gradle.org/)
