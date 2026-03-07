import { useState } from 'react';
import type { Key } from 'antd/es/table/interface';

export const useTableSelection = <T extends any>() => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<T[]>([]);

    const onSelectionChange = (newSelectedRowKeys: Key[], newSelectedRows: T[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
        setSelectedRows(newSelectedRows);
    };

    const clearSelection = () => {
        setSelectedRowKeys([]);
        setSelectedRows([]);
    };

    return {
        selectedRowKeys,
        selectedRows,
        onSelectionChange,
        clearSelection,
        rowSelection: {
            selectedRowKeys,
            onChange: onSelectionChange,
            preserveSelectedRowKeys: true,
        }
    };
};
