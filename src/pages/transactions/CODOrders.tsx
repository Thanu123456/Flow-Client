import React from "react";
import { Card } from "antd";
import CODOrdersTable from "../../components/cod/CODOrdersTable";

const CODOrders: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <Card
        title="COD Orders Management"
        bordered={false}
        style={{
          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)",
        }}
      >
        <CODOrdersTable />
      </Card>
    </div>
  );
};

export default CODOrders;
