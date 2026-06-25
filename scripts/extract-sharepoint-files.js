// Script para rodar no console do navegador (F12) na página da pasta do SharePoint
// Suporta paginação automática — funciona mesmo com mais de 5000 arquivos

(async () => {
  const siteUrl = 'https://sap.sharepoint.com/teams/PartnerHubBCN'
  const folderPath = '/teams/PartnerHubBCN/Shared Documents/Region LAC Latin America and Caribbean (Pablo)/2026/One Pager'

  const headers = {
    Accept: 'application/json;odata=verbose',
    'X-RequestDigest': document.getElementById('__REQUESTDIGEST')?.value || ''
  }

  let url = `${siteUrl}/_api/web/GetFolderByServerRelativeUrl(@p)/Files?@p='${encodeURIComponent(folderPath)}'&$select=Name,ServerRelativeUrl&$top=5000`
  let allFiles = []
  let page = 1

  // Paginação automática via __next
  while (url) {
    console.log(`Buscando página ${page}...`)
    const res = await fetch(url, { headers })

    if (!res.ok) {
      console.error(`Erro HTTP ${res.status}:`, await res.text())
      break
    }

    const data = await res.json()

    if (!data.d?.results) {
      console.error('Resposta inesperada:', JSON.stringify(data).substring(0, 300))
      break
    }

    allFiles = allFiles.concat(
      data.d.results.map(f => ({
        name: f.Name,
        url: 'https://sap.sharepoint.com' + f.ServerRelativeUrl
      }))
    )

    url = data.d.__next || null
    page++
  }

  console.log(`✓ Total: ${allFiles.length} arquivos em ${page - 1} página(s)`)

  const blob = new Blob([JSON.stringify(allFiles, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'onepapers-files.json'
  a.click()

  console.log('Download iniciado: onepapers-files.json')
})()
