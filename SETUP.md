# SAP One Pager Hub — Guia Completo de Deploy do Zero

Este guia cobre tudo que uma nova pessoa precisa para ter a aplicação rodando com atualização automática, do zero.

**Tempo estimado:** ~45 minutos  
**Resultado final:** Site público atualizado automaticamente todo dia às 07h, sem intervenção manual.

---

## O que você vai precisar

| Ferramenta | Onde obter | Custo |
|---|---|---|
| Conta GitHub | github.com | Gratuito |
| Git | git-scm.com/download/win | Gratuito |
| Node.js LTS | nodejs.org | Gratuito |
| Acesso ao SharePoint SAP | Sua conta corporativa | — |
| Acesso ao Power Automate | make.powerautomate.com (conta SAP) | — |

---

## Parte 1 — Preparar o ambiente local

### 1.1 Instalar Git e Node.js

Abra o **PowerShell** e execute:

```powershell
winget install --id Git.Git -e --accept-package-agreements --accept-source-agreements
winget install --id OpenJS.NodeJS.LTS -e --accept-package-agreements --accept-source-agreements
```

Feche e reabra o PowerShell. Confirme a instalação:

```powershell
git --version   # deve mostrar: git version 2.x.x
node --version  # deve mostrar: v22.x.x
```

### 1.2 Configurar o Git com seus dados

```powershell
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@sap.com"
```

---

## Parte 2 — Criar o repositório no GitHub

### 2.1 Criar conta GitHub (se ainda não tiver)

Acesse **github.com** → **Sign up** → use seu e-mail corporativo ou pessoal.

### 2.2 Fazer fork do repositório original

1. Acesse: **https://github.com/rbechara1309/sap-onepager-app**
2. Clique em **Fork** (canto superior direito)
3. Em **Repository name**, mantenha `sap-onepager-app` ou escolha outro nome
4. Clique em **Create fork**

### 2.3 Clonar o repositório na sua máquina

```powershell
cd C:\Users\SEU_USUARIO
git clone https://github.com/SEU_USUARIO/sap-onepager-app.git
cd sap-onepager-app
```

### 2.4 Instalar dependências

```powershell
npm install
```

---

## Parte 3 — Ajustar configurações para o seu repositório

### 3.1 Atualizar o nome do repositório na configuração

Edite o arquivo `vite.config.ts` e confirme que o `VITE_BASE` bate com o nome do seu repositório.

Se você manteve o nome `sap-onepager-app`, **não precisa mudar nada**.

Se usou outro nome (ex: `meu-app`), edite `.github/workflows/deploy.yml`:

```yaml
- name: Build
  env:
    VITE_BASE: /meu-app/   # ← coloque o nome do seu repositório aqui
```

### 3.2 Confirmar e enviar

```powershell
git add .
git commit -m "config: ajustar para meu repositorio"
git push -u origin main
```

---

## Parte 4 — Ativar o GitHub Pages

1. No seu repositório no GitHub, clique em **Settings**
2. No menu lateral, clique em **Pages**
3. Em **Source**, selecione **GitHub Actions**
4. Clique em **Save**

Aguarde ~2 minutos. O site ficará disponível em:
```
https://SEU_USUARIO.github.io/sap-onepager-app/
```

Você pode acompanhar o progresso em: **Actions** (aba do repositório)

---

## Parte 5 — Carga inicial dos dados

Antes de configurar a automação, faça a carga inicial manualmente para o site já ter dados.

### 5.1 Baixar o Excel do SharePoint

Acesse o link abaixo com sua conta SAP e faça o download do arquivo:
```
https://sap.sharepoint.com/teams/PartnerHubBCN/Shared Documents/
Region LAC Latin America and Caribbean (Pablo)/2026/One Pager/
01. SPM & PCSM - 062026 - Global.xlsx
```

