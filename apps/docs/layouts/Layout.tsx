import { MDXProvider } from '@mdx-js/react'

import './layout.css'

interface LayoutProps {
  children: React.ReactNode
}

const components = {}

export default function Layout({ children, ...props }: LayoutProps) {
  return (
    <div className="w-100 flex items-center justify-center b">
      <h1>Bla bla bla</h1>
      <MDXProvider components={components}>{children}</MDXProvider>
    </div>
  )
}
