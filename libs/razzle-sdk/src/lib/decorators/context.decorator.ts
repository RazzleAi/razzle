export default function Context() {
  return function (target: any, key: string) {
    const ctx = {}

    const getter = () => {
      return ctx
    }

    return Object.defineProperty(target, key, {
      get: getter,
      enumerable: true,
      configurable: true,
    })
  }
}
