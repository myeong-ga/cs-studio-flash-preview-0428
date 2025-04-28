// Define types for function calling and other response types
export type FunctionCall = {
    name: string
    arguments: string
  }
  
  export type ResponseChunk = {
    text?: string
    functionCall?: FunctionCall
    error?: string
  }
  
  export type ChatMessage = {
    id: string
    role: "user" | "assistant" | "system"
    content: string
    functionCall?: FunctionCall
  }
  
  /** State for the lifecycle of a File. */
  export enum FileState {
    STATE_UNSPECIFIED = "STATE_UNSPECIFIED",
    PROCESSING = "PROCESSING",
    ACTIVE = "ACTIVE",
    FAILED = "FAILED",
  }
  
  // Original Message type from the CS simulation project
  export interface Message {
    role: "user" | "assistant" | "system"
    content: string
  }
  
  export interface ContentItem {
    text: string
  }
  
  // Suggested message interface
  export interface SuggestedMessage {
    type: "message"
    role: "agent" // Suggested messages are always agent role
    id: string
    content: ContentItem[]
    status?: "pending" | "approved" | "rejected"
  }
  
  export interface Action {
    name: string
    parameters: any
  }
  
  export const CUSTOMER_DETAILS = {
    name: "김고객",
    id: "cus_28X44",
    orderNb: 7,
    signupDate: "2022-05-15",
  }
  
  export const USER_INFO = {
    name: "김고객",
    email: "customer@example.com",
    phone: "010-1234-5678",
    address: "123 Main St, Anytown, USA",
    order_history: ["ORD1001", "ORD1002", "ORD1003", "ORD1004", "ORD1005", "ORD1006", "ORD1007"],
  }
  
  export const DEFAULT_ACTION: Action = {
    name: "create_ticket",
    parameters: {
      user_id: CUSTOMER_DETAILS.id,
      type: "other",
      details: "Need more help with the request",
    },
  }
  
  function getDate(daysAgo: number): string {
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    return date.toISOString().split("T")[0]
  }
  
  export const DEMO_ORDERS = [
    {
      id: "ORD1001",
      date: getDate(1),
      status: "pending",
      items: [{ product_id: "P003", name: "Smart Watch", quantity: 1, price: 149.99 }],
    },
    {
      id: "ORD1002",
      date: getDate(8),
      status: "completed",
      items: [
        {
          product_id: "P001",
          name: "Wireless Headphones",
          quantity: 1,
          price: 99.99,
        },
        {
          product_id: "P002",
          name: "Portable Charger",
          quantity: 1,
          price: 39.99,
        },
      ],
    },
    {
      id: "ORD1003",
      date: getDate(24),
      status: "shipped",
      tracking_number: "TRK123456789",
      items: [
        {
          product_id: "P004",
          name: "Bluetooth Speaker",
          quantity: 2,
          price: 59.99,
        },
      ],
    },
    {
      id: "ORD1004",
      date: getDate(28),
      status: "cancelled",
      cancellation_reason: "Customer requested cancellation before processing",
    },
    {
      id: "ORD1005",
      date: getDate(44),
      status: "refunded",
      refund_status: "processing",
      refund_amount: 149.99,
      items: [{ product_id: "P005", name: "Laptop Stand", quantity: 1, price: 149.99 }],
    },
    {
      id: "ORD1006",
      date: getDate(96),
      status: "delivered",
      return_initiated: true,
      items: [
        {
          product_id: "P006",
          name: "Ergonomic Keyboard",
          quantity: 1,
          price: 89.99,
        },
      ],
    },
    {
      id: "ORD1007",
      date: getDate(108),
      status: "completed",
      complaint: "Order delivered with damaged product",
      items: [
        {
          product_id: "P007",
          name: "Noise Cancelling Earbuds",
          quantity: 1,
          price: 129.99,
        },
      ],
    },
  ]
  