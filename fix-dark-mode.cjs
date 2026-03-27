const fs = require('fs');
const path = require('path');

const replacements = [
    { regex: /bg-white(?!\s+dark:bg-)/g, replace: 'bg-white dark:bg-slate-900' },
    { regex: /text-slate-900(?!\s+dark:text-)/g, replace: 'text-slate-900 dark:text-white' },
    { regex: /text-slate-800(?!\s+dark:text-)/g, replace: 'text-slate-800 dark:text-gray-100' },
    { regex: /text-slate-700(?!\s+dark:text-)/g, replace: 'text-slate-700 dark:text-gray-200' },
    { regex: /text-slate-600(?!\s+dark:text-)/g, replace: 'text-slate-600 dark:text-gray-300' },
    { regex: /text-slate-500(?!\s+dark:text-)/g, replace: 'text-slate-500 dark:text-gray-400' },
    { regex: /bg-slate-50(?!\s+dark:bg-)/g, replace: 'bg-slate-50 dark:bg-slate-800' },
    { regex: /bg-slate-100(?!\s+dark:bg-)/g, replace: 'bg-slate-100 dark:bg-slate-800' },
    { regex: /border-slate-100(?!\s+dark:border-)/g, replace: 'border-slate-100 dark:border-slate-800' },
    { regex: /border-slate-200(?!\s+dark:border-)/g, replace: 'border-slate-200 dark:border-slate-700' },
    { regex: /divide-slate-100(?!\s+dark:divide-)/g, replace: 'divide-slate-100 dark:divide-slate-800' },
    { regex: /hover:bg-slate-50(?!\s+dark:hover:bg-)/g, replace: 'hover:bg-slate-50 dark:hover:bg-slate-800' },
];

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;
            
            for (const r of replacements) {
                if (r.regex.test(content)) {
                    content = content.replace(r.regex, r.replace);
                    modified = true;
                }
            }
            
            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated:', fullPath);
            }
        }
    }
}

processDirectory('c:/Users/Ritesh/Downloads/main integration testing/Final-year-project/src/pages');
processDirectory('c:/Users/Ritesh/Downloads/main integration testing/Final-year-project/src/components');

console.log('Done mapping global styles.');
