const SHEET_NAME = "Expense Tracker"
const DISCOVERY_DOC = "https://sheets.googleapis.com/$discovery/rest?version=v4"
const SCOPES = "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly"

const HEADERS = ["Date", "Vendor", "Line Item", "Item Amount", "Total", "Currency", "Category", "Notes", "Confidence", "Logged At"]

let tokenClient = null
let accessToken = null

export function loadGoogleAPI() {
  return new Promise((resolve) => {
    if (window.gapi) return resolve()
    const script = document.createElement("script")
    script.src = "https://apis.google.com/js/api.js"
    script.onload = () => {
      window.gapi.load("client", async () => {
        await window.gapi.client.init({ discoveryDocs: [DISCOVERY_DOC] })
        resolve()
      })
    }
    document.head.appendChild(script)
  })
}

export function loadGoogleIdentity() {
  return new Promise((resolve) => {
    if (window.google?.accounts) return resolve()
    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.onload = resolve
    document.head.appendChild(script)
  })
}

export function authenticate(clientId) {
  return new Promise((resolve, reject) => {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: (response) => {
        if (response.error) return reject(response)
        accessToken = response.access_token
        window.gapi.client.setToken({ access_token: accessToken })
        resolve(accessToken)
      },
    })
    tokenClient.requestAccessToken()
  })
}

async function findOrCreateSheet() {
  const searchResp = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='${SHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  const searchData = await searchResp.json()

  if (searchData.files?.length > 0) {
    return searchData.files[0].id
  }

  // Create new sheet with headers
  const createResp = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: { title: SHEET_NAME },
      sheets: [{
        properties: { title: "Expenses" },
        data: [{
          startRow: 0,
          startColumn: 0,
          rowData: [{
            values: HEADERS.map(h => ({ userEnteredValue: { stringValue: h } }))
          }]
        }]
      }]
    }),
  })
  const created = await createResp.json()
  return created.spreadsheetId
}

export async function appendExpenseRow(data) {
  const spreadsheetId = await findOrCreateSheet()
  const loggedAt = new Date().toISOString()

  // Build one row per line item, or a single row if no line items
  let rows = []
  if (data.line_items?.length > 0) {
    rows = data.line_items.map(item => [
      data.date,
      data.vendor,
      item.name,
      item.amount,
      data.amount,       // total on every row so you can still filter by receipt
      data.currency,
      data.category,
      data.notes || "",
      data.confidence,
      loggedAt,
    ])
  } else {
    rows = [[
      data.date,
      data.vendor,
      "",               // no line item
      "",               // no item amount
      data.amount,
      data.currency,
      data.category,
      data.notes || "",
      data.confidence,
      loggedAt,
    ]]
  }

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Expenses!A:J:append?valueInputOption=USER_ENTERED`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: rows }),
    }
  )

  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}`
}