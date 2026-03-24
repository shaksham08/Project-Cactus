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
          'radial-gradient(circle at 15% 20%, rgba(120, 255, 186, 0.12), transparent 45%), radial-gradient(circle at 85% 0%, rgba(41, 92, 61, 0.35), transparent 30%), linear-gradient(145deg, #060907, #101a14 48%, #111f17)',
        backgroundAttachment: 'fixed',
      },
      '::selection': {
        background: 'rgba(116, 255, 186, 0.45)',
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
          bg: 'rgba(8, 20, 12, 0.76)',
          border: '1px solid rgba(133, 255, 191, 0.18)',
          boxShadow: '0 20px 80px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(8px)',
        },
      },
    },
  },
})

export default theme
