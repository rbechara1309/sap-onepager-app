// Script para rodar no console do navegador (F12) na página da pasta do SharePoint
// Acesse a pasta: https://sap.sharepoint.com/:f:/r/teams/PartnerHubBCN/Shared%20Documents/Region%20LAC%20Latin%20America%20and%20Caribbean%20(Pablo)/2026/One%20Pager
// Abra o DevTools (F12) > Console > cole este script e pressione Enter

(async () => {
  // Usa a API REST do SharePoint com a sessão já autenticada do navegador
  const siteUrl = 'https://sap.sharepoint.com/teams/PartnerHubBCN'
  const folderPath = '/teams/PartnerHubBCN/Shared Documents/Region LAC Latin America and Caribbean (Pablo)/2026/One Pager'
  const encodedPath = encodeURIComponent(folderPath)

  const url = `${siteUrl}/_api/web/GetFolderByServerRelativeUrl('${folderPath}')/Files?$select=Name,ServerRelativeUrl,TimeLastModified&$top=5000`

  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json;odata=verbose' }
    })
    const data = await res.json()
    const files = data.d.results.map(f => ({
      name: f.Name,
      url: 'https://sap.sharepoint.com' + f.ServerRelativeUrl,
      modified: f.TimeLastModified
    }))

    // Exibe o JSON no console para copiar
    console.log('=== COPIE O JSON ABAIXO ===')
    console.log(JSON.stringify(files, null, 2))
    console.log(`=== TOTAL: ${files.length} arquivos ===`)

    // Também cria um download automático
    const blob = new Blob([JSON.stringify(files, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'onepapers-files.json'
    a.click()
    console.log('Download iniciado: onepapers-files.json')
  } catch(e) {
    console.error('Erro:', e)
  }
})()
