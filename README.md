# Receipt Agent

AI-powered receipt and invoice parser. Drop an image → GPT-4o extracts vendor, amount, date, and line items via an agentic tool-use loop → auto-appends to Google Sheets.

## Demo

[Add your screen recording GIF or screenshot here]

## What it does

- Upload a receipt or invoice image (JPG, PNG, WebP)
- GPT-4o vision analyzes the document and calls a structured extraction tool
- Extracted fields (vendor, date, total, currency, category, line items) appear in an editable review form
- One click saves to Google Sheets — one row per line item for easy analysis

## Tech stack

- **React + Vite** — frontend
- **GPT-4o** — vision + agentic tool-use loop
- **OpenAI function calling** — structured data extraction
- **Google Sheets API v4** — append rows, apply cell formatting
- **Google OAuth 2.0** — browser-based authentication

## How the agentic loop works

This app uses a multi-step agentic pattern rather than a single API call:

1. Send the image to GPT-4o with a tool schema defined
2. The model calls `extract_receipt_data` with structured JSON
3. The app executes the tool and sends the result back
4. The loop continues until the model stops calling tools

This pattern scales to more complex workflows — validation tools, retry logic, multi-document processing.

## Getting started

### Prerequisites
- Node 18+
- OpenAI API key
- Google Cloud project with Sheets API enabled and OAuth 2.0 credentials

### Setup

```bash
git clone https://github.com/YOUR_USERNAME/receipt-agent.git
cd receipt-agent
npm install
```

Create a `.env` file:
VITE_OPENAI_API_KEY=your_openai_key_here
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

Add `http://localhost:5173` to your Google OAuth authorized origins.

```bash
npm run dev
```

## Project structure

src/
agent/
index.js        ← agentic loop
tools.js        ← tool schema for GPT-4o function calling
prompts.js      ← system prompt
components/
DropZone.jsx
ReviewForm.jsx
StatusTimeline.jsx  ← live agent step viewer
hooks/
useAgent.js     ← state machine for the workflow
sheets/
index.js        ← Google OAuth + Sheets API integration

