const fs = require('fs');
let content = fs.readFileSync('src/components/common/Navbar.jsx', 'utf8');

// 1. Add icons to react-icons/fi import
content = content.replace(
  `FiChevronDown, FiBell,`,
  `FiChevronDown, FiBell, FiGrid, FiBriefcase, FiHeart, FiFileText, FiLayout`
);

// 2. Add JobContext import
if (!content.includes('import { useJobs }')) {
  content = content.replace(
    `import { useTheme } from '../../context/ThemeContext';`,
    `import { useTheme } from '../../context/ThemeContext';\nimport { useJobs } from '../../context/JobContext';`
  );
}

// 3. Add savedJobs hook
if (!content.includes('const { savedJobs } = useJobs();')) {
  content = content.replace(
    `const { currentUser, logout, isAuthenticated, profileCompletion } = useAuth();`,
    `const { currentUser, logout, isAuthenticated, profileCompletion } = useAuth();\n  const { savedJobs } = useJobs();`
  );
}

fs.writeFileSync('src/components/common/Navbar.jsx', content, 'utf8');
console.log('Navbar successfully patched');
