import React from "react";
import { Card, Avatar, Descriptions, Tag, Typography, theme } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import { usePermissions } from "../../hooks/auth/usePermissions";

const { Title } = Typography;

const Profile: React.FC = () => {
  const { user, isKiosk } = useAuth();
  const { isOwner, permissions } = usePermissions();
  const { token } = theme.useToken();

  const fullName = (user as any)?.full_name || "User";
  const email = (user as any)?.email as string | undefined;
  const phone = (user as any)?.phone as string | undefined;
  const profileImageUrl = (user as any)?.profile_image_url as string | undefined;
  const roleName = isOwner ? "Owner" : (user as any)?.role_name || (user as any)?.role || "Employee";
  const lastLoginAt = (user as any)?.last_login_at as string | undefined;

  return (
    <div style={{ padding: 24, background: token.colorBgLayout, minHeight: "100vh" }}>
      <Title level={3} style={{ marginBottom: 24 }}>My Profile</Title>

      <Card style={{ maxWidth: 640 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
          <Avatar
            size={72}
            src={profileImageUrl}
            icon={!profileImageUrl && <UserOutlined />}
            style={{ background: "linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)" }}
          >
            {!profileImageUrl && fullName.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <Title level={4} style={{ margin: 0 }}>{fullName}</Title>
            <Tag color={isOwner ? "purple" : "blue"} style={{ marginTop: 6 }}>{roleName}</Tag>
            {isKiosk && <Tag color="orange" style={{ marginTop: 6 }}>Kiosk Session</Tag>}
          </div>
        </div>

        <Descriptions column={1} bordered size="small">
          {email && <Descriptions.Item label="Email">{email}</Descriptions.Item>}
          {phone && <Descriptions.Item label="Phone">{phone}</Descriptions.Item>}
          <Descriptions.Item label="Role">{roleName}</Descriptions.Item>
          {lastLoginAt && (
            <Descriptions.Item label="Last Login">
              {new Date(lastLoginAt).toLocaleString()}
            </Descriptions.Item>
          )}
          {!isOwner && (
            <Descriptions.Item label="Permissions">
              {permissions.length > 0 ? `${permissions.length} granted` : "None assigned"}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    </div>
  );
};

export default Profile;
