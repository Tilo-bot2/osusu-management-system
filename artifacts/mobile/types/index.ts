export interface Member {
  id: string;
  memberId: string;
  fullName: string;
  phone: string;
  address: string;
  password: string;
  dateJoined: string;
  status: 'active' | 'inactive';
}

export interface Contribution {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  date: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'mobile_money';
  remarks: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'payment_deadline' | 'emergency' | 'general';
  date: string;
}

export interface OsusuCycle {
  id: string;
  groupName: string;
  startDate: string;
  endDate: string;
  contributionAmount: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  numberOfMembers: number;
  status: 'active' | 'completed' | 'pending';
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  adminUser: string;
}
