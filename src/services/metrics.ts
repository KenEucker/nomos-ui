import { withLatency } from "./mock"

export const getDailyMetric = async () => {
  const today = new Date()
  const data = Array.from({ length: 14 }).map((_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (13 - index))
    return {
      date: date.toISOString(),
      value: 20 + Math.round(Math.sin(index / 2) * 12 + index * 1.5),
    }
  })

  return withLatency(data)
}
