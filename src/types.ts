export type AccountStatus = 'pending' | 'approved' | 'rejected';

export interface UserAccount {
  id: string;
  username: string;
  password?: string; // Viewable in admin dashboard
  submittedInfo: string;
  status: AccountStatus;
  rejectionReason?: string;
  createdAt: number;
}
