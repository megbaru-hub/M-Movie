const srtText = `1
00:00:00,000 --> 00:00:02,000
Subtitle text

2
00:00:02,000 --> 00:00:04,500
Next subtitle with multi-line
And some special characters!`;

const vttText = 'WEBVTT\n\n' + srtText.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');

console.log('--- SRT INPUT ---');
console.log(srtText);
console.log('\n--- VTT OUTPUT ---');
console.log(vttText);

if (vttText.includes('00:00:00.000') && vttText.includes('00:00:04.500') && vttText.startsWith('WEBVTT')) {
    console.log('\nSUCCESS: Conversion logic verified.');
} else {
    console.log('\nFAILURE: Conversion logic failed.');
    process.exit(1);
}
