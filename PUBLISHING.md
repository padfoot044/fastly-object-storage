# Publishing Guide for fastly-object-storage

This guide will help you publish the `fastly-object-storage` package to GitHub and NPM.

## Prerequisites

- A GitHub account
- An NPM account (sign up at https://www.npmjs.com/signup if you don't have one)
- Git configured with your credentials (already done ✓)

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `fastly-object-storage`
3. Description: `Modern TypeScript SDK for Fastly Object Storage with S3-compatible APIs`
4. Visibility: **Public** (required for free NPM publishing)
5. **Important**: Do NOT initialize with README, .gitignore, or license (we have these)
6. Click **Create repository**

## Step 2: Push to GitHub

After creating the repository, run these commands (replace `YOUR_USERNAME` with your GitHub username):

```bash
# Add remote origin
git remote add origin https://github.com/YOUR_USERNAME/fastly-object-storage.git

# Rename branch to main (GitHub's default)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Note**: Update package.json repository URLs if your username is different from "anurag"

## Step 3: Set Up NPM Publishing

### 3.1 Login to NPM

```bash
npm login
```

You'll be prompted for:
- Username
- Password
- Email
- One-time password (if 2FA is enabled)

### 3.2 Verify Login

```bash
npm whoami
```

### 3.3 Check Package Name Availability

```bash
npm search fastly-object-storage
```

If the name is taken, you'll need to:
- Choose a different name (e.g., `@yourusername/fastly-object-storage`)
- Update the `name` field in package.json
- If using a scoped package, add `"publishConfig": { "access": "public" }` to package.json

## Step 4: Publish to NPM

### 4.1 Final Build and Test

```bash
# Run all checks (automatically runs before publish)
npm run prepublishOnly
```

This will:
- ✓ Lint the code
- ✓ Type check
- ✓ Run tests
- ✓ Build the package

### 4.2 Publish

```bash
# Publish the package
npm publish
```

### 4.3 Verify Publication

Check your package at: `https://www.npmjs.com/package/fastly-object-storage`

## Step 5: Create GitHub Release

1. Go to your GitHub repo: `https://github.com/YOUR_USERNAME/fastly-object-storage`
2. Click on "Releases" → "Create a new release"
3. Tag version: `v0.1.0`
4. Release title: `v0.1.0 - Initial Release`
5. Description:
   ```markdown
   ## 🎉 Initial Release

   First public release of fastly-object-storage SDK!

   ### Features
   - ✅ Complete S3-compatible API for Fastly Object Storage
   - ✅ TypeScript support with full type definitions
   - ✅ Bucket operations (create, delete, list, info)
   - ✅ Object operations (upload, download, delete, copy, metadata)
   - ✅ Multipart upload support for large files
   - ✅ Presigned URL generation
   - ✅ Streaming support
   - ✅ Custom error handling
   - ✅ Comprehensive test coverage

   ### Installation
   \`\`\`bash
   npm install fastly-object-storage
   \`\`\`

   ### Quick Start
   \`\`\`typescript
   import { FastlyStorageClient } from 'fastly-object-storage';

   const client = new FastlyStorageClient({
     accessKeyId: 'your-access-key',
     secretAccessKey: 'your-secret-key',
     endpoint: 'https://your-endpoint.fastly-object-storage.com',
   });

   // Upload a file
   await client.uploadObject('my-bucket', 'file.txt', buffer);
   \`\`\`

   See the [README](https://github.com/YOUR_USERNAME/fastly-object-storage#readme) for full documentation.
   ```
6. Click **Publish release**

## Step 6: Future Updates

When you make changes and want to publish a new version:

### 6.1 Update Version

```bash
# For bug fixes (0.1.0 -> 0.1.1)
npm version patch

# For new features (0.1.0 -> 0.2.0)
npm version minor

# For breaking changes (0.1.0 -> 1.0.0)
npm version major
```

### 6.2 Update CHANGELOG.md

Add your changes to the CHANGELOG.md file.

### 6.3 Commit and Push

```bash
git push origin main --tags
```

### 6.4 Publish to NPM

```bash
npm publish
```

### 6.5 Create GitHub Release

Create a new release on GitHub with the new version tag.

## Step 7: Add NPM Badge to README

After publishing, add these badges to your README.md:

```markdown
[![npm version](https://badge.fury.io/js/fastly-object-storage.svg)](https://www.npmjs.com/package/fastly-object-storage)
[![Downloads](https://img.shields.io/npm/dm/fastly-object-storage.svg)](https://www.npmjs.com/package/fastly-object-storage)
[![License](https://img.shields.io/npm/l/fastly-object-storage.svg)](https://github.com/YOUR_USERNAME/fastly-object-storage/blob/main/LICENSE)
```

## Automated Publishing (Optional)

You can set up automated NPM publishing using GitHub Actions:

1. Generate an NPM token: https://www.npmjs.com/settings/YOUR_USERNAME/tokens
2. Add token as GitHub secret: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`
   - Name: `NPM_TOKEN`
   - Value: Your NPM token
3. The `.github/workflows/publish.yml` file is already set up for automated publishing on new releases

## Troubleshooting

### Package Name Already Taken

Use a scoped package:
```json
{
  "name": "@yourusername/fastly-object-storage",
  "publishConfig": {
    "access": "public"
  }
}
```

### Authentication Error

```bash
npm logout
npm login
```

### Build Errors

```bash
# Clean and rebuild
rm -rf node_modules dist
npm install
npm run build
```

## Support

If you encounter issues:
- Check the [npm documentation](https://docs.npmjs.com/)
- Check the [GitHub documentation](https://docs.github.com/)
- Open an issue on GitHub

---

**Good luck with your package! 🚀**
