import { Razzle } from '@razzledotai/sdk'
import * as process from 'process'
import { ExpenseManagerModule } from './app/expense-manager'
import { ExpenseManagerService } from './app/expense-manager.service'
import * as http from 'http'

function startApp() {
  Razzle.app({
    appId: process.env.RAZZLE_APP_ID || '',
    apiKey: process.env.RAZZLE_API_KEY || '',
    modules: [
      { module: ExpenseManagerModule, deps: [new ExpenseManagerService()] },
    ],
  })

  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.write('Hello World!')
    res.end()
  })

  server.listen(7000, 'localhost', () => {
    console.log('Server started on port 7000')
  })
}

startApp()
