import React, { useState } from "react";
import {
  TextInput,
  NumberInput,
  PasswordInput,
  SearchInput,
  PINInput,
  TextAreaInput,
  EmailInput,
  PhoneInput,
  CurrencyInput,
  PercentageInput,
  BarcodeInput,
  UserIDInput,
} from "./Input";
import { Divider } from "antd";

export const InputExamples: React.FC = () => {
  const [, setSearchValue] = useState("");
  const [pinValue, setPinValue] = useState("");
  const [password, setPassword] = useState("");
  const [barcode, setBarcode] = useState("");

  // Password strength calculator
  const getPasswordStrength = (
    pwd: string
  ): "weak" | "medium" | "strong" | undefined => {
    if (!pwd) return undefined;
    if (pwd.length < 6) return "weak";
    if (pwd.length < 10) return "medium";
    return "strong";
  };

  const handleSearch = (value: string) => {
    console.log("Searching for:", value);
    setSearchValue(value);
  };

  const handlePINComplete = (pin: string) => {
    console.log("PIN entered:", pin);
  };

  const handleBarcodeScan = (code: string) => {
    console.log("Barcode scanned:", code);
    setBarcode(code);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Input Components</h1>
        <p className="text-gray-600">
          Comprehensive input components for POS system
        </p>
      </div>

      <Divider orientation="left">
        <h2 className="text-xl font-semibold">1. Text Input</h2>
      </Divider>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          label="Customer Name"
          placeholder="Enter customer name"
          required
          fullWidth
        />
        <TextInput
          label="Product Name"
          placeholder="Enter product name"
          helperText="Maximum 50 characters"
          maxLength={50}
          showCount
          fullWidth
        />
      </div>

      <Divider orientation="left">
        <h2 className="text-xl font-semibold">2. Number Input</h2>
      </Divider>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NumberInput
          label="Price"
          placeholder="0.00"
          min={0}
          precision={2}
          step={0.01}
          fullWidth
        />
        <NumberInput
          label="Quantity"
          placeholder="0"
          min={1}
          max={999}
          step={1}
          fullWidth
        />
        <NumberInput label="Stock" placeholder="0" min={0} step={1} fullWidth />
      </div>

      <Divider orientation="left">
        <h2 className="text-xl font-semibold">3. Password Input</h2>
      </Divider>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PasswordInput
          label="Login Password"
          placeholder="Enter password"
          required
          fullWidth
        />
        <PasswordInput
          label="New Password"
          placeholder="Create strong password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          showStrengthIndicator
          strengthLevel={getPasswordStrength(password)}
          fullWidth
        />
      </div>

      <Divider orientation="left">
        <h2 className="text-xl font-semibold">4. Search Input</h2>
      </Divider>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SearchInput
          label="Search Products"
          placeholder="Search by name or SKU..."
          onSearch={handleSearch}
          debounceMs={300}
          fullWidth
        />
        <SearchInput
          label="Search Customers"
          placeholder="Search by name, phone, or email..."
          onSearch={handleSearch}
          fullWidth
        />
      </div>

      <Divider orientation="left">
        <h2 className="text-xl font-semibold">5. PIN Input</h2>
      </Divider>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PINInput
          label="Employee PIN (4 digits)"
          length={4}
          value={pinValue}
          onChange={setPinValue}
          onComplete={handlePINComplete}
          masked
        />
        <PINInput label="Manager PIN (6 digits)" length={6} masked />
      </div>

      <Divider orientation="left">
        <h2 className="text-xl font-semibold">6. Text Area</h2>
      </Divider>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextAreaInput
          label="Product Description"
          placeholder="Enter detailed product description..."
          maxLength={500}
          showCount
          autoSize={{ minRows: 3, maxRows: 6 }}
          fullWidth
        />
        <TextAreaInput
          label="Order Notes"
          placeholder="Add any special instructions..."
          autoSize={{ minRows: 3, maxRows: 6 }}
          helperText="Internal notes for order processing"
          fullWidth
        />
      </div>

      <Divider orientation="left">
        <h2 className="text-xl font-semibold">7. Email Input</h2>
      </Divider>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EmailInput
          label="User Email"
          placeholder="user@example.com"
          required
          validateOnBlur
          fullWidth
        />
        <EmailInput
          label="Customer Email"
          placeholder="customer@example.com"
          helperText="For receipt and updates"
          fullWidth
        />
      </div>

      <Divider orientation="left">
        <h2 className="text-xl font-semibold">8. Phone Input</h2>
      </Divider>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PhoneInput
          label="Customer Phone"
          placeholder="77 123 4567"
          countryCode="+94"
          format="local"
          required
          fullWidth
        />
        <PhoneInput
          label="Alternate Phone"
          placeholder="77 123 4567"
          countryCode="+94"
          format="local"
          fullWidth
        />
      </div>

      <Divider orientation="left">
        <h2 className="text-xl font-semibold">9. Currency Input</h2>
      </Divider>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CurrencyInput
          label="Product Price"
          placeholder="0.00"
          currency="LKR"
          showSymbol
          required
          fullWidth
        />
        <CurrencyInput
          label="Discount Amount"
          placeholder="0.00"
          currency="LKR"
          showSymbol
          fullWidth
        />
        <CurrencyInput
          label="Total Amount"
          placeholder="0.00"
          currency="LKR"
          showSymbol
          disabled
          fullWidth
        />
      </div>

      <Divider orientation="left">
        <h2 className="text-xl font-semibold">10. Percentage Input</h2>
      </Divider>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PercentageInput
          label="Discount Percentage"
          placeholder="0"
          min={0}
          max={100}
          precision={2}
          showSymbol
          fullWidth
        />
        <PercentageInput
          label="Tax Rate"
          placeholder="0"
          min={0}
          max={50}
          precision={2}
          showSymbol
          fullWidth
        />
        <PercentageInput
          label="Profit Margin"
          placeholder="0"
          min={0}
          max={100}
          precision={2}
          showSymbol
          fullWidth
        />
      </div>

      <Divider orientation="left">
        <h2 className="text-xl font-semibold">11. Barcode Input</h2>
      </Divider>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BarcodeInput
          label="Product Barcode"
          placeholder="Scan or enter barcode"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          onScan={handleBarcodeScan}
          scannerEnabled
          required
          fullWidth
        />
        <BarcodeInput
          label="SKU Code"
          placeholder="Enter SKU code"
          scannerEnabled={false}
          helperText="Manual entry only"
          fullWidth
        />
      </div>

      <Divider orientation="left">
        <h2 className="text-xl font-semibold">12. User ID Input</h2>
      </Divider>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UserIDInput
          label="Employee ID"
          placeholder="001"
          prefix="EMP"
          format="uppercase"
          maxLength={6}
          required
          fullWidth
        />
        <UserIDInput
          label="Cashier ID"
          placeholder="001"
          prefix="CASH"
          format="uppercase"
          maxLength={6}
          fullWidth
        />
      </div>

      <Divider orientation="left">
        <h2 className="text-xl font-semibold">Input Sizes</h2>
      </Divider>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextInput
            label="Small Input"
            placeholder="Small size"
            size="small"
            fullWidth
          />
          <TextInput
            label="Middle Input"
            placeholder="Middle size (default)"
            size="middle"
            fullWidth
          />
          <TextInput
            label="Large Input"
            placeholder="Large size"
            size="large"
            fullWidth
          />
        </div>
      </div>

      <Divider orientation="left">
        <h2 className="text-xl font-semibold">Error States</h2>
      </Divider>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          label="Required Field"
          placeholder="This field is required"
          error="This field cannot be empty"
          required
          fullWidth
        />
        <EmailInput
          label="Invalid Email"
          placeholder="email@example.com"
          value="invalid-email"
          error="Please enter a valid email address"
          fullWidth
        />
      </div>

      <Divider orientation="left">
        <h2 className="text-xl font-semibold">Disabled State</h2>
      </Divider>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          label="Read Only"
          value="This field is disabled"
          disabled
          fullWidth
        />
        <NumberInput
          label="Calculated Field"
          value={1234.56}
          disabled
          precision={2}
          fullWidth
        />
      </div>

      <Divider orientation="left">
        <h2 className="text-xl font-semibold">POS-Specific Examples</h2>
      </Divider>
      <div className="space-y-6">
        {/* Quick Sale Form */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Quick Sale Entry</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <BarcodeInput
              label="Product Barcode"
              placeholder="Scan product"
              scannerEnabled
              fullWidth
            />
            <NumberInput
              label="Quantity"
              placeholder="1"
              min={1}
              defaultValue={1}
              fullWidth
            />
            <CurrencyInput
              label="Unit Price"
              placeholder="0.00"
              currency="LKR"
              fullWidth
            />
            <PercentageInput
              label="Discount %"
              placeholder="0"
              max={100}
              fullWidth
            />
          </div>
        </div>

        {/* Customer Registration */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Customer Registration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              label="Full Name"
              placeholder="John Doe"
              required
              fullWidth
            />
            <PhoneInput
              label="Phone Number"
              placeholder="77 123 4567"
              countryCode="+94"
              required
              fullWidth
            />
            <EmailInput
              label="Email Address"
              placeholder="customer@example.com"
              fullWidth
            />
            <TextAreaInput
              label="Address"
              placeholder="Street, City, Postal Code"
              autoSize={{ minRows: 2, maxRows: 4 }}
              fullWidth
            />
          </div>
        </div>

        {/* Employee Login */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Employee Login (Kiosk)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <UserIDInput
              label="Employee ID"
              placeholder="001"
              prefix="EMP"
              format="uppercase"
              required
              fullWidth
            />
            <PINInput label="PIN Code" length={4} masked />
          </div>
        </div>

        {/* Product Management */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Add New Product</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                label="Product Name"
                placeholder="Enter product name"
                required
                fullWidth
              />
              <BarcodeInput
                label="Barcode/SKU"
                placeholder="Scan or enter"
                required
                fullWidth
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CurrencyInput
                label="Cost Price"
                placeholder="0.00"
                currency="LKR"
                required
                fullWidth
              />
              <CurrencyInput
                label="Selling Price"
                placeholder="0.00"
                currency="LKR"
                required
                fullWidth
              />
              <PercentageInput
                label="Profit Margin"
                placeholder="0"
                disabled
                fullWidth
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NumberInput
                label="Stock Quantity"
                placeholder="0"
                min={0}
                required
                fullWidth
              />
              <NumberInput
                label="Reorder Level"
                placeholder="0"
                min={0}
                fullWidth
              />
            </div>
            <TextAreaInput
              label="Product Description"
              placeholder="Detailed description..."
              maxLength={500}
              showCount
              fullWidth
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputExamples;
