# Como publicar o SAP One Pager Hub

Guia completo para qualquer pessoa republicar esta aplicação no seu próprio GitHub ou outra plataforma.

---

## O que você vai precisar

- Conta no [GitHub](https://github.com) (gratuita)
- [Git](https://git-scm.com/download/win) instalado
- [Node.js LTS](https://nodejs.org) instalado
- Acesso ao SharePoint SAP (para exportar os dados)

---

## Parte 1 — Copiar o código

### Opção A: Fork (mais simples)

1. Acesse **https://github.com/rbechara1309/sap-onepager-app**
2. Clique em **Fork** (canto superior direito)
3. Escolha sua conta e clique em **Create fork**
4. Pronto — você tem uma cópia completa no seu GitHub

### Opção B: Clone e novo repositório

Abra o PowerShell e execute:

```powershell
# 1. Clone o repositório original
git clone https://github.com/rbechara1309/sap-onepager-app.git
cd sap-onepager-app

# 2. Desconecte do repositório original
git remote remove origin

# 3. Crie um novo repositório no github.com com o nome que quiser
#    (sem README, sem .gitignore)

# 4. Conecte ao seu novo repositório
git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPO.git
git push -u origin main
```

---

## Parte 2 — Ajustar o nome do repositório no código

Se você usou um nome diferente de `sap-onepager-app`, edite o arquivo `vite.config.ts`:

```ts
// Mude para o nome do SEU repositório
base: '/NOME_DO_SEU_REPO/',
```

Salve, faça commit e push:

```powershell
git add vite.config.ts
git commit -m "config: ajustar base url"
git push
```

---

## Parte 3 — Ativar o GitHub Pages

1. No seu repositório, vá em **Settings → Pages**
2. Em **Source**, selecione **GitHub Actions**
3. Salve

O GitHub Actions vai buildar e publicar automaticamente a cada push.
O site ficará em: `https://SEU_USUARIO.github.io/NOME_DO_REPO/`

---

## Parte 4 — Carregar os dados reais

### 4.1 — Exportar o inventário Excel

Baixe o arquivo Excel do SharePoint:
```
https://sap.sharepoint.com/:x:/r/teams/PartnerHubBCN/Shared%20Documents/Region%20LAC%20...
```

### 4.2 — Exportar a lista de One Pagers

1. Abra a pasta One Pager no SharePoint no navegador
2. Pressione **F12** → aba **Console**
3. Cole e execute o script abaixo:

```javascript
(async () => {
  const siteUrl = 'https://sap.sharepoint.com/teams/PartnerHubBCN'
  const folderPath = '/teams/PartnerHubBCN/Shared Documents/Region LAC Latin America and Caribbean (Pablo)/2026/One Pager'
  const url = `${siteUrl}/_api/web/GetFolderByServerRelativeUrl(@p)/Files?@p='${encodeURIComponent(folderPath)}'&$select=Name,ServerRelativeUrl&$top=5000`
  const res = await fetch(url, { headers: { Accept: 'application/json;odata=verbose' } })
  const data = await res.json()
  const files = data.d.results.map(f => ({ name: f.Name, url: 'https://sap.sharepoint.com' + f.ServerRelativeUrl }))
  const blob = new Blob([JSON.stringify(files, null, 2)], { type: 'application/json' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'onepapers-files.json'; a.click()
  console.log(`✓ ${files.length} arquivos exportados`)
})()
```

Salve o `onepapers-files.json` na pasta Downloads.

### 4.3 — Converter e publicar

Abra o PowerShell na pasta do projeto e execute:

```powershell
# Instalar dependências (só na primeira vez)
npm install

# Converter Excel + vincular One Pagers
npm run convert -- "C:\Users\SEU_USUARIO\Downloads\NOME_DO_ARQUIVO.xlsx" "C:\Users\SEU_USUARIO\Downloads\onepapers-files.json"

# Publicar
git add public/data.json
git commit -m "chore: atualizar dados"
git push
```

O site atualiza automaticamente em ~1 minuto após o push.

---

## Parte 5 — Alternativas ao GitHub Pages

### Vercel (mais simples, sem configuração extra)

1. Acesse [vercel.com](https://vercel.com) e faça login com sua conta GitHub
2. Clique em **Add New → Project**
3. Importe seu repositório
4. Em **Framework Preset**, selecione **Vite**
5. Em **Build Command**: `npm run build`
6. Em **Output Directory**: `dist`
7. Clique em **Deploy**

> ⚠️ No Vercel, remova o `base` do `vite.config.ts` (ou deixe `base: '/'`), pois o site fica na raiz do domínio.

### Netlify

1. Acesse [netlify.com](https://netlify.com) e faça login com GitHub
2. Clique em **Add new site → Import an existing project**
3. Selecione seu repositório
4. **Build command**: `npm run build`
5. **Publish directory**: `dist`
6. Clique em **Deploy site**

> ⚠️ Mesmo ajuste: remova ou altere o `base` no `vite.config.ts` para `'/'`.

---

## Atualização periódica dos dados

Sempre que o Excel ou a lista de One Pagers for atualizada:

1. Baixe os arquivos novamente do SharePoint
2. Execute o script de conversão (Parte 4.3)
3. Faça `git push`

O site reflete os novos dados em ~1 minuto.

---

## Estrutura do projeto (resumo)

```
sap-onepager-app/
├── public/
│   └── data.json              ← dados carregados pelo app (gerado pelo script)
├── scripts/
│   ├── convert-excel.mjs      ← converte Excel → data.json
│   └── extract-sharepoint-files.js  ← script para rodar no console do browser
├── src/
│   ├── components/            ← interface React
│   ├── services/dataService.ts ← lê o data.json
│   ├── hooks/useOnePagerData.ts ← filtros reativos
│   └── types/index.ts
├── vite.config.ts             ← ajuste o `base` para o nome do seu repo
└── package.json
```
