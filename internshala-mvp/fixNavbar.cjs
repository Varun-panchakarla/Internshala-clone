const fs = require('fs');
let content = fs.readFileSync('src/components/common/Navbar.jsx', 'utf8');

if (!content.includes('import { useJob } from')) {
  content = content.replace(
    `import { useTheme } from '../../context/ThemeContext';`,
    `import { useTheme } from '../../context/ThemeContext';\nimport { useJob } from '../../context/JobContext';`
  );
}

if (!content.includes('const { savedJobs } = useJob();')) {
  content = content.replace(
    `const { currentUser, logout, isAuthenticated, profileCompletion } = useAuth();`,
    `const { currentUser, logout, isAuthenticated, profileCompletion } = useAuth();\n  const { savedJobs } = useJob();`
  );
}

fs.writeFileSync('src/components/common/Navbar.jsx', content, 'utf8');
console.log('Navbar patched');
