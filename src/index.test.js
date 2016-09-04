import expect from 'expect.js'
import nested from './index'
import {create} from 'jss'

const noWarn = message => expect(message).to.be(undefined)

describe('jss-nested', () => {
  const jss = create().use(nested({warn: noWarn}))

  describe('nesting with space', () => {
    const sheet = jss.createStyleSheet({
      a: {
        float: 'left',
        '& b': {float: 'left'}
      }
    }, {named: false})

    it('should add rules', () => {
      expect(sheet.getRule('a')).to.not.be(undefined)
      expect(sheet.getRule('a b')).to.not.be(undefined)
    })

    it('should generate correct CSS', () => {
      expect(sheet.toString()).to.be(
        'a {\n' +
        '  float: left;\n' +
        '}\n' +
        'a b {\n' +
        '  float: left;\n' +
        '}'
      )
    })
  })

  describe('nesting without space', () => {
    const sheet = jss.createStyleSheet({
      a: {
        float: 'left',
        '&b': {float: 'left'}
      }
    }, {named: false})

    it('should add rules', () => {
      expect(sheet.getRule('a')).to.not.be(undefined)
      expect(sheet.getRule('ab')).to.not.be(undefined)
    })

    it('should generate correct CSS', () => {
      expect(sheet.toString()).to.be(
        'a {\n' +
        '  float: left;\n' +
        '}\n' +
        'ab {\n' +
        '  float: left;\n' +
        '}'
      )
    })
  })

  describe('multi nesting', () => {
    const sheet = jss.createStyleSheet({
      a: {
        float: 'left',
        '&b': {float: 'left'},
        '& c': {float: 'left'}
      }
    }, {named: false})

    it('should add rules', () => {
      expect(sheet.getRule('a')).to.not.be(undefined)
      expect(sheet.getRule('ab')).to.not.be(undefined)
      expect(sheet.getRule('a c')).to.not.be(undefined)
    })

    it('should generate correct CSS', () => {
      expect(sheet.toString()).to.be(
        'a {\n' +
        '  float: left;\n' +
        '}\n' +
        'ab {\n' +
        '  float: left;\n' +
        '}\n' +
        'a c {\n' +
        '  float: left;\n' +
        '}'
      )
    })
  })

  describe('multi nesting in one selector', () => {
    const sheet = jss.createStyleSheet({
      a: {
        float: 'left',
        '&b, &c': {float: 'left'}
      }
    }, {named: false})

    it('should add rules', () => {
      expect(sheet.getRule('a')).to.not.be(undefined)
      expect(sheet.getRule('ab, ac')).to.not.be(undefined)
    })

    it('should generate correct CSS', () => {
      expect(sheet.toString()).to.be(
        'a {\n' +
        '  float: left;\n' +
        '}\n' +
        'ab, ac {\n' +
        '  float: left;\n' +
        '}'
      )
    })
  })

  describe('.addRules()', () => {
    const sheet = jss.createStyleSheet({
      a: {
        height: '1px'
      }
    }, {named: false})

    sheet.addRules({
      b: {
        height: '2px',
        '& c': {
          height: '3px'
        }
      }
    })

    it('should generate correct CSS', () => {
      expect(sheet.toString()).to.be(
        'a {\n' +
        '  height: 1px;\n' +
        '}\n' +
        'b {\n' +
        '  height: 2px;\n' +
        '}\n' +
        'b c {\n' +
        '  height: 3px;\n' +
        '}'
      )
    })
  })

  describe('nesting in a namespaced rule', () => {
    const sheet = jss.createStyleSheet({
      a: {
        float: 'left',
        '& b': {float: 'left'}
      }
    })

    it('should add rules', () => {
      expect(sheet.getRule('a')).to.not.be(undefined)
      expect(sheet.getRule('.a-3182562902 b')).to.not.be(undefined)
    })

    it('should generate correct CSS', () => {
      expect(sheet.toString()).to.be(
        '.a-3182562902 {\n' +
        '  float: left;\n' +
        '}\n' +
        '.a-3182562902 b {\n' +
        '  float: left;\n' +
        '}'
      )
    })
  })

  describe('nesting in a conditional namespaced rule', () => {
    const sheet = jss.createStyleSheet({
      a: {
        color: 'green'
      },
      '@media': {
        a: {
          '&:hover': {color: 'red'}
        }
      }
    })

    it('should add rules', () => {
      expect(sheet.getRule('a')).to.not.be(undefined)
      expect(sheet.getRule('@media')).to.not.be(undefined)
    })

    it('should generate correct CSS', () => {
      expect(sheet.toString()).to.be(
        '.a-460900105 {\n' +
        '  color: green;\n' +
        '}\n' +
        '@media {\n' +
        '  .a-460900105:hover {\n' +
        '    color: red;\n' +
        '  }\n' +
        '}'
      )
    })
  })

  describe('warnings', () => {
    let jss, warning

    beforeEach(() => {
      const warn = message => warning = message
      jss = create().use(nested({warn}))
    })

    afterEach(() => {
      warning = null
    })

    it('should warn when referenced rule is not found', () => {
      jss.createStyleSheet({
        a: {
          '& $b': {float: 'left'}
        }
      })

      expect(warning).to.be('[JSS] Could not find the referenced rule "b".')
    })

    it('should warn when nesting is too deep', () => {
      jss.createStyleSheet({
        a: {
          '& .a': {
            float: 'left',
            '& .b': {float: 'left'}
          }
        }
      })

      expect(warning).to.be('[JSS] Nesting is too deep "& .b".')
    })

    it('should generate correct CSS', () => {
      const sheet = jss.createStyleSheet({
        a: {
          float: 'left',
          '& $b': {float: 'left'}
        },
        b: {
          color: 'red'
        }
      })

      expect(sheet.toString()).to.be(
        '.a-2101561448 {\n' +
        '  float: left;\n' +
        '}\n' +
        '.a-2101561448 .b-3645560457 {\n' +
        '  float: left;\n' +
        '}\n' +
        '.b-3645560457 {\n' +
        '  color: red;\n' +
        '}'
      )
    })
  })
})
