#!/usr/bin/env node
// 測定データからタイムスタンプを更新するスクリプト

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SCRIPT_FILE = path.join(ROOT, 'docs', 'script.js');
const SHOSHINGE_DATA = path.join(ROOT, 'audio', 'shoshigeラベル_left_only.txt');
const WASAN_DATA = path.join(ROOT, 'audio', 'nenbutuwasanラベル_left_only.txt');

function parseTimestamps(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const timestamps = content.trim().split('\n').map(line => parseFloat(line.trim()));
    
    // ペアに変換 (開始, 終了)
    const pairs = [];
    for (let i = 0; i < timestamps.length; i += 2) {
        if (i + 1 < timestamps.length) {
            pairs.push({
                start: timestamps[i],
                end: timestamps[i + 1]
            });
        }
    }
    
    return pairs;
}

function updateScriptFile() {
    const script = fs.readFileSync(SCRIPT_FILE, 'utf8');
    
    // 正信偈と念仏和讃の測定データを読み込み
    const shoshingeTimestamps = parseTimestamps(SHOSHINGE_DATA);
    const wasanTimestamps = parseTimestamps(WASAN_DATA);
    
    console.log(`正信偈: ${shoshingeTimestamps.length}句のタイムスタンプを読み込み`);
    console.log(`念仏和讃: ${wasanTimestamps.length}句のタイムスタンプを読み込み`);
    
    // originalPagesData を抽出
    const pagesDataMatch = script.match(/const originalPagesData = \[([\s\S]*?)\];/);
    if (!pagesDataMatch) {
        throw new Error('originalPagesData が見つかりません');
    }
    
    // 現在のデータ構造を解析
    const currentData = extractCurrentStructure(script);
    
    // 新しいタイムスタンプを適用
    const updatedData = applyNewTimestamps(currentData, shoshingeTimestamps, wasanTimestamps);
    
    // スクリプトファイルを更新
    const newDataString = generateDataString(updatedData);
    const newScript = script.replace(
        /const originalPagesData = \[([\s\S]*?)\];/,
        `const originalPagesData = [\n${newDataString}\n];`
    );
    
    fs.writeFileSync(SCRIPT_FILE, newScript, 'utf8');
    console.log('タイムスタンプの更新が完了しました');
}

function extractCurrentStructure(script) {
    const sections = { shoshinge: [], wasan: [] };
    
    // section ごとにブロックを抽出
    const sectionRegex = /\{\s*section:\s*'([^']+)'\s*,\s*verses:\s*\[(.*?)\]\s*\}/gs;
    let match;
    
    while ((match = sectionRegex.exec(script)) !== null) {
        const sectionType = match[1];
        const versesBlock = match[2];
        
        // verses 内の各句を抽出
        const verseRegex = /\{\s*start:\s*[\d.]+\s*,\s*end:\s*[\d.]+\s*,\s*text:\s*'([^']*)'\s*,\s*ruby:\s*'([^']*)'\s*\}/g;
        const verses = [];
        let verseMatch;
        
        while ((verseMatch = verseRegex.exec(versesBlock)) !== null) {
            verses.push({
                text: verseMatch[1],
                ruby: verseMatch[2]
            });
        }
        
        if (verses.length > 0) {
            sections[sectionType].push(verses);
        }
    }
    
    return sections;
}

function applyNewTimestamps(currentData, shoshingeTimestamps, wasanTimestamps) {
    const result = [];
    
    // 正信偈の更新
    let shoshingeIndex = 0;
    for (const pageVerses of currentData.shoshinge) {
        const verses = [];
        for (const verse of pageVerses) {
            if (shoshingeIndex < shoshingeTimestamps.length) {
                const timing = shoshingeTimestamps[shoshingeIndex];
                verses.push({
                    start: timing.start,
                    end: timing.end,
                    text: verse.text,
                    ruby: verse.ruby
                });
                shoshingeIndex++;
            }
        }
        if (verses.length > 0) {
            result.push({
                section: 'shoshinge',
                verses: verses
            });
        }
    }
    
    // 念仏和讃の更新
    let wasanIndex = 0;
    for (const pageVerses of currentData.wasan) {
        const verses = [];
        for (const verse of pageVerses) {
            if (wasanIndex < wasanTimestamps.length) {
                const timing = wasanTimestamps[wasanIndex];
                verses.push({
                    start: timing.start,
                    end: timing.end,
                    text: verse.text,
                    ruby: verse.ruby
                });
                wasanIndex++;
            }
        }
        if (verses.length > 0) {
            result.push({
                section: 'wasan',
                verses: verses
            });
        }
    }
    
    return result;
}

function generateDataString(data) {
    const lines = [];
    
    for (const block of data) {
        lines.push('  // --- ' + (block.section === 'shoshinge' ? '正信偈 (shoshinge)' : '念仏和讃 (wasan)') + ' ---');
        
        const versesStr = block.verses.map(v => 
            `{ start: ${v.start}, end: ${v.end}, text: '${v.text}', ruby: '${v.ruby}' }`
        ).join(', ');
        
        lines.push(`  { section: '${block.section}', verses: [${versesStr}] },`);
    }
    
    return lines.join('\n');
}

if (require.main === module) {
    try {
        updateScriptFile();
    } catch (error) {
        console.error('エラー:', error.message);
        process.exit(1);
    }
}
