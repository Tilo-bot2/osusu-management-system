# GitHub Secrets Setup Guide

To enable APK signing and automated releases, you need to configure the following secrets in your GitHub repository.

## How to Add Secrets

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret below

## Required Secrets

### 1. KEYSTORE_FILE
**Description:** Base64-encoded keystore file

**How to generate:**

```bash
# First, create a keystore (if you don't have one)
keytool -genkey -v -keystore release.keystore \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias osusu-key \
  -keypass your-key-password \
  -storepass your-store-password

# Encode to base64
cat release.keystore | base64 -w 0
```

**Secret Value:** Paste the entire base64 output

### 2. KEYSTORE_PASSWORD
**Description:** Password for the keystore

**Secret Value:** `your-store-password` (from above)

### 3. KEY_ALIAS
**Description:** Alias of the key in the keystore

**Secret Value:** `osusu-key` (or your chosen alias)

### 4. KEY_PASSWORD
**Description:** Password for the key

**Secret Value:** `your-key-password` (from above)

## Optional Secrets

### SLACK_WEBHOOK (Optional)
**Description:** Slack webhook URL for build notifications

**How to get:**
1. Create a Slack app at https://api.slack.com/apps
2. Enable Incoming Webhooks
3. Create a new webhook for your channel

**Secret Value:** Your webhook URL

## Verification

After adding all secrets:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Verify all secrets are listed (values will be masked)
3. Push to your `main` or `develop` branch to test the workflow
4. Check the **Actions** tab for workflow run status

## Important Security Notes

⚠️ **DO NOT commit the keystore file to the repository**

- The `.gitignore` in `artifacts/mobile/` will prevent accidental commits
- Keystore files should only exist locally or in GitHub Secrets
- Never share your keystore password publicly
- Consider rotating passwords if they're compromised

## Testing the Workflow

To test without creating a full release:

```bash
# Push to develop branch
git push origin develop

# Check GitHub Actions for workflow progress
```

To create a release:

```bash
# Create and push a tag
git tag v0.0.1
git push origin v0.0.1

# This will trigger the release workflow
```
