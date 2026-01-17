const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/data/chinese.json');

try {
    let rawData = fs.readFileSync(filePath, 'utf8');
    
    // Attempt to fix common copy-paste errors (double arrays like [[...]])
    // If the user pasted a full JSON array into the existing one, we might have valid JSON but nested arrays.
    let data;
    try {
        data = JSON.parse(rawData);
    } catch (e) {
        console.log("JSON parse error, attempting to fix common issues...");
        // If there are multiple root arrays pasted next to each other like [...] [...], we can try to fix that
        // OR if there's a trailing comma issue.
        // For now, let's assume it's valid JSON. If not, we might need manual intervention or regex fixing.
        throw e;
    }

    // Flatten if it's an array of arrays (e.g. user pasted [...] inside [...])
    if (Array.isArray(data)) {
        data = data.flat(Infinity); // Flatten deeply just in case
    }

    console.log(`Total entries found: ${data.length}`);

    const seen = new Set();
    const uniqueData = [];
    let duplicates = 0;

    for (const item of data) {
        if (!item) continue; // Skip nulls
        
        // Key for deduplication: chiński
        const key = item.chiński;
        
        if (key) {
            if (seen.has(key)) {
                duplicates++;
            } else {
                seen.add(key);
                uniqueData.push(item);
            }
        } else {
            // Keep items without 'chiński' key? 
            // Better to keep them to be safe, or log them.
            // Assuming they are valid records just missing a field (unlikely in this dataset)
            uniqueData.push(item);
        }
    }

    console.log(`Unique entries: ${uniqueData.length}`);
    console.log(`Duplicates removed: ${duplicates}`);

    fs.writeFileSync(filePath, JSON.stringify(uniqueData, null, 4), 'utf8');
    console.log('Successfully cleaned chinese.json');

} catch (err) {
    console.error('Error processing file:', err);
    process.exit(1);
}
