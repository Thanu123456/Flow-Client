import React from "react";
import {
  PrimaryButton,
  SecondaryButton,
  DangerButton,
  SuccessButton,
  GhostButton,
  LinkButton,
  IconButton,
  LoadingButton,
  ActionButton,
  FloatingActionButton,
} from "./Button";
import {
  SaveOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  EyeOutlined,
  DownloadOutlined,
} from "@ant-design/icons";

export const ButtonExamples: React.FC = () => {
  const [loading, setLoading] = React.useState(false);

  const handleAction = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  const dropdownItems = [
    {
      key: "edit",
      label: "Edit",
      icon: <EditOutlined />,
      onClick: () => console.log("Edit clicked"),
    },
    {
      key: "delete",
      label: "Delete",
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => console.log("Delete clicked"),
    },
    {
      key: "view",
      label: "View Details",
      icon: <EyeOutlined />,
      onClick: () => console.log("View clicked"),
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Button Variants</h2>
        <div className="flex flex-wrap gap-4">
          <PrimaryButton icon={<SaveOutlined />}>Save Product</PrimaryButton>

          <SecondaryButton>Cancel</SecondaryButton>

          <DangerButton icon={<DeleteOutlined />}>Delete User</DangerButton>

          <SuccessButton>Approve</SuccessButton>

          <GhostButton>View Details</GhostButton>

          <LinkButton>View all products</LinkButton>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Icon Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <IconButton icon={<EditOutlined />} tooltip="Edit" variant="ghost" />

          <IconButton
            icon={<DeleteOutlined />}
            tooltip="Delete"
            variant="danger"
            shape="circle"
          />

          <IconButton icon={<EyeOutlined />} tooltip="View" variant="primary" />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Loading Button</h2>
        <LoadingButton
          loading={loading}
          onClick={handleAction}
          variant="primary"
        >
          {loading ? "Logging in..." : "Login"}
        </LoadingButton>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Action Button with Dropdown</h2>
        <ActionButton dropdownItems={dropdownItems} variant="secondary">
          Actions
        </ActionButton>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Button Sizes</h2>
        <div className="flex flex-wrap items-center gap-4">
          <PrimaryButton size="small">Small</PrimaryButton>
          <PrimaryButton size="medium">Medium</PrimaryButton>
          <PrimaryButton size="large">Large</PrimaryButton>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Full Width Button</h2>
        <PrimaryButton fullWidth icon={<DownloadOutlined />}>
          Download Report
        </PrimaryButton>
      </section>

      {/* Floating Action Button */}
      <FloatingActionButton
        icon={<PlusOutlined />}
        tooltip="Add Product"
        position="bottom-right"
        onClick={() => console.log("FAB clicked")}
      />
    </div>
  );
};
