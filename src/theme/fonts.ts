import { useFonts } from 'expo-font';

/**
 * Carga las familias del diseño antes de pintar.
 * Orbitron 700 y 800, Rajdhani y Share Tech Mono, como build.py.
 * El nombre que luego usa el tema es la clave de este objeto, no el archivo.
 */
export function useToruFonts(): boolean {
  const [loaded] = useFonts({
    Orbitron_700Bold: require('@expo-google-fonts/orbitron/700Bold/Orbitron_700Bold.ttf'),
    Orbitron_800ExtraBold: require('@expo-google-fonts/orbitron/800ExtraBold/Orbitron_800ExtraBold.ttf'),
    Rajdhani_500Medium: require('@expo-google-fonts/rajdhani/500Medium/Rajdhani_500Medium.ttf'),
    Rajdhani_600SemiBold: require('@expo-google-fonts/rajdhani/600SemiBold/Rajdhani_600SemiBold.ttf'),
    Rajdhani_700Bold: require('@expo-google-fonts/rajdhani/700Bold/Rajdhani_700Bold.ttf'),
    ShareTechMono_400Regular: require('@expo-google-fonts/share-tech-mono/400Regular/ShareTechMono_400Regular.ttf'),
  });

  return loaded;
}
