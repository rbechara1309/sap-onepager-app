import { Configuration, PopupRequest } from '@azure/msal-browser'

// ⚠️  CONFIGURE BEFORE DEPLOY:
// 1. Register an App in Azure AD (portal.azure.com)
// 2. Set Redirect URI to: https://<your-org>.github.io/sap-onepager-app/
// 3. Add Microsoft Graph delegated permission: Files.Read.All (or Sites.Read.All)
// 4. Replace CLIENT_ID and TENANT_ID below (or set via env vars)

export const MSAL_CONFIG: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || 'YOUR_CLIENT_ID_HERE',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID || 'YOUR_TENANT_ID_HERE'}`,
    redirectUri: import.meta.env.VITE_REDIRECT_URI || window.location.origin + '/sap-onepager-app/',
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
}

export const LOGIN_REQUEST: PopupRequest = {
  scopes: ['User.Read', 'Files.Read.All', 'Sites.Read.All'],
}

// SharePoint / Excel file identifiers
// Drive item ID extracted from the SharePoint URL
export const SHAREPOINT_CONFIG = {
  // Site hostname (without https://)
  siteHostname: 'sap.sharepoint.com',
  // Site relative path (e.g., /teams/PartnerHubBCN)
  sitePath: '/teams/PartnerHubBCN',
  // Drive name (usually "Documents" or "Shared Documents")
  driveId: import.meta.env.VITE_DRIVE_ID || '',
  // File item ID from SharePoint URL (the `d=` parameter)
  fileItemId: 'e0bae406c08c4d72a1e7e1b2f6332c62',
  // Worksheet name inside the Excel file (set to empty to use the first sheet)
  worksheetName: import.meta.env.VITE_WORKSHEET_NAME || '',
}
