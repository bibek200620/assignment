"""Package source, report, and screenshots without dependencies or private environment files."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
target = root / 'output/Amazon_Clone_Bibek_SCA24CA0016.zip'
roots = [
    '.gitignore', '.env.example', 'package.json', 'package-lock.json', 'docker-compose.yml', 'README.md',
    'client/package.json', 'client/tsconfig.json', 'client/vite.config.ts', 'client/index.html',
    'client/src', 'client/public', 'server/package.json', 'server/src', 'server/test',
    'scripts', 'docs', 'output/pdf', 'output/playwright',
]
files = []
for item in roots:
    path = root / item
    files.extend([path] if path.is_file() else [p for p in path.rglob('*') if p.is_file()])
files = [p for p in files if '__pycache__' not in p.parts and p.suffix != '.pyc']
with ZipFile(target, 'w', ZIP_DEFLATED) as archive:
    for file in sorted(set(files)):
        archive.write(file, Path('Amazon_Clone_Bibek') / file.relative_to(root))
with ZipFile(target) as archive:
    assert archive.testzip() is None
    assert not any('/node_modules/' in name or name.endswith('/.env') for name in archive.namelist())
    print(f'{target}\n{len(archive.namelist())} files; {target.stat().st_size:,} bytes; integrity check passed')
