// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.css'

import { MDXProvider } from '@mdx-js/react'
import QuickStart from './pages/quickstart.mdx'
import Layout from './layout'

const components = {
  h1: (props: any) => (
    <h1 className="text-4xl font-bold text-gray-900" {...props} />
  ),
}

export function Content() {
  return (
    <Layout>
      <MDXProvider components={components}>
        <QuickStart />
      </MDXProvider>
    </Layout>
  )
}

export default Content
