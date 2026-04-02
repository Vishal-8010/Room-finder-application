# Mobile Navbar - Code Snippets & Enhancements

## Quick Code Snippets

### 1. Custom Hook for Responsive Detection

```jsx
// useResponsive.js
import { useState, useEffect } from 'react';

export function useResponsive() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isMobile, isTablet, isDesktop };
}

// Usage in Header.jsx:
// const { isMobile } = useResponsive();
```

### 2. Add Escape Key to Close Menu

```jsx
// Add to useEffect in Header.jsx
useEffect(() => {
  const handleEscapeKey = (event) => {
    if (event.key === 'Escape') {
      setIsMenuOpen(false);
      setIsProfileOpen(false);
    }
  };

  if (isMenuOpen || isProfileOpen) {
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }
}, [isMenuOpen, isProfileOpen]);
```

### 3. Animate Menu with Framer Motion

```jsx
// Install: npm install framer-motion

import { motion } from 'framer-motion';

// Replace {isMenuOpen && (...)} with:
<motion.div
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -10 }}
  transition={{ duration: 0.2 }}
  className="md:hidden border-t border-gray-200"
>
  {/* Menu content */}
</motion.div>
```

### 4. Add Notification Badge

```jsx
// Add to profile button in desktop nav:
<div className="relative">
  <button className="flex items-center gap-2 border border-gray-200 rounded-full px-3 py-1.5">
    <FaUser className="text-gray-600 text-sm" />
    <span className="text-xs lg:text-sm">{user.name?.split(' ')[0]}</span>
  </button>
  {/* Notification badge */}
  {unreadCount > 0 && (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
      {unreadCount}
    </span>
  )}
</div>
```

### 5. Search Autocomplete

```jsx
// searchAPI.js
export const getLocationSuggestions = async (query) => {
  try {
    const response = await fetch(`/api/locations/search?q=${query}`);
    return await response.json();
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};

// In Header.jsx:
const [suggestions, setSuggestions] = useState([]);
const [showSuggestions, setShowSuggestions] = useState(false);

const handleSearchChange = async (value) => {
  setSearchQuery(value);
  if (value.length > 2) {
    const results = await getLocationSuggestions(value);
    setSuggestions(results);
    setShowSuggestions(true);
  } else {
    setSuggestions([]);
    setShowSuggestions(false);
  }
};

// In search form:
<input
  type="text"
  value={searchQuery}
  onChange={(e) => handleSearchChange(e.target.value)}
  className="w-full bg-transparent outline-none text-sm"
/>

{showSuggestions && (
  <ul className="absolute top-full left-0 right-0 bg-white border border-gray-200 mt-1 rounded-lg shadow-md z-10">
    {suggestions.map((location) => (
      <li
        key={location.id}
        onClick={() => {
          setSearchQuery(location.name);
          setShowSuggestions(false);
          // Handle navigation
        }}
        className="px-4 py-2 hover:bg-light cursor-pointer text-sm"
      >
        {location.name}
      </li>
    ))}
  </ul>
)}
```

### 6. Swipe to Close Menu (Mobile)

```jsx
// Install: npm install react-swipeable

import { useSwipeable } from 'react-swipeable';

const handlers = useSwipeable({
  onSwipedLeft: () => setIsMenuOpen(false),
  onSwipedRight: () => {}, // Don't open on right swipe
  trackMouse: false,
});

// Wrap menu drawer with:
<div {...handlers} className="md:hidden border-t border-gray-200">
  {/* Menu content */}
</div>
```

### 7. Dark Mode Toggle

```jsx
// darkModeContext.js
import { createContext, useState, useEffect } from 'react';

export const DarkModeContext = createContext();

export function DarkModeProvider({ children }) {
  const [isDark, setIsDark] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <DarkModeContext.Provider value={{ isDark, setIsDark }}>
      {children}
    </DarkModeContext.Provider>
  );
}

// In Header.jsx mobile menu:
import { useContext } from 'react';
import { DarkModeContext } from '../context/DarkModeContext';

const { isDark, setIsDark } = useContext(DarkModeContext);

// Add to menu:
<button
  onClick={() => setIsDark(!isDark)}
  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-left hover:bg-light"
>
  {isDark ? '☀️' : '🌙'} {isDark ? 'Light' : 'Dark'} Mode
</button>
```

### 8. Mobile-Optimized Profile Avatar

```jsx
// Avatar component for mobile
<div className="flex items-center gap-2 rounded-full px-3 py-1.5 border border-gray-200">
  {user.avatar ? (
    <img 
      src={user.avatar} 
      alt={user.name}
      className="w-6 h-6 rounded-full object-cover"
    />
  ) : (
    <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
      {user.name?.charAt(0).toUpperCase()}
    </div>
  )}
  <span className="text-xs lg:text-sm truncate max-w-[80px]">
    {user.name?.split(' ')[0]}
  </span>
</div>
```

### 9. Analytics Tracking

