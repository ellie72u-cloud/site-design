// T-Links (Pvt) Ltd. transport quotation template, from the "Transport quotation · A4" board.
const fs = require('fs');
const d = require('docx');
const { Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType, BorderStyle,
  ShadingType, AlignmentType, VerticalAlign, Footer, LevelFormat, TableLayoutType } = d;

const INK = '121410', MUT = '55574F', ACC = 'CDEB0F', WASH = 'F1F2EC', HAIR = 'C9CBC2';
const DISP = 'Arial Narrow', BODY = 'Arial', MONO = 'Consolas';
const W = 10206;                       // A4 11906 minus 2 × 850 margins
const img = (f, w, h) => new ImageRun({ type: 'png', data: fs.readFileSync(f), transformation: { width: w, height: h } });
const t = (text, o = {}) => new TextRun({ text, font: o.font || BODY, size: o.size || 21, bold: o.bold, color: o.color || INK, underline: o.underline, allCaps: o.caps, characterSpacing: o.sp });
const p = (runs, o = {}) => new Paragraph({ children: [].concat(runs), alignment: o.align, spacing: { before: o.before || 0, after: o.after ?? 0, line: o.line }, shading: o.shade ? { type: ShadingType.CLEAR, fill: o.shade, color: 'auto' } : undefined, border: o.border, indent: o.indent, numbering: o.numbering, keepNext: o.keepNext });
const NONE = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const noB = { top: NONE, bottom: NONE, left: NONE, right: NONE, insideHorizontal: NONE, insideVertical: NONE };
const line = (sz = 8, color = INK, style = BorderStyle.SINGLE) => ({ style, size: sz, color });
const cell = (children, w, o = {}) => new TableCell({ children, width: { size: w, type: WidthType.DXA }, borders: o.borders || { top: NONE, bottom: NONE, left: NONE, right: NONE },
  shading: o.fill ? { type: ShadingType.CLEAR, fill: o.fill, color: 'auto' } : undefined, verticalAlign: o.v || VerticalAlign.TOP,
  margins: { top: o.mt ?? 140, bottom: o.mb ?? 140, left: o.ml ?? 140, right: o.mr ?? 140 }, columnSpan: o.span });
const ph = (s) => t(s, { color: INK });   // placeholders read as [brackets] in body ink so they print if left

// ---------- header: mark + name, then the black/acid bar ----------
const header = new Table({ alignment: AlignmentType.CENTER, width: { size: 9200, type: WidthType.DXA }, columnWidths: [900, 8300], borders: noB, layout: TableLayoutType.FIXED,
  rows: [new TableRow({ children: [
    cell([p(img('logo.png', 46, 57))], 900, { v: VerticalAlign.CENTER, ml: 0, mr: 120 }),
    cell([p(t('T-LINKS (PVT) LTD.', { font: DISP, size: 52, bold: true })),
          p([t('SOURCING ', { font: MONO, size: 17, sp: 30 }), t('✱ ', { font: MONO, size: 17, color: '8A8C83' }), t('TRANSPORTATION ', { font: MONO, size: 17, sp: 30 }),
             t('✱ ', { font: MONO, size: 17, color: '8A8C83' }), t('LOGISTICS ', { font: MONO, size: 17, sp: 30 }), t('✱ ', { font: MONO, size: 17, color: '8A8C83' }),
             t('SUPPLIES', { font: MONO, size: 17, sp: 30 })], { before: 60 })], 8300, { v: VerticalAlign.CENTER, ml: 0 })] })] });

// ---------- title + date/number box ----------
const meta = new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [5506, 4700], borders: noB, layout: TableLayoutType.FIXED,
  rows: [new TableRow({ children: [
    cell([p(t('Quotation', { size: 39, bold: true })), p(t('Sale of Containers', { size: 26 }), { after: 80 }),
          p([t('To: ', { color: MUT }), t('Orange Line Project, Lahore', { bold: true })]),
          p([t('Delivery: ', { color: MUT }), t('From T-Links to Orange Line Project, Lahore')])], 5506, { ml: 0 }),
    cell([p([t('Quotation date: ', { color: MUT }), t('19 October 2026')], { align: AlignmentType.RIGHT, after: 60 }),
          p([t('Quotation no.: ', { color: MUT }), t('[TL/SC/19.10.26]')], { align: AlignmentType.RIGHT, after: 60 }),
          p([t('Valid until: ', { color: MUT }), t('26 October 2026')], { align: AlignmentType.RIGHT })], 4700,
      { borders: { top: line(32, ACC), bottom: line(6), left: line(6), right: line(6) }, ml: 220, mr: 220, mt: 160, mb: 160 })] })] });

// ---------- price table ----------
const COLS = [658, 3253, 1196, 718, 1866, 2515];
const B = line(6), B2 = line(12);
const allB = { top: B, bottom: B, left: B, right: B };
const headCell = (s, w, i) => cell([p(t(s, { bold: true, color: 'FFFFFF', size: 20 }), { align: AlignmentType.CENTER })], w, { fill: INK, v: VerticalAlign.CENTER,
  borders: { top: B2, bottom: B, left: i === 0 ? B2 : B, right: i === COLS.length - 1 ? B2 : B } });
const SPAN4 = COLS.slice(0, 4).reduce((x, y) => x + y), SPAN2 = COLS[4] + COLS[5];
const sumRow = (label, value, o = {}) => new TableRow({ cantSplit: true, children: [
  cell([p(t(label, o.big ? { font: MONO, size: 18, sp: 30 } : { size: 20, color: MUT }))], SPAN4, { span: 4, fill: o.fill, v: VerticalAlign.CENTER, ml: 240,
    borders: { top: o.big ? B2 : B, bottom: o.big ? B2 : B, left: B2, right: NONE } }),
  cell([p(t(value, o.big ? { font: DISP, size: 34, bold: true } : { size: 21, bold: true }), { align: AlignmentType.RIGHT })], SPAN2, { span: 2, fill: o.fill, v: VerticalAlign.CENTER,
    borders: { top: o.big ? B2 : B, bottom: o.big ? B2 : B, left: NONE, right: B2 } })] });
