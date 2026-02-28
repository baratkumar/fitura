import { generateReceiptHTML, ReceiptClient } from '../../lib/receipt';

const base: ReceiptClient = {
  clientId: 42,
  firstName: 'Jane',
  lastName: 'Smith',
  phone: '9876543210',
};

// ===========================================================================
// HTML structure
// ===========================================================================
describe('generateReceiptHTML – HTML structure', () => {
  it('returns a string', () => {
    expect(typeof generateReceiptHTML(base)).toBe('string');
  });

  it('begins with a DOCTYPE declaration', () => {
    expect(generateReceiptHTML(base).trimStart()).toContain('<!DOCTYPE html>');
  });

  it('contains an opening and closing <html> tag', () => {
    const html = generateReceiptHTML(base);
    expect(html).toContain('<html>');
    expect(html).toContain('</html>');
  });

  it('contains an opening and closing <body> tag', () => {
    const html = generateReceiptHTML(base);
    expect(html).toContain('<body>');
    expect(html).toContain('</body>');
  });

  it('contains a <head> section with a <title>', () => {
    const html = generateReceiptHTML(base);
    expect(html).toContain('<head>');
    expect(html).toContain('<title>');
  });

  it('includes the client name in the page title', () => {
    const html = generateReceiptHTML(base);
    expect(html).toContain('Jane Smith');
  });

  it('includes the auto-print script', () => {
    expect(generateReceiptHTML(base)).toContain('window.print()');
  });
});

// ===========================================================================
// Branding / logo
// ===========================================================================
describe('generateReceiptHTML – branding', () => {
  it('shows the fallback "Fitura" heading when no logo URL is provided', () => {
    const html = generateReceiptHTML(base);
    expect(html).toContain('<h1>Fitura</h1>');
  });

  it('renders an <img> with the logo URL when one is provided', () => {
    const html = generateReceiptHTML(base, 'https://example.com/logo.png');
    expect(html).toContain('https://example.com/logo.png');
    expect(html).toContain('<img');
  });

  it('omits the fallback <h1>Fitura</h1> when a logo URL is provided', () => {
    const html = generateReceiptHTML(base, 'https://example.com/logo.png');
    expect(html).not.toContain('<h1>Fitura</h1>');
  });
});

// ===========================================================================
// Client details section
// ===========================================================================
describe('generateReceiptHTML – client details', () => {
  it('shows the receipt number derived from clientId', () => {
    expect(generateReceiptHTML(base)).toContain('#42');
  });

  it('includes the client first name', () => {
    expect(generateReceiptHTML(base)).toContain('Jane');
  });

  it('includes the client last name', () => {
    expect(generateReceiptHTML(base)).toContain('Smith');
  });

  it('includes the phone number', () => {
    expect(generateReceiptHTML(base)).toContain('9876543210');
  });

  it('includes the email when provided', () => {
    const html = generateReceiptHTML({ ...base, email: 'jane@example.com' });
    expect(html).toContain('jane@example.com');
  });

  it('omits the Email row when email is not provided', () => {
    // The row label "Email" should not appear
    const html = generateReceiptHTML(base);
    expect(html).not.toMatch(/>\s*Email\s*</);
  });

  it('includes the address when provided', () => {
    const html = generateReceiptHTML({ ...base, address: '5th Avenue, NYC' });
    expect(html).toContain('5th Avenue, NYC');
  });

  it('omits the Address row when address is not provided', () => {
    const html = generateReceiptHTML(base);
    expect(html).not.toMatch(/>\s*Address\s*</);
  });
});

// ===========================================================================
// Membership section
// ===========================================================================
describe('generateReceiptHTML – membership section', () => {
  it('displays the membership name when provided', () => {
    const html = generateReceiptHTML({ ...base, membershipName: 'Gold Annual' });
    expect(html).toContain('Gold Annual');
  });

  it('shows "N/A" for plan when membershipName is not provided', () => {
    // Plan row always renders; value is "N/A" via the || fallback
    const html = generateReceiptHTML(base);
    // "N/A" must appear at least once in the Membership section
    expect(html).toContain('N/A');
  });

  it('formats joiningDate in the receipt', () => {
    const html = generateReceiptHTML({ ...base, joiningDate: '2024-03-15' });
    // en-IN locale: "15 Mar 2024" – at minimum the year and month abbreviation
    expect(html).toContain('Mar');
    expect(html).toContain('2024');
  });

  it('formats expiryDate in the receipt', () => {
    const html = generateReceiptHTML({ ...base, expiryDate: '2025-12-31' });
    expect(html).toContain('Dec');
    expect(html).toContain('2025');
  });

  it('shows "N/A" for joiningDate when not provided', () => {
    const html = generateReceiptHTML({ ...base, joiningDate: undefined });
    expect(html).toContain('N/A');
  });

  it('shows "N/A" for expiryDate when not provided', () => {
    const html = generateReceiptHTML({ ...base, expiryDate: undefined });
    expect(html).toContain('N/A');
  });
});

