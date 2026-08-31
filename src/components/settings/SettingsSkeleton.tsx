import React from "react";
import { Alert, Button, Skeleton } from "antd";

const Row: React.FC = () => (
  <div style={{ display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
    {[0, 1, 2].map((i) => (
      <div key={i} style={{ flex: "1 1 180px" }}>
        <Skeleton.Input active size="small" style={{ width: 88, height: 12, marginBottom: 8 }} />
        <Skeleton.Input active block style={{ height: 34 }} />
      </div>
    ))}
  </div>
);

export const SettingsSkeleton: React.FC<{ groups?: number }> = ({ groups = 2 }) => (
  <>
    {Array.from({ length: groups }).map((_, g) => (
      <div key={g} style={{ marginBottom: 32 }}>
        <Skeleton.Input active size="small" style={{ width: 120, height: 12, marginBottom: 18 }} />
        <Row />
        <Row />
      </div>
    ))}
  </>
);

export const SettingsLoadError: React.FC<{ message: string; onRetry: () => void }> = ({
  message,
  onRetry,
}) => (
  <Alert
    type="error"
    showIcon
    message="Couldn't load this section"
    description={message}
    action={
      <Button size="small" onClick={onRetry}>
        Retry
      </Button>
    }
  />
);

export default SettingsSkeleton;
