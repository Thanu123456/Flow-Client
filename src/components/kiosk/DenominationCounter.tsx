import React, { useMemo } from 'react';
import { InputNumber } from 'antd';

// Standard LKR note/coin denominations, largest first.
const DENOMINATIONS = [5000, 1000, 500, 100, 50, 20, 10, 5, 2, 1];

export type DenominationCounts = Record<string, number>;

export function denominationTotal(counts: DenominationCounts): number {
    return DENOMINATIONS.reduce((sum, d) => sum + d * (counts[String(d)] || 0), 0);
}

interface Props {
    value: DenominationCounts;
    onChange: (value: DenominationCounts) => void;
}

// A compact per-note/coin count grid for counting cash into or out of the
// drawer — used at both shift open (opening float) and shift close (counted
// cash), so the total it computes always matches what was actually counted,
// not a number typed in separately from the breakdown.
const DenominationCounter: React.FC<Props> = ({ value, onChange }) => {
    const total = useMemo(() => denominationTotal(value), [value]);

    const setCount = (denom: number, count: number) => {
        onChange({ ...value, [String(denom)]: Math.max(0, count) });
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {DENOMINATIONS.map((denom) => (
                    <div key={denom} className="flex items-center gap-2">
                        <div className="w-14 text-sm font-semibold text-gray-600 text-right">{denom}</div>
                        <span className="text-gray-400">×</span>
                        <InputNumber
                            min={0}
                            precision={0}
                            value={value[String(denom)] || 0}
                            onChange={(v) => setCount(denom, Number(v))}
                            className="flex-1"
                        />
                        <div className="w-20 text-xs text-gray-500 text-right">
                            {(denom * (value[String(denom)] || 0)).toFixed(2)}
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-1">
                <span className="text-sm font-bold text-gray-700">Counted Total</span>
                <span className="text-lg font-black text-blue-600">Rs. {total.toFixed(2)}</span>
            </div>
        </div>
    );
};

export default DenominationCounter;