// ===========================================================================
// Payment details section
// ===========================================================================
describe('generateReceiptHTML – payment details', () => {
  it('formats the membership fee as ₹<amount>', () => {
    const html = generateReceiptHTML({ ...base, membershipFee: 1500 });
    expect(html).toContain('₹1500.00');
  });

  it('defaults membership fee to ₹0.00 when not provided', () => {
    expect(generateReceiptHTML(base)).toContain('₹0.00');
  });

  it('shows the discount row when discount is greater than 0', () => {
    const html = generateReceiptHTML({ ...base, membershipFee: 3000, discount: 500 });
    expect(html).toContain('Discount');
    expect(html).toContain('₹500.00');
  });

  it('hides the discount row when discount is 0', () => {
    const html = generateReceiptHTML({ ...base, membershipFee: 3000, discount: 0 });
    expect(html).not.toContain('Discount');
  });

  it('hides the discount row when discount is not provided', () => {
    const html = generateReceiptHTML({ ...base, membershipFee: 3000 });
    expect(html).not.toContain('Discount');
  });

  it('computes Amount Payable as membershipFee minus discount', () => {
    // 2000 - 500 = 1500
    const html = generateReceiptHTML({ ...base, membershipFee: 2000, discount: 500 });
    expect(html).toContain('₹1500.00');
  });

  it('clamps Amount Payable to ₹0.00 when discount exceeds membershipFee', () => {
    const html = generateReceiptHTML({ ...base, membershipFee: 500, discount: 1000 });
    // Math.max(0, 500 - 1000) = 0
    expect(html).toContain('₹0.00');
  });

  it('formats paidAmount correctly', () => {
    const html = generateReceiptHTML({ ...base, paidAmount: 4200 });
    expect(html).toContain('₹4200.00');
  });

  it('defaults paidAmount to ₹0.00 when not provided', () => {
    expect(generateReceiptHTML(base)).toContain('₹0.00');
  });

  it('includes the payment date when provided', () => {
    const html = generateReceiptHTML({ ...base, paymentDate: '2024-06-01' });
    expect(html).toContain('Jun');
    expect(html).toContain('2024');
  });

  it('includes the payment mode when provided', () => {
    const html = generateReceiptHTML({ ...base, paymentMode: 'UPI' });
    expect(html).toContain('UPI');
  });

  it('omits the Payment Mode row when paymentMode is not provided', () => {
    const html = generateReceiptHTML(base);
    expect(html).not.toMatch(/>\s*Payment Mode\s*</);
  });

  it('includes the transaction ID when provided', () => {
    const html = generateReceiptHTML({ ...base, transactionId: 'TXN987654' });
    expect(html).toContain('TXN987654');
  });

  it('omits the Transaction ID row when transactionId is not provided', () => {
    const html = generateReceiptHTML(base);
    expect(html).not.toMatch(/>\s*Transaction ID\s*</);
  });
});

// ===========================================================================
// Footer
// ===========================================================================
describe('generateReceiptHTML – footer', () => {
  it('contains a "Thank you" message in the footer', () => {
    expect(generateReceiptHTML(base)).toContain('Thank you');
  });

  it('includes a "Generated on" date in the footer', () => {
    expect(generateReceiptHTML(base)).toContain('Generated on');
  });
});

// ===========================================================================
// Currency formatter
// ===========================================================================
describe('generateReceiptHTML – currency formatting', () => {
  it('formats integer amounts with two decimal places', () => {
    expect(generateReceiptHTML({ ...base, membershipFee: 1000 })).toContain('₹1000.00');
  });

  it('formats decimal amounts correctly', () => {
    expect(generateReceiptHTML({ ...base, membershipFee: 999.99 })).toContain('₹999.99');
  });

  it('rounds to two decimal places', () => {
    expect(generateReceiptHTML({ ...base, membershipFee: 100.125 })).toContain('₹100.13');
  });
});
