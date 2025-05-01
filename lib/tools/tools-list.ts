// List of tools available to the agent
// No need to include the top-level wrapper object as it is added in lib/tools/tools.ts
// More information on function calling: https://platform.openai.com/docs/guides/function-calling

export const toolsList = [
  {
    name: "get_order",
    parameters: {
      order_id: {
        type: "string",
        description: "Order ID to get details for",
      },
    },
  },
  {
    name: "get_order_history",
    parameters: {
      user_id: {
        type: "string",
        description: "User ID to get order history for",
      },
    },
  },
  {
    name: "cancel_order",
    parameters: {
      order_id: {
        type: "string",
        description: "Order ID to cancel",
      },
    },
  },
  {
    name: "reset_password",
    parameters: {
      user_id: {
        type: "string",
        description: "User ID to send password reset email to",
      },
    },
  },
  {
    name: "send_replacement",
    parameters: {
      product_id: {
        type: "string",
        description: "Product ID to send replacement for",
      },
      order_id: {
        type: "string",
        description: "Order ID to send replacement for",
      },
    },
  },
  {
    name: "create_refund",
    parameters: {
      order_id: {
        type: "string",
        description: "Order ID to create refund for",
      },
      amount: {
        type: "number",
        description: "Amount to refund",
      },
      reason: {
        type: "string",
        description: "Reason for refund",
      },
    },
  },
  {
    name: "issue_voucher",
    parameters: {
      user_id: {
        type: "string",
        description: "User ID to issue voucher for",
      },
      amount: {
        type: "number",
        description: "Amount to issue voucher for",
      },
      reason: {
        type: "string",
        description: "Reason for issuing voucher",
      },
    },
  },
  {
    name: "create_return",
    parameters: {
      order_id: {
        type: "string",
        description: "Order ID to create return for",
      },
      product_ids: {
        type: "array",
        description: "Product IDs to create return for",
        items: {
          type: "string",
        },
      },
    },
  },
  {
    name: "create_complaint",
    parameters: {
      user_id: {
        type: "string",
        description: "User ID to create complaint for",
      },
      type: {
        type: "string",
        description: "Type of complaint",
        enum: ["product_quality", "order_delay", "delivery_issues", "other"],
      },
      details: {
        type: "string",
        description: "Details of the complaint",
      },
      order_id: {
        type: "string",
        description: "Order ID linked to the complaint, N/A if not linked to an order",
      },
    },
  },
  {
    name: "create_ticket",
    parameters: {
      user_id: {
        type: "string",
        description: "User ID to create ticket for",
      },
      type: {
        type: "string",
        description: "Type of ticket",
        enum: ["bug_reported", "damaged_product", "other"],
      },
      details: {
        type: "string",
        description: "Details of the ticket",
      },
      order_id: {
        type: "string",
        description: "Order ID linked to the ticket, N/A if not linked to an order",
      },
    },
  },
  {
    name: "update_info",
    parameters: {
      user_id: {
        type: "string",
        description: "User ID to update information for",
      },
      info: {
        type: "object",
        description: "Information to update",
        properties: {
          field: {
            type: "string",
            description: "Field to update",
            enum: ["email", "phone", "address", "name"],
          },
          value: {
            type: "string",
            description: "Value to update",
          },
        },
        additionalProperties: false,
        required: ["field", "value"],
      },
    },
  },
]

// Tools that will need to be confirmed by the human representative before execution
export const agentTools = [
  "cancel_order",
  "reset_password",
  "send_replacement",
  "create_refund",
  "issue_voucher",
  "create_return",
  "create_complaint",
  "update_info",
]

export const get_order = async ({ order_id }: { order_id: string }) => {
  try {
    const res = await fetch(`/api/orders/${order_id}`).then((res) => res.json())
    return res
  } catch (error) {
    console.error(error)
    return { error: "Failed to get order" }
  }
}

export const get_order_history = async ({ user_id }: { user_id: string }) => {
  try {
    console.log(`Fetching order history for user: ${user_id}`)
    const res = await fetch(`/api/users/${user_id}/order_history`).then((res) => res.json())
    return res
  } catch (error) {
    console.error(error)
    return { error: "Failed to get order history" }
  }
}

export const cancel_order = async ({ order_id }: { order_id: string }) => {
  try {
    const res = await fetch(`/api/orders/${order_id}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json())
    return res
  } catch (error) {
    console.error(error)
    return { error: "Failed to cancel order" }
  }
}

export const reset_password = async ({ user_id }: { user_id: string }) => {
  try {
    const res = await fetch(`/api/users/${user_id}/reset_password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    }).then((res) => res.json())
    return res
  } catch (error) {
    console.error(error)
    return { error: "Failed to reset password" }
  }
}

export const send_replacement = async ({
  product_id,
  order_id,
}: {
  product_id: string
  order_id: string
}) => {
  try {
    const res = await fetch(`/api/orders/${order_id}/send_replacement`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product_id }),
    }).then((res) => res.json())
    return res
  } catch (error) {
    console.error(error)
    return { error: "Failed to send replacement" }
  }
}

export const create_refund = async ({
  order_id,
  amount,
  reason,
}: {
  order_id: string
  amount: number
  reason: string
}) => {
  try {
    const res = await fetch(`/api/orders/${order_id}/create_refund`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount, reason }),
    }).then((res) => res.json())
    return res
  } catch (error) {
    console.error(error)
    return { error: "Failed to create refund" }
  }
}

export const issue_voucher = async ({
  user_id,
  amount,
  reason,
}: {
  user_id: string
  reason: string
  amount: number
}) => {
  try {
    const res = await fetch(`/api/vouchers/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id, reason, amount }),
    }).then((res) => res.json())
    return res
  } catch (error) {
    console.error(error)
    return { error: "Failed to issue voucher" }
  }
}

export const create_return = async ({
  order_id,
  product_ids,
}: {
  order_id: string
  product_ids: string[]
}) => {
  try {
    const res = await fetch(`/api/orders/${order_id}/create_return`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product_ids }),
    }).then((res) => res.json())
    return res
  } catch (error) {
    console.error(error)
    return { error: "Failed to create return" }
  }
}

export const create_complaint = async ({
  user_id,
  type,
  details,
  order_id,
}: {
  user_id: string
  type: string
  details: string
  order_id: string
}) => {
  try {
    const res = await fetch(`/api/complaints/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id, type, details, order_id }),
    }).then((res) => res.json())
    return res
  } catch (error) {
    console.error(error)
    return { error: "Failed to create complaint" }
  }
}

export const create_ticket = async ({
  user_id,
  type,
  details,
  order_id,
}: {
  user_id: string
  type: string
  details: string
  order_id: string
}) => {
  try {
    const res = await fetch(`/api/tickets/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id, type, details, order_id }),
    }).then((res) => res.json())
    return res
  } catch (error) {
    console.error(error)
    return { error: "Failed to create ticket" }
  }
}

export const update_info = async ({
  user_id,
  info,
}: {
  user_id: string
  info: { field: string; value: string }
}) => {
  try {
    const res = await fetch(`/api/users/${user_id}/update_info`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ info }),
    }).then((res) => res.json())
    return res
  } catch (error) {
    console.error(error)
    return { error: "Failed to update info" }
  }
}

export const functionsMap: Record<string, Function> = {
  get_order,
  get_order_history,
  cancel_order,
  reset_password,
  send_replacement,
  create_refund,
  issue_voucher,
  create_return,
  create_complaint,
  create_ticket,
  update_info,
}
