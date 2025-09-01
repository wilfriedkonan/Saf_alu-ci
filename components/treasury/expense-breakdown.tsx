"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getExpenseCategories } from "@/lib/treasury"

export function ExpenseBreakdown() {
  const categories = getExpenseCategories()

  const pieData = categories.map((cat) => ({
    name: cat.name,
    value: cat.spent,
    color: cat.color,
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition des dépenses</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value.toLocaleString()} €`} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Budget Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Suivi des budgets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {categories.map((category) => {
            const percentage = category.budget ? (category.spent / category.budget) * 100 : 0
            const isOverBudget = percentage > 100

            return (
              <div key={category.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {category.spent.toLocaleString()} € / {category.budget?.toLocaleString() || "N/A"} €
                  </span>
                </div>
                <Progress value={Math.min(percentage, 100)} className={`h-2 ${isOverBudget ? "bg-red-100" : ""}`} />
                {isOverBudget && (
                  <p className="text-xs text-red-600">Dépassement de {(percentage - 100).toFixed(1)}%</p>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
