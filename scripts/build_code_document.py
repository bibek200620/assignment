"""Create the complete source-code Word submission using python-docx."""
from pathlib import Path
from hashlib import sha256
import json
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK, WD_LINE_SPACING
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.style import WD_STYLE_TYPE

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'output/docx/Amazon_Clone_Complete_Code_Bibek_SCA24CA0016.docx'
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

FILES = [
    ('Root package configuration', 'package.json'),
    ('Environment configuration example', '.env.example'),
    ('MongoDB container configuration', 'docker-compose.yml'),
    ('Git exclusion rules', '.gitignore'),
    ('Frontend package configuration', 'client/package.json'),
    ('TypeScript configuration', 'client/tsconfig.json'),
    ('Vite configuration', 'client/vite.config.ts'),
    ('HTML entry point', 'client/index.html'),
    ('Application favicon', 'client/public/favicon.svg'),
    ('React entry point', 'client/src/main.tsx'),
    ('TypeScript data models', 'client/src/types.ts'),
    ('Frontend API helper', 'client/src/api.ts'),
    ('Authentication and store context', 'client/src/context.tsx'),
    ('Reusable React components', 'client/src/components.tsx'),
    ('React pages and routing', 'client/src/App.tsx'),
    ('Complete responsive stylesheet', 'client/src/styles.css'),
    ('Backend package configuration', 'server/package.json'),
    ('Server startup and database connection', 'server/src/index.js'),
    ('MongoDB data models', 'server/src/models.js'),
    ('Express API and authentication middleware', 'server/src/app.js'),
    ('Demo accounts and product seed', 'server/src/seed.js'),
    ('API integration tests', 'server/test/api.test.js'),
    ('Project setup script', 'scripts/setup.mjs'),
    ('PDF report generation utility', 'scripts/build_report.py'),
    ('Submission packaging utility', 'scripts/package_submission.py'),
]

doc = Document()
section = doc.sections[0]
section.page_width = Inches(8.2677)
section.page_height = Inches(11.6929)
section.top_margin = Inches(.7)
section.bottom_margin = Inches(.65)
section.left_margin = Inches(.65)
section.right_margin = Inches(.65)
section.header_distance = Inches(.25)
section.footer_distance = Inches(.25)

for name in ['Normal', 'Title', 'Subtitle', 'Heading 1', 'Heading 2', 'Heading 3']:
    style = doc.styles[name]
    style.font.name = 'Arial'
    style.font.color.rgb = RGBColor(0, 0, 0)
    style.font.underline = False
    style.font.italic = False
    style.paragraph_format.space_after = Pt(8)
    rpr = style.element.get_or_add_rPr()
    color = rpr.find(qn('w:color'))
    if color is not None:
        for key in list(color.attrib):
            if key != qn('w:val'):
                del color.attrib[key]
doc.styles['Normal'].font.size = Pt(10.5)
doc.styles['Normal'].paragraph_format.line_spacing = 1.15
doc.styles['Normal'].paragraph_format.space_before = Pt(4)
doc.styles['Title'].font.size = Pt(29)
doc.styles['Title'].font.bold = True
doc.styles['Heading 1'].font.size = Pt(18)
doc.styles['Heading 2'].font.size = Pt(13)
for name in ['Heading 1', 'Heading 2', 'Heading 3']:
    doc.styles[name].paragraph_format.keep_with_next = True
for border in list(doc.styles.element.xpath('.//w:pBdr')):
    border.getparent().remove(border)

code_style = doc.styles.add_style('Source Code', WD_STYLE_TYPE.PARAGRAPH)
code_style.font.name = 'Courier New'
code_style.font.size = Pt(8.5)
code_style.font.color.rgb = RGBColor(0, 0, 0)
code_style.paragraph_format.space_before = Pt(0)
code_style.paragraph_format.space_after = Pt(0)
code_style.paragraph_format.line_spacing_rule = WD_LINE_SPACING.EXACTLY
code_style.paragraph_format.line_spacing = Pt(10.4)
code_style.paragraph_format.keep_together = False
code_style.paragraph_format.keep_with_next = False
code_style.paragraph_format.widow_control = False
code_style.paragraph_format.tab_stops.add_tab_stop(Inches(.22))
rfonts = code_style.element.get_or_add_rPr().get_or_add_rFonts()
for attr in ['ascii', 'hAnsi', 'eastAsia', 'cs']:
    rfonts.set(qn('w:' + attr), 'Courier New')

path_style = doc.styles.add_style('File Path', WD_STYLE_TYPE.PARAGRAPH)
path_style.font.name = 'Courier New'
path_style.font.size = Pt(10)
path_style.font.color.rgb = RGBColor(0, 0, 0)
path_style.paragraph_format.keep_with_next = True
path_style.paragraph_format.space_after = Pt(7)

