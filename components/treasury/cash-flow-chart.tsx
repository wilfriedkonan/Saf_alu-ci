"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCashFlowData } from "@/lib/treasury"

export function CashFlowChart() {
  const data = getCashFlowData()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flux de trésorerie (6 derniers mois)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => [`${value.toLocaleString()} €`, ""]}
              labelFormatter={(label) => `Mois: ${label}`}
            />
            <Legend />
            <Bar dataKey="income" fill="#10b981" name="Recettes" />
            <Bar dataKey="expenses" fill="#ef4444" name="Dépenses" />
            <Bar dataKey="net" fill="#3b82f6" name="Résultat net" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
