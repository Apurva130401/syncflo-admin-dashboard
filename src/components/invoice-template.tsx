interface InvoiceData {
  invoiceNumber: string;
  paymentDate: string;
  planName: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  paymentId: string;
}

export function InvoiceTemplate({ data }: { data: InvoiceData }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    // Always display in USD with $ symbol
    return `$${amount.toFixed(2)}`;
  };

  return (
    <div style={{
      fontFamily: 'Inter, sans-serif',
      backgroundColor: '#ffffff',
      padding: '16px',
      minHeight: '100vh'
    }}>
      <div style={{
        maxWidth: '1024px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        padding: '32px'
      }}>

        {/* Header: Logo and Invoice Title */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '40px'
        }}>
          <div>
            {/* Logo */}
            <div style={{ height: '48px', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>SyncFlo AI</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{
              fontSize: '30px',
              fontWeight: 'bold',
              color: '#1f2937',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Invoice
            </h1>
            <p style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#059669',
              textTransform: 'uppercase',
              letterSpacing: '0.025em'
            }}>Paid</p>
          </div>
        </header>

        {/* Company & Client Details */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '32px',
          marginBottom: '48px'
        }}>
          {/* Bill From: SyncFlo AI */}
          <div>
            <h2 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#6b7280',
              textTransform: 'uppercase',
              marginBottom: '12px'
            }}>From</h2>
            <p style={{
              fontWeight: 'bold',
              fontSize: '18px',
              color: '#111827'
            }}>SyncFlo AI</p>
            <p style={{ color: '#4b5563' }}>123 AI Avenue</p>
            <p style={{ color: '#4b5563' }}>Innovation Park, CA 94043</p>
            <p style={{ color: '#4b5563' }}>contact@syncflo.ai</p>
          </div>

          {/* Bill To: Client */}
          <div style={{ textAlign: 'right' }}>
            <h2 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#6b7280',
              textTransform: 'uppercase',
              marginBottom: '12px'
            }}>Bill To</h2>
            <p style={{
              fontWeight: 'bold',
              fontSize: '18px',
              color: '#111827'
            }}>{data.customerName}</p>
            <p style={{ color: '#4b5563' }}>{data.customerEmail}</p>
          </div>
        </section>

        {/* Invoice Meta: Number, Date, Due Date */}
        <section style={{
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
          marginBottom: '48px'
        }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: '600', color: '#374151' }}>Date Paid</p>
            <p style={{ color: '#111827', fontWeight: '500' }}>{formatDate(data.paymentDate)}</p>
          </div>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <p style={{ fontWeight: '600', color: '#374151' }}>Invoice Number</p>
            <p style={{ color: '#111827', fontWeight: '500' }}>{data.invoiceNumber}</p>
          </div>
        </section>

        {/* Line Items Table */}
        <section style={{ marginBottom: '48px' }}>
          <table style={{
            width: '100%',
            textAlign: 'left',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #d1d5db' }}>
                <th style={{
                  padding: '12px 12px 12px 0',
                  fontWeight: '600',
                  color: '#374151',
                  textTransform: 'uppercase',
                  fontSize: '12px'
                }}>Description</th>
                <th style={{
                  padding: '12px',
                  fontWeight: '600',
                  color: '#374151',
                  textTransform: 'uppercase',
                  fontSize: '12px',
                  textAlign: 'center'
                }}>Qty</th>
                <th style={{
                  padding: '12px',
                  fontWeight: '600',
                  color: '#374151',
                  textTransform: 'uppercase',
                  fontSize: '12px',
                  textAlign: 'right'
                }}>Rate</th>
                <th style={{
                  padding: '12px 0 12px 12px',
                  fontWeight: '600',
                  color: '#374151',
                  textTransform: 'uppercase',
                  fontSize: '12px',
                  textAlign: 'right'
                }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {/* Main Item */}
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '16px 12px 16px 0' }}>
                  <p style={{ fontWeight: '500', color: '#111827' }}>{data.planName}</p>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>Subscription payment</p>
                </td>
                <td style={{ padding: '16px 12px', color: '#374151', textAlign: 'center' }}>1</td>
                <td style={{ padding: '16px 12px', color: '#374151', textAlign: 'right' }}>{formatCurrency(data.amount, data.currency)}</td>
                <td style={{ padding: '16px 0 16px 12px', color: '#111827', fontWeight: '500', textAlign: 'right' }}>{formatCurrency(data.amount, data.currency)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Totals */}
        <section style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '48px' }}>
          <div style={{ width: '320px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
              <span style={{ color: '#6b7280' }}>Subtotal</span>
              <span style={{ fontWeight: '500', color: '#111827' }}>{formatCurrency(data.amount, data.currency)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
              <span style={{ color: '#6b7280' }}>Tax (0%)</span>
              <span style={{ fontWeight: '500', color: '#111827' }}>₹0.00</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderTop: '2px solid #d1d5db',
              marginTop: '8px'
            }}>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>Amount Paid</span>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>{formatCurrency(data.amount, data.currency)}</span>
            </div>
          </div>
        </section>

        {/* Footer: Notes & Payment Terms */}
        <footer style={{
          borderTop: '1px solid #e5e7eb',
          paddingTop: '32px'
        }}>
          <h3 style={{ fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Notes</h3>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
            Thank you for your business. This invoice has been paid in full.
          </p>
          <p style={{ color: '#6b7280', fontSize: '12px' }}>
            Payment ID: {data.paymentId}
          </p>
        </footer>

      </div>
    </div>
  );
}