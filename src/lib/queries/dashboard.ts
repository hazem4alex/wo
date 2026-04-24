import { pool } from '@/lib/db'

export interface DashboardStats {
  totalRevenue: number
  pendingCount: number
  completedCount: number
  totalOrders: number
  totalConsumers: number
  previousRevenue: number
  previousOrders: number
}

export interface RevenueTrend {
  date: string
  revenue: number
  orders: number
}

export interface OrdersByStatus {
  status: string
  count: number
}

export interface TopService {
  name_ar: string
  usage_count: number
  total_revenue: number
}

export interface TopSupervisor {
  full_name: string
  total_orders: number
  pending: number
  total_revenue: number
}

export interface ConsumersByGovernorate {
  name_ar: string
  count: number
}

export interface OrdersByArea {
  name_ar: string
  count: number
}

export interface RecentOrder {
  id: string
  work_order_no: string
  consumer_name: string
  supervisor_name: string
  status: string
  net_amount: string
  date: string
}

export async function getDashboardStats(from: Date, to: Date): Promise<DashboardStats> {
  const prevFrom = new Date(from)
  const prevTo = new Date(to)
  const diff = to.getTime() - from.getTime()
  prevFrom.setTime(prevFrom.getTime() - diff)
  prevTo.setTime(prevTo.getTime() - diff)

  const [current, previous, consumers] = await Promise.all([
    pool.query(`
      SELECT
        COALESCE(SUM(net_amount), 0) as total_revenue,
        COUNT(*) as total_orders,
        COUNT(*) FILTER (WHERE status = 'open') as pending_count,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_count
      FROM work_order
      WHERE created_at BETWEEN $1 AND $2
    `, [from, to]),
    pool.query(`
      SELECT COALESCE(SUM(net_amount), 0) as total_revenue, COUNT(*) as total_orders
      FROM work_order WHERE created_at BETWEEN $1 AND $2
    `, [prevFrom, prevTo]),
    pool.query('SELECT COUNT(*) as count FROM consumer WHERE is_active = true'),
  ])

  const c = current.rows[0]
  const p = previous.rows[0]
  return {
    totalRevenue: Number(c.total_revenue),
    pendingCount: Number(c.pending_count),
    completedCount: Number(c.completed_count),
    totalOrders: Number(c.total_orders),
    totalConsumers: Number(consumers.rows[0].count),
    previousRevenue: Number(p.total_revenue),
    previousOrders: Number(p.total_orders),
  }
}

export async function getRevenueTrend(from: Date, to: Date): Promise<RevenueTrend[]> {
  const result = await pool.query(`
    SELECT
      TO_CHAR(DATE_TRUNC('day', created_at AT TIME ZONE 'Asia/Kuwait'), 'YYYY-MM-DD') as date,
      COALESCE(SUM(net_amount), 0) as revenue,
      COUNT(*) as orders
    FROM work_order
    WHERE created_at BETWEEN $1 AND $2
    GROUP BY DATE_TRUNC('day', created_at AT TIME ZONE 'Asia/Kuwait')
    ORDER BY date
  `, [from, to])
  return result.rows.map(r => ({ date: r.date, revenue: Number(r.revenue), orders: Number(r.orders) }))
}

export async function getOrdersByStatus(from: Date, to: Date): Promise<OrdersByStatus[]> {
  const result = await pool.query(`
    SELECT status, COUNT(*) as count
    FROM work_order WHERE created_at BETWEEN $1 AND $2
    GROUP BY status
  `, [from, to])
  return result.rows.map(r => ({ status: r.status, count: Number(r.count) }))
}

export async function getTopServices(from: Date, to: Date): Promise<TopService[]> {
  const result = await pool.query(`
    SELECT
      wi.service_name_ar as name_ar,
      COUNT(wi.id) as usage_count,
      COALESCE(SUM(wi.total_amount), 0) as total_revenue
    FROM work_order_item wi
    JOIN work_order wo ON wi.work_order_id = wo.id
    WHERE wo.created_at BETWEEN $1 AND $2
    GROUP BY wi.service_name_ar
    ORDER BY usage_count DESC
    LIMIT 5
  `, [from, to])
  return result.rows.map(r => ({ name_ar: r.name_ar, usage_count: Number(r.usage_count), total_revenue: Number(r.total_revenue) }))
}

export async function getTopSupervisors(from: Date, to: Date): Promise<TopSupervisor[]> {
  const result = await pool.query(`
    SELECT
      s.full_name,
      COUNT(wo.id) as total_orders,
      COUNT(wo.id) FILTER (WHERE wo.status = 'open') as pending,
      COALESCE(SUM(wo.net_amount), 0) as total_revenue
    FROM supervisor s
    LEFT JOIN work_order wo ON wo.supervisor_id = s.id AND wo.created_at BETWEEN $1 AND $2
    GROUP BY s.id, s.full_name
    HAVING COUNT(wo.id) > 0
    ORDER BY total_orders DESC
    LIMIT 5
  `, [from, to])
  return result.rows.map(r => ({ full_name: r.full_name, total_orders: Number(r.total_orders), pending: Number(r.pending), total_revenue: Number(r.total_revenue) }))
}

export async function getConsumersByGovernorate(): Promise<ConsumersByGovernorate[]> {
  const result = await pool.query(`
    SELECT g.name_ar, COUNT(c.id) as count
    FROM governorate g
    LEFT JOIN area a ON a.governorate_id = g.id
    LEFT JOIN consumer c ON c.area_id = a.id AND c.is_active = true
    GROUP BY g.id, g.name_ar
    HAVING COUNT(c.id) > 0
    ORDER BY count DESC
  `)
  return result.rows.map(r => ({ name_ar: r.name_ar, count: Number(r.count) }))
}

export async function getOrdersByArea(from: Date, to: Date): Promise<OrdersByArea[]> {
  const result = await pool.query(`
    SELECT a.name_ar, COUNT(wo.id) as count
    FROM area a
    LEFT JOIN work_order wo ON wo.area_id = a.id AND wo.created_at BETWEEN $1 AND $2
    GROUP BY a.id, a.name_ar
    HAVING COUNT(wo.id) > 0
    ORDER BY count DESC
    LIMIT 8
  `, [from, to])
  return result.rows.map(r => ({ name_ar: r.name_ar, count: Number(r.count) }))
}

export async function getRecentOrders(): Promise<RecentOrder[]> {
  const result = await pool.query(`
    SELECT wo.id, wo.work_order_no, wo.status, wo.net_amount,
           c.full_name as consumer_name, s.full_name as supervisor_name,
           TO_CHAR(wo.created_at AT TIME ZONE 'Asia/Kuwait', 'YYYY-MM-DD') as date
    FROM work_order wo
    LEFT JOIN consumer c ON wo.consumer_id = c.id
    LEFT JOIN supervisor s ON wo.supervisor_id = s.id
    ORDER BY wo.created_at DESC
    LIMIT 10
  `)
  return result.rows
}
