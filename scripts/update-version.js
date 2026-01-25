const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
    const count = execSync('git rev-list --count HEAD').toString().trim();
    const versionData = {
        version: `1.0.${count}`
    };

    fs.writeFileSync(
        path.join(__dirname, '../src/version.json'),
        JSON.stringify(versionData, null, 2)
    );

    console.log(`Updated version to 1.0.${count}`);
} catch (error) {
    console.error('Failed to update version:', error);
    // Create default if git fails
    if (!fs.existsSync(path.join(__dirname, '../src/version.json'))) {
        fs.writeFileSync(
            path.join(__dirname, '../src/version.json'),
            JSON.stringify({ version: "1.0.0" }, null, 2)
        );
    }
}
