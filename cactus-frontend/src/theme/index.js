import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      'html, body, #root': {
        minHeight: '100%',
        bg: '#070a08',
        color: 'gray.100',
      },
      body: {
        backgroundImage:
          'radial-gradient(circle at 10% 15%, rgba(111, 255, 180, 0.2), transparent 42%), radial-gradient(circle at 86% 5%, rgba(53, 122, 79, 0.4), transparent 34%), linear-gradient(152deg, #050806 0%, #101a14 46%, #142319 100%)',
        backgroundAttachment: 'fixed',
      },
      '::selection': {
        background: 'rgba(130, 255, 194, 0.55)',
        color: '#07130b',
      },
    },
  },
  colors: {
    cactus: {
      50: '#efffef',
      100: '#d2f6d7',
      200: '#a5e9b1',
      300: '#7adb8c',
      400: '#50cd68',
      500: '#37b44f',
      600: '#2b8d3e',
      700: '#21682f',
      800: '#184421',
      900: '#0b1f11',
    },
  },
  fonts: {
    heading: 'Outfit, Segoe UI, sans-serif',
    body: 'Space Grotesk, Segoe UI, sans-serif',
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'cactus',
      },
      variants: {
        solid: {
          bgGradient: 'linear(to-r, cactus.400, cactus.600)',
          color: 'black',
          _hover: {
            bgGradient: 'linear(to-r, cactus.300, cactus.500)',
          },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'rgba(7, 16, 11, 0.78)',
          border: '1px solid rgba(133, 255, 191, 0.2)',
          boxShadow: '0 20px 80px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(8px)',
        },
      },
    },
    Tabs: {
      variants: {
        enclosed: {
          tab: {
            color: 'gray.300',
            borderColor: 'whiteAlpha.300',
            _selected: {
              color: 'cactus.200',
              bg: 'blackAlpha.500',
              borderColor: 'cactus.500',
            },
          },
          tablist: {
            borderColor: 'whiteAlpha.300',
          },
        },
      },
    },
  },
})

export default theme
