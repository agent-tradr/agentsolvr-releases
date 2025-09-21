import React, { ReactElement } from 'react'
import { render, RenderOptions, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/hooks/useAuth'
import { vi } from 'vitest'

// Test wrapper component
interface AllTheProvidersProps {
  children: React.ReactNode
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  // Create a new QueryClient for each test to avoid test pollution
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0, // Updated from cacheTime
      },
      mutations: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter 
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Test data helpers
export const mockUser = {
  id: 'user-123',
  email: 'demo@agentsolvr.com',
  fullName: 'Demo User',
  avatar: 'https://example.com/avatar.png',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  isEmailVerified: true,
}

export const mockAuthenticatedUser = () => {
  localStorage.setItem('accessToken', 'mock-token')
  localStorage.setItem('refreshToken', 'mock-refresh-token')
}

export const mockUnauthenticatedUser = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

// Utility to wait for async operations
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0))

// Helper to assert element styles (for design system tests)
export const getComputedStyle = (element: Element) => {
  return window.getComputedStyle(element)
}

// Helper to simulate user interactions
export const simulateNetworkDelay = (ms: number = 100) => 
  new Promise(resolve => setTimeout(resolve, ms))

// Mock localStorage with type safety
export const createMockLocalStorage = () => {
  const store: Record<string, string> = {}
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      Object.keys(store).forEach(key => delete store[key])
    },
  }
}

// Helper for testing responsive design
export const setViewportSize = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  })
  window.dispatchEvent(new Event('resize'))
}

// CSS custom properties checker for design system tests
export const getCSSCustomProperty = (element: Element, property: string) => {
  return getComputedStyle(element).getPropertyValue(property).trim()
}

// Form testing helpers
export const fillForm = async (fields: Record<string, string>) => {
  const { userEvent } = await import('@testing-library/user-event')
  const user = userEvent.setup()
  
  for (const [fieldName, value] of Object.entries(fields)) {
    const field = screen.getByLabelText(new RegExp(fieldName, 'i'))
    await user.clear(field)
    await user.type(field, value)
  }
  
  return user
}

// Accessibility testing helpers
export const checkAriaLabel = (element: Element, expectedLabel: string) => {
  const ariaLabel = element.getAttribute('aria-label')
  expect(ariaLabel).toBe(expectedLabel)
}

export const checkRole = (element: Element, expectedRole: string) => {
  const role = element.getAttribute('role')
  expect(role).toBe(expectedRole)
}

// Theme testing helper
export const checkCatppuccinColors = () => {
  const root = document.documentElement
  const computedStyle = getComputedStyle(root)
  
  return {
    base: computedStyle.getPropertyValue('--ctp-base').trim(),
    mauve: computedStyle.getPropertyValue('--ctp-mauve').trim(),
    blue: computedStyle.getPropertyValue('--ctp-blue').trim(),
    green: computedStyle.getPropertyValue('--ctp-green').trim(),
    red: computedStyle.getPropertyValue('--ctp-red').trim(),
    text: computedStyle.getPropertyValue('--ctp-text').trim(),
  }
}