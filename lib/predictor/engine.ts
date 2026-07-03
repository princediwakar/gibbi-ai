import { createClient } from '@/lib/supabase/server'
import {
  marksToPercentile,
  getBlendingWeight,
  getColdStartBand,
  blendBands,
  getColdStartDisclaimer,
  computeCompositePercentile,
} from './nta-priors'

interface SubjectBand {
  subject: string
  predictedPercentile: number
  bandLower: number
  bandUpper: number
  bandWidth: number
  sessionsUsed: number
  calibrationSource: string
  disclaimer: string
}

interface PredictionResult {
  overallPercentile: number
  overallBandLower: number
  overallBandUpper: number
  overallBandWidth: number
  subjects: SubjectBand[]
  totalTrackedSessions: number
  calibrationSource: string
  disclaimer: string
  frozenAt: string | null
  isFrozen: boolean
}

function calibrationLabel(weight: number): string {
  if (weight < 0.25) return 'public_nta'
  if (weight < 0.75) return 'blended'
  return 'proprietary'
}

export async function generatePrediction(
  userId: string,
  examProfileId: string,
): Promise<PredictionResult> {
  const supabase = await createClient()

  const { data: masteryRows } = await supabase
    .from('concept_mastery')
    .select('skill_domain, mastery_score')
    .eq('user_id', userId)
    .eq('exam_profile_id', examProfileId)

  const masteryByDomain: Record<string, number> = {}
  if (masteryRows) {
    for (const row of masteryRows) {
      masteryByDomain[row.skill_domain] = row.mastery_score
    }
  }

  const { data: weights } = await supabase
    .from('exam_topic_weights')
    .select('subject, skill_domain')
    .eq('exam_name', 'JEE Main')

  const subjectDomains: Record<string, string[]> = { Physics: [], Chemistry: [], Mathematics: [] }
  if (weights) {
    for (const w of weights) {
      if (subjectDomains[w.subject]) subjectDomains[w.subject].push(w.skill_domain)
    }
  }

  const { count: trackedCount } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('exam_profile_id', examProfileId)
    .eq('session_intent', 'tracked')

  const sessionsUsed = trackedCount ?? 0
  const blendWeight = getBlendingWeight(sessionsUsed)

  const subjectPercentiles: Record<string, number> = {}
  const subjects: SubjectBand[] = []

  for (const subject of ['Physics', 'Chemistry', 'Mathematics']) {
    const domains = subjectDomains[subject] ?? []
    let sumMastery = 0
    for (const d of domains) sumMastery += masteryByDomain[d] ?? 0.25
    const avgMastery = domains.length > 0 ? sumMastery / domains.length : 0.25
    const subjectMarks = avgMastery * 100

    const publicPercentile = marksToPercentile(subject, subjectMarks)
    const publicBand = getColdStartBand(subject, publicPercentile)
    const proprietaryPredicted = avgMastery * 100
    const proprietaryBand = {
      lower: Math.max(0, proprietaryPredicted - 3),
      upper: Math.min(100, proprietaryPredicted + 3),
    }

    const blended = blendBands(publicBand, proprietaryBand, blendWeight)
    const predictedPercentile =
      Math.round((publicPercentile * (1 - blendWeight) + proprietaryPredicted * blendWeight) * 100) / 100

    subjectPercentiles[subject] = predictedPercentile

    subjects.push({
      subject,
      predictedPercentile,
      bandLower: blended.lower,
      bandUpper: blended.upper,
      bandWidth: blended.width,
      sessionsUsed,
      calibrationSource: calibrationLabel(blendWeight),
      disclaimer: getColdStartDisclaimer(sessionsUsed),
    })
  }

  const overallPredicted = computeCompositePercentile(subjectPercentiles)
  const avgWidth = subjects.reduce((sum, s) => sum + s.bandWidth, 0) / subjects.length
  const overallLower = Math.round(Math.max(0, overallPredicted - avgWidth / 2) * 100) / 100
  const overallUpper = Math.round(Math.min(100, overallPredicted + avgWidth / 2) * 100) / 100

  const { data: frozen } = await supabase
    .from('predictions')
    .select('frozen_at, is_frozen')
    .eq('user_id', userId)
    .eq('is_frozen', true)
    .order('frozen_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return {
    overallPercentile: overallPredicted,
    overallBandLower: overallLower,
    overallBandUpper: overallUpper,
    overallBandWidth: Math.round(avgWidth * 100) / 100,
    subjects,
    totalTrackedSessions: sessionsUsed,
    calibrationSource: calibrationLabel(blendWeight),
    disclaimer: getColdStartDisclaimer(sessionsUsed),
    frozenAt: frozen?.frozen_at ?? null,
    isFrozen: frozen?.is_frozen ?? false,
  }
}
