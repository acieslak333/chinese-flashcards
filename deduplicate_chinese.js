const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/data/chinese.json');

try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(rawData);

    console.log(`Original count: ${data.length}`);

    const seen = new Set();
    const uniqueData = [];

    for (const item of data) {
        if (item.chiński && !seen.has(item.chiński)) {
            seen.add(item.chiński);
            uniqueData.push(item);
        } else if (!item.chiński) {
            // Keep items without the key? Assuming yes, or maybe warn.
            // But user said "based on the 'chiński' path", implying existence.
            // If key is missing, we probably shouldn't dedup it against "undefined". 
            // I'll keep them but usually flashcards should have it. 
            // Given the file content, they all seem to have it.
            uniqueData.push(item);
        }
    }

    console.log(`Unique count: ${uniqueData.length}`);
    console.log(`Removed: ${data.length - uniqueData.length}`);

    fs.writeFileSync(filePath, JSON.stringify(uniqueData, null, 4), 'utf8');
    console.log('File updated successfully.');

} catch (err) {
    console.error('Error processing file:', err);
    process.exit(1);
}