const charges = new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: COLS, layout: TableLayoutType.FIXED,
  rows: [
    new TableRow({ tableHeader: true, children: ['Sr.', 'Description', 'Unit', 'Qty', 'Unit Price (PKR)', 'Total (PKR)'].map((s, i) => headCell(s, COLS[i], i)) }),
    new TableRow({ cantSplit: true, children: [
      cell([p(t('1.'), { align: AlignmentType.CENTER })], COLS[0], { borders: { ...allB, left: B2 } }),
      cell([p(t('Containers', { bold: true, size: 22 }), { after: 40 }), p(t('Delivered from T-Links to Orange Line Project, Lahore', { size: 18, color: MUT }))], COLS[1], { borders: allB }),
      cell([p(t('Nos.'), { align: AlignmentType.CENTER })], COLS[2], { borders: allB }),
      cell([p(t('20', { bold: true, size: 22 }), { align: AlignmentType.CENTER })], COLS[3], { borders: allB }),
      cell([p(t('@ Rs. 580,000'), { align: AlignmentType.CENTER, after: 20 }), p(t('per container', { size: 18, color: MUT }), { align: AlignmentType.CENTER })], COLS[4], { borders: allB }),
      cell([p(t('Rs. 11,600,000/-', { bold: true, size: 22 }), { align: AlignmentType.RIGHT })], COLS[5], { borders: { ...allB, right: B2 } })] }),
    sumRow('Subtotal', 'Rs. 11,600,000/-'),
    sumRow('Taxes', 'Excluded'),
    sumRow('GRAND TOTAL (EXCLUDING TAXES)', 'Rs. 11,600,000/-', { big: true, fill: ACC }),
  ] });

// ---------- sign-off ----------
const signoff = new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [6806, 3400], borders: noB, layout: TableLayoutType.FIXED,
  rows: [new TableRow({ cantSplit: true, children: [
    cell([p(t('Thanking & assuring you of our best cooperation.'))], 6806, { v: VerticalAlign.BOTTOM, ml: 0 }),
    cell([p(t('Authorized Executive:', { color: MUT }), { align: AlignmentType.RIGHT, after: 40 }), p(t('[Name]', { bold: true }), { align: AlignmentType.RIGHT, after: 40 }),
          p(t('[Designation]'), { align: AlignmentType.RIGHT })], 3400, { borders: { top: line(6, HAIR), bottom: line(6, HAIR), left: line(6, HAIR), right: line(6, HAIR) }, ml: 200, mr: 200 })] })] });

const terms = ['Unit price is Rs. 580,000 per container.', 'All applicable taxes, duties and levies are excluded; applicable taxes will be charged separately.',
  'Delivery shall be arranged from T-Links to the Orange Line Project, Lahore.', 'Payment terms: to be mutually agreed.',
  'Quotation validity: 7 days from the quotation date (until 26 October 2026).'];

const doc = new Document({
  creator: 'T-Links (Pvt) Ltd.', title: 'T-Links Quotation — Sale of Containers, Orange Line Project',
  styles: { default: { document: { run: { font: BODY, size: 21, color: INK } } } },
  numbering: { config: [{ reference: 'terms', levels: [{ level: 0, format: LevelFormat.LOWER_LETTER, text: '%1.', alignment: AlignmentType.LEFT,
    style: { paragraph: { indent: { left: 640, hanging: 320 } } } }] }] },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 680, bottom: 1300, left: 850, right: 850, footer: 360 } } },
    footers: { default: new Footer({ children: [
      p(t('This is a computer-generated document and does not require a signature or stamp.', { size: 18, color: MUT }), { after: 120 }),
      p(img('bar-bottom.png', 680, 7), { after: 100 }),
      new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [5103, 5103], borders: noB, layout: TableLayoutType.FIXED, rows: [new TableRow({ children: [
        cell([p(t('[Office address], Islamabad', { font: MONO, size: 18 }))], 5103, { ml: 0, mt: 0, mb: 0 }),
        cell([p(t('[+92 3xx xxxxxxx] · [name]@tlinks.pk', { font: MONO, size: 18 }), { align: AlignmentType.RIGHT })], 5103, { mr: 0, mt: 0, mb: 0 })] })] }),
    ] }) },
    children: [
      header,
      p(img('bar-top.png', 680, 7), { before: 180, after: 360 }),
      meta,
      p(t(''), { before: 240, after: 240, border: { bottom: { style: BorderStyle.DASHED, size: 12, color: INK, space: 1 } } }),
      p(t('20 Containers', { size: 31, bold: true }), { shade: WASH, after: 200, indent: { left: 0 } }),
      charges,
      p(t('Rupees eleven million six hundred thousand only (excluding taxes)', { size: 20 }), { align: AlignmentType.RIGHT, before: 100 }),
      p(t('Terms & Conditions:', { bold: true, underline: {} }), { before: 400, after: 120, keepNext: true }),
      ...terms.map((s) => p(t(s), { numbering: { reference: 'terms', level: 0 }, after: 50 })),
      p(t(''), { after: 300 }),
      signoff,
    ],
  }],
});
Packer.toBuffer(doc).then((b) => { fs.writeFileSync(process.argv[2], b); console.log('wrote', process.argv[2]); });
