import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// ---- Types ----

export type ComebackStage = 'immediate' | 'delayed' | 'transfer'

export interface ComebackItem {
  id: string
  userId: string
  examProfileId: string
  skillDomain: string
  questionId: string
  difficultyTier: string
  stage: ComebackStage
  stageDeadline: Date | null
  explanationShown: boolean
  immediatePassed: boolean
  delayedPassed: boolean
  transferPassed: boolean
  cleared: boolean
  lostProjectedPoints: number
  originalSessionId: string | null
}

// ---- Helpers ----

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS

const STAGE_DEADLINES: Record<ComebackStage, number> = {
  immediate: HOUR_MS,
  delayed: 48 * HOUR_MS,
  transfer: 7 * DAY_MS,
}

const STAGE_RETRY_DELAYS: Record<ComebackStage, number> = {
  immediate: HOUR_MS,
  delayed: 24 * HOUR_MS,
  transfer: 5 * DAY_MS,
}

const STAGE_ADVANCE: Record<ComebackStage, ComebackStage | null> = {
  immediate: 'delayed',
  delayed: 'transfer',
  transfer: null,
}

const STAGE_ORDER: Record<ComebackStage, number> = {
  immediate: 0,
  delayed: 1,
  transfer: 2,
}

function deadlineFromNow(stage: ComebackStage): Date {
  return new Date(Date.now() + STAGE_DEADLINES[stage])
}

function retryDeadline(stage: ComebackStage): Date {
  return new Date(Date.now() + STAGE_RETRY_DELAYS[stage])
}

function computeLostPoints(examWeight?: number): number {
  if (examWeight !== undefined && examWeight > 0) {
    const raw = examWeight * 0.5
    return Math.round(raw * 100) / 100
  }
  return 0.3
}

function mapRow(row: Record<string, unknown>): ComebackItem {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    examProfileId: row.exam_profile_id as string,
    skillDomain: row.skill_domain as string,
    questionId: row.question_id as string,
    difficultyTier: row.difficulty_tier as string,
    stage: row.stage as ComebackStage,
    stageDeadline: row.stage_deadline ? new Date(row.stage_deadline as string) : null,
    explanationShown: (row.explanation_shown as boolean) ?? false,
    immediatePassed: (row.immediate_passed as boolean) ?? false,
    delayedPassed: (row.delayed_passed as boolean) ?? false,
    transferPassed: (row.transfer_passed as boolean) ?? false,
    cleared: (row.cleared as boolean) ?? false,
    lostProjectedPoints: row.lost_projected_points as number,
    originalSessionId: row.original_session_id as string | null,
  }
}

// ---- Core Functions ----

export async function enqueueComeback(
  supabase: SupabaseClient<Database>,
  params: {
    userId: string
    examProfileId: string
    skillDomain: string
    questionId: string
    difficultyTier: string
    originalSessionId: string
    examWeight?: number
  },
): Promise<string> {
  const lostProjectedPoints = computeLostPoints(params.examWeight)

  const { data, error } = await supabase
    .from('comeback_queue_items')
    .insert({
      user_id: params.userId,
      exam_profile_id: params.examProfileId,
      skill_domain: params.skillDomain,
      question_id: params.questionId,
      difficulty_tier: params.difficultyTier,
      stage: 'immediate',
      stage_deadline: deadlineFromNow('immediate').toISOString(),
      explanation_shown: false,
      immediate_passed: false,
      delayed_passed: false,
      transfer_passed: false,
      cleared: false,
      lost_projected_points: lostProjectedPoints,
      original_session_id: params.originalSessionId,
    })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

export async function showExplanation(
  supabase: SupabaseClient<Database>,
  queueItemId: string,
): Promise<void> {
  const { error } = await supabase
    .from('comeback_queue_items')
    .update({ explanation_shown: true })
    .eq('id', queueItemId)

  if (error) throw error
}

export async function recordRetryResult(
  supabase: SupabaseClient<Database>,
  queueItemId: string,
  passed: boolean,
): Promise<{
  advanced: boolean
  cleared: boolean
  newStage: ComebackStage
  newDeadline: Date
}> {
  const { data: current, error: fetchErr } = await supabase
    .from('comeback_queue_items')
    .select('stage')
    .eq('id', queueItemId)
    .single()

  if (fetchErr) throw fetchErr

  const currentStage = current.stage as ComebackStage

  if (passed) {
    const nextStage = STAGE_ADVANCE[currentStage]

    if (!nextStage) {
      // Transfer stage passed — fully clear the item
      const newDeadline = new Date()
      const { error } = await supabase
        .from('comeback_queue_items')
        .update({
          transfer_passed: true,
          cleared: true,
          stage_deadline: newDeadline.toISOString(),
        })
        .eq('id', queueItemId)

      if (error) throw error

      return {
        advanced: true,
        cleared: true,
        newStage: 'transfer',
        newDeadline,
      }
    }

    // Advance to next stage
    const newDeadline = deadlineFromNow(nextStage)
    const passedColumn =
      currentStage === 'immediate' ? 'immediate_passed' : 'delayed_passed'

    const updatePayload: Record<string, unknown> = {
      stage: nextStage,
      stage_deadline: newDeadline.toISOString(),
      explanation_shown: false,
    }
    updatePayload[passedColumn] = true

    const { error } = await supabase
      .from('comeback_queue_items')
      .update(updatePayload as any)
      .eq('id', queueItemId)

    if (error) throw error

    return {
      advanced: true,
      cleared: false,
      newStage: nextStage,
      newDeadline,
    }
  }

  // Failed — stay at current stage, reset deadline with retry delay
  const newDeadline = retryDeadline(currentStage)

  const { error } = await supabase
    .from('comeback_queue_items')
    .update({
      stage_deadline: newDeadline.toISOString(),
      explanation_shown: false,
    })
    .eq('id', queueItemId)

  if (error) throw error

  return {
    advanced: false,
    cleared: false,
    newStage: currentStage,
    newDeadline,
  }
}

export async function getDueComebacks(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<ComebackItem[]> {
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('comeback_queue_items')
    .select('*')
    .eq('user_id', userId)
    .eq('cleared', false)
    .lte('stage_deadline', now)
    .order('stage_deadline', { ascending: true })

  if (error) throw error

  const items = (data ?? []).map(mapRow)

  items.sort((a, b) => STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage])

  return items
}

export async function getComebackCounts(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ immediate: number; delayed: number; transfer: number; total: number }> {
  const { data, error } = await supabase
    .from('comeback_queue_items')
    .select('stage')
    .eq('user_id', userId)
    .eq('cleared', false)

  if (error) throw error

  const counts = { immediate: 0, delayed: 0, transfer: 0, total: 0 }

  for (const row of data ?? []) {
    const stage = row.stage as ComebackStage
    counts[stage]++
    counts.total++
  }

  return counts
}

export async function getRecoverablePoints(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<number> {
  const { data, error } = await supabase
    .from('comeback_queue_items')
    .select('lost_projected_points')
    .eq('user_id', userId)
    .eq('cleared', false)

  if (error) throw error

  let total = 0
  for (const row of data ?? []) {
    total += Number(row.lost_projected_points) || 0
  }

  return Math.round(total * 100) / 100
}
