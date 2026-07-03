import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export interface VIAResult {
  coverage: number
  sharpnessMedianWidth: number
  eligibleUsers: number
  usersInBand: number
  segmentedByUsage?: {
    low: { coverage: number; sharpness: number; n: number }
    medium: { coverage: number; sharpness: number; n: number }
    high: { coverage: number; sharpness: number; n: number }
  }
}

export interface CalibrationReport {
  examName: string
  sessionLabel: string
  examDate: string
  freezeDate: string
  resultsDate: string | null
  via: VIAResult
  publishedAt: string | null
}

function median(numbers: number[]): number {
  if (numbers.length === 0) return 0
  const sorted = [...numbers].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

type Bucket = 'low' | 'medium' | 'high'

function classifyUsage(sessions: number): Bucket {
  if (sessions <= 50) return 'low'
  if (sessions <= 100) return 'medium'
  return 'high'
}

export async function freezePredictions(
  supabase: SupabaseClient<Database>,
  examName: string,
  _examDate: string,
): Promise<{ totalFrozen: number; activeUsersEligible: number }> {
  const { data: rows, error: err } = await supabase
    .from('sessions')
    .select('user_id')
    .eq('session_intent', 'tracked')
  if (err) throw err
  const counts = new Map<string, number>()
  for (const r of rows ?? []) counts.set(r.user_id, (counts.get(r.user_id) ?? 0) + 1)
  const eligibleIds = Array.from(counts.entries())
    .filter(([, c]) => c >= 20)
    .map(([uid]) => uid)
  const { data: profiles, error: perr } = await supabase
    .from('exam_profiles')
    .select('profile_id')
    .eq('exam_name', examName)
  if (perr) throw perr
  const profileIds = (profiles ?? []).map((p) => p.profile_id)
  if (eligibleIds.length === 0 || profileIds.length === 0) {
    return { totalFrozen: 0, activeUsersEligible: eligibleIds.length }
  }
  const { count: frozenCount, error: cerr } = await supabase
    .from('predictions')
    .select('*', { count: 'exact', head: true })
    .in('user_id', eligibleIds)
    .in('exam_profile_id', profileIds)
    .is('is_frozen', false)
    .not('band_lower', 'is', null)
    .not('band_upper', 'is', null)
  if (cerr) throw cerr
  if (frozenCount && frozenCount > 0) {
    const { error: uerr } = await supabase
      .from('predictions')
      .update({
        is_frozen: true,
        frozen_at: new Date().toISOString(),
        calibration_source: examName,
      })
      .in('user_id', eligibleIds)
      .in('exam_profile_id', profileIds)
      .is('is_frozen', false)
      .not('band_lower', 'is', null)
      .not('band_upper', 'is', null)
    if (uerr) throw uerr
  }
  return { totalFrozen: frozenCount ?? 0, activeUsersEligible: eligibleIds.length }
}

export async function createCalibrationSnapshot(
  supabase: SupabaseClient<Database>,
  p: {
    examName: string; sessionLabel: string; examDate: string; freezeDate: string
    totalUsersFrozen: number; activeUsersEligible: number
  },
): Promise<string> {
  const { data, error } = await supabase
    .from('calibration_snapshots')
    .insert({
      exam_name: p.examName, session_label: p.sessionLabel,
      exam_date: p.examDate, freeze_date: p.freezeDate,
      total_users_frozen: p.totalUsersFrozen,
      active_users_eligible: p.activeUsersEligible,
      coverage: null, sharpness_median_width: null,
      coverage_segmented: null, report_json: null,
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

export async function captureActualResult(
  supabase: SupabaseClient<Database>,
  p: {
    userId: string; predictionId: string; examName: string; sessionLabel: string
    actualPercentile: number; actualMarks?: number
    subjectBreakdown?: Record<string, number>
  },
): Promise<string> {
  const { data, error } = await supabase
    .from('actual_results')
    .upsert(
      {
        user_id: p.userId, prediction_id: p.predictionId,
        exam_name: p.examName, session_label: p.sessionLabel,
        actual_percentile: p.actualPercentile,
        actual_marks: p.actualMarks ?? null,
        subject_breakdown: p.subjectBreakdown ?? null,
        opted_in: true,
      },
      { onConflict: 'prediction_id' },
    )
    .select('prediction_id')
    .single()
  if (error) throw error
  return data.prediction_id!
}

export async function computeVIA(
  supabase: SupabaseClient<Database>,
  examName: string,
  _sessionLabel: string,
): Promise<VIAResult> {
  const { data: rows, error } = await supabase
    .from('predictions')
    .select(
      `id, user_id, band_lower, band_upper, sessions_used,
       actual_results!inner(actual_percentile)`,
    )
    .eq('is_frozen', true)
    .eq('calibration_source', examName)
    .not('band_lower', 'is', null)
    .not('band_upper', 'is', null)
  if (error) throw error

  type FR = {
    id: string; user_id: string; band_lower: number; band_upper: number
    sessions_used: number; actual_results: Array<{ actual_percentile: number }>
  }
  const matched = ((rows ?? []) as FR[]).filter(
    (r) => r.actual_results.length > 0 && r.sessions_used >= 20,
  )
  if (matched.length === 0) {
    return { coverage: 0, sharpnessMedianWidth: 0, eligibleUsers: 0, usersInBand: 0 }
  }

  const widths: number[] = []
  let inBand = 0
  type S = { inBand: number; widths: number[]; total: number }
  const segs: Record<Bucket, S> = {
    low: { inBand: 0, widths: [], total: 0 },
    medium: { inBand: 0, widths: [], total: 0 },
    high: { inBand: 0, widths: [], total: 0 },
  }
  for (const row of matched) {
    const actual = row.actual_results[0].actual_percentile
    const w = row.band_upper - row.band_lower
    const hit = actual >= row.band_lower && actual <= row.band_upper
    widths.push(w)
    if (hit) inBand++
    const b = classifyUsage(row.sessions_used)
    segs[b].total++
    segs[b].widths.push(w)
    if (hit) segs[b].inBand++
  }
  const mk = (s: S) => ({
    coverage: s.total > 0 ? s.inBand / s.total : 0,
    sharpness: median(s.widths),
    n: s.total,
  })
  return {
    coverage: inBand / matched.length,
    sharpnessMedianWidth: median(widths),
    eligibleUsers: matched.length,
    usersInBand: inBand,
    segmentedByUsage: { low: mk(segs.low), medium: mk(segs.medium), high: mk(segs.high) },
  }
}

export async function publishCalibrationReport(
  supabase: SupabaseClient<Database>,
  snapshotId: string,
): Promise<CalibrationReport> {
  const { data: snap, error: ferr } = await supabase
    .from('calibration_snapshots')
    .select('*')
    .eq('id', snapshotId)
    .single()
  if (ferr || !snap) throw ferr ?? new Error('Snapshot not found')

  const via = await computeVIA(supabase, snap.exam_name, snap.session_label)
  const summary =
    `${(via.coverage * 100).toFixed(0)}% coverage at median width of ` +
    `${via.sharpnessMedianWidth.toFixed(1)} percentile points (n=${via.eligibleUsers})`
  const now = new Date().toISOString()

  const { error: uerr } = await supabase
    .from('calibration_snapshots')
    .update({
      coverage: via.coverage,
      sharpness_median_width: via.sharpnessMedianWidth,
      coverage_segmented: via.segmentedByUsage ?? null,
      report_json: {
        ...via, summary, examName: snap.exam_name, sessionLabel: snap.session_label,
      },
      results_date: now,
    })
    .eq('id', snapshotId)
  if (uerr) throw uerr

  return {
    examName: snap.exam_name, sessionLabel: snap.session_label,
    examDate: snap.exam_date, freezeDate: snap.freeze_date,
    resultsDate: now, via, publishedAt: now,
  }
}

export async function runCalibrationCycle(
  supabase: SupabaseClient<Database>,
  params: { examName: string; sessionLabel: string; examDate: string },
): Promise<{ snapshotId: string; totalFrozen: number; eligibleUsers: number }> {
  const freezeDate = new Date().toISOString()
  const frozen = await freezePredictions(supabase, params.examName, params.examDate)
  const snapshotId = await createCalibrationSnapshot(supabase, {
    examName: params.examName, sessionLabel: params.sessionLabel,
    examDate: params.examDate, freezeDate,
    totalUsersFrozen: frozen.totalFrozen,
    activeUsersEligible: frozen.activeUsersEligible,
  })
  return {
    snapshotId,
    totalFrozen: frozen.totalFrozen,
    eligibleUsers: frozen.activeUsersEligible,
  }
}
