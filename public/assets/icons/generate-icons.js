// Script para gerar ícones PWA usando Sharp
// Uso: npm install sharp --save-dev && node generate-icons.js

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Criar SVG base simples (você pode substituir por sua imagem)
const svgBase = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#cba6f7;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#a6e3a1;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="192" height="192" fill="#1e1e2e"/>
  <circle cx="96" cy="96" r="80" fill="url(#grad1)"/>
  <text x="96" y="110" font-size="60" font-weight="bold" fill="#1e1e2e" text-anchor="middle" font-family="Arial">📝</text>
</svg>
`;

const outputDir = __dirname;
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  try {
    // Salvar SVG temporário
    const svgPath = path.join(outputDir, 'base.svg');
    fs.writeFileSync(svgPath, svgBase);

    console.log('Gerando ícones PWA...');

    // Gerar ícones padrão
    for (const size of sizes) {
      await sharp(svgPath)
        .resize(size, size, { fit: 'cover' })
        .png()
        .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
      console.log(`✓ icon-${size}x${size}.png`);
    }

    // Gerar ícones maskable (mesmo tamanho, design adaptável)
    for (const size of [192, 512]) {
      await sharp(svgPath)
        .resize(size, size, { fit: 'cover' })
        .png()
        .toFile(path.join(outputDir, `icon-maskable-${size}x${size}.png`));
      console.log(`✓ icon-maskable-${size}x${size}.png`);
    }

    // Limpar SVG temporário
    fs.unlinkSync(svgPath);

    console.log('\n✅ Ícones gerados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao gerar ícones:', error);
    process.exit(1);
  }
}

generateIcons();
