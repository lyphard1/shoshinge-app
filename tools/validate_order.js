#!/usr/bin/env node
// 正信偈と和讃.txt と docs/script.js(originalPagesData) の順序・文言整合を検証する簡易ツール
// 使用: node tools/validate_order.js

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REF = path.join(ROOT, '正信偈と和讃.txt');
const SCRIPT = path.join(ROOT, 'docs', 'script.js');

function parseRef(text) {
    const lines = text.split(/\r?\n/);
    const sections = { shoshinge: [], wasan: [] };
    let current = null;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        if (line === '<正信念仏偈>') { current = 'shoshinge'; continue; }
        if (line === '<念仏和讃>') { current = 'wasan'; continue; }
        if (!current) continue;
        // Page header: PageX-xxx.png
        // パターン1: PageX-xxx.png
        let m = line.match(/^Page\d+\-(.+)\.png$/);
        if (m) {
            sections[current].push({ title: m[1], verses: [] });
            continue;
        }
        // パターン2: PageX だけの行 + 次行に xxx.png
        m = line.match(/^Page\d+$/);
        if (m && i + 1 < lines.length) {
            const next = lines[i + 1].trim();
            const m2 = next.match(/^(.+)\.png$/);
            if (m2) {
                sections[current].push({ title: m2[1], verses: [] });
                i++; // 次行を消費
                continue;
            }
        }
        // verse line
        if (sections[current].length === 0) continue;
        sections[current][sections[current].length - 1].verses.push(line);
    }
    return sections;
}

function stripRuby(s) { return (s || '').trim(); }

function extractOriginalPagesData(js) {
    // 超簡易抽出: originalPagesData = [ ... ]; の中の text を順に引く
    const arrMatch = js.match(/const\s+originalPagesData\s*=\s*\[(.|\n|\r)*?\];/);
    if (!arrMatch) throw new Error('originalPagesData が見つかりません');
    const block = arrMatch[0];
    // セクションごとに text を順に抽出
    const sectionRegex = /\{\s*section:\s*'([^']+)'\s*,\s*verses:\s*\[(.*?)\]\s*\}/gs;
    const textRegex = /text:\s*'([^']*)'/g;
    const result = { shoshinge: [], wasan: [] };
    let m;
    while ((m = sectionRegex.exec(block)) !== null) {
        const sec = m[1];
        const versesBlock = m[2];
        const verses = [];
        let tm;
        while ((tm = textRegex.exec(versesBlock)) !== null) {
            verses.push(tm[1]);
        }
        result[sec].push(verses);
    }
    return result;
}

function compare(ref, cur) {
    const diffs = [];
    for (const mode of ['shoshinge', 'wasan']) {
        const refPages = ref[mode];
        const curPages = cur[mode] || [];
        const maxPages = Math.max(refPages.length, curPages.length);
        for (let i = 0; i < maxPages; i++) {
            const refVerses = (refPages[i] && refPages[i].verses) || [];
            const curVerses = curPages[i] || [];
            const maxVerses = Math.max(refVerses.length, curVerses.length);
            for (let j = 0; j < maxVerses; j++) {
                const refText = stripRuby(refVerses[j] || '');
                const curText = stripRuby(curVerses[j] || '');
                // 厳密一致のみ（許容ルール無効化）
                let ok = refText === curText;
                if (!ok) {
                    diffs.push({ mode, page: i + 1, verse: j + 1, refText, curText });
                }
            }
        }
    }
    return diffs;
}

function main() {
    const refText = fs.readFileSync(REF, 'utf8');
    const script = fs.readFileSync(SCRIPT, 'utf8');
    const ref = parseRef(refText);
    const cur = extractOriginalPagesData(script);
    const diffs = compare(ref, cur);
    if (diffs.length === 0) {
        console.log('整合: すべて一致（許容ルール内）');
    } else {
        console.log('不一致一覧:');
        diffs.forEach(d => {
            console.log(`[${d.mode}] Page${d.page} Verse${d.verse}\n  ref: ${d.refText}\n  cur: ${d.curText}\n`);
        });
        process.exitCode = 1;
    }
}

if (require.main === module) {
    main();
}
