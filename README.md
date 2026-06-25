# SAP One Pager Hub — LAC

Portal web para busca e filtro do inventário de One Pagers de parceiros SAP para a região da América Latina e Caribe.

**Stack:** React + TypeScript + Vite · Tailwind CSS · GitHub Pages
**Dados:** Excel no SharePoint → JSON estático via Power Automate → GitHub Pages

---

## Como funciona

```
Excel no SharePoint
       ↓  (Power Automate — automático ao detectar mudança)
  public/data.json no GitHub
       ↓  (GitHub Actions — build automático)
  GitHub Pages — app atualizado
```

Nenhum Azure AD, nenhum login necessário. O app é público e lê os dados do arquivo `data.json` gerado automaticamente.

---

## 1. Criar o repositório GitHub

1. Crie um repositório público: `sap-onepager-app`
2. Vá em **Settings → Pages → Source:** `GitHub Actions`
3. Vá em **Settings → Actions → General → Workflow permissions:** `Read and write permissions`

---

## 2. Gerar um GitHub Personal Access Token (PAT)

O Power Automate precisa de um token para atualizar `data.json` no repositório.

1. No GitHub: **Settings (seu perfil) → Developer settings → Personal access tokens → Tokens (classic)**
2. Clique em **Generate new token (classic)**
3. Nome: `power-automate-sap-onepager`
4. Expiration: `No expiration` (ou 1 ano)
5. Scope: marque apenas **`repo`** (acesso completo ao repositório)
6. Copie o token gerado — você usará no Power Automate

---

## 3. Publicar o código inicial

```bash
cd sap-onepager-app
git init
git add .
git commit -m "feat: SAP One Pager Hub"
git branch -M main
git remote add origin https://github.com/rbechara1309/sap-onepager-app.git
git push -u origin main
```

O GitHub Actions fará o build e publicará em `https://rbechara1309.github.io/sap-onepager-app/`

---

## 4. Configurar o Power Automate

> Acesse: [make.powerautomate.com](https://make.powerautomate.com) com sua conta SAP

### Passo a passo para criar o fluxo:

**Criar novo fluxo → Fluxo de nuvem automatizado**

#### Gatilho: "Quando um arquivo é modificado" (SharePoint)
- Site: `https://sap.sharepoint.com/teams/PartnerHubBCN`
- Biblioteca: `Shared Documents`
- Pasta: `Region LAC Latin America and Caribbean (Pablo)/2026/One Pager`

#### Ação 1: "Obter conteúdo do arquivo" (Excel Online - Business)
- Local: SharePoint
- Biblioteca de documentos: `Shared Documents`
- Arquivo: `Region LAC Latin America and Caribbean (Pablo)/2026/One Pager/01. SPM & PCSM - 062026 - Global.xlsx`

#### Ação 2: "Listar linhas presentes em uma tabela" (Excel Online - Business)
- Arquivo: o mesmo acima
- Tabela: nome da tabela no Excel (ex: `Table1` ou o nome que aparecer)

> ⚠️ O Excel precisa ter os dados formatados como **Tabela** (Inserir → Tabela). Se não tiver, selecione os dados e crie a tabela antes.

#### Ação 3: "Compor" (Data Operations)
Configurar a expressão de entrada como JSON:
```
{
  "lastUpdated": "@{formatDateTime(utcNow(), 'yyyy-MM-dd')}",
  "source": "01. SPM & PCSM - 062026 - Global.xlsx",
  "records": @{body('Listar_linhas_presentes_em_uma_tabela')?['value']}
}
```

#### Ação 4: "HTTP" — Buscar SHA atual do arquivo no GitHub
- Método: `GET`
- URI: `https://api.github.com/repos/SEU_ORG/sap-onepager-app/contents/public/data.json`
- Cabeçalhos:
  - `Authorization`: `Bearer SEU_GITHUB_TOKEN`
  - `Accept`: `application/vnd.github.v3+json`
  - `User-Agent`: `PowerAutomate`

#### Ação 5: "HTTP" — Publicar data.json no GitHub
- Método: `PUT`
- URI: `https://api.github.com/repos/SEU_ORG/sap-onepager-app/contents/public/data.json`
- Cabeçalhos: mesmos acima + `Content-Type: application/json`
- Corpo:
```json
{
  "message": "chore: update data.json",
  "content": "@{base64(string(outputs('Compor')))}",
  "sha": "@{body('HTTP')?['sha']}",
  "branch": "main"
}
```

**Salvar e testar** — o fluxo irá rodar e atualizar `data.json` no GitHub, que dispara o build automático.

---

## 5. Atualização manual dos dados (alternativa)

Se preferir atualizar manualmente sem o Power Automate:

```bash
# 1. Baixe o Excel do SharePoint para sua máquina
# 2. Execute o script de conversão:
npm run convert -- "caminho/para/01. SPM & PCSM - 062026 - Global.xlsx"

# 3. Faça commit e push:
git add public/data.json
git commit -m "chore: update data.json"
git push
```

---

## Estrutura do Excel — colunas reconhecidas

O script e o Power Automate detectam automaticamente as colunas pelo cabeçalho (em PT ou EN):

| Cabeçalho | Campo |
|---|---|
| Partner / Partner Name | Parceiro |
| Partner Type / Type | Tipo de Parceiro |
| Solution / Solution Area | Solução |
| Country | País |
| Language / Idioma | Idioma |
| Industry / Indústria | Indústria |
| Topic / Tópico | Tópico |
| File Name / Nome do Arquivo | Nome do arquivo |
| File URL / URL / Link | Link para o arquivo |
| Last Updated / Atualizado | Última atualização |
| Owner / Responsável | Responsável |
| Status | Status |

---

## Estrutura do projeto

```
sap-onepager-app/
├── .github/workflows/deploy.yml    ← CI/CD automático ao push na main
├── public/
│   └── data.json                   ← Dados (atualizado pelo Power Automate)
├── scripts/
│   ├── convert-excel.mjs           ← Conversão manual: Excel → data.json
│   └── power-automate-template.json
├── src/
│   ├── components/                 ← UI React
│   ├── services/dataService.ts     ← Lê public/data.json
│   ├── hooks/useOnePagerData.ts    ← Filtros reativos
│   └── types/index.ts
└── README.md
```
