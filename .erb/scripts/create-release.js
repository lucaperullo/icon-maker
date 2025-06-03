// .erb/scripts/create-release.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createRelease() {
  try {
    // Get current version from package.json
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const version = packageJson.version;
    const tagName = `v${version}`;

    console.log(`🚀 Creating release for version ${version}...`);

    // Check if we have uncommitted changes
    try {
      execSync('git diff-index --quiet HEAD --', { stdio: 'ignore' });
    } catch (error) {
      console.log('⚠️  You have uncommitted changes. Please commit them first.');
      const proceed = await question('Do you want to commit all changes now? (y/N): ');
      
      if (proceed.toLowerCase() === 'y' || proceed.toLowerCase() === 'yes') {
        const commitMessage = await question('Enter commit message: ') || `Release ${version}`;
        execSync(`git add .`);
        execSync(`git commit -m "${commitMessage}"`);
        console.log('✅ Changes committed');
      } else {
        console.log('❌ Release cancelled. Please commit your changes first.');
        process.exit(1);
      }
    }

    // Check if tag already exists
    try {
      execSync(`git rev-parse ${tagName}`, { stdio: 'ignore' });
      console.log(`❌ Tag ${tagName} already exists. Please bump version first.`);
      process.exit(1);
    } catch (error) {
      // Tag doesn't exist, which is good
    }

    // Generate changelog
    console.log('📝 Generating changelog...');
    let changelog = '';
    
    try {
      // Get commits since last tag
      const lastTag = execSync('git describe --tags --abbrev=0 2>/dev/null || echo ""', { 
        encoding: 'utf8' 
      }).trim();
      
      const commitRange = lastTag ? `${lastTag}..HEAD` : 'HEAD';
      const commits = execSync(`git log ${commitRange} --oneline --no-merges`, { 
        encoding: 'utf8' 
      }).trim();

      if (commits) {
        changelog = `## What's New\n\n${commits.split('\n').map(line => `- ${line.substring(8)}`).join('\n')}\n\n`;
      }
    } catch (error) {
      console.log('⚠️  Could not generate automatic changelog');
    }

    // Ask for additional release notes
    console.log('\n📋 Current changelog:');
    console.log(changelog || 'No automatic changelog generated.');
    
    const addNotes = await question('\nDo you want to add custom release notes? (y/N): ');
    if (addNotes.toLowerCase() === 'y' || addNotes.toLowerCase() === 'yes') {
      console.log('Enter your release notes (press Ctrl+D when done):');
      
      const customNotes = await new Promise((resolve) => {
        let notes = '';
        process.stdin.on('data', (data) => {
          notes += data.toString();
        });
        process.stdin.on('end', () => {
          resolve(notes.trim());
        });
      });
      
      if (customNotes) {
        changelog = customNotes + '\n\n' + changelog;
      }
    }

    // Ask if it's a pre-release
    const isPrerelease = await question('Is this a pre-release/beta? (y/N): ');
    const prereleaseFlag = (isPrerelease.toLowerCase() === 'y' || isPrerelease.toLowerCase() === 'yes') ? '--prerelease' : '';

    // Create and push tag
    console.log('🏷️  Creating git tag...');
    execSync(`git tag -a ${tagName} -m "Release ${version}"`);
    execSync(`git push origin main --tags`);

    // Check if GitHub CLI is available
    try {
      execSync('gh --version', { stdio: 'ignore' });
    } catch (error) {
      console.log('❌ GitHub CLI (gh) is not installed.');
      console.log('Please install it from: https://cli.github.com/');
      console.log(`Or create the release manually at: https://github.com/yourusername/icon-maker/releases/new?tag=${tagName}`);
      process.exit(1);
    }

    // Create GitHub release
    console.log('🌟 Creating GitHub release...');
    
    // Write changelog to temp file
    const changelogFile = path.join(__dirname, 'temp-changelog.md');
    fs.writeFileSync(changelogFile, changelog);

    try {
      const releaseCommand = `gh release create ${tagName} --title "IconForge AI ${version}" --notes-file "${changelogFile}" ${prereleaseFlag}`;
      execSync(releaseCommand, { stdio: 'inherit' });
      
      // Clean up temp file
      fs.unlinkSync(changelogFile);
      
      console.log('✅ Release created successfully!');
      console.log(`🔗 View at: https://github.com/yourusername/icon-maker/releases/tag/${tagName}`);
      
    } catch (error) {
      console.log('❌ Failed to create GitHub release:', error.message);
      // Clean up temp file on error
      if (fs.existsSync(changelogFile)) {
        fs.unlinkSync(changelogFile);
      }
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Release creation failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the release process
createRelease();