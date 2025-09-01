"use client"

import { useState } from "react"
import { Plus, Search, Filter, Star, Phone, Mail, MapPin, Award, Trash2 } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SubcontractorFormModal } from "@/components/subcontractors/subcontractor-form-modal"

// Mock data pour remplacer getSubcontractors()
const mockSubcontractors = [
  {
    id: 1,
    name: "Jean Dupont",
    company: "Plomberie Dupont",
    specialties: ["plomberie", "chauffage"],
    averageRating: 4.8,
    phone: "01 23 45 67 89",
    email: "jean@plomberie-dupont.fr",
    address: "123 Rue de la Paix, Paris",
    status: "actif",
    completedProjects: 45,
    evaluations: [
      { id: 1, rating: 5, comment: "Excellent travail" },
      { id: 2, rating: 4, comment: "Très professionnel" },
    ],
  },
  {
    id: 2,
    name: "Marie Martin",
    company: "Électricité Martin",
    specialties: ["electricite", "domotique"],
    averageRating: 4.2,
    phone: "01 98 76 54 32",
    email: "marie@elec-martin.fr",
    address: "456 Avenue Victor Hugo, Lyon",
    status: "actif",
    completedProjects: 32,
    evaluations: [
      { id: 1, rating: 4, comment: "Bon travail" },
      { id: 2, rating: 4, comment: "Respecte les délais" },
    ],
  },
  {
    id: 3,
    name: "Pierre Leroy",
    company: "Peinture Leroy",
    specialties: ["peinture", "decoration"],
    averageRating: 3.9,
    phone: "01 11 22 33 44",
    email: "pierre@peinture-leroy.fr",
    address: "789 Boulevard Saint-Germain, Marseille",
    status: "actif",
    completedProjects: 28,
    evaluations: [{ id: 1, rating: 4, comment: "Travail soigné" }],
  },
]

