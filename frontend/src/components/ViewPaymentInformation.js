import React from "react";

const styles = {
  container: {
    display: "flex",
    fontFamily: "sans-serif",
    minHeight: "100vh",
    color: "#333",
  },
  sidebar: {
    width: "220px",
    background: "#1f1f1f",
    color: "#fff",
    padding: "20px",
  },
  mainContent: {
    flexGrow: 1,
    background: "#f5f5f5",
    padding: "20px",
  },
  filters: {
    marginBottom: "20px",
  },
  input: {
    padding: "8px",
    margin: "0 10px 0 0",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    borderBottom: "2px solid #ccc",
    padding: "8px",
  },
  td: {
    padding: "8px",
    borderBottom: "1px solid #ddd",
  },
  status: {
    padding: "4px 8px",
    borderRadius: "4px",
    display: "inline-block",
  },
  pending: {
    background: "#f5c542",
    color: "#fff",
  },
  paid: {
    background: "#4caf50",
    color: "#fff",
  },
  navItem: {
    margin: "10px 0",
    cursor: "pointer",
  },
};

function TechnicalStorePayments() {
  const payments = [
    {
      id: "1",
      orderId: "96134b91-57c1-4361-983a-8a88ec816a63",
      total: "€430.70",
      method: "Cash",
      created: "May 04, 2023 07:28",
      updated: "May 04, 2023 07:28",
      status: "Pending",
    },
    {
      id: "2",
      orderId: "1c2cf609-4890-4a20-a5f2-ce63a52210d8",
      total: "€1,026.60",
      method: "Cash",
      created: "May 04, 2023 07:23",
      updated: "May 04, 2023 07:23",
      status: "Pending",
    },
    {
      id: "3",
      orderId: "1636c9af-1cc7-4424-b704-12e85813c45f",
      total: "€289.10",
      method: "Cash",
      created: "May 04, 2023 07:04",
      updated: "May 04, 2023 07:24",
      status: "Paid",
    },
  ];

  // Moved the render logic here
  const renderPaymentsPage = () => (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <h2 style={{ marginTop: 0 }}>Technical Store</h2>
        <ul style={{ listStyle: "none", padding: 0, marginTop: "20px" }}>
          <li style={styles.navItem}>CPU</li>
          <li style={styles.navItem}>Computer</li>
          <li style={styles.navItem}>Laptop</li>
          <li style={styles.navItem}>Camera</li>
        </ul>
      </aside>

      <main style={styles.mainContent}>
        <h1>Payments</h1>

        <div style={styles.filters}>
          <input
            type="text"
            placeholder="Search by Order ID or Identifier"
            style={styles.input}
          />
          <select style={styles.input}>
            <option>Cash</option>
            <option>Credit</option>
          </select>
        </div>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Identifier</th>
              <th style={styles.th}>Order ID</th>
              <th style={styles.th}>Total</th>
              <th style={styles.th}>Method</th>
              <th style={styles.th}>Created</th>
              <th style={styles.th}>Updated</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td style={styles.td}>{p.id}</td>
                <td style={styles.td}>{p.orderId}</td>
                <td style={styles.td}>{p.total}</td>
                <td style={styles.td}>{p.method}</td>
                <td style={styles.td}>{p.created}</td>
                <td style={styles.td}>{p.updated}</td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.status,
                      ...(p.status === "Paid" ? styles.paid : styles.pending),
                    }}
                  >
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );

  return renderPaymentsPage();
}

export default TechnicalStorePayments;
