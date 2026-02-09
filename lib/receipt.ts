// Receipt generation for paid clients

export interface ReceiptClient {
  clientId: number
  firstName: string
  lastName: string
  email?: string
  phone: string
  address?: string
  membershipName?: string
  joiningDate?: string
  expiryDate?: string
  membershipFee?: number
  discount?: number
  paidAmount?: number
  paymentDate?: string
  paymentMode?: string
  transactionId?: string
}

export function generateReceiptHTML(client: ReceiptClient, logoUrl?: string): string {
  const membershipFee = client.membershipFee ?? 0
  const discount = client.discount ?? 0
  const finalAmount = Math.max(0, membershipFee - discount)
  const paidAmount = client.paidAmount ?? 0

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Payment Receipt - ${client.firstName} ${client.lastName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1f2937; max-width: 480px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #4f46e5; }
    .header h1 { font-size: 28px; color: #4f46e5; margin-bottom: 4px; }
    .receipt-logo { height: 150px; max-width: 100%; object-fit: contain; margin-bottom: 8px; display: block; margin-left: auto; margin-right: auto; }
    .header p { font-size: 12px; color: #6b7280; }
    .receipt-title { font-size: 20px; font-weight: 700; text-align: center; margin-bottom: 24px; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin-bottom: 12px; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
    .row:last-child { border-bottom: none; }
    .row .label { color: #6b7280; }
    .row .value { font-weight: 500; }
    .amount-row { font-size: 16px; font-weight: 600; padding: 12px 0; }
    .total-row { background: #eef2ff; margin: 16px -16px; padding: 16px; font-size: 18px; font-weight: 700; color: #4f46e5; }
    .footer { text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="header">
    ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="receipt-logo" />` : '<h1>Fitura</h1>'}
    <p>Payment Receipt</p>
  </div>
  
  <div class="receipt-title">PAYMENT RECEIPT</div>
  
  <div class="section">
    <div class="section-title">Client Details</div>
    <div class="row"><span class="label">Receipt No.</span><span class="value">#${client.clientId}</span></div>
    <div class="row"><span class="label">Name</span><span class="value">${client.firstName} ${client.lastName}</span></div>
    <div class="row"><span class="label">Phone</span><span class="value">${client.phone}</span></div>
    ${client.email ? `<div class="row"><span class="label">Email</span><span class="value">${client.email}</span></div>` : ''}
    ${client.address ? `<div class="row"><span class="label">Address</span><span class="value">${client.address}</span></div>` : ''}
  </div>
  
  <div class="section">
    <div class="section-title">Membership</div>
    <div class="row"><span class="label">Plan</span><span class="value">${client.membershipName || 'N/A'}</span></div>
    <div class="row"><span class="label">Joining Date</span><span class="value">${formatDate(client.joiningDate)}</span></div>
    <div class="row"><span class="label">Valid Until</span><span class="value">${formatDate(client.expiryDate)}</span></div>
  </div>
  
  <div class="section">
    <div class="section-title">Payment Details</div>
    <div class="row"><span class="label">Membership Fee</span><span class="value">${formatCurrency(membershipFee)}</span></div>
    ${discount > 0 ? `<div class="row"><span class="label">Discount</span><span class="value">- ${formatCurrency(discount)}</span></div>` : ''}
    <div class="row amount-row"><span class="label">Amount Payable</span><span class="value">${formatCurrency(finalAmount)}</span></div>
    <div class="row total-row"><span class="label">Amount Paid</span><span class="value">${formatCurrency(paidAmount)}</span></div>
    <div class="row"><span class="label">Payment Date</span><span class="value">${formatDate(client.paymentDate)}</span></div>
    ${client.paymentMode ? `<div class="row"><span class="label">Payment Mode</span><span class="value">${client.paymentMode}</span></div>` : ''}
    ${client.transactionId ? `<div class="row"><span class="label">Transaction ID</span><span class="value">${client.transactionId}</span></div>` : ''}
  </div>
  
  <div class="footer">
    <p>Thank you for your payment!</p>
    <p style="margin-top: 8px;">Generated on ${formatDate(new Date().toISOString().split('T')[0])}</p>
  </div>
  
  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>
`
}

export function openReceiptPrint(client: ReceiptClient): void {
  const logoUrl = typeof window !== 'undefined' ? `${window.location.origin}/images/rival-fitness-logo.jpeg` : undefined
  const html = generateReceiptHTML(client, logoUrl)
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
  }
}
