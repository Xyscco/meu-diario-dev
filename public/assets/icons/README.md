# Geração de Ícones PWA

Este diretório contém os ícones para a Progressive Web App (PWA).

## 🎨 Gerar os Ícones

Você pode gerar os ícones necessários usando uma das seguintes ferramentas:

### Opção 1: PWA Builder (Recomendado)
1. Acesse https://www.pwabuilder.com
2. Clique em "Create" ou "Generate"
3. Faça upload de uma imagem PNG base (pelo menos 512x512px)
4. A ferramenta irá gerar automaticamente todos os tamanhos necessários
5. Baixe os ícones e coloque nesta pasta

### Opção 2: Real Favicon Generator
1. Acesse https://realfavicongenerator.net
2. Faça upload de sua imagem
3. Configure as opções desejadas
4. Baixe o pacote e extraia os ícones aqui

### Opção 3: Script Local (Node.js + Sharp)
Se você tiver `sharp` instalado localmente:

```bash
npm install sharp --save-dev
node generate-icons.js
```

## 📋 Ícones Necessários

Os seguintes tamanhos de ícone são necessários:

- `icon-72x72.png` (72×72)
- `icon-96x96.png` (96×96)
- `icon-128x128.png` (128×128)
- `icon-144x144.png` (144×144)
- `icon-152x152.png` (152×152)
- `icon-192x192.png` (192×192)
- `icon-384x384.png` (384×384)
- `icon-512x512.png` (512×512)
- `icon-maskable-192x192.png` (192×192, adaptivo)
- `icon-maskable-512x512.png` (512×512, adaptivo)

## 📸 Screenshots (Opcional)

Você também pode adicionar screenshots da aplicação em produção:

- `screenshot-1.png` (540×720, orientação vertical)
- `screenshot-2.png` (540×720, orientação vertical)

## 🎯 Recomendações de Design

- Use um fundo sólido (recomendado: #cba6f7 - tema roxo do projeto)
- Deixe espaço em torno do ícone para adaptação (especialmente para ícones maskable)
- Use um design simples que funcione bem em tamanhos pequenos
- Para ícones maskable, o design deve funcionar com qualquer formato de máscara

## ✅ Validação

Depois de adicionar os ícones, você pode validar a PWA usando:

1. Chrome DevTools → Application → Manifest
2. https://www.pwabuilder.com (verifique seu site)
3. Lighthouse do Chrome

---

**Nota:** Até adicionar os ícones, a PWA funcionará, mas os ícones não serão exibidos na tela inicial do dispositivo.
