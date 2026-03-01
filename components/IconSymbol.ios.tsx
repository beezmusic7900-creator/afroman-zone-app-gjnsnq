
import { SymbolView, SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { StyleProp, ViewStyle, OpaqueColorValue } from 'react-native';

export function IconSymbol({
  ios_icon_name,
  android_material_icon_name,
  size = 24,
  color,
  style,
  weight = 'regular',
  ...rest
}: {
  ios_icon_name: string;
  android_material_icon_name?: string;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
} & Omit<SymbolViewProps, 'name' | 'tintColor' | 'weight' | 'style'>) {
  return (
    <SymbolView
      weight={weight}
      tintColor={color}
      resizeMode="scaleAspectFit"
      name={ios_icon_name}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
      {...rest}
    />
  );
}