Salve em `C:\Users\SEU_USUARIO\Downloads\`

### 5.2 Exportar a lista de arquivos One Pager

1. Abra a pasta One Pager no SharePoint no navegador (já logado com conta SAP)
2. Pressione **F12** → aba **Console**
3. Cole o script abaixo e pressione **Enter**:

```javascript
(async () => {
  const siteUrl = 'https://sap.sharepoint.com/teams/PartnerHubBCN'
  const folderPath = '/teams/PartnerHubBCN/Shared Documents/Region LAC Latin America and Caribbean (Pablo)/2026/One Pager'
  const headers = { Accept: 'application/json;odata=verbose' }
  let url = `${siteUrl}/_api/web/GetFolderByServerRelativeUrl(@p)/Files?@p='${encodeURIComponent(folderPath)}'&$select=Name,ServerRelativeUrl&$top=5000`
  let all = []
  while (url) {
    const res = await fetch(url, { headers })
    const data = await res.json()
    all = all.concat(data.d.results || [])
    url = data.d.__next || null
  }
  const files = all.map(f => ({ name: f.Name, url: 'https://sap.sharepoint.com' + f.ServerRelativeUrl }))
  const blob = new Blob([JSON.stringify(files, null, 2)], { type: 'application/json' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'onepapers-files.json'; a.click()
  console.log(`✓ ${files.length} arquivos exportados`)
})()
```

Salve o arquivo `onepapers-files.json` em `C:\Users\SEU_USUARIO\Downloads\`

### 5.3 Converter e publicar os dados

```powershell
cd C:\Users\SEU_USUARIO\sap-onepager-app

# Converte o Excel → public/records.json
npm run convert:records -- "C:\Users\SEU_USUARIO\Downloads\01. SPM & PCSM - 062026 - Global.xlsx"

# Converte a lista de PDFs → public/files.json
npm run convert:files -- "C:\Users\SEU_USUARIO\Downloads\onepapers-files.json"

# Publica no GitHub
git add public/records.json public/files.json
git commit -m "chore: carga inicial de dados"
git push
```

O site ficará com dados reais em ~2 minutos.

---

## Parte 6 — Gerar o GitHub Token para o Power Automate

O Power Automate precisa de um token para atualizar os arquivos no GitHub automaticamente.

1. No GitHub, clique na **sua foto** (canto superior direito) → **Settings**
2. No menu lateral, role até o final → **Developer settings**
3. Clique em **Personal access tokens → Tokens (classic)**
4. Clique em **Generate new token (classic)**
5. Preencha:
   - **Note:** `power-automate-sap-onepager`
   - **Expiration:** `No expiration`
   - **Scopes:** marque apenas ☑ **`repo`**
6. Clique em **Generate token**
7. **Copie o token agora** — ele não será exibido novamente

> Guarde o token em local seguro. Você vai usá-lo nos passos seguintes.

---

## Parte 7 — Configurar o Power Automate

Acesse **make.powerautomate.com** com sua conta SAP.

Você vai criar **dois fluxos**: um para o Excel, outro para os PDFs.

---

### Fluxo 1 — Atualizar records.json (dados do Excel)

#### Criar o fluxo

1. Clique em **Criar → Fluxo de nuvem agendado**
2. Preencha:
   - **Nome:** `SAP OnePager - Records`
   - **Frequência:** 1 dia
   - **Horário:** 07:00
3. Clique em **Criar**

#### Ação 1 — Ler o Excel

1. Clique em **+ Nova etapa**
2. Busque por **Excel Online (Business)** → selecione **Listar linhas presentes em uma tabela**
3. Configure:
   - **Local:** SharePoint
   - **Biblioteca de documentos:** Shared Documents
   - **Arquivo:** navegue até `Region LAC.../2026/One Pager/01. SPM & PCSM - 062026 - Global.xlsx`
   - **Tabela:** selecione a tabela que aparecer na lista

> Se não aparecer nenhuma tabela: abra o Excel no SharePoint → selecione todos os dados → **Inserir → Tabela → OK**. Depois volte ao Power Automate.

#### Ação 2 — Montar o JSON

1. **+ Nova etapa** → busque **Data Operations** → selecione **Compor**
2. No campo **Entradas**, clique em **Expressão** e cole:

```
json(concat('{"lastUpdated":"',formatDateTime(utcNow(),'yyyy-MM-dd'),'","source":"01. SPM & PCSM - 062026 - Global.xlsx","records":',string(body('Listar_linhas_presentes_em_uma_tabela')?['value']),'}'))
```

> Se preferir usar modo visual: cole como texto simples no campo **Entradas** com o conteúdo:
```
{
  "lastUpdated": "@{formatDateTime(utcNow(), 'yyyy-MM-dd')}",
  "source": "01. SPM & PCSM - 062026 - Global.xlsx",
  "records": @{body('Listar_linhas_presentes_em_uma_tabela')?['value']}
}
```

#### Ação 3 — Buscar SHA atual do records.json no GitHub

1. **+ Nova etapa** → busque **HTTP** → selecione **HTTP**
2. Configure:
   - **Método:** GET
   - **URI:** `https://api.github.com/repos/SEU_USUARIO/sap-onepager-app/contents/public/records.json`
   - **Cabeçalhos** (adicione 3):
     - `Authorization` → `Bearer SEU_TOKEN_AQUI`
     - `Accept` → `application/vnd.github.v3+json`
     - `User-Agent` → `PowerAutomate`

#### Ação 4 — Publicar records.json no GitHub

1. **+ Nova etapa** → **HTTP** novamente
2. Configure:
   - **Método:** PUT
   - **URI:** `https://api.github.com/repos/SEU_USUARIO/sap-onepager-app/contents/public/records.json`
   - **Cabeçalhos** (adicione 4):
     - `Authorization` → `Bearer SEU_TOKEN_AQUI`
     - `Accept` → `application/vnd.github.v3+json`
     - `User-Agent` → `PowerAutomate`
     - `Content-Type` → `application/json`
   - **Corpo:**
```json
{
  "message": "chore: update records.json @{formatDateTime(utcNow(), 'yyyy-MM-dd')}",
  "content": "@{base64(string(outputs('Compor')))}",
  "sha": "@{body('HTTP')?['sha']}",
  "branch": "main"
}
```

#### Salvar e testar

1. Clique em **Salvar**
2. Clique em **Testar → Manualmente → Testar**
3. Aguarde a execução. Todos os passos devem ficar verdes ✅

---

### Fluxo 2 — Atualizar files.json (lista de PDFs)

#### Criar o fluxo

1. **Criar → Fluxo de nuvem agendado**
2. Preencha:
   - **Nome:** `SAP OnePager - Files`
   - **Frequência:** 1 dia
   - **Horário:** 07:05 (5 minutos depois do primeiro)
3. Clique em **Criar**

#### Ação 1 — Listar arquivos da pasta

1. **+ Nova etapa** → busque **SharePoint** → selecione **Obter arquivos (somente propriedades)**
2. Configure:
   - **Endereço do Site:** `https://sap.sharepoint.com/teams/PartnerHubBCN`
   - **Nome da Biblioteca:** `Shared Documents`
   - **Pasta:** clique na pasta e navegue até `Region LAC Latin America and Caribbean (Pablo)/2026/One Pager`

#### Ação 2 — Selecionar apenas os campos necessários

1. **+ Nova etapa** → **Data Operations → Selecionar**
2. Configure:
   - **De:** `value` (selecione da ação anterior)
   - **Mapear** (adicione dois campos):
     - Chave: `name` → Valor: `Name` (campo dinâmico da ação anterior)
     - Chave: `url`  → Valor: `{Link para o Item}` (campo dinâmico)

#### Ação 3 — Montar o JSON

1. **+ Nova etapa** → **Data Operations → Compor**
2. No campo **Entradas**, cole:
```
{
  "lastUpdated": "@{formatDateTime(utcNow(), 'yyyy-MM-dd')}",
  "files": @{body('Selecionar')}
}
```

#### Ações 4 e 5 — Buscar SHA e publicar no GitHub

Repita exatamente as **Ações 3 e 4 do Fluxo 1**, trocando:
- `records.json` → `files.json` nas URIs
- A mensagem do commit pode ser: `"chore: update files.json ..."`

#### Salvar e testar

1. **Salvar → Testar → Manualmente → Testar**
2. Aguarde todos os passos ficarem verdes ✅

---

## Parte 8 — Verificar o resultado

Após os dois fluxos executarem com sucesso:

1. Acesse seu repositório no GitHub → aba **Actions**
2. Deve aparecer um novo run "Deploy to GitHub Pages" disparado automaticamente
3. Aguarde ~2 minutos
4. Acesse `https://SEU_USUARIO.github.io/sap-onepager-app/`
5. O site deve exibir os dados atualizados

---

## Parte 9 — Daqui em diante (manutenção zero)

A partir de agora o ciclo é completamente automático:

```
Todo dia às 07:00
  → Power Automate lê o Excel do SharePoint
  → Atualiza public/records.json no GitHub

Todo dia às 07:05
  → Power Automate lista os PDFs da pasta
  → Atualiza public/files.json no GitHub

GitHub Actions detecta o push
  → Rebuilda o site (~1 min)
  → Publica nova versão

Usuário acessa o site
  → Vê dados sempre atualizados
```

**Nenhuma ação manual necessária.**

---

## Solução de problemas comuns

| Problema | Causa | Solução |
|---|---|---|
| Build falha no GitHub Actions | `package-lock.json` ausente | Rode `npm install` e faça push do `package-lock.json` |
| Fluxo Power Automate falha com 401 | Token GitHub inválido ou expirado | Gere novo token e atualize nos dois fluxos |
| Fluxo falha com "tabela não encontrada" | Excel sem formatação de tabela | Abra o Excel → selecione dados → Inserir → Tabela |
| Site mostra dados antigos | Build ainda em andamento | Aguarde 2 min e recarregue |
| Fluxo falha com "SHA não encontrado" | Arquivo ainda não existe no repo | Faça a carga inicial (Parte 5) antes de testar o fluxo |
| `git` não reconhecido no PowerShell | PATH não atualizado | Feche e reabra o PowerShell após instalar o Git |

---

## Estrutura final do projeto

```
sap-onepager-app/
├── .github/
│   └── workflows/
│       └── deploy.yml          ← CI/CD automático ao push
├── public/
│   ├── records.json            ← Atualizado pelo Power Automate (Fluxo 1)
│   └── files.json              ← Atualizado pelo Power Automate (Fluxo 2)
├── scripts/
│   ├── convert-records.mjs     ← Conversão manual: Excel → records.json
│   ├── convert-files.mjs       ← Conversão manual: lista PDFs → files.json
│   └── extract-sharepoint-files.js  ← Script para rodar no console do browser
├── src/
│   ├── components/             ← Interface React
│   ├── services/dataService.ts ← Lê e cruza os dois JSONs
│   ├── hooks/useOnePagerData.ts ← Filtros reativos
│   └── types/index.ts
├── vite.config.ts              ← Base URL via VITE_BASE
└── package.json
```

---

## Atualização manual (quando necessário)

Se precisar forçar uma atualização fora do horário agendado:

```powershell
cd C:\Users\SEU_USUARIO\sap-onepager-app

# Baixe o Excel e o onepapers-files.json do SharePoint (ver Parte 5)

npm run convert:records -- "C:\Users\SEU_USUARIO\Downloads\NOME_DO_ARQUIVO.xlsx"
npm run convert:files   -- "C:\Users\SEU_USUARIO\Downloads\onepapers-files.json"

git add public/records.json public/files.json
git commit -m "chore: atualizar dados manualmente"
git push
```

Ou simplesmente dispare o fluxo manualmente no Power Automate clicando em **Executar agora**.

---

*Repositório original: https://github.com/rbechara1309/sap-onepager-app*
