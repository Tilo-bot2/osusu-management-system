import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Member, Contribution, Announcement, OsusuCycle, AuditLog } from '@/types';

const STORAGE_KEY = '@osusu_v1';

function genId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

const todayStr = new Date().toISOString().split('T')[0]!;
const yday = new Date(Date.now() - 86400000).toISOString().split('T')[0]!;
const twoAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0]!;
const threeAgo = new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0]!;

interface AppData {
  members: Member[];
  contributions: Contribution[];
  announcements: Announcement[];
  cycles: OsusuCycle[];
  auditLogs: AuditLog[];
}

const SEED: AppData = {
  members: [
    { id: 'mem1', memberId: 'OSU001', fullName: 'Kwame Asante', phone: '+233 24 123 4567', address: '12 Independence Ave, Accra', password: 'member123', dateJoined: '2024-01-15', status: 'active' },
    { id: 'mem2', memberId: 'OSU002', fullName: 'Ama Owusu', phone: '+233 20 987 6543', address: '45 Liberty Road, Kumasi', password: 'member123', dateJoined: '2024-01-15', status: 'active' },
    { id: 'mem3', memberId: 'OSU003', fullName: 'Kofi Mensah', phone: '+233 26 555 7890', address: '8 Palm Avenue, Takoradi', password: 'member123', dateJoined: '2024-02-01', status: 'active' },
  ],
  contributions: [
    { id: 'con1', memberId: 'OSU001', memberName: 'Kwame Asante', amount: 500, date: todayStr, paymentMethod: 'cash', remarks: 'Daily contribution' },
    { id: 'con2', memberId: 'OSU002', memberName: 'Ama Owusu', amount: 500, date: todayStr, paymentMethod: 'mobile_money', remarks: '' },
    { id: 'con3', memberId: 'OSU001', memberName: 'Kwame Asante', amount: 500, date: yday, paymentMethod: 'cash', remarks: '' },
    { id: 'con4', memberId: 'OSU003', memberName: 'Kofi Mensah', amount: 500, date: yday, paymentMethod: 'bank_transfer', remarks: '' },
    { id: 'con5', memberId: 'OSU002', memberName: 'Ama Owusu', amount: 500, date: twoAgo, paymentMethod: 'cash', remarks: '' },
    { id: 'con6', memberId: 'OSU003', memberName: 'Kofi Mensah', amount: 500, date: twoAgo, paymentMethod: 'cash', remarks: '' },
    { id: 'con7', memberId: 'OSU001', memberName: 'Kwame Asante', amount: 500, date: threeAgo, paymentMethod: 'mobile_money', remarks: '' },
  ],
  announcements: [
    { id: 'ann1', title: 'Payment Deadline Reminder', message: 'All members are reminded to make their daily contributions by 5:00 PM. Late payments will attract a GHS 50 penalty.', type: 'payment_deadline', date: todayStr },
    { id: 'ann2', title: 'Monthly General Meeting', message: 'There will be a general meeting this Saturday at 10:00 AM at the community center. All members must attend.', type: 'general', date: yday },
  ],
  cycles: [
    { id: 'cyc1', groupName: 'Unity Osusu Group', startDate: '2024-01-01', endDate: '2024-12-31', contributionAmount: 500, frequency: 'daily', numberOfMembers: 3, status: 'active' },
  ],
  auditLogs: [],
};

interface DataContextType extends AppData {
  loading: boolean;
  addMember: (m: Omit<Member, 'id'>) => void;
  updateMember: (id: string, m: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  addContribution: (c: Omit<Contribution, 'id'>) => void;
  updateContribution: (id: string, c: Partial<Contribution>) => void;
  deleteContribution: (id: string) => void;
  addAnnouncement: (a: Omit<Announcement, 'id'>) => void;
  updateAnnouncement: (id: string, a: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;
  addCycle: (c: Omit<OsusuCycle, 'id'>) => void;
  updateCycle: (id: string, c: Partial<OsusuCycle>) => void;
  deleteCycle: (id: string) => void;
  updateMemberPassword: (memberId: string, newPassword: string) => void;
  addAuditLog: (action: string, details: string) => void;
}

const DataContext = createContext<DataContextType>({} as DataContextType);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(SEED);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setData(JSON.parse(stored));
        } else {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(SEED));
        }
      } catch {
        // use seed
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async (d: AppData) => {
    try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {}
  };

  const update = (updater: (d: AppData) => AppData) => {
    setData(prev => {
      const next = updater(prev);
      save(next);
      return next;
    });
  };

  const addMember = (m: Omit<Member, 'id'>) =>
    update(d => ({ ...d, members: [...d.members, { ...m, id: genId() }] }));
  const updateMember = (id: string, m: Partial<Member>) =>
    update(d => ({ ...d, members: d.members.map(x => x.id === id ? { ...x, ...m } : x) }));
  const deleteMember = (id: string) =>
    update(d => ({ ...d, members: d.members.filter(x => x.id !== id) }));

  const addContribution = (c: Omit<Contribution, 'id'>) =>
    update(d => ({ ...d, contributions: [{ ...c, id: genId() }, ...d.contributions] }));
  const updateContribution = (id: string, c: Partial<Contribution>) =>
    update(d => ({ ...d, contributions: d.contributions.map(x => x.id === id ? { ...x, ...c } : x) }));
  const deleteContribution = (id: string) =>
    update(d => ({ ...d, contributions: d.contributions.filter(x => x.id !== id) }));

  const addAnnouncement = (a: Omit<Announcement, 'id'>) =>
    update(d => ({ ...d, announcements: [{ ...a, id: genId() }, ...d.announcements] }));
  const updateAnnouncement = (id: string, a: Partial<Announcement>) =>
    update(d => ({ ...d, announcements: d.announcements.map(x => x.id === id ? { ...x, ...a } : x) }));
  const deleteAnnouncement = (id: string) =>
    update(d => ({ ...d, announcements: d.announcements.filter(x => x.id !== id) }));

  const addCycle = (c: Omit<OsusuCycle, 'id'>) =>
    update(d => ({ ...d, cycles: [...d.cycles, { ...c, id: genId() }] }));
  const updateCycle = (id: string, c: Partial<OsusuCycle>) =>
    update(d => ({ ...d, cycles: d.cycles.map(x => x.id === id ? { ...x, ...c } : x) }));
  const deleteCycle = (id: string) =>
    update(d => ({ ...d, cycles: d.cycles.filter(x => x.id !== id) }));

  const updateMemberPassword = (memberId: string, newPassword: string) =>
    update(d => ({ ...d, members: d.members.map(x => x.memberId === memberId ? { ...x, password: newPassword } : x) }));

  const addAuditLog = (action: string, details: string) =>
    update(d => ({
      ...d,
      auditLogs: [{ id: genId(), action, details, timestamp: new Date().toISOString(), adminUser: 'admin' }, ...d.auditLogs].slice(0, 100),
    }));

  return (
    <DataContext.Provider value={{
      ...data, loading,
      addMember, updateMember, deleteMember,
      addContribution, updateContribution, deleteContribution,
      addAnnouncement, updateAnnouncement, deleteAnnouncement,
      addCycle, updateCycle, deleteCycle,
      updateMemberPassword, addAuditLog,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
