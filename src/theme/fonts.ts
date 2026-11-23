import { useFonts } from 'expo-font';

/**
 * Carga las tres familias del diseño antes de pintar.
 * El nombre que luego usa el tema es la clave de este objeto, no el archivo.
 */
export function useToruFonts(): boolean {
  const [loaded] = useFonts({
    Orbitron_600SemiBold: require('@expo-google-fonts/orbitron/600SemiBold/Orbitron_600SemiBold.ttf'),
    Orbitron_700Bold: require('@expo-google-fonts/orbitron/700Bold/Orbitron_700Bold.ttf'),
    Rajdhani_500Medium: require('@expo-google-fonts/rajdhani/500Medium/Rajdhani_500Medium.ttf'),
    Rajdhani_600SemiBold: require('@expo-google-fonts/rajdhani/600SemiBold/Rajdhani_600SemiBold.ttf'),
    Rajdhani_700Bold: require('@expo-google-fonts/rajdhani/700Bold/Rajdhani_700Bold.ttf'),
    ShareTechMono_400Regular: require('@expo-google-fonts/share-tech-mono/400Regular/ShareTechMono_400Regular.ttf'),
  });

  return loaded;
}
