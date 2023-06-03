import { Prompt } from '../prompt'

describe('Prompt', () => {
  it('does the right replacements', () => {
    const prompt = new Prompt('Hello {name}!', new Map([['name', 'world']]))
    expect(prompt.toString()).toEqual('Hello world!')
  })

  it('does the right replacements with multiple vars', () => {
    const prompt = new Prompt(
      'Hello {name} {name}!',
      new Map([['name', 'world']])
    )
    expect(prompt.toString()).toEqual('Hello world world!')
  })

  it('does the right replacements with different vars and multiple instances', () => {
    const text = `Hello {name} {surname} my name is {myname}, I am {age} years old and I live in {city}.`
    const vars = new Map([
      ['name', 'John'],
      ['surname', 'Doe'],
      ['myname', 'Jane'],
      ['age', '30'],
      ['city', 'London'],
    ])
    const prompt = new Prompt(text, vars)
    expect(prompt.toString()).toEqual(
      'Hello John Doe my name is Jane, I am 30 years old and I live in London.'
    )
  })
})
