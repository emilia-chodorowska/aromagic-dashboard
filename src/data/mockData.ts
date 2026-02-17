import type { UserProfile, DashboardMetrics, StructureMember, FilterTab } from '@/types'

export const currentUser: UserProfile = {
  id: '14769732',
  name: 'Chodorowska Emilia',
  sponsor: {
    id: '14748853',
    name: 'Piwowarczyk Joanna',
  },
  enroller: {
    id: '14748853',
    name: 'Piwowarczyk Joanna',
  },
}

export const dashboardMetrics: DashboardMetrics = {
  ov: {
    totalPV: 5561.50,
    lrpVolume: 4189.50,
    lrpPercentage: 75,
    pv: 111.00,
  },
  pgv: {
    currentPV: 423.50,
    goals: [
      { targetValue: 400, isAchieved: true, label: 'Cel 400 PV osiągnięty' },
      { targetValue: 800, isAchieved: false, label: 'Kolejny cel 800 PV', remaining: 376.50 },
    ],
  },
  clusterVolume: {
    volumePV: 202.50,
    clusterType: 'PO3',
    lrpGoalAchieved: true,
    lrpGoalLabel: 'Cel 100 PV (LRP Personally Enrolled) osiągnięty',
    nextGoal: {
      target: 500,
      remaining: 297.50,
    },
  },
  clientStats: {
    orderingCount: 27,
    newMembers: 3,
    personallyEnrolled: 1,
  },
}

// OV = Organization Volume - wolumen całej struktury danej osoby
export const structureMembers: StructureMember[] = [
  {
    id: '18602526',
    name: 'Łapiński Krzysztof',
    ordersCount: 1,
    totalPV: 197.00,
    pvStatus: 'success',
    lastOrderDate: new Date('2026-01-26'),
    orderType: 'internet',
    sponsor: { id: '15129265', name: 'Sybal Wioletta' },
    enroller: { id: '15129265', name: 'Sybal Wioletta' },
    membershipType: 'WC',
    fastStart: { daysRemaining: 57, status: 'active' },
    remainingPGVMonths: 12,
    path: [
      { id: '14769732', name: 'Chodorowska Emilia' },
      { id: '15129265', name: 'Sybal Wioletta' },
    ],
  },
  {
    id: '17544111',
    name: 'Jurkowska Joanna',
    ordersCount: 1,
    totalPV: 27.50,
    pvStatus: 'normal',
    lastOrderDate: new Date('2026-01-21'),
    orderType: 'lrp',
    sponsor: { id: '16569186', name: 'Kojder Maria' },
    enroller: { id: '15156870', name: 'Kojder Martyna' },
    membershipType: 'WC',
    fastStart: { daysRemaining: null, status: 'none' },
    remainingPGVMonths: 3,
    path: [
      { id: '14769732', name: 'Chodorowska Emilia' },
      { id: '15156870', name: 'Kojder Martyna' },
      { id: '16569186', name: 'Kojder Maria' },
    ],
  },
  {
    id: '19000001',
    name: 'Testowa Długa Ścieżka',
    ordersCount: 5,
    totalPV: 1200.00, // OV
    pvStatus: 'normal',
    lastOrderDate: new Date('2026-01-20'),
    orderType: 'lrp',
    sponsor: { id: '18900006', name: 'Poziom Szósty' },
    enroller: { id: '18900006', name: 'Poziom Szósty' },
    membershipType: 'WA',
    fastStart: { daysRemaining: null, status: 'none' },
    remainingPGVMonths: null,
    path: [
      { id: '14769732', name: 'Chodorowska Emilia' },
      { id: '18900002', name: 'Poziom Drugi' },
      { id: '18900003', name: 'Poziom Trzeci' },
      { id: '18900004', name: 'Poziom Czwarty' },
      { id: '18900005', name: 'Poziom Piąty' },
      { id: '18900006', name: 'Poziom Szósty' },
    ],
  },
  {
    id: '18096522',
    name: 'Lewicka Adrianna',
    ordersCount: 15,
    totalPV: 2780.00, // OV
    pvStatus: 'success',
    lastOrderDate: new Date('2026-01-21'),
    orderType: 'internet',
    sponsor: { id: '14769732', name: 'Chodorowska Emilia' },
    enroller: { id: '14769732', name: 'Chodorowska Emilia' },
    membershipType: 'WA',
    fastStart: { daysRemaining: null, status: 'none' },
    remainingPGVMonths: 8,
    path: [
      { id: '14769732', name: 'Chodorowska Emilia' },
    ],
  },
  {
    id: '16982181',
    name: 'Garbicz Katarzyna',
    ordersCount: 6,
    totalPV: 1580.50, // OV
    pvStatus: 'normal',
    lastOrderDate: new Date('2026-01-20'),
    orderType: 'internet',
    sponsor: { id: '14769732', name: 'Chodorowska Emilia' },
    enroller: { id: '14769732', name: 'Chodorowska Emilia' },
    membershipType: 'WA',
    fastStart: { daysRemaining: null, status: 'none' },
    remainingPGVMonths: null,
    path: [
      { id: '14769732', name: 'Chodorowska Emilia' },
    ],
  },
  {
    id: '17114570',
    name: 'Kluj Aneta',
    ordersCount: 9,
    totalPV: 2100.00, // OV
    pvStatus: 'normal',
    lastOrderDate: new Date('2026-01-17'),
    orderType: 'lrp',
    sponsor: { id: '14769732', name: 'Chodorowska Emilia' },
    enroller: { id: '14769732', name: 'Chodorowska Emilia' },
    membershipType: 'WA',
    fastStart: { daysRemaining: null, status: 'none' },
    remainingPGVMonths: null,
    path: [
      { id: '14769732', name: 'Chodorowska Emilia' },
    ],
  },
  {
    id: '18537528',
    name: 'Frączek Jerzy',
    ordersCount: 11,
    totalPV: 2950.50, // OV
    pvStatus: 'success',
    lastOrderDate: new Date('2026-01-15'),
    orderType: 'internet',
    sponsor: { id: '14769732', name: 'Chodorowska Emilia' },
    enroller: { id: '14769732', name: 'Chodorowska Emilia' },
    membershipType: 'WA',
    fastStart: { daysRemaining: 31, status: 'expiring' },
    remainingPGVMonths: 12,
    path: [
      { id: '14769732', name: 'Chodorowska Emilia' },
    ],
  },
  {
    id: '17703928',
    name: 'Szypłowska Gabriela',
    ordersCount: 4,
    totalPV: 1050.00, // OV
    pvStatus: 'normal',
    lastOrderDate: new Date('2026-01-15'),
    orderType: 'lrp',
    sponsor: { id: '14769732', name: 'Chodorowska Emilia' },
    enroller: { id: '14769732', name: 'Chodorowska Emilia' },
    membershipType: 'WA',
    fastStart: { daysRemaining: null, status: 'none' },
    remainingPGVMonths: 4,
    path: [
      { id: '14769732', name: 'Chodorowska Emilia' },
    ],
  },
  {
    id: '18438681',
    name: 'Janus Dominika',
    ordersCount: 7,
    totalPV: 1720.50, // OV
    pvStatus: 'normal',
    lastOrderDate: new Date('2026-01-14'),
    orderType: 'internet',
    sponsor: { id: '14769732', name: 'Chodorowska Emilia' },
    enroller: { id: '14769732', name: 'Chodorowska Emilia' },
    membershipType: 'WA',
    fastStart: { daysRemaining: null, status: 'none' },
    remainingPGVMonths: 11,
    path: [
      { id: '14769732', name: 'Chodorowska Emilia' },
    ],
  },
  {
    id: '15341016',
    name: 'Śledziewska Marta',
    ordersCount: 10,
    totalPV: 2340.00, // OV
    pvStatus: 'normal',
    lastOrderDate: new Date('2026-01-14'),
    orderType: 'lrp',
    sponsor: { id: '14769732', name: 'Chodorowska Emilia' },
    enroller: { id: '14769732', name: 'Chodorowska Emilia' },
    membershipType: 'WA',
    fastStart: { daysRemaining: null, status: 'none' },
    remainingPGVMonths: null,
    path: [
      { id: '14769732', name: 'Chodorowska Emilia' },
    ],
  },
  {
    id: '18567890',
    name: 'Flisak Monika',
    ordersCount: 3,
    totalPV: 1380.00, // OV
    pvStatus: 'normal',
    lastOrderDate: new Date('2026-01-14'),
    orderType: 'lrp',
    sponsor: { id: '14769732', name: 'Chodorowska Emilia' },
    enroller: { id: '14769732', name: 'Chodorowska Emilia' },
    membershipType: 'WA',
    fastStart: { daysRemaining: null, status: 'none' },
    remainingPGVMonths: null,
    path: [
      { id: '14769732', name: 'Chodorowska Emilia' },
    ],
  },
]

