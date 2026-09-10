import { events } from '../models/events'

export const getFeaturedEvents = () => events.filter((event) => event.featured)

export const filterEvents = ({ query, location, category, showPast, sourceEvents = events }) => {
  const today = new Date('2026-09-09')
  const normalizedQuery = query.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
  const aliases = { concierto: 'musica', conciertos: 'musica', comida: 'gastronomia', arte: 'cultura', trekking: 'aire libre', gratis: 'entrada libre' }
  const searchTerms = normalizedQuery.split(/\s+/).filter(Boolean).map((term) => aliases[term] || term)
  return sourceEvents.filter((event) => {
    const matchesDate = showPast || new Date(event.date) >= today
    const matchesLocation = location === 'Todos' || event.location === location
    const matchesCategory = category === 'Todos' || event.category === category
    const searchable = `${event.title} ${event.category} ${event.location} ${event.keywords} ${event.price}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    const matchesSearch = searchTerms.every((term) => searchable.includes(term))
    return matchesDate && matchesLocation && matchesCategory && matchesSearch
  })
}