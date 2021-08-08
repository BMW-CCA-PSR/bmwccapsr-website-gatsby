/** @jsxImportSource theme-ui */
import { ReactNode } from "react"
import Header from "./header"

interface LayoutProps {
    children: ReactNode
  }

export default function Layout({ children }: LayoutProps) {
  return (
    <div
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
      }}>
      <div
        sx={{
          p: 3
        }}>
        <Header siteTitle="BMW CCA PSR"/>
      </div>
      <div
        sx={{
          flex: '1 1 auto',
          p: 3
        }}>
        {children}
      </div>
    </div>
  )
}
