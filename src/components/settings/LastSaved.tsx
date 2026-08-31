import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Typography, theme } from "antd";

dayjs.extend(relativeTime);

const { Text } = Typography;

interface Props {
  updatedAt?: string;
  by?: string;
}

/** "Last saved by A. Perera · 3 days ago" — omits the name when unknown. */
const LastSaved: React.FC<Props> = ({ updatedAt, by }) => {
  const { token } = theme.useToken();
  if (!updatedAt) return null;
  const when = dayjs(updatedAt);
  if (!when.isValid()) return null;

  return (
    <Text
      style={{ fontSize: 12.5, color: token.colorTextSecondary }}
      title={when.format("YYYY-MM-DD HH:mm")}
    >
      Last saved{by ? ` by ${by}` : ""} · {when.fromNow()}
    </Text>
  );
};

export default LastSaved;
