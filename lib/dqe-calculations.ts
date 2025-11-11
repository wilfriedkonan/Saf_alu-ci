/**
 * Helper functions for calculating stage durations and dates from DQE lots
 */

export interface DQELotInput {
    id: string | number
    totalAmount: number
  }
  
  export interface StageDuration {
    lotId: string | number
    durationDays: number
  }
  
  export interface StageDate {
    lotId: string | number
    startDate: string // ISO 8601 format
    endDate: string // ISO 8601 format
  }
  
  /**
   * Calculate the duration in days for each stage based on DQE lot amounts
   *
   * @param lots - Array of lots with id and total amount
   * @param totalDurationDays - Total project duration in days
   * @param method - Calculation method: "proportional" (based on budget) or "equal" (same duration for all)
   * @returns Array of stage durations with minimum 5 days per stage
   *
   * @example
   * const lots = [
   *   {id: 1, totalAmount: 850000},
   *   {id: 2, totalAmount: 15000000}
   * ];
   * const durations = calculateStageDurations(lots, 120, "proportional");
   * // Returns: [{lotId: 1, durationDays: 5}, {lotId: 2, durationDays: 115}]
   */
  export function calculateStageDurations(
    lots: DQELotInput[],
    totalDurationDays: number,
    method: "proportional" | "equal",
  ): StageDuration[] {
    if (lots.length === 0) return []
  
    if (method === "equal") {
      // Equal distribution: divide total duration by number of lots
      const durationPerLot = Math.max(5, Math.round(totalDurationDays / lots.length))
      return lots.map((lot) => ({
        lotId: lot.id,
        durationDays: durationPerLot,
      }))
    }
  
    // Proportional method: duration based on budget percentage
    const totalAmount = lots.reduce((sum, lot) => sum + lot.totalAmount, 0)
  
    if (totalAmount === 0) {
      // Fallback to equal distribution if total is 0
      const durationPerLot = Math.max(5, Math.round(totalDurationDays / lots.length))
      return lots.map((lot) => ({
        lotId: lot.id,
        durationDays: durationPerLot,
      }))
    }
  
    // Calculate proportional durations
    const durations = lots.map((lot) => {
      const proportion = lot.totalAmount / totalAmount
      const calculatedDuration = Math.round(proportion * totalDurationDays)
      // Ensure minimum 5 days per stage
      return {
        lotId: lot.id,
        durationDays: Math.max(5, calculatedDuration),
      }
    })
  
    // Adjust total to match exactly totalDurationDays
    const currentTotal = durations.reduce((sum, d) => sum + d.durationDays, 0)
    const difference = totalDurationDays - currentTotal
  
    if (difference !== 0) {
      // Find the largest stage to adjust (most likely to absorb the difference)
      const largestStageIndex = durations.reduce(
        (maxIdx, curr, idx, arr) => (curr.durationDays > arr[maxIdx].durationDays ? idx : maxIdx),
        0,
      )
  
      // Adjust the largest stage, but keep minimum 5 days
      const newDuration = durations[largestStageIndex].durationDays + difference
      if (newDuration >= 5) {
        durations[largestStageIndex].durationDays = newDuration
      }
    }
  
    return durations
  }
  
  /**
   * Calculate start and end dates for each stage based on durations
   * Stages are sequential (no parallel execution)
   *
   * @param stages - Array of stage durations
   * @param projectStartDate - Project start date
   * @returns Array of stages with start and end dates in ISO 8601 format
   *
   * @example
   * const durations = [{lotId: 1, durationDays: 5}, {lotId: 2, durationDays: 115}];
   * const dates = calculateStageDates(durations, new Date('2024-11-15'));
   * // Returns: [
   * //   {lotId: 1, startDate: '2024-11-15', endDate: '2024-11-19'},
   * //   {lotId: 2, startDate: '2024-11-20', endDate: '2025-03-14'}
   * // ]
   */
  export function calculateStageDates(stages: StageDuration[], projectStartDate: Date): StageDate[] {
    if (stages.length === 0) return []
  
    const results: StageDate[] = []
    let currentDate = new Date(projectStartDate)
  
    for (const stage of stages) {
      const startDate = new Date(currentDate)
  
      // Calculate end date (duration - 1 because start day counts as day 1)
      const endDate = new Date(currentDate)
      endDate.setDate(endDate.getDate() + stage.durationDays - 1)
  
      results.push({
        lotId: stage.lotId,
        startDate: startDate.toISOString().split("T")[0], // Format: YYYY-MM-DD
        endDate: endDate.toISOString().split("T")[0],
      })
  
      // Next stage starts the day after current stage ends
      currentDate = new Date(endDate)
      currentDate.setDate(currentDate.getDate() + 1)
    }
  
    return results
  }
  
  /**
   * Helper function to format a date range for display
   *
   * @param startDate - Start date in ISO format
   * @param endDate - End date in ISO format
   * @returns Formatted date range string
   *
   * @example
   * formatDateRange('2024-11-15', '2024-11-19')
   * // Returns: "15/11/2024 - 19/11/2024"
   */
  export function formatDateRange(startDate: string, endDate: string): string {
    const formatDate = (isoDate: string) => {
      const [year, month, day] = isoDate.split("-")
      return `${day}/${month}/${year}`
    }
  
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }
  