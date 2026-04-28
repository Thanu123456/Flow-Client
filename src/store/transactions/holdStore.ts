import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { holdService } from '../../services/transactions/holdService';
import type { HeldBill, SaveHoldRequest } from '../../types/entities/holdBill.types';
import { message } from 'antd';

interface HoldState {
  heldBills: HeldBill[];
  loading: boolean;
  submitting: boolean;

  fetchHeldBills: (status?: string) => Promise<void>;
  saveHold: (data: SaveHoldRequest) => Promise<boolean>;
  resumeHold: (holdId: string) => Promise<HeldBill | null>;
  deleteHold: (holdId: string) => Promise<boolean>;
}

export const useHoldStore = create<HoldState>()(
  devtools(
    (set) => ({
      heldBills: [],
      loading: false,
      submitting: false,

      fetchHeldBills: async (status = 'active') => {
        set({ loading: true });
        try {
          const bills = await holdService.getHeldBills(status);
          set({ heldBills: bills });
        } catch {
          message.error('Failed to load held bills');
        } finally {
          set({ loading: false });
        }
      },

      saveHold: async (data) => {
        set({ submitting: true });
        try {
          await holdService.saveHold(data);
          message.success('Bill held successfully');
          return true;
        } catch {
          message.error('Failed to hold bill');
          return false;
        } finally {
          set({ submitting: false });
        }
      },

      resumeHold: async (holdId) => {
        set({ submitting: true });
        try {
          const bill = await holdService.resumeHold(holdId);
          set((s) => ({ heldBills: s.heldBills.filter((b) => b.id !== holdId) }));
          return bill;
        } catch {
          message.error('Failed to resume bill');
          return null;
        } finally {
          set({ submitting: false });
        }
      },

      deleteHold: async (holdId) => {
        set({ submitting: true });
        try {
          await holdService.deleteHold(holdId);
          set((s) => ({ heldBills: s.heldBills.filter((b) => b.id !== holdId) }));
          message.success('Held bill deleted');
          return true;
        } catch {
          message.error('Failed to delete held bill');
          return false;
        } finally {
          set({ submitting: false });
        }
      },
    }),
    { name: 'hold-store' }
  )
);