export default function SubcontractorsPage() {
  const [subcontractors, setSubcontractors] = useState(mockSubcontractors)
  const [searchTerm, setSearchTerm] = useState("")
  const [specialtyFilter, setSpecialtyFilter] = useState("all")
  const [ratingFilter, setRatingFilter] = useState("all")
  const [isSubcontractorFormOpen, setIsSubcontractorFormOpen] = useState(false)

  const specialtyLabels: Record<string, string> = {
    plomberie: "Plomberie",
    electricite: "Électricité",
    peinture: "Peinture",
    carrelage: "Carrelage",
    menuiserie: "Menuiserie",
    maconnerie: "Maçonnerie",
    couverture: "Couverture",
    isolation: "Isolation",
    chauffage: "Chauffage",
    climatisation: "Climatisation",
    domotique: "Domotique",
    decoration: "Décoration",
  }

  const filteredSubcontractors = subcontractors.filter((sub) => {
    const matchesSearch =
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.company.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSpecialty = specialtyFilter === "all" || sub.specialties.includes(specialtyFilter)

    let matchesRating = true
    if (ratingFilter === "5") {
      matchesRating = sub.averageRating >= 4.5
    } else if (ratingFilter === "4") {
      matchesRating = sub.averageRating >= 3.5 && sub.averageRating < 4.5
    } else if (ratingFilter === "3") {
      matchesRating = sub.averageRating >= 2.5 && sub.averageRating < 3.5
    } else if (ratingFilter === "low") {
      matchesRating = sub.averageRating < 2.5
    }

    return matchesSearch && matchesSpecialty && matchesRating
  })

  const allSpecialties = Array.from(new Set(subcontractors.flatMap((sub) => sub.specialties)))

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 1; i <= 5; i++) {
      const isFull = i <= fullStars
      const isHalf = i === fullStars + 1 && hasHalfStar
      const starLabel = i === 1 ? "1 star" : `${i} stars`

      stars.push(
        <Star
          key={i}
          className={isFull || isHalf ? "h-4 w-4 text-yellow-400 fill-current" : "h-4 w-4 text-gray-300"}
          aria-label={starLabel}
        />,
      )
    }

    return (
      <div className="flex items-center" role="img" aria-label={`Rating: ${rating.toFixed(1)} out of 5 stars`}>
        {stars}
        <span className="ml-1 text-sm text-gray-500">({rating.toFixed(1)})</span>
      </div>
    )
  }

  const getSpecialtyLabel = (specialty: string) => {
    return specialtyLabels[specialty] || specialty.charAt(0).toUpperCase() + specialty.slice(1)
  }

  const averageRating =
    subcontractors.length > 0
      ? (subcontractors.reduce((acc, s) => acc + s.averageRating, 0) / subcontractors.length).toFixed(1)
      : "0.0"

  const handleCreateSubcontractor = (subcontractorData: any) => {
    const newSubcontractor = {
      ...subcontractorData,
      id: Date.now(),
      status: "actif",
      completedProjects: 0,
      evaluations: [],
    }
    setSubcontractors([...subcontractors, newSubcontractor])
  }

  const handleDeleteSubcontractor = (subcontractorId: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce sous-traitant ?")) {
      setSubcontractors(subcontractors.filter((sub) => sub.id !== subcontractorId))
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sous-traitants</h1>
            <p className="text-gray-600">Gérez vos partenaires et leurs évaluations</p>
          </div>
          <Button onClick={() => setIsSubcontractorFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un sous-traitant
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
              <Award className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{subcontractors.length}</div>
              <p className="text-xs text-gray-500">sous-traitants actifs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Excellents</CardTitle>
              <Star className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {subcontractors.filter((s) => s.averageRating >= 4.5).length}
              </div>
              <p className="text-xs text-gray-500">note ≥ 4.5/5</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Spécialités</CardTitle>
              <MapPin className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{allSpecialties.length}</div>
              <p className="text-xs text-gray-500">domaines couverts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Note moyenne</CardTitle>
              <Star className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{averageRating}</div>
              <p className="text-xs text-gray-500">sur 5 étoiles</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher par nom ou entreprise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="w-full sm:w-48">
            <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
              <SelectTrigger className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Spécialité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes spécialités</SelectItem>
                {allSpecialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {getSpecialtyLabel(specialty)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-40">
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-full">
                <Star className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Note" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes notes</SelectItem>
                <SelectItem value="5">Excellent (4.5+)</SelectItem>
                <SelectItem value="4">Très bon (3.5-4.4)</SelectItem>
                <SelectItem value="3">Bon (2.5-3.4)</SelectItem>
                <SelectItem value="low">À améliorer (moins de 2.5)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Subcontractors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubcontractors.map((subcontractor) => (
            <Card
              key={subcontractor.id}
              className="hover:shadow-md hover:border-green-500/30 transition-all duration-200"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-gray-900">{subcontractor.name}</CardTitle>
                    <p className="text-sm text-gray-500">{subcontractor.company}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {subcontractor.status === "actif" ? "Actif" : subcontractor.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSubcontractor(subcontractor.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Rating */}
                {renderStars(subcontractor.averageRating)}

                {/* Specialties */}
                <div className="flex flex-wrap gap-1">
                  {subcontractor.specialties.slice(0, 3).map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="text-xs">
                      {getSpecialtyLabel(specialty)}
                    </Badge>
                  ))}
                  {subcontractor.specialties.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{subcontractor.specialties.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Contact Info */}
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{subcontractor.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{subcontractor.email}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{subcontractor.address}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                  <span className="text-gray-500">{subcontractor.completedProjects} projets</span>
                  <span className="text-gray-500">{subcontractor.evaluations.length} évaluations</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredSubcontractors.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-gray-500 text-lg">Aucun sous-traitant trouvé</p>
            <p className="text-gray-400 text-sm">Essayez de modifier vos critères de recherche</p>
          </div>
        )}
      </div>

      {/* Subcontractor Form Modal */}
      <SubcontractorFormModal
        isOpen={isSubcontractorFormOpen}
        onClose={() => setIsSubcontractorFormOpen(false)}
        onSubmit={handleCreateSubcontractor}
      />
    </DashboardLayout>
  )
}
