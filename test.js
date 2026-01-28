import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import assert from 'assert';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT_PATH = path.join(__dirname, 'prepare-agent-skills.js');

function runTest() {
    const testRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'skills-test-'));
    const mockRepo = path.join(testRoot, 'mock-repo');
    const destDir = path.join(testRoot, 'dest');

    try {
        console.log('Setting up mock environment...');

        // 1. Create mock repository
        fs.mkdirSync(path.join(mockRepo, 'skills', 'python-skill'), { recursive: true });
        fs.mkdirSync(path.join(mockRepo, 'skills', 'node-skill'), { recursive: true });

        fs.writeFileSync(path.join(mockRepo, 'skills', 'python-skill', 'script.py'), 'print("hello python")');
        fs.writeFileSync(path.join(mockRepo, 'skills', 'node-skill', 'index.js'), 'console.log("hello node")');

        // Initialize git in mock repo (required for the script to clone it)
        execSync(`git init && git config user.email "test@example.com" && git config user.name "Test" && git add . && git commit -m "initial"`, { cwd: mockRepo });

        console.log('Running script against mock repo...');

        // 2. Run the script
        // We pass the keyword "python", the destination, and the local file path as the repo URL
        execSync(`node ${SCRIPT_PATH} "python" ${destDir} ${mockRepo}`, { stdio: 'inherit' });

        // 3. Assertions
        console.log('Verifying results...');
        const copiedSkills = fs.readdirSync(destDir);

        assert.ok(copiedSkills.includes('python-skill'), 'Should have copied python-skill');
        assert.ok(!copiedSkills.includes('node-skill'), 'Should NOT have copied node-skill');

        const fileContent = fs.readFileSync(path.join(destDir, 'python-skill', 'script.py'), 'utf8');
        assert.strictEqual(fileContent, 'print("hello python")', 'File content should be preserved');

        console.log('\n✅ Test Passed Successfully!');

    } catch (error) {
        console.error('\n❌ Test Failed!');
        console.error(error);
        process.exit(1);
    } finally {
        // Cleanup
        console.log('Cleaning up test environment...');
        fs.rmSync(testRoot, { recursive: true, force: true });
    }
}

runTest();
