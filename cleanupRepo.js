const fs = require('fs');
const path = require('path');

(async () => {
  const root = __dirname;
  const archive = path.join(root, 'archive');
  await fs.promises.mkdir(archive, { recursive: true });

  // Specifically move legacy backup folders
  const mainFolders = ['backups', 'mnBac_v9.7.1_Backup', 'analytics_data'];
  for (const folder of mainFolders) {
    const src = path.join(root, folder);
    if (fs.existsSync(src)) {
      const dest = path.join(archive, folder);
      try {
        await fs.promises.rename(src, dest);
      } catch (err) {
        if (err.code === 'EXDEV') {
          await fs.promises.cp(src, dest, { recursive: true });
          await fs.promises.rm(src, { recursive: true, force: true });
        } else {
          throw err;
        }
      }
    }
  }

  // Update .gitignore
  const gitignorePath = path.join(root, '.gitignore');
  let gitignore = fs.existsSync(gitignorePath)
    ? fs.readFileSync(gitignorePath, 'utf8')
    : '';
  const ignoreLines = mainFolders.map(f => `archive/${f}/`);
  for (const line of ignoreLines) {
    if (!gitignore.includes(line)) {
      if (!gitignore.endsWith('\n')) gitignore += '\n';
      gitignore += line + '\n';
    }
  }
  fs.writeFileSync(gitignorePath, gitignore);

  // Update README
  const readmePath = path.join(root, 'README.md');
  if (fs.existsSync(readmePath)) {
    let readme = fs.readFileSync(readmePath, 'utf8');
    const note = 'Active code in src/, archives in archive/';
    if (!readme.includes(note)) {
      if (!readme.endsWith('\n')) readme += '\n';
      readme += note + '\n';
      fs.writeFileSync(readmePath, readme);
    }
  }

  // Move remaining directories and files except allowed ones
  const keepDirs = new Set(['src', '.github', 'public', 'archive']);
  const keepFiles = new Set([
    '.gitignore',
    'README.md',
    'package.json',
    'tsconfig.json',
    'vite.config.js',
    'index.html',
    'favicon.ico'
  ]);
  const entries = await fs.promises.readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.git')) continue; // keep git related
    if (entry.isDirectory() && !keepDirs.has(entry.name)) {
      const src = path.join(root, entry.name);
      const dest = path.join(archive, entry.name);
      try {
        await fs.promises.rename(src, dest);
      } catch (err) {
        if (err.code === 'EXDEV') {
          await fs.promises.cp(src, dest, { recursive: true });
          await fs.promises.rm(src, { recursive: true, force: true });
        } else {
          throw err;
        }
      }
    } else if (entry.isFile() && !keepFiles.has(entry.name)) {
      const src = path.join(root, entry.name);
      const dest = path.join(archive, entry.name);
      await fs.promises.rename(src, dest).catch(async err => {
        if (err.code === 'EXDEV') {
          await fs.promises.copyFile(src, dest);
          await fs.promises.rm(src);
        } else {
          throw err;
        }
      });
    }
  }
})();
