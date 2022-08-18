import { DefaultTheme } from "@react-navigation/native";
import Colors from "./Colors";

export const METheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.blue,
    background: '#fff',
    text: '#333',
    notification: '#fff',
  }
}