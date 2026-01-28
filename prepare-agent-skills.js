#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const KEYWORDS_RAW = process.argv[2];
const DEST_DIR = process.argv[3] || './.agent/skills';
const REPO_URL = process.argv[4] || 'https://github.com/rmyndharis/antigravity-skills.git';
const SUB_DIR = 'skills';

if (!KEYWORDS_RAW) {
    console.log('Usage: npx prepare-agent-skills "<keyword1>,<keyword2>,..." [destination_directory] [repo_url]');
    console.log('Default destination: ./.agent/skills');
    process.exit(1);
}

const KEYWORDS = KEYWORDS_RAW.split(',').map(k => k.trim()).filter(k => k.length > 0);

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skills-search-'));

try {
    console.log(`Cloning repository to ${tempDir}...`);
    execSync(`git clone --depth 1 ${REPO_URL} "${tempDir}"`, { stdio: 'inherit' });

    const skillsPath = path.join(tempDir, SUB_DIR);
    if (!fs.existsSync(skillsPath)) {
        throw new Error(`Directory '${SUB_DIR}' not found in the repository.`);
    }

    const absoluteDest = path.resolve(DEST_DIR);
    if (!fs.existsSync(absoluteDest)) {
        fs.mkdirSync(absoluteDest, { recursive: true });
    }

    const skills = fs.readdirSync(skillsPath);
    let matchCount = 0;

    console.log(`Searching for keywords: [${KEYWORDS.join(', ')}] in ${SUB_DIR}...`);

    for (const skill of skills) {
        const skillPath = path.join(skillsPath, skill);
        if (fs.statSync(skillPath).isDirectory()) {
            if (searchInDirectory(skillPath, KEYWORDS)) {
                console.log(`Match found: ${skill}. Copying...`);
                fs.cpSync(skillPath, path.join(absoluteDest, skill), { recursive: true });
                matchCount++;
            }
        }
    }

    console.log(`\nFinished! Copied ${matchCount} skill(s) to ${absoluteDest}.`);
} catch (error) {
    console.error(`\nError: ${error.message}`);
    process.exit(1);
} finally {
    console.log('Cleaning up temporary files...');
    fs.rmSync(tempDir, { recursive: true, force: true });
}

function searchInDirectory(dir, keywords) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            if (searchInDirectory(filePath, keywords)) return true;
        } else {
            try {
                const content = fs.readFileSync(filePath, 'utf8').toLowerCase();
                if (keywords.some(keyword => content.includes(keyword.toLowerCase()))) {
                    return true;
                }
            } catch (e) {
                // Skip binary files or unreadable files
            }
        }
    }
    return false;
}
