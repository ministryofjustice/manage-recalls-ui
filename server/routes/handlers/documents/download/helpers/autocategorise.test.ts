import { autocategoriseDocFileName } from './autocategorise'
import { documentCategories } from '../../documentCategories'
import { replaceSpaces } from '../../../helpers'

const docCategoriesWithPatterns = documentCategories.filter(cat => cat.fileNamePatterns)

describe('autocategoriseDocFileName', () => {
  it('should match the default patterns for each category', () => {
    docCategoriesWithPatterns.forEach(cat => {
      cat.fileNamePatterns.forEach(pattern => {
        const fileName = `${pattern} person name.pdf`
        expect(autocategoriseDocFileName(fileName).name).toEqual(cat.name)
      })
    })
  })

  it('should match hyphenated patterns for each category', () => {
    docCategoriesWithPatterns.forEach(cat => {
      cat.fileNamePatterns.forEach(pattern => {
        const fileName = replaceSpaces(`firstname lastname ${pattern}.pdf`, '-')
        expect(autocategoriseDocFileName(fileName).name).toEqual(cat.name)
      })
    })
  })

  it('should match uppercase patterns for each category', () => {
    docCategoriesWithPatterns.forEach(cat => {
      cat.fileNamePatterns.forEach(pattern => {
        const fileName = `${pattern}-doc.pdf`.toUpperCase()
        expect(autocategoriseDocFileName(fileName).name).toEqual(cat.name)
      })
    })
  })

  it('should match underscored patterns for each category', () => {
    docCategoriesWithPatterns.forEach(cat => {
      cat.fileNamePatterns.forEach(pattern => {
        const fileName = replaceSpaces(`${pattern}.pdf`, '_')
        expect(autocategoriseDocFileName(fileName).name).toEqual(cat.name)
      })
    })
  })

  it('should match no-spaces patterns for each category', () => {
    docCategoriesWithPatterns.forEach(cat => {
      cat.fileNamePatterns.forEach(pattern => {
        const fileName = replaceSpaces(`${pattern}.pdf`, '')
        expect(autocategoriseDocFileName(fileName).name).toEqual(cat.name)
      })
    })
  })
})