small_style = doc.styles.add_style('Submission Note', WD_STYLE_TYPE.PARAGRAPH)
small_style.font.name = 'Arial'
small_style.font.size = Pt(9)
small_style.font.color.rgb = RGBColor(0, 0, 0)
small_style.paragraph_format.space_after = Pt(8)

def paragraph(text='', style=None, bold=False):
    p = doc.add_paragraph(style=style)
    p.add_run(text).bold = bold
    return p

def new_page():
    doc.add_page_break()

def field(par, instruction):
    item = OxmlElement('w:fldSimple')
    item.set(qn('w:instr'), instruction)
    r = OxmlElement('w:r')
    props = OxmlElement('w:rPr')
    size = OxmlElement('w:sz')
    size.set(qn('w:val'), '16')
    props.append(size)
    r.append(props)
    t = OxmlElement('w:t')
    t.text = '1'
    r.append(t)
    item.append(r)
    par._p.append(item)

def bookmark(par, name, ident):
    start = OxmlElement('w:bookmarkStart')
    start.set(qn('w:id'), str(ident))
    start.set(qn('w:name'), name)
    end = OxmlElement('w:bookmarkEnd')
    end.set(qn('w:id'), str(ident))
    par._p.insert(0, start)
    par._p.append(end)

def internal_link(par, text, anchor):
    link = OxmlElement('w:hyperlink')
    link.set(qn('w:anchor'), anchor)
    run = OxmlElement('w:r')
    props = OxmlElement('w:rPr')
    sz = OxmlElement('w:sz')
    sz.set(qn('w:val'), '18')
    props.append(sz)
    run.append(props)
    txt = OxmlElement('w:t')
    txt.text = text
    run.append(txt)
    link.append(run)
    par._p.append(link)

header = section.header.paragraphs[0]
header.alignment = WD_ALIGN_PARAGRAPH.RIGHT
header.add_run('Amazon Clone complete source code').font.size = Pt(8)
footer = section.footer.paragraphs[0]
footer.add_run('Bibek  |  SCA24CA0016  |  BCA V  |  Section A').font.size = Pt(8)
footer.add_run('                 Page ').font.size = Pt(8)
field(footer, 'PAGE')
footer.add_run(' of ').font.size = Pt(8)
field(footer, 'NUMPAGES')

# Cover
paragraph('DAYANANDA SAGAR UNIVERSITY', bold=True).alignment = WD_ALIGN_PARAGRAPH.CENTER
paragraph('School of Computer Applications').alignment = WD_ALIGN_PARAGRAPH.CENTER
paragraph('')
paragraph('')
paragraph('Amazon Clone Complete Source Code', 'Title')
paragraph('Assignment II Full Stack Development', 'Subtitle')
paragraph('This submission contains the complete source code for a simple Amazon inspired MERN shopping application. It includes the frontend, backend REST API, MongoDB schemas, JWT authentication, setup and configuration files, automated tests, and project utilities.')
paragraph('Student name  Bibek', bold=True)
paragraph('Register number  SCA24CA0016')
paragraph('Programme  Bachelor of Computer Applications')
paragraph('Semester  V    Section  A')
paragraph('Course code  24CA3511')
paragraph('Course title  Full Stack Development')
paragraph('Faculty  Ms. Priyanka D Rukesh')
paragraph('Academic period  Odd Semester 2026 2027')
paragraph('Submission date  18 November 2026')
paragraph('')
paragraph('Technology  MongoDB  Express  React  Node.js', bold=True)
paragraph('Source code is presented as selectable text under its exact filename. Product photography is bundled in the accompanying project archive. The document does not print dependency downloads, compiled output, private environment secrets, or the generated package lockfile.', 'Submission Note')

# Introduction and running instructions
new_page()
doc.add_heading('Project overview and execution', level=1)
paragraph('The application provides public product browsing, search, category filters, product details, customer registration and sign in, a persistent shopping cart, demo checkout, and order history. An administrator can create, read, update, and delete products. React Router handles navigation and React Context shares account and shopping state.')
paragraph('The server signs an HS256 JSON Web Token after authentication and stores it in an HttpOnly SameSite cookie. Protected middleware verifies the token and the current database role. Cart and order queries are scoped to the authenticated account. MongoDB stores users, products, carts, and orders.')
doc.add_heading('Running the project', level=2)
paragraph('Requirements are Node.js 22.12 or later, npm, and Docker Desktop running. Extract the supplied source project, open its folder in a terminal, and run the following commands.')
for line in ['npm ci', 'npm run setup', 'npm run dev']:
    paragraph(line, 'Source Code')
