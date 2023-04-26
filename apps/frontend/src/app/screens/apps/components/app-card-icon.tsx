import { AppDto } from "@razzle/dto"

export function AppCardIcon({ app }: { app: AppDto }) {
    const colors = [
      'f1ecfd',
      'e2d3f8',
      'c5a7f1',
      'a97aeb',
      '8c4ee4',
      '6f22dd',
      '591bb1',
      '431485',
    ]
    const key = app.appId
    const hash = djb2Hash(key)
    const colorIndex = hash % colors.length
    const randColor = colors[colorIndex]
    return (
      <div className="w-auto h-full">
        <img
          className="rounded-l"
          src={`https://api.dicebear.com/6.x/bottts-neutral/svg?seed=${key}&size=80&backgroundColor=${randColor}`}
          alt="avatar"
        />
      </div>
    )
  }
  
  function djb2Hash(str) {
    let hash = 5381
  
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash * 33) ^ char
    }
  
    return hash >>> 0
  }