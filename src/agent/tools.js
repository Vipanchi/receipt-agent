export const TOOLS = [
  {
    type: "function",
    function: {
      name: "extract_receipt_data",
      description:
        "Extract structured expense data from a receipt or invoice image. Call this once you have analyzed the document.",
      parameters: {
        type: "object",
        properties: {
          vendor: {
            type: "string",
            description: "Business or merchant name",
          },
          date: {
            type: "string",
            description: "Transaction date in YYYY-MM-DD format",
          },
          amount: {
            type: "number",
            description: "Total amount as a number (no currency symbol)",
          },
          currency: {
            type: "string",
            description: "ISO 4217 currency code e.g. USD, EUR, GBP",
          },
          category: {
            type: "string",
            enum: [
              "Food & dining",
              "Travel & transport",
              "Office & supplies",
              "Utilities & subscriptions",
              "Accommodation",
              "Entertainment",
              "Medical",
              "Other",
            ],
          },
          line_items: {
            type: "array",
            description: "Individual items if visible on the receipt",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                amount: { type: "number" },
              },
              required: ["name", "amount"],
            },
          },
          notes: {
            type: "string",
            description: "Any relevant notes or what was unclear",
          },
          confidence: {
            type: "number",
            description: "Confidence score 0-1 for the overall extraction quality",
          },
        },
        required: ["vendor", "date", "amount", "currency", "category", "confidence"],
      },
    },
  },
]