paragraph('Open http://localhost:5173. Setup creates a private environment file with a random JWT secret, starts MongoDB, and seeds demo accounts and eight products. The API uses port 5001. To serve the compiled frontend from Express, run npm run build followed by npm start, then open http://localhost:5001.')
doc.add_heading('Demo accounts', level=2)
paragraph('Customer  demo@example.com    Password  Demo12345!', 'Source Code')
paragraph('Administrator  admin@example.com    Password  Admin12345!', 'Source Code')
paragraph('The sign in screen also offers customer and admin demo buttons. Public registration always creates a customer account.')
doc.add_heading('Validation', level=2)
paragraph('Sixteen API integration tests passed against a real MongoDB server. Tests cover product and cart CRUD, account isolation, JWT authentication, administrator permissions, input validation, checkout totals, and saved order snapshots. Run npm test while MongoDB is available. The TypeScript and Vite build and Prettier formatting checks also passed.')
doc.add_heading('Demonstration scope', level=2)
paragraph('Checkout is a cash on delivery demo. No payment is collected and no goods are shipped. Ratings and product claims are sample data. Product photos are selected from eight bundled images. Real payments, uploads, customer reviews, shipping, returns, and stock count reservation are outside this version.')

# Linked source index
new_page()
doc.add_heading('Source file index', level=1)
paragraph('The following files are included in full. Select a filename to jump to its listing in Word. Each listing starts on a new page. All source text is copied directly from the project files.', 'Submission Note')
for index, (title, filename) in enumerate(FILES, 1):
    par = doc.add_paragraph()
    par.paragraph_format.space_before = Pt(0)
    par.paragraph_format.space_after = Pt(3)
    par.paragraph_format.line_spacing_rule = WD_LINE_SPACING.EXACTLY
    par.paragraph_format.line_spacing = Pt(10.5)
    par.add_run(f'{index:02d}  ').bold = True
    internal_link(par, filename, f'source_{index:02d}')
    par.add_run(f'\n       {title}').font.size = Pt(8.5)

# Verbatim source listings
manifest = []
for index, (title, filename) in enumerate(FILES, 1):
    source = ROOT / filename
    content = source.read_text(encoding='utf-8')
    new_page()
    title_par = doc.add_heading(f'{index:02d} {title}', level=1)
    bookmark(title_par, f'source_{index:02d}', index)
    paragraph(filename, 'File Path')
    count = len(content.splitlines())
    paragraph(f'Complete file listing    {count} source lines', 'Submission Note')
    for line in content.splitlines():
        paragraph(line, 'Source Code')
    manifest.append({'file': filename, 'lines': count, 'sha256': sha256(source.read_bytes()).hexdigest()})

new_page()
doc.add_heading('Product assets and references', level=1)
paragraph('The application uses the following local image files. They are binary assets rather than source code and are supplied in the project archive under client/public/images. Their filenames are used by the seed script and product photo selector.')
for file in sorted((ROOT / 'client/public/images').glob('*.jpg')):
    paragraph(str(file.relative_to(ROOT)), 'File Path')
paragraph('Image source  Unsplash image CDN. Exact source URLs are listed in docs/ASSET_CREDITS.md in the project archive. Interface icons use Lucide React. The application is an educational Amazon inspired clone and does not connect to Amazon services.')
doc.add_heading('Documentation references', level=2)
for text in [
    'React documentation  https://react.dev/learn',
    'React Router  https://reactrouter.com/start/declarative/routing',
    'Express routing  https://expressjs.com/en/guide/routing/',
    'Mongoose validation  https://mongoosejs.com/docs/validation.html',
    'MongoDB manual  https://www.mongodb.com/docs/manual/',
    'JWT library  https://github.com/auth0/node-jsonwebtoken',
]:
    paragraph(text, 'Submission Note')

doc.core_properties.title = 'Amazon Clone Complete Source Code'
doc.core_properties.subject = 'Assignment II Full Stack Development 24CA3511'
doc.core_properties.author = 'Bibek'
doc.core_properties.keywords = 'SCA24CA0016 BCA V Section A MERN Amazon Clone'
doc.core_properties.comments = ''
doc.save(OUTPUT)

# Reopen and verify every source line rather than relying only on the rendering.
check = Document(OUTPUT)
actual = [par.text for par in check.paragraphs if par.style.name == 'Source Code']
expected = [line for _, filename in FILES for line in (ROOT / filename).read_text(encoding='utf-8').splitlines()]
assert actual[5:] == expected, 'A source listing differs from its original file.'
manifest_path = ROOT / 'tmp/code-document-source-manifest.json'
manifest_path.parent.mkdir(exist_ok=True)
manifest_path.write_text(json.dumps(manifest, indent=2))
print(f'{OUTPUT}\n{len(FILES)} files; {sum(item["lines"] for item in manifest)} source lines; verbatim content verified')
