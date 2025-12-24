/**
 * Hook to access theme context
 * 
 * JUNIOR DEV NOTE: Why is this in a separate file?
 * React Fast Refresh requires that files exporting hooks don't also export components.
 * This keeps the hook separate from the ThemeProvider component.
 */

import { useContext } from 'react';
import { ThemeContext } from './ThemeContextCore';

export const useTheme = () => useContext(ThemeContext);