export const filterTabs: FilterTab[] = [
  { key: 'paid', label: 'Opłacone' },
  { key: 'all', label: 'Cała struktura' },
  { key: 'pgv', label: 'PGV' },
  { key: 'cluster', label: 'Klaster' },
  { key: 'frontline', label: 'Pierwsza Linia' },
  { key: 'personally', label: 'Zapisani osobiście' },
  { key: 'newMembers', label: 'Nowi członkowie' },
]

// Dane do wykresu statystyk miesięcznych (OV i Team LRP)
export const monthlyStatsData = [
  { month: 'Lut', ov: 3200, teamLrp: 2400 },
  { month: 'Mar', ov: 3850, teamLrp: 2900 },
  { month: 'Kwi', ov: 4100, teamLrp: 3100 },
  { month: 'Maj', ov: 3600, teamLrp: 2700 },
  { month: 'Cze', ov: 4500, teamLrp: 3400 },
  { month: 'Lip', ov: 4200, teamLrp: 3200 },
  { month: 'Sie', ov: 3900, teamLrp: 2950 },
  { month: 'Wrz', ov: 4800, teamLrp: 3600 },
  { month: 'Paź', ov: 5100, teamLrp: 3850 },
  { month: 'Lis', ov: 5400, teamLrp: 4100 },
  { month: 'Gru', ov: 5200, teamLrp: 3950 },
  { month: 'Sty', ov: 5561, teamLrp: 4189 },
]
