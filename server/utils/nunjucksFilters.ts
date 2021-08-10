import { format, parseISO } from 'date-fns'

export function personOrPeopleFilter(count: number): string {
  if (count === 1) {
    return '1 person'
  }
  return `${count} people`
}

export function userNameFilter(fullName: string): string {
  if (!fullName) {
    return null
  }
  const nameParts = fullName.split(' ')
  if (nameParts.length === 1) {
    return fullName
  }
  return `${nameParts[0][0]}. ${nameParts.reverse()[0]}`
}

export function dateFilter(date: string) {
  return format(parseISO(date), 'd MMM yyyy')
}

export function dateTimeFilter(date: string) {
  return format(parseISO(date), "d MMM yyyy 'at' HH:mm")
}
