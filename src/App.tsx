import { ConfigProvider } from "antd";
import { customTheme } from "./config/theme.config";
import { ButtonExamples } from "./components/common/Button/ButtonExamples";
import InputExamples from "./components/common/Input/InputExample";

const App = () => (
  <ConfigProvider theme={customTheme}>
    {/* <ButtonExamples /> */}
    <InputExamples />
  </ConfigProvider>
);

export default App;
