import { ConfigProvider } from "antd";
import { customTheme } from "./config/theme.config";
import { ButtonExamples } from "./components/common/Button/ButtonExamples";
import InputExamples from "./components/common/Input/InputExample";
import { TableExample } from "./components/common/Table/TableExample";

const App = () => (
  <ConfigProvider theme={customTheme}>
    {/* <ButtonExamples /> */}
    {/* <InputExamples /> */}
    <TableExample />
  </ConfigProvider>
);

export default App;
