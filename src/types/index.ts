export interface User {
  id: string
  name: string
}

export interface UserProfile extends User {
  sponsor: User | null
  enroller: User | null
}

export interface OVMetric {
  totalPV: number
  lrpVolume: number
  lrpPercentage: number
  pv: number
}

export interface MetricGoal {
  targetValue: number
  isAchieved: boolean
  label: string
  remaining?: number
}

export interface PGVMetric {
  currentPV: number
  goals: MetricGoal[]
}

export interface ClusterVolumeMetric {
  volumePV: number
  clusterType: string
  lrpGoalAchieved: boolean
  lrpGoalLabel: string
  nextGoal?: {
    target: number
    remaining: number
  }
}

export interface ClientStats {
  orderingCount: number
  newMembers: number
  personallyEnrolled: number
}

export interface DashboardMetrics {
  ov: OVMetric
  pgv: PGVMetric
  clusterVolume: ClusterVolumeMetric
  clientStats: ClientStats
}

export type MembershipType = 'WC' | 'WA'

export interface FastStart {
  daysRemaining: number | null
  status: 'active' | 'expiring' | 'none'
}

export interface StructureMember {
  id: string
  name: string
  ordersCount: number
  totalPV: number
  pvStatus: 'normal' | 'warning' | 'success'
  lastOrderDate: Date | null
  sponsor: User
  enroller: User
  membershipType: MembershipType
  fastStart: FastStart
  remainingPGVMonths: number | null
  path?: User[] // ścieżka od głównego węzła do tej osoby
}

export type FilterTabKey =
  | 'paid'
  | 'all'
  | 'pgv'
  | 'cluster'
  | 'frontline'
  | 'personally'
  | 'newMembers'

export interface FilterTab {
  key: FilterTabKey
  label: string
}

export interface FilterTag {
  id: string
  label: string
}