```jsx
// Track menu interactions
const trackMenuOpen = () => {
  // Google Analytics or custom analytics
  if (window.gtag) {
    gtag('event', 'menu_open', {
      event_category: 'navigation',
      event_label: 'mobile_menu',
    });
  }
};

const trackSearch = (query) => {
  if (window.gtag) {
    gtag('event', 'search', {
      event_category: 'navigation',
      search_term: query,
    });
  }
};

// In Header.jsx:
const handleMenuToggle = () => {
  setIsMenuOpen(!isMenuOpen);
  if (!isMenuOpen) trackMenuOpen();
};

const handleSearchSubmit = (e) => {
  e.preventDefault();
  if (searchQuery.trim()) {
    trackSearch(searchQuery);
    navigate(`/rooms?location=${encodeURIComponent(searchQuery)}`);
    setSearchQuery('');
  }
};
```

### 10. Saved Recent Searches

```jsx
// useRecentSearches.js
import { useState, useEffect } from 'react';

export function useRecentSearches(maxItems = 5) {
  const [searches, setSearches] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setSearches(JSON.parse(saved));
    }
  }, []);

  const addSearch = (query) => {
    const updated = [query, ...searches.filter(s => s !== query)].slice(0, maxItems);
    setSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const clearSearches = () => {
    setSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return { searches, addSearch, clearSearches };
}

// In Header.jsx:
const { searches: recentSearches, addSearch } = useRecentSearches();

const handleSearchSubmit = (e) => {
  e.preventDefault();
  if (searchQuery.trim()) {
    addSearch(searchQuery);
    navigate(`/rooms?location=${encodeURIComponent(searchQuery)}`);
    setSearchQuery('');
  }
};

// Show recent searches in menu:
{recentSearches.length > 0 && (
  <>
    <hr className="my-2" />
    <div className="px-3 py-2 text-xs font-semibold text-gray-500">Recent Searches</div>
    {recentSearches.map((search, index) => (
      <button
        key={index}
        onClick={() => {
          setSearchQuery(search);
          navigate(`/rooms?location=${encodeURIComponent(search)}`);
          setIsMenuOpen(false);
        }}
        className="block w-full text-left px-3 py-2 text-sm text-dark hover:bg-light"
      >
        🕐 {search}
      </button>
    ))}
  </>
)}
```

## Styling Enhancements

### 1. Smooth Transitions

```css
/* In mobile-navbar.css */
.menu-item {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-item:active {
  transform: scale(0.98);
}
```

### 2. Mobile Menu Shadow

```css
.mobile-menu {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  -webkit-box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

### 3. Safe Area Padding (iPhone Notch)

```css
@supports (padding: max(0px)) {
  header {
    padding-left: max(12px, env(safe-area-inset-left));
    padding-right: max(12px, env(safe-area-inset-right));
  }
}
```

## Performance Tips

### 1. Lazy Load Icons
```jsx
import { lazy, Suspense } from 'react';

const FaSearch = lazy(() => import('react-icons/fa').then(m => ({ default: m.FaSearch })));

// Usage:
<Suspense fallback={<div className="text-gray-400">⏳</div>}>
  <FaSearch />
</Suspense>
```

### 2. Memoize Header Component
```jsx
import { memo } from 'react';

export default memo(function Header() {
  // Component code
});
```

### 3. Debounce Resize Handler
```jsx
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

useEffect(() => {
  const handleResize = debounce(() => {
    setIsMobile(window.innerWidth < 768);
  }, 250);

  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

## Testing Code

### Unit Test for Menu Toggle
```jsx
// Header.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Header from './Header';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';

describe('Header Mobile Menu', () => {
  it('should toggle menu when hamburger button is clicked', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Header />
        </AuthProvider>
      </BrowserRouter>
    );

    const menuButton = screen.getByRole('button', { name: /open menu/i });
    fireEvent.click(menuButton);

    expect(screen.getByText(/for hosts/i)).toBeInTheDocument();
  });

  it('should close menu when a link is clicked', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Header />
        </AuthProvider>
      </BrowserRouter>
    );

    const menuButton = screen.getByRole('button', { name: /open menu/i });
    fireEvent.click(menuButton);
    
    const hostLink = screen.getByText(/for hosts/i);
    fireEvent.click(hostLink);

    expect(screen.queryByText(/for hosts/i)).not.toBeInTheDocument();
  });
});
```

## Deployment Checklist

- [ ] Mobile styles imported in index.css or HTML
- [ ] Tailwind CSS configured for responsive breakpoints
- [ ] All icons imported and available
- [ ] Event listeners cleaned up properly
- [ ] No console errors or warnings
- [ ] Tested on real mobile devices
- [ ] Touch targets verified (≥44px)
- [ ] Search functionality working
- [ ] Menu animations smooth
- [ ] Accessibility audit passed

---

**Last Updated**: February 5, 2026  
**Status**: Ready to implement  
**Difficulty**: Intermediate to Advanced
