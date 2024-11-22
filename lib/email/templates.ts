import { Customer } from '@/types';

export function generateInventoryReportEmail(
  customer: Customer,
  month: string,
  year: string,
  items: any[]
) {
  const totalStorageCharges = items.reduce((sum, item) => sum + item.storageCharges, 0);
  const totalOutboundCharges = items.reduce((sum, item) => sum + item.outboundCharges, 0);
  const totalCharges = totalStorageCharges + totalOutboundCharges;

  return {
    subject: `Inventory Report - ${month} ${year}`,
    html: `
      <h1>Inventory Report for ${customer}</h1>
      <p>Period: ${month} ${year}</p>
      
      <h2>Summary</h2>
      <p>Total Storage Charges: $${totalStorageCharges.toFixed(2)}</p>
      <p>Total Outbound Charges: $${totalOutboundCharges.toFixed(2)}</p>
      <p>Total Charges: $${totalCharges.toFixed(2)}</p>
      
      <h2>Inventory Details</h2>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty on Hand</th>
            <th>Storage Rate</th>
            <th>Storage Charges</th>
            <th>Outbound Charges</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td>${item.name}</td>
              <td>${item.qtyOnHand}</td>
              <td>$${item.storageRate.toFixed(2)}</td>
              <td>$${item.storageCharges.toFixed(2)}</td>
              <td>$${item.outboundCharges.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `,
  };
}