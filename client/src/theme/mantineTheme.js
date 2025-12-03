/**
 * Mantine Theme - shadcn/ui inspired
 * Clean, minimal, professional
 */

import { createTheme, rem } from '@mantine/core';

export const mantineTheme = createTheme({
  // Primary color
  primaryColor: 'violet',
  primaryShade: { light: 6, dark: 5 },
  
  // Auto contrast
  autoContrast: true,
  
  // Typography - Inter only, like shadcn
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontFamilyMonospace: '"JetBrains Mono", ui-monospace, monospace',
  
  headings: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontWeight: '600',
    sizes: {
      h1: { fontSize: rem(36), lineHeight: '1.2' },
      h2: { fontSize: rem(30), lineHeight: '1.25' },
      h3: { fontSize: rem(24), lineHeight: '1.3' },
      h4: { fontSize: rem(20), lineHeight: '1.35' },
      h5: { fontSize: rem(18), lineHeight: '1.4' },
      h6: { fontSize: rem(16), lineHeight: '1.5' },
    },
  },
  
  fontSizes: {
    xs: rem(12),
    sm: rem(14),
    md: rem(16),
    lg: rem(18),
    xl: rem(20),
  },

  // Spacing
  spacing: {
    xs: rem(8),
    sm: rem(12),
    md: rem(16),
    lg: rem(24),
    xl: rem(32),
  },

  // Border radius - consistent with shadcn
  radius: {
    xs: rem(4),
    sm: rem(6),
    md: rem(8),
    lg: rem(12),
    xl: rem(16),
  },
  defaultRadius: 'md',

  // Shadows
  shadows: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },

  // Component styles - minimal and clean
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        root: {
          fontWeight: 500,
          transition: 'all 0.15s ease',
        },
      },
    },

    Card: {
      defaultProps: {
        radius: 'md',
        padding: 'lg',
        withBorder: true,
      },
      styles: {
        root: {
          transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
        },
      },
    },

    Paper: {
      defaultProps: {
        radius: 'md',
      },
    },

    TextInput: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        input: {
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          '&:focus': {
            borderColor: 'var(--mantine-color-violet-5)',
            boxShadow: '0 0 0 2px rgba(139, 92, 246, 0.15)',
          },
        },
        label: {
          fontWeight: 500,
          marginBottom: rem(6),
        },
      },
    },

    PasswordInput: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        input: {
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        },
        label: {
          fontWeight: 500,
          marginBottom: rem(6),
        },
      },
    },

    Select: {
      defaultProps: {
        radius: 'md',
      },
    },

    Textarea: {
      defaultProps: {
        radius: 'md',
      },
    },

    NumberInput: {
      defaultProps: {
        radius: 'md',
      },
    },

    Modal: {
      defaultProps: {
        radius: 'lg',
        centered: true,
        overlayProps: {
          backgroundOpacity: 0.5,
          blur: 3,
        },
      },
      styles: {
        header: {
          borderBottom: '1px solid var(--mantine-color-default-border)',
          paddingBottom: rem(12),
          marginBottom: rem(16),
        },
        title: {
          fontWeight: 600,
        },
      },
    },

    Badge: {
      defaultProps: {
        radius: 'sm',
        variant: 'light',
      },
      styles: {
        root: {
          fontWeight: 500,
          textTransform: 'none',
        },
      },
    },

    Table: {
      styles: {
        table: {
          '& thead th': {
            fontWeight: 600,
            fontSize: rem(13),
            color: 'var(--mantine-color-dimmed)',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
          },
        },
      },
    },

    Tabs: {
      styles: {
        tab: {
          fontWeight: 500,
          transition: 'all 0.15s ease',
        },
      },
    },

    NavLink: {
      styles: {
        root: {
          borderRadius: rem(8),
          fontWeight: 500,
          transition: 'all 0.15s ease',
          marginBottom: rem(2),
        },
      },
    },

    Menu: {
      defaultProps: {
        radius: 'md',
        shadow: 'md',
      },
      styles: {
        dropdown: {
          padding: rem(6),
        },
        item: {
          borderRadius: rem(6),
          fontWeight: 500,
          padding: `${rem(8)} ${rem(12)}`,
        },
      },
    },

    Notification: {
      defaultProps: {
        radius: 'md',
      },
    },

    Tooltip: {
      defaultProps: {
        radius: 'sm',
        withArrow: true,
      },
      styles: {
        tooltip: {
          fontWeight: 500,
        },
      },
    },

    ActionIcon: {
      defaultProps: {
        radius: 'md',
        variant: 'subtle',
      },
    },

    Avatar: {
      defaultProps: {
        radius: 'xl',
      },
    },

    Progress: {
      defaultProps: {
        radius: 'xl',
      },
    },

    Switch: {
      defaultProps: {
        color: 'violet',
      },
    },

    Loader: {
      defaultProps: {
        color: 'violet',
      },
    },

    Alert: {
      defaultProps: {
        radius: 'md',
        variant: 'light',
      },
    },

    Anchor: {
      styles: {
        root: {
          fontWeight: 500,
        },
      },
    },

    ThemeIcon: {
      defaultProps: {
        radius: 'md',
        variant: 'light',
      },
    },

    Checkbox: {
      defaultProps: {
        radius: 'sm',
        color: 'violet',
      },
    },

    Radio: {
      defaultProps: {
        color: 'violet',
      },
    },

    Pagination: {
      defaultProps: {
        radius: 'md',
        color: 'violet',
      },
    },
  },

  // Cursor
  cursorType: 'pointer',
  focusRing: 'auto',
  respectReducedMotion: true,
});

export default mantineTheme;
