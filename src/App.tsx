import { ConfigProvider } from "antd";
import { customTheme } from "./config/theme.config";
// import { ButtonExamples } from "./components/common/Button/ButtonExamples";
// import InputExamples from "./components/common/Input/InputExample";
// import { TableExample } from "./components/common/Table/TableExample";
import { NavigationExample } from "./components/common/Navigation/NavigationExample";
import { ModalExample } from "./components/common/Modal/ModalExample";

const App = () => (
  <ConfigProvider theme={customTheme}>
    {/* <ButtonExamples /> */}
    {/* <InputExamples /> */}
    <ModalExample/>
  </ConfigProvider>
);

export default App;
